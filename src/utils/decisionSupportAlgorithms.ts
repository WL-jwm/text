/**
 * B-32 决策支持引擎 — 五大决策算法
 *  1. calcWaterAllocation    水资源配置优化(线性规划简化)
 *  2. calcReductionPlan      压采方案评估
 *  3. calcEcoLevel           生态水位保障
 *  4. calcWarningDecision    风险预警决策
 *  5. calcDecisionEvaluation 综合决策评价(多目标加权)
 */
import { calcWaterAllocation } from './decisionAlgorithms/waterAllocation';
import { calcReductionPlan } from './decisionAlgorithms/reductionPlan';
import { calcEcoLevel } from './decisionAlgorithms/ecoLevel';
import { calcWarningDecision } from './decisionAlgorithms/warningDecision';
import { calcDecisionEvaluation } from './decisionAlgorithms/decisionEvaluation';

export * from './decisionSupportConstants';
export { calcWaterAllocation, calcReductionPlan, calcEcoLevel, calcWarningDecision, calcDecisionEvaluation };
