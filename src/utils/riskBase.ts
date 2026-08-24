/**
 * B-31 地下水风险评估 — 共享风险等级与评分工具
 */

import type { RiskLevel } from './riskTypes';

export const RISK_SCORES: Record<RiskLevel, number> = {
  '极低': 1, '低': 2, '中等': 3, '高': 4, '极高': 5,
};


export function scoreToLevel(score: number): RiskLevel {
  if (score < 1.5) return '极低';
  if (score < 2.5) return '低';
  if (score < 3.5) return '中等';
  if (score < 4.5) return '高';
  return '极高';
}


export function clamp(v: number, min = 1, max = 10): number {
  return Math.max(min, Math.min(max, v));
}

// ═══════════════════════════════════════════════════════════════
// 1. 污染风险评价（改进DRASTIC）
// ═══════════════════════════════════════════════════════════════

