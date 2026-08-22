/**
 * 实时数据源 — 类型定义（自 realtimeDataSource 拆分）
 */
import type { DataChannel, RealtimeReading, ChannelConfig } from './realtimeDataService';

export type DataSourceType = 'mock' | 'http' | 'ws';

export interface HttpResponseMapping {
  /** 响应 JSON 中读取站点 ID 的字段路径，如 "stationId" 或 "data.id" */
  stationIdPath: string;
  /** 站点名称字段路径 */
  stationNamePath?: string;
  /** 城市字段路径 */
  cityPath?: string;
  /** 数值字段路径 */
  valuePath: string;
  /** 单位字段路径（可选，回退到通道配置） */
  unitPath?: string;
  /** 时间戳字段路径（可选，回退到 Date.now()） */
  timestampPath?: string;
  /** 质量字段路径（可选） */
  qualityPath?: string;
  /** 是否响应为数组（true=多站点，false=单站点） */
  isArray: boolean;
  /** 如果响应有外层包裹，指定数据数组路径，如 "data.stations" */
  dataPath?: string;
}

export interface HttpSourceConfig {
  /** API 端点 URL */
  endpoint: string;
  /** 请求方法 */
  method?: 'GET' | 'POST';
  /** 请求头 */
  headers?: Record<string, string>;
   /** 请求体（POST 时使用） */
  body?: string;
  /** 认证 token（追加到 Authorization 头） */
  authToken?: string;
  /** 超时毫秒 */
  timeoutMs?: number;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 重试间隔毫秒 */
  retryDelayMs?: number;
  /** 响应映射规则 */
  responseMapping: HttpResponseMapping;
}

export interface WsSourceConfig {
  /** WebSocket URL */
  url: string;
  /** 子协议 */
  protocols?: string[];
  /** 认证消息（连接后发送） */
  authMessage?: string;
  /** 心跳间隔毫秒 */
  heartbeatMs?: number;
  /** 重连间隔毫秒 */
  reconnectDelayMs?: number;
  /** 最大重连次数 */
  maxReconnects?: number;
  /** 响应映射规则（同 HTTP） */
  responseMapping: HttpResponseMapping;
}

export type SourceConfig = HttpSourceConfig | WsSourceConfig;

// ============================================================
// 统一数据源接口
// ============================================================

export interface RealtimeDataSource {
  /** 数据源类型 */
  readonly type: DataSourceType;

  /**
   * 连接指定通道，开始采集数据
   * @returns 取消连接函数
   */
  connect(
    channel: DataChannel,
    config: ChannelConfig,
    onReading: (readings: RealtimeReading[]) => void,
    onError: (error: Error) => void,
  ): () => void;

  /**
   * 手动请求一次数据（非轮询）
   */
  fetch(channel: DataChannel, config: ChannelConfig): Promise<RealtimeReading[]>;

  /**
   * 测试连接是否可用
   */
  testConnection(channel: DataChannel, config: ChannelConfig): Promise<boolean>;

  /**
   * 是否支持推送模式（WebSocket=true, HTTP/Mock=false）
   */
  readonly isPush: boolean;
}

// ============================================================
// 辅助工具
// ============================================================


export type WsConnectionState = 'idle' | 'connecting' | 'open' | 'closing' | 'closed' | 'error';
