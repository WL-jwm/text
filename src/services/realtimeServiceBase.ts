/**
 * 实时数据服务 — 核心服务基类
 *  多源数据调度 / 订阅 / 缓存 / 状态机 / 日志（自 realtimeServiceCore.ts 二级拆分）
 */

import type { LogEntry, RealtimeDataSource } from './realtimeDataSource';
import { connectionLogger, getDataSource } from './realtimeDataSource';
import type { ChannelSourceConfig } from '../config/realtimeConfig';
import { loadSourceConfigs } from '../config/realtimeConfig';
import type {
  ChannelConfig,
  ConnectionStatus,
  DataChannel,
  RealtimeReading,
  SubscriptionCallback,
} from './realtimeServiceTypes';
import { CHANNEL_CONFIGS } from './realtimeServiceConstants';
export abstract class RealtimeServiceBase {
  protected subscriptions = new Map<DataChannel, Set<SubscriptionCallback>>();
  protected cache = new Map<DataChannel, RealtimeReading[]>();
  protected lastUpdate = new Map<DataChannel, number>();
  protected status: ConnectionStatus = 'disconnected';
  protected statusListeners = new Set<(status: ConnectionStatus) => void>();
  protected globalListeners = new Set<SubscriptionCallback>();

  /** G-01a: 通道级数据源配置 */
  protected sourceConfigs: Record<DataChannel, ChannelSourceConfig>;
  /** G-01a: 通道级数据源实例缓存 */
  protected sourceInstances = new Map<DataChannel, RealtimeDataSource>();
  /** G-01a: 通道级连接断开函数 */
  protected disconnectors = new Map<DataChannel, () => void>();
  /** G-01a: 通道级错误 */
  protected channelErrors = new Map<DataChannel, string | undefined>();
  protected errorListeners = new Set<(channel: DataChannel, error: string | undefined) => void>();

  constructor() {
    this.sourceConfigs = loadSourceConfigs();
  }

  /**
   * G-01a: 获取指定通道的数据源实例
   */
  protected getDataSourceForChannel(channel: DataChannel): RealtimeDataSource {
    if (!this.sourceInstances.has(channel)) {
      const config = this.sourceConfigs[channel];
      this.sourceInstances.set(channel, getDataSource(config.type));
    }
    return this.sourceInstances.get(channel)!;
  }

  /**
   * G-01a: 构建带 HTTP 配置的 ChannelConfig
   */
  protected buildChannelConfig(channel: DataChannel): ChannelConfig {
    const baseConfig = CHANNEL_CONFIGS[channel];
    const sourceConfig = this.sourceConfigs[channel];

    if (sourceConfig.type === 'http' && sourceConfig.httpConfig) {
      return { ...baseConfig, httpConfig: sourceConfig.httpConfig };
    }

    return baseConfig;
  }

  /**
   * G-01a: 采集数据回调处理器
   */
  protected handleReadings(channel: DataChannel, readings: RealtimeReading[]): void {
    this.cache.set(channel, readings);
    this.lastUpdate.set(channel, Date.now());
    this.channelErrors.set(channel, undefined);
    this.notifyErrorListeners(channel);

    // 通知订阅者
    const subs = this.subscriptions.get(channel);
    if (subs) {
      subs.forEach(cb => cb(readings));
    }
    this.globalListeners.forEach(cb => cb(readings));
  }

  /**
   * G-01a: 错误回调处理器
   */
  protected handleError(channel: DataChannel, error: Error): void {
    this.channelErrors.set(channel, error.message);
    this.notifyErrorListeners(channel);
    this.setStatus('error');
  }

  private notifyErrorListeners(channel: DataChannel): void {
    const err = this.channelErrors.get(channel);
    this.errorListeners.forEach(cb => cb(channel, err));
  }

  /**
   * 通知订阅者
   */
  private notify(channel: DataChannel, readings: RealtimeReading[]): void {
    const subs = this.subscriptions.get(channel);
    if (subs) {
      subs.forEach(cb => cb(readings));
    }
    this.globalListeners.forEach(cb => cb(readings));
  }

  /**
   * 订阅指定通道
   */
  subscribe(channel: DataChannel, callback: SubscriptionCallback): () => void {
    // 注册回调
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(callback);

    // 立即推送缓存数据
    const cached = this.cache.get(channel);
    if (cached) {
      callback(cached);
    }

    // 启动数据源连接（如果尚未运行）
    if (!this.disconnectors.has(channel)) {
      const sourceConfig = this.sourceConfigs[channel];
      if (!sourceConfig.enabled) {
        connectionLogger.warn(channel, sourceConfig.type, '通道已禁用，跳过连接');
        return () => this.unsubscribe(channel, callback);
      }

      const source = this.getDataSourceForChannel(channel);
      const config = this.buildChannelConfig(channel);

      connectionLogger.info(channel, sourceConfig.type, `数据源连接中...`);
      this.setStatus('connecting');

      const disconnect = source.connect(
        channel,
        config,
        (readings) => this.handleReadings(channel, readings),
        (error) => this.handleError(channel, error),
      );

      this.disconnectors.set(channel, disconnect);

      // Mock 和 HTTP 会立即推送，状态设为 connected
      if (!source.isPush) {
        this.setStatus('connected');
      }
    }

    return () => this.unsubscribe(channel, callback);
  }

