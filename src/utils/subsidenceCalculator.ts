/**
 * B-12 地面沉降与降落漏斗分析引擎
 *
 * 功能：
 *  1. 降落漏斗计算（Theis非稳定流 / Dupuit稳定流 / 经验公式）
 *  2. 漏斗体积/影响范围计算
 *  3. 地面沉降估算（有效应力原理）
 *  4. 沉降趋势分析与预测
 *  5. 沉降风险分区判定
 *
 * 类型已拆分至 subsidenceTypes.ts，常量与预设数据至 subsidenceData.ts。
 */

export type { FlowModel, SubsidenceRisk, ConeInput, ConeResult, SubsidenceInput, SubsidenceResult, TrendPoint, RiskZone } from './subsidenceTypes';
export { SUBSIDENCE_RISK_META, RISK_ZONES, LAYER_TYPES, SUBSIDENCE_TREND, TYPICAL_CONE_INPUTS, SUBSIDENCE_ZONES } from './subsidenceData';
import type { ConeInput, ConeResult, SubsidenceInput, SubsidenceResult, SubsidenceRisk } from './subsidenceTypes';

// ═══════════════════════════════════════════════════════
// 计算函数
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// 核心函数
// ═══════════════════════════════════════════════════════

/**
 * Theis井函数 W(u) 近似计算
 * W(u) = -0.577216 - ln(u) + u - u²/4 + u³/18 - u⁴/96
 * 适用范围：u < 1（对于u > 1使用无穷级数前几项）
 */
function theisWellFunction(u: number): number {
  if (u <= 0) return Infinity;
  if (u > 10) {
    // 当u很大时，W(u) ≈ 1/(u·e^u) 已趋近于0
    return 0;
  }
  // 级数展开前8项
  let sum = -0.57721566 - Math.log(u);
  let term = u;
  for (let n = 1; n <= 20; n++) {
    sum += term / (n * (n + 1));
    term *= -u / (n + 1);
    if (Math.abs(term) < 1e-10) break;
  }
  return sum;
}

/**
 * 计算降落漏斗
 */
