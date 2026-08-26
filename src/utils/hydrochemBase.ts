/**
 * 水化学计算 — 摩尔质量/单位换算/离子平衡
 */

import type { IonMmolResult } from './hydrochemTypes';

export const MOLAR_MASS = {
  Ca: 40.08,
  Mg: 24.31,
  Na: 22.99,
  K: 39.10,
  HCO3: 61.02,
  SO4: 96.06,
  Cl: 35.45,
} as const;

/** 毫摩尔浓度换算 (mg/L → mmol/L) */

export function toMmol(mgPerL: number, molarMass: number): number {
  return mgPerL / molarMass;
}

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 计算6大离子毫摩尔浓度
 */

export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * 离子平衡误差检验
 * 误差 = |Σ阳离子 - Σ阴离子| / (Σ阳离子 + Σ阴离子) × 100%
 * 通常要求 < 5%
 */

export function checkIonBalance(mmol: IonMmolResult): { error: number; pass: boolean } {
  const sum = mmol.totalCation + mmol.totalAnion;
  if (sum === 0) return { error: 0, pass: true };
  const error = Math.abs(mmol.totalCation - mmol.totalAnion) / sum * 100;
  return { error: round(error, 2), pass: error < 5 };
}

