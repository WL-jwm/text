/**
 * B-09 地下水污染预警引擎
 *
 * 功能：
 *  1. 单因子超标预警等级判定（III类标准为基准）
 *  2. 综合水质预警等级（基于最差因子 + 超标数量 + 综合污染指数）
 *  3. 区域风险评分（6大水文地质分区）
 *  4. 预警阈值自定义
 *  5. 预警历史对比（逐期趋势）
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

/** 预警等级 */
export type AlertLevel = '安全' | '关注' | '预警' | '警告' | '严重';

/** 预警等级元数据 */
export interface AlertLevelMeta {
  level: AlertLevel;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

/** 预警阈值配置 */
export interface AlertThresholds {
  /** 关注阈值 (Pi > 此值进入"关注") */
  caution: number;
  /** 预警阈值 (Pi > 此值进入"预警") */
  warning: number;
  /** 警告阈值 (Pi > 此值进入"警告") */
  alert: number;
  /** 严重阈值 (Pi > 此值进入"严重") */
  severe: number;
}

/** 单因子预警结果 */
export interface FactorAlertResult {
  name: string;
  unit: string;
  value: number | null;
  standardIII: number | null;
  /** 标准指数 Pi（数值型） */
  Pi: number | null;
  /** 超标倍数（相对于III类） */
  exceedanceRatio: number | null;
  /** 预警等级 */
  level: AlertLevel;
  /** 预警等级数字（越大越严重） */
  levelNum: number;
  /** 所属类型 */
  type: string;
}

/** 水样综合预警结果 */
export interface SampleAlertResult {
  sampleName: string;
  /** 综合预警等级 */
  level: AlertLevel;
  levelNum: number;
  /** 综合污染指数（等标污染指数法） */
  pollutionIndex: number;
  /** 各因子预警结果 */
  factors: FactorAlertResult[];
  /** 超标因子数 */
  exceededCount: number;
  /** 最大超标因子 */
  maxFactor: FactorAlertResult | null;
  /** 超标因子列表 */
  exceededFactors: string[];
}

/** 区域风险评分 */
export interface RegionRiskResult {
  region: string;
  /** 区域名称 */
  area: string;
  /** 风险评分 0-100 */
  riskScore: number;
  /** 风险等级 */
  riskLevel: AlertLevel;
  riskLevelNum: number;
  /** 主要风险因子 */
  primaryRisks: string[];
  /** 风险描述 */
  description: string;
}

/** 区域输入数据（用于区域风险评分） */
export interface RegionInput {
  region: string;
  area: string;
  /** 各因子超标率 0-1 */
  fluorideRate: number;
  hardnessRate: number;
  nitrateRate: number;
  ironManganeseRate: number;
  ammoniaNitrogenRate: number;
  tdsRate: number;
}

/** 预警摘要统计 */
export interface AlertSummary {
  totalSamples: number;
  safeCount: number;
  cautionCount: number;
  warningCount: number;
  alertCount: number;
  severeCount: number;
  /** 总体预警等级（取最差） */
  overallLevel: AlertLevel;
  overallLevelNum: number;
  /** 超标率 */
  exceededRate: number;
  /** 最常见超标因子 */
  topExceededFactors: string[];
}

/** 趋势数据点 */
export interface TrendPoint {
  period: string;
  value: number;
}

// ═══════════════════════════════════════════════════════
// 常量与预设
// ═══════════════════════════════════════════════════════

/** 预警等级元数据表 */
export const ALERT_LEVELS: Record<AlertLevel, AlertLevelMeta> = {
  '安全': { level: '安全', color: '#10b981', bgColor: 'bg-emerald-500/15', icon: '✓', description: '所有因子均达标，Pi ≤ 0.5' },
  '关注': { level: '关注', color: '#3b82f6', bgColor: 'bg-blue-500/15', icon: '△', description: '部分因子接近标准限值，Pi > 0.5' },
  '预警': { level: '预警', color: '#f59e0b', bgColor: 'bg-amber-500/15', icon: '⚠', description: '部分因子已超标，Pi > 1.0' },
  '警告': { level: '警告', color: '#f97316', bgColor: 'bg-orange-500/15', icon: '⚡', description: '多个因子显著超标，Pi > 2.0' },
  '严重': { level: '严重', color: '#ef4444', bgColor: 'bg-red-500/15', icon: '✗', description: '因子严重超标，Pi > 5.0' },
};

/** 默认预警阈值 */
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  caution: 0.5,
  warning: 1.0,
  alert: 2.0,
  severe: 5.0,
};

