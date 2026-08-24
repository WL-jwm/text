/**
 * 生态系统服务价值评估器
 *
 * 聚合出口：按主题域拆分为 5 个子模块，保持对外 API 不变。
 *  - ecosystemTypes.ts          类型定义
 *  - ecosystemPresets.ts        区域预设
 *  - ecosystemCalculators.ts    四大服务计算
 *  - ecosystemValueTransfer.ts  价值转移与当量系数
 *  - ecosystemWaterDemand.ts    生态需水量
 */

export * from './ecosystemTypes';
export * from './ecosystemPresets';
export * from './ecosystemCalculators';
export * from './ecosystemValueTransfer';
export * from './ecosystemWaterDemand';
