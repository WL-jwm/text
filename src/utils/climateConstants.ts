/**
 * 气候变化影响评估 — 情景参数与标签常量
 */

import type { ClimateScenario, DroughtIndex, AdaptationStrategy } from './climateTypes';

export const SCENARIO_PARAMS: Record<ClimateScenario, { deltaTemp: number; deltaPrecip: number; label: string; color: string }> = {
  historical: { deltaTemp: 0, deltaPrecip: 0, label: '历史基准', color: '#64748b' },
  rcp45: { deltaTemp: 2.0, deltaPrecip: 5, label: 'RCP4.5', color: '#06b6d4' },
  rcp85: { deltaTemp: 4.0, deltaPrecip: -10, label: 'RCP8.5', color: '#ef4444' },
  ssp245: { deltaTemp: 2.5, deltaPrecip: 3, label: 'SSP2-4.5', color: '#f59e0b' },
  ssp585: { deltaTemp: 4.5, deltaPrecip: -15, label: 'SSP5-8.5', color: '#dc2626' },
};


export const DROUGHT_CLASS_LABELS: Record<DroughtIndex['droughtClass'], string> = {
  none: '无干旱',
  mild: '轻微干旱',
  moderate: '中等干旱',
  severe: '严重干旱',
  extreme: '极端干旱',
};


export const DROUGHT_CLASS_COLORS: Record<DroughtIndex['droughtClass'], string> = {
  none: '#10b981',
  mild: '#fbbf24',
  moderate: '#f59e0b',
  severe: '#ea580c',
  extreme: '#dc2626',
};


export const RISK_LEVEL_LABELS: Record<string, string> = {
  'low': '低风险',
  'medium': '中等风险',
  'high': '高风险',
  'very-high': '极高风险',
};


export const RISK_LEVEL_COLORS: Record<string, string> = {
  'low': '#10b981',
  'medium': '#f59e0b',
  'high': '#ea580c',
  'very-high': '#dc2626',
};


export const CATEGORY_LABELS: Record<AdaptationStrategy['category'], string> = {
  supply: '供给侧',
  demand: '需求侧',
  ecology: '生态环境',
  monitoring: '监测预警',
  governance: '管理治理',
};

