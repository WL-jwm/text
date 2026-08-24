/**
 * 数值模型参数设计 — 类型定义
 */

export interface HydraulicParamInput {
  /** 渗透系数 K (m/d) */
  k: number;
  /** 含水层厚度 M (m) */
  thickness: number;
  /** 贮水系数 S（承压）或给水度 μ（潜水） */
  storage: number;
  /** 水力梯度 i */
  gradient: number;
  /** 孔隙率 n */
  porosity: number;
  /** 纵向弥散度 αL (m) */
  alphaL: number;
  /** 是否承压含水层 */
  isConfined: boolean;
}


export interface HydraulicParamResult {
  /** 导水系数 T = K × M (m²/d) */
  transmissivity: number;
  /** 渗透系数 K (m/d) */
  k: number;
  /** 贮水/给水 */
  storage: number;
  /** 达西流速 v = K × i / n (m/d) */
  darcyVelocity: number;
  /** 实际流速 va = K × i / n (m/d) */
  actualVelocity: number;
  /** 水力扩散系数 D = T / S (m²/d) */
  diffusivity: number;
  /** 特征长度 L (m) — 模型区域特征尺度 */
  note: string;
}


export interface GridParamInput {
  /** 模拟区域长度 (m) */
  domainLength: number;
  /** 模拟区域宽度 (m) */
  domainWidth: number;
  /** 含水层层数 */
  layers: number;
  /** 水力参数 */
  hydraulic: HydraulicParamInput;
  /** 目标网格分辨率等级 (1~5，越大网格越密) */
  resolutionLevel: number;
}


export interface GridParamResult {
  /** 建议网格尺寸 Δx (m) */
  dx: number;
  /** 建议网格尺寸 Δy (m) */
  dy: number;
  /** x方向网格数 */
  nx: number;
  /** y方向网格数 */
  ny: number;
  /** 总节点数 */
  totalNodes: number;
  /** 总单元数 */
  totalCells: number;
  /** 网格质量评价 */
  quality: string;
  /** 内存估算 (MB) */
  estimatedMemory: number;
  /** 建议 */
  suggestion: string;
}


export interface StabilityInput {
  /** 网格尺寸 Δx (m) */
  dx: number;
  /** 渗透系数 K (m/d) */
  k: number;
  /** 含水层厚度 M (m) */
  thickness: number;
  /** 贮水系数 S */
  storage: number;
  /** 孔隙率 n */
  porosity: number;
  /** 水力梯度 i */
  gradient: number;
  /** 纵向弥散度 αL (m) */
  alphaL: number;
  /** 时间步长 Δt (d) */
  dt: number;
  /** 是否显式格式 */
  isExplicit: boolean;
}


export interface StabilityResult {
  /** Courant数 Cr = v × Δt / Δx */
  courant: number;
  /** 网格Peclet数 Pe = v × Δx / D */
  peclet: number;
  /** 弥散Peclet数 Pe_d = v × Δx / (αL × v) = Δx / αL */
  pecletD: number;
  /** 数值稳定性判断 */
  isStable: boolean;
  /** 不稳定原因 */
  instabilityReason: string;
  /** 最大允许时间步长 Δt_max (d) */
  maxDt: number;
  /** 最大允许网格尺寸 Δx_max (m) */
  maxDx: number;
  /** 建议 */
  suggestion: string;
}


export interface CalibrationData {
  /** 观测值序列 */
  observed: number[];
  /** 模拟值序列 */
  simulated: number[];
}


export interface CalibrationResult {
  /** 样本数 n */
  n: number;
  /** 均方根误差 RMSE */
  rmse: number;
  /** 平均绝对误差 MAE */
  mae: number;
  /** 平均绝对百分比误差 MAPE (%) */
  mape: number;
  /** 决定系数 R² */
  r2: number;
  /** Nash-Sutcliffe效率系数 NSE */
  nse: number;
  /** 相对偏差 PBIAS (%) */
  pbias: number;
  /** 模型评价等级 */
  grade: string;
  /** 建议 */
  suggestion: string;
}


export interface TimeStepInput {
  /** 导水系数 T (m²/d) */
  transmissivity: number;
  /** 贮水系数 S */
  storage: number;
  /** 网格尺寸 Δx (m) */
  dx: number;
  /** 总模拟时间 (d) */
  totalTime: number;
  /** 求解方法（显式/隐式/Crank-Nicolson） */
  method: 'explicit' | 'implicit' | 'crank-nicolson';
}


export interface TimeStepResult {
  /** 最大稳定时间步长 Δt_max (d) */
  maxDt: number;
  /** 建议时间步长 Δt (d) */
  suggestedDt: number;
  /** 总时间步数 */
  totalSteps: number;
  /** 收敛准则（残差） */
  convergenceCriterion: number;
  /** 最大迭代次数 */
  maxIterations: number;
  /** 松弛因子 ω（SOR法） */
  relaxationFactor: number;
  /** 建议 */
  suggestion: string;
}

// ═══════════════════════════════════════════════════════
// 1. 水力参数转换
// ═══════════════════════════════════════════════════════


export interface PresetModelZone {
  name: string;
  description: string;
  hydraulic: HydraulicParamInput;
  domain: { length: number; width: number; layers: number };
  totalTime: number;
  method: 'explicit' | 'implicit' | 'crank-nicolson';
}

