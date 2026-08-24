/**
 * B-36 不确定性分析 — 随机采样工具
 */

import type { UncertainParameter } from './uncertaintyTypes';

export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller变换：均匀分布→标准正态分布

export function gaussian(rng: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** 从指定分布中采样 */

export function sampleDistribution(param: UncertainParameter, rng: () => number): number {
  switch (param.distribution) {
    case 'normal': {
      return param.mean + param.stdDev * gaussian(rng);
    }
    case 'uniform': {
      return param.min + (param.max - param.min) * rng();
    }
    case 'lognormal': {
      const sigma = param.stdDev;
      const mu = Math.log(param.mean) - sigma * sigma / 2;
      return Math.exp(mu + sigma * gaussian(rng));
    }
    case 'triangular': {
      const u = rng();
      const a = param.min;
      const b = param.max;
      const c = param.mode ?? (a + b) / 2;
      const fc = (c - a) / (b - a);
      if (u < fc) {
        return a + Math.sqrt(u * (b - a) * (c - a));
      }
      return b - Math.sqrt((1 - u) * (b - a) * (b - c));
    }
    default:
      return param.mean;
  }
}

// ── 1. Monte Carlo模拟 ──

/**
 * Monte Carlo模拟
 * 对每个不确定参数进行随机采样，计算模型输出的统计分布
 */
