/**
 * 拆分自 types/county.ts — 县级水资源/公报核心类型
 */

// ── 县级水资源数据相关类型定义 ──

/** 县级用水数据项（来自 cityBulletin2024.counties） */
export interface CountyDataItem {
  name: string;
  precip: number | null;
  surface: number | null;
  ground: number | null;
  total: number | null;
  agri: number | null;
  industry: number | null;
  domestic: number | null;
  eco: number | null;
  totalUse: number | null;
  gwUse: number | null;
  /** 计算字段：地下水占比(%) */
  gwRatio?: number;
  /** 计算字段：农业占比(%) */
  agriRatio?: number;
  /** 计算字段：工业占比(%) */
  industryRatio?: number;
  /** 计算字段：生活占比(%) */
  domesticRatio?: number;
  /** 计算字段：生态占比(%) */
  ecoRatio?: number;
  /** 计算字段：原始索引 */
  _index?: number;
}

/** 水库蓄水数据 */
export interface ReservoirData {
  name: string;
  type: string;
  lastYearStorage: number;
  yearEndStorage: number;
  change: number;
  inflow: number;
  outflow: number;
}

/** 县级地下水位埋深变幅数据 */
export interface CountyGroundwaterData {
  name: string;
  depth2024: number;
  depth2023: number;
  change: number;
}

/** 城市公报简要（CountySingleView 使用的字段子集） */
export interface CityBulletinBrief {
  city: string;
  counties?: CountyDataItem[];
  reservoirs?: ReservoirData[];
  countyGroundwater?: CountyGroundwaterData[];
}

/** 散点图数据点 */
export interface ScatterDataPoint {
  name: string;
  x: number;
  y: number;
  size: number;
}

/** 雷达图数据点（维度行，县名为动态键） */
export interface RadarDataPoint {
  dimension: string;
  fullMark: number;
  [countyName: string]: string | number;
}

/** 饼图数据项 */
export interface PieDataItem {
  name: string;
  value: number;
}

/** 象限分析数据点 */
export interface QuadrantDataPoint {
  name: string;
  precip: number;
  gwRatio: number;
  totalUse: number;
}

// ── 城市公报类型 ──

/** 县级表格行（用于 BulletinDetailTab 的 countyTableRows） */
export interface CountyTableRow {
  name: string;
  precip: number;
  surface: number;
  ground: number;
  total: number;
  totalUse: number;
  agri: number;
  gwUse: number;
  hasData: boolean;
}

/** 县级用水部门数据（用于 BulletinDetailTab 用水结构图） */
export interface CountyUseData {
  name: string;
  农业: number;
  工业: number;
  生活: number;
  生态: number;
}

/** 县级供水水源分项数据 */
export interface SupplyByCountyData {
  name: string;
  storageSupply?: number;
  diversionSupply?: number;
  pumpingSupply?: number;
  groundSupply?: number;
}

/** 河流数据项 */
export interface RiverFlowData {
  river: string;
  volume: number;
}

/** 城市公报完整类型 */
export interface CityBulletinData {
  city: string;
  bulletinDate: string;
  area: number;
  precipitation: number;
  precipTotal: number;
  multiAvgPrecip?: number;
  prevYearPrecip: number | null;
  prevYearCompare: string | null;
  grade: string;
  surfaceWater: number;
  groundWater: number;
  repeatCalc: number;
  totalWater: number;
  coeff: number;
  multiAvgTotal?: number;
  perCapita?: number | null;
  totalSupply?: number;
  localSurfaceSupply?: number;
  interBasinTransferSupply?: number;
  groundSupply?: number;
  otherSupply?: number;
  agriUse?: number;
  industryUse?: number;
  domesticUse?: number;
  ecoUse?: number;
  southWaterDiversion?: number;
  inflow?: number;
  outflow?: number;
  reservoirStorage?: number;
  reservoirStorageChange?: number;
  shallowDepth?: number | null;
  shallowChange?: number | null;
  plainStorageChange?: number;
  gdpWaterUse?: number;
  industrialWaterUse?: number;
  notes?: string;
  counties?: CountyDataItem[];
  reservoirs?: ReservoirData[];
  countyGroundwater?: CountyGroundwaterData[];
  supplyByCounty?: SupplyByCountyData[];
  rivers?: {
    inflow?: RiverFlowData[];
    outflow?: RiverFlowData[];
  };
  modulus?: number;
}
