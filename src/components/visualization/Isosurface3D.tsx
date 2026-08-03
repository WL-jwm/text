/**
 * G-03 3D等值面可视化
 *
 * 基于 IDW 插值结果 + Three.js 渲染 3D 等值面：
 *   - 将 InterpolationGrid 转换为 3D PlaneGeometry，Z 轴映射数值
 *   - 顶点着色（vertex color）按配色方案渐变
 *   - 等值线提取（Marching Squares 简化版）叠加为线框
 *   - 监测站点标注（Sprite）
 *   - 坐标轴 + 色标
 *   - OrbitControls 交互
 */

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../../hooks/useThreeScene';
import { useI18n } from '../../hooks/useI18n';
import type { InterpolationGrid, InterpolationPoint, ColorStop } from '../../utils/idwInterpolation';
import { COLOR_SCHEMES } from '../../utils/idwInterpolation';

// ============================================================
// 工具函数
// ============================================================

/** 颜色插值 */
function lerpColor(stops: ColorStop[], value: number): THREE.Color {
  const min = stops[0]!.value;
  const max = stops[stops.length - 1]!.value;
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));

  for (let i = 0; i < stops.length - 1; i++) {
    const lo = stops[i]!;
    const hi = stops[i + 1]!;
    const loT = (lo.value - min) / (max - min || 1);
    const hiT = (hi.value - min) / (max - min || 1);
    if (t >= loT && t <= hiT) {
      const localT = (t - loT) / (hiT - loT || 1);
      const r = lo.color[0] + (hi.color[0] - lo.color[0]) * localT;
      const g = lo.color[1] + (hi.color[1] - lo.color[1]) * localT;
      const b = lo.color[2] + (hi.color[2] - lo.color[2]) * localT;
      return new THREE.Color(r / 255, g / 255, b / 255);
    }
  }
  return new THREE.Color(stops[0]!.color[0] / 255, stops[0]!.color[1] / 255, stops[0]!.color[2] / 255);
}

/**
 * Marching Squares 简化版：提取等值线段
 */
function extractContours(
  grid: InterpolationGrid,
  levels: number[],
): Array<{ points: THREE.Vector3[]; level: number }> {
  const contours: Array<{ points: THREE.Vector3[]; level: number }> = [];
  const { values, cols, rows, nodata } = grid;

  for (const level of levels) {
    const segments: THREE.Vector3[] = [];

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const v00 = values[r]?.[c] ?? nodata;
        const v10 = values[r]?.[c + 1] ?? nodata;
        const v01 = values[r + 1]?.[c] ?? nodata;
        const v11 = values[r + 1]?.[c + 1] ?? nodata;

        if (v00 === nodata || v10 === nodata || v01 === nodata || v11 === nodata) continue;

        // 4 角点坐标（X-Y 平面）
        const x0 = c, x1 = c + 1;
        const y0 = r, y1 = r + 1;

        // 计算每条边上等值点
        const edgePoints: THREE.Vector3[] = [];

        // 上边 (v00 → v10)
        if ((v00 - level) * (v10 - level) < 0) {
          const t = (level - v00) / (v10 - v00);
          edgePoints.push(new THREE.Vector3(x0 + t * (x1 - x0), y0, level));
        }
        // 右边 (v10 → v11)
        if ((v10 - level) * (v11 - level) < 0) {
          const t = (level - v10) / (v11 - v10);
          edgePoints.push(new THREE.Vector3(x1, y0 + t * (y1 - y0), level));
        }
        // 下边 (v01 → v11)
        if ((v01 - level) * (v11 - level) < 0) {
          const t = (level - v01) / (v11 - v01);
          edgePoints.push(new THREE.Vector3(x0 + t * (x1 - x0), y1, level));
        }
        // 左边 (v00 → v01)
        if ((v00 - level) * (v01 - level) < 0) {
          const t = (level - v00) / (v01 - v00);
          edgePoints.push(new THREE.Vector3(x0, y0 + t * (y1 - y0), level));
        }

        // 2 个点 → 线段
        if (edgePoints.length >= 2) {
          segments.push(edgePoints[0]!);
          segments.push(edgePoints[1]!);
        }
      }
    }

    if (segments.length > 0) {
      contours.push({ points: segments, level });
    }
  }

  return contours;
}

