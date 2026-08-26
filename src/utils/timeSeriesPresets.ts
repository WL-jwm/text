/**
 * 时间序列分析 — 预设序列与汇总
 */

import type { TimeSeriesInput, TimeSeriesResult } from './timeSeriesTypes';
import { calcTimeSeriesAnalysis } from './timeSeriesAlgorithms';
import { round } from './timeSeriesUtils';

export const PRESET_SERIES: TimeSeriesInput[] = [
  {
    name: '衡水深层地下水埋深', dataType: '水位埋深', unit: 'm',
    data: [
      { year: 2014, value: 68.5 }, { year: 2015, value: 69.8 }, { year: 2016, value: 70.2 },
      { year: 2017, value: 71.5 }, { year: 2018, value: 70.8 }, { year: 2019, value: 69.2 },
      { year: 2020, value: 67.5 }, { year: 2021, value: 65.8 }, { year: 2022, value: 64.2 },
      { year: 2023, value: 63.5 }, { year: 2024, value: 62.8 },
    ],
  },
  {
    name: '沧州深层地下水埋深', dataType: '水位埋深', unit: 'm',
    data: [
      { year: 2014, value: 55.2 }, { year: 2015, value: 56.0 }, { year: 2016, value: 56.8 },
      { year: 2017, value: 57.5 }, { year: 2018, value: 56.2 }, { year: 2019, value: 54.5 },
      { year: 2020, value: 52.8 }, { year: 2021, value: 51.0 }, { year: 2022, value: 49.5 },
      { year: 2023, value: 48.2 }, { year: 2024, value: 47.0 },
    ],
  },
  {
    name: '石家庄浅层开采量', dataType: '开采量', unit: '亿m³',
    data: [
      { year: 2014, value: 18.5 }, { year: 2015, value: 17.8 }, { year: 2016, value: 17.2 },
      { year: 2017, value: 16.5 }, { year: 2018, value: 15.8 }, { year: 2019, value: 15.2 },
      { year: 2020, value: 14.5 }, { year: 2021, value: 13.8 }, { year: 2022, value: 13.2 },
      { year: 2023, value: 12.5 }, { year: 2024, value: 12.0 },
    ],
  },
  {
    name: '邢台水质达标率', dataType: '水质指数', unit: '%',
    data: [
      { year: 2014, value: 42.5 }, { year: 2015, value: 45.0 }, { year: 2016, value: 48.5 },
      { year: 2017, value: 52.0 }, { year: 2018, value: 55.5 }, { year: 2019, value: 58.0 },
      { year: 2020, value: 62.5 }, { year: 2021, value: 66.0 }, { year: 2022, value: 70.5 },
      { year: 2023, value: 74.0 }, { year: 2024, value: 78.5 },
    ],
  },
  {
    name: '沧州地面沉降速率', dataType: '沉降速率', unit: 'mm/a',
    data: [
      { year: 2014, value: 45.2 }, { year: 2015, value: 42.8 }, { year: 2016, value: 40.5 },
      { year: 2017, value: 38.0 }, { year: 2018, value: 35.2 }, { year: 2019, value: 32.0 },
      { year: 2020, value: 28.5 }, { year: 2021, value: 25.0 }, { year: 2022, value: 22.0 },
      { year: 2023, value: 18.5 }, { year: 2024, value: 15.2 },
    ],
  },
  {
    name: '保定浅层水位埋深', dataType: '水位埋深', unit: 'm',
    data: [
      { year: 2014, value: 22.5 }, { year: 2015, value: 23.0 }, { year: 2016, value: 23.2 },
      { year: 2017, value: 23.5 }, { year: 2018, value: 22.8 }, { year: 2019, value: 22.0 },
      { year: 2020, value: 21.2 }, { year: 2021, value: 20.5 }, { year: 2022, value: 19.8 },
      { year: 2023, value: 19.2 }, { year: 2024, value: 18.5 },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// 批量计算
// ═══════════════════════════════════════════════════════


export function calcAllPresetSeries(): TimeSeriesResult[] {
  return PRESET_SERIES.map(s => calcTimeSeriesAnalysis(s));
}


export function calcSeriesSummary() {
  const results = calcAllPresetSeries();
  const trendCounts = { '上升': 0, '下降': 0, '无显著趋势': 0 };
  results.forEach(r => { trendCounts[r.trend.trend]++; });

  const changeCount = results.filter(r => r.changePoint.hasChangePoint).length;
  const avgR2 = results.reduce((s, r) => s + r.trend.r2, 0) / results.length;
  const avgCv = results.reduce((s, r) => s + r.periodicity.cv, 0) / results.length;

  return { seriesCount: PRESET_SERIES.length, trendCounts, changeCount, avgR2: round(avgR2, 3), avgCv: round(avgCv, 3), results };
}

