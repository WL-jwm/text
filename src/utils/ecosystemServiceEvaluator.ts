/**
 * 地下水生态系统服务评估器 (B-39)
 * 
 * 基于TEV(总经济价值)框架评估地下水生态系统服务价值:
 * 1. 供给服务 - 供水/营养物质循环
 * 2. 调节服务 - 基流维持/水质净化/气候调节/洪水调蓄
 * 3. 文化服务 - 休闲/教育/美学
 * 4. 支持服务 - 生境维持/生物多样性
 */

// ============================================================
// 类型定义
// ============================================================

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

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: 'hebei_plain',
    name: '河北平原区',
    description: '华北平原河北部分，地下水开发利用程度高',
    population: 5000,
    supply: {
      annualResource: 89.5, actualExtraction: 105.2,
      domesticRatio: 25, irrigationRatio: 55, industrialRatio: 15, ecologicalRatio: 5,
      domesticPrice: 3.5, irrigationPrice: 0.3, industrialPrice: 5.0,
    },
    regulation: {
      baseflowContribution: 15, riverRunoff: 50,
      purifiedPollutants: 5000, treatmentCost: 2.5,
      carbonStorage: 1200, carbonPrice: 80,
      storageCapacity: 35, floodAvoidanceValue: 0.5,
      evapotranspiration: 30,
    },
    cultural: {
      springCount: 8, annualVisitors: 300, avgSpending: 200,
      geologicalSites: 15, researchProjects: 20, avgResearchFunding: 50,
    },
    supporting: {
      wetlandArea: 500, endangeredSpecies: 5, vegetationCoverage: 30,
      protectedArea: 800, biodiversityValue: 15,
    },
  },
  {
    id: 'taihang_piedmont',
    name: '太行山前平原',
    description: '石家庄-保定-邢台山前冲洪积扇地带',
    population: 2000,
    supply: {
      annualResource: 35.2, actualExtraction: 42.8,
      domesticRatio: 30, irrigationRatio: 50, industrialRatio: 15, ecologicalRatio: 5,
      domesticPrice: 3.8, irrigationPrice: 0.35, industrialPrice: 5.5,
    },
    regulation: {
      baseflowContribution: 20, riverRunoff: 15,
      purifiedPollutants: 2000, treatmentCost: 2.0,
      carbonStorage: 450, carbonPrice: 80,
      storageCapacity: 15, floodAvoidanceValue: 0.8,
      evapotranspiration: 12,
    },
    cultural: {
      springCount: 12, annualVisitors: 150, avgSpending: 250,
      geologicalSites: 20, researchProjects: 15, avgResearchFunding: 60,
    },
    supporting: {
      wetlandArea: 200, endangeredSpecies: 8, vegetationCoverage: 40,
      protectedArea: 350, biodiversityValue: 20,
    },
  },
  {
    id: 'yanMountain',
    name: '燕山山区',
    description: '承德-张家口山区，地下水生态价值高',
    population: 800,
    supply: {
      annualResource: 22.5, actualExtraction: 12.8,
      domesticRatio: 35, irrigationRatio: 40, industrialRatio: 10, ecologicalRatio: 15,
      domesticPrice: 4.0, irrigationPrice: 0.4, industrialPrice: 6.0,
    },
    regulation: {
      baseflowContribution: 45, riverRunoff: 25,
      purifiedPollutants: 800, treatmentCost: 1.5,
      carbonStorage: 800, carbonPrice: 80,
      storageCapacity: 8, floodAvoidanceValue: 1.2,
      evapotranspiration: 8,
    },
    cultural: {
      springCount: 25, annualVisitors: 500, avgSpending: 350,
      geologicalSites: 35, researchProjects: 25, avgResearchFunding: 80,
    },
    supporting: {
      wetlandArea: 300, endangeredSpecies: 15, vegetationCoverage: 65,
      protectedArea: 1200, biodiversityValue: 30,
    },
  },
  {
    id: 'coastal_plain',
    name: '滨海平原',
    description: '沧州-唐山滨海区域，海水入侵风险区',
    population: 1000,
    supply: {
      annualResource: 15.8, actualExtraction: 18.5,
      domesticRatio: 28, irrigationRatio: 52, industrialRatio: 18, ecologicalRatio: 2,
      domesticPrice: 4.2, irrigationPrice: 0.38, industrialPrice: 5.8,
    },
    regulation: {
      baseflowContribution: 8, riverRunoff: 10,
      purifiedPollutants: 1200, treatmentCost: 3.0,
      carbonStorage: 200, carbonPrice: 80,
      storageCapacity: 5, floodAvoidanceValue: 1.5,
      evapotranspiration: 6,
    },
    cultural: {
      springCount: 3, annualVisitors: 80, avgSpending: 180,
      geologicalSites: 8, researchProjects: 10, avgResearchFunding: 45,
    },
    supporting: {
      wetlandArea: 350, endangeredSpecies: 10, vegetationCoverage: 25,
      protectedArea: 500, biodiversityValue: 25,
    },
  },
  {
    id: 'baiyangdian',
    name: '白洋淀流域',
    description: '雄安新区核心水系，地下水-地表水交互区',
    population: 500,
    supply: {
      annualResource: 8.5, actualExtraction: 6.2,
      domesticRatio: 40, irrigationRatio: 35, industrialRatio: 10, ecologicalRatio: 15,
      domesticPrice: 4.5, irrigationPrice: 0.42, industrialPrice: 6.5,
    },
    regulation: {
      baseflowContribution: 30, riverRunoff: 8,
      purifiedPollutants: 600, treatmentCost: 2.8,
      carbonStorage: 150, carbonPrice: 80,
      storageCapacity: 3, floodAvoidanceValue: 2.0,
      evapotranspiration: 4,
    },
    cultural: {
      springCount: 5, annualVisitors: 800, avgSpending: 400,
      geologicalSites: 12, researchProjects: 30, avgResearchFunding: 100,
    },
    supporting: {
      wetlandArea: 366, endangeredSpecies: 20, vegetationCoverage: 55,
      protectedArea: 400, biodiversityValue: 40,
    },
  },
  {
    id: 'zhangjiakou',
    name: '坝上高原',
    description: '张家口坝上地区，生态屏障与首都水源地',
    population: 400,
    supply: {
      annualResource: 6.8, actualExtraction: 4.5,
      domesticRatio: 30, irrigationRatio: 45, industrialRatio: 5, ecologicalRatio: 20,
      domesticPrice: 4.0, irrigationPrice: 0.35, industrialPrice: 5.5,
    },
    regulation: {
      baseflowContribution: 55, riverRunoff: 6,
      purifiedPollutants: 300, treatmentCost: 1.8,
      carbonStorage: 350, carbonPrice: 80,
      storageCapacity: 2, floodAvoidanceValue: 1.0,
      evapotranspiration: 2,
    },
    cultural: {
      springCount: 15, annualVisitors: 600, avgSpending: 300,
      geologicalSites: 25, researchProjects: 20, avgResearchFunding: 70,
    },
    supporting: {
      wetlandArea: 250, endangeredSpecies: 18, vegetationCoverage: 70,
      protectedArea: 800, biodiversityValue: 35,
    },
  },
];

