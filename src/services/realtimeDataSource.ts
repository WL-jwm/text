/**
 * G-01a 数据源基础层 — 统一数据源接口与适配器
 *
 * 提供 RealtimeDataSource 统一接口，支持：
 *   - MockDataSource：本地模拟数据（沿用 F-01 的 generateMockReading 逻辑）
 *   - HttpPollingDataSource：HTTP 轮询数据源
 *   - WebSocketDataSource（stub）：为 G-01b 预留的 WebSocket 实时推送
 *
 * 设计原则：
 *   - 所有数据源实现统一接口，上层 realtimeDataService 无需感知数据来源
 *   - 通道级别独立连接，支持混合数据源（部分 Mock + 部分 HTTP）
 *   - 内置重试、超时、错误回退机制
 *   - 连接日志记录，为 G-01b 诊断面板提供数据
 */

import type { ChannelConfig, DataChannel, RealtimeReading } from './realtimeDataService';

// ============================================================
// 连接日志
// ============================================================

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  channel: DataChannel;
  sourceType: DataSourceType;
  message: string;
  detail?: string;
}

/**
 * 连接日志缓冲区（环形缓冲，最大 200 条）
 */
class ConnectionLogger {
  private logs: LogEntry[] = [];
  private listeners = new Set<(logs: LogEntry[]) => void>();
  private readonly maxEntries = 200;

  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const full: LogEntry = { ...entry, timestamp: Date.now() };
    this.logs.push(full);
    if (this.logs.length > this.maxEntries) {
      this.logs.shift();
    }
    this.listeners.forEach(cb => cb(this.logs));
  }

  info(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'info', channel, sourceType, message, detail });
  }

  warn(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'warn', channel, sourceType, message, detail });
  }

  error(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'error', channel, sourceType, message, detail });
  }

  debug(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'debug', channel, sourceType, message, detail });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByChannel(channel: DataChannel): LogEntry[] {
    return this.logs.filter(l => l.channel === channel);
  }

  clear(): void {
    this.logs = [];
    this.listeners.forEach(cb => cb(this.logs));
  }

  subscribe(cb: (logs: LogEntry[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.logs);
    return () => this.listeners.delete(cb);
  }
}

export const connectionLogger = new ConnectionLogger();

// ============================================================
// 数据源类型与配置
// ============================================================

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

/**
 * Box-Muller 变换生成高斯随机数
 */
function gaussian(): number {
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * 从对象中按路径读取值
 * @example getPath({ data: { id: 'A1' } }, 'data.id') → 'A1'
 */
function getPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * 将未知值安全转换为 number
 */
function toNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  return 0;
}

/**
 * 将未知值安全转换为 string
 */
function toStr(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
}

/**
 * 将未知值安全转换为 quality
 */
function toQuality(val: unknown): RealtimeReading['quality'] {
  const s = toStr(val, 'good');
  if (s === 'fair' || s === 'poor') return s;
  return 'good';
}

// ============================================================
// MockDataSource — 本地模拟数据源
// ============================================================

export class MockDataSource implements RealtimeDataSource {
  readonly type: DataSourceType = 'mock';
  readonly isPush = false;

  private timers = new Map<DataChannel, ReturnType<typeof setInterval>>();

  /**
   * 生成单条模拟读数
   */
  private generateReading(
    station: ChannelConfig['stations'][number],
    channel: DataChannel,
    config: ChannelConfig,
  ): RealtimeReading {
    const noise = gaussian() * station.volatility;
    const value = station.baseValue + noise;
    const deviation = Math.abs(noise) / station.volatility;
    const quality: RealtimeReading['quality'] = deviation < 1 ? 'good' : deviation < 2 ? 'fair' : 'poor';

    return {
      stationId: station.id,
      stationName: station.name,
      city: station.city,
      channel,
      value: Math.round(value * 100) / 100,
      unit: config.unit,
      timestamp: Date.now(),
      quality,
    };
  }

  private collectAll(channel: DataChannel, config: ChannelConfig): RealtimeReading[] {
    return config.stations.map(station => this.generateReading(station, channel, config));
  }

