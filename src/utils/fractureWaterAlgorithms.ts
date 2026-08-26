/**
 * 裂隙水计算 — 核心算法
 *  大井法涌水量 / 裂隙渗透系数(立方定律) / 径流模数 / 井群干扰
 */

import type { BigWellInput, BigWellResult, FractureMethodInput, FractureMethodResult, RunoffModulusInput, RunoffModulusResult, InterferenceInput, InterferenceResult } from './fractureWaterTypes';

function getGrade(Qh: number): BigWellResult['grade'] {
  if (Qh < 50) return '极小';
  if (Qh < 200) return '小';
  if (Qh < 500) return '中等';
  if (Qh < 1000) return '大';
  return '极大';
}

/**
 * 大井法裂隙水涌水量计算
 *
 * 潜水完整井: Q = 1.366 Kf (2H - s) s / (lgR - lgr0)
 * 承压水完整井: Q = 2.73 Kf M s / (lgR - lgr0)
 * 非完整井: 引入非完整井修正系数 ξ
 */

export function calcBigWell(input: BigWellInput): BigWellResult {
  const { Kf, M, r0, s0, H, R, aquiferType, completeness } = input;
  const lgR_r0 = Math.log10(R / r0);

  let Q: number;
  let formula: string;

  if (completeness === '完整井') {
    if (aquiferType === '潜水') {
      Q = 1.366 * Kf * (2 * H - s0) * s0 / lgR_r0;
      formula = 'Q = 1.366 Kf(2H-s)s / (lgR-lgr0)  [潜水完整井]';
    } else {
      Q = 2.73 * Kf * M * s0 / lgR_r0;
      formula = 'Q = 2.73 Kf·M·s / (lgR-lgr0)  [承压水完整井]';
    }
  } else {
    // 非完整井修正
    const l = input.filterLength ?? M * 0.5;
    const xi = 1 + 0.5 * Math.sqrt(l / M); // 非完整井修正系数简化
    if (aquiferType === '潜水') {
      Q = 1.366 * Kf * (2 * H - s0) * s0 / (lgR_r0 * xi);
      formula = `Q = 1.366 Kf(2H-s)s / [ξ·(lgR-lgr0)]  [潜水非完整井, ξ=${Math.round(xi * 100) / 100}]`;
    } else {
      Q = 2.73 * Kf * M * s0 / (lgR_r0 * xi);
      formula = `Q = 2.73 Kf·M·s / [ξ·(lgR-lgr0)]  [承压水非完整井, ξ=${Math.round(xi * 100) / 100}]`;
    }
  }

  const Qh = Q / 24;
  const specificQ = s0 > 0 ? Q / s0 : 0;

  return {
    name: input.name,
    Q: Math.round(Q),
    Qh: Math.round(Qh),
    specificQ: Math.round(specificQ),
    R,
    formula,
    grade: getGrade(Qh),
  };
}

/**
 * 裂隙率法涌水量计算
 * Kf = (n·b²·g) / (12·ν) × connectivity
 * Q = Kf × I × F
 * 其中 b 为裂隙开度(m)，n为裂隙率，g为重力加速度，ν为运动粘度
 */

export function calcFractureMethod(input: FractureMethodInput): FractureMethodResult {
  const { fractureRatio: n, fractureAperture: b_mm, connectivity, hydraulicGradient: I, crossSectionArea: F, fractureDensity } = input;

  // 裂隙渗透系数: Kf = n·b²·g / (12·ν) × connectivity
  // g = 9.81 m/s², ν = 1.0e-6 m²/s (15°C水)
  const b = b_mm / 1000; // mm → m
  const g = 9.81;
  const nu = 1.0e-6;
  // Kf (m/s) → (m/d)
  const Kf = (n * b * b * g) / (12 * nu) * connectivity * 86400;
  const Keq = Kf * (1 + fractureDensity * 0.1); // 裂隙密度修正
  const Q = Keq * I * F * 86400; // m³/d

  let grade: FractureMethodResult['fractureGrade'];
  if (Kf < 0.05) grade = '极弱';
  else if (Kf < 0.15) grade = '弱';
  else if (Kf < 0.35) grade = '中等';
  else if (Kf < 0.80) grade = '强';
  else grade = '极强';

  const note = `裂隙率n=${(n * 100).toFixed(2)}%，开度b=${b_mm}mm，密度${fractureDensity}条/m，连通系数${connectivity}。` +
    `Kf = n·b²·g/(12ν)·c = ${Math.round(Kf * 10000) / 10000} m/d，等效渗透系数 = ${Math.round(Keq * 10000) / 10000} m/d。`;

  return {
    name: input.name,
    Kf: Math.round(Kf * 10000) / 10000,
    Keq: Math.round(Keq * 10000) / 10000,
    Q: Math.round(Q),
    fractureGrade: grade,
    note,
  };
}

