// 时间序列分析 - 常量与工具函数
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import { TrendingDown, Droplets, FlaskConical, Trophy, BarChartHorizontal, BarChart3, Activity, GitCompare } from 'lucide-react';
import { cityExploitationYearly } from '../data/exploitation';

export const CITY_COLORS: Record<string, string> = {
  '石家庄': '#3b82f6',
  '保定': '#8b5cf6',
  '邯郸': '#f97316',
  '邢台': '#ef4444',
  '沧州': '#06b6d4',
  '衡水': '#10b981',
  '唐山': '#ec4899',
  '廊坊': '#f59e0b',
  '张家口': '#14b8a6',
  '承德': '#22d3ee',
  '秦皇岛': '#a855f7',
  '辛集': '#64748b',
  '定州': '#6366f1',
  '雄安新区': '#e11d48',
};

export const ALL_CITIES = Object.keys(cityExploitationYearly);
export const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
export const BASELINE_YEARS = YEARS.slice(); // 可选基准年
export const FORECAST_YEARS = [2025, 2026]; // 预测外推年

// ── 城市水文地质分组 ──
export const CITY_GROUPS: Record<string, { label: string; color: string; cities: string[] }> = {
  'mountain': { label: '山区', color: '#14b8a6', cities: ['张家口', '承德', '秦皇岛'] },
  'piedmont': { label: '山前平原', color: '#3b82f6', cities: ['石家庄', '保定', '唐山'] },
  'central': { label: '中部平原', color: '#f59e0b', cities: ['邯郸', '邢台', '衡水'] },
  'coastal': { label: '滨海平原', color: '#ef4444', cities: ['沧州', '廊坊'] },
};

/** 线性回归预测(最小二乘法) */
export function linearForecast(values: (number | null)[], years: number[], forecastYears: number[]): { slope: number; intercept: number; forecast: Record<number, number | null> } {
  const validPairs = values.map((v, i) => ({ x: years[i], y: v })).filter((p): p is { x: number; y: number } => p.y !== null && p.y !== undefined);
  if (validPairs.length < 2) return { slope: 0, intercept: 0, forecast: {} };
  const n = validPairs.length;
  const sumX = validPairs.reduce((s, p) => s + p.x, 0);
  const sumY = validPairs.reduce((s, p) => s + p.y, 0);
  const sumXY = validPairs.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = validPairs.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const forecast: Record<number, number | null> = {};
  forecastYears.forEach(y => { forecast[y] = Math.round((slope * y + intercept) * 100) / 100; });
  return { slope, intercept, forecast };
}

// ── Tab 定义 ──
export const TABS = [
  { key: 'exploitation', label: '开采量趋势', icon: Droplets, description: '2014-2024年各市地下水开采量变化' },
  { key: 'waterLevel', label: '水位埋深', icon: TrendingDown, description: '2024年各市浅层/深层水位埋深分布' },
  { key: 'quality', label: '水质改善', icon: FlaskConical, description: '2020-2024年各市地下水质量达标率变化' },
  { key: 'structure', label: '供水结构', icon: BarChart3, description: '2024年各市供水来源构成分析' },
  { key: 'radar', label: '雷达对比', icon: Activity, description: '多维度城市综合指标雷达图对比' },
  { key: 'forecast', label: '趋势预测', icon: TrendingDown, description: '线性回归预测2025-2026年+分组对比' },
  { key: 'subsidence', label: '沉降趋势', icon: TrendingDown, description: '2014-2024年各市地面沉降速率变化' },
  { key: 'correlation', label: '综合关联', icon: GitCompare, description: '开采-水位-水质-沉降四维关联分析' },
  { key: 'governance', label: '治理成效', icon: Trophy, description: '2014→2024年超采治理综合成效评估' },
  { key: 'regional', label: '区域对比', icon: BarChartHorizontal, description: '山区/山前/中部/滨海四区多维对比' },
] as const;

export type TabKey = typeof TABS[number]['key'];

// ── 城市选择器组件 ──
