/**
 * 污染预警引擎
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - pollutionAlertTypes.ts      类型定义
 *  - pollutionAlertConstants.ts  预警等级/阈值/标准
 *  - pollutionAlertAlgorithms.ts 核心算法
 *  - pollutionAlertPresets.ts    演示样本
 */

export * from './pollutionAlertTypes';
export * from './pollutionAlertConstants';
export * from './pollutionAlertAlgorithms';
export * from './pollutionAlertPresets';
