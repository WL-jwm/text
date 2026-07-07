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

// ── CountyCrossView 类型 ──

export interface CitySummaryItem {
  city: string;
  countyCount: number;
  totalUse: number;
  totalGw: number;
  gwRatio: number;
  totalAgri: number;
  totalIndustry: number;
  totalDomestic: number;
  totalEco: number;
  agriRatio: number;
}

export interface CrossCityItem {
  city: string;
  county: string;
  totalUse: number;
  gwUse: number;
  agri: number;
  industry: number;
  domestic: number;
  eco: number;
  gwRatio: number;
  agriRatio: number;
  precip: number | null;
}

export interface CityDistributionItem {
  city: string;
  minAgri: number;
  maxAgri: number;
  avgAgri: number;
  minGw: number;
  maxGw: number;
  avgGw: number;
  avgPrecip: number;
  minPrecip: number;
  maxPrecip: number;
  countyCount: number;
}

export interface ScatterByCityItem {
  city: string;
  color: string;
  data: Array<{ x: number; y: number; z: number; county: string; cityName: string }>;
}

// ── 水化学类型 ──

export interface SukaliefClassification {
  type: string;
  note: string;
  zone: string;
  typicalTDS: string;
  percentage: string;
  color: string;
}

export interface HydrochemicalByRegion {
  region: string;
  tds: number;
  hardness: number;
  sulfate: number;
  chloride: number;
  fluoride: number;
  ph: number;
  type: string;
}

export interface IsotopeSample {
  id: string;
  location: string;
  depth: number;
  type: string;
  delta18O: number;
  deltaD: number;
  tritium: number;
  age: string;
  zone: string;
  recharge: string;
}

export interface ClassPieItem {
  name: string;
  value: number;
  color: string;
}

export interface RadarItem {
  type: string;
  percentage: number;
  tds: number;
}

export interface TdsBarItem {
  name: string;
  tds: number;
  hardness: number;
  sulfate: number;
  chloride: number;
}

export interface FluorideBarItem {
  name: string;
  fluoride: number;
}

export interface PhBarItem {
  name: string;
  ph: number;
}

export interface IsoPoint {
  x: number;
  y: number;
  z: number;
  name: string;
}

// ── CountyAnalysisTab 类型 ──

export interface CountyAnalysisItem {
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

export interface CityGwAvgItem {
  name: string;
  '平均地下水占比': number;
}

export interface PrecipUseCorrItem {
  name: string;
  降水: number | null;
  '地下水占比': number;
}

export interface CountyAnalysisStats {
  total: number;
  cities: number;
  totalUse: number;
  avgGwRatio: number;
  totalGwUse: number;
}

export interface CountyAnalysisData {
  stats: CountyAnalysisStats;
  gwDepRank: CountyAnalysisItem[];
  cityGwAvg: CityGwAvgItem[];
  topByUse: CountyAnalysisItem[];
  agriRank: CountyAnalysisItem[];
  precipUseCorr: PrecipUseCorrItem[];
}

export interface IrrigationEfficiencyItem extends CountyAnalysisItem {
  agriUse: number;
  irrigPerMm: string;
}

export interface SelectableCountyItem {
  name: string;
  city: string;
}

// ── Bulletin 对比类型 ──

/** 跨市对比图表数据项 */
export interface BulletinCompareItem {
  name: string;
  降水量: number;
  地表水: number;
  地下水: number;
  水资源总量: number;
  总供水: number;
  地下水供水: number;
  降水总量: number;
}

/** 公报排序表格行 */
export interface BulletinTableRow {
  name: string;
  降水: number;
  地表水: number;
  地下水: number;
  总量: number;
  供水: number;
  地下水供水比: number;
  浅层埋深: number;
  浅层变化: number;
  县级数据: number;
}

/** 地下水依赖度排名项（简化版，用于 SupplyStructureTab） */
export interface GwDepRankItem {
  name: string;
  rate: number;
}

/** 供水结构数据项 */
export interface SupplyStructureItem {
  name: string;
  地下水: number;
  地表水: number;
}

/** 各市水资源量对比项（用于 DataInsightInner） */
export interface RegionalCompareItem {
  name: string;
  '浅层变化': number;
  '深层变化': number;
}

/** 区域列数据项 */
export interface RegionalColumnItem {
  name: string;
  '总供水(亿m³)': number;
  '地下水占比(%)': number;
  '地表水占比(%)': number;
  '水位变化(m)': number;
}
