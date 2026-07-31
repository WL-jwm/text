/**
 * B-35 地下水数值模拟与校准器 — 计算引擎
 *
 * 核心算法：
 *  1. 有限差分网格（规则网格，支持变间距）
 *  2. 地下水流方程求解（Gauss-Seidel迭代 + SOR加速）
 *  3. 稳定流/非稳定流模拟
 *  4. 反演校准（观测水位→渗透系数/补给量反推）
 *  5. 情景预测（不同开采方案下水位响应）
 *
 * 水流方程（二维承压含水层，非稳定流）：
 *   ∂/∂x(T_x ∂h/∂x) + ∂/∂y(T_y ∂h/∂y) + W = S ∂h/∂t
 *
 * 有限差分离散（节点 i,j）：
 *   T_x[i,j-1](h[i,j-1]-h[i,j]) + T_x[i,j](h[i,j+1]-h[i,j])
 *   + T_y[i-1,j](h[i-1,j]-h[i,j]) + T_y[i,j](h[i,j+1]-h[i,j])
 *   + Q[i,j] + R[i,j]*Δx*Δy = S[i,j]*Δx*Δy*(h_new-h_old)/Δt
 *
 * 稳定流时 S 项为 0，简化为：
 *   T_x * (h_left - 2*h_center + h_right)/Δx² + T_y * (h_top - 2*h_center + h_bottom)/Δy² + W = 0
 */

