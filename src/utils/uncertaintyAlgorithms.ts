/**
 * B-36 不确定性分析 — 核心算法
 *  Monte Carlo / Sobol / Morris / OAT局部敏感性 / Bootstrap
 */

import type { UncertainParameter, ModelFunction, MonteCarloResult, SobolResult, MorrisResult, LocalSensitivityResult, BootstrapResult } from './uncertaintyTypes';
import { mulberry32, sampleDistribution } from './uncertaintySampling';

export function runMonteCarlo(
  parameters: UncertainParameter[],
  model: ModelFunction,
  sampleSize: number = 10000,
  seed: number = 42,
): MonteCarloResult {
  const rng = mulberry32(seed);
  const output: number[] = [];
  const convergenceHistory: { sampleSize: number; runningMean: number; runningStd: number }[] = [];

  let runningSum = 0;
  let runningSumSq = 0;

  for (let i = 0; i < sampleSize; i++) {
    const paramValues: Record<string, number> = {};
    for (const p of parameters) {
      paramValues[p.name] = sampleDistribution(p, rng);
    }

    const result = model.evaluate(paramValues);
    if (isFinite(result)) {
      output.push(result);
      runningSum += result;
      runningSumSq += result * result;
    }

    // 收敛历史（每100个样本记录一次）
    if ((i + 1) % 100 === 0 || i === sampleSize - 1) {
      const n = output.length;
      const mean = runningSum / n;
      const variance = n > 1 ? (runningSumSq - runningSum * runningSum / n) / (n - 1) : 0;
      convergenceHistory.push({
        sampleSize: n,
        runningMean: Number(mean.toFixed(4)),
        runningStd: Number(Math.sqrt(Math.max(0, variance)).toFixed(4)),
      });
    }
  }

  const n = output.length;
  const mean = runningSum / n;
  const variance = n > 1 ? (runningSumSq - runningSum * runningSum / n) / (n - 1) : 0;
  const stdDev = Math.sqrt(Math.max(0, variance));

  // 排序用于百分位数
  const sorted = [...output].sort((a, b) => a - b);
  const percentile = (p: number) => sorted[Math.floor(p * n)];

  // 直方图
  const numBins = Math.min(30, Math.max(10, Math.floor(Math.sqrt(n))));
  const histMin = sorted[0];
  const histMax = sorted[n - 1];
  const binWidth = (histMax - histMin) / numBins || 1;
  const histogram = Array.from({ length: numBins }, (_, i) => {
    const binStart = histMin + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = output.filter(v => v >= binStart && (i === numBins - 1 ? v <= binEnd : v < binEnd)).length;
    return {
      binStart: Number(binStart.toFixed(4)),
      binEnd: Number(binEnd.toFixed(4)),
      count,
      frequency: Number((count / n).toFixed(4)),
    };
  });

  // CDF
  const cdfStep = Math.max(1, Math.floor(n / 100));
  const cdf: { value: number; cumulative: number }[] = [];
  for (let i = 0; i < n; i += cdfStep) {
    cdf.push({ value: Number(sorted[i].toFixed(4)), cumulative: Number(((i + 1) / n).toFixed(4)) });
  }

  // 偏度和峰度
  let skewSum = 0, kurtSum = 0;
  for (const v of output) {
    const z = (v - mean) / (stdDev || 1);
    skewSum += z ** 3;
    kurtSum += z ** 4;
  }
  const skewness = n > 0 ? skewSum / n : 0;
  const kurtosis = n > 0 ? kurtSum / n - 3 : 0; // 超额峰度

  return {
    sampleSize: n,
    output,
    statistics: {
      mean: Number(mean.toFixed(4)),
      stdDev: Number(stdDev.toFixed(4)),
      min: Number(sorted[0].toFixed(4)),
      max: Number(sorted[n - 1].toFixed(4)),
      median: Number(percentile(0.5).toFixed(4)),
      p5: Number(percentile(0.05).toFixed(4)),
      p25: Number(percentile(0.25).toFixed(4)),
      p75: Number(percentile(0.75).toFixed(4)),
      p95: Number(percentile(0.95).toFixed(4)),
      coefficientOfVariation: Number((stdDev / (Math.abs(mean) || 1)).toFixed(4)),
      skewness: Number(skewness.toFixed(4)),
      kurtosis: Number(kurtosis.toFixed(4)),
    },
    histogram,
    cdf,
    confidenceInterval95: { lower: Number(percentile(0.025).toFixed(4)), upper: Number(percentile(0.975).toFixed(4)) },
    confidenceInterval90: { lower: Number(percentile(0.05).toFixed(4)), upper: Number(percentile(0.95).toFixed(4)) },
    convergenceHistory,
  };
}

// ── 2. Sobol全局敏感性分析 ──

