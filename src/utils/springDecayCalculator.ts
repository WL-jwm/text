/**
 * B-19 岩溶泉流量衰减分析引擎
 *
 * 功能：
 *  1. Maillet指数衰减模型 Qt = Q0·e^(-αt)
 *  2. 降水-泉流量滞后相关分析
 *  3. 衰减系数α与储水特征关联
 *  4. 系统调蓄功能评价（衰减期/补给期对比）
 *  5. 预设泉域数据（河北岩溶大泉6个）
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface DecayInput {
  /** 泉域名称 */
  name: string;
  /** 初始流量 Q0 (m³/s) */
  Q0: number;
  /** 衰减系数 α (1/d) */
  alpha: number;
  /** 衰减期持续天数 */
  duration: number;
  /** 衰减期起始日期（年内第几天） */
  startDay: number;
}

export interface DecayResult {
  name: string;
  /** 衰减期末流量 Qt (m³/s) */
  Qt: number;
  /** 衰减期总排泄量 (万m³) */
  totalDischarge: number;
  /** 流量衰减率 (%) */
  decayRate: number;
  /** 半衰期 — 流量减半所需天数 */
  halfLife: number;
  /** 衰减常数 α (1/d) */
  alpha: number;
  /** 储水量估算 (万m³) — Q0/α */
  storageEstimate: number;
  /** 调蓄能力评价 */
  regulation: '弱' | '中等' | '强' | '极强';
  /** 衰减曲线数据 */
  curve: Array<{ day: number; 流量: number; 累计量: number }>;
}

export interface CorrelationInput {
  /** 泉域名称 */
  name: string;
  /** 降水量序列 [{ month, rainfall, discharge }] */
  data: Array<{ month: string; rainfall: number; discharge: number }>;
  /** 最大滞后月数 */
  maxLag: number;
}

export interface CorrelationResult {
  name: string;
  /** 最佳滞后期（月） */
  bestLag: number;
  /** 最佳相关系数 */
  bestR: number;
  /** 相关性等级 */
  correlation: '弱' | '中等' | '强' | '极强';
  /** 各滞后期相关系数 */
  lagResults: Array<{ lag: number; r: number }>;
  /** 说明 */
  note: string;
}

export interface RegulationInput {
  /** 泉域名称 */
  name: string;
  /** 衰减系数 α (1/d) */
  alpha: number;
  /** 补给期平均流量 (m³/s) */
  rechargeQ: number;
  /** 衰减期平均流量 (m³/s) */
  decayQ: number;
  /** 衰减期天数 */
  decayDays: number;
  /** 补给期天数 */
  rechargeDays: number;
  /** 流量年变幅比 Qmax/Qmin */
  amplitudeRatio: number;
}

export interface RegulationResult {
  name: string;
  /** 衰减系数 α (1/d) */
  alpha: number;
  /** 调蓄系数 K = 衰减期均值/补给期均值 */
  regulationCoeff: number;
  /** 年调节量 (万m³) */
  annualRegulation: number;
  /** 流量变幅等级 */
  amplitudeGrade: '稳定' | '较稳定' | '变幅较大' | '极不稳定';
  /** 系统调蓄能力 */
  regulation: '弱' | '中等' | '强' | '极强';
  /** 储水特征描述 */
  storageDesc: string;
  /** 评价结论 */
  conclusion: string;
}

// ═══════════════════════════════════════════════════════
// 预设泉域数据（河北岩溶大泉）
// ═══════════════════════════════════════════════════════

export interface SpringPreset {
  name: string;
  location: string;
  Q0: number;
  alpha: number;
  decayDays: number;
  rechargeQ: number;
  amplitudeRatio: number;
  status: string;
  note: string;
}

export const PRESET_SPRINGS: SpringPreset[] = [
  { name: '威州泉', location: '石家庄井陉', Q0: 8.5, alpha: 0.008, decayDays: 180, rechargeQ: 12.0, amplitudeRatio: 2.1, status: '出流', note: '太行山前岩溶大泉，补给面积1200km²' },
  { name: '黑龙江洞泉', location: '邯郸峰峰', Q0: 7.2, alpha: 0.010, decayDays: 200, rechargeQ: 11.5, amplitudeRatio: 2.5, status: '已复涌', note: '峰峰矿区重要泉源，2021年复涌' },
  { name: '百泉', location: '邢台', Q0: 6.8, alpha: 0.012, decayDays: 210, rechargeQ: 10.5, amplitudeRatio: 2.8, status: '已复涌', note: '邢台历史水源地，2021年复涌结束40年干涸' },
  { name: '石鼓泉', location: '邢台临城', Q0: 3.5, alpha: 0.015, decayDays: 150, rechargeQ: 5.0, amplitudeRatio: 3.0, status: '季节性出流', note: '临城岩溶水系统，季节性变化大' },
  { name: '暖泉', location: '张家口怀来', Q0: 1.2, alpha: 0.020, decayDays: 120, rechargeQ: 2.0, amplitudeRatio: 4.5, status: '出流', note: '张家口山间盆地岩溶泉，流量较小' },
  { name: '洹泉', location: '邯郸涉县', Q0: 4.8, alpha: 0.009, decayDays: 190, rechargeQ: 7.0, amplitudeRatio: 2.3, status: '出流', note: '涉县岩溶水系统，补给面积800km²' },
];

