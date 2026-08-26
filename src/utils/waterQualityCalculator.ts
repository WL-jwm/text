/**
 * 水质评价计算器
 *
 * 聚合出口：按主题域拆分为 3 个子模块，保持对外 API 不变。
 *  - waterQualityTypes.ts    类型定义
 *  - waterQualityUtils.ts    标准限值解析
 *  - waterQualityAlgorithms.ts 核心算法
 */

export * from './waterQualityTypes';
export * from './waterQualityUtils';
export * from './waterQualityAlgorithms';
