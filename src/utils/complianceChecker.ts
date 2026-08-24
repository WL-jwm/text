/**
 * 环保合规检查器
 *
 * 聚合出口：按主题域拆分为 5 个子模块，保持对外 API 不变。
 *  - complianceTypes.ts        类型定义
 *  - complianceStandards.ts    GB14848 水质标准
 *  - complianceRegulations.ts  法规库
 *  - complianceAlgorithms.ts   核心算法
 *  - compliancePresets.ts      预设场景
 */

export * from './complianceTypes';
export * from './complianceStandards';
export * from './complianceRegulations';
export * from './complianceAlgorithms';
export * from './compliancePresets';
