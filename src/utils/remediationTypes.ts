/**
 * 地下水修复方案评估器 (B-38) — 类型定义（自 remediationEvaluator 拆分）
 */

export interface PRBInput {
  /** 含水层厚度 (m) */
  aquiferThickness: number;
  /** 水力梯度 */
  hydraulicGradient: number;
  /** 渗透系数 (m/d) */
  hydraulicConductivity: number;
  /** 孔隙度 */
  porosity: number;
  /** 污染羽宽度 (m) */
  plumeWidth: number;
  /** 污染物浓度 (mg/L) */
  initialConcentration: number;
  /** 目标浓度 (mg/L) */
  targetConcentration: number;
  /** 反应介质半衰期 (d) */
  mediaHalfLife: number;
  /** 反应速率常数 (1/d) */
  reactionRateConstant: number;
  /** 设计寿命 (年) */
  designLife: number;
}

export interface PRBResult {
  /** 地下水流速 (m/d) */
  groundwaterVelocity: number;
  /** 达西通量 (m/d) */
  darcyFlux: number;
  /** PRB宽度 (m) */
  prbWidth: number;
  /** PRB厚度(沿流向) (m) */
  prbThickness: number;
  /** PRB深度 (m) */
  prbDepth: number;
  /** 处理流量 (m³/d) */
  treatmentFlow: number;
  /** 停留时间 (d) */
  residenceTime: number;
  /** 出流浓度 (mg/L) */
  effluentConcentration: number;
  /** 去除率 (%) */
  removalEfficiency: number;
  /** 反应介质体积 (m³) */
  mediaVolume: number;
  /** 介质更换周期 (年) */
  replacementCycle: number;
  /** 建设投资 (万元) */
  capitalCost: number;
  /** 年运维费 (万元/年) */
  annualOcost: number;
  /** 全生命周期成本 (万元) */
  lifecycleCost: number;
}

export interface PATInput {
  /** 含水层渗透系数 (m/d) */
  hydraulicConductivity: number;
  /** 含水层厚度 (m) */
  aquiferThickness: number;
  /** 水力梯度 */
  hydraulicGradient: number;
  /** 孔隙度 */
  porosity: number;
  /** 污染羽面积 (m²) */
  plumeArea: number;
  /** 污染物浓度 (mg/L) */
  initialConcentration: number;
  /** 目标浓度 (mg/L) */
  targetConcentration: number;
  /** 单井抽水量 (m³/d) */
  pumpingRate: number;
  /** 井半径 (m) */
  wellRadius: number;
  /** 含水层压缩系数 */
  storageCoefficient: number;
  /** 设计期限 (年) */
  designPeriod: number;
}

export interface PATResult {
  /** 单井影响半径 (m) */
  influenceRadius: number;
  /** 捕获区宽度 (m) */
  captureWidth: number;
  /** 推荐井数 */
  recommendedWells: number;
  /** 总抽水量 (m³/d) */
  totalPumpingRate: number;
  /** 孔隙体积交换次数 */
  poreVolumeExchanges: number;
  /** 预测修复时间 (年) */
  estimatedRemediationTime: number;
  /** 出水浓度变化曲线 */
  concentrationCurve: { time: number; concentration: number; cumulativePV: number }[];
  /** 能否达标 */
  canAchieveTarget: boolean;
  /** 建设投资 (万元) */
  capitalCost: number;
  /** 年运维费 (万元/年) */
  annualOcost: number;
  /** 全生命周期成本 (万元) */
  lifecycleCost: number;
}

export interface MNAInput {
  /** 污染物浓度 (mg/L) */
  initialConcentration: number;
  /** 目标浓度 (mg/L) */
  targetConcentration: number;
  /** 一阶衰减速率 (1/d) */
  decayRate: number;
  /** 地下水流速 (m/d) */
  groundwaterVelocity: number;
  /** 污染源距离 (m) */
  sourceDistance: number;
  /** 孔隙度 */
  porosity: number;
  /** 含水层厚度 (m) */
  aquiferThickness: number;
  /** 渗透系数 (m/d) */
  hydraulicConductivity: number;
  /** 水力梯度 */
  hydraulicGradient: number;
  /** 监测井数 */
  monitoringWells: number;
  /** 设计期限 (年) */
  designPeriod: number;
}

export interface MNAResult {
  /** 半衰期 (d) */
  halfLife: number;
  /** 衰减到目标浓度所需时间 (年) */
  timeToTarget: number;
  /** 衰减距离 (m) */
  attenuationDistance: number;
  /** 是否在合理时间内可达标 */
  feasible: boolean;
  /** 自然衰减容量 (mg/L·m) */
  attenuationCapacity: number;
  /** 衰减曲线 */
  attenuationCurve: { distance: number; concentration: number; time: number }[];
  /** 监测频率建议 (次/年) */
  monitoringFrequency: number;
  /** 年监测成本 (万元/年) */
  annualMonitoringCost: number;
  /** 全生命周期成本 (万元) */
  lifecycleCost: number;
  /** 衰减机制贡献 */
  attenuationMechanisms: { mechanism: string; contribution: number; description: string }[];
}