export function calcCone(input: ConeInput): ConeResult {
  const { Q, T, S, rw, t, K, model } = input;
  const expCoeff = input.expCoeff ?? 3000;

  let drawdown = 0;
  let influenceRadius = 0;
  let modelNote = '';
  const profile: Array<{ distance: number; drawdown: number }> = [];

  if (model === 'Theis') {
    // Theis非稳定流公式
    // s = Q/(4πT) × W(u), u = r²S/(4Tt)
    modelNote = 'Theis非稳定流公式：s = Q/(4πT)·W(u)，适用于抽水初期/非稳定状态';

    // 井壁降深
    const u_w = (rw * rw * S) / (4 * T * t);
    const W_w = theisWellFunction(u_w);
    drawdown = (Q / (4 * Math.PI * T)) * W_w;

    // 影响半径（取s=0.01m处的距离）
    // 通过迭代求解
    let R = rw;
    for (let step = 100; step <= 10000; step += 100) {
      const u_r = (step * step * S) / (4 * T * t);
      const W_r = theisWellFunction(u_r);
      const s_r = (Q / (4 * Math.PI * T)) * W_r;
      if (s_r < 0.01) {
        R = step;
        break;
      }
    }
    influenceRadius = R;

    // 剖面
    const distances = [rw, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    for (const d of distances) {
      if (d > R) { profile.push({ distance: d, drawdown: 0 }); continue; }
      const u_d = (d * d * S) / (4 * T * t);
      const W_d = theisWellFunction(u_d);
      const s_d = (Q / (4 * Math.PI * T)) * W_d;
      profile.push({ distance: d, drawdown: Math.max(0, s_d) });
    }
  } else if (model === 'Dupuit') {
    // Dupuit稳定流公式
    // s = Q/(2πT) × ln(R/r)
    modelNote = 'Dupuit稳定流公式：s = Q/(2πT)·ln(R/r)，适用于长期抽水/拟稳定状态';

    // 经验影响半径 R = 3000s (s为降深)
    // 迭代求解
    let R = 1000;
    for (let i = 0; i < 10; i++) {
      const s = (Q / (2 * Math.PI * T)) * Math.log(R / rw);
      R = expCoeff * Math.max(0.1, s);
    }
    influenceRadius = R;
    drawdown = (Q / (2 * Math.PI * T)) * Math.log(influenceRadius / rw);

    // 剖面
    const distances = [rw, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    for (const d of distances) {
      if (d > influenceRadius) { profile.push({ distance: d, drawdown: 0 }); continue; }
      const s_d = d <= rw ? drawdown : (Q / (2 * Math.PI * T)) * Math.log(influenceRadius / d);
      profile.push({ distance: d, drawdown: Math.max(0, s_d) });
    }
  } else {
    // 经验公式法
    modelNote = `经验公式法：R = ${expCoeff}√(s·K)，适用初步估算`;

    // 先用Dupuit估算降深，再计算R
    const R_est = 500;
    const s_est = (Q / (2 * Math.PI * T)) * Math.log(R_est / rw);
    influenceRadius = expCoeff * Math.sqrt(Math.max(0.1, s_est) * K);
    drawdown = (Q / (2 * Math.PI * T)) * Math.log(influenceRadius / rw);

    const distances = [rw, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    for (const d of distances) {
      if (d > influenceRadius) { profile.push({ distance: d, drawdown: 0 }); continue; }
      const s_d = d <= rw ? drawdown : (Q / (2 * Math.PI * T)) * Math.log(influenceRadius / d);
      profile.push({ distance: d, drawdown: Math.max(0, s_d) });
    }
  }

  // 漏斗体积近似为圆锥体体积
  // V = (1/3) × π × R² × s_avg，s_avg ≈ drawdown/3
  const avgDrawdown = drawdown / 3;
  const coneVolume = (1 / 3) * Math.PI * influenceRadius * influenceRadius * avgDrawdown;

  // 漏斗面积
  const coneArea = Math.PI * influenceRadius * influenceRadius / 1_000_000;

  return {
    drawdown: round(drawdown, 2),
    influenceRadius: round(influenceRadius, 0),
    coneVolume: round(coneVolume, 0),
    coneArea: round(coneArea, 2),
    drawdownProfile: profile,
    modelNote,
  };
}

/**
 * 地面沉降量估算（基于有效应力原理）
 *
 * ΔH = Ss × b × Δh
 * 或者用压缩指数法：
 * ΔH = (Cc × H0)/(1+e0) × log10((σ0' + Δσ')/σ0')
 * 其中 Δσ' = γw × Δh
 */
export function calcSubsidence(input: SubsidenceInput): SubsidenceResult {
  const { b, Ss, deltaH, e0, Cc, sigma0 } = input;

  // 方法1: 储水率法（适用于单层）
  const subsidence1 = Ss * b * deltaH * 1000; // mm

  // 方法2: 压缩指数法（考虑土体非线性）
  const gamma_w = 9.81; // kN/m³
  const deltaSigma = gamma_w * deltaH; // kPa
  const subsidence2 = (Cc * b * 1000) / (1 + e0) * Math.log10((sigma0 + deltaSigma) / sigma0);

  // 分层计算
  const layerSubsidence: number[] = [];
  let totalLayer = 0;
  for (let i = 0; i < input.layerCount; i++) {
    const s = input.layerSs[i] * input.layerThicknesses[i] * input.layerDeltaH[i] * 1000;
    layerSubsidence.push(round(s, 2));
    totalLayer += s;
  }

  // 取两种方法的平均值
  const total = totalLayer > 0 ? totalLayer : (subsidence1 + subsidence2) / 2;

  // 风险等级
  const { riskLevel, riskColor } = getSubsidenceRisk(total);

  let description: string;
  if (total < 50) description = '累计沉降量较小，属正常地层压缩';
  else if (total < 200) description = '存在一定沉降，需关注沉降速率变化';
  else if (total < 500) description = '沉降较显著，可能对地面建筑和基础设施产生影响';
  else if (total < 1000) description = '沉降严重，需采取控沉措施';
  else description = '累计沉降量超过1000mm，需紧急处置';

  return {
    totalSubsidence: round(total, 1),
    layerSubsidence,
    compression: round((subsidence1 + subsidence2) / 2, 2),
    riskLevel,
    riskColor,
    description,
  };
}

/**
 * 沉降风险等级判定
 */
export function getSubsidenceRisk(totalSubsidence: number): { riskLevel: SubsidenceRisk; riskColor: string } {
  let riskLevel: SubsidenceRisk;
  let riskColor: string;
  if (totalSubsidence >= 1000) { riskLevel = '严重'; riskColor = '#ef4444'; }
  else if (totalSubsidence >= 500) { riskLevel = '高'; riskColor = '#f97316'; }
  else if (totalSubsidence >= 200) { riskLevel = '较高'; riskColor = '#f59e0b'; }
  else if (totalSubsidence >= 50) { riskLevel = '中'; riskColor = '#3b82f6'; }
  else { riskLevel = '低'; riskColor = '#10b981'; }
  return { riskLevel, riskColor };
}

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
