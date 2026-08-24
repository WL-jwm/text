/**
 * 数值模型参数设计 — 预设模型区
 */

import type { PresetModelZone } from './numericalModelTypes';
import { calcHydraulicParams, calcGridParams, calcTimeStep, calcStability } from './numericalModelAlgorithms';

export const PRESET_MODEL_ZONES: PresetModelZone[] = [
  {
    name: '太行山前冲洪积扇（保定-石家庄）',
    description: '第四系孔隙含水层，K较高，适合区域模型',
    hydraulic: { k: 15, thickness: 40, storage: 0.0008, gradient: 0.002, porosity: 0.25, alphaL: 50, isConfined: true },
    domain: { length: 50000, width: 30000, layers: 3 },
    totalTime: 3650,
    method: 'implicit',
  },
  {
    name: '河北平原中部（衡水深层水）',
    description: '深层承压水超采区，地面沉降重点模拟区',
    hydraulic: { k: 5, thickness: 60, storage: 0.0005, gradient: 0.001, porosity: 0.15, alphaL: 30, isConfined: true },
    domain: { length: 80000, width: 60000, layers: 5 },
    totalTime: 7300,
    method: 'crank-nicolson',
  },
  {
    name: '沧州滨海区（海水入侵）',
    description: '滨海区咸淡水界面运移模拟，需耦合溶质运移',
    hydraulic: { k: 8, thickness: 30, storage: 0.001, gradient: 0.0005, porosity: 0.20, alphaL: 20, isConfined: false },
    domain: { length: 30000, width: 20000, layers: 4 },
    totalTime: 3650,
    method: 'crank-nicolson',
  },
  {
    name: '燕山山区岩溶水（承德）',
    description: '岩溶裂隙含水层，非均质性强，等效多孔介质',
    hydraulic: { k: 3, thickness: 20, storage: 0.005, gradient: 0.005, porosity: 0.08, alphaL: 15, isConfined: false },
    domain: { length: 20000, width: 15000, layers: 2 },
    totalTime: 1825,
    method: 'implicit',
  },
  {
    name: '邢台东部平原（限采区）',
    description: '浅层潜水-微承压水，农业开采影响',
    hydraulic: { k: 10, thickness: 25, storage: 0.12, gradient: 0.0015, porosity: 0.22, alphaL: 40, isConfined: false },
    domain: { length: 40000, width: 35000, layers: 2 },
    totalTime: 3650,
    method: 'implicit',
  },
  {
    name: '张家口坝上高原（生态脆弱区）',
    description: '薄层含水层，生态水位敏感区',
    hydraulic: { k: 2, thickness: 15, storage: 0.08, gradient: 0.003, porosity: 0.15, alphaL: 10, isConfined: false },
    domain: { length: 25000, width: 20000, layers: 1 },
    totalTime: 1825,
    method: 'explicit',
  },
];

// ═══════════════════════════════════════════════════════
// 批量计算与汇总
// ═══════════════════════════════════════════════════════


export function calcAllPresetZones() {
  return PRESET_MODEL_ZONES.map(zone => {
    const hydraulicResult = calcHydraulicParams(zone.hydraulic);
    const gridResult = calcGridParams({
      domainLength: zone.domain.length,
      domainWidth: zone.domain.width,
      layers: zone.domain.layers,
      hydraulic: zone.hydraulic,
      resolutionLevel: 3,
    });
    const timeStepResult = calcTimeStep({
      transmissivity: hydraulicResult.transmissivity,
      storage: zone.hydraulic.storage,
      dx: gridResult.dx,
      totalTime: zone.totalTime,
      method: zone.method,
    });
    const stabilityResult = calcStability({
      dx: gridResult.dx,
      k: zone.hydraulic.k,
      thickness: zone.hydraulic.thickness,
      storage: zone.hydraulic.storage,
      porosity: zone.hydraulic.porosity,
      gradient: zone.hydraulic.gradient,
      alphaL: zone.hydraulic.alphaL,
      dt: timeStepResult.suggestedDt,
      isExplicit: zone.method === 'explicit',
    });
    return { zone, hydraulicResult, gridResult, timeStepResult, stabilityResult };
  });
}

