/**
 * 地下水修复方案评估 — PRB 技术
 */

import type { PRBInput, PRBResult } from './remediationTypes';

export function calculatePRB(input: PRBInput): PRBResult {
  const v = input.hydraulicGradient * input.hydraulicConductivity / input.porosity;
  const q = input.hydraulicGradient * input.hydraulicConductivity;
  
  // PRB厚度: 确保足够停留时间使浓度降至目标值
  // C/C0 = exp(-k*t), t = x/v
  // 厚度 x = -v * ln(C_target/C0) / k
  const thickness = Math.max(0.5, -v * Math.log(input.targetConcentration / input.initialConcentration) / input.reactionRateConstant);
  
  const prbWidth = input.plumeWidth + 10; // 两侧各预留5m
  const prbDepth = input.aquiferThickness + 2; // 深入隔水层2m
  const treatmentFlow = q * prbWidth * input.aquiferThickness;
  const residenceTime = thickness / v;
  
  const effluentConcentration = input.initialConcentration * Math.exp(-input.reactionRateConstant * residenceTime);
  const removalEfficiency = (1 - effluentConcentration / input.initialConcentration) * 100;
  
  const mediaVolume = thickness * prbWidth * prbDepth;
  const replacementCycle = input.mediaHalfLife / 365.25;
  
  // 成本估算
  const excavationCost = mediaVolume * 0.08; // 开挖+回填 800元/m³
  const mediaCost = mediaVolume * 0.15; // 反应介质 1500元/m³
  const monitoringCost = 5; // 监测系统 5万元
  const capitalCost = excavationCost + mediaCost + monitoringCost;
  
  const annualOcostVal = 3 + (replacementCycle < input.designLife ? mediaVolume * 0.15 / replacementCycle : 0);
  const lifecycleCost = capitalCost + annualOcostVal * input.designLife;
  
  return {
    groundwaterVelocity: v,
    darcyFlux: q,
    prbWidth,
    prbThickness: thickness,
    prbDepth,
    treatmentFlow,
    residenceTime,
    effluentConcentration,
    removalEfficiency,
    mediaVolume,
    replacementCycle,
    capitalCost,
    annualOcost: annualOcostVal,
    lifecycleCost,
  };
}

// ============================================================
// Pump-and-Treat 抽出处理系统计算
// ============================================================

