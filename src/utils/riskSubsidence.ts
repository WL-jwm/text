/**
 * B-31 地下水风险评估 — 模块3 沉降风险
 */

import type { SubsidenceRiskInput, SubsidenceRiskResult } from './riskTypes';
import { scoreToLevel, clamp } from './riskBase';

const LAYER_COMPRESSIBILITY: Record<string, number> = {
  '黏土': 0.9, '粉质黏土': 0.7, '粉土': 0.5, '砂': 0.3,
};


const STRUCTURE_FACTOR: Record<string, number> = {
  '单层': 0.8, '多层互层': 1.0, '厚层黏土': 1.2,
};


export function calcSubsidenceRisk(input: SubsidenceRiskInput): SubsidenceRiskResult {
  // 压缩层厚度评分(1-5)
  let thickScore: number;
  if (input.compressibleLayerThickness < 10) thickScore = 1;
  else if (input.compressibleLayerThickness < 30) thickScore = 2;
  else if (input.compressibleLayerThickness < 60) thickScore = 3;
  else if (input.compressibleLayerThickness < 100) thickScore = 4;
  else thickScore = 5;

  const compressibility = LAYER_COMPRESSIBILITY[input.layerType] * STRUCTURE_FACTOR[input.structure];
  const compressibilityScore = clamp(thickScore * compressibility, 1, 5);

  // 水位降幅评分
  let declineScore: number;
  if (input.waterLevelDecline < 5) declineScore = 1;
  else if (input.waterLevelDecline < 15) declineScore = 2;
  else if (input.waterLevelDecline < 30) declineScore = 3;
  else if (input.waterLevelDecline < 50) declineScore = 4;
  else declineScore = 5;

  // 历史沉降评分
  let historicalScore: number;
  if (input.historicalSubsidence < 100) historicalScore = 1;
  else if (input.historicalSubsidence < 300) historicalScore = 2;
  else if (input.historicalSubsidence < 600) historicalScore = 3;
  else if (input.historicalSubsidence < 1000) historicalScore = 4;
  else historicalScore = 5;

  // 当前速率评分
  let rateScore: number;
  if (input.currentRate < 5) rateScore = 1;
  else if (input.currentRate < 15) rateScore = 2;
  else if (input.currentRate < 30) rateScore = 3;
  else if (input.currentRate < 50) rateScore = 4;
  else rateScore = 5;

  // 综合(压缩性30% + 水位降幅25% + 历史25% + 速率20%)
  const overallScore = clamp(
    compressibilityScore * 0.30 + declineScore * 0.25 + historicalScore * 0.25 + rateScore * 0.20,
    1, 5,
  );
  const riskLevel = scoreToLevel(overallScore);

  // 简化预测: 沉降量 ≈ 压缩层厚度 × 应变 × 水位降幅系数
  const strain = compressibility * 0.001 * Math.max(0.5, input.waterLevelDecline / 20);
  const predictedSubsidence = input.compressibleLayerThickness * strain * 1000;

  const details = [
    { indicator: '压缩层条件', value: `${input.compressibleLayerThickness}m / ${input.layerType} / ${input.structure}`, score: +compressibilityScore.toFixed(2), assessment: compressibilityScore >= 3.5 ? '高压缩性' : '中低压缩性' },
    { indicator: '水位累计降幅', value: `${input.waterLevelDecline}m`, score: declineScore, assessment: declineScore >= 4 ? '降幅显著' : '降幅可控' },
    { indicator: '历史累计沉降', value: `${input.historicalSubsidence}mm`, score: historicalScore, assessment: historicalScore >= 4 ? '沉降严重' : '沉降较轻' },
    { indicator: '当前沉降速率', value: `${input.currentRate}mm/yr`, score: rateScore, assessment: rateScore >= 4 ? '沉降活跃' : '沉降趋缓' },
  ];

  const recommendations: string[] = [];
  if (rateScore >= 4) recommendations.push('沉降速率较高，建议加密InSAR监测并设置预警阈值');
  if (declineScore >= 4) recommendations.push('水位降幅大是主要诱因，需优先控制地下水开采');
  if (compressibilityScore >= 3.5) recommendations.push('地层压缩性高，即使水位恢复也可能存在残余沉降');
  if (overallScore >= 3.5) recommendations.push('建议建立沉降分区管控方案，限制高危险区工程建设');
  if (recommendations.length === 0) recommendations.push('沉降风险较低，维持常规监测');

  return {
    compressibilityScore: +compressibilityScore.toFixed(2),
    declineScore,
    historicalScore,
    rateScore,
    overallScore: +overallScore.toFixed(2),
    riskLevel,
    predictedSubsidence: +predictedSubsidence.toFixed(0),
    details,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. 海水入侵风险评价
// ═══════════════════════════════════════════════════════════════

