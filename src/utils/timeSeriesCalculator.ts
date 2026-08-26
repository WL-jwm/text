/**
 * 时间序列分析计算器
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - timeSeriesTypes.ts       类型定义
 *  - timeSeriesUtils.ts       统计工具
 *  - timeSeriesAlgorithms.ts  核心算法
 *  - timeSeriesPresets.ts     预设序列与汇总
 */

export * from './timeSeriesTypes';
export * from './timeSeriesUtils';
export * from './timeSeriesAlgorithms';
export * from './timeSeriesPresets';
