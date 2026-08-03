/**
 * F-01 实时数据接入框架 — 数据服务层
 * G-01a 升级：数据源适配器注入，支持 Mock/HTTP/WS
 *
 * 提供实时数据源，支持：
 *   - 轮询模式（interval-based polling）
 *   - 订阅/取消订阅（pub/sub pattern）
 *   - 数据缓存与过期检测
 *   - 多数据通道（水位/水质/沉降/开采量）
 *   - G-01a: 数据源适配器注入（Mock/HTTP/WS）
 *   - G-01a: 通道级独立数据源配置
 */

import type { RealtimeDataSource, DataSourceType } from './realtimeDataSource';
import { getDataSource, connectionLogger } from './realtimeDataSource';
import type { LogEntry } from './realtimeDataSource';
import type { ChannelSourceConfig } from '../config/realtimeConfig';
import { loadSourceConfigs, saveSourceConfigs, DEFAULT_SOURCE_CONFIGS } from '../config/realtimeConfig';

// ============================================================
// 类型定义
// ============================================================

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

const CHANNEL_CONFIGS: Record<DataChannel, ChannelConfig> = {
  waterLevel: {
    channel: 'waterLevel',
    label: '水位埋深',
    unit: 'm',
    intervalMs: 5000,
    stations: [
      { id: 'WL-CZ-01', name: '沧州监测站', city: '沧州', baseValue: 18.2, volatility: 0.15 },
      { id: 'WL-HS-01', name: '衡水监测站', city: '衡水', baseValue: 35.5, volatility: 0.20 },
      { id: 'WL-XT-01', name: '邢台监测站', city: '邢台', baseValue: 32.1, volatility: 0.18 },
      { id: 'WL-SJZ-01', name: '石家庄监测站', city: '石家庄', baseValue: 27.5, volatility: 0.12 },
      { id: 'WL-BD-01', name: '保定监测站', city: '保定', baseValue: 23.0, volatility: 0.10 },
      { id: 'WL-LF-01', name: '廊坊监测站', city: '廊坊', baseValue: 22.0, volatility: 0.11 },
    ],
  },
  waterQuality: {
    channel: 'waterQuality',
    label: '水质达标率',
    unit: '%',
    intervalMs: 8000,
    stations: [
      { id: 'WQ-CZ-01', name: '沧州水质站', city: '沧州', baseValue: 72, volatility: 2.5 },
      { id: 'WQ-HS-01', name: '衡水水质站', city: '衡水', baseValue: 78, volatility: 2.0 },
      { id: 'WQ-SJZ-01', name: '石家庄水质站', city: '石家庄', baseValue: 85, volatility: 1.5 },
      { id: 'WQ-BD-01', name: '保定水质站', city: '保定', baseValue: 88, volatility: 1.2 },
      { id: 'WQ-QHD-01', name: '秦皇岛水质站', city: '秦皇岛', baseValue: 92, volatility: 1.0 },
    ],
  },
  subsidence: {
    channel: 'subsidence',
    label: '沉降速率',
    unit: 'mm/a',
    intervalMs: 10000,
    stations: [
      { id: 'SUB-CZ-01', name: '沧州沉降点', city: '沧州', baseValue: 14.5, volatility: 0.3 },
      { id: 'SUB-HS-01', name: '衡水沉降点', city: '衡水', baseValue: 12.0, volatility: 0.25 },
      { id: 'SUB-LF-01', name: '廊坊沉降点', city: '廊坊', baseValue: 10.5, volatility: 0.2 },
      { id: 'SUB-HD-01', name: '邯郸沉降点', city: '邯郸', baseValue: 10.0, volatility: 0.2 },
    ],
  },
  extraction: {
    channel: 'extraction',
    label: '开采量',
    unit: '万m³/d',
    intervalMs: 6000,
    stations: [
      { id: 'EXT-SJZ-01', name: '石家庄开采区', city: '石家庄', baseValue: 125.5, volatility: 3.0 },
      { id: 'EXT-BD-01', name: '保定开采区', city: '保定', baseValue: 98.3, volatility: 2.5 },
      { id: 'EXT-HS-01', name: '衡水开采区', city: '衡水', baseValue: 87.6, volatility: 2.0 },
      { id: 'EXT-CZ-01', name: '沧州开采区', city: '沧州', baseValue: 76.2, volatility: 1.8 },
      { id: 'EXT-HD-01', name: '邯郸开采区', city: '邯郸', baseValue: 82.4, volatility: 2.2 },
    ],
  },
};