// ============================================================
// 核心计算函数
// ============================================================

export function calculateSupplyService(input: SupplyServiceInput) {
  // 转换为万m³
  const totalExtraction = input.actualExtraction * 10000; // 万m³
  const domesticVol = totalExtraction * input.domesticRatio / 100;
  const irrigationVol = totalExtraction * input.irrigationRatio / 100;
  const industrialVol = totalExtraction * input.industrialRatio / 100;
  const ecologicalVol = totalExtraction * input.ecologicalRatio / 100;
  
  // 价值计算 (万元)
  const domesticValue = domesticVol * input.domesticPrice;
  const irrigationValue = irrigationVol * input.irrigationPrice;
  const industrialValue = industrialVol * input.industrialPrice;
  const ecologicalValue = ecologicalVol * input.domesticPrice * 0.8; // 生态用水按生活水价80%计
  
  const totalVolume = domesticVol + irrigationVol + industrialVol + ecologicalVol;
  const totalValue = domesticValue + irrigationValue + industrialValue + ecologicalValue;
  
  return {
    domestic: { volume: Math.round(domesticVol), value: Math.round(domesticValue) },
    irrigation: { volume: Math.round(irrigationVol), value: Math.round(irrigationValue) },
    industrial: { volume: Math.round(industrialVol), value: Math.round(industrialValue) },
    ecological: { volume: Math.round(ecologicalVol), value: Math.round(ecologicalValue) },
    totalVolume: Math.round(totalVolume),
    totalValue: Math.round(totalValue),
  };
}

