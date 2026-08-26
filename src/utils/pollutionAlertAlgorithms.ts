/**
 * 污染预警引擎 — 核心算法
 *  单因子污染指数 / 内梅罗综合指数 / 样本评价 / 区域风险 / 汇总
 */

import type { AlertLevel, AlertThresholds, FactorAlertResult, SampleAlertResult, RegionRiskResult, RegionInput, AlertSummary } from './pollutionAlertTypes';
import { DEFAULT_THRESHOLDS, ALERT_LEVEL_NUM, NUM_TO_LEVEL } from './pollutionAlertConstants';

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
