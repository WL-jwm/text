/**
 * 同位素测年 — 衰变常量
 */

export const HALF_LIFE_3H = 12.32;
/** ³H衰变常数 (1/a) */

export const LAMBDA_3H = Math.LN2 / HALF_LIFE_3H;
/** ¹⁴C半衰期 (a) — Libby半衰期 */

export const HALF_LIFE_14C = 5730;
/** ¹⁴C衰变常数 (1/a) */

export const LAMBDA_14C = Math.LN2 / HALF_LIFE_14C;
/** ⁴He累积速率 (cm³STP/kg·a) — 典型值 */

export const HE4_ACCUM_RATE = 1e-8;

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

