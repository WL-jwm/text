/**
 * DRASTIC脆弱性评价 — 核心算法
 *  脆弱性指数 / 污染风险(距离/时间/脆弱性修正)
 */

import type { DrasticInput, DrasticParameterResult, DrasticResult, PollutionRiskInput, PollutionRiskResult, DepthRating } from './drasticTypes';
import { DRASTIC_WEIGHTS, DEPTH_RATINGS, RECHARGE_RATINGS, AQUIFER_MEDIA_RATINGS, SOIL_MEDIA_RATINGS, TOPOGRAPHY_RATINGS, VADOSE_MEDIA_RATINGS, CONDUCTIVITY_RATINGS, POLLUTION_SOURCE_RISK } from './drasticRatings';

function getRatingFromTable(value: number, table: DepthRating[]): number {
  for (const row of table) {
    if (value >= row.min && value < row.max) return row.rating;
  }
  return 1;
}


function getVulnerabilityLevel(index: number): DrasticResult['vulnerability'] {
  if (index < 100) return '低';
  if (index < 150) return '中等';
  if (index < 180) return '高';
  return '极高';
}

/**
 * DRASTIC综合评价
 */

export function calcDrastic(input: DrasticInput): DrasticResult {
  const dRating = getRatingFromTable(input.depth, DEPTH_RATINGS);
  const rRating = getRatingFromTable(input.recharge, RECHARGE_RATINGS);
  const aInfo = AQUIFER_MEDIA_RATINGS[input.aquiferMedia];
  const sInfo = SOIL_MEDIA_RATINGS[input.soilMedia];
  const tRating = getRatingFromTable(input.topography, TOPOGRAPHY_RATINGS);
  const iInfo = VADOSE_MEDIA_RATINGS[input.vadoseMedia];
  const cRating = getRatingFromTable(input.conductivity, CONDUCTIVITY_RATINGS);

  const parameters: DrasticParameterResult[] = [
    { name: 'D 地下水埋深', rawValue: `${input.depth} m`, rating: dRating, weight: DRASTIC_WEIGHTS.D, weightedScore: dRating * DRASTIC_WEIGHTS.D },
    { name: 'R 净补给量', rawValue: `${input.recharge} mm/a`, rating: rRating, weight: DRASTIC_WEIGHTS.R, weightedScore: rRating * DRASTIC_WEIGHTS.R },
    { name: 'A 含水层介质', rawValue: aInfo.label, rating: aInfo.rating, weight: DRASTIC_WEIGHTS.A, weightedScore: aInfo.rating * DRASTIC_WEIGHTS.A },
    { name: 'S 土壤介质', rawValue: sInfo.label, rating: sInfo.rating, weight: DRASTIC_WEIGHTS.S, weightedScore: sInfo.rating * DRASTIC_WEIGHTS.S },
    { name: 'T 地形坡度', rawValue: `${input.topography} %`, rating: tRating, weight: DRASTIC_WEIGHTS.T, weightedScore: tRating * DRASTIC_WEIGHTS.T },
    { name: 'I 非饱和带', rawValue: iInfo.label, rating: iInfo.rating, weight: DRASTIC_WEIGHTS.I, weightedScore: iInfo.rating * DRASTIC_WEIGHTS.I },
    { name: 'C 渗透系数', rawValue: `${input.conductivity} m/d`, rating: cRating, weight: DRASTIC_WEIGHTS.C, weightedScore: cRating * DRASTIC_WEIGHTS.C },
  ];

  const drasticIndex = parameters.reduce((sum, p) => sum + p.weightedScore, 0);
  const vulnerability = getVulnerabilityLevel(drasticIndex);

  return { name: input.name, drasticIndex, vulnerability, parameters };
}

/**
 * 污染源叠加风险分析
 */

export function calcPollutionRisk(input: PollutionRiskInput): PollutionRiskResult {
  const sourceInfo = POLLUTION_SOURCE_RISK[input.pollutionSource];

  // 距离修正：近距离放大风险
  let distanceFactor: number;
  if (input.distance < 100) distanceFactor = 1.5;
  else if (input.distance < 500) distanceFactor = 1.2;
  else if (input.distance < 1000) distanceFactor = 1.0;
  else if (input.distance < 2000) distanceFactor = 0.7;
  else distanceFactor = 0.4;

  // 持续时间修正：长期污染源风险更高
  let durationFactor: number;
  if (input.duration < 1) durationFactor = 0.6;
  else if (input.duration < 5) durationFactor = 0.8;
  else if (input.duration < 10) durationFactor = 1.0;
  else if (input.duration < 20) durationFactor = 1.2;
  else durationFactor = 1.5;

  // DRASTIC脆弱性修正（0~1）
  const vulnerabilityFactor = Math.min(1, input.drasticIndex / 200);

  // 综合风险 = 污染源风险 × 距离修正 × 时间修正 × 脆弱性修正
  const compositeRisk = Math.min(10, Math.round(
    sourceInfo.rating * distanceFactor * durationFactor * (0.5 + 0.5 * vulnerabilityFactor) * 10
  ) / 10);

  let riskLevel: PollutionRiskResult['riskLevel'];
  let recommendation: string;

  if (compositeRisk < 3) {
    riskLevel = '低风险';
    recommendation = '定期监测水质，保持现有防护措施';
  } else if (compositeRisk < 5) {
    riskLevel = '中等风险';
    recommendation = '加强监测频率，设置预警指标，制定应急预案';
  } else if (compositeRisk < 7.5) {
    riskLevel = '高风险';
    recommendation = '立即采取防护措施，加密监测井网，污染源截渗处理';
  } else {
    riskLevel = '极高风险';
    recommendation = '紧急启动地下水修复工程，关闭或迁移污染源，建立健康监测';
  }

  return {
    name: input.name,
    sourceRisk: sourceInfo.rating,
    distanceFactor,
    durationFactor,
    compositeRisk,
    riskLevel,
    recommendation,
  };
}

// ═══════════════════════════════════════════════════════
// 河北平原典型分区预设参数
// ═══════════════════════════════════════════════════════