  connect(
    channel: DataChannel,
    config: ChannelConfig,
    onReading: (readings: RealtimeReading[]) => void,
    _onError: (error: Error) => void,
  ): () => void {
    connectionLogger.info(channel, this.type, `Mock 数据源已连接，轮询间隔 ${config.intervalMs}ms`);

    // 立即采集一次
    const readings = this.collectAll(channel, config);
    onReading(readings);

    const timer = setInterval(() => {
      onReading(this.collectAll(channel, config));
    }, config.intervalMs);

    this.timers.set(channel, timer);

    return () => {
      clearInterval(timer);
      this.timers.delete(channel);
      connectionLogger.info(channel, this.type, 'Mock 数据源已断开');
    };
  }

  async fetch(channel: DataChannel, config: ChannelConfig): Promise<RealtimeReading[]> {
    connectionLogger.debug(channel, this.type, 'Mock fetch 请求');
    return this.collectAll(channel, config);
  }

  async testConnection(_channel: DataChannel, _config: ChannelConfig): Promise<boolean> {
    return true;
  }
}

// ============================================================
// HttpPollingDataSource — HTTP 轮询数据源
// ============================================================

export class HttpPollingDataSource implements RealtimeDataSource {
  readonly type: DataSourceType = 'http';
  readonly isPush = false;

  private timers = new Map<DataChannel, ReturnType<typeof setInterval>>();
  private abortControllers = new Map<DataChannel, AbortController>();

  private async fetchOnce(
    channel: DataChannel,
    config: ChannelConfig,
    sourceConfig: HttpSourceConfig,
  ): Promise<RealtimeReading[]> {
    const {
      endpoint,
      method = 'GET',
      headers = {},
      body,
      authToken,
      timeoutMs = 10000,
      maxRetries = 3,
      retryDelayMs = 2000,
      responseMapping,
    } = sourceConfig;

    const reqHeaders: Record<string, string> = { ...headers };
    if (authToken) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      this.abortControllers.set(channel, controller);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        connectionLogger.debug(channel, this.type, `HTTP 请求 attempt=${attempt}`, endpoint);

        const resp = await fetch(endpoint, {
          method,
          headers: reqHeaders,
          body: method === 'POST' ? body : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        this.abortControllers.delete(channel);

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }

        const json = await resp.json();
        return this.parseResponse(json, channel, config, responseMapping);
      } catch (err) {
        clearTimeout(timeoutId);
        this.abortControllers.delete(channel);

        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < maxRetries) {
          connectionLogger.warn(channel, this.type, `请求失败，${retryDelayMs}ms 后重试 (${attempt + 1}/${maxRetries})`, lastError.message);
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    throw lastError ?? new Error('Unknown HTTP error');
  }

  /**
   * 按 responseMapping 解析响应数据
   */
  private parseResponse(
    json: unknown,
    channel: DataChannel,
    config: ChannelConfig,
    mapping: HttpResponseMapping,
  ): RealtimeReading[] {
    let dataArr: unknown[];

    if (mapping.dataPath) {
      const wrapped = getPath(json, mapping.dataPath);
      if (!Array.isArray(wrapped)) {
        connectionLogger.error(channel, this.type, `响应数据路径 "${mapping.dataPath}" 不是数组`);
        return [];
      }
      dataArr = wrapped;
    } else if (mapping.isArray) {
      if (!Array.isArray(json)) {
        connectionLogger.error(channel, this.type, '响应不是数组');
        return [];
      }
      dataArr = json;
    } else {
      dataArr = [json];
    }

    return dataArr.map(item => {
      const stationId = toStr(getPath(item, mapping.stationIdPath));
      return {
        stationId,
        stationName: mapping.stationNamePath
          ? toStr(getPath(item, mapping.stationNamePath), stationId)
          : stationId,
        city: mapping.cityPath
          ? toStr(getPath(item, mapping.cityPath))
          : config.channel,
        channel,
        value: Math.round(toNumber(getPath(item, mapping.valuePath)) * 100) / 100,
        unit: mapping.unitPath
          ? toStr(getPath(item, mapping.unitPath), config.unit)
          : config.unit,
        timestamp: mapping.timestampPath
          ? toNumber(getPath(item, mapping.timestampPath))
          : Date.now(),
        quality: mapping.qualityPath
          ? toQuality(getPath(item, mapping.qualityPath))
          : 'good',
      } satisfies RealtimeReading;
    });
  }

  connect(
    channel: DataChannel,
    config: ChannelConfig,
    onReading: (readings: RealtimeReading[]) => void,
    onError: (error: Error) => void,
  ): () => void {
    // HttpPollingDataSource 需要 sourceConfig，这里通过 config 扩展获取
    // 实际使用时由 realtimeDataService 传入带 httpConfig 的 ChannelConfig
    const sourceConfig = (config as ChannelConfig & { httpConfig?: HttpSourceConfig }).httpConfig;

    if (!sourceConfig) {
      const err = new Error(`通道 ${channel} 未配置 HTTP 数据源参数`);
      connectionLogger.error(channel, this.type, err.message);
      onError(err);
      return () => {};
    }

    connectionLogger.info(channel, this.type, `HTTP 数据源已连接，端点: ${sourceConfig.endpoint}`);

    // 初始请求
    this.fetchOnce(channel, config, sourceConfig)
      .then(readings => onReading(readings))
      .catch(err => {
        connectionLogger.error(channel, this.type, '初始请求失败', err.message);
        onError(err);
      });

    const timer = setInterval(() => {
      this.fetchOnce(channel, config, sourceConfig)
        .then(readings => onReading(readings))
        .catch(err => {
          connectionLogger.error(channel, this.type, '轮询请求失败', err.message);
          onError(err);
        });
    }, config.intervalMs);

    this.timers.set(channel, timer);

    return () => {
      clearInterval(timer);
      this.timers.delete(channel);
      const controller = this.abortControllers.get(channel);
      if (controller) {
        controller.abort();
        this.abortControllers.delete(channel);
      }
      connectionLogger.info(channel, this.type, 'HTTP 数据源已断开');
    };
  }

  async fetch(channel: DataChannel, config: ChannelConfig): Promise<RealtimeReading[]> {
    const sourceConfig = (config as ChannelConfig & { httpConfig?: HttpSourceConfig }).httpConfig;
    if (!sourceConfig) {
      throw new Error(`通道 ${channel} 未配置 HTTP 数据源参数`);
    }
    return this.fetchOnce(channel, config, sourceConfig);
  }

  async testConnection(channel: DataChannel, config: ChannelConfig): Promise<boolean> {
    try {
      const readings = await this.fetch(channel, config);
      return readings.length > 0;
    } catch {
      return false;
    }
  }
}

// ============================================================
// WebSocketDataSource — G-01b 预留 stub
// ============================================================

export class WebSocketDataSource implements RealtimeDataSource {
  readonly type: DataSourceType = 'ws';
  readonly isPush = true;

