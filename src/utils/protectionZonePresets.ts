/**
 * 水源地保护区计算 (G-16) — 预设水源地计算
 * 拆分自 protectionZoneCalculator.ts：单个/全部预设水源地保护区
 */

import { calcProtectionZone } from './protectionZoneAlgorithms';
import { PRESET_SOURCES } from './protectionZoneConstants';
import type { AnalyticInput, PresetSource, ProtectionZoneResult } from './protectionZoneTypes';
export function calcFromPreset(preset: PresetSource): ProtectionZoneResult {
  const input: AnalyticInput = {
    K: preset.K, I: preset.I, ne: preset.ne,
    M: preset.M, Q: preset.Q, rw: preset.rw,
  };
  return calcProtectionZone(preset.name, preset.type, input, preset.scale);
}

/**
 * 批量计算预设水源地保护区
 */
export function calcAllPresets(): ProtectionZoneResult[] {
  return PRESET_SOURCES.map(calcFromPreset);
}
