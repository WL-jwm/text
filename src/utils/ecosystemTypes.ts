/**
 * 生态系统服务价值评估 — 类型定义
 */

export interface SupplyServiceInput {
  /** 年均可开采资源量 (亿m³/年) */
  annualResource: number;
  /** 实际开采量 (亿m³/年) */
  actualExtraction: number;
  /** 生活用水占比 (%) */
  domesticRatio: number;
  /** 农业灌溉占比 (%) */
  irrigationRatio: number;
  /** 工业用水占比 (%) */
  industrialRatio: number;
  /** 生态用水占比 (%) */
  ecologicalRatio: number;
  /** 生活水价 (元/m³) */
  domesticPrice: number;
  /** 农业水价 (元/m³) */
  irrigationPrice: number;
  /** 工业水价 (元/m³) */
  industrialPrice: number;
}


export interface RegulationServiceInput {
  /** 基流贡献率 (%) */
  baseflowContribution: number;
  /** 河流年均径流量 (亿m³) */
  riverRunoff: number;
  /** 净化污染物总量 (吨/年) */
  purifiedPollutants: number;
  /** 替代处理成本 (元/吨) */
  treatmentCost: number;
  /** 含水层碳储量 (万吨) */
  carbonStorage: number;
  /** 碳交易价格 (元/吨) */
  carbonPrice: number;
  /** 地下水调蓄空间 (亿m³) */
  storageCapacity: number;
  /** 避免洪涝损失 (元/m³) */
  floodAvoidanceValue: number;
  /** 蒸散发量 (亿m³/年) */
  evapotranspiration: number;
}


export interface CulturalServiceInput {
  /** 泉群数量 */
  springCount: number;
  /** 年游客量 (万人次) */
  annualVisitors: number;
  /** 平均消费 (元/人次) */
  avgSpending: number;
  /** 地质遗迹数 */
  geologicalSites: number;
  /** 科研项目数 */
  researchProjects: number;
  /** 平均科研经费 (万元/项) */
  avgResearchFunding: number;
}


export interface SupportingServiceInput {
  /** 依赖地下水的湿地面积 (km²) */
  wetlandArea: number;
  /** 濒危物种数 */
  endangeredSpecies: number;
  /** 植被盖度 (%) */
  vegetationCoverage: number;
  /** 生态保护区面积 (km²) */
  protectedArea: number;
  /** 单位面积生物多样性价值 (万元/km²·年) */
  biodiversityValue: number;
}


export interface EcosystemServiceResult {
  supply: {
    domestic: { volume: number; value: number };
    irrigation: { volume: number; value: number };
    industrial: { volume: number; value: number };
    ecological: { volume: number; value: number };
    totalVolume: number;
    totalValue: number;
  };
  regulation: {
    baseflow: { volume: number; value: number };
    purification: { amount: number; value: number };
    climate: { carbon: number; value: number };
    flood: { capacity: number; value: number };
    etRegulation: { volume: number; value: number };
    totalValue: number;
  };
  cultural: {
    recreation: { visitors: number; value: number };
    education: { projects: number; value: number };
    geological: { sites: number; value: number };
    totalValue: number;
  };
  supporting: {
    habitat: { area: number; value: number };
    biodiversity: { species: number; value: number };
    totalValue: number;
  };
  totalValue: number;
  valueByCategory: { category: string; value: number; percentage: number; color: string }[];
  valueByRegion: { region: string; value: number; perCapita: number }[];
  sustainabilityScore: number;
  sustainabilityLevel: string;
  recommendations: string[];
}

// ============================================================
// 预设区域数据
// ============================================================


export interface RegionPreset {
  id: string;
  name: string;
  description: string;
  supply: Partial<SupplyServiceInput>;
  regulation: Partial<RegulationServiceInput>;
  cultural: Partial<CulturalServiceInput>;
  supporting: Partial<SupportingServiceInput>;
  population: number;
}


export interface ValueTransferInput {
  /** 评估区域面积 (km²) */
  area: number;
  /** 含水层类型 */
  aquiferType: 'porous' | 'fractured' | 'karst';
  /** 气候区 */
  climate: 'humid' | 'semi-arid' | 'arid';
  /** 开发利用程度 */
  development: 'low' | 'medium' | 'high';
}


export interface ValueTransferResult {
  /** 单位面积价值 (万元/km²·年) */
  unitValue: number;
  /** 总价值 (万元/年) */
  totalValue: number;
  /** 各服务类型价值 */
  services: { type: string; unitValue: number; totalValue: number; confidence: string }[];
  /** 价值转移系数 */
  transferCoefficients: { factor: string; coefficient: number; description: string }[];
}

// 基准价值系数 (万元/km²·年), 来源: Costanza et al. (2014) + 中国生态系统服务价值评估标准

export interface EcoWaterDemandInput {
  /** 湿地面积 (km²) */
  wetlandArea: number;
  /** 湿地蒸散发量 (mm/年) */
  wetlandET: number;
  /** 植被面积 (km²) */
  vegetationArea: number;
  /** 植被蒸腾量 (mm/年) */
  vegetationTranspiration: number;
  /** 河流长度 (km) */
  riverLength: number;
  /** 河流水面蒸发 (mm/年) */
  riverEvaporation: number;
  /** 河流平均宽度 (m) */
  riverWidth: number;
  /** 地下水埋深阈值 (m) */
  criticalDepth: number;
  /** 当前地下水埋深 (m) */
  currentDepth: number;
  /** 含水层给水度 */
  specificYield: number;
  /** 影响半径 (m) */
  influenceRadius: number;
}


export interface EcoWaterDemandResult {
  wetlandDemand: number;
  vegetationDemand: number;
  riverDemand: number;
  totalDemand: number;
  currentSupply: number;
  deficit: number;
  deficitRatio: number;
  status: string;
  monthlyDemand: { month: string; wetland: number; vegetation: number; river: number; total: number }[];
}