  /**
   * 取消订阅
   */
  private unsubscribe(channel: DataChannel, callback: SubscriptionCallback): void {
    const subs = this.subscriptions.get(channel);
    if (subs) {
      subs.delete(callback);
      // 无订阅者时断开数据源
      if (subs.size === 0) {
        const disconnect = this.disconnectors.get(channel);
        if (disconnect) {
          disconnect();
          this.disconnectors.delete(channel);
        }
        this.subscriptions.delete(channel);
        this.sourceInstances.delete(channel);
      }
    }
  }

  /**
   * 订阅所有通道
   */
  subscribeAll(callback: SubscriptionCallback): () => void {
    this.globalListeners.add(callback);
    this.cache.forEach(readings => callback(readings));

    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    const unsubs = channels.map(ch => this.subscribe(ch, () => {}));

    return () => {
      this.globalListeners.delete(callback);
      unsubs.forEach(unsub => unsub());
    };
  }

  /**
   * 获取通道缓存数据
   */
  getCachedReadings(channel: DataChannel): RealtimeReading[] | undefined {
    return this.cache.get(channel);
  }

  /**
   * 获取最后更新时间
   */
  getLastUpdate(channel: DataChannel): number | undefined {
    return this.lastUpdate.get(channel);
  }

  /**
   * 获取所有通道的最后更新时间
   */
  getAllLastUpdates(): Record<DataChannel, number | undefined> {
    return {
      waterLevel: this.lastUpdate.get('waterLevel'),
      waterQuality: this.lastUpdate.get('waterQuality'),
      subsidence: this.lastUpdate.get('subsidence'),
      extraction: this.lastUpdate.get('extraction'),
    };
  }

  /**
   * 手动刷新指定通道
   */
  async refresh(channel: DataChannel): Promise<RealtimeReading[]> {
    const source = this.getDataSourceForChannel(channel);
    const config = this.buildChannelConfig(channel);

    try {
      const readings = await source.fetch(channel, config);
      this.handleReadings(channel, readings);
      return readings;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.handleError(channel, error);
      throw error;
    }
  }

  /**
   * 手动刷新所有通道
   */
  async refreshAll(): Promise<RealtimeReading[]> {
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    const all: RealtimeReading[] = [];
    const results = await Promise.allSettled(
      channels.map(ch => this.refresh(ch)),
    );
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        all.push(...result.value);
      }
    });
    return all;
  }

  /**
   * 获取连接状态
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * 订阅连接状态变化
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  protected setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach(cb => cb(status));
    }
  }

  /**
   * 获取通道配置
   */
  getChannelConfig(channel: DataChannel): ChannelConfig {
    return this.buildChannelConfig(channel);
  }

  /**
   * 获取所有通道配置
   */
  getAllChannelConfigs(): ChannelConfig[] {
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    return channels.map(ch => this.buildChannelConfig(ch));
  }

  /**
   * 检查数据是否过期
   */
  isStale(channel: DataChannel, maxAgeMs: number = 30000): boolean {
    const last = this.lastUpdate.get(channel);
    if (!last) return true;
    return Date.now() - last > maxAgeMs;
  }

  /**
   * 关闭所有通道
   */
  disconnect(): void {
    this.disconnectors.forEach(d => d());
    this.disconnectors.clear();
    this.subscriptions.clear();
    this.globalListeners.clear();
    this.sourceInstances.clear();
    this.setStatus('disconnected');
  }

  // ============================================================
  // G-01a: 数据源管理 API
  // ============================================================

  /**
   * 获取通道数据源类型
   */

  getChannelError(channel: DataChannel): string | undefined {
    return this.channelErrors.get(channel);
  }

  /**
   * 订阅通道错误变化
   */
  onChannelError(callback: (channel: DataChannel, error: string | undefined) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  /**
   * 获取连接日志
   */
  getConnectionLogs(): LogEntry[] {
    return connectionLogger.getLogs();
  }

  /**
   * 订阅连接日志
   */
  onLogs(callback: (logs: LogEntry[]) => void): () => void {
    return connectionLogger.subscribe(callback);
  }

  /**
   * 清除连接日志
   */
  clearLogs(): void {
    connectionLogger.clear();
  }

  /**
   * 测试通道连接
   */
}
