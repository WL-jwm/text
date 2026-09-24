/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 * 坐标转换与样式工具函数（拆分自 GroundwaterAgeViz.tsx）
 */

import { AD_M, AD_PH, AD_MAX_DEPTH, AD_PW, AD_MAX_AGE, ISO_M, ISO_PW, D18O_MIN, D18O_MAX, ISO_PH, DD_MIN, DD_MAX, TR_M, TR_PW, TR_MAX_DIST, TR_PH, TR_MAX_TRITIUM, SampleTypeMeta } from './ageVizConstants';


// ── 坐标转换函数 ──

export function depthToY(depth: number): number {
  return AD_M.top + (depth / AD_MAX_DEPTH) * AD_PH;
}


export function ageToX(age: number): number {
  // 对数刻度
  const logAge = age <= 1 ? 0 : Math.log10(age);
  const logMax = Math.log10(AD_MAX_AGE);
  return AD_M.left + (logAge / logMax) * AD_PW;
}


export function d18OToX(v: number): number {
  return ISO_M.left + ((v - D18O_MIN) / (D18O_MAX - D18O_MIN)) * ISO_PW;
}


export function dDToY(v: number): number {
  return ISO_M.top + ((DD_MAX - v) / (DD_MAX - DD_MIN)) * ISO_PH;
}


export function distToX_T(dist: number): number {
  return TR_M.left + (dist / TR_MAX_DIST) * TR_PW;
}


export function tritiumToY(t: number): number {
  return TR_M.top + (1 - t / TR_MAX_TRITIUM) * TR_PH;
}


// ── 样式符号 ──

export function sampleShape(shape: SampleTypeMeta['shape'], cx: number, cy: number, color: string, r = 5): React.ReactNode {
  switch (shape) {
    case 'square':
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
    case 'triangle':
      return <polygon points={`${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
    case 'diamond':
      return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
    default:
      return <circle cx={cx} cy={cy} r={r} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
  }
}
