/**
 * 地下水背景值计算 — 全因子/全分区汇总
 */

import type { BackgroundValueResult, ZoneCompareResult, ExceedanceResult, TrendDetectionResult } from './backgroundTypes';
import { calcBackgroundValue, calcZoneCompare, calcExceedance, calcTrendDetection } from './backgroundAlgorithms';
import { PRESET_FACTORS, PRESET_ZONES, PRESET_BACKGROUND_DATA, STANDARD_LIMITS, PRESET_TREND_DATA } from './backgroundPresets';

export function calcAllZonesBackground(): BackgroundValueResult[] {
  const results: BackgroundValueResult[] = [];
  for (const zone of PRESET_ZONES) {
    for (const factor of PRESET_FACTORS) {
      const samples = PRESET_BACKGROUND_DATA[zone][factor];
      if (!samples) continue;
      const { standard, unit } = STANDARD_LIMITS[factor];
      results.push(calcBackgroundValue({
        name: zone, factor, unit, samples, standard,
      }));
    }
  }
  return results;
}


export function calcAllZoneCompare(): ZoneCompareResult[] {
  return PRESET_FACTORS.map(factor => {
    const zoneData = PRESET_ZONES.map(zone => ({
      name: zone,
      samples: PRESET_BACKGROUND_DATA[zone][factor] ?? [],
    }));
    return calcZoneCompare(factor, zoneData);
  });
}


export function calcAllExceedance(): ExceedanceResult[] {
  // 汇总各因子所有分区样本
  return PRESET_FACTORS.map(factor => {
    const allSamples: number[] = [];
    for (const zone of PRESET_ZONES) {
      const s = PRESET_BACKGROUND_DATA[zone][factor];
      if (s) allSamples.push(...s);
    }
    const { standard, unit } = STANDARD_LIMITS[factor];
    return calcExceedance(factor, allSamples, standard, unit);
  });
}


export function calcAllTrends(): TrendDetectionResult[] {
  return Object.entries(PRESET_TREND_DATA).map(([factor, data]) =>
    calcTrendDetection(factor, data),
  );
}

