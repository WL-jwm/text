/**
 * B-18 矿坑涌水量预测计算引擎
 *
 * 功能：
 *  1. 大井法 — 完整井/非完整井稳定流涌水量预测
 *  2. 疏干排水 — 非稳定流Theis修正法
 *  3. 影响半径估算 — Kusakin/Sichardt经验公式
 *  4. 矿坑涌水量分级预警
 *  5. 预设矿区数据（河北典型矿区6个）
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface MineInflowInput {
  /** 矿区名称 */
  name: string;
  /** 含水层类型 */
  aquiferType: '潜水' | '承压水' | '承压转无压';
  /** 渗透系数 K (m/d) */
  K: number;
  /** 含水层厚度 M (m) */
  M: number;
  /** 矿坑系统等效半径 r0 (m) — 大井法 */
  equivalentRadius: number;
  /** 设计降深 s0 (m) */
  drawdown: number;
  /** 静止水位至含水层底板距离 H (m) — 潜水用 */
  waterTableHeight: number;
  /** 影响半径 R (m) — 可计算或输入 */
  influenceRadius: number;
}

export interface MineInflowResult {
  name: string;
  /** 大井法涌水量 Q (m³/d) */
  bigWellQ: number;
  /** 大井法涌水量 (m³/h) */
  bigWellQh: number;
  /** 影响半径 (m) */
  influenceRadius: number;
  /** 矿坑系统面积引用 (m²) */
  systemArea: number;
  /** 单位降深涌水量 (m³/d·m) */
  specificInflow: number;
  /** 涌水量等级 */
  inflowGrade: '极小' | '小' | '中等' | '大' | '极大';
  /** 采用的公式 */
  formula: string;
}

export interface DewateringInput {
  /** 矿区名称 */
  name: string;
  /** 渗透系数 K (m/d) */
  K: number;
  /** 含水层厚度 M (m) */
  M: number;
  /** 储水系数 S（承压水）或给水度 μ（潜水） */
  storageCoeff: number;
  /** 矿坑等效半径 r0 (m) */
  equivalentRadius: number;
  /** 目标降深 s0 (m) */
  targetDrawdown: number;
  /** 疏干时间 */
  dewateringTime: number;
  /** 疏干阶段数 */
  stages: number;
}

export interface DewateringResult {
  name: string;
  /** 初始涌水量 Q0 (m³/d) */
  initialQ: number;
  /** 最终涌水量 Qt (m³/d) */
  finalQ: number;
  /** 平均涌水量 (m³/d) */
  averageQ: number;
  /** 总排水量 (m³) */
  totalVolume: number;
  /** 疏干时间评价 */
  timeEvaluation: string;
  /** 时间-涌水量曲线数据 */
  curve: Array<{ time: number; 涌水量: number; 累计量: number }>;
}

export interface RadiusInput {
  /** 渗透系数 K (m/d) */
  K: number;
  /** 降深 s (m) */
  drawdown: number;
  /** 矿坑等效半径 r0 (m) */
  equivalentRadius: number;
  /** 方法选择 */
  method: 'kusakin' | 'sichardt' | 'kusakin_modified';
}

export interface RadiusResult {
  /** 影响半径 R (m) */
  R: number;
  /** 采用公式 */
  formula: string;
  /** 方法说明 */
  description: string;
}

// ═══════════════════════════════════════════════════════
// 预设矿区数据
// ═══════════════════════════════════════════════════════

export interface MinePreset {
  name: string;
  location: string;
  oreType: string;
  aquiferType: '潜水' | '承压水' | '承压转无压';
  K: number;
  M: number;
  equivalentRadius: number;
  drawdown: number;
  waterTableHeight: number;
  influenceRadius: number;
  actualInflow: string;
  note: string;
}

export const PRESET_MINES: MinePreset[] = [
  { name: '开滦矿区', location: '唐山', oreType: '煤矿', aquiferType: '承压转无压', K: 0.85, M: 180, equivalentRadius: 800, drawdown: 150, waterTableHeight: 180, influenceRadius: 3500, actualInflow: '1800~2400', note: '华北型煤田，多层含水层结构' },
  { name: '邯邢铁矿', location: '邯郸-邢台', oreType: '铁矿', aquiferType: '承压水', K: 1.20, M: 250, equivalentRadius: 600, drawdown: 200, waterTableHeight: 250, influenceRadius: 4200, actualInflow: '2200~3200', note: '奥陶系灰岩岩溶水，突水风险高' },
  { name: '峰峰矿区', location: '邯郸峰峰', oreType: '煤矿', aquiferType: '承压转无压', K: 0.65, M: 150, equivalentRadius: 700, drawdown: 120, waterTableHeight: 150, influenceRadius: 3000, actualInflow: '1200~1800', note: '已闭坑，泉域恢复' },
  { name: '兴隆矿区', location: '承德兴隆', oreType: '煤矿', aquiferType: '潜水', K: 0.35, M: 80, equivalentRadius: 400, drawdown: 60, waterTableHeight: 80, influenceRadius: 1800, actualInflow: '350~600', note: '山区煤矿，孔隙裂隙水' },
  { name: '石人沟铁矿', location: '唐山遵化', oreType: '铁矿', aquiferType: '承压水', K: 0.90, M: 200, equivalentRadius: 500, drawdown: 180, waterTableHeight: 200, influenceRadius: 3800, actualInflow: '1500~2200', note: '接触交代型铁矿，岩溶发育' },
  { name: '司家营铁矿', location: '唐山滦县', oreType: '铁矿', aquiferType: '潜水', K: 0.50, M: 120, equivalentRadius: 550, drawdown: 90, waterTableHeight: 120, influenceRadius: 2400, actualInflow: '800~1200', note: '前震旦纪变质铁矿，裂隙水' },
];

