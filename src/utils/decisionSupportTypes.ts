/**
 * B-32 决策支持引擎 — 类型定义
 * 水资源配置/压采/生态/预警/综合决策 各模块的输入输出类型
 */

export interface WaterSource {
  id: string;
  name: string;
  /** 可供水量 (万m³/yr) */
  supply: number;
  /** 单方水成本 (元/m³) */
  cost: number;
  /** 水质等级 (Ⅰ-Ⅴ) */
  quality: number;
}


export interface WaterUser {
  id: string;
  name: string;
  /** 需水量 (万m³/yr) */
  demand: number;
  /** 最低供水保障 (万m³/yr) */
  minSupply: number;
  /** 用户优先级 (1=最高, 5=最低) */
  priority: number;
  /** 可接受的水质等级上限 (1=Ⅰ类, 5=Ⅴ类) */
  maxQuality: number;
}


export interface AllocationResult {
  /** 分配矩阵 [source][user] = 水量 */
  allocation: { source: string; user: string; volume: number; cost: number }[];
  /** 各水源剩余水量 */
  sourceRemainder: { source: string; remainder: number; utilization: number }[];
  /** 各用户满足率 */
  userSatisfaction: { user: string; allocated: number; demand: number; satisfaction: number }[];
  /** 总供水量 */
  totalAllocated: number;
  /** 总成本 */
  totalCost: number;
  /** 总需求 */
  totalDemand: number;
  /** 整体满足率 */
  overallSatisfaction: number;
  /** 优化说明 */
  notes: string[];
}


export interface ReductionPlan {
  /** 阶段名称 */
  phase: string;
  /** 年份范围 */
  yearRange: string;
  /** 当前开采量 (万m³/yr) */
  currentExtraction: number;
  /** 目标开采量 (万m³/yr) */
  targetExtraction: number;
  /** 替代水源供水量 (万m³/yr) */
  alternativeSupply: number;
  /** 替代水源类型 */
  alternativeTypes: string[];
  /** 单方替代成本 (元/m³) */
  alternativeCost: number;
  /** 生态补水量的影响 */
  ecologicalWater: number;
}


export interface ReductionResult {
  /** 各阶段压采量 */
  phaseResults: {
    phase: string;
    yearRange: string;
    reduction: number;
    reductionRate: number;
    alternativeVolume: number;
    alternativeCost: number;
    gap: number;
    ecologicalBenefit: number;
    assessment: string;
  }[];
  /** 总压采量 */
  totalReduction: number;
  /** 总压采率 */
  totalReductionRate: number;
  /** 总替代水量 */
  totalAlternative: number;
  /** 总替代成本 */
  totalAlternativeCost: number;
  /** 总缺口 */
  totalGap: number;
  /** 生态效益评分 */
  ecologicalScore: number;
  /** 经济可行性评分 */
  economicScore: number;
  /** 综合评分 */
  overallScore: number;
  /** 建议 */
  recommendations: string[];
}


export interface EcoLevelInput {
  /** 生态水位埋深阈值 (m) — 超过此值视为不达标 */
  thresholdDepth: number;
  /** 当前水位埋深 (m) */
  currentDepth: number;
  /** 目标水位埋深 (m) */
  targetDepth: number;
  /** 监测井数 */
  monitoringWells: number;
  /** 当前达标井数 */
  compliantWells: number;
  /** 年均回补量 (万m³/yr) */
  annualRecharge: number;
  /** 年均开采量 (万m³/yr) */
  annualExtraction: number;
  /** 含水层类型 */
  aquiferType: '浅层' | '深层';
}


export interface EcoLevelResult {
  /** 达标率 */
  complianceRate: number;
  /** 水位差距 */
  depthGap: number;
  /** 回补-开采比 */
  rechargeExtractionRatio: number;
  /** 达标预测年限 */
  estimatedYears: number;
  /** 保障措施评分 */
  measureScore: number;
  /** 综合保障评分 */
  overallScore: number;
  /** 保障等级 */
  level: string;
  /** 保障措施建议 */
  measures: { measure: string; priority: string; effect: string; timeline: string }[];
  /** 评价详情 */
  details: { indicator: string; value: string; score: number; assessment: string }[];
}


export interface WarningInput {
  /** 当前水位埋深 (m) */
  currentDepth: number;
  /** 警戒水位埋深 (m) — 黄色预警 */
  yellowThreshold: number;
  /** 红色预警水位埋深 (m) */
  redThreshold: number;
  /** 极限水位埋深 (m) — 紧急预警 */
  emergencyThreshold: number;
  /** 水位月变化率 (m/月) */
  monthlyChangeRate: number;
  /** Cl⁻浓度 (mg/L) */
  chloride: number;
  /** Cl⁻月变化率 (mg/L/月) */
  chlorideRate: number;
  /** 区域开采状态 */
  extractionStatus: '正常' | '超采' | '严重超采';
}


export interface WarningResult {
  /** 水位预警等级 */
  waterLevelWarning: '蓝色' | '黄色' | '橙色' | '红色';
  /** 水质预警等级 */
  waterQualityWarning: '蓝色' | '黄色' | '橙色' | '红色';
  /** 综合预警等级 */
  overallWarning: '蓝色' | '黄色' | '橙色' | '红色';
  /** 预警信号 */
  warningSignal: string;
  /** 响应措施 */
  responseMeasures: { level: string; measure: string; responsible: string; timeline: string }[];
  /** 评价详情 */
  details: { indicator: string; value: string; warning: string; assessment: string }[];
}


export interface DecisionOption {
  /** 方案名称 */
  name: string;
  /** 方案描述 */
  description: string;
  /** 水资源保障率 (%) */
  waterSecurity: number;
  /** 生态效益评分 (0-100) */
  ecologicalBenefit: number;
  /** 经济可行性评分 (0-100) */
  economicFeasibility: number;
  /** 技术可行性评分 (0-100) */
  technicalFeasibility: number;
  /** 社会可接受度 (0-100) */
  socialAcceptance: number;
  /** 实施周期 (年) */
  implementationPeriod: number;
  /** 投资估算 (万元) */
  investment: number;
}


export interface DecisionResult {
  /** 方案排序 */
  rankedOptions: {
    name: string;
    description: string;
    scores: { criterion: string; score: number; weight: number }[];
    totalScore: number;
    rank: number;
    investment: number;
    period: number;
    recommendation: string;
  }[];
  /** 最优方案 */
  bestOption: string;
  /** 权重说明 */
  weights: { criterion: string; weight: number; description: string }[];
  /** 综合建议 */
  recommendations: string[];
}

