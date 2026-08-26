/**
 * 空间统计分析 — 类型定义
 */

export interface SpatialPoint {
  /** 点名称 */
  name: string;
  /** X坐标 (km) */
  x: number;
  /** Y坐标 (km) */
  y: number;
  /** 属性值 */
  value: number;
}


export interface MoranIInput {
  /** 空间点集 */
  points: SpatialPoint[];
  /** 空间权重矩阵类型 */
  weightType: 'inverse' | 'distance' | 'binary';
  /** 二值矩阵的距离阈值 (km) */
  distanceBand: number;
}


export interface MoranIResult {
  /** 全局Moran's I */
  moranI: number;
  /** 期望值 E[I] = -1/(n-1) */
  expectedI: number;
  /** 方差 Var[I] */
  variance: number;
  /** Z得分 */
  zScore: number;
  /** p值（近似） */
  pValue: number;
  /** 空间分布模式 */
  pattern: '聚集' | '随机' | '离散';
  /** 显著性 */
  significant: boolean;
  /** 说明 */
  note: string;
}


export interface LocalMoranResult {
  /** 点名称 */
  name: string;
  /** 局部Moran's I_i */
  localI: number;
  /** Z_i 得分 */
  zScore: number;
  /** 象限分类（HH/LL/HL/LH） */
  quadrant: string;
  /** 是否显著 */
  significant: boolean;
  /** 点坐标 */
  x: number;
  y: number;
  /** 值 */
  value: number;
}


export interface VariogramInput {
  /** 空间点集 */
  points: SpatialPoint[];
  /** 模型类型 */
  model: 'spherical' | 'exponential' | 'gaussian';
  /** 滞后组数 */
  lagCount: number;
}


export interface VariogramPoint {
  /** 滞后距离 */
  lag: number;
  /** 实验半变异值 */
  gamma: number;
  /** 点对数 */
  pairs: number;
}


export interface VariogramResult {
  /** 实验半变异函数点 */
  experimental: VariogramPoint[];
  /** 块金值 C0 */
  nugget: number;
  /** 基台值 C0+C */
  sill: number;
  /** 结构方差 C */
  structureVariance: number;
  /** 变程 a (km) */
  range: number;
  /** 块金效应比 C0/(C0+C) */
  nuggetRatio: number;
  /** 空间自相关强度评价 */
  spatialCorrelation: string;
  /** 拟合模型 */
  model: string;
  /** 理论半变异函数值 */
  theoretical: Array<{ lag: number; gamma: number }>;
  /** 说明 */
  note: string;
}


export interface CrossValidationResult {
  /** 交叉验证点 */
  points: Array<{ name: string; actual: number; predicted: number; error: number; stdError: number }>;
  /** 平均误差 ME */
  me: number;
  /** 均方根误差 RMSE */
  rmse: number;
  /** 平均绝对误差 MAE */
  mae: number;
  /** 标准化均方根误差 */
  standardizedRMSE: number;
  /** 插值精度等级 */
  accuracy: string;
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

