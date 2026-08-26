/**
 * 裂隙水计算 — 预设批量计算与汇总
 */

import type { BigWellResult, RunoffModulusResult } from './fractureWaterTypes';
import { calcBigWell, calcRunoffModulus } from './fractureWaterAlgorithms';
import { PRESET_LITHOLOGIES } from './fractureWaterPresets';

export function calcAllPresetBigWell(): BigWellResult[] {
  return PRESET_LITHOLOGIES.map(l => calcBigWell({
    name: l.name,
    aquiferType: '承压水',
    Kf: l.Kf,
    M: l.M,
    r0: l.r0,
    s0: l.s0,
    H: l.H,
    R: l.R,
    completeness: '完整井',
  }));
}

/**
 * 批量计算预设岩性径流模数法
 */

export function calcAllPresetRunoff(): RunoffModulusResult[] {
  return PRESET_LITHOLOGIES.map(l => calcRunoffModulus({
    name: l.name,
    lithology: l.rockType,
    runoffModulus: l.runoffModulus,
    area: 100, // 标准化面积100km²
    guaranteeFactor: 0.75, // P=75%
  }));
}

/**
 * 汇总统计
 */

export function calcFractureSummary() {
  const bigWellResults = calcAllPresetBigWell();
  const runoffResults = calcAllPresetRunoff();

  const totalBigWell = bigWellResults.reduce((s, r) => s + r.Qh, 0);
  const totalRunoff = runoffResults.reduce((s, r) => s + r.Qh, 0);
  const avgKf = PRESET_LITHOLOGIES.reduce((s, l) => s + l.Kf, 0) / PRESET_LITHOLOGIES.length;
  const maxQ = Math.max(...bigWellResults.map(r => r.Qh));
  const minQ = Math.min(...bigWellResults.map(r => r.Qh));
  const highYieldCount = bigWellResults.filter(r => r.grade === '大' || r.grade === '极大').length;

  return {
    lithologyCount: PRESET_LITHOLOGIES.length,
    totalBigWell: Math.round(totalBigWell),
    totalRunoff: Math.round(totalRunoff),
    avgKf: Math.round(avgKf * 100) / 100,
    maxQ,
    minQ,
    highYieldCount,
  };
}