/** 创建文本 Sprite */
function createTextSprite(text: string, color = '#ffffff'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(8, 2, 1);
  return sprite;
}

// ============================================================
// 组件
// ============================================================

export interface Isosurface3DProps {
  grid: InterpolationGrid;
  points: InterpolationPoint[];
  /** 数据类型（决定配色） */
  dataType?: 'waterLevel' | 'waterQuality' | 'geothermal';
  /** Z 轴缩放因子 */
  zScale?: number;
  /** 等值线级别（不传则自动生成 5 条） */
  contourLevels?: number[];
  /** 是否显示等值线 */
  showContours?: boolean;
  /** 是否显示站点标注 */
  showStations?: boolean;
  /** 是否显示色标 */
  showColorBar?: boolean;
}

export function Isosurface3D({
  grid,
  points,
  dataType = 'waterLevel',
  zScale = 0.3,
  contourLevels,
  showContours = true,
  showStations = true,
  showColorBar = true,
}: Isosurface3DProps): React.ReactElement {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneCtxRef = useThreeScene(
    containerRef,
    {
      cameraPosition: [grid.cols * 0.6, grid.rows * 0.8, grid.cols * 0.8],
      cameraTarget: [grid.cols / 2, grid.rows / 2, 0],
      fov: 50,
      backgroundColor: 0x0f172a,
      ambientLightIntensity: 0.6,
      directionalLightIntensity: 0.8,
    },
  );

  // 配色方案
  const colorStops = useMemo<ColorStop[]>(
    () => COLOR_SCHEMES[dataType] as unknown as ColorStop[],
    [dataType],
  );

  // 等值线级别
  const levels = useMemo(() => {
    if (contourLevels) return contourLevels;
    const validValues = grid.values.flat().filter(v => v !== grid.nodata);
    if (validValues.length === 0) return [];
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const step = (max - min) / 6;
    return Array.from({ length: 5 }, (_, i) => min + step * (i + 1));
  }, [grid, contourLevels]);

  // 构建 3D 场景
  useEffect(() => {
    const ctx = sceneCtxRef.current;
    if (!ctx) return;

    const { scene } = ctx;
    const objects: THREE.Object3D[] = [];

    // 1. 等值面网格
    const { cols, rows, values, nodata } = grid;
    if (cols < 2 || rows < 2) return;

    const geometry = new THREE.PlaneGeometry(
      cols, rows, cols - 1, rows - 1,
    );
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const val = values[r]?.[c] ?? nodata;

      if (val === nodata) {
        positions.setY(i, 0);
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.1;
        colors[i * 3 + 2] = 0.15;
      } else {
        positions.setY(i, val * zScale);
        const color = lerpColor(colorStops, val);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      flatShading: false,
      shininess: 30,
      transparent: true,
      opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cols / 2, 0, rows / 2);
    scene.add(mesh);
    objects.push(mesh);

    // 2. 网格线框
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.15 }),
    );
    wireframe.position.copy(mesh.position);
    scene.add(wireframe);
    objects.push(wireframe);

    // 3. 等值线
    if (showContours && levels.length > 0) {
      const contours = extractContours(grid, levels);
      for (const contour of contours) {
        if (contour.points.length < 2) continue;

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(
          contour.points.map(p => new THREE.Vector3(
            p.x + cols / 2,
            p.z * zScale + 0.1, // 略微抬高避免 Z-fighting
            p.y + rows / 2,
          )),
        );

        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.5,
        });

        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);
        objects.push(lines);
      }
    }

    // 4. 监测站点标注
    if (showStations) {
      const { bounds } = grid;
      const lngRange = bounds.maxLng - bounds.minLng;
      const latRange = bounds.maxLat - bounds.minLat;

      for (const pt of points) {
        const px = ((pt.x - bounds.minLng) / lngRange) * cols;
        const py = ((bounds.maxLat - pt.y) / latRange) * rows;

        // 站点小球
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 16, 16),
          new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x444444 }),
        );
        sphere.position.set(px, (pt.value * zScale) + 1, py);
        scene.add(sphere);
        objects.push(sphere);

        // 站点标签
        const label = createTextSprite(pt.label ?? pt.x.toFixed(2));
        label.position.set(px, (pt.value * zScale) + 3, py);
        scene.add(label);
        objects.push(label);
      }
    }

    // 5. 坐标轴
    const axesGroup = new THREE.Group();
    const axisLength = Math.max(cols, rows) * 0.6;

    // X 轴（经度方向）
    const xAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(axisLength, 0, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0xef4444 }),
    );
    axesGroup.add(xAxis);

    // Z 轴（纬度方向）
    const zAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, axisLength),
      ]),
      new THREE.LineBasicMaterial({ color: 0x22c55e }),
    );
    axesGroup.add(zAxis);

    // Y 轴（数值方向）
    const yAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, axisLength * 0.5, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0x3b82f6 }),
    );
    axesGroup.add(yAxis);

    scene.add(axesGroup);
    objects.push(axesGroup);

    // 6. 色标
    if (showColorBar) {
      const barWidth = 1.5;
      const barHeight = 15;
      const barSegments = 60;
      const barGeometry = new THREE.PlaneGeometry(barWidth, barHeight, 1, barSegments);
      barGeometry.rotateX(-Math.PI / 2);

      const barColors = new Float32Array(barSegments * 3 * 2); // 每段 2 顶点
      const validMin = colorStops[0]!.value;
      const validMax = colorStops[colorStops.length - 1]!.value;

      for (let i = 0; i < barSegments; i++) {
        const t = i / barSegments;
        const val = validMin + (validMax - validMin) * (1 - t); // 从上到下递减
        const color = lerpColor(colorStops, val);
        for (let j = 0; j < 2; j++) {
          const idx = (i * 2 + j) * 3;
          barColors[idx] = color.r;
          barColors[idx + 1] = color.g;
          barColors[idx + 2] = color.b;
        }
      }

      barGeometry.setAttribute('color', new THREE.BufferAttribute(barColors, 3));
      const barMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.set(cols + 3, barHeight / 2, 0);
      scene.add(bar);
      objects.push(bar);

      // 色标标签
      const maxLabel = createTextSprite(validMax.toFixed(1), '#ffffff');
      maxLabel.position.set(cols + 3, barHeight + 1, 0);
      maxLabel.scale.set(5, 1.5, 1);
      scene.add(maxLabel);
      objects.push(maxLabel);

      const minLabel = createTextSprite(validMin.toFixed(1), '#ffffff');
      minLabel.position.set(cols + 3, -1, 0);
      minLabel.scale.set(5, 1.5, 1);
      scene.add(minLabel);
      objects.push(minLabel);
    }

    // 清理函数
    return () => {
      objects.forEach(obj => {
        scene.remove(obj);
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      });
    };
  }, [grid, points, colorStops, levels, zScale, showContours, showStations, showColorBar, sceneCtxRef]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60 rounded-t-lg border border-slate-700">
        <span className="text-xs text-slate-300">
          {t('viz.isosurface3d') || '3D 等值面'} — {grid.cols}×{grid.rows}
        </span>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full inline-block" /> X
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Z
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" /> Y(值)
          </span>
          <span>缩放: {zScale.toFixed(2)}</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-[400px] bg-slate-900 rounded-b-lg border border-slate-700 border-t-0"
      />
    </div>
  );
}
