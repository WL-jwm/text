/**
 * 裂隙水计算 — 类型定义
 */

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


export interface RunoffModulusRef {
  rockType: string;
  range: string;
  avg: number;
  grade: string;
  distribution: string;
}


export interface FractureKRef {
  fractureGrade: string;
  apertureRange: string;
  KfRange: string;
  KfAvg: number;
  typical: string;
}


export interface InflowGradeRef {
  grade: string;
  range: string;
  min: number;
  max: number;
  measure: string;
}