// ═══════════════════════════════════════════════════════
// 影响半径经验公式系数表
// ═══════════════════════════════════════════════════════

export interface RadiusMethodRef {
  method: string;
  formula: string;
  applicable: string;
  description: string;
}

export const RADIUS_METHODS: RadiusMethodRef[] = [
  { method: 'Kusakin', formula: 'R = 2s√(K·H)', applicable: '潜水/承压水', description: '库萨金公式，最常用的影响半径经验公式' },
  { method: 'Sichardt', formula: 'R = 10s√K', applicable: '承压水', description: '席哈尔公式，适用于承压含水层' },
  { method: 'Kusakin Modified', formula: 'R = r0 + 2s√(K·H)', applicable: '矿坑排水', description: '修正库萨金公式，考虑矿坑半径' },
];

// ═══════════════════════════════════════════════════════
// 涌水量分级标准
// ═══════════════════════════════════════════════════════

export interface InflowGradeRef {
  grade: string;
  range: string;
  min: number;
  max: number;
  measure: string;
}

export const INFLOW_GRADES: InflowGradeRef[] = [
  { grade: '极小', range: '<100', min: 0, max: 100, measure: '常规排水即可' },
  { grade: '小', range: '100~500', min: 100, max: 500, measure: '需排水系统' },
  { grade: '中等', range: '500~1000', min: 500, max: 1000, measure: '需专项排水设计' },
  { grade: '大', range: '1000~2000', min: 1000, max: 2000, measure: '需多级排水+监测预警' },
  { grade: '极大', range: '≥2000', min: 2000, max: Infinity, measure: '需综合防治+突水预警' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 计算影响半径
 */
export function calcInfluenceRadius(input: RadiusInput): RadiusResult {
  let R: number;
  let formula: string;
  let description: string;

  if (input.method === 'kusakin') {
    R = 2 * input.drawdown * Math.sqrt(input.K * input.drawdown);
    formula = 'R = 2s√(K·H)';
    description = '库萨金公式（H≈s简化）';
  } else if (input.method === 'sichardt') {
    R = 10 * input.drawdown * Math.sqrt(input.K);
    formula = 'R = 10s√K';
    description = '席哈尔公式';
  } else {
    R = input.equivalentRadius + 2 * input.drawdown * Math.sqrt(input.K * input.drawdown);
    formula = 'R = r0 + 2s√(K·H)';
    description = '修正库萨金公式（含矿坑半径）';
  }

  return {
    R: Math.round(R),
    formula,
    description,
  };
}

/**
 * 大井法矿坑涌水量计算
 *
 * 潜水完整井: Q = 1.366 K (2H - s) s / (lgR - lgr0)
 * 承压水完整井: Q = 2.73 K M s / (lgR - lgr0)
 * 承压转无压: Q = 1.366 K (2H·M - M² - h²) / (lgR - lgr0)
 *   其中 h = H - s
 */
export function calcMineInflow(input: MineInflowInput): MineInflowResult {
  const { K, M, equivalentRadius: r0, drawdown: s, influenceRadius: R, aquiferType } = input;
  const lgR_r0 = Math.log10(R / r0);

  let Q: number;
  let formula: string;

  if (aquiferType === '潜水') {
    const H = input.waterTableHeight;
    Q = 1.366 * K * (2 * H - s) * s / lgR_r0;
    formula = 'Q = 1.366 K(2H-s)s / (lgR-lgr0)  [潜水完整井]';
  } else if (aquiferType === '承压水') {
    Q = 2.73 * K * M * s / lgR_r0;
    formula = 'Q = 2.73 KMs / (lgR-lgr0)  [承压水完整井]';
  } else {
    // 承压转无压
    const H = input.waterTableHeight;
    const h = H - s;
    Q = 1.366 * K * (2 * H * M - M * M - h * h) / lgR_r0;
    formula = 'Q = 1.366 K(2HM-M²-h²) / (lgR-lgr0)  [承压转无压]';
  }

  const Qh = Q / 24;
  const systemArea = Math.PI * r0 * r0;
  const specificInflow = s > 0 ? Q / s : 0;

  let grade: MineInflowResult['inflowGrade'];
  if (Qh < 100) grade = '极小';
  else if (Qh < 500) grade = '小';
  else if (Qh < 1000) grade = '中等';
  else if (Qh < 2000) grade = '大';
  else grade = '极大';

  return {
    name: input.name,
    bigWellQ: Math.round(Q),
    bigWellQh: Math.round(Qh),
    influenceRadius: R,
    systemArea: Math.round(systemArea),
    specificInflow: Math.round(specificInflow),
    inflowGrade: grade,
    formula,
  };
}

/**
 * 疏干排水非稳定流计算
 * 基于Theis方程修正：Q(t) = 4πTs / W(u), u = r0²S / (4Tt)
 * 简化为：Q(t) ≈ Q0 / √(t/t0) 的衰减形式
 */
export function calcDewatering(input: DewateringInput): DewateringResult {
  const { K, M, storageCoeff: S, equivalentRadius: r0, targetDrawdown: s0, dewateringTime, stages } = input;

  const T = K * M; // 导水系数

  // 初始涌水量（t=1天时的涌水量）
  const u0 = (r0 * r0 * S) / (4 * T * 1);
  const W0 = -0.5772 - Math.log(u0) + u0; // Jacob近似 W(u) ≈ -0.5772 - ln(u)
  const initialQ = (4 * Math.PI * T * s0) / Math.max(0.1, W0);

  // 最终涌水量
  const uf = (r0 * r0 * S) / (4 * T * dewateringTime);
  const Wf = -0.5772 - Math.log(Math.max(1e-10, uf)) + Math.max(0, uf);
  const finalQ = (4 * Math.PI * T * s0) / Math.max(0.1, Wf);

  // 时间-涌水量曲线
  const curve: Array<{ time: number; 涌水量: number; 累计量: number }> = [];
  const steps = Math.max(stages * 5, 20);
  let cumulative = 0;
  for (let i = 1; i <= steps; i++) {
    const t = (dewateringTime / steps) * i;
    const u = (r0 * r0 * S) / (4 * T * t);
    const W = -0.5772 - Math.log(Math.max(1e-10, u)) + Math.max(0, u);
    const Q = (4 * Math.PI * T * s0) / Math.max(0.1, W);
    cumulative += Q * (dewateringTime / steps);
    curve.push({
      time: Math.round(t * 10) / 10,
      涌水量: Math.round(Q),
      累计量: Math.round(cumulative),
    });
  }

  const averageQ = (initialQ + finalQ) / 2;
  const totalVolume = averageQ * dewateringTime;

  let timeEvaluation: string;
  if (dewateringTime < 30) timeEvaluation = '快速疏干（<1月），涌水量大但持续时间短';
  else if (dewateringTime < 180) timeEvaluation = '中期疏干（1~6月），需持续排水';
  else if (dewateringTime < 365) timeEvaluation = '长期疏干（6~12月），需建立排水系统';
  else timeEvaluation = '超长期疏干（>1年），需永久排水设施';

  return {
    name: input.name,
    initialQ: Math.round(initialQ),
    finalQ: Math.round(finalQ),
    averageQ: Math.round(averageQ),
    totalVolume: Math.round(totalVolume),
    timeEvaluation,
    curve,
  };
}

/**
 * 批量计算预设矿区
 */
export function calcAllPresetMines(): MineInflowResult[] {
  return PRESET_MINES.map(m => calcMineInflow({
    name: m.name,
    aquiferType: m.aquiferType,
    K: m.K,
    M: m.M,
    equivalentRadius: m.equivalentRadius,
    drawdown: m.drawdown,
    waterTableHeight: m.waterTableHeight,
    influenceRadius: m.influenceRadius,
  }));
}

/**
 * 汇总统计
 */
export function calcMineSummary() {
  const results = calcAllPresetMines();
  const totalInflow = results.reduce((s, r) => s + r.bigWellQh, 0);
  const avgInflow = totalInflow / results.length;
  const maxInflow = Math.max(...results.map(r => r.bigWellQh));
  const minInflow = Math.min(...results.map(r => r.bigWellQh));
  const highRiskCount = results.filter(r => r.inflowGrade === '大' || r.inflowGrade === '极大').length;

  return {
    mineCount: results.length,
    totalInflow: Math.round(totalInflow),
    avgInflow: Math.round(avgInflow),
    maxInflow,
    minInflow,
    highRiskCount,
    results,
  };
}