// ── 类型定义 ──

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
export function solveSteadyFlow(config: SimulationConfig): SimulationResult {
  const { grid, aquifer, boundary, wells, initialHead, maxIterations, convergenceTolerance } = config;
  const sor = config.sorFactor ?? 1.5;
  const { rows, cols, cellSize } = grid;

  // 导水系数
  const Tx = aquifer.type === 'unconfined'
    ? aquifer.kx * initialHead  // 潜水近似用初始水深
    : aquifer.kx * aquifer.thickness;
  const Ty = aquifer.type === 'unconfined'
    ? aquifer.ky * initialHead
    : aquifer.ky * aquifer.thickness;

  // 导水系数（节点间调和平均）
  const conductance = cellSize * cellSize; // Δx * Δy

  // 初始化水头矩阵
  const head: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(initialHead)
  );

  // 初始化降深矩阵
  const drawdown: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );

  // 设置井点源/汇
  const sourceSink: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );

  // 补给量（转换为 m³/d）
  const rechargePerCell = (aquifer.rechargeRate / 1000 / 365) * conductance; // mm/a → m/d × area

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      sourceSink[i][j] += rechargePerCell;
    }
  }

  // 井的开采量（负值=抽水）
  for (const well of wells) {
    if (well.row >= 0 && well.row < rows && well.col >= 0 && well.col < cols) {
      sourceSink[well.row][well.col] += well.rate; // rate为负值表示开采
    }
  }

  // 设置边界条件
  const applyBoundary = (h: number[][]) => {
    for (let j = 0; j < cols; j++) {
      // 北边界 (row=0)
      if (boundary.north === 'fixed-head' && boundary.northValue !== undefined) {
        h[0][j] = boundary.northValue;
      } else if (boundary.north === 'no-flow') {
        h[0][j] = h[1][j]; // 镜像
      }
      // 南边界 (row=rows-1)
      if (boundary.south === 'fixed-head' && boundary.southValue !== undefined) {
        h[rows - 1][j] = boundary.southValue;
      } else if (boundary.south === 'no-flow') {
        h[rows - 1][j] = h[rows - 2][j];
      }
    }
    for (let i = 0; i < rows; i++) {
      // 西边界 (col=0)
      if (boundary.west === 'fixed-head' && boundary.westValue !== undefined) {
        h[i][0] = boundary.westValue;
      } else if (boundary.west === 'no-flow') {
        h[i][0] = h[i][1];
      }
      // 东边界 (col=cols-1)
      if (boundary.east === 'fixed-head' && boundary.eastValue !== undefined) {
        h[i][cols - 1] = boundary.eastValue;
      } else if (boundary.east === 'no-flow') {
        h[i][cols - 1] = h[i][cols - 2];
      }
    }
  };

  // 迭代求解
  let iter = 0;
  let maxDiff = Infinity;
  let converged = false;

  applyBoundary(head);

  while (iter < maxIterations && maxDiff > convergenceTolerance) {
    maxDiff = 0;
    for (let i = 1; i < rows - 1; i++) {
      for (let j = 1; j < cols - 1; j++) {
        // 跳过固定水头边界
        const isBoundaryFixed =
          (i === 0 && boundary.north === 'fixed-head') ||
          (i === rows - 1 && boundary.south === 'fixed-head') ||
          (j === 0 && boundary.west === 'fixed-head') ||
          (j === cols - 1 && boundary.east === 'fixed-head');
        if (isBoundaryFixed) continue;

        // 导水系数（四个方向的调和平均）
        const C_left = (2 * Tx * Tx) / (Tx + Tx) / (cellSize * cellSize) * conductance;
        const C_right = C_left;
        const C_top = (2 * Ty * Ty) / (Ty + Ty) / (cellSize * cellSize) * conductance;
        const C_bottom = C_top;
        const C_center = C_left + C_right + C_top + C_bottom;

        // Gauss-Seidel + SOR
        const h_old = head[i][j];
        const h_new =
          (C_left * head[i][j - 1] +
            C_right * head[i][j + 1] +
            C_top * head[i - 1][j] +
            C_bottom * head[i + 1][j] +
            sourceSink[i][j]) /
          C_center;

        const h_sor = h_old + sor * (h_new - h_old);
        const diff = Math.abs(h_sor - h_old);
        if (diff > maxDiff) maxDiff = diff;
        head[i][j] = h_sor;
      }
    }
    applyBoundary(head);
    iter++;
  }

  converged = maxDiff <= convergenceTolerance;

  // 计算降深
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      drawdown[i][j] = initialHead - head[i][j];
    }
  }

  // 计算达西流速
  const velocity: { vx: number; vy: number }[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ vx: 0, vy: 0 }))
  );

  for (let i = 1; i < rows - 1; i++) {
    for (let j = 1; j < cols - 1; j++) {
      velocity[i][j].vx = (-aquifer.kx * (head[i][j + 1] - head[i][j - 1])) / (2 * cellSize);
      velocity[i][j].vy = (-aquifer.ky * (head[i + 1][j] - head[i - 1][j])) / (2 * cellSize);
    }
  }

  // 水量平衡
  let budgetIn = 0;
  let budgetOut = 0;
  const totalPumping = wells.reduce((sum, w) => sum + Math.abs(w.rate), 0);
  const totalRecharge = rechargePerCell * rows * cols;

  // 边界通量计算（简化）
  for (let j = 0; j < cols; j++) {
    // 北边和南边
    const fluxN = Math.abs(Tx * (head[1][j] - head[0][j]) / cellSize * cellSize);
    const fluxS = Math.abs(Tx * (head[rows - 1][j] - head[rows - 2][j]) / cellSize * cellSize);
    if (head[1][j] > head[0][j]) budgetIn += fluxN; else budgetOut += fluxN;
    if (head[rows - 2][j] > head[rows - 1][j]) budgetIn += fluxS; else budgetOut += fluxS;
  }
  for (let i = 0; i < rows; i++) {
    const fluxW = Math.abs(Ty * (head[i][1] - head[i][0]) / cellSize * cellSize);
    const fluxE = Math.abs(Ty * (head[i][cols - 1] - head[i][cols - 2]) / cellSize * cellSize);
    if (head[i][1] > head[i][0]) budgetIn += fluxW; else budgetOut += fluxW;
    if (head[i][cols - 2] > head[i][cols - 1]) budgetIn += fluxE; else budgetOut += fluxE;
  }

  budgetIn += totalRecharge;
  budgetOut += totalPumping;
  const massBalanceError = budgetIn > 0
    ? Math.abs(budgetIn - budgetOut) / budgetIn * 100
    : 0;

  return {
    head,
    drawdown,
    velocity,
    totalPumping,
    totalRecharge,
    budgetIn,
    budgetOut,
    massBalanceError,
    iterations: iter,
    converged,
  };
}

