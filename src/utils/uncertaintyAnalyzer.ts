/**
 * B-36 不确定性分析与敏感性诊断器 — 计算引擎
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - uncertaintyTypes.ts        类型定义
 *  - uncertaintySampling.ts     随机采样工具
 *  - uncertaintyAlgorithms.ts   Monte Carlo/Sobol/Morris/OAT/Bootstrap
 *  - uncertaintyPresets.ts      预设模型与分布标签
 */

export * from './uncertaintyTypes';
export * from './uncertaintySampling';
export * from './uncertaintyAlgorithms';
export * from './uncertaintyPresets';