// ============================================================
// 预警阈值
// ============================================================

export const ALERT_THRESHOLDS: Record<DataChannel, { warning: number; critical: number; direction: 'above' | 'below' }> = {
  waterLevel: { warning: 30, critical: 40, direction: 'above' },
  waterQuality: { warning: 80, critical: 70, direction: 'below' },
  subsidence: { warning: 12, critical: 20, direction: 'above' },
  extraction: { warning: 100, critical: 130, direction: 'above' },
};

// ============================================================
// 实时数据服务（G-01a 升级版）
// ============================================================

class RealtimeDataService {
  private subscriptions = new Map<DataChannel, Set<SubscriptionCallback>>();
  private cache = new Map<DataChannel, RealtimeReading[]>();
  private lastUpdate = new Map<DataChannel, number>();
  private status: ConnectionStatus = 'disconnected';
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private globalListeners = new Set<SubscriptionCallback>();

  /** G-01a: 通道级数据源配置 */
  private sourceConfigs: Record<DataChannel, ChannelSourceConfig>;
  /** G-01a: 通道级数据源实例缓存 */
  private sourceInstances = new Map<DataChannel, RealtimeDataSource>();
  /** G-01a: 通道级连接断开函数 */
  private disconnectors = new Map<DataChannel, () => void>();
  /** G-01a: 通道级错误 */
  private channelErrors = new Map<DataChannel, string | undefined>();
  private errorListeners = new Set<(channel: DataChannel, error: string | undefined) => void>();

  constructor() {
    this.sourceConfigs = loadSourceConfigs();
  }

  /**
   * G-01a: 获取指定通道的数据源实例
   */
  private getDataSourceForChannel(channel: DataChannel): RealtimeDataSource {
    if (!this.sourceInstances.has(channel)) {
      const config = this.sourceConfigs[channel];
      this.sourceInstances.set(channel, getDataSource(config.type));
    }
    return this.sourceInstances.get(channel)!;
  }