export function calculateRegulationService(input: RegulationServiceInput) {
  // 基流维持价值 (替代工程法: 建设同等流量水库的成本)
  const baseflowVol = input.riverRunoff * input.baseflowContribution / 100 * 10000; // 万m³
  const baseflowValue = baseflowVol * 2.0; // 2元/m³替代工程成本
  
  // 水质净化价值 (替代成本法)
  const purificationValue = input.purifiedPollutants * input.treatmentCost; // 元 → 万元
  
  // 气候调节 (碳储量×碳价)
  const climateValue = input.carbonStorage * 10000 * input.carbonPrice / 10000; // 万吨→吨→元→万元
  
  // 洪水调蓄 (调蓄空间×避免损失)
  const floodCapacity = input.storageCapacity * 10000; // 万m³
  const floodValue = floodCapacity * input.floodAvoidanceValue;
  
  // 蒸散发调节 (区域微气候调节)
  const etVol = input.evapotranspiration * 10000; // 万m³
  const etValue = etVol * 0.5; // 0.5元/m³微气候调节价值
  
  const totalValue = baseflowValue + purificationValue + climateValue + floodValue + etValue;
  
  return {
    baseflow: { volume: Math.round(baseflowVol), value: Math.round(baseflowValue) },
    purification: { amount: input.purifiedPollutants, value: Math.round(purificationValue) },
    climate: { carbon: input.carbonStorage, value: Math.round(climateValue) },
    flood: { capacity: Math.round(floodCapacity), value: Math.round(floodValue) },
    etRegulation: { volume: Math.round(etVol), value: Math.round(etValue) },
    totalValue: Math.round(totalValue),
  };
}

export function calculateCulturalService(input: CulturalServiceInput) {
  // 休闲旅游 (旅行费用法)
  const recreationValue = input.annualVisitors * 10000 * input.avgSpending / 10000; // 万人次→人次→元→万元
  
  // 教育科研 (科研经费+教育价值)
  const educationValue = input.researchProjects * input.avgResearchFunding;
  
  // 地质遗迹 (存在价值评估, 每个遗迹50万元/年)
  const geologicalValue = input.geologicalSites * 50;
  
  // 泉群文化价值 (每个泉群100万元/年)
  const springValue = input.springCount * 100;
  
  const totalValue = recreationValue + educationValue + geologicalValue + springValue;
  
  return {
    recreation: { visitors: input.annualVisitors, value: Math.round(recreationValue) },
    education: { projects: input.researchProjects, value: Math.round(educationValue) },
    geological: { sites: input.geologicalSites, value: Math.round(geologicalValue + springValue) },
    totalValue: Math.round(totalValue),
  };
}

export function calculateSupportingService(input: SupportingServiceInput) {
  // 生境维持 (湿地面积×单位生态价值)
  const habitatValue = input.wetlandArea * input.biodiversityValue;
  
  // 生物多样性 (濒危物种额外价值, 每种500万元/年)
  const biodiversityValue = input.endangeredSpecies * 500;
  
  // 植被固碳 (光合作用固碳, 5tC/km²·年 × 200元/t)
  const carbonFixation = input.protectedArea * 5 * 200 / 10000; // 万元
  
  const totalValue = habitatValue + biodiversityValue + carbonFixation;
  
  return {
    habitat: { area: input.wetlandArea, value: Math.round(habitatValue) },
    biodiversity: { species: input.endangeredSpecies, value: Math.round(biodiversityValue) },
    carbonFixation: Math.round(carbonFixation),
    totalValue: Math.round(totalValue),
  };
}

