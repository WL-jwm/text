/**
 * B-32 地下水管理决策支持器引擎
 *
 * 五大决策模块：
 *  1. 水资源配置优化 — 多水源多用户线性规划分配
 *  2. 压采方案评估 — 分阶段压采目标+替代水源+经济成本
 *  3. 生态水位保障 — 生态水位阈值+保障措施+达标率
 *  4. 风险预警决策 — 三级预警阈值+响应措施矩阵
 *  5. 综合决策评价 — 多目标加权评分+方案排序
 *
 * 聚合出口：按主题域拆分为 3 个子模块，保持对外 API 不变。
 *  - decisionSupportTypes.ts       输入输出类型定义
 *  - decisionSupportAlgorithms.ts  五大决策算法
 *  - decisionSupportPresets.ts     预设方案数据
 */

export * from './decisionSupportTypes';
export * from './decisionSupportAlgorithms';
export * from './decisionSupportPresets';
