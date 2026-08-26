/**
 * 历史水文地质参数计算 — 统计工具(P-III分位数等)
 */

export function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}


export function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}


export function round(v: number, d = 4): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// P-III型分布分位数近似（Wilson-Hilferty变换）

export function piiiQuantile(p: number, meanVal: number, cv: number, cs: number): number {
  // Wilson-Hilferty近似
  const z = whInverseCDF(1 - p / 100);
  const skew = cs / 2;
  const t = z + (skew - 1) / 6 * (z * z - 1) + skew / 36 * (z * z - 3) * z - skew * skew / 216 * (z * z * z * z - 6 * z * z + 3);
  return meanVal * (1 + cv * t);
}

// 标准正态分布分位数近似

function whInverseCDF(p: number): number {
  if (p <= 0) return -3;
  if (p >= 1) return 3;
  // Beasley-Springer-Moro算法
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q, r;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= phigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

// ═══════════════════════════════════════════════════════
// 1. 泉水流量频率分析
// ═══════════════════════════════════════════════════════

