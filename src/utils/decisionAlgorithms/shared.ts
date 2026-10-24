/**
 * 拆分自 decisionSupportAlgorithms.ts — 通用数值工具
 */

export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}
