/**
 * B-31 地下水风险评估 — 模块1 污染风险(DRASTIC改进模型)
 */

import type { DrasticInput, AquiferMedia, SoilMedia, VadoseZone, LandUse, PollutionRiskResult } from './riskTypes';
import { scoreToLevel, clamp } from './riskBase';

const AQUIFER_RATING: Record<AquiferMedia, number> = {
  '页岩': 2, '变质岩': 3, '砂岩': 6, '灰岩': 7, '砂砾石': 9, '玄武岩': 8,
};


const SOIL_RATING: Record<SoilMedia, number> = {
  '黏土': 2, '粉质黏土': 3, '粉土': 5, '砂土': 7, '砾石': 9, '薄层/缺失': 10,
};


const VADOSE_RATING: Record<VadoseZone, number> = {
  '黏土': 2, '粉质黏土': 4, '粉土': 5, '砂': 7, '砂砾': 8, '灰岩': 8, '砂岩': 6,
};


const LANDUSE_FACTOR: Record<LandUse, number> = {
  '林地': 0.7, '草地': 0.8, '耕地': 1.2, '建设用地': 1.5, '工业区': 2.0, '垃圾填埋场': 2.5,
};

// DRASTIC标准权重

const DRASTIC_WEIGHTS = { D: 0.22, R: 0.17, A: 0.13, S: 0.09, T: 0.06, I: 0.17, C: 0.16 };


function depthRating(d: number): number {
  if (d < 1.5) return 10;
  if (d < 3) return 9;
  if (d < 5) return 8;
  if (d < 8) return 7;
  if (d < 12) return 5;
  if (d < 18) return 3;
  if (d < 25) return 2;
  return 1;
}


function rechargeRating(r: number): number {
  if (r < 25) return 1;
  if (r < 50) return 3;
  if (r < 100) return 6;
  if (r < 150) return 8;
  if (r < 200) return 9;
  return 10;
}


function topoRating(t: number): number {
  if (t < 2) return 10;
  if (t < 6) return 9;
  if (t < 12) return 7;
  if (t < 18) return 5;
  if (t < 25) return 3;
  return 1;
}


function conductivityRating(c: number): number {
  if (c < 5) return 1;
  if (c < 10) return 2;
  if (c < 30) return 4;
  if (c < 50) return 6;
  if (c < 100) return 8;
  if (c < 300) return 9;
  return 10;
}


export function calcPollutionRisk(input: DrasticInput): PollutionRiskResult {
  const dR = depthRating(input.depthToWater);
  const rR = rechargeRating(input.netRecharge);
  const aR = AQUIFER_RATING[input.aquiferMedia];
  const sR = SOIL_RATING[input.soilMedia];
  const tR = topoRating(input.topography);
  const iR = VADOSE_RATING[input.vadoseZone];
  const cR = conductivityRating(input.conductivity);

  const factorRatings = [
    { factor: '地下水埋深', symbol: 'D', rating: dR, weight: DRASTIC_WEIGHTS.D, contribution: dR * DRASTIC_WEIGHTS.D },
    { factor: '净补给量', symbol: 'R', rating: rR, weight: DRASTIC_WEIGHTS.R, contribution: rR * DRASTIC_WEIGHTS.R },
    { factor: '含水层介质', symbol: 'A', rating: aR, weight: DRASTIC_WEIGHTS.A, contribution: aR * DRASTIC_WEIGHTS.A },
    { factor: '土壤介质', symbol: 'S', rating: sR, weight: DRASTIC_WEIGHTS.S, contribution: sR * DRASTIC_WEIGHTS.S },
    { factor: '地形坡度', symbol: 'T', rating: tR, weight: DRASTIC_WEIGHTS.T, contribution: tR * DRASTIC_WEIGHTS.T },
    { factor: '包气带影响', symbol: 'I', rating: iR, weight: DRASTIC_WEIGHTS.I, contribution: iR * DRASTIC_WEIGHTS.I },
    { factor: '渗透系数', symbol: 'C', rating: cR, weight: DRASTIC_WEIGHTS.C, contribution: cR * DRASTIC_WEIGHTS.C },
  ];

  const drasticIndex = factorRatings.reduce((s, f) => s + f.contribution, 0);
  const landUseFactor = LANDUSE_FACTOR[input.landUse];
  const adjustedIndex = drasticIndex * landUseFactor;

  // 归一化到1-5分
  const normalizedScore = clamp((adjustedIndex / 23) * 5, 1, 5);
  const riskLevel = scoreToLevel(normalizedScore);

  const keyRiskFactors = factorRatings
    .filter(f => f.rating >= 7)
    .sort((a, b) => b.contribution - a.contribution)
    .map(f => `${f.factor}(${f.symbol}=${f.rating})`);

  const recommendations: string[] = [];
  if (dR >= 7) recommendations.push('地下水埋深浅，污染物易到达含水层，建议加强源头控制');
  if (rR >= 7) recommendations.push('净补给量大，污染物迁移快，建议减少地表污染源');
  if (aR >= 7 || cR >= 7) recommendations.push('含水层渗透性强，污染物扩散范围大，需设置隔离带');
  if (sR >= 7) recommendations.push('土壤防护能力差，建议铺设防渗层');
  if (landUseFactor >= 1.5) recommendations.push('土地利用类型风险高，建议加强工业废水和固废管理');
  if (recommendations.length === 0) recommendations.push('整体污染风险较低，维持现有防护措施');

  return {
    drasticIndex: +drasticIndex.toFixed(2),
    adjustedIndex: +adjustedIndex.toFixed(2),
    riskLevel,
    factorRatings: factorRatings.map(f => ({ ...f, contribution: +f.contribution.toFixed(3) })),
    keyRiskFactors,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. 超采风险评价
// ═══════════════════════════════════════════════════════════════

