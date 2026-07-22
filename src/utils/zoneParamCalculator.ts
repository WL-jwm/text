/**
 * B-14 水文地质分区参数计算引擎
 *
 * 功能：
 *  1. 导水系数计算 T = K × M
 *  2. 补给资源量计算（降水入渗+侧向径流+河流渗漏+渠系+灌溉回渗）
 *  3. 可开采量估算（开采系数法 + 补给减排泄法）
 *  4. 储存调节量计算 V = μ × F × Δh
 *  5. 资源模数计算（万m³/km²·a）
 *  6. 预设分区参数库（基于systemZoning数据）
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface ZoneParamInput {
  /** 分区名称 */
  name: string;
  /** 面积 F (km²) */
  area: number;
  /** 渗透系数 K (m/d) */
  K: number;
  /** 含水层厚度 M (m) */
  M: number;
  /** 给水度 μ */
  mu: number;
  /** 储水系数 S（承压水） */
  S?: number;
  /** 年降水量 P (mm) */
  precipitation: number;
  /** 降水入渗系数 α */
  infiltrationCoeff: number;
  /** 侧向径流补给量 (万m³/a) */
  lateralRecharge: number;
  /** 河流渗漏补给量 (万m³/a) */
  riverLeakage: number;
  /** 渠系渗漏补给量 (万m³/a) */
  canalLeakage: number;
  /** 灌溉回渗补给量 (万m³/a) */
  irrigationReturn: number;
  /** 现状开采量 (万m³/a) */
  extraction: number;
  /** 允许开采系数（0~1） */
  allowableCoeff: number;
  /** 水位变幅 Δh (m) */
  deltaH: number;
}

export interface ZoneParamResult {
  name: string;
  /** 导水系数 T (m²/d) */
  T: number;
  /** 降水入渗补给量 (万m³/a) */
  rainfallRecharge: number;
  /** 总补给量 (万m³/a) */
  totalRecharge: number;
  /** 总排泄量 (万m³/a) */
  totalDischarge: number;
  /** 均衡差 (万m³/a) */
  balance: number;
  /** 可开采量 (万m³/a) */
  allowableExtraction: number;
  /** 开采系数 */
  exploitationCoeff: number;
  /** 储存调节量 (万m³) */
  storageRegulation: number;
  /** 补给模数 (万m³/km²·a) */
  rechargeModulus: number;
  /** 开采模数 (万m³/km²·a) */
  extractionModulus: number;
  /** 均衡状态 */
  balanceStatus: '正均衡' | '基本平衡' | '负均衡';
  /** 评价说明 */
  description: string;
}

export interface PresetZone {
  name: string;
  code: string;
  input: ZoneParamInput;
}

// ═══════════════════════════════════════════════════════
// 预设分区数据（基于systemZoning + zoneAquiferParams）
// ═══════════════════════════════════════════════════════

