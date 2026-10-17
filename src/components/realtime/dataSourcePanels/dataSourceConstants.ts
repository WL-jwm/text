/**
 * 共享常量（拆分自 DataSourcePanel.tsx）
 */
import type { DataChannel } from '../../../services/realtimeDataService';
import type { DataSourceType } from '../../../services/realtimeDataSource';

export const CHANNELS: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

export const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

export const SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  mock: 'Mock 模拟',
  http: 'HTTP 轮询',
  ws: 'WebSocket 推送',
};

export const LOG_LEVEL_COLORS: Record<string, string> = {
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-gray-500',
};

