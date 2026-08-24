/**
 * 地下水背景值计算器
 *
 * 聚合出口：按主题域拆分为 5 个子模块，保持对外 API 不变。
 *  - backgroundTypes.ts       类型定义
 *  - backgroundUtils.ts       统计工具
 *  - backgroundAlgorithms.ts  核心算法
 *  - backgroundPresets.ts     预设因子/分区/标准
 *  - backgroundAggregates.ts  全因子/全分区汇总
 */

export * from './backgroundTypes';
export * from './backgroundUtils';
export * from './backgroundAlgorithms';
export * from './backgroundPresets';
export * from './backgroundAggregates';
