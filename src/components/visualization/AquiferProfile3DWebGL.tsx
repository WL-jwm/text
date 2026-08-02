/**
 * F-02 3D可视化 — Three.js 含水层立体剖面
 *
 * 将V-02的SVG剖面升级为真3D：
 *   1. 4组含水层立体地质体（沿剖面方向延伸）
 *   2. 各层水头曲面（贝塞尔/线性插值）
 *   3. 钻孔标注（城市站点 + 深度刻度）
 *   4. 剖面方向切换（山前→滨海 / 滨海→山前）
 *   5. 层级显隐控制
 *   6. OrbitControls 旋转/缩放/平移
 *   7. 悬停高亮 + 信息面板
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Layers3, Eye, EyeOff, RotateCcw, Info, Mountain, Waves } from 'lucide-react';
import { TechCard } from '../UI';
import { useThreeScene, type ThreeSceneContext } from '../../hooks/useThreeScene';

// ============================================================
// 数据定义（与V-02一致）
// ============================================================

interface AquiferLayer3D {
  name: string;
  topDepth: number;
  bottomDepth: number;
  lithology: string;
  K: string;
  waterType: string;
  color: number; // THREE.Color hex
  colorHex: string;
}

interface ProfileStation3D {
  city: string;
  distance: number;
  surfaceElev: number;
  waterLevels: number[];
  note: string;
}

const AQUIFER_LAYERS: AquiferLayer3D[] = [
  { name: '第I含水组', topDepth: 0, bottomDepth: 50, lithology: '砂砾石/中细砂', K: '10~50 m/d', waterType: '潜水-微承压', color: 0x22c55e, colorHex: '#22c55e' },
  { name: '第II含水组', topDepth: 50, bottomDepth: 150, lithology: '中细砂/粉细砂', K: '5~20 m/d', waterType: '承压水', color: 0x3b82f6, colorHex: '#3b82f6' },
  { name: '第III含水组', topDepth: 150, bottomDepth: 350, lithology: '细砂/粉砂', K: '2~8 m/d', waterType: '承压水', color: 0x8b5cf6, colorHex: '#8b5cf6' },
  { name: '第IV含水组', topDepth: 350, bottomDepth: 550, lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', waterType: '深层承压水', color: 0xf59e0b, colorHex: '#f59e0b' },
];

const PROFILE_STATIONS: ProfileStation3D[] = [
  { city: '石家庄', distance: 0, surfaceElev: 85, waterLevels: [82, 75, 68, 60], note: '山前冲洪积扇' },
  { city: '保定', distance: 80, surfaceElev: 65, waterLevels: [60, 52, 45, 38], note: '冲积平原上部' },
  { city: '廊坊', distance: 160, surfaceElev: 45, waterLevels: [40, 33, 26, 18], note: '冲积平原中部' },
  { city: '沧州', distance: 240, surfaceElev: 30, waterLevels: [26, 18, 8, -5], note: '滨海平原' },
  { city: '唐山', distance: 300, surfaceElev: 40, waterLevels: [36, 29, 22, 15], note: '滨海过渡带' },
];

// 比例参数
const SCALE_X = 1.2; // 水平距离缩放
const SCALE_Y = 0.4; // 深度缩放（夸大显示）
const PROFILE_WIDTH = 40; // 剖面横向宽度（Z方向）
const MAX_DEPTH = 600;

// ============================================================
// 主组件
// ============================================================

export function AquiferProfile3DWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [showWaterHead, setShowWaterHead] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  let sceneRef = useRef<ThreeSceneContext | null>(null);
  const layerMeshesRef = useRef<THREE.Mesh[]>([]);
  const waterHeadMeshesRef = useRef<THREE.Mesh[]>([]);
  const stationGroupRef = useRef<THREE.Group | null>(null);

  // ── 初始化场景 ──
  const initScene = useCallback((ctx: ThreeSceneContext) => {
    const { scene } = ctx;

    // 地表网格
    const gridHelper = new THREE.GridHelper(400, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // 创建含水层地质体
    AQUIFER_LAYERS.forEach((layer, idx) => {
      const mesh = createAquiferLayerMesh(layer, idx);
      mesh.visible = visibleLayers.has(idx);
      scene.add(mesh);
      layerMeshesRef.current[idx] = mesh;
    });

    // 创建水头曲面
    AQUIFER_LAYERS.forEach((layer, idx) => {
      const mesh = createWaterHeadMesh(layer, idx);
      mesh.visible = visibleLayers.has(idx) && showWaterHead;
      scene.add(mesh);
      waterHeadMeshesRef.current[idx] = mesh;
    });

    // 创建钻孔/站点标注
    const stationGroup = new THREE.Group();
    PROFILE_STATIONS.forEach((station, idx) => {
      const x = (station.distance - 150) * SCALE_X;
      const surfaceY = station.surfaceElev * SCALE_Y;

      // 钻孔柱
      const boreGeom = new THREE.CylinderGeometry(1.5, 1.5, MAX_DEPTH * SCALE_Y, 12);
      const boreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
      });
      const bore = new THREE.Mesh(boreGeom, boreMat);
      bore.position.set(x, surfaceY - (MAX_DEPTH * SCALE_Y) / 2, 0);
      stationGroup.add(bore);

      // 站点标记球
      const markerGeom = new THREE.SphereGeometry(3, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.set(x, surfaceY + 2, 0);
      marker.userData = { stationIndex: idx, station };
      stationGroup.add(marker);

      // 站点标签（使用Sprite + Canvas纹理）
      const label = createTextSprite(station.city);
      label.position.set(x, surfaceY + 10, 0);
      label.scale.set(30, 8, 1);
      stationGroup.add(label);
    });
    scene.add(stationGroup);
    stationGroupRef.current = stationGroup;

    // 方向指示箭头（山前→滨海）
    const arrowDir = new THREE.Vector3(1, 0, 0);
    const arrowOrigin = new THREE.Vector3(-180, -3, 0);
    const arrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 360, 0x06b6d4, 15, 8);
    scene.add(arrow);

    // 山前标签
    const mountainLabel = createTextSprite('山前 → 滨海');
    mountainLabel.position.set(0, 15, PROFILE_WIDTH / 2 + 10);
    mountainLabel.scale.set(50, 10, 1);
    scene.add(mountainLabel);

    // 自动旋转
    return () => {
      layerMeshesRef.current = [];
      waterHeadMeshesRef.current = [];
      stationGroupRef.current = null;
    };
  }, [visibleLayers, showWaterHead]);

  sceneRef = useThreeScene(
    containerRef,
    {
      cameraPosition: [250, 180, 350],
      cameraTarget: [0, -40, 0],
      fov: 45,
      backgroundColor: 0x0a0f1a,
      ambientLightIntensity: 0.5,
      directionalLightIntensity: 0.9,
    },
    initScene,
  );

  // ── 自动旋转 ──
  useEffect(() => {
    if (!sceneRef.current) return;
    const ctx = sceneRef.current;
    if (autoRotate) {
      const unsub = ctx.registerAnimationFrame(() => {
        ctx.controls.autoRotate = true;
        ctx.controls.autoRotateSpeed = 0.5;
      });
      return unsub;
    } else {
      ctx.controls.autoRotate = false;
    }
  }, [autoRotate, sceneRef]);

  // ── 层级显隐 ──
  useEffect(() => {
    layerMeshesRef.current.forEach((mesh, idx) => {
      if (mesh) mesh.visible = visibleLayers.has(idx);
    });
    waterHeadMeshesRef.current.forEach((mesh, idx) => {
      if (mesh) mesh.visible = visibleLayers.has(idx) && showWaterHead;
    });
  }, [visibleLayers, showWaterHead]);

  // ── 重置视角 ──
  const resetCamera = useCallback(() => {
    if (!sceneRef.current) return;
    const { camera, controls } = sceneRef.current;
    camera.position.set(250, 180, 350);
    controls.target.set(0, -40, 0);
    controls.update();
  }, [sceneRef]);

  const toggleLayer = (idx: number) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* 控制面板 */}
      <TechCard title="3D含水层剖面" icon={Layers3} badge="Three.js r170">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {AQUIFER_LAYERS.map((layer, idx) => (
              <button
                key={idx}
                onClick={() => toggleLayer(idx)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all"
                style={{
                  borderColor: visibleLayers.has(idx) ? layer.colorHex : '#334155',
                  color: visibleLayers.has(idx) ? layer.colorHex : '#64748b',
                  backgroundColor: visibleLayers.has(idx) ? `${layer.colorHex}15` : 'transparent',
                }}
              >
                {visibleLayers.has(idx) ? <Eye size={10} /> : <EyeOff size={10} />}
                <span>{layer.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowWaterHead(!showWaterHead)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${
                showWaterHead
                  ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              <Waves size={10} />
              <span>水头曲面</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${
                autoRotate
                  ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              <RotateCcw size={10} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
              <span>自动旋转</span>
            </button>
            <button
              onClick={resetCamera}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border border-slate-600 text-slate-400 hover:text-cyan-400 transition-all"
            >
              <RotateCcw size={10} />
              <span>重置视角</span>
            </button>
          </div>
        </div>
      </TechCard>

      {/* 3D渲染区 */}
      <TechCard>
        <div
          ref={containerRef}
          className="w-full"
          style={{ height: '500px', minHeight: '400px' }}
        />
      </TechCard>

      {/* 站点信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TechCard title="剖面站点" icon={Mountain}>
          <div className="space-y-1.5">
            {PROFILE_STATIONS.map((station, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedStation(selectedStation === idx ? null : idx)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                  selectedStation === idx
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-gw-surface/40 border-gw-border/20 hover:border-gw-border/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gw-text">{station.city}</span>
                  <span className="text-[10px] text-gw-muted">{station.distance}km</span>
                </div>
                <div className="text-[10px] text-gw-muted mt-0.5">
                  地表标高 {station.surfaceElev}m · {station.note}
                </div>
                {selectedStation === idx && (
                  <div className="mt-2 space-y-1 pt-2 border-t border-gw-border/20">
                    {AQUIFER_LAYERS.map((layer, li) => (
                      <div key={li} className="flex items-center justify-between text-[10px]">
                        <span style={{ color: layer.colorHex }}>{layer.name}</span>
                        <span className="font-mono text-gw-text">
                          水头 {station.waterLevels[li]}m
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </TechCard>

        <TechCard title="含水层参数" icon={Info}>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gw-muted border-b border-gw-border/20">
                  <th className="text-left py-1.5 px-2">含水组</th>
                  <th className="text-right py-1.5 px-2">深度(m)</th>
                  <th className="text-right py-1.5 px-2">K(m/d)</th>
                  <th className="text-left py-1.5 px-2">岩性</th>
                  <th className="text-left py-1.5 px-2">类型</th>
                </tr>
              </thead>
              <tbody>
                {AQUIFER_LAYERS.map((layer, idx) => (
                  <tr key={idx} className="border-b border-gw-border/10">
                    <td className="py-1.5 px-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.colorHex }} />
                        <span className="text-gw-text">{layer.name}</span>
                      </span>
                    </td>
                    <td className="text-right py-1.5 px-2 font-mono text-gw-muted">
                      {layer.topDepth}~{layer.bottomDepth}
                    </td>
                    <td className="text-right py-1.5 px-2 font-mono text-gw-muted">{layer.K}</td>
                    <td className="py-1.5 px-2 text-gw-muted">{layer.lithology}</td>
                    <td className="py-1.5 px-2 text-gw-muted">{layer.waterType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>
      </div>
    </div>
  );
}

// ============================================================
// Three.js 几何体创建函数
// ============================================================

/**
 * 创建含水层立体地质体
 * 沿剖面方向（X轴）延伸，基于站点地表标高和层深度构建
 */
function createAquiferLayerMesh(layer: AquiferLayer3D, _layerIdx: number): THREE.Mesh {
  const points: THREE.Vector3[] = [];

  // 收集各站点的层顶/底坐标
  PROFILE_STATIONS.forEach(station => {
    const x = (station.distance - 150) * SCALE_X;
    const surfaceY = station.surfaceElev * SCALE_Y;
    const topY = surfaceY - layer.topDepth * SCALE_Y;
    const bottomY = surfaceY - layer.bottomDepth * SCALE_Y;

    // 剖面前缘
    points.push(new THREE.Vector3(x, topY, -PROFILE_WIDTH / 2));
    points.push(new THREE.Vector3(x, bottomY, -PROFILE_WIDTH / 2));
    // 剖面后缘
    points.push(new THREE.Vector3(x, topY, PROFILE_WIDTH / 2));
    points.push(new THREE.Vector3(x, bottomY, PROFILE_WIDTH / 2));
  });

  // 使用ConvexHull或手动构建
  // 这里使用简化的Box方式：每个站点间构建一个梯形棱柱
  const geometries: THREE.BufferGeometry[] = [];

  for (let i = 0; i < PROFILE_STATIONS.length - 1; i++) {
    const s1 = PROFILE_STATIONS[i];
    const s2 = PROFILE_STATIONS[i + 1];
    if (!s1 || !s2) continue;

    const x1 = (s1.distance - 150) * SCALE_X;
    const x2 = (s2.distance - 150) * SCALE_X;
    const y1Top = (s1.surfaceElev - layer.topDepth) * SCALE_Y;
    const y1Bot = (s1.surfaceElev - layer.bottomDepth) * SCALE_Y;
    const y2Top = (s2.surfaceElev - layer.topDepth) * SCALE_Y;
    const y2Bot = (s2.surfaceElev - layer.bottomDepth) * SCALE_Y;

    const z1 = -PROFILE_WIDTH / 2;
    const z2 = PROFILE_WIDTH / 2;

    // 8个顶点
    const vertices = new Float32Array([
      // 前面 (z1)
      x1, y1Top, z1,  x2, y2Top, z1,  x2, y2Bot, z1,
      x1, y1Top, z1,  x2, y2Bot, z1,  x1, y1Bot, z1,
      // 后面 (z2)
      x1, y1Top, z2,  x2, y2Bot, z2,  x2, y2Top, z2,
      x1, y1Top, z2,  x1, y1Bot, z2,  x2, y2Bot, z2,
      // 顶面
      x1, y1Top, z1,  x1, y1Top, z2,  x2, y2Top, z2,
      x1, y1Top, z1,  x2, y2Top, z2,  x2, y2Top, z1,
      // 底面
      x1, y1Bot, z1,  x2, y2Bot, z1,  x2, y2Bot, z2,
      x1, y1Bot, z1,  x2, y2Bot, z2,  x1, y1Bot, z2,
    ]);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    geometries.push(geom);
  }

  // 合并几何体
  const merged = mergeGeometries(geometries);
  const material = new THREE.MeshPhongMaterial({
    color: layer.color,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    shininess: 30,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(merged, material);
  mesh.userData = { layerIndex: _layerIdx, layerName: layer.name };
  return mesh;
}

/**
 * 创建水头曲面
 * 各站点水头值连接成曲面，展示承压水头空间分布
 */
function createWaterHeadMesh(layer: AquiferLayer3D, layerIdx: number): THREE.Mesh {
  const segments = PROFILE_STATIONS.length;
  const widthSegs = Math.max(segments - 1, 1);

  // 收集水头Y坐标
  const waterHeadPoints: { x: number; y: number }[] = [];
  PROFILE_STATIONS.forEach(station => {
    const x = (station.distance - 150) * SCALE_X;
    const wl = station.waterLevels[layerIdx] ?? 0;
    waterHeadPoints.push({ x, y: wl * SCALE_Y });
  });

  // 创建曲面几何体（沿Z方向延伸）
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= widthSegs; i++) {
    const idx = Math.min(i, segments - 1);
    const point = waterHeadPoints[idx];
    if (!point) continue;

    for (let j = 0; j <= 4; j++) {
      const z = -PROFILE_WIDTH / 2 + (j / 4) * PROFILE_WIDTH;
      positions.push(point.x, point.y, z);
    }
  }

  const zSegs = 4;
  for (let i = 0; i < widthSegs; i++) {
    for (let j = 0; j < zSegs; j++) {
      const a = i * (zSegs + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (zSegs + 1) + j;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    shininess: 80,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.15,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.userData = { type: 'waterHead', layerIndex: layerIdx };
  return mesh;
}

/**
 * 创建文字Sprite（基于Canvas纹理）
 */
function createTextSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 254, 62);
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  return new THREE.Sprite(material);
}

/**
 * 合并多个BufferGeometry（简易实现）
 */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  // 使用BufferGeometryUtils替代（如果可用），否则手动合并
  let totalVertices = 0;
  let totalIndices = 0;

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  for (const geom of geometries) {
    const pos = geom.getAttribute('position');
    const norm = geom.getAttribute('normal');
    const idx = geom.getIndex();

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (norm) {
        normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      }
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + vertexOffset);
      }
    }

    vertexOffset += pos.count;
    totalVertices += pos.count;
    totalIndices += idx ? idx.count : 0;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length > 0) {
    merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  }
  if (indices.length > 0) {
    merged.setIndex(indices);
  }

  void totalVertices;
  void totalIndices;
  return merged;
}
