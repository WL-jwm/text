/**
 * 地下水功能评价 — 维度权重与指标评分函数
 */


export const DIMENSION_WEIGHTS = {
  supply: 0.35,
  ecology: 0.20,
  geoEnvironment: 0.25,
  regulation: 0.20,
};

/** 评分→等级映射 */

export function scoreToGrade(score: number): string {
  if (score >= 85) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 55) return '中等';
  if (score >= 40) return '较差';
  return '差';
}

/** 评分→颜色映射 */

export function scoreToColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#06b6d4';
  if (score >= 55) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/** 评分→评级标签 */

export function scoreToRating(score: number): string {
  if (score >= 85) return '优';
  if (score >= 70) return '良';
  if (score >= 55) return '中';
  if (score >= 40) return '差';
  return '极差';
}

// ── 供水功能评分 ──


export function scoreWellYield(yield_m3d: number): number {
  if (yield_m3d >= 5000) return 95;
  if (yield_m3d >= 2000) return 80;
  if (yield_m3d >= 1000) return 65;
  if (yield_m3d >= 500) return 50;
  if (yield_m3d >= 100) return 35;
  return 20;
}


export function scoreWaterQuality(grade: number): number {
  // Ⅰ=95, Ⅱ=85, Ⅲ=70, Ⅳ=50, Ⅴ=30
  const scores = [0, 95, 85, 70, 50, 30];
  return scores[Math.min(5, Math.max(1, grade))] ?? 30;
}


export function scoreExploitableModulus(modulus: number): number {
  if (modulus >= 20) return 90;
  if (modulus >= 10) return 75;
  if (modulus >= 5) return 60;
  if (modulus >= 2) return 45;
  if (modulus >= 1) return 30;
  return 15;
}


export function scoreUtilizationRate(rate: number): number {
  // 利用率越低，供水功能潜力越大（反向评分）
  if (rate <= 30) return 90;
  if (rate <= 50) return 75;
  if (rate <= 70) return 60;
  if (rate <= 85) return 45;
  if (rate <= 100) return 30;
  return 15; // 超采
}

// ── 生态功能评分 ──


export function scoreBaseflow(ratio: number): number {
  if (ratio >= 60) return 90;
  if (ratio >= 40) return 75;
  if (ratio >= 20) return 60;
  if (ratio >= 10) return 45;
  if (ratio > 0) return 30;
  return 15;
}


export function scoreWetland(dep: number): number {
  // 1~5，5为最高依赖
  const scores = [0, 20, 40, 60, 80, 95];
  return scores[Math.min(5, Math.max(1, dep))] ?? 20;
}


export function scoreVegetation(dep: number): number {
  if (dep >= 60) return 90;
  if (dep >= 40) return 75;
  if (dep >= 20) return 60;
  if (dep >= 10) return 45;
  if (dep > 0) return 30;
  return 15;
}

// ── 地质环境功能评分 ──


export function scoreSubsidence(rate: number): number {
  // 沉降速率越低，地质环境功能越好
  if (rate <= 0) return 95;
  if (rate <= 5) return 80;
  if (rate <= 10) return 65;
  if (rate <= 20) return 50;
  if (rate <= 40) return 35;
  return 20;
}


export function scoreSeawaterIntrusion(dist: number): number {
  if (dist <= 0) return 95;
  if (dist <= 1) return 70;
  if (dist <= 3) return 55;
  if (dist <= 5) return 40;
  if (dist <= 10) return 25;
  return 15;
}


export function scoreSalinization(ratio: number): number {
  if (ratio <= 0) return 95;
  if (ratio <= 5) return 80;
  if (ratio <= 15) return 65;
  if (ratio <= 30) return 50;
  if (ratio <= 50) return 35;
  return 20;
}

// ── 调节功能评分 ──


export function scoreAquiferThickness(thickness: number): number {
  if (thickness >= 50) return 90;
  if (thickness >= 30) return 75;
  if (thickness >= 15) return 60;
  if (thickness >= 5) return 45;
  if (thickness >= 1) return 30;
  return 15;
}


export function scoreSpecificYield(sy: number): number {
  if (sy >= 0.25) return 90;
  if (sy >= 0.15) return 75;
  if (sy >= 0.08) return 60;
  if (sy >= 0.04) return 45;
  if (sy >= 0.02) return 30;
  return 15;
}


export function scoreRecharge(recharge: number): number {
  if (recharge >= 200) return 90;
  if (recharge >= 100) return 75;
  if (recharge >= 50) return 60;
  if (recharge >= 20) return 45;
  if (recharge >= 10) return 30;
  return 15;
}


export function scoreAmplitude(amp: number): number {
  // 水位变幅越小，调节能力越强
  if (amp <= 1) return 90;
  if (amp <= 2) return 75;
  if (amp <= 4) return 60;
  if (amp <= 6) return 45;
  if (amp <= 10) return 30;
  return 15;
}

// ═══════════════════════════════════════════════════════
// 维度计算
// ═══════════════════════════════════════════════════════