  connect(
    _channel: DataChannel,
    _config: ChannelConfig,
    _onReading: (readings: RealtimeReading[]) => void,
    onError: (error: Error) => void,
  ): () => void {
    const err = new Error('WebSocket 数据源尚未实现，将在 G-01b 阶段完成');
    connectionLogger.error(_channel, this.type, err.message);
    onError(err);
    return () => {};
  }

  async fetch(_channel: DataChannel, _config: ChannelConfig): Promise<RealtimeReading[]> {
    throw new Error('WebSocket 数据源不支持主动拉取，请在 G-01b 阶段实现推送模式');
  }

  async testConnection(_channel: DataChannel, _config: ChannelConfig): Promise<boolean> {
    return false;
  }
}

// ============================================================
// 数据源工厂
// ============================================================

const dataSourceInstances = new Map<DataSourceType, RealtimeDataSource>();

/**
 * 获取指定类型的数据源实例（单例）
 */
export function getDataSource(type: DataSourceType): RealtimeDataSource {
  if (!dataSourceInstances.has(type)) {
    switch (type) {
      case 'mock':
        dataSourceInstances.set(type, new MockDataSource());
        break;
      case 'http':
        dataSourceInstances.set(type, new HttpPollingDataSource());
        break;
      case 'ws':
        dataSourceInstances.set(type, new WebSocketDataSource());
        break;
    }
  }
  return dataSourceInstances.get(type)!;
}
