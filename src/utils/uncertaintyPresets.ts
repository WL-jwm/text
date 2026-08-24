/**
 * B-36 不确定性分析 — 预设模型与分布标签
 */

import type { DistributionType } from './uncertaintyTypes';

export const PRESET_MODELS = [
  {
    id: 'darc-flow',
    name: '达西流速计算',
    description: 'Q = K * i * A (渗透系数×水力梯度×过水断面)',
    paramNames: ['K', 'i', 'A'],
    evaluate: (p: Record<string, number>) => p.K * p.i * p.A,
    parameters: [
      { name: 'K', symbol: 'K', distribution: 'lognormal' as DistributionType, mean: 10, stdDev: 0.5, min: 1, max: 50, unit: 'm/d' },
      { name: 'i', symbol: 'i', distribution: 'normal' as DistributionType, mean: 0.005, stdDev: 0.001, min: 0.001, max: 0.02, unit: '-' },
      { name: 'A', symbol: 'A', distribution: 'uniform' as DistributionType, mean: 1000, stdDev: 200, min: 500, max: 2000, unit: 'm²' },
    ],
  },
  {
    id: 'recharge-estimate',
    name: '降雨入渗补给量估算',
    description: 'R = P * α * A (降雨量×入渗系数×面积)',
    paramNames: ['P', 'alpha', 'A'],
    evaluate: (p: Record<string, number>) => (p.P / 1000) * p.alpha * p.A * 1000,
    parameters: [
      { name: 'P', symbol: 'P', distribution: 'normal' as DistributionType, mean: 550, stdDev: 80, min: 300, max: 900, unit: 'mm' },
      { name: 'alpha', symbol: 'α', distribution: 'triangular' as DistributionType, mean: 0.15, stdDev: 0.05, min: 0.05, max: 0.35, mode: 0.12, unit: '-' },
      { name: 'A', symbol: 'A', distribution: 'uniform' as DistributionType, mean: 100, stdDev: 20, min: 50, max: 200, unit: 'km²' },
    ],
  },
  {
    id: 'drawdown-theis',
    name: 'Theis降深计算',
    description: 's = (Q/(4πT)) * W(u), 简化: s ≈ Q*ln(R/r)/(2πT)',
    paramNames: ['Q', 'T', 'R', 'r'],
    evaluate: (p: Record<string, number>) => {
      const u = (p.r * p.r * 0.0001) / (4 * p.T * 1);
      const W = u < 0.01 ? -0.5772 - Math.log(u) : -0.5772 - Math.log(u) + u;
      return (p.Q / (4 * Math.PI * p.T)) * W;
    },
    parameters: [
      { name: 'Q', symbol: 'Q', distribution: 'normal' as DistributionType, mean: 1000, stdDev: 100, min: 500, max: 2000, unit: 'm³/d' },
      { name: 'T', symbol: 'T', distribution: 'lognormal' as DistributionType, mean: 200, stdDev: 0.3, min: 50, max: 800, unit: 'm²/d' },
      { name: 'R', symbol: 'R', distribution: 'uniform' as DistributionType, mean: 300, stdDev: 50, min: 100, max: 500, unit: 'm' },
      { name: 'r', symbol: 'r', distribution: 'normal' as DistributionType, mean: 0.5, stdDev: 0.1, min: 0.1, max: 1, unit: 'm' },
    ],
  },
  {
    id: 'contaminant-transport',
    name: '污染物迁移距离',
    description: 'x = v * t * R_d⁻¹ (流速×时间/滞后因子)',
    paramNames: ['v', 't', 'Rd'],
    evaluate: (p: Record<string, number>) => p.v * p.t / p.Rd,
    parameters: [
      { name: 'v', symbol: 'v', distribution: 'lognormal' as DistributionType, mean: 0.5, stdDev: 0.3, min: 0.05, max: 5, unit: 'm/d' },
      { name: 't', symbol: 't', distribution: 'uniform' as DistributionType, mean: 3650, stdDev: 500, min: 1000, max: 10000, unit: 'd' },
      { name: 'Rd', symbol: 'Rd', distribution: 'triangular' as DistributionType, mean: 3, stdDev: 1, min: 1, max: 10, mode: 2, unit: '-' },
    ],
  },
  {
    id: 'water-balance',
    name: '地下水均衡计算',
    description: 'ΔS = P*α + R_in - Q_out - ET (补给+侧入-开采-蒸散发)',
    paramNames: ['P', 'alpha', 'Rin', 'Qout', 'ET'],
    evaluate: (p: Record<string, number>) => (p.P * p.alpha / 1000) * 1e6 + p.Rin - p.Qout - p.ET,
    parameters: [
      { name: 'P', symbol: 'P', distribution: 'normal' as DistributionType, mean: 550, stdDev: 80, min: 300, max: 900, unit: 'mm' },
      { name: 'alpha', symbol: 'α', distribution: 'triangular' as DistributionType, mean: 0.15, stdDev: 0.05, min: 0.05, max: 0.35, mode: 0.12, unit: '-' },
      { name: 'Rin', symbol: 'R_in', distribution: 'normal' as DistributionType, mean: 5000000, stdDev: 1000000, min: 2000000, max: 8000000, unit: 'm³' },
      { name: 'Qout', symbol: 'Q_out', distribution: 'normal' as DistributionType, mean: 7000000, stdDev: 1500000, min: 3000000, max: 12000000, unit: 'm³' },
      { name: 'ET', symbol: 'ET', distribution: 'uniform' as DistributionType, mean: 1000000, stdDev: 300000, min: 500000, max: 2000000, unit: 'm³' },
    ],
  },
  {
    id: 'slope-stability',
    name: '边坡稳定性系数',
    description: 'FS = c' + '/' + '(γ*H*sinα) + tan(φ)/tan(α)',
    paramNames: ['c', 'gamma', 'H', 'alpha', 'phi'],
    evaluate: (p: Record<string, number>) => {
      const alphaRad = p.alpha * Math.PI / 180;
      const phiRad = p.phi * Math.PI / 180;
      const denom = p.gamma * p.H * Math.sin(alphaRad);
      return denom > 0 ? p.c / denom + Math.tan(phiRad) / Math.tan(alphaRad) : 1;
    },
    parameters: [
      { name: 'c', symbol: "c'", distribution: 'normal' as DistributionType, mean: 20, stdDev: 5, min: 5, max: 40, unit: 'kPa' },
      { name: 'gamma', symbol: 'γ', distribution: 'normal' as DistributionType, mean: 19, stdDev: 1, min: 16, max: 22, unit: 'kN/m³' },
      { name: 'H', symbol: 'H', distribution: 'uniform' as DistributionType, mean: 15, stdDev: 3, min: 8, max: 25, unit: 'm' },
      { name: 'alpha', symbol: 'α', distribution: 'normal' as DistributionType, mean: 30, stdDev: 3, min: 15, max: 45, unit: '°' },
      { name: 'phi', symbol: 'φ', distribution: 'normal' as DistributionType, mean: 25, stdDev: 4, min: 15, max: 35, unit: '°' },
    ],
  },
] as const;


export const DISTRIBUTION_LABELS: Record<DistributionType, string> = {
  normal: '正态分布',
  uniform: '均匀分布',
  lognormal: '对数正态',
  triangular: '三角分布',
};

