/**
 * 历史水文地质参数计算器
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - historicalParamTypes.ts       类型定义
 *  - historicalParamUtils.ts       统计工具
 *  - historicalParamAlgorithms.ts  核心算法
 *  - historicalParamPresets.ts     预设数据与汇总
 */

export * from './historicalParamTypes';
export * from './historicalParamUtils';
export * from './historicalParamAlgorithms';
export * from './historicalParamPresets';
