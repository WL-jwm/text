/**
 * 水质数据挖掘 — 类型定义（自 dataMiningCalculator 拆分）
 */

export interface WaterQualitySample {
  id: string;
  location: string;
  /** pH值 */
  pH: number;
  /** 总硬度 mg/L */
  totalHardness: number;
  /** 矿化度 mg/L */
  tds: number;
  /** 氯离子 mg/L */
  chloride: number;
  /** 硫酸根 mg/L */
  sulfate: number;
  /** 重碳酸根 mg/L */
  bicarbonate: number;
  /** 钠离子 mg/L */
  sodium: number;
  /** 钙离子 mg/L */
  calcium: number;
  /** 镁离子 mg/L */
  magnesium: number;
  /** 铁离子 mg/L */
  iron: number;
  /** 氟离子 mg/L */
  fluoride: number;
  /** 硝酸盐 mg/L */
  nitrate: number;
  /** 氨氮 mg/L */
  ammonia: number;
}

export interface KMeansResult {
  /** 聚类中心 */
  centroids: number[][];
  /** 每个样本的聚类标签 */
  labels: number[];
  /** 每簇样本数 */
  clusterSizes: number[];
  /** 簇内平方和 */
  inertia: number;
  /** 迭代次数 */
  iterations: number;
  /** 簇特征摘要 */
  clusterSummary: {
    clusterId: number;
    size: number;
    avgPH: number;
    avgTDS: number;
    avgHardness: number;
    avgChloride: number;
    avgSulfate: number;
    avgNitrate: number;
    avgFluoride: number;
    /** 水质类型判定 */
    waterType: string;
    /** 水质等级 */
    qualityGrade: string;
  }[];
}

export interface PCAResult {
  /** 主成分数量 */
  nComponents: number;
  /** 特征值 */
  eigenvalues: number[];
  /** 方差贡献率 */
  explainedVarianceRatio: number[];
  /** 累计贡献率 */
  cumulativeVariance: number[];
  /** 主成分载荷矩阵 */
  loadings: number[][];
  /** 主成分得分 */
  scores: number[][];
  /** 指标名称 */
  featureNames: string[];
  /** 主成分解释 */
  componentInterpretation: { component: string; topFeatures: { name: string; loading: number }[]; interpretation: string }[];
}

export interface AssociationRule {
  /** 前项 */
  antecedent: string[];
  /** 后项 */
  consequent: string[];
  /** 支持度 */
  support: number;
  /** 置信度 */
  confidence: number;
  /** 提升度 */
  lift: number;
  /** 规则描述 */
  description: string;
}

export interface AnomalyResult {
  /** 样本ID */
  sampleId: string;
  /** 位置 */
  location: string;
  /** Mahalanobis距离 */
  mahalanobisDist: number;
  /** 是否异常 */
  isAnomaly: boolean;
  /** 异常指标 */
  anomalousFeatures: { feature: string; value: number; mean: number; std: number; zScore: number }[];
  /** 异常等级 */
  anomalyLevel: 'normal' | 'mild' | 'moderate' | 'severe';
}

// ═══════════════════════════════════════════════════════════════
// 数学工具函数
// ═══════════════════════════════════════════════════════════════