/**
 * Sobol敏感性分析（Saltelli抽样法）
 *
 * 一阶指数 Si = V_i / V  (单参数方差贡献比)
 * 总阶指数 STi = E[V(Y|X_{~i})] / V  (包含交互效应)
 *
 * 使用Saltelli抽样：N*(2k+2)次模型评估，k为参数个数
 */

export function runSobolAnalysis(
  parameters: UncertainParameter[],
  model: ModelFunction,
  N: number = 1000,
  seed: number = 42,
): SobolResult {
  const rng = mulberry32(seed);
  const k = parameters.length;

  // 生成两个采样矩阵 A 和 B
  const matrixA: number[][] = [];
  const matrixB: number[][] = [];

  for (let i = 0; i < N; i++) {
    const rowA: number[] = [];
    const rowB: number[] = [];
    for (let j = 0; j < k; j++) {
      rowA.push(sampleDistribution(parameters[j], rng));
      rowB.push(sampleDistribution(parameters[j], rng));
    }
    matrixA.push(rowA);
    matrixB.push(rowB);
  }

  // 生成混合矩阵 AB_i (A的第i列替换为B的第i列)
  const matrixAB: number[][][] = [];
  for (let j = 0; j < k; j++) {
    const ab: number[][] = [];
    for (let i = 0; i < N; i++) {
      const row = [...matrixA[i]];
      row[j] = matrixB[i][j];
      ab.push(row);
    }
    matrixAB.push(ab);
  }

  // 计算模型输出
  const fA = matrixA.map(row => {
    const params: Record<string, number> = {};
    parameters.forEach((p, j) => { params[p.name] = row[j]; });
    return model.evaluate(params);
  });
  const fB = matrixB.map(row => {
    const params: Record<string, number> = {};
    parameters.forEach((p, j) => { params[p.name] = row[j]; });
    return model.evaluate(params);
  });
  const fAB = matrixAB.map(ab => ab.map(row => {
    const params: Record<string, number> = {};
    parameters.forEach((p, j) => { params[p.name] = row[j]; });
    return model.evaluate(params);
  }));

  // 总方差
  const allOutputs = [...fA, ...fB];
  const mean = allOutputs.reduce((s, v) => s + v, 0) / allOutputs.length;
  const variance = allOutputs.reduce((s, v) => s + (v - mean) ** 2, 0) / allOutputs.length;

  // 一阶Sobol指数 Si (Saltelli 2010)
  const firstOrder = parameters.map((p, j) => {
    let numerator = 0;
    for (let i = 0; i < N; i++) {
      numerator += fA[i] * fAB[j][i];
    }
    numerator = numerator / N - mean * mean;
    const si = variance > 0 ? numerator / variance : 0;
    return {
      parameter: p.name,
      index: Number(si.toFixed(4)),
      stdError: Number((Math.sqrt(variance) / (Math.sqrt(N) * variance)).toFixed(4)),
    };
  });

  // 总阶Sobol指数 STi (Saltelli 2010)
  const totalOrder = parameters.map((p, j) => {
    let numerator = 0;
    for (let i = 0; i < N; i++) {
      numerator += fB[i] * fAB[j][i];
    }
    numerator = numerator / N - mean * mean;
    const sti = variance > 0 ? numerator / variance : 0;
    return {
      parameter: p.name,
      index: Number(sti.toFixed(4)),
      stdError: Number((Math.sqrt(variance) / (Math.sqrt(N) * variance)).toFixed(4)),
    };
  });

  // 二阶交互指数（仅计算最重要的几对）
  const secondOrder: { paramA: string; paramB: string; index: number }[] = [];
  for (let a = 0; a < k; a++) {
    for (let b = a + 1; b < k; b++) {
      // S_ab ≈ (1/N) Σ fAB_a[i] * fAB_b[i] - mean² - S_a*V - S_b*V
      let numerator = 0;
      for (let i = 0; i < N; i++) {
        numerator += fAB[a][i] * fAB[b][i];
      }
      numerator = numerator / N - mean * mean;
      const s_ab = variance > 0 ? numerator / variance - firstOrder[a].index - firstOrder[b].index : 0;
      if (Math.abs(s_ab) > 0.01) {
        secondOrder.push({
          paramA: parameters[a].name,
          paramB: parameters[b].name,
          index: Number(s_ab.toFixed(4)),
        });
      }
    }
  }

  const totalFirstOrder = firstOrder.reduce((s, f) => s + f.index, 0);
  const explanation = `一阶指数总和=${totalFirstOrder.toFixed(3)}，${
    totalFirstOrder > 0.9 ? '模型以加性效应为主，参数间交互弱' :
    totalFirstOrder > 0.5 ? '模型存在一定交互效应' :
    '模型交互效应显著，需关注参数间联合影响'
  }`;

  return {
    firstOrder,
    totalOrder,
    secondOrder: secondOrder.sort((a, b) => Math.abs(b.index) - Math.abs(a.index)).slice(0, 10),
    variance: Number(variance.toFixed(4)),
    explanation,
  };
}