  /**
   * G-01a: 构建带 HTTP 配置的 ChannelConfig
   */
  private buildChannelConfig(channel: DataChannel): ChannelConfig {
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
  private handleReadings(channel: DataChannel, readings: RealtimeReading[]): void {
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
  private handleError(channel: DataChannel, error: Error): void {
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

  private setStatus(status: ConnectionStatus): void {
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
  getDataSourceType(channel: DataChannel): DataSourceType {
    return this.sourceConfigs[channel].type;
  }

  /**
   * 获取通道数据源配置
   */
  getSourceConfig(channel: DataChannel): ChannelSourceConfig {
    return this.sourceConfigs[channel];
  }

  /**
   * 获取所有通道数据源配置
   */
  getAllSourceConfigs(): Record<DataChannel, ChannelSourceConfig> {
    return { ...this.sourceConfigs };
  }

  /**
   * 设置通道数据源类型（运行时切换）
   * 会断开当前连接，下次 subscribe 时使用新数据源
   */
  setDataSourceType(channel: DataChannel, type: DataSourceType): void {
    // 断开当前连接
    const disconnect = this.disconnectors.get(channel);
    if (disconnect) {
      disconnect();
      this.disconnectors.delete(channel);
    }
    this.sourceInstances.delete(channel);

    // 更新配置
    this.sourceConfigs[channel] = {
      ...this.sourceConfigs[channel],
      type,
      // 切换到 HTTP 时确保有 httpConfig
      httpConfig: type === 'http'
        ? this.sourceConfigs[channel].httpConfig ?? DEFAULT_SOURCE_CONFIGS[channel].httpConfig
        : this.sourceConfigs[channel].httpConfig,
    };
    saveSourceConfigs(this.sourceConfigs);

    connectionLogger.info(channel, type, `数据源已切换为 ${type}`);

    // 如果有订阅者，自动重连
    const subs = this.subscriptions.get(channel);
    if (subs && subs.size > 0) {
      const source = this.getDataSourceForChannel(channel);
      const config = this.buildChannelConfig(channel);
      this.setStatus('connecting');

      const newDisconnect = source.connect(
        channel,
        config,
        (readings) => this.handleReadings(channel, readings),
        (error) => this.handleError(channel, error),
      );
      this.disconnectors.set(channel, newDisconnect);

      if (!source.isPush) {
        this.setStatus('connected');
      }
    }
  }

  /**
   * 更新通道数据源配置
   */
  updateSourceConfig(channel: DataChannel, config: Partial<ChannelSourceConfig>): void {
    this.sourceConfigs[channel] = {
      ...this.sourceConfigs[channel],
      ...config,
    };
    saveSourceConfigs(this.sourceConfigs);
    connectionLogger.info(channel, this.sourceConfigs[channel].type, '数据源配置已更新');
  }

  /**
   * 启用/禁用通道
   */
  setChannelEnabled(channel: DataChannel, enabled: boolean): void {
    this.sourceConfigs[channel].enabled = enabled;
    saveSourceConfigs(this.sourceConfigs);

    if (!enabled) {
      const disconnect = this.disconnectors.get(channel);
      if (disconnect) {
        disconnect();
        this.disconnectors.delete(channel);
      }
    } else {
      // 重新连接
      const subs = this.subscriptions.get(channel);
      if (subs && subs.size > 0 && !this.disconnectors.has(channel)) {
        const source = this.getDataSourceForChannel(channel);
        const config = this.buildChannelConfig(channel);
        const disconnect = source.connect(
          channel,
          config,
          (readings) => this.handleReadings(channel, readings),
          (error) => this.handleError(channel, error),
        );
        this.disconnectors.set(channel, disconnect);
      }
    }
  }

  /**
   * 获取通道错误信息
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
  async testConnection(channel: DataChannel): Promise<boolean> {
    const source = this.getDataSourceForChannel(channel);
    const config = this.buildChannelConfig(channel);
    try {
      const ok = await source.testConnection(channel, config);
      connectionLogger.info(channel, this.sourceConfigs[channel].type, `连接测试: ${ok ? '成功' : '失败'}`);
      return ok;
    } catch (err) {
      connectionLogger.error(channel, this.sourceConfigs[channel].type, '连接测试异常', err instanceof Error ? err.message : String(err));
      return false;
    }
  }
}

// 单例导出
export const realtimeService = new RealtimeDataService();

// ============================================================
// 工具函数
// ============================================================

/**
 * 根据读数和阈值生成预警级别
 */
export function getAlertLevel(
  reading: RealtimeReading,
): 'normal' | 'warning' | 'critical' {
  const threshold = ALERT_THRESHOLDS[reading.channel];
  if (!threshold) return 'normal';

  if (threshold.direction === 'above') {
    if (reading.value >= threshold.critical) return 'critical';
    if (reading.value >= threshold.warning) return 'warning';
  } else {
    if (reading.value <= threshold.critical) return 'critical';
    if (reading.value <= threshold.warning) return 'warning';
  }
  return 'normal';
}

/**
 * 格式化时间戳为 "HH:mm:ss"
 */
export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/**
 * 格式化时间戳为 "X秒前 / X分钟前"
 */
export function formatTimeAgo(ts: number | undefined): string {
  if (!ts) return '未连接';
  const diff = Date.now() - ts;
  if (diff < 1000) return '刚刚';
  if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  return `${Math.floor(diff / 3600000)}小时前`;
}
