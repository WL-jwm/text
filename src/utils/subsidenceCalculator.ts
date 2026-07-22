/**
 * B-12 地面沉降与降落漏斗分析引擎
 *
 * 功能：
 *  1. 降落漏斗计算（Theis非稳定流 / Dupuit稳定流 / 经验公式）
 *  2. 漏斗体积/影响范围计算
 *  3. 地面沉降估算（有效应力原理）
 *  4. 沉降趋势分析与预测
 *  5. 沉降风险分区判定
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export type FlowModel = 'Theis' | 'Dupuit' | '经验公式';

export type SubsidenceRisk = '低' | '中' | '较高' | '高' | '严重';

export interface ConeInput {
  /** 开采量 Q (m³/d) */
  Q: number;
  /** 导水系数 T (m²/d) */
  T: number;
  /** 储水系数 S (无量纲) */
  S: number;
  /** 含水层厚度 M (m) */
  M: number;
  /** 井半径 rw (m) */
  rw: number;
  /** 抽水时间 t (d) */
  t: number;
  /** 渗透系数 K (m/d) */
  K: number;
  /** 计算模型 */
  model: FlowModel;
  /** 影响半径经验系数（仅经验公式） */
  expCoeff?: number;
}

export interface ConeResult {
  /** 井中降深 (m) */
  drawdown: number;
  /** 影响半径 R (m) */
  influenceRadius: number;
  /** 漏斗体积 (m³) */
  coneVolume: number;
  /** 漏斗面积 (km²) */
  coneArea: number;
  /** 各距离降深 */
  drawdownProfile: Array<{ distance: number; drawdown: number }>;
  /** 计算模型说明 */
  modelNote: string;
}

export interface SubsidenceInput {
  /** 含水层厚度 b (m) */
  b: number;
  /** 储水率 Ss (1/m) */
  Ss: number;
  /** 水位降深 Δh (m) */
  deltaH: number;
  /** 孔隙比 e0 */
  e0: number;
  /** 压缩指数 Cc */
  Cc: number;
  /** 初始有效应力 σ0' (kPa) */
  sigma0: number;
  /** 土层数 */
  layerCount: number;
  /** 各土层厚度 (m) */
  layerThicknesses: number[];
  /** 各土层Ss (1/m) */
  layerSs: number[];
  /** 各土层Δh (m) */
  layerDeltaH: number[];
}

export interface SubsidenceResult {
  /** 总沉降量 (mm) */
  totalSubsidence: number;
  /** 各层沉降量 (mm) */
  layerSubsidence: number[];
  /** 分层压缩量 (mm) */
  compression: number;
  /** 沉降风险等级 */
  riskLevel: SubsidenceRisk;
  /** 风险颜色 */
  riskColor: string;
  /** 评估描述 */
  description: string;
}

export interface TrendPoint {
  year: number;
  /** 累计沉降量 (mm) */
  cumulative: number;
  /** 年沉降速率 (mm/a) */
  rate: number;
  /** 是否为预测值 */
  predicted: boolean;
}

export interface RiskZone {
  name: string;
  range: string;
  color: string;
  description: string;
  measure: string;
}

// ═══════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════

export const SUBSIDENCE_RISK_META: Record<SubsidenceRisk, { color: string; bgColor: string }> = {
  '低': { color: '#10b981', bgColor: 'bg-emerald-500/15' },
  '中': { color: '#3b82f6', bgColor: 'bg-blue-500/15' },
  '较高': { color: '#f59e0b', bgColor: 'bg-amber-500/15' },
  '高': { color: '#f97316', bgColor: 'bg-orange-500/15' },
  '严重': { color: '#ef4444', bgColor: 'bg-red-500/15' },
};

export const RISK_ZONES: RiskZone[] = [
  { name: '低风险', range: '<50mm', color: '#10b981', description: '累计沉降量<50mm，年速率<5mm/a', measure: '常规监测' },
  { name: '中风险', range: '50~200mm', color: '#3b82f6', description: '累计沉降50~200mm，年速率5~15mm/a', measure: '控制开采+加密监测' },
  { name: '较高风险', range: '200~500mm', color: '#f59e0b', description: '累计沉降200~500mm，年速率15~30mm/a', measure: '限采+回灌+地面设施防护' },
  { name: '高风险', range: '500~1000mm', color: '#f97316', description: '累计沉降500~1000mm，年速率30~50mm/a', measure: '禁采+回灌+建筑物加固' },
  { name: '严重', range: '>1000mm', color: '#ef4444', description: '累计沉降>1000mm，年速率>50mm/a', measure: '应急措施+深部禁采+替代水源' },
];

