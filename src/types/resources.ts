// ── 资源数据相关类型定义 ──

/** 各市供水数据项 */
export interface CityWaterSupplyItem {
  city: string;
  gwSupply: number;
  totalSupply: number;
  gwRatio: number;
}

/** 各市地下水动态项 */
export interface CityGroundwaterDynamicItem {
  city: string;
  shallowDepth: number | null;
  shallowChange: number | null;
  deepDepth: number | null;
  deepChange: number | null;
  overExploit: string;
}

/** 县级分析项（简化版，用于 DataInsightInner 内部计算） */
export interface CountyAnalysisCalcItem {
  name: string;
  city: string;
  totalUse: number;
  gwUse: number;
  agri: number;
  industry: number;
  domestic: number;
  eco: number;
  precip: number | null;
  gwRatio: number;
  agriRatio: number;
}

/** 雷达图维度计算器参数 */
export interface RadarCalcContext {
  gwRatio: number;
  agriRatio?: number;
  precip: number | null;
  totalUse?: number;
  eco?: number;
  [key: string]: unknown;
}

/** 资源概要数据 */
export interface WaterResourceSummary {
  rainfall: { value: number; unit: string; yoyChange: string; multiAvg: number; multiChange: string };
  totalResource: { value: number; unit: string; yoyChange: string; multiAvg: number; multiChange: string };
  surfaceWater: { value: number; unit: string; multiAvg: number; multiChange: string };
  groundwater: { value: number; unit: string; multiAvg: number; multiChange: string };
  perCapita: { value: number; unit: string };
  runOffCoeff: { value: number; unit: string };
}

/** 浅层地下水质量数据项 */
export interface ShallowGroundwaterQuality {
  region: string;
  stations: number;
  I: number;
  II: number;
  III: number;
  IV: number;
  V: number;
  mainPollutants: string;
}

/** 水质趋势数据项 */
export interface QualityLevelTrend {
  year: number;
  I2: number;
  III: number;
  IV: number;
  V: number;
  IIIplus: number;
  wells: number;
  shallowRise: number;
  gwSupply: number;
}

/** 资源环境数据项（用于 ResourceEnvTab） */
export interface ResourceEnvDataItem {
  name: string;
  '水资源总量': number;
  '地下水': number;
  '浅层漏斗': number;
}

/** 资源组合项 */
export interface ResourceComboItem {
  name: string;
  value: number;
  color: string;
}

/** 饼图数据项 */
export interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

/** 柱状图数据项 */
export interface BarDataItem {
  name: string;
  value: number;
}
