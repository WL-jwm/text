/**
 * B-21 裂隙水涌水量估算计算引擎
 *
 * 功能：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Q = Kf × I × F，裂隙渗透系数估算
 *  3. 经验径流模数法 — Q = M × F，按岩性分区
 *  4. 群孔干扰降深预测
 *  5. 预设数据：河北基岩山区6种岩性裂隙水参数
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface BigWellInput {
  /** 评价区名称 */
  name: string;
  /** 含水层类型 */
  aquiferType: '潜水' | '承压水';
  /** 裂隙渗透系数 Kf (m/d) */
  Kf: number;
  /** 含水层厚度 M (m) */
  M: number;
  /** 矿坑/井等效半径 r0 (m) */
  r0: number;
  /** 设计降深 s0 (m) */
  s0: number;
  /** 静止水位至底板距离 H (m) */
  H: number;
  /** 影响半径 R (m) */
  R: number;
  /** 完整性 */
  completeness: '完整井' | '非完整井';
  /** 非完整井过滤器长度 l (m) */
  filterLength?: number;
}

export interface BigWellResult {
  name: string;
  /** 涌水量 Q (m³/d) */
  Q: number;
  /** 涌水量 (m³/h) */
  Qh: number;
  /** 单位降深涌水量 (m³/d·m) */
  specificQ: number;
  /** 影响半径 (m) */
  R: number;
  /** 采用公式 */
  formula: string;
  /** 涌水量等级 */
  grade: '极小' | '小' | '中等' | '大' | '极大';
}

export interface FractureMethodInput {
  /** 评价区名称 */
  name: string;
  /** 裂隙率 n (小数) */
  fractureRatio: number;
  /** 裂隙开度 b (mm) */
  fractureAperture: number;
  /** 裂隙连通系数 (0~1) */
  connectivity: number;
  /** 水力梯度 I (小数) */
  hydraulicGradient: number;
  /** 过水断面面积 F (m²) */
  crossSectionArea: number;
  /** 裂隙密度 (条/m) */
  fractureDensity: number;
}

export interface FractureMethodResult {
  name: string;
  /** 裂隙渗透系数 Kf (m/d) */
  Kf: number;
  /** 等效渗透系数 Keq (m/d) */
  Keq: number;
  /** 涌水量 Q (m³/d) */
  Q: number;
  /** 裂隙发育等级 */
  fractureGrade: '极弱' | '弱' | '中等' | '强' | '极强';
  /** 说明 */
  note: string;
}

export interface RunoffModulusInput {
  /** 评价区名称 */
  name: string;
  /** 岩性类型 */
  lithology: string;
  /** 径流模数 M (L/s·km²) */
  runoffModulus: number;
  /** 汇水面积 F (km²) */
  area: number;
  /** 保证率修正系数 (0~1) */
  guaranteeFactor: number;
}

export interface RunoffModulusResult {
  name: string;
  /** 涌水量 Q (m³/d) */
  Q: number;
  /** 涌水量 (m³/h) */
  Qh: number;
  /** 年总资源量 (万m³/a) */
  annualResource: number;
  /** 径流模数等级 */
  modulusGrade: '贫乏' | '较贫乏' | '中等' | '较丰富' | '丰富';
}

export interface InterferenceInput {
  /** 评价区名称 */
  name: string;
  /** 群孔数量 */
  wellCount: number;
  /** 单孔涌水量 q (m³/d) */
  singleWellQ: number;
  /** 孔间距 d (m) */
  wellSpacing: number;
  /** 单孔影响半径 R (m) */
  singleRadius: number;
  /** 含水层渗透系数 K (m/d) */
  K: number;
  /** 含水层厚度 M (m) */
  M: number;
}