export interface BioInput {
  /** 污染物浓度 (mg/L) */
  initialConcentration: number;
  /** 目标浓度 (mg/L) */
  targetConcentration: number;
  /** 含水层温度 (℃) */
  temperature: number;
  /** pH值 */
  pH: number;
  /** 溶解氧 (mg/L) */
  dissolvedOxygen: number;
  /** 硝酸盐 (mg/L) */
  nitrate: number;
  /** 硫酸盐 (mg/L) */
  sulfate: number;
  /** Fe(III) (mg/L) */
  fe3: number;
  /** TOC (mg/L) */
  toc: number;
  /** 微生物计数 (CFU/mL) */
  microbialCount: number;
  /** 含水层渗透系数 (m/d) */
  hydraulicConductivity: number;
  /** 孔隙度 */
  porosity: number;
  /** 污染羽体积 (m³) */
  plumeVolume: number;
  /** 设计期限 (年) */
  designPeriod: number;
}

export interface BioResult {
  /** 生物降解适宜性评分 (0-100) */
  suitabilityScore: number;
  /** 适宜性等级 */
  suitabilityLevel: string;
  /** 电子受体分析 */
  electronAcceptors: { acceptor: string; concentration: number; capacity: number; status: string }[];
  /** 最大降解速率 (mg/L/d) */
  maxDegradationRate: number;
  /** 预测修复时间 (年) */
  estimatedTime: number;
  /** 是否需要强化 */
  needsEnhancement: boolean;
  /** 强化建议 */
  enhancementSuggestions: string[];
  /** 营养盐需求 (kg) */
  nutrientRequirement: { nitrogen: number; phosphorus: number };
  /** 建设投资 (万元) */
  capitalCost: number;
  /** 年运维费 (万元/年) */
  annualOcost: number;
  /** 全生命周期成本 (万元) */
  lifecycleCost: number;
}

export interface ASInput {
  /** 污染物浓度 (mg/L) */
  initialConcentration: number;
  /** 目标浓度 (mg/L) */
  targetConcentration: number;
  /** 污染物亨利常数 (无量纲) */
  henryConstant: number;
  /** 含水层厚度 (m) */
  aquiferThickness: number;
  /** 渗透系数 (m/d) */
  hydraulicConductivity: number;
  /** 孔隙度 */
  porosity: number;
  /** 饱和度 */
  saturation: number;
  /** 污染羽面积 (m²) */
  plumeArea: number;
  /** 地下水埋深 (m) */
  depthToWater: number;
  /** 设计期限 (年) */
  designPeriod: number;
}

export interface ASResult {
  /** 影响半径 (m) */
  influenceRadius: number;
  /** 注气流量 (m³/min) */
  airFlowRate: number;
  /** 推荐注气井数 */
  recommendedWells: number;
  /** 井间距 (m) */
  wellSpacing: number;
  /** 注气压力 (kPa) */
  injectionPressure: number;
  /** 预测修复时间 (年) */
  estimatedTime: number;
  /** 去除率曲线 */
  removalCurve: { time: number; concentration: number; removalPercent: number }[];
  /** 能否达标 */
  canAchieveTarget: boolean;
  /** 建设投资 (万元) */
  capitalCost: number;
  /** 年运维费 (万元/年) */
  annualOcost: number;
  /** 全生命周期成本 (万元) */
  lifecycleCost: number;
}

export interface MCDAInput {
  /** 候选方案 */
  alternatives: {
    id: string;
    name: string;
    /** 各准则得分 (0-100) */
    scores: Record<string, number>;
    /** 全生命周期成本 (万元) */
    cost: number;
    /** 预计修复时间 (年) */
    remediationTime: number;
  }[];
  /** 准则权重 (和为1) */
  weights: Record<string, number>;
  /** 准则标签 */
  criteriaLabels: Record<string, string>;
}

export interface MCAResult {
  /** 综合排序 */
  ranking: {
    id: string;
    name: string;
    totalScore: number;
    rank: number;
    detailScores: Record<string, number>;
    weightedScores: Record<string, number>;
    cost: number;
    remediationTime: number;
  }[];
  /** 推荐方案 */
  recommended: string;
  /** 敏感性分析 (权重变化±20%对排序的影响) */
  sensitivityAnalysis: {
    criterion: string;
    originalRank: string[];
    increasedRank: string[];
    decreasedRank: string[];
    rankChanged: boolean;
  }[];
  /** 成本效益比 */
  costEffectiveness: { name: string; score: number; cost: number; ratio: number }[];
}

export interface RemediationPreset {
  id: string;
  name: string;
  description: string;
  contaminant: string;
  aquiferType: string;
  prb: Partial<PRBInput>;
  pat: Partial<PATInput>;
  mna: Partial<MNAInput>;
  bio: Partial<BioInput>;
  asInput: Partial<ASInput>;
}

// ============================================================
// 预设场景
// ============================================================

