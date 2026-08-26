/**
 * 地下水修复方案评估 — Bio 技术
 */

import type { BioInput, BioResult } from './remediationTypes';

export function calculateBio(input: BioInput): BioResult {
  // 适宜性评分计算 (多因素加权)
  let score = 0;
  
  // 温度 (15-30度最佳)
  const tempScore = input.temperature >= 15 && input.temperature <= 30 ? 100 :
    input.temperature >= 10 && input.temperature <= 35 ? 60 : 20;
  score += tempScore * 0.15;
  
  // pH (6.5-8.0最佳)
  const pHScore = input.pH >= 6.5 && input.pH <= 8.0 ? 100 :
    input.pH >= 6.0 && input.pH <= 8.5 ? 70 : 30;
  score += pHScore * 0.15;
  
  // 电子受体
  const eaScore = Math.min(100, (input.dissolvedOxygen / 2 + input.nitrate / 10 + input.sulfate / 50 + input.fe3 / 20) * 25);
  score += eaScore * 0.25;
  
  // TOC (有机碳作为共代谢基质)
  const tocScore = input.toc >= 10 ? 100 : input.toc >= 5 ? 70 : input.toc >= 2 ? 40 : 10;
  score += tocScore * 0.15;
  
  // 微生物丰度
  const microScore = input.microbialCount >= 100000 ? 100 :
    input.microbialCount >= 10000 ? 70 :
    input.microbialCount >= 1000 ? 40 : 10;
  score += microScore * 0.15;
  
  // 渗透性
  const kScore = input.hydraulicConductivity >= 5 ? 100 :
    input.hydraulicConductivity >= 1 ? 70 : 30;
  score += kScore * 0.15;
  
  const suitabilityScore = Math.round(score);
  const suitabilityLevel = suitabilityScore >= 75 ? '高度适宜' :
    suitabilityScore >= 50 ? '中度适宜' :
    suitabilityScore >= 30 ? '低度适宜' : '不适宜';
  
  // 电子受体分析
  const electronAcceptors = [
    { acceptor: 'O₂', concentration: input.dissolvedOxygen, capacity: input.dissolvedOxygen * 3.42, status: input.dissolvedOxygen > 1 ? '充足' : '不足' },
    { acceptor: 'NO₃⁻', concentration: input.nitrate, capacity: input.nitrate * 2.86, status: input.nitrate > 5 ? '充足' : '不足' },
    { acceptor: 'SO₄²⁻', concentration: input.sulfate, capacity: input.sulfate * 1.5, status: input.sulfate > 20 ? '充足' : '不足' },
    { acceptor: 'Fe(III)', concentration: input.fe3, capacity: input.fe3 * 5.0, status: input.fe3 > 10 ? '充足' : '不足' },
  ];
  
  // 最大降解速率 (基于Monod方程简化)
  const tempFactor = Math.exp(0.07 * (input.temperature - 20)); // Q10=2
  const maxDegradationRate = 0.05 * tempFactor * (suitabilityScore / 100);
  
  // 预测修复时间
  const estimatedTime = Math.log(input.initialConcentration / input.targetConcentration) / maxDegradationRate / 365.25;
  
  const needsEnhancement = suitabilityScore < 60;
  
  const enhancementSuggestions: string[] = [];
  if (input.dissolvedOxygen < 2) enhancementSuggestions.push('注入过氧化氢或曝气提高溶解氧浓度');
  if (input.toc < 10) enhancementSuggestions.push('添加电子供体(乳酸盐/醋酸盐等)促进共代谢');
  if (input.pH < 6.5 || input.pH > 8.0) enhancementSuggestions.push('调节pH至6.5-8.0范围');
  if (input.microbialCount < 10000) enhancementSuggestions.push('接种降解菌群进行生物强化');
  if (input.nitrate < 5 && input.sulfate < 20) enhancementSuggestions.push('补充硝酸盐/硫酸盐作为替代电子受体');
  if (enhancementSuggestions.length === 0) enhancementSuggestions.push('当前条件已满足自然生物降解需求');
  
  // 营养盐需求 (C:N:P = 100:10:1)
  const contaminantMass = input.initialConcentration * input.plumeVolume * input.porosity; // mg
  const nitrogenNeed = contaminantMass * 0.1 / 1e6; // kg
  const phosphorusNeed = contaminantMass * 0.01 / 1e6;
  
  // 成本
  const baseCost = needsEnhancement ? 30 : 10;
  const wellCost = needsEnhancement ? 15 : 0;
  const capitalCost = baseCost + wellCost;
  const annualOcostVal = needsEnhancement ? 8 : 3;
  const lifecycleCost = capitalCost + annualOcostVal * input.designPeriod;
  
  return {
    suitabilityScore,
    suitabilityLevel,
    electronAcceptors,
    maxDegradationRate: Math.round(maxDegradationRate * 10000) / 10000,
    estimatedTime: Math.round(estimatedTime * 100) / 100,
    needsEnhancement,
    enhancementSuggestions,
    nutrientRequirement: {
      nitrogen: Math.round(nitrogenNeed * 100) / 100,
      phosphorus: Math.round(phosphorusNeed * 100) / 100,
    },
    capitalCost,
    annualOcost: annualOcostVal,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
  };
}

// ============================================================
// Air Sparging 土壤气相抽提设计
// ============================================================