export function calculateEcosystemService(
  supply: SupplyServiceInput,
  regulation: RegulationServiceInput,
  cultural: CulturalServiceInput,
  supporting: SupportingServiceInput,
  _population: number = 1000,
): EcosystemServiceResult {
  const supplyResult = calculateSupplyService(supply);
  const regulationResult = calculateRegulationService(regulation);
  const culturalResult = calculateCulturalService(cultural);
  const supportingResult = calculateSupportingService(supporting);
  
  const totalValue = supplyResult.totalValue + regulationResult.totalValue + 
                     culturalResult.totalValue + supportingResult.totalValue;
  
  const valueByCategory = [
    { category: '供给服务', value: supplyResult.totalValue, percentage: Math.round(supplyResult.totalValue / totalValue * 1000) / 10, color: '#06b6d4' },
    { category: '调节服务', value: regulationResult.totalValue, percentage: Math.round(regulationResult.totalValue / totalValue * 1000) / 10, color: '#10b981' },
    { category: '文化服务', value: culturalResult.totalValue, percentage: Math.round(culturalResult.totalValue / totalValue * 1000) / 10, color: '#f59e0b' },
    { category: '支持服务', value: supportingResult.totalValue, percentage: Math.round(supportingResult.totalValue / totalValue * 1000) / 10, color: '#8b5cf6' },
  ].sort((a, b) => b.value - a.value);
  
  // 人均价值
  const valueByRegion = REGION_PRESETS.map(r => {
    const s = calculateSupplyService({ ...r.supply as SupplyServiceInput });
    const reg = calculateRegulationService({ ...r.regulation as RegulationServiceInput });
    const c = calculateCulturalService({ ...r.cultural as CulturalServiceInput });
    const sup = calculateSupportingService({ ...r.supporting as SupportingServiceInput });
    const total = s.totalValue + reg.totalValue + c.totalValue + sup.totalValue;
    return {
      region: r.name,
      value: Math.round(total),
      perCapita: Math.round(total / r.population),
    };
  }).sort((a, b) => b.value - a.value);
  
  // 可持续性评分
  const extractionRatio = supply.actualExtraction / supply.annualResource;
  let score = 0;
  // 开采平衡 (40%)
  score += Math.min(40, 40 * (extractionRatio <= 1 ? 1 : Math.max(0, 2 - extractionRatio)));
  // 调节服务占比 (25%)
  const regRatio = regulationResult.totalValue / totalValue;
  score += Math.min(25, regRatio * 100);
  // 文化+支持占比 (20%)
  const cultSupRatio = (culturalResult.totalValue + supportingResult.totalValue) / totalValue;
  score += Math.min(20, cultSupRatio * 80);
  // 生态用水比例 (15%)
  score += Math.min(15, supply.ecologicalRatio * 0.5);
  
  const sustainabilityScore = Math.round(score);
  const sustainabilityLevel = sustainabilityScore >= 75 ? '高度可持续' :
    sustainabilityScore >= 55 ? '中度可持续' :
    sustainabilityScore >= 35 ? '低度可持续' : '不可持续';
  
  // 建议措施
  const recommendations: string[] = [];
  if (extractionRatio > 1.2) recommendations.push('地下水超采严重，建议压采至可开采量以内，实施节水改造和替代水源工程');
  else if (extractionRatio > 1.0) recommendations.push('处于超采临界状态，建议严格取水许可管理，控制开采量增长');
  
  if (supply.ecologicalRatio < 5) recommendations.push('生态用水比例偏低，建议增加地下水生态补给，保障最小生态需水量');
  if (regulationResult.purification.value < regulationResult.totalValue * 0.1) recommendations.push('水质净化功能不足，建议加强水源地保护和污染源控制');
  if (culturalResult.totalValue < totalValue * 0.05) recommendations.push('文化服务价值开发不足，建议挖掘地下水文化遗迹和泉群旅游资源');
  if (supportingResult.biodiversity.species > 10 && supportingResult.habitat.area > 200) recommendations.push('生物多样性丰富区域，建议建立地下水生态保护区，严格限制开发活动');
  if (regulationResult.baseflow.value < regulationResult.totalValue * 0.15) recommendations.push('基流维持功能较弱，建议保障枯水期地下水排泄，维持河流生态基流');
  if (recommendations.length === 0) recommendations.push('地下水生态系统服务状态良好，建议维持现有管理水平并持续监测');
  
  return {
    supply: supplyResult,
    regulation: regulationResult,
    cultural: culturalResult,
    supporting: supportingResult,
    totalValue: Math.round(totalValue),
    valueByCategory,
    valueByRegion,
    sustainabilityScore,
    sustainabilityLevel,
    recommendations,
  };
}

// ============================================================
// 价值转移法估算
// ============================================================

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
const BASE_VALUES = {
  porous: { humid: 85, 'semi-arid': 45, arid: 20 },
  fractured: { humid: 65, 'semi-arid': 35, arid: 15 },
  karst: { humid: 120, 'semi-arid': 60, arid: 25 },
};

const DEVELOPMENT_FACTORS = {
  low: 1.2,    // 低开发: 生态价值保留度高
  medium: 0.9, // 中等开发
  high: 0.6,   // 高开发: 生态价值受损
};

