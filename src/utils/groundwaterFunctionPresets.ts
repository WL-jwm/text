/**
 * 地下水功能评价 — 预设评价区与汇总
 */

import type { FunctionEvaluationInput, FunctionEvaluationResult } from './groundwaterFunctionTypes';
import { calcFunctionEvaluation } from './groundwaterFunctionEvaluator';

export const PRESET_ZONES: FunctionEvaluationInput[] = [
  {
    name: '太行山前冲洪积扇（保定石家庄补给区）', regionType: '平原',
    wellYield: 3000, waterQualityGrade: 2, exploitableModulus: 15, utilizationRate: 45,
    baseflowRatio: 35, wetlandDependency: 2, vegetationDependency: 15,
    subsidenceRate: 0, seawaterIntrusion: 0, salinizationRatio: 0,
    aquiferThickness: 40, specificYield: 0.20, rechargeIntensity: 150, waterLevelAmplitude: 2,
  },
  {
    name: '河北平原中部（衡水深层超采区）', regionType: '平原',
    wellYield: 1500, waterQualityGrade: 3, exploitableModulus: 5, utilizationRate: 130,
    baseflowRatio: 10, wetlandDependency: 1, vegetationDependency: 5,
    subsidenceRate: 35, seawaterIntrusion: 0, salinizationRatio: 10,
    aquiferThickness: 60, specificYield: 0.06, rechargeIntensity: 20, waterLevelAmplitude: 8,
  },
  {
    name: '沧州滨海区（海水入侵区）', regionType: '滨海',
    wellYield: 800, waterQualityGrade: 4, exploitableModulus: 3, utilizationRate: 110,
    baseflowRatio: 5, wetlandDependency: 3, vegetationDependency: 10,
    subsidenceRate: 25, seawaterIntrusion: 6, salinizationRatio: 40,
    aquiferThickness: 30, specificYield: 0.05, rechargeIntensity: 15, waterLevelAmplitude: 5,
  },
  {
    name: '燕山山区（承德生态水源地）', regionType: '山区',
    wellYield: 2000, waterQualityGrade: 1, exploitableModulus: 8, utilizationRate: 25,
    baseflowRatio: 55, wetlandDependency: 4, vegetationDependency: 30,
    subsidenceRate: 0, seawaterIntrusion: 0, salinizationRatio: 0,
    aquiferThickness: 20, specificYield: 0.12, rechargeIntensity: 120, waterLevelAmplitude: 3,
  },
  {
    name: '邢台东部平原（限采区）', regionType: '平原',
    wellYield: 1200, waterQualityGrade: 3, exploitableModulus: 6, utilizationRate: 95,
    baseflowRatio: 15, wetlandDependency: 1, vegetationDependency: 8,
    subsidenceRate: 12, seawaterIntrusion: 0, salinizationRatio: 20,
    aquiferThickness: 35, specificYield: 0.08, rechargeIntensity: 30, waterLevelAmplitude: 6,
  },
  {
    name: '张家口坝上高原（生态脆弱区）', regionType: '盆地',
    wellYield: 500, waterQualityGrade: 2, exploitableModulus: 4, utilizationRate: 60,
    baseflowRatio: 40, wetlandDependency: 5, vegetationDependency: 45,
    subsidenceRate: 0, seawaterIntrusion: 0, salinizationRatio: 5,
    aquiferThickness: 15, specificYield: 0.10, rechargeIntensity: 40, waterLevelAmplitude: 4,
  },
];

// ═══════════════════════════════════════════════════════
// 批量计算与汇总
// ═══════════════════════════════════════════════════════


export function calcAllPresetZones(): FunctionEvaluationResult[] {
  return PRESET_ZONES.map(z => calcFunctionEvaluation(z));
}


export function calcFunctionSummary() {
  const results = calcAllPresetZones();
  const gradeCounts: Record<string, number> = {};
  results.forEach(r => {
    gradeCounts[r.functionGrade] = (gradeCounts[r.functionGrade] || 0) + 1;
  });

  const dominantCounts: Record<string, number> = {};
  results.forEach(r => {
    dominantCounts[r.dominantFunction] = (dominantCounts[r.dominantFunction] || 0) + 1;
  });

  const avgScore = Math.round(results.reduce((s, r) => s + r.comprehensiveScore, 0) / results.length);
  const maxScore = Math.max(...results.map(r => r.comprehensiveScore));
  const minScore = Math.min(...results.map(r => r.comprehensiveScore));

  // 维度平均分
  const dimAvg = ['供水功能', '生态功能', '地质环境功能', '调节功能'].map(dim => {
    const scores = results.map(r => r.dimensions.find(d => d.dimension === dim)?.totalScore ?? 0);
    return { dimension: dim, avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) };
  });

  return { zoneCount: PRESET_ZONES.length, gradeCounts, dominantCounts, avgScore, maxScore, minScore, dimAvg, results };
}