/**
 * 非稳定流求解（隐式差分 + Gauss-Seidel）
 *
 * h_new[i,j] = h_old[i,j] + Δt/S * [T_x(h_left - 2h_center + h_right)/Δx² + T_y(h_top - 2h_center + h_bottom)/Δy² + W]
 */
export function solveTransientFlow(config: SimulationConfig): SimulationResult {
  const { grid, aquifer, boundary, wells, initialHead, maxIterations, convergenceTolerance } = config;
  const sor = config.sorFactor ?? 1.5;
  const { rows, cols, cellSize } = grid;
  const timeSteps = config.timeSteps ?? 12;
  const dt = config.dt ?? 30; // 默认30天

  const Tx = aquifer.type === 'unconfined'
    ? aquifer.kx * initialHead
    : aquifer.kx * aquifer.thickness;
  const Ty = aquifer.type === 'unconfined'
    ? aquifer.ky * initialHead
    : aquifer.ky * aquifer.thickness;

  // 储水系数
  const S = aquifer.type === 'unconfined'
    ? aquifer.specificYield
    : aquifer.specificStorage * aquifer.thickness;

  const conductance = cellSize * cellSize;
  const rechargePerCell = (aquifer.rechargeRate / 1000 / 365) * conductance;

  // 初始化
  const head: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(initialHead)
  );
  const headOld: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(initialHead)
  );
  const drawdown: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );

  const sourceSink: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      sourceSink[i][j] += rechargePerCell;
    }
  }
  for (const well of wells) {
    if (well.row >= 0 && well.row < rows && well.col >= 0 && well.col < cols) {
      sourceSink[well.row][well.col] += well.rate;
    }
  }

  // 时间序列存储
  const timeSeries: number[][][] = [];

  const applyBoundary = (h: number[][]) => {
    for (let j = 0; j < cols; j++) {
      if (boundary.north === 'fixed-head' && boundary.northValue !== undefined) h[0][j] = boundary.northValue;
      else if (boundary.north === 'no-flow') h[0][j] = h[1][j];
      if (boundary.south === 'fixed-head' && boundary.southValue !== undefined) h[rows - 1][j] = boundary.southValue;
      else if (boundary.south === 'no-flow') h[rows - 1][j] = h[rows - 2][j];
    }
    for (let i = 0; i < rows; i++) {
      if (boundary.west === 'fixed-head' && boundary.westValue !== undefined) h[i][0] = boundary.westValue;
      else if (boundary.west === 'no-flow') h[i][0] = h[i][1];
      if (boundary.east === 'fixed-head' && boundary.eastValue !== undefined) h[i][cols - 1] = boundary.eastValue;
      else if (boundary.east === 'no-flow') h[i][cols - 1] = h[i][cols - 2];
    }
  };

  // 系数
  const Cr = Tx * dt / (cellSize * cellSize * S); // x方向
  const Cd = Ty * dt / (cellSize * cellSize * S); // y方向
  const Cs = 1 + 2 * Cr + 2 * Cd; // 中心系数

  let totalIter = 0;
  let converged = true;

  applyBoundary(head);
  applyBoundary(headOld);

  for (let step = 0; step < timeSteps; step++) {
    // 复制当前为旧值
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        headOld[i][j] = head[i][j];
      }
    }

    // 内迭代
    let stepIter = 0;
    let maxDiff = Infinity;

    while (stepIter < maxIterations && maxDiff > convergenceTolerance) {
      maxDiff = 0;
      for (let i = 1; i < rows - 1; i++) {
        for (let j = 1; j < cols - 1; j++) {
          const h_old = head[i][j];
          const h_new =
            (Cr * head[i][j - 1] +
              Cr * head[i][j + 1] +
              Cd * head[i - 1][j] +
              Cd * head[i + 1][j] +
              headOld[i][j] +
              (dt / (S * conductance)) * sourceSink[i][j] * conductance) /
            Cs;

          const h_sor = h_old + sor * (h_new - h_old);
          const diff = Math.abs(h_sor - h_old);
          if (diff > maxDiff) maxDiff = diff;
          head[i][j] = h_sor;
        }
      }
      applyBoundary(head);
      stepIter++;
    }
    totalIter += stepIter;
    if (maxDiff > convergenceTolerance) converged = false;

    // 保存时间步快照
    if (step === timeSteps - 1 || step % Math.max(1, Math.floor(timeSteps / 6)) === 0) {
      timeSeries.push(head.map(r => [...r]));
    }
  }

  // 最终降深
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      drawdown[i][j] = initialHead - head[i][j];
    }
  }

  // 达西流速
  const velocity: { vx: number; vy: number }[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ vx: 0, vy: 0 }))
  );
  for (let i = 1; i < rows - 1; i++) {
    for (let j = 1; j < cols - 1; j++) {
      velocity[i][j].vx = (-aquifer.kx * (head[i][j + 1] - head[i][j - 1])) / (2 * cellSize);
      velocity[i][j].vy = (-aquifer.ky * (head[i + 1][j] - head[i - 1][j])) / (2 * cellSize);
    }
  }

  const totalPumping = wells.reduce((sum, w) => sum + Math.abs(w.rate), 0);
  const totalRecharge = rechargePerCell * rows * cols;

  return {
    head,
    drawdown,
    velocity,
    totalPumping,
    totalRecharge,
    budgetIn: totalRecharge,
    budgetOut: totalPumping,
    massBalanceError: Math.abs(totalRecharge - totalPumping) / Math.max(totalRecharge, 1) * 100,
    iterations: totalIter,
    converged,
    timeSeries,
  };
}

