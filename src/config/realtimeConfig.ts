/**
 * G-01a 数据源配置 — 通道级数据源参数
 *
 * 为每个通道独立配置数据源类型和参数：
 *   - mock：本地模拟（默认，零配置）
 *   - http：HTTP API 轮询（需配置端点+响应映射）
 *   - ws：WebSocket 推送（G-01b 阶段启用）
 *
 * 配置持久化到 localStorage，支持运行时切换
 */

import type { DataChannel } from '../services/realtimeDataService';
import type { DataSourceType, HttpSourceConfig, WsSourceConfig } from '../services/realtimeDataSource';

// ============================================================
// 通道数据源配置
// ============================================================

export interface ChannelSourceConfig {
  /** 数据源类型 */
  type: DataSourceType;
  /** HTTP 配置（type=http 时必填） */
  httpConfig?: HttpSourceConfig;
  /** WebSocket 配置（type=ws 时必填） */
  wsConfig?: WsSourceConfig;
  /** 是否启用 */
  enabled: boolean;
}

/** 默认配置：全部使用 Mock 数据源 */
export const DEFAULT_SOURCE_CONFIGS: Record<DataChannel, ChannelSourceConfig> = {
  waterLevel: {
    type: 'mock',
    enabled: true,
    httpConfig: {
      endpoint: '/api/realtime/water-level',
      method: 'GET',
      timeoutMs: 10000,
      maxRetries: 3,
      retryDelayMs: 2000,
      responseMapping: {
        stationIdPath: 'stationId',
        stationNamePath: 'stationName',
        cityPath: 'city',
        valuePath: 'value',
        unitPath: 'unit',
        timestampPath: 'timestamp',
        qualityPath: 'quality',
        isArray: true,
        dataPath: 'data',
      },
    },
  },
  waterQuality: {
    type: 'mock',
    enabled: true,
    httpConfig: {
      endpoint: '/api/realtime/water-quality',
      method: 'GET',
      timeoutMs: 10000,
      maxRetries: 3,
      retryDelayMs: 2000,
      responseMapping: {
        stationIdPath: 'stationId',
        stationNamePath: 'stationName',
        cityPath: 'city',
        valuePath: 'value',
        unitPath: 'unit',
        timestampPath: 'timestamp',
        qualityPath: 'quality',
        isArray: true,
        dataPath: 'data',
      },
    },
  },
  subsidence: {
    type: 'mock',
    enabled: true,
    httpConfig: {
      endpoint: '/api/realtime/subsidence',
      method: 'GET',
      timeoutMs: 10000,
      maxRetries: 3,
      retryDelayMs: 2000,
      responseMapping: {
        stationIdPath: 'stationId',
        stationNamePath: 'stationName',
        cityPath: 'city',
        valuePath: 'value',
        unitPath: 'unit',
        timestampPath: 'timestamp',
        qualityPath: 'quality',
        isArray: true,
        dataPath: 'data',
      },
    },
  },
  extraction: {
    type: 'mock',
    enabled: true,
    httpConfig: {
      endpoint: '/api/realtime/extraction',
      method: 'GET',
      timeoutMs: 10000,
      maxRetries: 3,
      retryDelayMs: 2000,
      responseMapping: {
        stationIdPath: 'stationId',
        stationNamePath: 'stationName',
        cityPath: 'city',
        valuePath: 'value',
        unitPath: 'unit',
        timestampPath: 'timestamp',
        qualityPath: 'quality',
        isArray: true,
        dataPath: 'data',
      },
    },
  },
};

// ============================================================
// 配置持久化
// ============================================================

const STORAGE_KEY = 'realtime-source-configs';

/**
 * 加载持久化配置（回退到默认）
 */
export function loadSourceConfigs(): Record<DataChannel, ChannelSourceConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SOURCE_CONFIGS };

    const parsed = JSON.parse(raw) as Partial<Record<DataChannel, ChannelSourceConfig>>;
    // 合并默认值，确保新通道有回退
    return {
      waterLevel: parsed.waterLevel ?? DEFAULT_SOURCE_CONFIGS.waterLevel,
      waterQuality: parsed.waterQuality ?? DEFAULT_SOURCE_CONFIGS.waterQuality,
      subsidence: parsed.subsidence ?? DEFAULT_SOURCE_CONFIGS.subsidence,
      extraction: parsed.extraction ?? DEFAULT_SOURCE_CONFIGS.extraction,
    };
  } catch {
    return { ...DEFAULT_SOURCE_CONFIGS };
  }
}

/**
 * 保存配置到 localStorage
 */
export function saveSourceConfigs(configs: Record<DataChannel, ChannelSourceConfig>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // localStorage 可能被禁用（隐私模式），静默失败
  }
}

/**
 * 重置为默认配置
 */
export function resetSourceConfigs(): Record<DataChannel, ChannelSourceConfig> {
  const defaults = { ...DEFAULT_SOURCE_CONFIGS };
  saveSourceConfigs(defaults);
  return defaults;
}
