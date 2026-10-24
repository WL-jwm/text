/**
 * 拆分自 decisionSupportAlgorithms.ts — 压采方案评估
 */

import type { ReductionPlan, ReductionResult } from '../decisionSupportTypes';
import { clamp } from './shared';

export function calcReductionPlan(plans: ReductionPlan[]): ReductionResult {
  const phaseResults = plans.map(p => {
    const reduction = p.currentExtraction - p.targetExtraction;
    const reductionRate = p.currentExtraction > 0 ? (reduction / p.currentExtraction) * 100 : 0;
    const alternativeVolume = p.alternativeSupply;
    const alternativeCost = alternativeVolume * p.alternativeCost;
    const gap = reduction - alternativeVolume;
    const ecologicalBenefit = p.ecologicalWater;

    let assessment: string;
    if (gap <= 0 && reductionRate >= 20) assessment = '目标可达，替代水源充足';
    else if (gap <= 0) assessment = '目标可达，但压采力度可加大';
    else if (gap <= reduction * 0.2) assessment = '基本可达，存在小幅缺口';
    else if (gap <= reduction * 0.4) assessment = '存在缺口，需增加替代水源';
    else assessment = '缺口较大，需调整压采目标';

    return {
      phase: p.phase,
      yearRange: p.yearRange,
      reduction: +reduction.toFixed(0),
      reductionRate: +reductionRate.toFixed(1),
      alternativeVolume: +alternativeVolume.toFixed(0),
      alternativeCost: +alternativeCost.toFixed(0),
      gap: +gap.toFixed(0),
      ecologicalBenefit: +ecologicalBenefit.toFixed(0),
      assessment,
    };
  });

  const totalReduction = phaseResults.reduce((s, p) => s + p.reduction, 0);
  const totalAlternative = phaseResults.reduce((s, p) => s + p.alternativeVolume, 0);
  const totalAlternativeCost = phaseResults.reduce((s, p) => s + p.alternativeCost, 0);
  const totalGap = phaseResults.reduce((s, p) => s + Math.max(0, p.gap), 0);
  const firstCurrent = plans[0]?.currentExtraction ?? 1;
  const lastTarget = plans[plans.length - 1]?.targetExtraction ?? 0;
  const totalReductionRate = firstCurrent > 0 ? ((firstCurrent - lastTarget) / firstCurrent) * 100 : 0;

  // 生态效益评分(0-100)
  const ecologicalScore = clamp(totalGap <= 0 ? 90 : Math.max(30, 90 - totalGap / firstCurrent * 200));

  // 经济可行性评分(成本越低越好)
  const avgCost = totalAlternative > 0 ? totalAlternativeCost / totalAlternative : 0;
  const economicScore = clamp(avgCost < 3 ? 90 : avgCost < 5 ? 70 : avgCost < 8 ? 50 : 30);

  // 综合评分
  const overallScore = clamp(ecologicalScore * 0.6 + economicScore * 0.4);

  const recommendations: string[] = [];
  if (totalGap > 0) recommendations.push(`总缺口${totalGap.toFixed(0)}万m³/yr，需新增替代水源或调整压采节奏`);
  if (avgCost > 5) recommendations.push(`替代水成本较高(${avgCost.toFixed(1)}元/m³)，建议增加低成本水源(如再生水)比例`);
  if (totalReductionRate < 30) recommendations.push('压采力度不足，建议提高目标');
  if (ecologicalScore >= 80) recommendations.push('生态效益显著，维持当前方案');
  if (economicScore < 50) recommendations.push('经济可行性偏低，需优化替代水源结构');
  if (recommendations.length === 0) recommendations.push('压采方案整体可行，按计划推进');

  return {
    phaseResults,
    totalReduction: +totalReduction.toFixed(0),
    totalReductionRate: +totalReductionRate.toFixed(1),
    totalAlternative: +totalAlternative.toFixed(0),
    totalAlternativeCost: +totalAlternativeCost.toFixed(0),
    totalGap: +totalGap.toFixed(0),
    ecologicalScore: +ecologicalScore.toFixed(0),
    economicScore: +economicScore.toFixed(0),
    overallScore: +overallScore.toFixed(0),
    recommendations,
  };
}