export interface InterferenceResult {
  name: string;
  /** 群孔总涌水量 (m³/d) */
  totalQ: number;
  /** 无干扰理论总量 (m³/d) */
  theoreticalQ: number;
  /** 干扰折减系数 */
  reductionFactor: number;
  /** 干扰降深叠加 (m) */
  interferenceDrawdown: number;
  /** 干扰评价 */
  interferenceLevel: '无干扰' | '弱干扰' | '中等干扰' | '强干扰';
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 预设岩性参数（河北基岩山区6种岩性）
// ═══════════════════════════════════════════════════════

export interface LithologyPreset {
  name: string;
  rockType: string;
  location: string;
  Kf: number;
  M: number;
  fractureRatio: number;
  fractureAperture: number;
  fractureDensity: number;
  runoffModulus: number;
  connectivity: number;
  r0: number;
  s0: number;
  H: number;
  R: number;
  note: string;
}

export const PRESET_LITHOLOGIES: LithologyPreset[] = [
  { name: '花岗岩裂隙水', rockType: '花岗岩', location: '承德-张家口', Kf: 0.15, M: 60, fractureRatio: 0.008, fractureAperture: 0.3, fractureDensity: 2.5, runoffModulus: 2.5, connectivity: 0.6, r0: 200, s0: 30, H: 60, R: 1200, note: '风化裂隙为主，深度30~80m' },
  { name: '片麻岩裂隙水', rockType: '片麻岩', location: '秦皇岛-唐山', Kf: 0.20, M: 50, fractureRatio: 0.010, fractureAperture: 0.4, fractureDensity: 3.0, runoffModulus: 3.0, connectivity: 0.65, r0: 180, s0: 25, H: 50, R: 1100, note: '构造裂隙发育，风化带厚' },
  { name: '砂岩裂隙水', rockType: '砂岩', location: '承德-张家口', Kf: 0.25, M: 80, fractureRatio: 0.012, fractureAperture: 0.5, fractureDensity: 3.5, runoffModulus: 3.5, connectivity: 0.7, r0: 250, s0: 40, H: 80, R: 1500, note: '层间裂隙含水，砂岩孔隙-裂隙双重介质' },
  { name: '灰岩裂隙水', rockType: '灰岩', location: '邢台-邯郸西部', Kf: 0.50, M: 120, fractureRatio: 0.015, fractureAperture: 0.8, fractureDensity: 4.0, runoffModulus: 5.0, connectivity: 0.75, r0: 300, s0: 50, H: 120, R: 2000, note: '岩溶裂隙发育，富水性强' },
  { name: '火山岩裂隙水', rockType: '火山岩', location: '张家口-承德', Kf: 0.10, M: 45, fractureRatio: 0.006, fractureAperture: 0.2, fractureDensity: 2.0, runoffModulus: 1.5, connectivity: 0.5, r0: 150, s0: 20, H: 45, R: 800, note: '柱状节理发育，连通性较差' },
  { name: '变质岩裂隙水', rockType: '变质岩', location: '保定-石家庄西部', Kf: 0.12, M: 55, fractureRatio: 0.007, fractureAperture: 0.25, fractureDensity: 2.2, runoffModulus: 2.0, connectivity: 0.55, r0: 170, s0: 25, H: 55, R: 1000, note: '片理/劈理发育，低渗透性' },
];

// ═══════════════════════════════════════════════════════
// 径流模数参考表
// ═══════════════════════════════════════════════════════

export interface RunoffModulusRef {
  rockType: string;
  range: string;
  avg: number;
  grade: string;
  distribution: string;
}

export const RUNOFF_MODULUS_REF: RunoffModulusRef[] = [
  { rockType: '花岗岩类', range: '1~4', avg: 2.5, grade: '较贫乏', distribution: '承德北部、张家口北部' },
  { rockType: '片麻岩类', range: '2~5', avg: 3.0, grade: '中等', distribution: '秦皇岛、唐山北部' },
  { rockType: '砂岩类', range: '2~6', avg: 3.5, grade: '中等', distribution: '承德、张家口中生界' },
  { rockType: '灰岩类', range: '3~10', avg: 5.0, grade: '较丰富', distribution: '太行山前寒武系-奥陶系' },
  { rockType: '火山岩类', range: '0.5~3', avg: 1.5, grade: '贫乏', distribution: '张家口、承德侏罗-白垩系' },
  { rockType: '变质岩类', range: '1~3', avg: 2.0, grade: '较贫乏', distribution: '保定、石家庄五台群' },
];

// ═══════════════════════════════════════════════════════
// 裂隙渗透系数参考表
// ═══════════════════════════════════════════════════════

export interface FractureKRef {
  fractureGrade: string;
  apertureRange: string;
  KfRange: string;
  KfAvg: number;
  typical: string;
}

export const FRACTURE_K_REF: FractureKRef[] = [
  { fractureGrade: '极弱', apertureRange: '<0.1mm', KfRange: '<0.05', KfAvg: 0.03, typical: '微裂隙，闭合状，几乎不透水' },
  { fractureGrade: '弱', apertureRange: '0.1~0.3mm', KfRange: '0.05~0.15', KfAvg: 0.10, typical: '细裂隙，弱透水' },
  { fractureGrade: '中等', apertureRange: '0.3~0.5mm', KfRange: '0.15~0.35', KfAvg: 0.25, typical: '中等裂隙，构造裂隙带' },
  { fractureGrade: '强', apertureRange: '0.5~1.0mm', KfRange: '0.35~0.80', KfAvg: 0.50, typical: '宽大裂隙，岩溶裂隙发育' },
  { fractureGrade: '极强', apertureRange: '>1.0mm', KfRange: '>0.80', KfAvg: 1.20, typical: '溶蚀裂隙，岩溶管道发育' },
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
  { grade: '极小', range: '<50', min: 0, max: 50, measure: '仅可满足小型供水' },
  { grade: '小', range: '50~200', min: 50, max: 200, measure: '可满足村镇供水' },
  { grade: '中等', range: '200~500', min: 200, max: 500, measure: '可满足乡镇供水' },
  { grade: '大', range: '500~1000', min: 500, max: 1000, measure: '可满足县城供水' },
  { grade: '极大', range: '≥1000', min: 1000, max: Infinity, measure: '可满足城市供水' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

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
export function calcAllPresetBigWell(): BigWellResult[] {
  return PRESET_LITHOLOGIES.map(l => calcBigWell({
    name: l.name,
    aquiferType: '承压水',
    Kf: l.Kf,
    M: l.M,
    r0: l.r0,
    s0: l.s0,
    H: l.H,
    R: l.R,
    completeness: '完整井',
  }));
}

/**
 * 批量计算预设岩性径流模数法
 */
export function calcAllPresetRunoff(): RunoffModulusResult[] {
  return PRESET_LITHOLOGIES.map(l => calcRunoffModulus({
    name: l.name,
    lithology: l.rockType,
    runoffModulus: l.runoffModulus,
    area: 100, // 标准化面积100km²
    guaranteeFactor: 0.75, // P=75%
  }));
}

/**
 * 汇总统计
 */
export function calcFractureSummary() {
  const bigWellResults = calcAllPresetBigWell();
  const runoffResults = calcAllPresetRunoff();

  const totalBigWell = bigWellResults.reduce((s, r) => s + r.Qh, 0);
  const totalRunoff = runoffResults.reduce((s, r) => s + r.Qh, 0);
  const avgKf = PRESET_LITHOLOGIES.reduce((s, l) => s + l.Kf, 0) / PRESET_LITHOLOGIES.length;
  const maxQ = Math.max(...bigWellResults.map(r => r.Qh));
  const minQ = Math.min(...bigWellResults.map(r => r.Qh));
  const highYieldCount = bigWellResults.filter(r => r.grade === '大' || r.grade === '极大').length;

  return {
    lithologyCount: PRESET_LITHOLOGIES.length,
    totalBigWell: Math.round(totalBigWell),
    totalRunoff: Math.round(totalRunoff),
    avgKf: Math.round(avgKf * 100) / 100,
    maxQ,
    minQ,
    highYieldCount,
  };
}
