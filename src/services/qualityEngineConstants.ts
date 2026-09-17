/**
 * 数据质量引擎 (G-15) — 默认规则
 * 拆分自 qualityEngine.ts：DEFAULT_QUALITY_RULES 默认质量规则集
 */

import type { DataChannel } from './realtimeDataService';
import type {
  MissingRuleConfig,
  RangeRuleConfig,
  RateRuleConfig,
  StuckRuleConfig,
} from './qualityEngineTypes';
export const DEFAULT_QUALITY_RULES: Record<DataChannel, {
  range: RangeRuleConfig;
  rate: RateRuleConfig;
  stuck: StuckRuleConfig;
  missing: MissingRuleConfig;
}> = {
  waterLevel: {
    range: { channel: 'waterLevel', min: 0, max: 80, weight: 30 },
    rate: { channel: 'waterLevel', maxRate: 5, weight: 25 },
    stuck: { channel: 'waterLevel', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'waterLevel', maxIntervalMs: 30000, weight: 25 },
  },
  waterQuality: {
    range: { channel: 'waterQuality', min: 0, max: 100, weight: 30 },
    rate: { channel: 'waterQuality', maxRate: 15, weight: 25 },
    stuck: { channel: 'waterQuality', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'waterQuality', maxIntervalMs: 30000, weight: 25 },
  },
  subsidence: {
    range: { channel: 'subsidence', min: 0, max: 50, weight: 30 },
    rate: { channel: 'subsidence', maxRate: 3, weight: 25 },
    stuck: { channel: 'subsidence', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'subsidence', maxIntervalMs: 30000, weight: 25 },
  },
  extraction: {
    range: { channel: 'extraction', min: 0, max: 300, weight: 30 },
    rate: { channel: 'extraction', maxRate: 20, weight: 25 },
    stuck: { channel: 'extraction', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'extraction', maxIntervalMs: 30000, weight: 25 },
  },
};
