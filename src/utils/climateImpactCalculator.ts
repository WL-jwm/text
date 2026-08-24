/**
 * 气候变化影响评估计算器
 *
 * 聚合出口：按主题域拆分为 5 个子模块，保持对外 API 不变。
 *  - climateTypes.ts           类型定义
 *  - climateCalculators.ts     核心算法
 *  - climatePresets.ts         适应策略预设
 *  - climateComprehensive.ts   综合评估与历史序列
 *  - climateConstants.ts       情景参数与标签
 */

export * from './climateTypes';
export * from './climateCalculators';
export * from './climatePresets';
export * from './climateComprehensive';
export * from './climateConstants';
