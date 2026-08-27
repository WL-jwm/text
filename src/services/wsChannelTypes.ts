/**
 * WebSocket 数据源 — 频道上下文类型
 */

import type { DataChannel, RealtimeReading, ChannelConfig } from './realtimeDataService';
import type { WsSourceConfig, WsConnectionState } from './realtimeTypes';

export interface WsChannelContext {
  channel: DataChannel;
  config: ChannelConfig;
  wsConfig: WsSourceConfig;
  onReading: (readings: RealtimeReading[]) => void;
  onError: (error: Error) => void;
  ws: WebSocket | null;
  state: WsConnectionState;
  reconnectCount: number;
  heartbeatTimer: ReturnType<typeof setInterval> | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  lastMessageTime: number;
  messagesReceived: number;
  bytesReceived: number;
  errors: number;
}