// ── 3. Morris筛选法 ──

/**
 * Morris方法：计算基本效应(EE)
 * 每个参数在r条不同轨迹上扰动，统计mu(均值)、mu*(绝对均值)、sigma(标准差)
 *
 * mu大 → 参数影响大
 * sigma大 → 参数存在非线性或交互效应
 */

export function runMorrisScreening(
  parameters: UncertainParameter[],
  model: ModelFunction,
  r: number = 10,  // 轨迹数
  levels: number = 4, // 离散化水平数
  seed: number = 42,
): MorrisResult {
  const rng = mulberry32(seed);
  const k = parameters.length;
  const delta = levels / (2 * (levels - 1));

  const elementaryEffects: { parameter: string; mu: number; muStar: number; sigma: number }[] = [];

  for (let j = 0; j < k; j++) {
    const ees: number[] = [];

    for (let traj = 0; traj < r; traj++) {
      // 生成基点
      const base: number[] = [];
      for (let p = 0; p < k; p++) {
        const gridVal = Math.floor(rng() * levels) / (levels - 1);
        const range = parameters[p].max - parameters[p].min;
        base.push(parameters[p].min + gridVal * range);
      }

      // 计算基点输出
      const baseParams: Record<string, number> = {};
      parameters.forEach((p, idx) => { baseParams[p.name] = base[idx]; });
      const fBase = model.evaluate(baseParams);

      // 扰动第j个参数
      const perturbed = [...base];
      const direction = rng() > 0.5 ? 1 : -1;
      const gridIdx = Math.floor((base[j] - parameters[j].min) / (parameters[j].max - parameters[j].min) * (levels - 1));
      const newGridIdx = Math.max(0, Math.min(levels - 1, gridIdx + direction));
      perturbed[j] = parameters[j].min + newGridIdx / (levels - 1) * (parameters[j].max - parameters[j].min);

      const perturbedParams: Record<string, number> = {};
      parameters.forEach((p, idx) => { perturbedParams[p.name] = perturbed[idx]; });
      const fPerturbed = model.evaluate(perturbedParams);

      const ee = (fPerturbed - fBase) / (delta * (parameters[j].max - parameters[j].min));
      if (isFinite(ee)) ees.push(ee);
    }

    const mu = ees.reduce((s, v) => s + v, 0) / ees.length;
    const muStar = ees.reduce((s, v) => s + Math.abs(v), 0) / ees.length;
    const sigma = ees.length > 1
      ? Math.sqrt(ees.reduce((s, v) => s + (v - mu) ** 2, 0) / (ees.length - 1))
      : 0;

    elementaryEffects.push({
      parameter: parameters[j].name,
      mu: Number(mu.toFixed(4)),
      muStar: Number(muStar.toFixed(4)),
      sigma: Number(sigma.toFixed(4)),
    });
  }

  // 排序
  const sorted = [...elementaryEffects].sort((a, b) => b.muStar - a.muStar);
  const maxMuStar = sorted[0]?.muStar ?? 1;
  const ranking = sorted.map((ee, idx) => ({
    parameter: ee.parameter,
    rank: idx + 1,
    influence: ee.muStar > maxMuStar * 0.5 ? 'high' as const
      : ee.muStar > maxMuStar * 0.15 ? 'medium' as const
      : 'low' as const,
  }));

  return { elementaryEffects, ranking };
}

// ── 4. 局部敏感性分析（OAT） ──

/**
 * 一次一参数法（One-At-a-Time）
 * 固定其他参数，对每个参数在基值附近进行扰动
 */

export function runLocalSensitivity(
  parameters: UncertainParameter[],
  model: ModelFunction,
  perturbationPercent: number = 10,
): LocalSensitivityResult[] {
  // 基值
  const baseParams: Record<string, number> = {};
  parameters.forEach(p => { baseParams[p.name] = p.mean; });
  const baseOutput = model.evaluate(baseParams);

  const results: LocalSensitivityResult[] = [];

  for (const param of parameters) {
    const perturbationSteps = [-50, -25, -10, -5, 5, 10, 25, 50]; // % 扰动
    const perturbedOutputs: { delta: number; output: number; sensitivity: number }[] = [];

    for (const pct of perturbationSteps) {
      const perturbedParams = { ...baseParams };
      perturbedParams[param.name] = param.mean * (1 + pct / 100);
      const output = model.evaluate(perturbedParams);
      const delta = (output - baseOutput) / baseOutput;
      const sensitivity = pct !== 0 ? delta / (pct / 100) : 0;
      perturbedOutputs.push({
        delta: Number(delta.toFixed(6)),
        output: Number(output.toFixed(4)),
        sensitivity: Number(sensitivity.toFixed(4)),
      });
    }

    // 弹性系数（1%扰动时的输出变化%）
    const p1 = perturbationPercent / 100;
    const perturbedParams = { ...baseParams };
    perturbedParams[param.name] = param.mean * (1 + p1);
    const perturbedOutput = model.evaluate(perturbedParams);
    const elasticity = ((perturbedOutput - baseOutput) / baseOutput) / p1;

    // 归一化敏感度
    const normalizedSensitivity = Math.abs(elasticity) * (param.stdDev / Math.abs(param.mean || 1));

    results.push({
      parameter: param.name,
      baseValue: param.mean,
      perturbation: perturbationPercent,
      baseOutput: Number(baseOutput.toFixed(4)),
      perturbedOutputs,
      elasticity: Number(elasticity.toFixed(4)),
      normalizedSensitivity: Number(normalizedSensitivity.toFixed(4)),
    });
  }

  return results;
}