// ── 反演校准 ──

/**
 * 参数反演校准
 * 基于观测水位反推渗透系数和补给量
 * 方法：迭代修正（类似PEST的Gauss-Marquardt简化版）
 */
export function calibrateParameters(
  config: SimulationConfig,
  observations: ObservationPoint[],
  maxOuterIter = 50,
): CalibrationResult {
  const { grid, aquifer } = config;
  const { rows, cols } = grid;

  let kx = aquifer.kx;
  let ky = aquifer.ky;
  let recharge = aquifer.rechargeRate;
  let bestRmse = Infinity;
  let bestKx = kx, bestKy = ky, bestRecharge = recharge;
  let converged = false;

  const stepSize = { kx: 0.1, ky: 0.1, recharge: 5 };

  for (let outer = 0; outer < maxOuterIter; outer++) {
    // 用当前参数运行模拟
    const testConfig: SimulationConfig = {
      ...config,
      aquifer: { ...aquifer, kx, ky, rechargeRate: recharge },
    };

    const result = solveSteadyFlow(testConfig);

    // 计算残差
    const obsComputed: { observed: number; computed: number; residual: number; label?: string }[] = [];
    let sumSqError = 0;

    for (const obs of observations) {
      if (obs.row >= 0 && obs.row < rows && obs.col >= 0 && obs.col < cols) {
        const computed = result.head[obs.row][obs.col];
        const residual = computed - obs.observedHead;
        obsComputed.push({
          observed: obs.observedHead,
          computed,
          residual,
          label: obs.label,
        });
        sumSqError += residual * residual;
      }
    }

    const rmse = Math.sqrt(sumSqError / observations.length);

    if (rmse < bestRmse) {
      bestRmse = rmse;
      bestKx = kx;
      bestKy = ky;
      bestRecharge = recharge;
    }

    // 收敛判断
    if (rmse < 0.5) { // 0.5m 容差
      converged = true;
      break;
    }

    // 梯度估计 + 参数更新
    // 计算每个参数的扰动影响
    const perturbations: { param: 'kx' | 'ky' | 'recharge'; delta: number; rmseChange: number }[] = [];

    for (const param of ['kx', 'ky', 'recharge'] as const) {
      const delta = param === 'recharge' ? stepSize.recharge : stepSize[param];
      const testParams = { kx, ky, rechargeRate: recharge };
      testParams[param] += delta;

      const perturbConfig: SimulationConfig = {
        ...config,
        aquifer: { ...aquifer, ...testParams },
      };
      const perturbResult = solveSteadyFlow(perturbConfig);

      let perturbSqError = 0;
      for (const obs of observations) {
        if (obs.row >= 0 && obs.row < rows && obs.col >= 0 && obs.col < cols) {
          const perturbComputed = perturbResult.head[obs.row][obs.col];
          perturbSqError += (perturbComputed - obs.observedHead) ** 2;
        }
      }
      const perturbRmse = Math.sqrt(perturbSqError / observations.length);
      perturbations.push({ param, delta, rmseChange: perturbRmse - rmse });
    }

    // 沿最陡下降方向更新
    for (const p of perturbations) {
      if (p.rmseChange < -0.01) {
        // 该方向降低误差，增大步长
        if (p.param === 'recharge') {
          recharge = Math.max(0, recharge - stepSize.recharge * 2);
        } else {
          const newVal = Math.max(0.001, (p.param === 'kx' ? kx : ky) - stepSize[p.param] * 2);
          if (p.param === 'kx') kx = newVal;
          else ky = newVal;
        }
      } else if (p.rmseChange > 0.01) {
        // 反方向
        if (p.param === 'recharge') {
          recharge = recharge + stepSize.recharge;
        } else {
          const newVal = (p.param === 'kx' ? kx : ky) + stepSize[p.param];
          if (p.param === 'kx') kx = newVal;
          else ky = newVal;
        }
      }
    }

    // 衰减步长
    stepSize.kx *= 0.95;
    stepSize.ky *= 0.95;
    stepSize.recharge *= 0.95;
  }

  // 用最佳参数计算最终统计
  const finalConfig: SimulationConfig = {
    ...config,
    aquifer: { ...aquifer, kx: bestKx, ky: bestKy, rechargeRate: bestRecharge },
  };
  const finalResult = solveSteadyFlow(finalConfig);

  const obsComputed: { observed: number; computed: number; residual: number; label?: string }[] = [];
  let sumSqError = 0, sumAbsError = 0;
  for (const obs of observations) {
    if (obs.row >= 0 && obs.row < rows && obs.col >= 0 && obs.col < cols) {
      const computed = finalResult.head[obs.row][obs.col];
      const residual = computed - obs.observedHead;
      obsComputed.push({ observed: obs.observedHead, computed, residual, label: obs.label });
      sumSqError += residual * residual;
      sumAbsError += Math.abs(residual);
    }
  }
  const finalRmse = Math.sqrt(sumSqError / observations.length);
  const finalMae = sumAbsError / observations.length;
  const obsMean = observations.reduce((s, o) => s + o.observedHead, 0) / observations.length;
  let ssTot = 0, ssRes = 0;
  for (const oc of obsComputed) {
    ssTot += (oc.observed - obsMean) ** 2;
    ssRes += oc.residual ** 2;
  }
  const finalR2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return {
    calibratedKx: bestKx,
    calibratedKy: bestKy,
    calibratedRecharge: bestRecharge,
    rmse: finalRmse,
    mae: finalMae,
    rSquared: finalR2,
    iterations: maxOuterIter,
    converged,
    observedVsComputed: obsComputed,
  };
}