export const PRESET_ZONES: PresetZone[] = [
  {
    name: '内陆河系统区', code: 'I',
    input: { name: '内陆河', area: 10922, K: 10, M: 30, mu: 0.08, precipitation: 350, infiltrationCoeff: 0.12, lateralRecharge: 500, riverLeakage: 0, canalLeakage: 200, irrigationReturn: 300, extraction: 1800, allowableCoeff: 0.8, deltaH: 2 },
  },
  {
    name: '潮白河-蓟运河系统区', code: 'III',
    input: { name: '潮白河-蓟运河', area: 19419, K: 100, M: 80, mu: 0.20, precipitation: 600, infiltrationCoeff: 0.16, lateralRecharge: 8000, riverLeakage: 3000, canalLeakage: 1500, irrigationReturn: 2000, extraction: 12000, allowableCoeff: 0.85, deltaH: 3 },
  },
  {
    name: '滦河系统区', code: 'IV',
    input: { name: '滦河', area: 41949, K: 80, M: 75, mu: 0.16, precipitation: 550, infiltrationCoeff: 0.15, lateralRecharge: 12000, riverLeakage: 8000, canalLeakage: 2000, irrigationReturn: 3000, extraction: 15000, allowableCoeff: 0.85, deltaH: 4 },
  },
  {
    name: '永定河系统区', code: 'VI',
    input: { name: '永定河', area: 21258, K: 50, M: 50, mu: 0.13, precipitation: 450, infiltrationCoeff: 0.14, lateralRecharge: 5000, riverLeakage: 2500, canalLeakage: 800, irrigationReturn: 1200, extraction: 8000, allowableCoeff: 0.8, deltaH: 3 },
  },
  {
    name: '大清河系统区', code: 'VII',
    input: { name: '大清河', area: 27937, K: 150, M: 100, mu: 0.18, precipitation: 550, infiltrationCoeff: 0.20, lateralRecharge: 15000, riverLeakage: 5000, canalLeakage: 2000, irrigationReturn: 2500, extraction: 18000, allowableCoeff: 0.85, deltaH: 5 },
  },
  {
    name: '子牙河系统区', code: 'VIII',
    input: { name: '子牙河', area: 32326, K: 100, M: 120, mu: 0.12, precipitation: 500, infiltrationCoeff: 0.16, lateralRecharge: 14000, riverLeakage: 6000, canalLeakage: 2500, irrigationReturn: 3000, extraction: 22000, allowableCoeff: 0.80, deltaH: 6 },
  },
  {
    name: '古黄河系统区', code: 'X',
    input: { name: '古黄河', area: 11067, K: 5, M: 200, mu: 0.05, S: 0.002, precipitation: 500, infiltrationCoeff: 0.08, lateralRecharge: 3000, riverLeakage: 0, canalLeakage: 1000, irrigationReturn: 1500, extraction: 8000, allowableCoeff: 0.7, deltaH: 8 },
  },
];

// ═══════════════════════════════════════════════════════
// 核心函数
// ═══════════════════════════════════════════════════════

/**
 * 计算分区水文地质参数
 */
export function calcZoneParams(input: ZoneParamInput): ZoneParamResult {
  // 导水系数 T = K × M
  const T = input.K * input.M;

  // 降水入渗补给量 = P × α × F × 10 (mm→万m³: P(mm)×F(km²)×α = 10PαF 万m³/a... 不对)
  // P(mm) × F(km²) = P × F × 10⁻¹ (m × km² → m³ × 10³ = 万m³... )
  // 正确: P(mm) × α × F(km²) = P × α × F × 0.1 万m³/a
  // 因为: 1mm × 1km² = 10⁻³m × 10⁶m² = 10³m³ = 0.1万m³
  const rainfallRecharge = round(input.precipitation * input.infiltrationCoeff * input.area * 0.1, 0);

  // 总补给量
  const totalRecharge = rainfallRecharge + input.lateralRecharge + input.riverLeakage + input.canalLeakage + input.irrigationReturn;

  // 总排泄量 ≈ 现状开采量 + 蒸发排泄(估算为补给量的20%在平原区)
  const evaporationDischarge = round(totalRecharge * 0.15, 0); // 简化估算
  const totalDischarge = input.extraction + evaporationDischarge;

  // 均衡差
  const balance = round(totalRecharge - totalDischarge, 0);

  // 可开采量 = 总补给量 × 允许开采系数
  const allowableExtraction = round(totalRecharge * input.allowableCoeff, 0);

  // 开采系数 = 现状开采量 / 总补给量
  const exploitationCoeff = totalRecharge > 0 ? round(input.extraction / totalRecharge, 3) : 0;

  // 储存调节量 V = μ × F × Δh × 10 (万m³)
  // μ × F(km²) × Δh(m) = μ × 10⁶m² × Δh m = μ × Δh × 10⁶ m³ = μ × Δh × 100 万m³
  const storageRegulation = round(input.mu * input.area * input.deltaH * 0.1, 0);

  // 补给模数 (万m³/km²·a)
  const rechargeModulus = input.area > 0 ? round(totalRecharge / input.area, 2) : 0;

  // 开采模数 (万m³/km²·a)
  const extractionModulus = input.area > 0 ? round(input.extraction / input.area, 2) : 0;

  // 均衡状态
  let balanceStatus: '正均衡' | '基本平衡' | '负均衡';
  if (balance > totalRecharge * 0.05) balanceStatus = '正均衡';
  else if (balance < -totalRecharge * 0.05) balanceStatus = '负均衡';
  else balanceStatus = '基本平衡';

  // 评价说明
  let description: string;
  if (exploitationCoeff > 1.0) {
    description = `开采系数${exploitationCoeff.toFixed(2)}>1.0，超采严重，需压减开采量`;
  } else if (exploitationCoeff > 0.8) {
    description = `开采系数${exploitationCoeff.toFixed(2)}，接近开采上限，需控制开采`;
  } else if (exploitationCoeff > 0.5) {
    description = `开采系数${exploitationCoeff.toFixed(2)}，开采程度较高，尚有一定潜力`;
  } else {
    description = `开采系数${exploitationCoeff.toFixed(2)}，开采程度较低，有一定开发潜力`;
  }

  return {
    name: input.name,
    T: round(T, 0),
    rainfallRecharge,
    totalRecharge: round(totalRecharge, 0),
    totalDischarge: round(totalDischarge, 0),
    balance,
    allowableExtraction,
    exploitationCoeff,
    storageRegulation,
    rechargeModulus,
    extractionModulus,
    balanceStatus,
    description,
  };
}