/** 预警等级对应数值 */
const ALERT_LEVEL_NUM: Record<AlertLevel, number> = {
  '安全': 0,
  '关注': 1,
  '预警': 2,
  '警告': 3,
  '严重': 4,
};

/** 预警等级从数值映射 */
const NUM_TO_LEVEL: AlertLevel[] = ['安全', '关注', '预警', '警告', '严重'];

/** 区域预设数据（超标率 0-1，基于已有 typicalPollutants + pollutantRegionalMatrix） */
export const REGION_PRESETS: RegionInput[] = [
  { region: '山前平原', area: '石家庄/保定/邢台/邯郸西部', fluorideRate: 0.10, hardnessRate: 0.35, nitrateRate: 0.40, ironManganeseRate: 0.05, ammoniaNitrogenRate: 0.20, tdsRate: 0.05 },
  { region: '中部平原', area: '邢台东部/邯郸东部/衡水', fluorideRate: 0.45, hardnessRate: 0.50, nitrateRate: 0.20, ironManganeseRate: 0.05, ammoniaNitrogenRate: 0.15, tdsRate: 0.25 },
  { region: '滨海平原', area: '沧州/廊坊/衡水东部', fluorideRate: 0.50, hardnessRate: 0.55, nitrateRate: 0.10, ironManganeseRate: 0.15, ammoniaNitrogenRate: 0.10, tdsRate: 0.55 },
  { region: '冀东平原', area: '唐山/秦皇岛', fluorideRate: 0.15, hardnessRate: 0.25, nitrateRate: 0.20, ironManganeseRate: 0.30, ammoniaNitrogenRate: 0.25, tdsRate: 0.08 },
  { region: '坝上高原', area: '张家口北部/承德北部', fluorideRate: 0.05, hardnessRate: 0.08, nitrateRate: 0.05, ironManganeseRate: 0.10, ammoniaNitrogenRate: 0.03, tdsRate: 0.03 },
  { region: '山区', area: '太行山/燕山山区', fluorideRate: 0.03, hardnessRate: 0.05, nitrateRate: 0.03, ironManganeseRate: 0.08, ammoniaNitrogenRate: 0.02, tdsRate: 0.02 },
];

/** 水质趋势预测数据（2014-2024 + 预测） */
export const QUALITY_TREND_FORECAST: TrendPoint[] = [
  { period: '2014', value: 24.5 },
  { period: '2015', value: 25.8 },
  { period: '2016', value: 27.2 },
  { period: '2017', value: 29.5 },
  { period: '2018', value: 32.1 },
  { period: '2019', value: 35.8 },
  { period: '2020', value: 40.2 },
  { period: '2021', value: 44.5 },
  { period: '2022', value: 50.3 },
  { period: '2023', value: 56.8 },
  { period: '2024', value: 63.5 },
  { period: '2025(预)', value: 68.0 },
  { period: '2026(预)', value: 72.5 },
  { period: '2028(预)', value: 80.0 },
  { period: '2030(预)', value: 85.0 },
];

