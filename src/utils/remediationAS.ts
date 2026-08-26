/**
 * 地下水修复方案评估 — AS 技术
 */

import type { ASInput, ASResult } from './remediationTypes';

export function calculateAS(input: ASInput): ASResult {
  // 影响半径 (经验公式, 基于渗透系数)
  const influenceRadius = Math.max(1.5, 0.5 + input.hydraulicConductivity * 0.3);
  
  // 单井注气流量 (基于影响面积和注入深度)
  const influenceArea = Math.PI * influenceRadius * influenceRadius;
  const airFlowRate = influenceArea * (input.aquiferThickness + input.depthToWater) * 0.05; // 0.05 m³/m³/min
  
  // 推荐井数
  const recommendedWells = Math.max(1, Math.ceil(input.plumeArea / (influenceArea * 0.7))); // 0.7为重叠系数
  
  // 井间距 (1.5倍影响半径)
  const wellSpacing = influenceRadius * 1.5;
  
  // 注气压力 (克服水头+介质阻力)
  const injectionPressure = Math.round((input.depthToWater * 9.81 + 20) * 10) / 10;
  
  // 挥发去除曲线
  // 亨利常数越大越容易挥发
  const volatilizationFactor = Math.min(1, input.henryConstant * 2);
  const removalCurve: { time: number; concentration: number; removalPercent: number }[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const year = (input.designPeriod * i) / steps;
    const k = volatilizationFactor * 2 * Math.exp(-i / steps * 1.5); // 速率随时间衰减
    const conc = input.initialConcentration * Math.exp(-k * year * 365);
    const removal = (1 - conc / input.initialConcentration) * 100;
    removalCurve.push({
      time: Math.round(year * 100) / 100,
      concentration: Math.round(conc * 10000) / 10000,
      removalPercent: Math.round(removal * 100) / 100,
    });
  }
  
  const finalConcentration = removalCurve[removalCurve.length - 1].concentration;
  const canAchieveTarget = finalConcentration <= input.targetConcentration;
  
  // 修复时间估算
  const targetK = volatilizationFactor * 2;
  const estimatedTime = input.henryConstant > 0.01 ?
    Math.log(input.initialConcentration / input.targetConcentration) / targetK / 365.25 :
    999; // 亨利常数过低不适合AS
  
  // 成本
  const wellCost = recommendedWells * 5; // 单井5万元
  const equipmentCost = 20; // 空压机+管路20万
  const capitalCost = wellCost + equipmentCost;
  const annualOcostVal = recommendedWells * 2 + 5; // 运行电费+维护
  const lifecycleCost = capitalCost + annualOcostVal * input.designPeriod;
  
  return {
    influenceRadius: Math.round(influenceRadius * 100) / 100,
    airFlowRate: Math.round(airFlowRate * 100) / 100,
    recommendedWells,
    wellSpacing: Math.round(wellSpacing * 100) / 100,
    injectionPressure,
    estimatedTime: estimatedTime > 100 ? -1 : Math.round(estimatedTime * 100) / 100,
    removalCurve,
    canAchieveTarget,
    capitalCost,
    annualOcost: annualOcostVal,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
  };
}

// ============================================================
// MCDA 多准则决策分析
// ============================================================

