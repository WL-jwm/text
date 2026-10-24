/**
 * 拆分自 decisionSupportAlgorithms.ts — 综合决策评价（多目标加权）
 */

import type { DecisionOption, DecisionResult } from '../decisionSupportTypes';
import { weightDescriptions } from '../decisionSupportConstants';

export function calcDecisionEvaluation(options: DecisionOption[]): DecisionResult {
  // 权重设置
  const weights = [
    { criterion: '水资源保障', weight: 0.30, key: 'waterSecurity' as const },
    { criterion: '生态效益', weight: 0.25, key: 'ecologicalBenefit' as const },
    { criterion: '经济可行性', weight: 0.20, key: 'economicFeasibility' as const },
    { criterion: '技术可行性', weight: 0.15, key: 'technicalFeasibility' as const },
    { criterion: '社会可接受度', weight: 0.10, key: 'socialAcceptance' as const },
  ];

  const rankedOptions = options.map(opt => {
    const scores = weights.map(w => ({
      criterion: w.criterion,
      score: opt[w.key],
      weight: w.weight,
    }));

    const totalScore = scores.reduce((s, sc) => s + sc.score * sc.weight, 0);

    // 投资效率
    const efficiency = opt.investment > 0 ? totalScore / (opt.investment / 10000) : totalScore;

    let recommendation: string;
    if (totalScore >= 80) recommendation = '强烈推荐 — 综合优势显著';
    else if (totalScore >= 70) recommendation = '推荐 — 综合表现良好';
    else if (totalScore >= 60) recommendation = '可考虑 — 部分指标需优化';
    else recommendation = '不推荐 — 综合表现欠佳';

    if (opt.investment > 50000 && efficiency < 0.01) {
      recommendation += '（投资偏高）';
    }
    if (opt.implementationPeriod > 5) {
      recommendation += '（周期较长）';
    }

    return {
      name: opt.name,
      description: opt.description,
      scores,
      totalScore: +totalScore.toFixed(1),
      rank: 0,
      investment: opt.investment,
      period: opt.implementationPeriod,
      recommendation,
    };
  });

  // 排序
  rankedOptions.sort((a, b) => b.totalScore - a.totalScore);
  rankedOptions.forEach((opt, i) => { opt.rank = i + 1; });

  const bestOption = rankedOptions[0]?.name ?? '';

  const recommendations: string[] = [];
  if (rankedOptions.length > 0) {
    const best = rankedOptions[0];
    recommendations.push(`推荐方案: ${best.name}（综合评分${best.totalScore}）— ${best.recommendation}`);

    if (rankedOptions.length > 1) {
      const second = rankedOptions[1];
      if (second.totalScore >= best.totalScore * 0.95) {
        recommendations.push(`备选方案: ${second.name}（评分${second.totalScore}，与最优方案差距<5%）`);
      }
    }

    // 检查是否有短板
    const bestScores = rankedOptions[0].scores;
    const weakest = bestScores.reduce((min, s) => s.score < min.score ? s : min);
    if (weakest.score < 60) {
      recommendations.push(`最优方案在"${weakest.criterion}"方面存在短板(评分${weakest.score})，建议针对性加强`);
    }

    // 投资比较
    if (rankedOptions.length >= 2) {
      const cheapest = [...rankedOptions].sort((a, b) => a.investment - b.investment)[0];
      if (cheapest.rank > 1 && cheapest.totalScore >= rankedOptions[0].totalScore * 0.9) {
        recommendations.push(`${cheapest.name}投资更低(${cheapest.investment}万元)且评分接近，可作为经济型选择`);
      }
    }
  }

  return {
    rankedOptions,
    bestOption,
    weights: weights.map(w => ({ criterion: w.criterion, weight: w.weight, description: weightDescriptions[w.criterion] })),
    recommendations,
  };
}
