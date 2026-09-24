/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 * 共享常量与类型（拆分自 GroundwaterAgeViz.tsx）
 */
export type SampleType = 'all' | 'shallow' | 'mid' | 'deep' | 'karst';
export interface SampleTypeMeta {
  key: SampleType;
  label: string;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}
export const SAMPLE_TYPES: SampleTypeMeta[] = [
  { key: 'shallow', label: '潜水(浅层)', color: '#22c55e', shape: 'circle' },
  { key: 'mid', label: '中层承压', color: '#3b82f6', shape: 'square' },
  { key: 'deep', label: '深层承压', color: '#f59e0b', shape: 'triangle' },
  { key: 'karst', label: '岩溶水', color: '#8b5cf6', shape: 'diamond' },
];
// 14C年龄-深度图
export const AD_W = 420, AD_H = 360;
export const AD_M = { left: 70, right: 30, top: 30, bottom: 50 };
export const AD_PW = AD_W - AD_M.left - AD_M.right;
export const AD_PH = AD_H - AD_M.top - AD_M.bottom;
export const AD_MAX_DEPTH = 500;
export const AD_MAX_AGE = 35000; // 对数刻度上限
// δD-δ18O散点图
export const ISO_W = 440, ISO_H = 380;
export const ISO_M = { left: 55, right: 30, top: 30, bottom: 50 };
export const ISO_PW = ISO_W - ISO_M.left - ISO_M.right;
export const ISO_PH = ISO_H - ISO_M.top - ISO_M.bottom;
export const D18O_MIN = -12, D18O_MAX = -2;
export const DD_MIN = -85, DD_MAX = -25;
// 氚衰减曲线
export const TR_W = 440, TR_H = 300;
export const TR_M = { left: 55, right: 30, top: 30, bottom: 50 };
export const TR_PW = TR_W - TR_M.left - TR_M.right;
export const TR_PH = TR_H - TR_M.top - TR_M.bottom;
export const TR_MAX_DIST = 200;
export const TR_MAX_TRITIUM = 25;
