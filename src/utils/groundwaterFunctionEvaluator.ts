/**
 * 地下水功能评价 — 四维度计算与综合评价
 *  供水/生态/地质环境/调节 + 主导功能判定与区划建议
 */

import type { FunctionEvaluationInput, DimensionScore, FunctionEvaluationResult } from './groundwaterFunctionTypes';
import { DIMENSION_WEIGHTS, scoreWellYield, scoreWaterQuality, scoreExploitableModulus, scoreUtilizationRate, scoreBaseflow, scoreWetland, scoreVegetation, scoreSubsidence, scoreSeawaterIntrusion, scoreSalinization, scoreAquiferThickness, scoreSpecificYield, scoreRecharge, scoreAmplitude, scoreToGrade, scoreToRating } from './groundwaterFunctionScoring';

function calcSupplyDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '单井涌水量', value: `${input.wellYield} m³/d`, score: scoreWellYield(input.wellYield), weight: 0.30 },
    { name: '水质级别', value: ['—', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][Math.min(5, input.waterQualityGrade)], score: scoreWaterQuality(input.waterQualityGrade), weight: 0.25 },
    { name: '可开采模数', value: `${input.exploitableModulus} 万m³/km²·a`, score: scoreExploitableModulus(input.exploitableModulus), weight: 0.25 },
    { name: '开采利用率', value: `${input.utilizationRate}%`, score: scoreUtilizationRate(input.utilizationRate), weight: 0.20 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '供水功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.supply,
    note: total >= 70 ? '供水能力强，适宜作为集中供水水源地。' : total >= 55 ? '供水能力中等，可满足分散供水需求。' : '供水能力弱，需谨慎开发。',
  };
}


function calcEcologyDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '基流补给比例', value: `${input.baseflowRatio}%`, score: scoreBaseflow(input.baseflowRatio), weight: 0.40 },
    { name: '湿地依赖度', value: `${input.wetlandDependency}级`, score: scoreWetland(input.wetlandDependency), weight: 0.30 },
    { name: '植被依赖度', value: `${input.vegetationDependency}%`, score: scoreVegetation(input.vegetationDependency), weight: 0.30 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '生态功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.ecology,
    note: total >= 70 ? '生态功能重要，需维持地下水生态基流。' : total >= 55 ? '生态功能中等，适当考虑生态需水。' : '生态功能弱，地下水对生态支撑有限。',
  };
}


function calcGeoEnvDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '地面沉降速率', value: `${input.subsidenceRate} mm/a`, score: scoreSubsidence(input.subsidenceRate), weight: 0.40 },
    { name: '海水入侵距离', value: `${input.seawaterIntrusion} km`, score: scoreSeawaterIntrusion(input.seawaterIntrusion), weight: 0.30 },
    { name: '盐渍化面积比', value: `${input.salinizationRatio}%`, score: scoreSalinization(input.salinizationRatio), weight: 0.30 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '地质环境功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.geoEnvironment,
    note: total >= 70 ? '地质环境稳定，无明显环境地质问题。' : total >= 55 ? '存在轻度环境地质问题，需监测。' : '地质环境问题突出，需限制开采。',
  };
}


function calcRegulationDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '含水层厚度', value: `${input.aquiferThickness} m`, score: scoreAquiferThickness(input.aquiferThickness), weight: 0.25 },
    { name: '给水度', value: String(input.specificYield), score: scoreSpecificYield(input.specificYield), weight: 0.25 },
    { name: '年补给强度', value: `${input.rechargeIntensity} mm/a`, score: scoreRecharge(input.rechargeIntensity), weight: 0.30 },
    { name: '水位年变幅', value: `${input.waterLevelAmplitude} m`, score: scoreAmplitude(input.waterLevelAmplitude), weight: 0.20 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '调节功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.regulation,
    note: total >= 70 ? '调节能力强，含水层储水和缓冲性能好。' : total >= 55 ? '调节能力中等，有一定的年内调节空间。' : '调节能力弱，水位波动大，补给不足。',
  };
}

// ═══════════════════════════════════════════════════════
// 综合评价
// ═══════════════════════════════════════════════════════


export function calcFunctionEvaluation(input: FunctionEvaluationInput): FunctionEvaluationResult {
  const supply = calcSupplyDimension(input);
  const ecology = calcEcologyDimension(input);
  const geoEnv = calcGeoEnvDimension(input);
  const regulation = calcRegulationDimension(input);

  const dimensions = [supply, ecology, geoEnv, regulation];

  // 综合得分 = Σ(维度得分 × 维度权重)
  const comprehensiveScore = Math.round(
    supply.totalScore * DIMENSION_WEIGHTS.supply +
    ecology.totalScore * DIMENSION_WEIGHTS.ecology +
    geoEnv.totalScore * DIMENSION_WEIGHTS.geoEnvironment +
    regulation.totalScore * DIMENSION_WEIGHTS.regulation
  );

  const functionGrade = scoreToGrade(comprehensiveScore);

  // 主导功能判定
  const sortedDims = [...dimensions].sort((a, b) => b.totalScore - a.totalScore);
  const dominantFunction = sortedDims[0].dimension;

  // 功能区划建议
  let zoningSuggestion: string;
  if (comprehensiveScore >= 70) {
    zoningSuggestion = '开发保护区——以供水开发为主，兼顾生态保护，可适度增加开采。';
  } else if (comprehensiveScore >= 55) {
    zoningSuggestion = '限制开发区——以维持现状为主，控制开采量，加强监测。';
  } else if (comprehensiveScore >= 40) {
    zoningSuggestion = '涵养修复区——以涵养修复为主，压采减采，恢复地下水功能。';
  } else {
    zoningSuggestion = '禁采保护区——全面禁止开采，实施生态修复和地下水回补。';
  }

  // 详细建议
  const suggestions: string[] = [];
  if (supply.totalScore < 55) suggestions.push('供水功能不足，不宜作为主要水源地');
  if (ecology.totalScore >= 70) suggestions.push('生态功能重要，须保障生态基流');
  if (geoEnv.totalScore < 55) {
    if (input.subsidenceRate > 10) suggestions.push('地面沉降严重，需严格控制深层水开采');
    if (input.seawaterIntrusion > 0) suggestions.push('存在海水入侵风险，需控制滨海区开采');
    if (input.salinizationRatio > 15) suggestions.push('土壤盐渍化较重，需排水降盐');
  }
  if (regulation.totalScore < 55) suggestions.push('调节能力弱，需加强补源回灌');
  if (input.utilizationRate > 100) suggestions.push('已超采，需压减开采量');

  const suggestion = suggestions.length > 0 ? suggestions.join('；') + '。' : '各功能维度基本平衡，维持现状管理即可。';

  return {
    name: input.name,
    dimensions,
    comprehensiveScore,
    functionGrade,
    dominantFunction,
    zoningSuggestion,
    suggestion,
  };
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北省6个典型功能区
// ═══════════════════════════════════════════════════════