/** 主要超标因子III类标准限值 */
export const FACTOR_STANDARD_III: Record<string, { standard: number; unit: string; type: string; description: string }> = {
  '氟化物': { standard: 1.0, unit: 'mg/L', type: '毒理指标', description: '高氟水区主要超标因子，致氟斑牙/氟骨症' },
  '总硬度(CaCO₃)': { standard: 450, unit: 'mg/L', type: '一般化学指标', description: '平原区普遍偏高，影响锅炉结垢/洗涤' },
  '硝酸盐(NO₃⁻-N)': { standard: 20, unit: 'mg/L', type: '毒理指标', description: '农业面源污染，致蓝婴综合征/致癌风险' },
  '溶解性总固体(TDS)': { standard: 1000, unit: 'mg/L', type: '一般化学指标', description: '滨海平原深层水普遍超标' },
  '硫酸盐(SO₄²⁻)': { standard: 250, unit: 'mg/L', type: '一般化学指标', description: '蒸发浓缩与矿物溶解' },
  '氯化物(Cl⁻)': { standard: 250, unit: 'mg/L', type: '一般化学指标', description: '滨海平原咸水入侵区超标' },
  '氨氮(NH₃-N)': { standard: 0.50, unit: 'mg/L', type: '一般化学指标', description: '城市/工业区渗漏指示因子' },
  '铁(Fe)': { standard: 0.3, unit: 'mg/L', type: '一般化学指标', description: '冀东平原还原环境偏高' },
  '锰(Mn)': { standard: 0.1, unit: 'mg/L', type: '一般化学指标', description: '长期高锰摄入具神经毒性' },
  '高锰酸盐指数': { standard: 3.0, unit: 'mg/L', type: '一般化学指标', description: '有机污染综合指标' },
  '亚硝酸盐(NO₂⁻)': { standard: 0.02, unit: 'mg/L', type: '毒理指标', description: '强致癌物前体，比硝酸盐危害更大' },
  '砷(As)': { standard: 0.01, unit: 'mg/L', type: '毒理指标', description: '自然背景/工业污染，长期致癌' },
  '铅(Pb)': { standard: 0.01, unit: 'mg/L', type: '毒理指标', description: '工业排放/管道溶出' },
  '六价铬(Cr⁶⁺)': { standard: 0.05, unit: 'mg/L', type: '毒理指标', description: '工业废水排放，强致癌' },
  '挥发酚': { standard: 0.002, unit: 'mg/L', type: '毒理指标', description: '工业废水特征污染物' },
  '氰化物': { standard: 0.05, unit: 'mg/L', type: '毒理指标', description: '电镀/选矿工业废水' },
  '总大肠菌群': { standard: 3.0, unit: 'CFU/100mL', type: '微生物指标', description: '粪便污染指示菌' },
};

// ═══════════════════════════════════════════════════════
// 核心函数
// ═══════════════════════════════════════════════════════

/**
 * 根据Pi值和阈值判定预警等级
 */
export function getAlertLevel(pi: number, thresholds: AlertThresholds = DEFAULT_THRESHOLDS): AlertLevel {
  if (pi >= thresholds.severe) return '严重';
  if (pi >= thresholds.alert) return '警告';
  if (pi >= thresholds.warning) return '预警';
  if (pi >= thresholds.caution) return '关注';
  return '安全';
}

/**
 * 获取预警等级数值
 */
export function getAlertLevelNum(level: AlertLevel): number {
  return ALERT_LEVEL_NUM[level];
}

/**
 * 根据数值获取预警等级
 */
export function getLevelFromNum(num: number): AlertLevel {
  if (num < 0 || num > 4) return '安全';
  return NUM_TO_LEVEL[num];
}

/**
 * 综合预警等级判定（基于所有因子的最差等级）
 */
export function getOverallAlertLevel(results: FactorAlertResult[]): {
  level: AlertLevel;
  levelNum: number;
} {
  if (results.length === 0) return { level: '安全', levelNum: 0 };
  const maxNum = Math.max(...results.map(r => r.levelNum));
  return { level: NUM_TO_LEVEL[maxNum], levelNum: maxNum };
}

/**
 * 计算综合污染指数（等标污染指数法）
 * PI = (1/n) * Σ(Pi_i)
 * 其中 n 为因子总数，Pi_i 为各因子标准指数
 */
export function calcPollutionIndex(factorResults: FactorAlertResult[]): number {
  const validResults = factorResults.filter(r => r.Pi !== null && r.Pi > 0);
  if (validResults.length === 0) return 0;
  return validResults.reduce((sum, r) => sum + r.Pi!, 0) / validResults.length;
}

/**
 * 单因子预警分析
 * 输入：因子名、监测值、III类标准限值、阈值
 * 输出：FactorAlertResult
 */
export function calcFactorAlert(
  name: string,
  value: number | null,
  standardIII: number | null,
  unit: string = '',
  type: string = '',
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): FactorAlertResult {
  if (value === null || standardIII === null || standardIII === 0) {
    return {
      name, unit, value, standardIII,
      Pi: null, exceedanceRatio: null,
      level: '安全', levelNum: 0, type,
    };
  }

  const pi = value / standardIII;
  const ratio = pi > 1 ? pi : null;
  const level = getAlertLevel(pi, thresholds);
  const levelNum = ALERT_LEVEL_NUM[level];

  return { name, unit, value, standardIII, Pi: pi, exceedanceRatio: ratio, level, levelNum, type };
}

