/**
 * B-35 地下水数值模拟 — 类型定义（自 numericalFlowSimulator 拆分）
 */

export interface GridConfig {
  rows: number;        // 行数（y方向）
  cols: number;        // 列数（x方向）
  cellSize: number;    // 网格间距 (m)
}

export type BoundaryType = 'fixed-head' | 'no-flow' | 'general-head' | 'recharge';
export type AquiferType = 'confined' | 'unconfined' | 'leaky';

export interface AquiferParams {
  type: AquiferType;
  kx: number;          // x方向渗透系数 (m/d)
  ky: number;          // y方向渗透系数 (m/d)
  thickness: number;   // 含水层厚度 (m)
  specificYield: number;  // 给水度（潜水）
  specificStorage: number; // 储水率 (1/m)（承压）
  porosity: number;    // 孔隙度
  rechargeRate: number; // 补给强度 (mm/a)
}

export interface PumpingWell {
  row: number;
  col: number;
  rate: number;        // 开采量 (m³/d)，负值
  label?: string;
}

export interface ObservationPoint {
  row: number;
  col: number;
  observedHead: number; // 观测水位 (m)
  label?: string;
}

export type BoundaryEdge = {
  north: BoundaryType;
  south: BoundaryType;
  east: BoundaryType;
  west: BoundaryType;
  northValue?: number;  // 固定水头值或通用水头值 (m)
  southValue?: number;
  eastValue?: number;
  westValue?: number;
};

export interface SimulationConfig {
  grid: GridConfig;
  aquifer: AquiferParams;
  boundary: BoundaryEdge;
  wells: PumpingWell[];
  initialHead: number;   // 初始水位 (m)
  isTransient: boolean;  // true=非稳定流, false=稳定流
  timeSteps?: number;    // 非稳定流时间步数
  dt?: number;           // 时间步长 (d)
  maxIterations: number; // 最大迭代次数
  convergenceTolerance: number; // 收敛容差 (m)
  sorFactor?: number;    // SOR松弛因子 (1.0~2.0, 默认1.5)
}

export interface SimulationResult {
  head: number[][];        // 水头矩阵 [row][col]
  drawdown: number[][];    // 降深矩阵（相对于初始/稳态）
  velocity: { vx: number; vy: number }[][]; // 达西流速
  totalPumping: number;    // 总开采量 (m³/d)
  totalRecharge: number;   // 总补给量 (m³/d)
  budgetIn: number;        // 总流入量
  budgetOut: number;       // 总流出量
  massBalanceError: number; // 水量平衡误差 (%)
  iterations: number;      // 迭代次数
  converged: boolean;      // 是否收敛
  timeSeries?: number[][][]; // 非稳定流时各时间步水头 [step][row][col]
}

export interface CalibrationResult {
  calibratedKx: number;
  calibratedKy: number;
  calibratedRecharge: number;
  rmse: number;           // 均方根误差
  mae: number;            // 平均绝对误差
  rSquared: number;       // 决定系数 R²
  iterations: number;
  converged: boolean;
  observedVsComputed: { observed: number; computed: number; residual: number; label?: string }[];
}

export interface ScenarioPrediction {
  scenarioName: string;
  result: SimulationResult;
  maxDrawdown: number;     // 最大降深 (m)
  avgDrawdown: number;     // 平均降深 (m)
  drawdownArea: number;    // 降深>0.5m的面积 (km²)
  wellInterference: number; // 井间干扰系数
  coneOfInfluence: number;  // 影响半径 (m)
}

// ── 核心求解器 ──

/**
 * 有限差分稳定流求解（Gauss-Seidel + SOR）
 *
 * 离散方程：
 *   对内部节点(i,j):
 *   C_L*h[i,j-1] + C_R*h[i,j+1] + C_T*h[i-1,j] + C_B*h[i+1,j] - C_C*h[i,j] = Q[i,j]
 *
 *   其中 C = 导水系数 / 间距²
 */
