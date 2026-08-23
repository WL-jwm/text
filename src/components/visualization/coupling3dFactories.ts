/**
 * 3D多层含水层耦合 — Three.js 几何体工厂
 */

import * as THREE from 'three';
import type { CouplingLayer3D } from './coupling3dTypes';
import { Y_SCALE, LAYER_WIDTH, LAYER_DEPTH } from './coupling3dTypes';

export function createCouplingLayerMesh(layer: CouplingLayer3D): THREE.Mesh {
  const topY = -layer.topDepth * Y_SCALE;
  const bottomY = -layer.bottomDepth * Y_SCALE;
  const height = Math.abs(bottomY - topY);

  const geom = new THREE.BoxGeometry(LAYER_WIDTH, height, LAYER_DEPTH);
  const material = new THREE.MeshPhongMaterial({
    color: layer.color,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    shininess: 20,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = (topY + bottomY) / 2;

  // 边框
  const edges = new THREE.EdgesGeometry(geom);
  const edgeMat = new THREE.LineBasicMaterial({
    color: layer.color,
    transparent: true,
    opacity: 0.6,
  });
  const edgeLines = new THREE.LineSegments(edges, edgeMat);
  mesh.add(edgeLines);

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
    ctx.font = 'bold 24px sans-serif';
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
