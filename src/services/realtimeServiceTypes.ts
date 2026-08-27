/**
 * 实时数据服务 — 类型定义
 */

export type DataChannel = 'waterLevel' | 'waterQuality' | 'subsidence' | 'extraction';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface RealtimeReading {
  stationId: string;
  stationName: string;
  city: string;
  channel: DataChannel;
  value: number;
  unit: string;
  timestamp: number;
  quality: 'good' | 'fair' | 'poor';
}

export interface ChannelConfig {
  channel: DataChannel;
  label: string;
  unit: string;
  intervalMs: number;
  stations: { id: string; name: string; city: string; baseValue: number; volatility: number }[];
  /** G-01a: 附加 HTTP 数据源配置（可选） */
  httpConfig?: import('./realtimeDataSource').HttpSourceConfig;
}

export interface SubscriptionCallback {
  (readings: RealtimeReading[]): void;
}

// ============================================================
// 通道配置 — 基于现有监测网数据
// ============================================================
