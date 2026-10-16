/**
 * 工具函数（拆分自 Isosurface3D.tsx）
 */
import type { ColorStop, InterpolationGrid } from '../../utils/idwInterpolation';
import * as THREE from 'three';

export function lerpColor(stops: ColorStop[], value: number): THREE.Color {
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

export function extractContours(
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

export function createTextSprite(text: string, color = '#ffffff'): THREE.Sprite {
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
