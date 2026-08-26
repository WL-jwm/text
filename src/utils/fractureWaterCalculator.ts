/**
 * 裂隙水计算器
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - fractureWaterTypes.ts       类型定义
 *  - fractureWaterPresets.ts     岩性/径流模数/裂隙K/涌水量分级
 *  - fractureWaterAlgorithms.ts  核心算法
 *  - fractureWaterAggregates.ts  预设批量计算与汇总
 */

export * from './fractureWaterTypes';
export * from './fractureWaterPresets';
export * from './fractureWaterAlgorithms';
export * from './fractureWaterAggregates';
