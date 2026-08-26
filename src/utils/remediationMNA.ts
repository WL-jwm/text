/**
 * 地下水修复方案评估 — MNA 技术
 */

import type { MNAInput, MNAResult } from './remediationTypes';

export function calculateMNA(input: MNAInput): MNAResult {
  const halfLife = Math.LN2 / input.decayRate;
  
  // 衰减到目标浓度的时间
  const timeToTarget = Math.log(input.initialConcentration / input.targetConcentration) / input.decayRate / 365.25;
  
  // 衰减距离 = 流速 * 衰减时间
  const attenuationDistance = input.groundwaterVelocity * (timeToTarget * 365.25);
  
  // 自然衰减容量
  const attenuationCapacity = (input.initialConcentration - input.targetConcentration) / Math.max(1, attenuationDistance) * 1000;
  
  const feasible = timeToTarget <= input.designPeriod && timeToTarget > 0;
  
  // 衰减曲线
  const attenuationCurve: { distance: number; concentration: number; time: number }[] = [];
  const maxDist = Math.max(attenuationDistance * 1.5, input.sourceDistance + 100);
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const dist = (maxDist * i) / steps;
    const time = dist / Math.max(0.0001, input.groundwaterVelocity);
    const conc = input.initialConcentration * Math.exp(-input.decayRate * time);
    attenuationCurve.push({
      distance: Math.round(dist * 10) / 10,
      concentration: Math.round(conc * 10000) / 10000,
      time: Math.round((time / 365.25) * 100) / 100,
    });
  }
  
  // 监测频率建议
  const monitoringFrequency = timeToTarget > 10 ? 2 : timeToTarget > 5 ? 4 : 6;
  
  // 监测成本
  const annualMonitoringCost = input.monitoringWells * monitoringFrequency * 0.3; // 0.3万元/井/次
  const lifecycleCost = annualMonitoringCost * input.designPeriod + 10; // +初始评估费10万
  
  // 衰减机制贡献分析
  const attenuationMechanisms = [
    { mechanism: '生物降解', contribution: 60, description: '微生物代谢分解污染物为主要衰减机制' },
    { mechanism: '吸附滞留', contribution: 20, description: '含水层介质吸附降低溶解相浓度' },
    { mechanism: '稀释扩散', contribution: 15, description: '水动力弥散与净稀释作用' },
    { mechanism: '化学沉淀', contribution: 5, description: '沉淀反应去除溶解态污染物' },
  ];
  
  return {
    halfLife: Math.round(halfLife * 10) / 10,
    timeToTarget: Math.round(timeToTarget * 100) / 100,
    attenuationDistance: Math.round(attenuationDistance * 10) / 10,
    feasible,
    attenuationCapacity: Math.round(attenuationCapacity * 100) / 100,
    attenuationCurve,
    monitoringFrequency,
    annualMonitoringCost: Math.round(annualMonitoringCost * 10) / 10,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
    attenuationMechanisms,
  };
}

// ============================================================
// 生物修复评估
// ============================================================