/**
 * 批量因子预警分析
 */
export function calcBatchFactorAlert(
  factors: Array<{ name: string; value: number | null; standardIII: number | null; unit?: string; type?: string }>,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): FactorAlertResult[] {
  return factors.map(f => calcFactorAlert(f.name, f.value, f.standardIII, f.unit, f.type, thresholds));
}

/**
 * 水样综合预警分析
 * 输入：一组因子数据 → 输出：SampleAlertResult
 */
export function calcSampleAlert(
  sampleName: string,
  factors: Array<{ name: string; value: number | null; standardIII: number | null; unit?: string; type?: string }>,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
): SampleAlertResult {
  const factorResults = calcBatchFactorAlert(factors, thresholds);
  const pollutionIndex = calcPollutionIndex(factorResults);
  // 超标因子判定：预警等级 >= 2（即Pi > 1.0）
  const exceededFactors = factorResults.filter(f => f.levelNum >= 2);
  const exceededNames = exceededFactors.map(f => f.name);
  const maxFactor = exceededFactors.length > 0
    ? exceededFactors.reduce((a, b) => a.levelNum >= b.levelNum ? a : b)
    : null;
  const overall = getOverallAlertLevel(factorResults);

  return {
    sampleName,
    level: overall.level,
    levelNum: overall.levelNum,
    pollutionIndex,
    factors: factorResults,
    exceededCount: exceededFactors.length,
    maxFactor,
    exceededFactors: exceededNames,
  };
}

// ═══════════════════════════════════════════════════════
// 区域风险评分
// ═══════════════════════════════════════════════════════

/**
 * 计算区域污染风险评分
 * 基于各因子超标率加权求和，权重反映危害程度
 */
export function calcRegionRisk(region: RegionInput): RegionRiskResult {
  // 权重：毒理指标 > 一般化学指标 > 感官指标
  const weights = {
    fluorideRate: 0.20,      // 氟化物 - 慢性健康危害大
    hardnessRate: 0.08,     // 总硬度 - 非直接健康危害
    nitrateRate: 0.18,      // 硝酸盐 - 毒理指标，致癌风险
    ironManganeseRate: 0.06, // 铁锰 - 影响感官
    ammoniaNitrogenRate: 0.10, // 氨氮 - 有机污染指示
    tdsRate: 0.12,          // TDS - 影响饮水适用性
  };

  const factorScores: Array<{ factor: string; rate: number; weight: number; score: number }> = [];
  const factorRateEntries: Array<[string, number]> = [
    ['氟化物', region.fluorideRate],
    ['总硬度', region.hardnessRate],
    ['硝酸盐', region.nitrateRate],
    ['铁锰', region.ironManganeseRate],
    ['氨氮', region.ammoniaNitrogenRate],
    ['TDS', region.tdsRate],
  ];

  const weightKeys = Object.keys(weights) as Array<keyof typeof weights>;
  let totalScore = 0;

  factorRateEntries.forEach(([factorName, rate], i) => {
    const w = weights[weightKeys[i]];
    const score = rate * w * 100;
    totalScore += score;
    factorScores.push({ factor: factorName, rate, weight: w, score });
  });

  // 线性映射到 0-100（理论上最大约 30.6，映射到 100）
  const riskScore = Math.min(100, Math.round(totalScore / 0.306));

  // 确定风险等级
  let riskLevel: AlertLevel;
  if (riskScore >= 75) riskLevel = '严重';
  else if (riskScore >= 55) riskLevel = '警告';
  else if (riskScore >= 35) riskLevel = '预警';
  else if (riskScore >= 15) riskLevel = '关注';
  else riskLevel = '安全';

  // 主要风险因子（超标率 > 20%）
  const primaryRisks = factorRateEntries
    .filter(([, rate]) => rate > 0.20)
    .map(([name]) => name);

  // 风险描述生成
  const highRiskCount = primaryRisks.length;
  let description: string;
  if (highRiskCount >= 4) description = '该区域多因子超标严重，需重点防控';
  else if (highRiskCount >= 2) description = '该区域部分因子超标，需持续关注';
  else if (highRiskCount >= 1) description = '该区域个别因子存在超标风险';
  else description = '该区域整体水质状况良好';

  return {
    region: region.region,
    area: region.area,
    riskScore,
    riskLevel,
    riskLevelNum: ALERT_LEVEL_NUM[riskLevel],
    primaryRisks,
    description,
  };
}

