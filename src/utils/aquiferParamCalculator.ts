/**
 * B-08 Aquifer Parameter Calculator
 * 含水层参数速算器 - 达西公式/给水度/渗透系数/出水率/影响半径
 *
 * 核心公式:
 *   达西公式: Q = K · I · A (渗透流量)
 *   导水系数: T = K · M (渗透系数×含水层厚度)
 *   出水率:   q = Q / (s·M) (单位降深单位厚度涌水量)
 *   影响半径: R = 2·s·√(K·M) / Q (经验公式, 稳定流)
 *   储存量:   V = μ · F · Δh (给水度×面积×水位变幅)
 */

// ── 接口定义 ──

/** 达西公式计算输入 */
export interface DarcyInput {
  flowRateQ?: number;      // 渗透流量 Q, m³/d
  hydraulicK?: number;     // 渗透系数 K, m/d
  hydraulicGradientI?: number; // 水力坡度 I, 无量纲
  crossSectionA?: number;  // 过水断面面积 A, m²
}

/** 达西公式计算结果 */
export interface DarcyResult {
  flowRateQ: number;        // m³/d
  hydraulicK: number;       // m/d
  hydraulicGradientI: number;
  crossSectionA: number;     // m²
  transmissivityT?: number;  // 导水系数 T = K·M, m²/d
  calculatedField: string;   // 被计算的未知字段名
}

/** 含水层参数查询输入 */
export interface AquiferParamInput {
  aquiferGroup: 'I' | 'II' | 'III';   // 含水层组
  lithology: string;                    // 岩性
  zone: 'front' | 'middle' | 'east';   // 分区(山前/中部/东部)
}

/** 含水层参数查询结果 */
export interface AquiferParamResult {
  lithology: string;
  kRange: string;          // 渗透系数范围 (m/d)
  kMin?: number;           // K最小值
  kMax?: number;           // K最大值
  yieldRateRange: string;  // 出水率范围 (m³/h·m)
  yieldRateMin?: number;
  yieldRateMax?: number;
  specificYieldRange: string; // 给水度范围
  source: string;
}

/** 井参数计算输入 */
export interface WellCalcInput {
  dischargeQ: number;       // 出水量 Q, m³/d
  drawdownS: number;       // 降深 s, m
  aquiferThicknessM: number; // 含水层厚度 M, m
  hydraulicK: number;       // 渗透系数 K, m/d
  wellRadiusRw?: number;    // 井半径 rw, m
}

/** 井参数计算结果 */
export interface WellCalcResult {
  dischargeQ: number;
  drawdownS: number;
  aquiferThicknessM: number;
  hydraulicK: number;
  specificDischarge: number;    // 单位涌水量 q, m³/h·m·m
  transmissivityT: number;      // 导水系数 T, m²/d
  influenceRadiusR: number;     // 影响半径 R, m
  wellEfficiency: string;       // 井效率评价
}

/** 储存量计算输入 */
export interface StorageCalcInput {
  specificYield: number;    // 给水度 μ, 无量纲
  area: number;             // 面积 F, km²
  waterLevelChange: number; // 水位变幅 Δh, m
}

/** 储存量计算结果 */
export interface StorageCalcResult {
  specificYield: number;
  area: number;
  waterLevelChange: number;
  storageVolume: number;    // 储存变化量, 万m³
  storageInYi: number;      // 储存变化量, 亿m³
}

/** 渗透系数经验值 */
export interface KReference {
  lithology: string;
  kMin: number;
  kMax: number;
  kUnit: string;
  description: string;
}

// ── 经验参数数据库 ──

/** 河北平原渗透系数经验值 (m/d) */
export const K_REFERENCE_DATA: KReference[] = [
  { lithology: '粘土', kMin: 0.001, kMax: 0.01, kUnit: 'm/d', description: '弱透水层' },
  { lithology: '亚粘土', kMin: 0.01, kMax: 0.1, kUnit: 'm/d', description: '弱透水层' },
  { lithology: '亚砂土', kMin: 0.1, kMax: 0.5, kUnit: 'm/d', description: '弱~中透水' },
  { lithology: '粉砂', kMin: 0.5, kMax: 5, kUnit: 'm/d', description: '第I组: 1.5~8; 第II组: <3.5' },
  { lithology: '细砂', kMin: 3, kMax: 12, kUnit: 'm/d', description: '第I组: 5~12; 第II组: 3~10' },
  { lithology: '中砂', kMin: 8, kMax: 25, kUnit: 'm/d', description: '第I组: 10~25; 第II组: 5~20' },
  { lithology: '粗砂', kMin: 15, kMax: 50, kUnit: 'm/d', description: '第I组: 15~70; 第II组: 5~13' },
  { lithology: '砾石', kMin: 30, kMax: 100, kUnit: 'm/d', description: '第I组: 50~100' },
  { lithology: '卵石', kMin: 50, kMax: 200, kUnit: 'm/d', description: '冲洪积扇>100' },
  { lithology: '灰岩(岩溶)', kMin: 10, kMax: 500, kUnit: 'm/d', description: '取决于岩溶发育程度' },
  { lithology: '片麻岩', kMin: 0.01, kMax: 1, kUnit: 'm/d', description: '风化裂隙发育区可达5' },
  { lithology: '砂岩', kMin: 0.1, kMax: 10, kUnit: 'm/d', description: '取决于胶结程度和裂隙' },
  { lithology: '白云岩', kMin: 5, kMax: 50, kUnit: 'm/d', description: '震旦亚界主要含水层' },
];

