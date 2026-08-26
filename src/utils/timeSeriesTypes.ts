/**
 * 时间序列分析 — 类型定义
 */

export interface TimeSeriesInput {
  /** 监测点名称 */
  name: string;
  /** 时间序列数据（年份→值） */
  data: Array<{ year: number; value: number }>;
  /** 数据类型（水位埋深/开采量/水质指数/沉降速率） */
  dataType: string;
  /** 单位 */
  unit: string;
}


export interface TrendResult {
  /** 线性回归斜率 */
  slope: number;
  /** 线性回归截距 */
  intercept: number;
  /** 年变化率 (%) */
  annualChangeRate: number;
  /** 决定系数 R² */
  r2: number;
  /** Mann-Kendall统计量 S */
  mkS: number;
  /** Mann-Kendall Z值 */
  mkZ: number;
  /** Mann-Kendall p值（近似） */
  mkP: number;
  /** 趋势方向 */
  trend: '上升' | '下降' | '无显著趋势';
  /** 显著性水平 α=0.05 */
  significant: boolean;
  /** Sen斜率 */
  senSlope: number;
  /** 趋势说明 */
  note: string;
}


export interface PeriodicityResult {
  /** 年均值 */
  mean: number;
  /** 标准差 */
  std: number;
  /** 变差系数 Cv */
  cv: number;
  /** 偏度系数 */
  skewness: number;
  /** 峰度系数 */
  kurtosis: number;
  /** 最大值 */
  max: number;
  /** 最小值 */
  min: number;
  /** 极差 */
  range: number;
  /** 年际波动评价 */
  fluctuation: string;
  /** 说明 */
  note: string;
}


export interface ChangePointResult {
  /** Pettitt检验统计量 U */
  pettittU: number;
  /** Pettitt检验 p值（近似） */
  pettittP: number;
  /** 突变年份 */
  changeYear: number | null;
  /** 突变前均值 */
  beforeMean: number;
  /** 突变后均值 */
  afterMean: number;
  /** 变化幅度 (%) */
  changeMagnitude: number;
  /** 是否存在显著突变 */
  hasChangePoint: boolean;
  /** 说明 */
  note: string;
}


export interface ForecastResult {
  /** 预测年份与值 */
  forecast: Array<{ year: number; value: number; lower: number; upper: number }>;
  /** 预测模型 */
  model: string;
  /** 模型参数 */
  parameters: string;
  /** 预测R² */
  modelR2: number;
  /** 预测说明 */
  note: string;
}


export interface AutoCorrelationResult {
  /** 滞后1~5阶自相关系数 */
  acf: Array<{ lag: number; value: number }>;
  /** 是否存在自相关 */
  hasAutoCorrelation: boolean;
  /** 说明 */
  note: string;
}


export interface TimeSeriesResult {
  name: string;
  dataType: string;
  unit: string;
  n: number;
  trend: TrendResult;
  periodicity: PeriodicityResult;
  changePoint: ChangePointResult;
  forecast: ForecastResult;
  autoCorrelation: AutoCorrelationResult;
  /** 综合结论 */
  conclusion: string;
}

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

