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
 * Three.js 网格构建工具函数（拆分自 AquiferProfile3DWebGL.tsx）
 */

import * as THREE from 'three';
import { PROFILE_STATIONS, SCALE_X, SCALE_Y, PROFILE_WIDTH, type AquiferLayer3D } from './aquiferProfileConstants';

export function createAquiferLayerMesh(layer: AquiferLayer3D, _layerIdx: number): THREE.Mesh {
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

export function createWaterHeadMesh(layer: AquiferLayer3D, layerIdx: number): THREE.Mesh {
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

export function createTextSprite(text: string): THREE.Sprite {
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

export function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
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
