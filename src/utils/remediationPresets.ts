/**
 * 地下水修复方案评估器 (B-38) — 修复技术预设（自 remediationEvaluator 拆分）
 */
import type { RemediationPreset } from './remediationTypes';

export const REMEDIATION_PRESETS: RemediationPreset[] = [
  {
    id: 'cr6_chromate',
    name: 'Cr(VI)铬酸盐污染',
    description: '某电镀厂Cr(VI)污染地下水，潜水含水层',
    contaminant: '六价铬',
    aquiferType: '潜水',
    prb: {
      aquiferThickness: 12, hydraulicGradient: 0.002, hydraulicConductivity: 5,
      porosity: 0.25, plumeWidth: 80, initialConcentration: 5.0,
      targetConcentration: 0.05, mediaHalfLife: 3650, reactionRateConstant: 0.5,
      designLife: 20,
    },
    pat: {
      hydraulicConductivity: 5, aquiferThickness: 12, hydraulicGradient: 0.002,
      porosity: 0.25, plumeArea: 2400, initialConcentration: 5.0,
      targetConcentration: 0.05, pumpingRate: 30, wellRadius: 0.1,
      storageCoefficient: 0.001, designPeriod: 15,
    },
    mna: {
      initialConcentration: 5.0, targetConcentration: 0.05, decayRate: 0.001,
      groundwaterVelocity: 0.04, sourceDistance: 200, porosity: 0.25,
      aquiferThickness: 12, hydraulicConductivity: 5, hydraulicGradient: 0.002,
      monitoringWells: 8, designPeriod: 30,
    },
    bio: {
      initialConcentration: 5.0, targetConcentration: 0.05, temperature: 15,
      pH: 7.2, dissolvedOxygen: 2.0, nitrate: 5.0, sulfate: 50, fe3: 10,
      toc: 5, microbialCount: 10000, hydraulicConductivity: 5, porosity: 0.25,
      plumeVolume: 28800, designPeriod: 20,
    },
    asInput: {
      initialConcentration: 5.0, targetConcentration: 0.05, henryConstant: 0.01,
      aquiferThickness: 12, hydraulicConductivity: 5, porosity: 0.25,
      saturation: 1.0, plumeArea: 2400, depthToWater: 5, designPeriod: 10,
    },
  },
  {
    id: 'pce_tce',
    name: 'PCE/TCE氯代溶剂',
    description: '某化工厂PCE/TCE污染地下水，承压含水层',
    contaminant: '四氯乙烯/三氯乙烯',
    aquiferType: '承压',
    prb: {
      aquiferThickness: 8, hydraulicGradient: 0.003, hydraulicConductivity: 3,
      porosity: 0.2, plumeWidth: 60, initialConcentration: 2.0,
      targetConcentration: 0.005, mediaHalfLife: 2555, reactionRateConstant: 0.8,
      designLife: 25,
    },
    pat: {
      hydraulicConductivity: 3, aquiferThickness: 8, hydraulicGradient: 0.003,
      porosity: 0.2, plumeArea: 1200, initialConcentration: 2.0,
      targetConcentration: 0.005, pumpingRate: 20, wellRadius: 0.1,
      storageCoefficient: 0.0005, designPeriod: 20,
    },
    mna: {
      initialConcentration: 2.0, targetConcentration: 0.005, decayRate: 0.002,
      groundwaterVelocity: 0.045, sourceDistance: 150, porosity: 0.2,
      aquiferThickness: 8, hydraulicConductivity: 3, hydraulicGradient: 0.003,
      monitoringWells: 10, designPeriod: 30,
    },
    bio: {
      initialConcentration: 2.0, targetConcentration: 0.005, temperature: 18,
      pH: 6.8, dissolvedOxygen: 0.5, nitrate: 10, sulfate: 100, fe3: 20,
      toc: 20, microbialCount: 50000, hydraulicConductivity: 3, porosity: 0.2,
      plumeVolume: 9600, designPeriod: 25,
    },
    asInput: {
      initialConcentration: 2.0, targetConcentration: 0.005, henryConstant: 0.8,
      aquiferThickness: 8, hydraulicConductivity: 3, porosity: 0.2,
      saturation: 1.0, plumeArea: 1200, depthToWater: 8, designPeriod: 15,
    },
  },
  {
    id: 'bz_benzene',
    name: '苯系物BTEX污染',
    description: '某加油站苯系物泄漏污染地下水，潜水含水层',
    contaminant: '苯/甲苯/乙苯/二甲苯',
    aquiferType: '潜水',
    prb: {
      aquiferThickness: 6, hydraulicGradient: 0.005, hydraulicConductivity: 8,
      porosity: 0.3, plumeWidth: 40, initialConcentration: 1.5,
      targetConcentration: 0.01, mediaHalfLife: 1825, reactionRateConstant: 1.2,
      designLife: 15,
    },
    pat: {
      hydraulicConductivity: 8, aquiferThickness: 6, hydraulicGradient: 0.005,
      porosity: 0.3, plumeArea: 600, initialConcentration: 1.5,
      targetConcentration: 0.01, pumpingRate: 25, wellRadius: 0.1,
      storageCoefficient: 0.002, designPeriod: 10,
    },
    mna: {
      initialConcentration: 1.5, targetConcentration: 0.01, decayRate: 0.005,
      groundwaterVelocity: 0.13, sourceDistance: 100, porosity: 0.3,
      aquiferThickness: 6, hydraulicConductivity: 8, hydraulicGradient: 0.005,
      monitoringWells: 6, designPeriod: 20,
    },
    bio: {
      initialConcentration: 1.5, targetConcentration: 0.01, temperature: 20,
      pH: 7.0, dissolvedOxygen: 1.0, nitrate: 8, sulfate: 30, fe3: 5,
      toc: 15, microbialCount: 100000, hydraulicConductivity: 8, porosity: 0.3,
      plumeVolume: 3600, designPeriod: 15,
    },
    asInput: {
      initialConcentration: 1.5, targetConcentration: 0.01, henryConstant: 0.22,
      aquiferThickness: 6, hydraulicConductivity: 8, porosity: 0.3,
      saturation: 1.0, plumeArea: 600, depthToWater: 3, designPeriod: 8,
    },
  },
  {
    id: 'nh3_nitrate',
    name: '氨氮/硝酸盐污染',
    description: '某农田面源氨氮硝酸盐污染，浅层潜水',
    contaminant: '氨氮/硝酸盐',
    aquiferType: '潜水',
    prb: {
      aquiferThickness: 5, hydraulicGradient: 0.001, hydraulicConductivity: 2,
      porosity: 0.35, plumeWidth: 200, initialConcentration: 30,
      targetConcentration: 0.5, mediaHalfLife: 1825, reactionRateConstant: 0.3,
      designLife: 15,
    },
    pat: {
      hydraulicConductivity: 2, aquiferThickness: 5, hydraulicGradient: 0.001,
      porosity: 0.35, plumeArea: 5000, initialConcentration: 30,
      targetConcentration: 0.5, pumpingRate: 15, wellRadius: 0.1,
      storageCoefficient: 0.005, designPeriod: 15,
    },
    mna: {
      initialConcentration: 30, targetConcentration: 0.5, decayRate: 0.003,
      groundwaterVelocity: 0.006, sourceDistance: 500, porosity: 0.35,
      aquiferThickness: 5, hydraulicConductivity: 2, hydraulicGradient: 0.001,
      monitoringWells: 12, designPeriod: 30,
    },
    bio: {
      initialConcentration: 30, targetConcentration: 0.5, temperature: 16,
      pH: 7.5, dissolvedOxygen: 3.0, nitrate: 30, sulfate: 20, fe3: 3,
      toc: 3, microbialCount: 5000, hydraulicConductivity: 2, porosity: 0.35,
      plumeVolume: 25000, designPeriod: 20,
    },
    asInput: {
      initialConcentration: 30, targetConcentration: 0.5, henryConstant: 0.0007,
      aquiferThickness: 5, hydraulicConductivity: 2, porosity: 0.35,
      saturation: 1.0, plumeArea: 5000, depthToWater: 4, designPeriod: 10,
    },
  },
  {
    id: 'as_arsenic',
    name: '砷污染',
    description: '某矿区砷污染地下水，裂隙含水层',
    contaminant: '砷',
    aquiferType: '裂隙',
    prb: {
      aquiferThickness: 15, hydraulicGradient: 0.004, hydraulicConductivity: 1,
      porosity: 0.15, plumeWidth: 50, initialConcentration: 0.2,
      targetConcentration: 0.01, mediaHalfLife: 3650, reactionRateConstant: 0.4,
      designLife: 20,
    },
    pat: {
      hydraulicConductivity: 1, aquiferThickness: 15, hydraulicGradient: 0.004,
      porosity: 0.15, plumeArea: 1000, initialConcentration: 0.2,
      targetConcentration: 0.01, pumpingRate: 10, wellRadius: 0.1,
      storageCoefficient: 0.0001, designPeriod: 20,
    },
    mna: {
      initialConcentration: 0.2, targetConcentration: 0.01, decayRate: 0.0005,
      groundwaterVelocity: 0.027, sourceDistance: 300, porosity: 0.15,
      aquiferThickness: 15, hydraulicConductivity: 1, hydraulicGradient: 0.004,
      monitoringWells: 8, designPeriod: 30,
    },
    bio: {
      initialConcentration: 0.2, targetConcentration: 0.01, temperature: 14,
      pH: 8.0, dissolvedOxygen: 0.3, nitrate: 2, sulfate: 200, fe3: 50,
      toc: 2, microbialCount: 1000, hydraulicConductivity: 1, porosity: 0.15,
      plumeVolume: 2250, designPeriod: 25,
    },
    asInput: {
      initialConcentration: 0.2, targetConcentration: 0.01, henryConstant: 0.001,
      aquiferThickness: 15, hydraulicConductivity: 1, porosity: 0.15,
      saturation: 1.0, plumeArea: 1000, depthToWater: 10, designPeriod: 10,
    },
  },
  {
    id: 'oil_petroleum',
    name: '石油烃污染',
    description: '某输油管道泄漏石油烃污染，潜水含水层',
    contaminant: '石油烃(TPH)',
    aquiferType: '潜水',
    prb: {
      aquiferThickness: 10, hydraulicGradient: 0.003, hydraulicConductivity: 10,
      porosity: 0.28, plumeWidth: 100, initialConcentration: 20,
      targetConcentration: 0.3, mediaHalfLife: 2555, reactionRateConstant: 0.6,
      designLife: 20,
    },
    pat: {
      hydraulicConductivity: 10, aquiferThickness: 10, hydraulicGradient: 0.003,
      porosity: 0.28, plumeArea: 3000, initialConcentration: 20,
      targetConcentration: 0.3, pumpingRate: 40, wellRadius: 0.1,
      storageCoefficient: 0.003, designPeriod: 15,
    },
    mna: {
      initialConcentration: 20, targetConcentration: 0.3, decayRate: 0.002,
      groundwaterVelocity: 0.107, sourceDistance: 250, porosity: 0.28,
      aquiferThickness: 10, hydraulicConductivity: 10, hydraulicGradient: 0.003,
      monitoringWells: 10, designPeriod: 30,
    },
    bio: {
      initialConcentration: 20, targetConcentration: 0.3, temperature: 19,
      pH: 7.1, dissolvedOxygen: 1.5, nitrate: 5, sulfate: 40, fe3: 15,
      toc: 50, microbialCount: 80000, hydraulicConductivity: 10, porosity: 0.28,
      plumeVolume: 30000, designPeriod: 15,
    },
    asInput: {
      initialConcentration: 20, targetConcentration: 0.3, henryConstant: 0.05,
      aquiferThickness: 10, hydraulicConductivity: 10, porosity: 0.28,
      saturation: 1.0, plumeArea: 3000, depthToWater: 6, designPeriod: 10,
    },
  },
];

// ============================================================
// PRB 可渗透反应墙设计计算
// ============================================================

