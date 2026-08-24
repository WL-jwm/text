/**
 * 土壤盐渍化计算器
 *
 * 聚合出口：按主题域拆分为 3 个子模块，保持对外 API 不变。
 *  - soilSalinizationTypes.ts       类型定义
 *  - soilSalinizationPresets.ts     分级标准/质地参数/预设区
 *  - soilSalinizationAlgorithms.ts  核心算法
 */

export * from './soilSalinizationTypes';
export * from './soilSalinizationPresets';
export * from './soilSalinizationAlgorithms';
