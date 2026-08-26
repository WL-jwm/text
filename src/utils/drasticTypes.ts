/**
 * DRASTIC脆弱性评价 — 类型定义
 */

export interface DrasticInput {
  /** 评价区名称 */
  name: string;
  /** D — 地下水埋深 (m) */
  depth: number;
  /** R — 净补给量 (mm/a) */
  recharge: number;
  /** A — 含水层介质 (类型代码) */
  aquiferMedia: AquiferMediaType;
  /** S — 土壤介质 (类型代码) */
  soilMedia: SoilMediaType;
  /** T — 地形坡度 (%) */
  topography: number;
  /** I — 非饱和带介质 (类型代码) */
  vadoseMedia: VadoseMediaType;
  /** C — 渗透系数 (m/d) */
  conductivity: number;
}


export type AquiferMediaType = ' massive' | 'karst' | 'sand_gravel' | 'bedded' | 'limestone' | 'sandstone' | 'basalt' | 'schist';


export type SoilMediaType = 'thin_absent' | 'gravel' | 'sand' | 'loam' | 'clay_loam' | 'silt' | 'clay' | 'shrink';


export type VadoseMediaType = 'confining' | 'silt' | 'limestone' | 'sandstone' | 'sand_gravel' | 'metamorphic' | 'karst' | 'basalt';


export interface DrasticParameterResult {
  /** 参数名称 */
  name: string;
  /** 原始值 */
  rawValue: number | string;
  /** 评分 (1~10) */
  rating: number;
  /** 权重 */
  weight: number;
  /** 加权评分 = rating × weight */
  weightedScore: number;
}


export interface DrasticResult {
  name: string;
  /** DRASTIC综合指数 */
  drasticIndex: number;
  /** 脆弱性等级 */
  vulnerability: '低' | '中等' | '高' | '极高';
  /** 各参数详细评分 */
  parameters: DrasticParameterResult[];
  /** 评价面积 (km²) — 可选 */
  area?: number;
}


export interface PollutionRiskInput {
  /** 区域名称 */
  name: string;
  /** DRASTIC指数 */
  drasticIndex: number;
  /** 污染源类型 */
  pollutionSource: PollutionSourceType;
  /** 污染源距离 (m) */
  distance: number;
  /** 污染源持续时间 (a) */
  duration: number;
}


export type PollutionSourceType = '工业' | '农业' | '生活' | '垃圾填埋场' | '加油站' | '矿山' | '污水处理';


export interface PollutionRiskResult {
  name: string;
  /** 污染源风险评分 (1~10) */
  sourceRisk: number;
  /** 距离修正系数 */
  distanceFactor: number;
  /** 持续时间修正系数 */
  durationFactor: number;
  /** 综合风险评分 */
  compositeRisk: number;
  /** 风险等级 */
  riskLevel: '低风险' | '中等风险' | '高风险' | '极高风险';
  /** 建议措施 */
  recommendation: string;
}

// ═══════════════════════════════════════════════════════
// DRASTIC权重表（标准DRASTIC权重）
// ═══════════════════════════════════════════════════════


export interface DrasticPresetZone {
  name: string;
  region: string;
  depth: number;
  recharge: number;
  aquiferMedia: AquiferMediaType;
  soilMedia: SoilMediaType;
  topography: number;
  vadoseMedia: VadoseMediaType;
  conductivity: number;
  area: number;
  note: string;
}


export interface DepthRating {
  range: string;
  min: number;
  max: number;
  rating: number;
}

