/**
 * 拆分自 resources-bulletin.ts — 城市公报数据类型
 */

export interface CountyData {
  name: string;
  /** 扩展：区县面积 / 降水总量 */
  area?: number;
  precipTotal?: number;
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
}

export interface SupplyByCounty {
  name: string;
  surface?: number;
  ground?: number;
  other?: number;
  total: number;
}

/** 县级地下水埋深（保定等） */
export interface CountyGroundwaterItem {
  name: string;
  depth2024: number;
  depth2023: number;
  change: number;
}

/** 河北省地下水资源公报 — 城市年度条目 */
export interface CityBulletin2024 {
  city: string;
  grade: string;
  notes: string;
  /** 全部城市必有的数值指标 */
  agriUse: number;
  area: number;
  coeff: number;
  domesticUse: number;
  ecoUse: number;
  groundSupply: number;
  groundWater: number;
  industryUse: number;
  localSurfaceSupply: number;
  modulus: number;
  multiAvgPrecip: number;
  otherSupply: number;
  precipTotal: number;
  precipitation: number;
  surfaceWater: number;
  totalSupply: number;
  totalWater: number;
  /** 全部城市必有（部分值为 null） */
  prevYearPrecip: number | null;
  prevYearCompare: string | null;
  /** 区县明细（数组字面量公共类型为必选；缺失城市为空数组） */
  counties: CountyData[];
  /** 可选扩展 */
  bulletinDate?: string;
  repeatCalc?: number;
  perCapita?: number | null;
  interBasinTransferSupply?: number;
  supplyByCounty?: (SupplyByCounty | undefined)[];
  countyGroundwater?: (CountyGroundwaterItem | undefined)[];
  reservoirs?: unknown[];
  rivers?: unknown;
  baiyangdianLevel?: number;
  baiyangdianStorage?: number;
  deepChange?: number;
  deepDepth?: number;
  deepGround?: number;
  deepOverExploitDepth?: number;
  gdpWaterUse?: number;
  gwReduction?: number;
  industrialWaterUse?: number;
  inflow?: number;
  multiAvgTotal?: number;
  outflow?: number;
  plainStorageChange?: number;
  reservoirStorage?: number;
  reservoirStorageChange?: number;
  seaOutflow?: number;
  shallowChange?: number;
  shallowDepth?: number;
  shallowGround?: number;
  shallowOverExploitDepth?: number;
  southWaterDiversion?: number;
  surfaceSupply?: number;
  yellowRiverWater?: number;
}
