/**
 * IDW (Inverse Distance Weighting) 空间插值工具
 * 用于生成地下水水位/水质等值线栅格数据
 */

/** 插值数据点 */
export interface InterpolationPoint {
  x: number;      // 经度
  y: number;       // 纬度
  value: number;  // 观测值(水位埋深/水质指数等)
  label?: string;  // 站点名称(可选)
}

/** 插值结果网格 */
export interface InterpolationGrid {
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number };
  resolution: number;       // 网格间距(度)
  cols: number;
  rows: number;
  values: number[][];        // [row][col]
  nodata: number;            // 无数据标记值
}

/** IDW 参数 */
export interface IDWOptions {
  power?: number;            // 距离权重指数，默认2
  resolution?: number;       // 网格分辨率(度)，默认0.05(约5.5km)
  searchRadius?: number;      // 搜索半径(度)，默认1.0(约111km)
  minPoints?: number;         // 最少插值点数，默认3
  maxPoints?: number;         // 最多插值点数，默认12
}

/** 计算两点之间的大圆距离(近似) */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球半径(km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 度转千米(纬度近似) */
function degToKm(deg: number): number {
  return deg * 111.32;
}

/**
 * 执行 IDW 空间插值
 * @param points 观测数据点
 * @param bounds 插值范围(经纬度)，不传则自动从points推算
 * @param options IDW参数
 * @returns 插值网格
 */
export function idwInterpolate(
  points: InterpolationPoint[],
  bounds?: { minLng: number; maxLng: number; minLat: number; maxLat: number },
  options?: IDWOptions,
): InterpolationGrid {
  const power = options?.power ?? 2;
  const resolution = options?.resolution ?? 0.05;
  const searchRadiusKm = degToKm(options?.searchRadius ?? 1.0);
  const minPts = options?.minPoints ?? 3;
  const maxPts = options?.maxPoints ?? 12;
  const nodata = -9999;

  if (points.length < minPts) {
    return { bounds: { minLng: 0, maxLng: 1, minLat: 0, maxLat: 1 }, resolution, cols: 0, rows: 0, values: [], nodata };
  }

  // 自动推算范围(加0.5度边距)
  const lngs = points.map(p => p.x);
  const lats = points.map(p => p.y);
  const padding = 0.3;
  const gridBounds = bounds ?? {
    minLng: Math.min(...lngs) - padding,
    maxLng: Math.max(...lngs) + padding,
    minLat: Math.min(...lats) - padding,
    maxLat: Math.max(...lats) + padding,
  };

  const cols = Math.ceil((gridBounds.maxLng - gridBounds.minLng) / resolution);
  const rows = Math.ceil((gridBounds.maxLat - gridBounds.minLat) / resolution);
  const values: number[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    const lat = gridBounds.maxLat - r * resolution; // 从北到南
    for (let c = 0; c < cols; c++) {
      const lng = gridBounds.minLng + c * resolution;

      // 搜索范围内数据点，按距离排序
      const dists = points
        .map(p => ({ p, dist: haversineDistance(lat, lng, p.y, p.x) }))
        .filter(d => d.dist <= searchRadiusKm)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, maxPts);

      if (dists.length < minPts) {
        row.push(nodata);
      } else {
        let sumW = 0, sumWV = 0;
        for (const d of dists) {
          if (d.dist < 0.001) { // 避免除零
            sumWV = d.p.value;
            sumW = 1;
            break;
          }
          const w = 1 / Math.pow(d.dist, power);
          sumW += w;
          sumWV += w * d.p.value;
        }
        row.push(sumW > 0 ? sumWV / sumW : nodata);
      }
    }
    values.push(row);
  }

  return { bounds: gridBounds, resolution, cols, rows, values, nodata };
}

/**
 * 将插值网格转换为 Canvas ImageData
 * 用于 Leaflet L.imageOverlay 渲染
 */
export function gridToCanvas(
  grid: InterpolationGrid,
  colorStops: ColorStop[],
  width?: number,
  height?: number,
): { canvas: HTMLCanvasElement; canvasWidth: number; canvasHeight: number } {
  const cw = width ?? Math.min(grid.cols * 4, 1024);
  const ch = height ?? Math.min(grid.rows * 4, 768);

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(cw, ch);
  const data = imageData.data;

  const validMin = colorStops[0]?.value ?? 0;
  const validMax = colorStops[colorStops.length - 1]?.value ?? 1;
  const range = validMax - validMin || 1;

  for (let py = 0; py < ch; py++) {
    const r = Math.floor(py / ch * (grid.rows - 1));
    for (let px = 0; px < cw; px++) {
      const c = Math.floor(px / cw * (grid.cols - 1));
      const val = grid.values[r]?.[c];

      const idx = (py * cw + px) * 4;

      if (val === undefined || val === grid.nodata) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0; // 透明
      } else {
        const t = Math.max(0, Math.min(1, (val - validMin) / range));
        const color = interpolateColor(colorStops, t);
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 160; // 半透明
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return { canvas, canvasWidth: cw, canvasHeight: ch };
}

/** 颜色断点 */
export interface ColorStop {
  value: number;
  color: [number, number, number]; // RGB
}

/** 颜色插值 */
function interpolateColor(stops: ColorStop[], t: number): [number, number, number] {
  if (t <= 0) return stops[0].color;
  if (t >= 1) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].value / (stops[stops.length - 1].value - stops[0].value || 1) &&
        t <= stops[i + 1].value / (stops[stops.length - 1].value - stops[0].value || 1)) {
      // 简单线性插值
      const localT = (t * (stops.length - 1)) - i;
      return [
        Math.round(stops[i].color[0] + (stops[i + 1].color[0] - stops[i].color[0]) * localT),
        Math.round(stops[i].color[1] + (stops[i + 1].color[1] - stops[i].color[1]) * localT),
        Math.round(stops[i].color[2] + (stops[i + 1].color[2] - stops[i].color[2]) * localT),
      ];
    }
  }
  return stops[0].color;
}

/** 预定义配色方案 */
export const COLOR_SCHEMES = {
  /** 水位埋深: 蓝(浅)→绿→黄→红(深) */
  waterLevel: [
    { value: 0, color: [59, 130, 246] as [number, number, number] },
    { value: 10, color: [34, 197, 94] as [number, number, number] },
    { value: 30, color: [234, 179, 8] as [number, number, number] },
    { value: 60, color: [249, 115, 22] as [number, number, number] },
    { value: 100, color: [239, 68, 68] as [number, number, number] },
  ],
  /** 水质指数: 绿(I类)→黄→红(V类) */
  waterQuality: [
    { value: 1, color: [34, 197, 94] as [number, number, number] },
    { value: 2, color: [163, 230, 53] as [number, number, number] },
    { value: 3, color: [234, 179, 8] as [number, number, number] },
    { value: 4, color: [249, 115, 22] as [number, number, number] },
    { value: 5, color: [239, 68, 68] as [number, number, number] },
  ],
  /** 地温梯度: 蓝(低)→红(高) */
  geothermal: [
    { value: 2, color: [59, 130, 246] as [number, number, number] },
    { value: 3, color: [6, 182, 212] as [number, number, number] },
    { value: 4, color: [234, 179, 8] as [number, number, number] },
    { value: 5, color: [249, 115, 22] as [number, number, number] },
    { value: 6, color: [239, 68, 68] as [number, number, number] },
  ],
} as const;
