/**
 * B-36 不确定性分析 — Sobol 全局敏感性分析
 *  Saltelli 抽样法，计算一阶/总阶敏感性指数（自 uncertaintyAlgorithms.ts 拆分）
 */

import type { UncertainParameter, ModelFunction, SobolResult } from './uncertaintyTypes';
import { mulberry32, sampleDistribution } from './uncertaintySampling';

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
