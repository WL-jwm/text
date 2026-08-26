/**
 * 地下水修复方案评估 — PAT 技术
 */

import type { PATInput, PATResult } from './remediationTypes';

export function calculatePAT(input: PATInput): PATResult {
  // Theis井影响半径 (近似)
  const T = input.hydraulicConductivity * input.aquiferThickness;
  const tDays = 365 * input.designPeriod; // 设计期限(天)
  
  // 稳态影响半径 (Sichardt公式)
  const drawdown = (input.pumpingRate * Math.log(2000 / input.wellRadius)) / (2 * Math.PI * T);
  const influenceRadius = 3000 * Math.sqrt(drawdown); // Sichardt
  
  // 捕获区宽度 (近似)
  const captureWidth = input.pumpingRate / (input.hydraulicGradient * T) * 2;
  
  // 推荐井数
  const recommendedWells = Math.max(1, Math.ceil(input.plumeArea > 0 ? 
    Math.sqrt(input.plumeArea) / Math.max(1, captureWidth) : 1));
  
  const totalPumpingRate = recommendedWells * input.pumpingRate;
  
  // 孔隙体积
  const poreVolume = input.plumeArea * input.aquiferThickness * input.porosity;
  const poreVolumeExchanges = (totalPumpingRate * tDays) / poreVolume;
  
  // 浓度衰减曲线 (一阶衰减模型)
  // C/C0 = exp(-N * PV), N为孔隙体积交换次数
  const concentrationCurve: { time: number; concentration: number; cumulativePV: number }[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const year = (input.designPeriod * i) / steps;
    const days = year * 365;
    const cumPV = (totalPumpingRate * days) / poreVolume;
    const conc = input.initialConcentration * Math.exp(-cumPV * 0.5); // 0.5为洗脱效率因子
    concentrationCurve.push({
      time: Math.round(year * 10) / 10,
      concentration: Math.round(conc * 10000) / 10000,
      cumulativePV: Math.round(cumPV * 100) / 100,
    });
  }
  
  const finalConcentration = concentrationCurve[concentrationCurve.length - 1].concentration;
  const canAchieveTarget = finalConcentration <= input.targetConcentration;
  
  // 修复时间估算
  const targetPV = -Math.log(input.targetConcentration / input.initialConcentration) / 0.5;
  const estimatedRemediationTime = (targetPV * poreVolume) / (totalPumpingRate * 365);
  
  // 成本
  const wellCost = recommendedWells * 8; // 单井8万元
  const treatmentSystemCost = 15; // 水处理系统15万元
  const capitalCost = wellCost + treatmentSystemCost;
  const annualOcostVal = totalPumpingRate * 365 * 0.002 + recommendedWells * 1.5; // 电费+维护
  const lifecycleCost = capitalCost + annualOcostVal * input.designPeriod;
  
  return {
    influenceRadius: Math.round(influenceRadius * 10) / 10,
    captureWidth: Math.round(captureWidth * 10) / 10,
    recommendedWells,
    totalPumpingRate: Math.round(totalPumpingRate * 10) / 10,
    poreVolumeExchanges: Math.round(poreVolumeExchanges * 100) / 100,
    estimatedRemediationTime: Math.round(estimatedRemediationTime * 10) / 10,
    concentrationCurve,
    canAchieveTarget,
    capitalCost: Math.round(capitalCost * 10) / 10,
    annualOcost: Math.round(annualOcostVal * 10) / 10,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
  };
}

// ============================================================
// MNA 监测自然衰减评估
// ============================================================

