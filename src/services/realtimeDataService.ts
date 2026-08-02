/**
 * F-01 实时数据接入框架 — 数据服务层
 *
 * 提供模拟实时数据源，支持：
 *   - 轮询模式（interval-based polling）
 *   - 订阅/取消订阅（pub/sub pattern）
 *   - 数据缓存与过期检测
 *   - 多数据通道（水位/水质/沉降/开采量）
 *
 * 实际生产环境中可将 generateMockReading() 替换为真实 API 调用。
 */

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
// 实时数据服务
// ============================================================

class RealtimeDataService {
  private timers = new Map<DataChannel, ReturnType<typeof setInterval>>();
  private subscriptions = new Map<DataChannel, Set<SubscriptionCallback>>();
  private cache = new Map<DataChannel, RealtimeReading[]>();
  private lastUpdate = new Map<DataChannel, number>();
  private status: ConnectionStatus = 'disconnected';
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private globalListeners = new Set<SubscriptionCallback>();

  /**
   * 生成单条模拟读数（基于基准值 + 高斯噪声）
   */
  private generateMockReading(
    station: ChannelConfig['stations'][number],
    channel: DataChannel,
    config: ChannelConfig,
  ): RealtimeReading {
    // Box-Muller 变换生成高斯随机数
    const u1 = Math.random() || 0.0001;
    const u2 = Math.random();
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const noise = gauss * station.volatility;
    const value = station.baseValue + noise;

    // 数据质量评级
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

  /**
   * 采集指定通道的全部站点读数
   */
  private collectChannel(channel: DataChannel): RealtimeReading[] {
    const config = CHANNEL_CONFIGS[channel];
    const readings = config.stations.map(station =>
      this.generateMockReading(station, channel, config),
    );
    this.cache.set(channel, readings);
    this.lastUpdate.set(channel, Date.now());
    return readings;
  }

  /**
   * 通知订阅者
   */
  private notify(channel: DataChannel, readings: RealtimeReading[]): void {
    // 通道订阅者
    const subs = this.subscriptions.get(channel);
    if (subs) {
      subs.forEach(cb => cb(readings));
    }
    // 全局订阅者
    this.globalListeners.forEach(cb => cb(readings));
  }

  /**
   * 启动指定通道的轮询
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

    // 启动定时器（如果尚未运行）
    if (!this.timers.has(channel)) {
      const config = CHANNEL_CONFIGS[channel];
      // 立即采集一次
      const readings = this.collectChannel(channel);
      this.notify(channel, readings);
      this.setStatus('connected');

      // 启动轮询
      const timer = setInterval(() => {
        const fresh = this.collectChannel(channel);
        this.notify(channel, fresh);
      }, config.intervalMs);
      this.timers.set(channel, timer);
    }

    // 返回取消订阅函数
    return () => this.unsubscribe(channel, callback);
  }

  /**
   * 取消订阅
   */
  private unsubscribe(channel: DataChannel, callback: SubscriptionCallback): void {
    const subs = this.subscriptions.get(channel);
    if (subs) {
      subs.delete(callback);
      // 无订阅者时停止轮询
      if (subs.size === 0) {
        const timer = this.timers.get(channel);
        if (timer) {
          clearInterval(timer);
          this.timers.delete(channel);
        }
        this.subscriptions.delete(channel);
      }
    }
  }

  /**
   * 订阅所有通道
   */
  subscribeAll(callback: SubscriptionCallback): () => void {
    this.globalListeners.add(callback);
    // 推送当前缓存
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
  refresh(channel: DataChannel): RealtimeReading[] {
    const readings = this.collectChannel(channel);
    this.notify(channel, readings);
    return readings;
  }

  /**
   * 手动刷新所有通道
   */
  refreshAll(): RealtimeReading[] {
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    const all: RealtimeReading[] = [];
    channels.forEach(ch => {
      all.push(...this.refresh(ch));
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
    return CHANNEL_CONFIGS[channel];
  }

  /**
   * 获取所有通道配置
   */
  getAllChannelConfigs(): ChannelConfig[] {
    return Object.values(CHANNEL_CONFIGS);
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
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
    this.subscriptions.clear();
    this.globalListeners.clear();
    this.setStatus('disconnected');
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
