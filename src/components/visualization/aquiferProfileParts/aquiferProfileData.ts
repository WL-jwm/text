/**
 * 拆分自 AquiferProfile3D.tsx — 类型定义 / 含水层与剖面站点数据 / SVG 布局参数与坐标变换
 */

// ── 类型 ──

export interface AquiferLayer {
  name: string;
  topDepth: number;
  bottomDepth: number;
  lithology: string;
  K: string;
  waterType: string;
  color: string;
  pattern: string;
}

export interface ProfileStation {
  city: string;
  distance: number; // km from start
  surfaceElev: number; // m
  waterLevels: number[]; // 各层水头标高 m
  note: string;
}

// ── 含水层定义 ──

export const AQUIFER_LAYERS: AquiferLayer[] = [
  { name: '第I含水组', topDepth: 0, bottomDepth: 50, lithology: '砂砾石/中细砂', K: '10~50 m/d', waterType: '潜水-微承压', color: '#22c55e', pattern: 'dots' },
  { name: '第II含水组', topDepth: 50, bottomDepth: 150, lithology: '中细砂/粉细砂', K: '5~20 m/d', waterType: '承压水', color: '#3b82f6', pattern: 'lines' },
  { name: '第III含水组', topDepth: 150, bottomDepth: 350, lithology: '细砂/粉砂', K: '2~8 m/d', waterType: '承压水', color: '#8b5cf6', pattern: 'cross' },
  { name: '第IV含水组', topDepth: 350, bottomDepth: 550, lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', waterType: '深层承压水', color: '#f59e0b', pattern: 'grid' },
];

// ── 剖面线数据（山前平原→滨海平原） ──

export const PROFILE_STATIONS: ProfileStation[] = [
  { city: '石家庄', distance: 0, surfaceElev: 85, waterLevels: [82, 75, 68, 60], note: '山前冲洪积扇' },
  { city: '保定', distance: 80, surfaceElev: 65, waterLevels: [60, 52, 45, 38], note: '冲积平原上部' },
  { city: '廊坊', distance: 160, surfaceElev: 45, waterLevels: [40, 33, 26, 18], note: '冲积平原中部' },
  { city: '沧州', distance: 240, surfaceElev: 30, waterLevels: [26, 18, 8, -5], note: '滨海平原' },
  { city: '唐山', distance: 300, surfaceElev: 40, waterLevels: [36, 29, 22, 15], note: '滨海过渡带' },
];

// ── SVG 参数 ──

export const SVG_W = 800;
export const SVG_H = 420;
export const MARGIN = { left: 60, right: 140, top: 30, bottom: 50 };
export const PLOT_W = SVG_W - MARGIN.left - MARGIN.right;
export const PLOT_H = SVG_H - MARGIN.top - MARGIN.bottom;
export const MAX_DEPTH = 600;
const MIN_ELEV = -20;

export function elevToY(elev: number): number {
  const range = MAX_DEPTH - MIN_ELEV;
  return MARGIN.top + ((MAX_DEPTH - elev) / range) * PLOT_H;
}

export function distToX(dist: number, maxDist: number): number {
  return MARGIN.left + (dist / maxDist) * PLOT_W;
}

/** 贝塞尔曲线生成器（平滑插值） */
export function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}
