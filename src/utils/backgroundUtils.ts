/**
 * 地下水背景值计算 — 统计工具
 */

export function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}


export function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}


export function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return 0;
  if (n % 2 === 0) return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return sorted[Math.floor(n / 2)];
}


export function round(v: number, d = 4): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// 格鲁布斯检验临界值表 (α=0.05)

export function grubbsCritical(n: number): number {
  if (n < 3) return 1.15;
  if (n <= 30) {
    // 近似公式: G_α ≈ 1.73 + 0.42×ln(n) (α=0.05 近似)
    return 1.73 + 0.42 * Math.log(n);
  }
  return 3.0; // 大样本保守值
}

// ═══════════════════════════════════════════════════════
// 1. 背景值确定
// ═══════════════════════════════════════════════════════

