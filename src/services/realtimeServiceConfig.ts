/**
 * 实时数据服务 — 数据源配置扩展
 *  通道数据源类型切换 / 配置读写 / 通道启停（自 realtimeServiceCore.ts 二级拆分）
 */

import type { DataSourceType } from './realtimeDataSource';
import { connectionLogger } from './realtimeDataSource';
import {
  DEFAULT_SOURCE_CONFIGS,
  saveSourceConfigs,
} from '../config/realtimeConfig';
import type { ChannelSourceConfig } from '../config/realtimeConfig';
import type { DataChannel } from './realtimeServiceTypes';
import { RealtimeServiceBase } from './realtimeServiceBase';

export abstract class RealtimeServiceConfig extends RealtimeServiceBase {
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
      // 切换到 WS 时确保有 wsConfig
      wsConfig: type === 'ws'
        ? this.sourceConfigs[channel].wsConfig ?? DEFAULT_SOURCE_CONFIGS[channel].wsConfig
        : this.sourceConfigs[channel].wsConfig,
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