// ── 情景预测 ──

export function predictScenarios(
  baseConfig: SimulationConfig,
  scenarios: { name: string; wells: PumpingWell[]; rechargeRate?: number; description?: string }[],
): ScenarioPrediction[] {
  return scenarios.map(scenario => {
    const scenarioConfig: SimulationConfig = {
      ...baseConfig,
      wells: scenario.wells,
      aquifer: scenario.rechargeRate !== undefined
        ? { ...baseConfig.aquifer, rechargeRate: scenario.rechargeRate }
        : baseConfig.aquifer,
    };

    const result = solveSteadyFlow(scenarioConfig);
    const { rows, cols, cellSize } = baseConfig.grid;

    // 统计降深
    let maxDrawdown = 0;
    let sumDrawdown = 0;
    let drawdownCells = 0;
    const totalCells = rows * cols;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const dd = Math.abs(result.drawdown[i][j]);
        if (dd > maxDrawdown) maxDrawdown = dd;
        sumDrawdown += dd;
        if (dd > 0.5) drawdownCells++;
      }
    }

    const avgDrawdown = sumDrawdown / totalCells;
    const drawdownArea = (drawdownCells * cellSize * cellSize) / 1_000_000; // → km²

    // 井间干扰系数（多井叠加影响 vs 单井独立影响之和）
    let wellInterference = 0;
    if (scenario.wells.length > 1) {
      const singleWellResults = scenario.wells.map(w => {
        const singleConfig = { ...baseConfig, wells: [w] };
        return solveSteadyFlow(singleConfig);
      });

      const overlapDrawdown = scenario.wells.reduce((sum, w, idx) => {
        const single = singleWellResults[idx].drawdown[w.row][w.col];
        const combined = result.drawdown[w.row][w.col];
        return sum + (combined - single);
      }, 0);
      wellInterference = overlapDrawdown / scenario.wells.length;
    }

    // 影响半径（降深>0.01m的范围等效半径）
    const coneOfInfluence = Math.sqrt(drawdownCells * cellSize * cellSize / Math.PI);

    return {
      scenarioName: scenario.name,
      result,
      maxDrawdown,
      avgDrawdown,
      drawdownArea,
      wellInterference,
      coneOfInfluence,
    };
  });
}

