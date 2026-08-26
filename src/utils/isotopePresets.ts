/**
 * 同位素测年 — 预设监测点与汇总
 */

import type { IsotopePreset } from './isotopeTypes';
import { calcTritiumAge, calcCarbon14Age, calcHelium4Age, calcRechargeTemp } from './isotopeAlgorithms';
import { HE4_ACCUM_RATE } from './isotopeConstants';

export const PRESET_SITES: IsotopePreset[] = [
  { name: '石家庄浅层', location: '石家庄市区', aquiferType: '潜水', tritium: 15.2, c14: 85, delta13C: -12, he4: 5e-8, delta18O: -8.2, deltaD: -60, depth: 30, note: '现代水，大气降水补给' },
  { name: '保定浅层', location: '保定市区', aquiferType: '潜水', tritium: 12.5, c14: 78, delta13C: -11, he4: 8e-8, delta18O: -8.5, deltaD: -63, depth: 35, note: '现代水，山前补给' },
  { name: '衡水中层', location: '衡水市区', aquiferType: '承压水', tritium: 3.8, c14: 45, delta13C: -9, he4: 5e-7, delta18O: -9.1, deltaD: -68, depth: 150, note: '次现代-老水混合' },
  { name: '沧州深层', location: '沧州市区', aquiferType: '承压水', tritium: 0.5, c14: 15, delta13C: -6, he4: 2e-6, delta18O: -9.8, deltaD: -74, depth: 350, note: '古水，补给年龄千年级' },
  { name: '廊坊深层', location: '廊坊市区', aquiferType: '承压水', tritium: 0.3, c14: 8, delta13C: -5, he4: 3.5e-6, delta18O: -10.2, deltaD: -77, depth: 400, note: '古水，⁴He年龄万年级' },
  { name: '唐山岩溶水', location: '唐山市区', aquiferType: '岩溶水', tritium: 8.5, c14: 62, delta13C: -10, he4: 1.5e-7, delta18O: -8.8, deltaD: -65, depth: 120, note: '岩溶水，半现代' },
  { name: '邢台深层', location: '邢台市区', aquiferType: '承压水', tritium: 0.8, c14: 22, delta13C: -7, he4: 1.8e-6, delta18O: -9.5, deltaD: -71, depth: 300, note: '老水-古水过渡' },
  { name: '邯郸岩溶水', location: '邯郸峰峰', aquiferType: '岩溶水', tritium: 10.2, c14: 70, delta13C: -11, he4: 1e-7, delta18O: -8.6, deltaD: -62, depth: 80, note: '岩溶水，现代补给为主' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * ³H放射性衰变年龄
 *
 * 活塞流模型: t = -ln(C/C0) / λ
 * 指数模型: C/C0 = λ/(λ+1/τ) → t = τ (平均年龄)
 */

export function calcAllPresetSites() {
  return PRESET_SITES.map(s => {
    const tritiumResult = calcTritiumAge({
      name: s.name, measuredTU: s.tritium, initialTU: 20, model: 'piston',
    });
    const c14Result = calcCarbon14Age({
      name: s.name, measuredPMC: s.c14, initialPMC: 100,
      delta13C: s.delta13C, rechargeDelta13C: -13, dilutionFactor: 0.15,
    });
    const he4Result = calcHelium4Age({
      name: s.name, measuredHe4: s.he4, atmosphericHe4: 4e-8, accumRate: HE4_ACCUM_RATE,
    });
    const tempResult = calcRechargeTemp({
      name: s.name, delta18O: s.delta18O, deltaD: s.deltaD,
      lmwlSlope: 7.8, lmwlIntercept: 9,
      d18OTempSlope: 0.3, elevationGradient: -0.25,
      referenceElevation: 50, referenceDelta18O: -8.0,
    });
    return { site: s, tritiumResult, c14Result, he4Result, tempResult };
  });
}

/**
 * 汇总统计
 */

export function calcIsotopeSummary() {
  const results = calcAllPresetSites();
  const modernCount = results.filter(r => r.tritiumResult.ageGrade === '现代水(<10a)').length;
  const paleoCount = results.filter(r => r.c14Result.ageGrade === '千年级' || r.c14Result.ageGrade === '万年级').length;
  const avgC14Age = results.reduce((s, r) => s + r.c14Result.recommendedAge, 0) / results.length;
  const avgRechargeTemp = results.reduce((s, r) => s + r.tempResult.rechargeTemp, 0) / results.length;
  const avgDExcess = results.reduce((s, r) => s + r.tempResult.dExcess, 0) / results.length;
  const maxAge = Math.max(...results.map(r => r.he4Result.estimatedAge));

  return {
    siteCount: results.length,
    modernCount,
    paleoCount,
    avgC14Age: Math.round(avgC14Age),
    avgRechargeTemp: Math.round(avgRechargeTemp * 10) / 10,
    avgDExcess: Math.round(avgDExcess * 10) / 10,
    maxAge,
  };
}

