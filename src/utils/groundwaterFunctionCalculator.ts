/**
 * 地下水功能评价计算器
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - groundwaterFunctionTypes.ts    类型定义
 *  - groundwaterFunctionScoring.ts  维度权重与评分函数
 *  - groundwaterFunctionEvaluator.ts 四维度计算与综合评价
 *  - groundwaterFunctionPresets.ts  预设评价区与汇总
 */

export * from './groundwaterFunctionTypes';
export * from './groundwaterFunctionScoring';
export * from './groundwaterFunctionEvaluator';
export * from './groundwaterFunctionPresets';
