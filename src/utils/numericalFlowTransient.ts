/**
 * 非稳定流求解（隐式差分，自 numericalFlowSolver 拆分）
 */
import type { SimulationConfig, SimulationResult } from './numericalFlowTypes';

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