// ═══════════════════════════════════════════════════════
// 衰减系数参考表
// ═══════════════════════════════════════════════════════

export interface AlphaRef {
  range: string;
  min: number;
  max: number;
  regulation: string;
  storageType: string;
  description: string;
}

export const ALPHA_REF_TABLE: AlphaRef[] = [
  { range: '<0.005', min: 0, max: 0.005, regulation: '极强', storageType: '巨大储水型', description: '岩溶管道-裂隙系统发育，储水量极大，流量极稳定' },
  { range: '0.005~0.010', min: 0.005, max: 0.010, regulation: '强', storageType: '大储水型', description: '岩溶裂隙发育，储水量大，流量稳定' },
  { range: '0.010~0.020', min: 0.010, max: 0.020, regulation: '中等', storageType: '中等储水型', description: '岩溶中等发育，有一定调蓄能力' },
  { range: '0.020~0.050', min: 0.020, max: 0.050, regulation: '弱', storageType: '小储水型', description: '岩溶发育较差，调蓄能力弱，流量变幅大' },
  { range: '≥0.050', min: 0.050, max: Infinity, regulation: '极弱', storageType: '极小储水型', description: '以管道流为主，快速响应降水，流量极不稳定' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

function getRegulationLevel(alpha: number): DecayResult['regulation'] {
  if (alpha < 0.005) return '极强';
  if (alpha < 0.010) return '强';
  if (alpha < 0.020) return '中等';
  return '弱';
}

/**
 * Maillet指数衰减模型
 * Qt = Q0 · e^(-αt)
 * 总排泄量 W = ∫₀ᵗ Q0·e^(-αt) dt = Q0/α · (1 - e^(-αt))
 */
export function calcDecay(input: DecayInput): DecayResult {
  const { Q0, alpha, duration } = input;
  const Qt = Q0 * Math.exp(-alpha * duration);
  const decayRate = ((Q0 - Qt) / Q0) * 100;
  const halfLife = alpha > 0 ? Math.LN2 / alpha : Infinity;
  // 总排泄量 W = Q0/α · (1 - e^(-α·T))，单位 m³ → 万m³
  const totalDischarge = (Q0 / alpha) * (1 - Math.exp(-alpha * duration)) * 86400 / 1e4;
  // 储水量估算 V ≈ Q0/α × 86400 (m³) → 万m³
  const storageEstimate = (Q0 / alpha) * 86400 / 1e4;

  // 衰减曲线
  const steps = 30;
  const curve: Array<{ day: number; 流量: number; 累计量: number }> = [];
  let cumulative = 0;
  for (let i = 0; i <= steps; i++) {
    const t = (duration / steps) * i;
    const Q = Q0 * Math.exp(-alpha * t);
    if (i > 0) {
      const tPrev = (duration / steps) * (i - 1);
      const Qprev = Q0 * Math.exp(-alpha * tPrev);
      const dt = duration / steps;
      // 梯形积分
      cumulative += (Q + Qprev) / 2 * dt * 86400 / 1e4;
    }
    curve.push({
      day: Math.round(t * 10) / 10,
      流量: Math.round(Q * 1000) / 1000,
      累计量: Math.round(cumulative * 10) / 10,
    });
  }

  return {
    name: input.name,
    Qt: Math.round(Qt * 1000) / 1000,
    totalDischarge: Math.round(totalDischarge * 10) / 10,
    decayRate: Math.round(decayRate * 10) / 10,
    halfLife: Math.round(halfLife * 10) / 10,
    alpha,
    storageEstimate: Math.round(storageEstimate * 10) / 10,
    regulation: getRegulationLevel(alpha),
    curve,
  };
}

/**
 * 降水-泉流量滞后相关分析
 * 计算不同滞后期下降水量与泉流量的Pearson相关系数
 */
export function calcCorrelation(input: CorrelationInput): CorrelationResult {
  const { data, maxLag } = input;
  const n = data.length;
  const rainfalls = data.map(d => d.rainfall);
  const discharges = data.map(d => d.discharge);

  const lagResults: Array<{ lag: number; r: number }> = [];

  for (let lag = 0; lag <= maxLag; lag++) {
    const pairs: Array<[number, number]> = [];
    for (let i = lag; i < n; i++) {
      pairs.push([rainfalls[i - lag], discharges[i]]);
    }
    const r = pearsonR(pairs);
    lagResults.push({ lag, r: Math.round(r * 1000) / 1000 });
  }

  const best = lagResults.reduce((max, cur) => Math.abs(cur.r) > Math.abs(max.r) ? cur : max);
  let correlation: CorrelationResult['correlation'];
  const absR = Math.abs(best.r);
  if (absR < 0.3) correlation = '弱';
  else if (absR < 0.6) correlation = '中等';
  else if (absR < 0.8) correlation = '强';
  else correlation = '极强';

  let note: string;
  if (best.lag === 0) {
    note = '泉流量对降水响应迅速，无明显滞后，岩溶管道流占主导';
  } else if (best.lag <= 2) {
    note = `滞后${best.lag}个月，岩溶裂隙-管道混合系统，有一定调蓄能力`;
  } else {
    note = `滞后${best.lag}个月，岩溶裂隙发育，调蓄能力强，响应缓慢`;
  }

  return {
    name: input.name,
    bestLag: best.lag,
    bestR: best.r,
    correlation,
    lagResults,
    note,
  };
}

/**
 * Pearson相关系数
 */
function pearsonR(pairs: Array<[number, number]>): number {
  const n = pairs.length;
  if (n < 2) return 0;
  const sumX = pairs.reduce((s, p) => s + p[0], 0);
  const sumY = pairs.reduce((s, p) => s + p[1], 0);
  const sumXY = pairs.reduce((s, p) => s + p[0] * p[1], 0);
  const sumX2 = pairs.reduce((s, p) => s + p[0] * p[0], 0);
  const sumY2 = pairs.reduce((s, p) => s + p[1] * p[1], 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

/**
 * 系统调蓄功能评价
 */
export function calcRegulation(input: RegulationInput): RegulationResult {
  const { alpha, rechargeQ, decayQ, rechargeDays, amplitudeRatio } = input;
  const regulationCoeff = rechargeQ > 0 ? decayQ / rechargeQ : 0;
  // 年调节量 = (补给期均值 - 衰减期均值) × 补给期天数 × 86400 / 1e4
  const annualRegulation = Math.abs(rechargeQ - decayQ) * rechargeDays * 86400 / 1e4;

  let amplitudeGrade: RegulationResult['amplitudeGrade'];
  if (amplitudeRatio < 2) amplitudeGrade = '稳定';
  else if (amplitudeRatio < 3) amplitudeGrade = '较稳定';
  else if (amplitudeRatio < 5) amplitudeGrade = '变幅较大';
  else amplitudeGrade = '极不稳定';

  const regulation = getRegulationLevel(alpha);

  let storageDesc: string;
  if (alpha < 0.005) storageDesc = '储水空间巨大，以溶洞-大裂隙为主，多年调节型';
  else if (alpha < 0.010) storageDesc = '储水空间大，以裂隙-溶孔为主，年内-多年调节型';
  else if (alpha < 0.020) storageDesc = '储水空间中等，以裂隙-溶孔为主，年内调节型';
  else storageDesc = '储水空间小，以管道流为主，短期调节型';

  const conclusion = `${input.name}：衰减系数α=${alpha}/d，${regulation}调蓄能力，` +
    `流量变幅比${amplitudeRatio}（${amplitudeGrade}），` +
    `调蓄系数K=${Math.round(regulationCoeff * 100) / 100}。${storageDesc}。`;

  return {
    name: input.name,
    alpha,
    regulationCoeff: Math.round(regulationCoeff * 100) / 100,
    annualRegulation: Math.round(annualRegulation * 10) / 10,
    amplitudeGrade,
    regulation,
    storageDesc,
    conclusion,
  };
}

/**
 * 批量计算预设泉域衰减
 */
export function calcAllPresetSprings(): DecayResult[] {
  return PRESET_SPRINGS.map(s => calcDecay({
    name: s.name,
    Q0: s.Q0,
    alpha: s.alpha,
    duration: s.decayDays,
    startDay: 120, // 默认从5月开始衰减
  }));
}

/**
 * 汇总统计
 */
export function calcSpringSummary() {
  const results = calcAllPresetSprings();
  const regulations = PRESET_SPRINGS.map(s => calcRegulation({
    name: s.name,
    alpha: s.alpha,
    rechargeQ: s.rechargeQ,
    decayQ: s.Q0 * Math.exp(-s.alpha * s.decayDays),
    decayDays: s.decayDays,
    rechargeDays: 365 - s.decayDays,
    amplitudeRatio: s.amplitudeRatio,
  }));

  const totalDischarge = results.reduce((s, r) => s + r.totalDischarge, 0);
  const avgAlpha = PRESET_SPRINGS.reduce((s, sp) => s + sp.alpha, 0) / PRESET_SPRINGS.length;
  const strongRegulation = regulations.filter(r => r.regulation === '强' || r.regulation === '极强').length;
  const maxAmplitude = Math.max(...PRESET_SPRINGS.map(s => s.amplitudeRatio));
  const minAmplitude = Math.min(...PRESET_SPRINGS.map(s => s.amplitudeRatio));

  return {
    springCount: PRESET_SPRINGS.length,
    totalDischarge: Math.round(totalDischarge * 10) / 10,
    avgAlpha: Math.round(avgAlpha * 10000) / 10000,
    strongRegulation,
    maxAmplitude,
    minAmplitude,
    results,
    regulations,
  };
}