// ── 预设数据 ──

export const PRESET_MODEL_AREAS = [
  {
    id: 'taihang-piedmont',
    name: '太行山前冲洪积扇（保定平原）',
    description: '第四系松散岩类孔隙水，冲洪积扇中上部，含水层厚30-80m',
    grid: { rows: 20, cols: 25, cellSize: 500 },
    aquifer: {
      type: 'unconfined' as AquiferType,
      kx: 25, ky: 20, thickness: 45,
      specificYield: 0.18, specificStorage: 1e-5,
      porosity: 0.28, rechargeRate: 120,
    },
    boundary: {
      north: 'fixed-head' as BoundaryType, northValue: 45,
      south: 'fixed-head' as BoundaryType, southValue: 28,
      east: 'no-flow' as BoundaryType,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 36,
    wells: [
      { row: 10, col: 8, rate: -800, label: '水源地A' },
      { row: 12, col: 14, rate: -600, label: '水源地B' },
      { row: 8, col: 18, rate: -500, label: '水源地C' },
    ] as PumpingWell[],
  },
  {
    id: 'hebei-plain-central',
    name: '河北平原中部（衡水深层水）',
    description: '深层承压水，第三系明化镇组，含水层厚60-120m，超采严重',
    grid: { rows: 18, cols: 22, cellSize: 800 },
    aquifer: {
      type: 'confined' as AquiferType,
      kx: 8, ky: 6, thickness: 85,
      specificYield: 0.0001, specificStorage: 5e-6,
      porosity: 0.22, rechargeRate: 5,
    },
    boundary: {
      north: 'fixed-head' as BoundaryType, northValue: 0,
      south: 'no-flow' as BoundaryType,
      east: 'no-flow' as BoundaryType,
      west: 'fixed-head' as BoundaryType, westValue: -5,
    },
    initialHead: -15,
    wells: [
      { row: 9, col: 10, rate: -2000, label: '集中开采区' },
      { row: 6, col: 5, rate: -1200, label: '工业水源' },
      { row: 12, col: 16, rate: -1500, label: '农业水源' },
    ] as PumpingWell[],
  },
  {
    id: 'coastal-cangzhou',
    name: '滨海平原（沧州沿海）',
    description: '浅层微咸水-咸水，海侵风险区，含水层厚15-40m',
    grid: { rows: 15, cols: 20, cellSize: 600 },
    aquifer: {
      type: 'unconfined' as AquiferType,
      kx: 5, ky: 4, thickness: 25,
      specificYield: 0.12, specificStorage: 1e-5,
      porosity: 0.35, rechargeRate: 80,
    },
    boundary: {
      north: 'no-flow' as BoundaryType,
      south: 'fixed-head' as BoundaryType, southValue: 2,
      east: 'fixed-head' as BoundaryType, eastValue: 0,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 3,
    wells: [
      { row: 7, col: 10, rate: -400, label: '渔区供水' },
    ] as PumpingWell[],
  },
  {
    id: 'karst-baoding-west',
    name: '岩溶山区（保定西部涞源）',
    description: '碳酸盐岩裂隙溶洞水，非均质性强，泉域系统',
    grid: { rows: 16, cols: 18, cellSize: 400 },
    aquifer: {
      type: 'confined' as AquiferType,
      kx: 15, ky: 10, thickness: 60,
      specificYield: 0.05, specificStorage: 1e-5,
      porosity: 0.08, rechargeRate: 200,
    },
    boundary: {
      north: 'no-flow' as BoundaryType,
      south: 'fixed-head' as BoundaryType, southValue: 520,
      east: 'no-flow' as BoundaryType,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 540,
    wells: [
      { row: 8, col: 9, rate: -300, label: '岩溶水源' },
    ] as PumpingWell[],
  },
  {
    id: 'zhangbei-basin',
    name: '坝上高原（张家口张北盆地）',
    description: '内陆闭流盆地，浅层地下水，蒸发排泄为主',
    grid: { rows: 14, cols: 16, cellSize: 500 },
    aquifer: {
      type: 'unconfined' as AquiferType,
      kx: 10, ky: 8, thickness: 20,
      specificYield: 0.15, specificStorage: 1e-5,
      porosity: 0.30, rechargeRate: 60,
    },
    boundary: {
      north: 'no-flow' as BoundaryType,
      south: 'no-flow' as BoundaryType,
      east: 'no-flow' as BoundaryType,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 1380,
    wells: [
      { row: 7, col: 8, rate: -300, label: '农业井' },
    ] as PumpingWell[],
  },
  {
    id: 'handan-east',
    name: '邯郸东部平原（黑龙江港流域）',
    description: '浅层咸水与深层淡水叠置，超采漏斗区',
    grid: { rows: 18, cols: 20, cellSize: 700 },
    aquifer: {
      type: 'confined' as AquiferType,
      kx: 6, ky: 5, thickness: 50,
      specificYield: 0.0001, specificStorage: 8e-6,
      porosity: 0.25, rechargeRate: 10,
    },
    boundary: {
      north: 'fixed-head' as BoundaryType, northValue: 30,
      south: 'no-flow' as BoundaryType,
      east: 'no-flow' as BoundaryType,
      west: 'fixed-head' as BoundaryType, westValue: 32,
    },
    initialHead: 25,
    wells: [
      { row: 9, col: 10, rate: -1800, label: '漏斗中心' },
      { row: 6, col: 6, rate: -800, label: '工业井' },
    ] as PumpingWell[],
  },
] as const;

export const PRESET_OBSERVATION_POINTS: Record<string, ObservationPoint[]> = {
  'taihang-piedmont': [
    { row: 5, col: 5, observedHead: 42, label: '观测井OW-01' },
    { row: 8, col: 10, observedHead: 38, label: '观测井OW-02' },
    { row: 12, col: 15, observedHead: 33, label: '观测井OW-03' },
    { row: 15, col: 20, observedHead: 30, label: '观测井OW-04' },
    { row: 10, col: 8, observedHead: 35, label: '水源地A' },
  ],
  'hebei-plain-central': [
    { row: 4, col: 5, observedHead: -8, label: '深层观测井DW-01' },
    { row: 9, col: 10, observedHead: -22, label: '漏斗中心DW-02' },
    { row: 14, col: 15, observedHead: -12, label: '深层观测井DW-03' },
  ],
  'coastal-cangzhou': [
    { row: 3, col: 5, observedHead: 4, label: '沿海监测井CW-01' },
    { row: 7, col: 10, observedHead: 2, label: '开采井CW-02' },
    { row: 12, col: 15, observedHead: 1, label: '近海井CW-03' },
  ],
  'karst-baoding-west': [
    { row: 4, col: 5, observedHead: 545, label: '岩溶泉KA-01' },
    { row: 8, col: 9, observedHead: 538, label: '开采井KA-02' },
    { row: 12, col: 13, observedHead: 528, label: '观测孔KA-03' },
  ],
  'zhangbei-basin': [
    { row: 3, col: 4, observedHead: 1382, label: '盆地北ZB-01' },
    { row: 7, col: 8, observedHead: 1378, label: '开采井ZB-02' },
    { row: 11, col: 12, observedHead: 1375, label: '盆地南ZB-03' },
  ],
  'handan-east': [
    { row: 4, col: 5, observedHead: 28, label: '上游井HD-01' },
    { row: 9, col: 10, observedHead: 18, label: '漏斗中心HD-02' },
    { row: 14, col: 15, observedHead: 23, label: '下游井HD-03' },
  ],
};

export const PRESET_SCENARIOS = [
  {
    name: '现状开采',
    description: '维持当前开采量不变',
    wellMultiplier: 1.0,
    rechargeMultiplier: 1.0,
  },
  {
    name: '增量开采(+50%)',
    description: '开采量增加50%',
    wellMultiplier: 1.5,
    rechargeMultiplier: 1.0,
  },
  {
    name: '压采(-30%)',
    description: '开采量减少30%',
    wellMultiplier: 0.7,
    rechargeMultiplier: 1.0,
  },
  {
    name: '压采+丰水年',
    description: '开采量减少30%且补给增加50%',
    wellMultiplier: 0.7,
    rechargeMultiplier: 1.5,
  },
  {
    name: '全面禁采',
    description: '关闭所有开采井',
    wellMultiplier: 0.0,
    rechargeMultiplier: 1.0,
  },
] as const;

// ── 辅助函数 ──

/** 水头矩阵转热力图数据 */
export function headToHeatmapData(
  head: number[][],
  rows: number,
  cols: number,
): { x: number; y: number; value: number }[] {
  const data: { x: number; y: number; value: number }[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      data.push({ x: j, y: i, value: head[i][j] });
    }
  }
  return data;
}

/** 降深矩阵转等值线数据 */
export function drawdownToContourData(
  drawdown: number[][],
  rows: number,
  cols: number,
): { x: number; y: number; z: number }[] {
  const data: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      data.push({ x: j, y: i, z: drawdown[i][j] });
    }
  }
  return data;
}

/** 生成流场矢量箭头数据 */
export function velocityToArrows(
  velocity: { vx: number; vy: number }[][],
  rows: number,
  cols: number,
  skip = 2,
): { x: number; y: number; dx: number; dy: number; magnitude: number }[] {
  const arrows: { x: number; y: number; dx: number; dy: number; magnitude: number }[] = [];
  for (let i = 0; i < rows; i += skip) {
    for (let j = 0; j < cols; j += skip) {
      const { vx, vy } = velocity[i][j];
      const mag = Math.sqrt(vx * vx + vy * vy);
      if (mag > 0.001) {
        arrows.push({ x: j, y: i, dx: vx, dy: vy, magnitude: mag });
      }
    }
  }
  return arrows;
}

/** 计算水位降深统计信息 */
export function calcDrawdownStats(drawdown: number[][], rows: number, cols: number) {
  let max = 0, min = Infinity, sum = 0;
  let above1m = 0, above5m = 0, above10m = 0;
  const total = rows * cols;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const d = Math.abs(drawdown[i][j]);
      if (d > max) max = d;
      if (d < min) min = d;
      sum += d;
      if (d > 1) above1m++;
      if (d > 5) above5m++;
      if (d > 10) above10m++;
    }
  }

  return {
    maxDrawdown: max,
    minDrawdown: min === Infinity ? 0 : min,
    avgDrawdown: sum / total,
    above1mPercent: (above1m / total) * 100,
    above5mPercent: (above5m / total) * 100,
    above10mPercent: (above10m / total) * 100,
  };
}

/** 达西流速统计 */
export function calcVelocityStats(velocity: { vx: number; vy: number }[][], rows: number, cols: number) {
  let maxVel = 0, sumVel = 0;
  const total = rows * cols;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const mag = Math.sqrt(velocity[i][j].vx ** 2 + velocity[i][j].vy ** 2);
      if (mag > maxVel) maxVel = mag;
      sumVel += mag;
    }
  }

  return {
    maxVelocity: maxVel,
    avgVelocity: sumVel / total,
  };
}