/**
 * 批量计算预设分区
 */
export function calcAllPresetZones(): ZoneParamResult[] {
  return PRESET_ZONES.map(p => calcZoneParams(p.input));
}

// ═══════════════════════════════════════════════════════
// 参数参考表
// ═══════════════════════════════════════════════════════

/** 入渗系数参考值 */
export const INFILTRATION_COEFF_TABLE = [
  { lithology: '砂卵砾石', range: '0.25~0.35', typical: 0.30, zone: '冲洪积扇顶部' },
  { lithology: '砂砾石', range: '0.20~0.30', typical: 0.25, zone: '冲洪积扇中上部' },
  { lithology: '中粗砂', range: '0.15~0.25', typical: 0.20, zone: '冲洪积扇下部' },
  { lithology: '中细砂', range: '0.10~0.20', typical: 0.15, zone: '冲积平原' },
  { lithology: '粉细砂', range: '0.08~0.15', typical: 0.12, zone: '冲湖积平原' },
  { lithology: '粉土/亚砂土', range: '0.05~0.10', typical: 0.08, zone: '滨海平原' },
  { lithology: '黏土/亚黏土', range: '0.03~0.08', typical: 0.05, zone: '湖沼洼地' },
  { lithology: '石灰岩(岩溶)', range: '0.20~0.35', typical: 0.28, zone: '岩溶山区' },
  { lithology: '砂岩/页岩', range: '0.08~0.15', typical: 0.12, zone: '碎屑岩山区' },
  { lithology: '花岗岩/变质岩', range: '0.05~0.12', typical: 0.10, zone: '结晶岩山区' },
];

/** 给水度参考值 */
export const SPECIFIC_YIELD_TABLE = [
  { lithology: '砾石卵石', range: '0.20~0.30', typical: 0.25 },
  { lithology: '砂砾石', range: '0.18~0.25', typical: 0.22 },
  { lithology: '粗砂', range: '0.15~0.22', typical: 0.18 },
  { lithology: '中砂', range: '0.12~0.18', typical: 0.15 },
  { lithology: '细砂', range: '0.08~0.15', typical: 0.12 },
  { lithology: '粉砂', range: '0.05~0.10', typical: 0.08 },
  { lithology: '粉土', range: '0.03~0.07', typical: 0.05 },
  { lithology: '黏土', range: '0.01~0.04', typical: 0.03 },
];

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
