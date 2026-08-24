/**
 * 地下水背景值计算 — 类型定义
 */

export interface BackgroundValueInput {
  /** 分区/采样点名称 */
  name: string;
  /** 因子名称 */
  factor: string;
  /** 单位 */
  unit: string;
  /** 样本数据 */
  samples: number[];
  /** 标准限值 (mg/L) */
  standard: number;
}


export interface BackgroundValueResult {
  name: string;
  factor: string;
  unit: string;
  n: number;
  /** 均值 */
  mean: number;
  /** 标准差 */
  std: number;
  /** 变异系数 Cv */
  cv: number;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 中位数 */
  median: number;
  /** 偏度 */
  skewness: number;
  /** 峰度 */
  kurtosis: number;
  /** 方法1：均值±2σ法背景值范围 */
  mean2SigmaRange: [number, number];
  /** 方法2：格鲁布斯检验法（剔除异常值后的背景值范围） */
  grubbsRange: [number, number];
  /** 格鲁布斯剔除的异常值数量 */
  grubbsRemoved: number;
  /** 方法3：迭代2σ法（迭代剔除后的背景值范围） */
  iterative2SigmaRange: [number, number];
  /** 迭代2σ剔除的异常值数量 */
  iterativeRemoved: number;
  /** 推荐背景值范围（三种方法综合） */
  recommendedRange: [number, number];
  /** 推荐方法 */
  recommendedMethod: string;
  /** 分布检验结论 */
  distributionNote: string;
  /** 评价说明 */
  note: string;
}


export interface ZoneCompareResult {
  /** 因子名称 */
  factor: string;
  /** 各分区统计 */
  zones: Array<{
    name: string;
    mean: number;
    std: number;
    cv: number;
    n: number;
  }>;
  /** 分区间最大差异倍数 */
  maxRatio: number;
  /** 变异系数加权平均（区间内变异） */
  avgCv: number;
  /** 分区间变异（各分区均值的标准差/总均值） */
  betweenZoneCv: number;
  /** 差异显著性（F检验近似） */
  significantDiff: boolean;
  /** 分区差异评价 */
  evaluation: string;
}


export interface ExceedanceResult {
  /** 因子名称 */
  factor: string;
  /** 标准限值 */
  standard: number;
  /** 样本数 */
  n: number;
  /** 超标样本数 */
  exceedCount: number;
  /** 超标率 (%) */
  exceedRate: number;
  /** 平均超标倍数 */
  avgExceedMultiple: number;
  /** 最大超标倍数 */
  maxExceedMultiple: number;
  /** 最大实测值 */
  maxValue: number;
  /** 污染指数 PI (均值/标准) */
  pollutionIndex: number;
  /** 超标等级 */
  grade: string;
  /** 评价 */
  note: string;
}


export interface TrendDetectionResult {
  /** 因子名称 */
  factor: string;
  /** 年份序列 */
  years: number[];
  /** 各年背景值（均值） */
  yearlyMeans: number[];
  /** 线性回归斜率 */
  slope: number;
  /** 年变化率 (%) */
  annualChangeRate: number;
  /** R² */
  r2: number;
  /** 趋势方向 */
  trend: '上升' | '下降' | '无显著趋势';
  /** 是否发生背景值偏移 */
  backgroundShift: boolean;
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