/** 给水度经验值 */
export const SPECIFIC_YIELD_DATA = [
  { lithology: '粘土', syMin: 0.02, syMax: 0.05, description: '几乎不释水' },
  { lithology: '亚粘土', syMin: 0.03, syMax: 0.08, description: '弱给水' },
  { lithology: '亚砂土', syMin: 0.06, syMax: 0.15, description: '弱~中给水' },
  { lithology: '粉砂', syMin: 0.08, syMax: 0.15, description: '中部平原0.04~0.10' },
  { lithology: '细砂', syMin: 0.12, syMax: 0.20, description: '常用值0.15' },
  { lithology: '中砂', syMin: 0.18, syMax: 0.28, description: '山前0.20~0.28' },
  { lithology: '粗砂', syMin: 0.22, syMax: 0.35, description: '山前0.25~0.35' },
  { lithology: '砾石', syMin: 0.25, syMax: 0.38, description: '冲洪积扇0.30~0.38' },
  { lithology: '卵石', syMin: 0.30, syMax: 0.42, description: '冲洪积扇顶部>0.35' },
];



/** 降水入渗系数经验值 */
export const INFILTRATION_DATA = [
  { zone: '山前冲洪积扇', alphaMin: 0.25, alphaMax: 0.35, lithology: '卵石/砾石' },
  { zone: '冲洪积扇中部', alphaMin: 0.15, alphaMax: 0.25, lithology: '粗砂/中砂' },
  { zone: '冲积平原', alphaMin: 0.10, alphaMax: 0.18, lithology: '中砂/细砂' },
  { zone: '中部平原', alphaMin: 0.08, alphaMax: 0.15, lithology: '细砂/粉砂' },
  { zone: '滨海平原', alphaMin: 0.03, alphaMax: 0.08, lithology: '粉砂/亚砂土' },
  { zone: '坝上高原', alphaMin: 0.05, alphaMax: 0.12, lithology: '砂砾石/风积砂' },
];

// ── 核心计算函数 ──

/** 达西公式: Q = K · I · A，已知任意3个求解第4个 */
export function calcDarcy(input: DarcyInput): DarcyResult | null {
  const { flowRateQ, hydraulicK, hydraulicGradientI, crossSectionA } = input;
  const knownCount = [flowRateQ, hydraulicK, hydraulicGradientI, crossSectionA]
    .filter(v => v != null && v !== 0).length;

  if (knownCount < 3) return null;

  // Q = K · I · A
  if (flowRateQ == null || flowRateQ === 0) {
    if (hydraulicK != null && hydraulicGradientI != null && crossSectionA != null) {
      return {
        flowRateQ: hydraulicK * hydraulicGradientI * crossSectionA,
        hydraulicK, hydraulicGradientI,
        crossSectionA,
        calculatedField: 'flowRateQ',
      };
    }
  }
  if (hydraulicK == null || hydraulicK === 0) {
    if (flowRateQ != null && hydraulicGradientI != null && crossSectionA != null) {
      return {
        flowRateQ,
        hydraulicK: flowRateQ / (hydraulicGradientI * crossSectionA),
        hydraulicGradientI, crossSectionA,
        calculatedField: 'hydraulicK',
      };
    }
  }
  if (hydraulicGradientI == null || hydraulicGradientI === 0) {
    if (flowRateQ != null && hydraulicK != null && crossSectionA != null) {
      return {
        flowRateQ, hydraulicK,
        hydraulicGradientI: flowRateQ / (hydraulicK * crossSectionA),
        crossSectionA,
        calculatedField: 'hydraulicGradientI',
      };
    }
  }
  if (crossSectionA == null || crossSectionA === 0) {
    if (flowRateQ != null && hydraulicK != null && hydraulicGradientI != null) {
      return {
        flowRateQ, hydraulicK, hydraulicGradientI,
        crossSectionA: flowRateQ / (hydraulicK * hydraulicGradientI),
        calculatedField: 'crossSectionA',
      };
    }
  }
  // 全部已知
  return {
    flowRateQ: flowRateQ ?? 0,
    hydraulicK: hydraulicK ?? 0,
    hydraulicGradientI: hydraulicGradientI ?? 0,
    crossSectionA: crossSectionA ?? 0,
    calculatedField: 'verify',
  };
}

