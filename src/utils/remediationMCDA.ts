/**
 * 地下水修复方案评估 — MCDA 技术
 */

import type { MCDAInput, MCAResult } from './remediationTypes';

export function calculateMCDA(input: MCDAInput): MCAResult {
  const { alternatives, weights } = input;
  
  // 计算加权综合得分
  const scored = alternatives.map(alt => {
    const detailScores = { ...alt.scores };
    const weightedScores: Record<string, number> = {};
    let totalScore = 0;
    
    for (const [criterion, weight] of Object.entries(weights)) {
      const score = alt.scores[criterion] || 0;
      weightedScores[criterion] = score * weight;
      totalScore += score * weight;
    }
    
    return {
      id: alt.id,
      name: alt.name,
      totalScore: Math.round(totalScore * 100) / 100,
      detailScores,
      weightedScores,
      cost: alt.cost,
      remediationTime: alt.remediationTime,
      rank: 0,
    };
  });
  
  // 排序
  scored.sort((a, b) => b.totalScore - a.totalScore);
  scored.forEach((item, idx) => { item.rank = idx + 1; });
  
  const recommended = scored[0]?.id || '';
  
  // 敏感性分析 (权重±20%)
  const sensitivityAnalysis = Object.keys(weights).map(criterion => {
    const originalRank = scored.map(s => s.id);
    
    // 增加20%
    const increasedWeights = { ...weights };
    const totalOthers = 1 - weights[criterion];
    const newWeightIncreased = Math.min(1, weights[criterion] * 1.2);
    const scaleIncreased = (1 - newWeightIncreased) / Math.max(0.0001, totalOthers);
    for (const key of Object.keys(increasedWeights)) {
      if (key === criterion) increasedWeights[key] = newWeightIncreased;
      else increasedWeights[key] = weights[key] * scaleIncreased;
    }
    
    const increasedScored = alternatives.map(alt => {
      let ts = 0;
      for (const [c, w] of Object.entries(increasedWeights)) {
        ts += (alt.scores[c] || 0) * w;
      }
      return { id: alt.id, score: ts };
    }).sort((a, b) => b.score - a.score);
    const increasedRank = increasedScored.map(s => s.id);
    
    // 减少20%
    const decreasedWeights = { ...weights };
    const newWeightDecreased = weights[criterion] * 0.8;
    const totalOthers2 = 1 - newWeightDecreased;
    const scaleDecreased = totalOthers2 / Math.max(0.0001, totalOthers);
    for (const key of Object.keys(decreasedWeights)) {
      if (key === criterion) decreasedWeights[key] = newWeightDecreased;
      else decreasedWeights[key] = weights[key] * scaleDecreased;
    }
    
    const decreasedScored = alternatives.map(alt => {
      let ts = 0;
      for (const [c, w] of Object.entries(decreasedWeights)) {
        ts += (alt.scores[c] || 0) * w;
      }
      return { id: alt.id, score: ts };
    }).sort((a, b) => b.score - a.score);
    const decreasedRank = decreasedScored.map(s => s.id);
    
    return {
      criterion,
      originalRank,
      increasedRank,
      decreasedRank,
      rankChanged: JSON.stringify(originalRank) !== JSON.stringify(increasedRank) ||
                     JSON.stringify(originalRank) !== JSON.stringify(decreasedRank),
    };
  });
  
  // 成本效益比
  const costEffectiveness = scored.map(s => ({
    name: s.name,
    score: s.totalScore,
    cost: s.cost,
    ratio: Math.round((s.totalScore / Math.max(1, s.cost)) * 100) / 100,
  }));
  
  return {
    ranking: scored,
    recommended,
    sensitivityAnalysis,
    costEffectiveness,
  };
}

// ============================================================
// 技术对比表数据
// ============================================================


