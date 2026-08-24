/**
 * B-31 地下水风险评估计算器引擎
 *
 * 聚合出口：按主题域拆分为 8 个子模块，保持对外 API 不变。
 *  - riskTypes.ts            类型定义
 *  - riskBase.ts             共享风险等级与评分工具
 *  - riskDrastic.ts          污染风险(改进DRASTIC)
 *  - riskOverexploitation.ts 超采风险
 *  - riskSubsidence.ts       沉降风险
 *  - riskSeawater.ts         海水入侵风险
 *  - riskComprehensive.ts    综合风险评价(AHP)
 *  - riskPresets.ts          预设风险区
 */

export * from './riskTypes';
export * from './riskBase';
export * from './riskDrastic';
export * from './riskOverexploitation';
export * from './riskSubsidence';
export * from './riskSeawater';
export * from './riskComprehensive';
export * from './riskPresets';