/**
 * 经验径流模数法
 * Q = M × F × guaranteeFactor
 * M单位 L/s·km²，F单位 km²，结果 m³/d
 */

export function calcRunoffModulus(input: RunoffModulusInput): RunoffModulusResult {
  const { runoffModulus: M, area: F, guaranteeFactor } = input;
  // Q = M(L/s·km²) × F(km²) × guaranteeFactor → L/s → m³/d
  const Q_Ls = M * F * guaranteeFactor;
  const Q = Q_Ls * 86.4; // L/s → m³/d (× 3.6 × 24)
  const Qh = Q / 24;
  const annualResource = Q * 365 / 1e4;

  let grade: RunoffModulusResult['modulusGrade'];
  if (M < 1) grade = '贫乏';
  else if (M < 3) grade = '较贫乏';
  else if (M < 5) grade = '中等';
  else if (M < 8) grade = '较丰富';
  else grade = '丰富';

  return {
    name: input.name,
    Q: Math.round(Q),
    Qh: Math.round(Qh),
    annualResource: Math.round(annualResource * 10) / 10,
    modulusGrade: grade,
  };
}

/**
 * 群孔干扰降深预测
 * 叠加原理: 总降深 = Σ 单孔降深
 * 干扰折减: 实际总量 < 理论总量（n × q）
 */

export function calcInterference(input: InterferenceInput): InterferenceResult {
  const { wellCount: n, singleWellQ: q, wellSpacing: d, singleRadius: R, K, M } = input;
  const T = K * M;

  const theoreticalQ = n * q;

  // 干扰判断：孔间距 < 2R时产生干扰
  const interferenceRatio = d / (2 * R);

  let reductionFactor: number;
  let interferenceLevel: InterferenceResult['interferenceLevel'];

  if (interferenceRatio >= 1) {
    reductionFactor = 1.0;
    interferenceLevel = '无干扰';
  } else if (interferenceRatio >= 0.7) {
    reductionFactor = 0.90;
    interferenceLevel = '弱干扰';
  } else if (interferenceRatio >= 0.4) {
    reductionFactor = 0.75;
    interferenceLevel = '中等干扰';
  } else {
    reductionFactor = 0.55;
    interferenceLevel = '强干扰';
  }

  const totalQ = theoreticalQ * reductionFactor;

  // 叠加降深估算（Theis近似，单孔降深 + 邻孔影响）
  // s = Q/(4πT) × ln(R²/(r₀ × d^(n-1)))
  const singleDrawdown = q / (4 * Math.PI * T) * Math.log(R * R / (Math.E * d * d));
  const interferenceDrawdown = singleDrawdown * (1 + (n - 1) * (1 - interferenceRatio));

  const note = `群孔${n}个，间距${d}m，单孔影响半径${R}m。` +
    `干扰比 d/(2R)=${Math.round(interferenceRatio * 100) / 100}，` +
    `${interferenceLevel}，折减系数=${reductionFactor}。` +
    `理论总量${Math.round(theoreticalQ)}m³/d → 实际${Math.round(totalQ)}m³/d。`;

  return {
    name: input.name,
    totalQ: Math.round(totalQ),
    theoreticalQ: Math.round(theoreticalQ),
    reductionFactor,
    interferenceDrawdown: Math.round(interferenceDrawdown * 10) / 10,
    interferenceLevel,
    note,
  };
}

/**
 * 批量计算预设岩性大井法
 */