/** 井参数综合计算 */
export function calcWellParams(input: WellCalcInput): WellCalcResult {
  const { dischargeQ, drawdownS, aquiferThicknessM, hydraulicK } = input;

  // 导水系数 T = K · M
  const transmissivityT = hydraulicK * aquiferThicknessM;

  // 单位涌水量 q = Q / (s·M) → m³/d·m·m → 转换为 m³/h·m·m
  const specificDischargePerDay = drawdownS > 0 && aquiferThicknessM > 0
    ? dischargeQ / (drawdownS * aquiferThicknessM)
    : 0;
  const specificDischarge = specificDischargePerDay / 24; // m³/h·m·m

  // 影响半径 R (经验公式, Siegelich简化)
  // R = 1.5·√(T·t/μ) 或简化 R ≈ 10·√(Q·K) / Q (稳定流经验)
  // 这里用常用经验公式: R = 0.1·Q / (K·I) 简化为 R = 2·s·√(K·M)
  const influenceRadiusR = drawdownS > 0
    ? 2 * drawdownS * Math.sqrt(Math.max(0, hydraulicK * aquiferThicknessM))
    : 0;

  // 井效率评价 (基于单位涌水量)
  let wellEfficiency: string;
  if (specificDischarge >= 5) {
    wellEfficiency = '极强富水';
  } else if (specificDischarge >= 2) {
    wellEfficiency = '强富水';
  } else if (specificDischarge >= 1) {
    wellEfficiency = '中等富水';
  } else if (specificDischarge >= 0.5) {
    wellEfficiency = '弱富水';
  } else if (specificDischarge >= 0.1) {
    wellEfficiency = '极弱富水';
  } else {
    wellEfficiency = '贫水';
  }

  return {
    dischargeQ, drawdownS, aquiferThicknessM, hydraulicK,
    specificDischarge, transmissivityT, influenceRadiusR,
    wellEfficiency,
  };
}

/** 储存量计算: V = μ · F · Δh */
export function calcStorage(input: StorageCalcInput): StorageCalcResult {
  const { specificYield, area, waterLevelChange } = input;
  // F 单位 km² → m²: ×10^6
  // V(m³) = μ × F(km²) × 10^6 × Δh(m)
  // V(万m³) = μ × F × Δh × 100
  const storageVolume = specificYield * area * waterLevelChange * 100; // 万m³
  const storageInYi = storageVolume / 10000; // 亿m³

  return {
    specificYield, area, waterLevelChange,
    storageVolume, storageInYi,
  };
}

/** 查询渗透系数经验值 */
export function lookupK(lithology: string): KReference | undefined {
  return K_REFERENCE_DATA.find(r => r.lithology === lithology);
}

/** 查询给水度经验值 */
export function lookupSpecificYield(lithology: string): { syMin: number; syMax: number; description: string } | undefined {
  const item = SPECIFIC_YIELD_DATA.find(r => r.lithology === lithology);
  if (!item) return undefined;
  return { syMin: item.syMin, syMax: item.syMax, description: item.description };
}

/** 查询降水入渗系数 */
export function lookupInfiltration(zone: string): { alphaMin: number; alphaMax: number; lithology: string } | undefined {
  return INFILTRATION_DATA.find(r => r.zone === zone);
}

/** 单位换算辅助 */
export function convertUnit(value: number, from: string, to: string): number {
  const table: Record<string, Record<string, number>> = {
    'm/d': { 'm/s': 1 / 86400, 'cm/s': 100 / 86400, 'ft/d': 3.2808 },
    'm/s': { 'm/d': 86400, 'cm/s': 100 },
    'cm/s': { 'm/d': 86400 / 100, 'm/s': 0.01 },
    'm³/d': { 'm³/h': 1 / 24, 'L/s': 1000 / 86400, 'm³/s': 1 / 86400 },
    'm³/h': { 'm³/d': 24, 'L/s': 1000 / 3600 },
    'L/s': { 'm³/d': 86.4, 'm³/h': 3.6 },
  };
  return value * (table[from]?.[to] ?? 1);
}

/** 格式化数值 */
export function fmtVal(val: number, digits = 2): string {
  if (val === 0) return '0';
  if (Math.abs(val) >= 10000) return val.toFixed(0);
  if (Math.abs(val) >= 100) return val.toFixed(1);
  if (Math.abs(val) >= 1) return val.toFixed(digits);
  if (Math.abs(val) >= 0.01) return val.toFixed(3);
  return val.toExponential(2);
}

/** 获取所有岩性列表 */
export function getLithologyList(): string[] {
  return K_REFERENCE_DATA.map(r => r.lithology);
}
