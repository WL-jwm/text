/**
 * DRASTIC脆弱性评价 — 权重与评分表
 */

import type { AquiferMediaType, SoilMediaType, VadoseMediaType, PollutionSourceType, DepthRating } from './drasticTypes';

export const DRASTIC_WEIGHTS = {
  D: 5, // 地下水埋深
  R: 4, // 净补给量
  A: 3, // 含水层介质
  S: 2, // 土壤介质
  T: 1, // 地形坡度
  I: 5, // 非饱和带影响
  C: 3, // 渗透系数
} as const;


export const DRASTIC_MAX_INDEX = 10 * (5 + 4 + 3 + 2 + 1 + 5 + 3); // 230

// ═══════════════════════════════════════════════════════
// D — 地下水埋深评分表
// ═══════════════════════════════════════════════════════


export const DEPTH_RATINGS: DepthRating[] = [
  { range: '0~1.5', min: 0, max: 1.5, rating: 10 },
  { range: '1.5~3.0', min: 1.5, max: 3.0, rating: 9 },
  { range: '3.0~4.5', min: 3.0, max: 4.5, rating: 8 },
  { range: '4.5~9.0', min: 4.5, max: 9.0, rating: 7 },
  { range: '9.0~15.0', min: 9.0, max: 15.0, rating: 5 },
  { range: '15.0~22.5', min: 15.0, max: 22.5, rating: 3 },
  { range: '22.5~30.0', min: 22.5, max: 30.0, rating: 2 },
  { range: '>30.0', min: 30.0, max: Infinity, rating: 1 },
];

// ═══════════════════════════════════════════════════════
// R — 净补给量评分表
// ═══════════════════════════════════════════════════════


export const RECHARGE_RATINGS: DepthRating[] = [
  { range: '0~50', min: 0, max: 50, rating: 1 },
  { range: '50~100', min: 50, max: 100, rating: 3 },
  { range: '100~178', min: 100, max: 178, rating: 6 },
  { range: '178~254', min: 178, max: 254, rating: 8 },
  { range: '>254', min: 254, max: Infinity, rating: 9 },
];

// ═══════════════════════════════════════════════════════
// A — 含水层介质评分表
// ═══════════════════════════════════════════════════════


export const AQUIFER_MEDIA_RATINGS: Record<AquiferMediaType, { label: string; rating: number; typical: string }> = {
  ' massive': { label: '块状页岩/变质岩', rating: 2, typical: '低渗透，裂隙不发育' },
  'karst': { label: '岩溶灰岩', rating: 10, typical: '岩溶发育，渗透性极强' },
  'sand_gravel': { label: '砂砾石', rating: 8, typical: '冲洪积扇主流相' },
  'bedded': { label: '层状砂岩/灰岩', rating: 6, typical: '层间裂隙中等发育' },
  'limestone': { label: '灰岩/白云岩', rating: 7, typical: '裂隙发育中等' },
  'sandstone': { label: '砂岩', rating: 6, typical: '孔隙-裂隙含水层' },
  'basalt': { label: '玄武岩', rating: 9, typical: '柱状节理发育' },
  'schist': { label: '片岩', rating: 3, typical: '低渗透变质岩' },
};

// ═══════════════════════════════════════════════════════
// S — 土壤介质评分表
// ═══════════════════════════════════════════════════════


export const SOIL_MEDIA_RATINGS: Record<SoilMediaType, { label: string; rating: number }> = {
  'thin_absent': { label: '薄层/缺失', rating: 10 },
  'gravel': { label: '砾石', rating: 10 },
  'sand': { label: '砂土', rating: 9 },
  'loam': { label: '壤土', rating: 5 },
  'clay_loam': { label: '粘壤土', rating: 3 },
  'silt': { label: '粉砂土', rating: 6 },
  'clay': { label: '粘土', rating: 2 },
  'shrink': { label: '胀缩粘土', rating: 1 },
};

// ═══════════════════════════════════════════════════════
// T — 地形坡度评分表
// ═══════════════════════════════════════════════════════


export const TOPOGRAPHY_RATINGS: DepthRating[] = [
  { range: '0~2', min: 0, max: 2, rating: 10 },
  { range: '2~6', min: 2, max: 6, rating: 9 },
  { range: '6~12', min: 6, max: 12, rating: 5 },
  { range: '12~18', min: 12, max: 18, rating: 3 },
  { range: '>18', min: 18, max: Infinity, rating: 1 },
];

// ═══════════════════════════════════════════════════════
// I — 非饱和带介质评分表
// ═══════════════════════════════════════════════════════


export const VADOSE_MEDIA_RATINGS: Record<VadoseMediaType, { label: string; rating: number }> = {
  'confining': { label: '隔水层/承压', rating: 1 },
  'silt': { label: '粉砂', rating: 3 },
  'limestone': { label: '灰岩', rating: 6 },
  'sandstone': { label: '砂岩', rating: 6 },
  'sand_gravel': { label: '砂砾石', rating: 8 },
  'metamorphic': { label: '变质岩', rating: 4 },
  'karst': { label: '岩溶', rating: 9 },
  'basalt': { label: '玄武岩', rating: 9 },
};

// ═══════════════════════════════════════════════════════
// C — 渗透系数评分表
// ═══════════════════════════════════════════════════════


export const CONDUCTIVITY_RATINGS: DepthRating[] = [
  { range: '0~4.1', min: 0, max: 4.1, rating: 1 },
  { range: '4.1~12.3', min: 4.1, max: 12.3, rating: 2 },
  { range: '12.3~28.7', min: 12.3, max: 28.7, rating: 4 },
  { range: '28.7~41.0', min: 28.7, max: 41.0, rating: 6 },
  { range: '41.0~81.5', min: 41.0, max: 81.5, rating: 8 },
  { range: '>81.5', min: 81.5, max: Infinity, rating: 10 },
];

// ═══════════════════════════════════════════════════════
// 污染源风险评分表
// ═══════════════════════════════════════════════════════


export const POLLUTION_SOURCE_RISK: Record<PollutionSourceType, { rating: number; desc: string }> = {
  '工业': { rating: 8, desc: '工业废水/重金属/有机溶剂' },
  '农业': { rating: 6, desc: '化肥/农药/畜禽粪便' },
  '生活': { rating: 5, desc: '生活污水/化粪池渗漏' },
  '垃圾填埋场': { rating: 9, desc: '渗滤液含多种污染物' },
  '加油站': { rating: 7, desc: '石油烃/MTBE等' },
  '矿山': { rating: 8, desc: '酸性矿山排水/重金属' },
  '污水处理': { rating: 6, desc: '处理不达标/管道渗漏' },
};

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