// ── 5. Bootstrap置信区间 ──

/**
 * Bootstrap重采样法估计置信区间
 * 从原始数据中有放回抽样B次，计算统计量的经验分布
 */

export function runBootstrap(
  data: number[],
  statistic: 'mean' | 'median' | 'std' | 'percentile_95',
  iterations: number = 5000,
  seed: number = 42,
): BootstrapResult {
  const rng = mulberry32(seed);
  const n = data.length;

  // 原始估计
  const originalEstimate = statistic === 'mean'
    ? data.reduce((s, v) => s + v, 0) / n
    : statistic === 'median'
    ? [...data].sort((a, b) => a - b)[Math.floor(n / 2)]
    : statistic === 'std'
    ? Math.sqrt(data.reduce((s, v) => s + (v - data.reduce((s2, v2) => s2 + v2, 0) / n) ** 2, 0) / (n - 1))
    : [...data].sort((a, b) => a - b)[Math.floor(n * 0.95)];

  const bootstrapEstimates: number[] = [];

  for (let b = 0; b < iterations; b++) {
    // 有放回抽样
    const sample: number[] = [];
    for (let i = 0; i < n; i++) {
      sample.push(data[Math.floor(rng() * n)]);
    }

    let estimate: number;
    if (statistic === 'mean') {
      estimate = sample.reduce((s, v) => s + v, 0) / n;
    } else if (statistic === 'median') {
      estimate = [...sample].sort((a, b) => a - b)[Math.floor(n / 2)];
    } else if (statistic === 'std') {
      const sm = sample.reduce((s, v) => s + v, 0) / n;
      estimate = Math.sqrt(sample.reduce((s, v) => s + (v - sm) ** 2, 0) / (n - 1));
    } else {
      estimate = [...sample].sort((a, b) => a - b)[Math.floor(n * 0.95)];
    }
    bootstrapEstimates.push(estimate);
  }

  const bootstrapMean = bootstrapEstimates.reduce((s, v) => s + v, 0) / iterations;
  const bootstrapVariance = bootstrapEstimates.reduce((s, v) => s + (v - bootstrapMean) ** 2, 0) / (iterations - 1);
  const bootstrapStd = Math.sqrt(bootstrapVariance);
  const bias = bootstrapMean - originalEstimate;

  const sorted = [...bootstrapEstimates].sort((a, b) => a - b);
  const ci95 = {
    lower: sorted[Math.floor(iterations * 0.025)],
    upper: sorted[Math.floor(iterations * 0.975)],
  };
  const ci90 = {
    lower: sorted[Math.floor(iterations * 0.05)],
    upper: sorted[Math.floor(iterations * 0.95)],
  };

  // 直方图
  const numBins = 30;
  const histMin = sorted[0];
  const histMax = sorted[iterations - 1];
  const binWidth = (histMax - histMin) / numBins || 1;
  const histogram = Array.from({ length: numBins }, (_, i) => {
    const binStart = histMin + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = bootstrapEstimates.filter(v => v >= binStart && (i === numBins - 1 ? v <= binEnd : v < binEnd)).length;
    return { binStart: Number(binStart.toFixed(4)), binEnd: Number(binEnd.toFixed(4)), count };
  });

  return {
    originalEstimate: Number(originalEstimate.toFixed(4)),
    bootstrapMean: Number(bootstrapMean.toFixed(4)),
    bootstrapStd: Number(bootstrapStd.toFixed(4)),
    bias: Number(bias.toFixed(4)),
    ci95: { lower: Number(ci95.lower.toFixed(4)), upper: Number(ci95.upper.toFixed(4)) },
    ci90: { lower: Number(ci90.lower.toFixed(4)), upper: Number(ci90.upper.toFixed(4)) },
    histogram,
    iterations,
  };
}

// ── 预设模型 ──

