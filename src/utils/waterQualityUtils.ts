/**
 * 水质评价计算 — 标准限值解析工具
 */

import type { LimitRange } from './waterQualityTypes';

export function parseLimit(limitStr: string): LimitRange | null {
  const s = limitStr.trim();

  // "≤X" 格式
  const leMatch = s.match(/^≤(\d+\.?\d*)$/);
  if (leMatch) {
    return { low: -Infinity, high: parseFloat(leMatch[1]), inclusive: true };
  }

  // ">X" 格式
  const gtMatch = s.match(/^>(\d+\.?\d*)$/);
  if (gtMatch) {
    return { low: parseFloat(gtMatch[1]), high: Infinity, inclusive: false };
  }

  // "A~B" 范围格式
  const rangeMatch = s.match(/^([\d.]+)[~—]([\d.]+)$/);
  if (rangeMatch) {
    return { low: parseFloat(rangeMatch[1]), high: parseFloat(rangeMatch[2]), inclusive: true };
  }

  // "无" 或 "有" 等非数值
  return null;
}

/**
 * 解析限值为数值（取上限值）
 * 用于标准指数法 Pi 计算，取III类上限值作为分母
 */

export function parseLimitValue(limitStr: string): number | null {
  const range = parseLimit(limitStr);
  if (!range) return null;
  return isFinite(range.high) ? range.high : null;
}

// ═══════════════════════════════════════════════════════
// pH 标准指数法（特殊处理）
// ═══════════════════════════════════════════════════════

/**
 * pH 标准指数法
 * PpH = (7.0 - pHi) / (7.0 - pHsd)   当 pHi < 7.0
 * PpH = (pHi - 7.0) / (pHsu - 7.0)   当 pHi > 7.0
 * PpH = 0                              当 7.0 ≤ pHi ≤ pHsu 且 pHsd ≤ 7.0
 */
