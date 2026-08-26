/**
 * DRASTIC脆弱性评价计算器
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - drasticTypes.ts    类型定义
 *  - drasticRatings.ts  权重与评分表
 *  - drasticAlgorithms.ts 核心算法
 *  - drasticPresets.ts  预设区与汇总
 */

export * from './drasticTypes';
export * from './drasticRatings';
export * from './drasticAlgorithms';
export * from './drasticPresets';
