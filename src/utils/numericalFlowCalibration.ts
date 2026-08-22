/**
 * B-35 地下水数值模拟 — 参数率定与情景预测（自 numericalFlowSimulator 拆分）
 */
import type { SimulationConfig, CalibrationResult, ScenarioPrediction, ObservationPoint, PumpingWell } from './numericalFlowTypes';
import { solveSteadyFlow } from './numericalFlowSolver';

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