export const LAYER_TYPES = [
  { name: '粉质黏土', Ss: 0.0005, e0: 0.8, Cc: 0.15 },
  { name: '黏土', Ss: 0.0008, e0: 1.0, Cc: 0.20 },
  { name: '粉土', Ss: 0.0003, e0: 0.6, Cc: 0.10 },
  { name: '粉细砂', Ss: 0.0002, e0: 0.5, Cc: 0.05 },
  { name: '中粗砂', Ss: 0.0001, e0: 0.4, Cc: 0.03 },
  { name: '砾砂', Ss: 0.00005, e0: 0.3, Cc: 0.02 },
];

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

// ═══════════════════════════════════════════════════════
// 预设数据
// ═══════════════════════════════════════════════════════

/** 河北典型地面沉降监测数据（历史数据 + 预测） */
export const SUBSIDENCE_TREND: TrendPoint[] = [
  { year: 1990, cumulative: 30, rate: 5, predicted: false },
  { year: 1995, cumulative: 60, rate: 6, predicted: false },
  { year: 2000, cumulative: 110, rate: 10, predicted: false },
  { year: 2005, cumulative: 190, rate: 16, predicted: false },
  { year: 2010, cumulative: 310, rate: 24, predicted: false },
  { year: 2015, cumulative: 450, rate: 28, predicted: false },
  { year: 2020, cumulative: 570, rate: 24, predicted: false },
  { year: 2024, cumulative: 660, rate: 18, predicted: false },
  { year: 2025, cumulative: 680, rate: 16, predicted: true },
  { year: 2026, cumulative: 700, rate: 14, predicted: true },
  { year: 2028, cumulative: 730, rate: 12, predicted: true },
  { year: 2030, cumulative: 755, rate: 10, predicted: true },
];

/** 典型漏斗输入预设 */
export const TYPICAL_CONE_INPUTS: Array<{ name: string; input: ConeInput }> = [
  { name: '浅层开采井', input: { Q: 3000, T: 500, S: 0.1, M: 40, rw: 0.3, t: 365, K: 12.5, model: 'Dupuit' } },
  { name: '深层开采井', input: { Q: 5000, T: 800, S: 0.001, M: 80, rw: 0.3, t: 365, K: 10, model: 'Dupuit' } },
  { name: '降水疏干井', input: { Q: 1000, T: 300, S: 0.15, M: 20, rw: 0.3, t: 90, K: 15, model: 'Theis' } },
  { name: '基岩开采井', input: { Q: 2000, T: 200, S: 0.005, M: 100, rw: 0.3, t: 365, K: 2, model: 'Dupuit' } },
  { name: '水源地开采井', input: { Q: 8000, T: 1200, S: 0.08, M: 60, rw: 0.4, t: 365, K: 20, model: 'Theis' } },
];

/** 河北典型沉降区 */
export const SUBSIDENCE_ZONES = [
  { name: '沧州城区', cumulative: 1050, rate: 25, risk: '严重' as SubsidenceRisk },
  { name: '任丘油田区', cumulative: 880, rate: 20, risk: '高' as SubsidenceRisk },
  { name: '廊坊城区', cumulative: 620, rate: 18, risk: '高' as SubsidenceRisk },
  { name: '衡水城区', cumulative: 550, rate: 15, risk: '较高' as SubsidenceRisk },
  { name: '唐山丰南', cumulative: 480, rate: 12, risk: '较高' as SubsidenceRisk },
  { name: '邯郸东部', cumulative: 350, rate: 10, risk: '中' as SubsidenceRisk },
  { name: '保定北部', cumulative: 180, rate: 6, risk: '中' as SubsidenceRisk },
  { name: '石家庄市区', cumulative: 120, rate: 4, risk: '低' as SubsidenceRisk },
];

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