/**
 * 批量区域风险评分
 */
export function calcBatchRegionRisk(regions: RegionInput[]): RegionRiskResult[] {
  return regions.map(calcRegionRisk);
}

// ═══════════════════════════════════════════════════════
// 预警摘要统计
// ═══════════════════════════════════════════════════════

/**
 * 生成预警摘要统计
 */
export function calcAlertSummary(samples: SampleAlertResult[]): AlertSummary {
  const totalSamples = samples.length;
  const counts: Record<AlertLevel, number> = { '安全': 0, '关注': 0, '预警': 0, '警告': 0, '严重': 0 };
  const factorExceedMap: Record<string, number> = {};

  samples.forEach(s => {
    counts[s.level]++;
    s.exceededFactors.forEach(f => {
      factorExceedMap[f] = (factorExceedMap[f] || 0) + 1;
    });
  });

  const maxLevelNum = Math.max(...samples.map(s => s.levelNum));
  const exceededSamples = totalSamples - counts['安全'] - counts['关注'];
  const topExceededFactors = Object.entries(factorExceedMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return {
    totalSamples,
    safeCount: counts['安全'],
    cautionCount: counts['关注'],
    warningCount: counts['预警'],
    alertCount: counts['警告'],
    severeCount: counts['严重'],
    overallLevel: NUM_TO_LEVEL[maxLevelNum] || '安全',
    overallLevelNum: maxLevelNum,
    exceededRate: totalSamples > 0 ? exceededSamples / totalSamples : 0,
    topExceededFactors,
  };
}

// ═══════════════════════════════════════════════════════
// 示例数据生成（用于演示和测试）
// ═══════════════════════════════════════════════════════

/** 示例水样数据 */
export const DEMO_SAMPLES: Array<{ name: string; factors: Array<{ name: string; value: number; standardIII: number; unit: string; type: string }> }> = [
  {
    name: '沧州-深层承压水-01',
    factors: [
      { name: '氟化物', value: 2.8, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 680, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 2100, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 8.5, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
      { name: '氯化物(Cl⁻)', value: 380, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '硫酸盐(SO₄²⁻)', value: 120, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '石家庄-浅层孔隙水-02',
    factors: [
      { name: '氟化物', value: 0.5, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 520, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 850, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 28, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
      { name: '氨氮(NH₃-N)', value: 0.35, standardIII: 0.50, unit: 'mg/L', type: '一般化学指标' },
      { name: '高锰酸盐指数', value: 2.8, standardIII: 3.0, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '唐山-浅层水-03',
    factors: [
      { name: '氟化物', value: 0.8, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '铁(Fe)', value: 0.9, standardIII: 0.3, unit: 'mg/L', type: '一般化学指标' },
      { name: '锰(Mn)', value: 0.35, standardIII: 0.1, unit: 'mg/L', type: '一般化学指标' },
      { name: '氨氮(NH₃-N)', value: 0.65, standardIII: 0.50, unit: 'mg/L', type: '一般化学指标' },
      { name: '总硬度(CaCO₃)', value: 380, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 720, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '承德-基岩裂隙水-04',
    factors: [
      { name: '氟化物', value: 0.2, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 180, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 320, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 5.2, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
      { name: '硫酸盐(SO₄²⁻)', value: 45, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '氯化物(Cl⁻)', value: 32, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '衡水-深层承压水-05',
    factors: [
      { name: '氟化物', value: 3.5, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 950, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 3200, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '氯化物(Cl⁻)', value: 520, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '硫酸盐(SO₄²⁻)', value: 310, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 4.0, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
    ],
  },
];

/**
 * 生成演示预警结果
 */
export function getDemoAlertResults(thresholds?: AlertThresholds): SampleAlertResult[] {
  return DEMO_SAMPLES.map(s => calcSampleAlert(s.name, s.factors, thresholds));
}