export function calculateValueTransfer(input: ValueTransferInput): ValueTransferResult {
  const baseValue = BASE_VALUES[input.aquiferType][input.climate];
  const devFactor = DEVELOPMENT_FACTORS[input.development];
  const unitValue = baseValue * devFactor;
  const totalValue = unitValue * input.area;
  
  const services = [
    { type: '供给服务', ratio: 0.40, confidence: '高' },
    { type: '调节服务', ratio: 0.35, confidence: '中' },
    { type: '文化服务', ratio: 0.10, confidence: '中低' },
    { type: '支持服务', ratio: 0.15, confidence: '中' },
  ].map(s => ({
    type: s.type,
    unitValue: Math.round(unitValue * s.ratio * 100) / 100,
    totalValue: Math.round(totalValue * s.ratio * 100) / 100,
    confidence: s.confidence,
  }));
  
  const transferCoefficients = [
    { factor: '含水层类型修正', coefficient: input.aquiferType === 'karst' ? 1.4 : input.aquiferType === 'porous' ? 1.0 : 0.8, description: '岩溶含水层生态价值最高' },
    { factor: '气候区修正', coefficient: input.climate === 'humid' ? 1.5 : input.climate === 'semi-arid' ? 0.8 : 0.4, description: '湿润区生态价值显著高于干旱区' },
    { factor: '开发利用修正', coefficient: devFactor, description: '高开发区域生态服务价值降低40%' },
    { factor: '区域校正', coefficient: 0.85, description: '河北省区域校正系数(基于华北平原实证)' },
  ];
  
  return {
    unitValue: Math.round(unitValue * 100) / 100,
    totalValue: Math.round(totalValue),
    services,
    transferCoefficients,
  };
}

// ============================================================
// 生态需水量计算
// ============================================================

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

export function calculateEcoWaterDemand(input: EcoWaterDemandInput): EcoWaterDemandResult {
  // 湿地需水量 (万m³)
  const wetlandDemand = input.wetlandArea * 1000000 * input.wetlandET / 1000 / 10000;
  
  // 植被需水量 (万m³)
  const vegetationDemand = input.vegetationArea * 1000000 * input.vegetationTranspiration / 1000 / 10000;
  
  // 河流需水量 (水面蒸发) (万m³)
  const riverArea = input.riverLength * 1000 * input.riverWidth; // m²
  const riverDemand = riverArea * input.riverEvaporation / 1000 / 10000;
  
  const totalDemand = wetlandDemand + vegetationDemand + riverDemand;
  
  // 当前地下水可供给量 (基于埋深差)
  const depthDiff = Math.max(0, input.currentDepth - input.criticalDepth);
  const supplyArea = input.wetlandArea * 1000000 + input.vegetationArea * 1000000; // m²
  const currentSupply = depthDiff > 0 ? 0 : 
    supplyArea * input.influenceRadius * input.specificYield / 10000; // 万m³
  
  const deficit = Math.max(0, totalDemand - currentSupply);
  const deficitRatio = totalDemand > 0 ? deficit / totalDemand * 100 : 0;
  
  let status: string;
  if (deficitRatio < 10) status = '满足良好';
  else if (deficitRatio < 30) status = '基本满足';
  else if (deficitRatio < 50) status = '轻度缺水';
  else if (deficitRatio < 75) status = '中度缺水';
  else status = '严重缺水';
  
  // 月度需水分配 (华北地区典型分配)
  const monthlyFactors = [
    { month: '1月', f: 0.03 }, { month: '2月', f: 0.03 }, { month: '3月', f: 0.05 },
    { month: '4月', f: 0.08 }, { month: '5月', f: 0.10 }, { month: '6月', f: 0.12 },
    { month: '7月', f: 0.15 }, { month: '8月', f: 0.14 }, { month: '9月', f: 0.10 },
    { month: '10月', f: 0.08 }, { month: '11月', f: 0.07 }, { month: '12月', f: 0.05 },
  ];
  
  const monthlyDemand = monthlyFactors.map(m => ({
    month: m.month,
    wetland: Math.round(wetlandDemand * m.f * 100) / 100,
    vegetation: Math.round(vegetationDemand * m.f * 100) / 100,
    river: Math.round(riverDemand * m.f * 100) / 100,
    total: Math.round(totalDemand * m.f * 100) / 100,
  }));
  
  return {
    wetlandDemand: Math.round(wetlandDemand * 100) / 100,
    vegetationDemand: Math.round(vegetationDemand * 100) / 100,
    riverDemand: Math.round(riverDemand * 100) / 100,
    totalDemand: Math.round(totalDemand * 100) / 100,
    currentSupply: Math.round(currentSupply * 100) / 100,
    deficit: Math.round(deficit * 100) / 100,
    deficitRatio: Math.round(deficitRatio * 10) / 10,
    status,
    monthlyDemand,
  };
}
