/**
 * B-36 不确定性分析 — 类型定义
 */

export type DistributionType = 'normal' | 'uniform' | 'lognormal' | 'triangular';


export interface UncertainParameter {
  name: string;
  symbol: string;
  distribution: DistributionType;
  mean: number;
  stdDev: number;    // 标准差（正态/对数正态）
  min: number;       // 最小值（均匀/三角）
  max: number;       // 最大值（均匀/三角）
  mode?: number;     // 众数（三角分布）
  unit: string;
}


export interface ModelFunction {
  name: string;
  description: string;
  // 参数名 -> 值 的映射
  evaluate: (params: Record<string, number>) => number;
  paramNames: string[];
}


export interface MonteCarloResult {
  sampleSize: number;
  output: number[];
  statistics: {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    median: number;
    p5: number;
    p25: number;
    p75: number;
    p95: number;
    coefficientOfVariation: number;
    skewness: number;
    kurtosis: number;
  };
  histogram: { binStart: number; binEnd: number; count: number; frequency: number }[];
  cdf: { value: number; cumulative: number }[];
  confidenceInterval95: { lower: number; upper: number };
  confidenceInterval90: { lower: number; upper: number };
  convergenceHistory: { sampleSize: number; runningMean: number; runningStd: number }[];
}


export interface SobolResult {
  firstOrder: { parameter: string; index: number; stdError: number }[];
  totalOrder: { parameter: string; index: number; stdError: number }[];
  secondOrder: { paramA: string; paramB: string; index: number }[];
  variance: number;
  explanation: string;
}


export interface MorrisResult {
  elementaryEffects: { parameter: string; mu: number; muStar: number; sigma: number }[];
  ranking: { parameter: string; rank: number; influence: 'high' | 'medium' | 'low' }[];
}


export interface LocalSensitivityResult {
  parameter: string;
  baseValue: number;
  perturbation: number;     // 扰动量(%)
  baseOutput: number;
  perturbedOutputs: { delta: number; output: number; sensitivity: number }[];
  elasticity: number;       // 弹性系数
  normalizedSensitivity: number; // 归一化敏感度
}


export interface BootstrapResult {
  originalEstimate: number;
  bootstrapMean: number;
  bootstrapStd: number;
  bias: number;
  ci95: { lower: number; upper: number };
  ci90: { lower: number; upper: number };
  histogram: { binStart: number; binEnd: number; count: number }[];
  iterations: number;
}

// ── 随机数生成器 ──

// 简单的种子化伪随机数生成器（Mulberry32）
