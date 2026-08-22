/**
 * 地下水修复方案评估器 (B-38)
 *
 * 涵盖六大修复技术评估:
 * 1. PRB (可渗透反应墙) 设计计算
 * 2. Pump-and-Treat (抽出处理) 系统优化
 * 3. MNA (监测自然衰减) 评估
 * 4. Bioremediation (生物修复) 评估
 * 5. Air Sparging (土壤气相抽提) 设计
 * 6. 修复方案多准则比选 (MCDA)
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - remediationTypes.ts       类型定义
 *  - remediationPresets.ts     修复技术预设
 *  - remediationCalculators.ts 六大技术计算
 *  - remediationComparison.ts  技术对比表
 */

export * from './remediationTypes';
export * from './remediationPresets';
export * from './remediationCalculators';
export * from './remediationComparison';
