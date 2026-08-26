/**
 * 污染预警引擎 — 预警等级/阈值/标准常量
 */

import type { AlertLevel, AlertLevelMeta, AlertThresholds, RegionInput, TrendPoint } from './pollutionAlertTypes';

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

export const ALERT_LEVEL_NUM: Record<AlertLevel, number> = {
  '安全': 0,
  '关注': 1,
  '预警': 2,
  '警告': 3,
  '严重': 4,
};

/** 预警等级从数值映射 */

export const NUM_TO_LEVEL: AlertLevel[] = ['安全', '关注', '预警', '警告', '严重'];

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
