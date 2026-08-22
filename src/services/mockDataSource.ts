/**
 * 实时数据源 — Mock 模拟数据源（自 realtimeDataSource 拆分）
 */
import { gaussian } from './realtimeUtils';
import { connectionLogger } from './realtimeLogger';
import type { RealtimeDataSource } from './realtimeTypes';
import type { DataChannel } from './realtimeDataService';
import type { ChannelConfig, RealtimeReading } from './realtimeDataService';
import type { DataSourceType } from './realtimeTypes';

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

