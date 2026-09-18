/**
 * WebSocket 实时数据源 — 诊断/测试扩展
 *  主动拉取(不支持) / 连接测试 / 诊断信息（继承 WebSocketDataSourceBase）
 */

import type { WsSourceConfig, WsConnectionState } from './realtimeTypes';
import type { DataChannel, RealtimeReading, ChannelConfig } from './realtimeDataService';

import { WebSocketDataSourceBase } from './wsDataSourceBase';

export abstract class WebSocketDataSourceConfig extends WebSocketDataSourceBase {
  async fetch(channel: DataChannel, _config: ChannelConfig): Promise<RealtimeReading[]> {

    throw new Error(`WebSocket 通道 ${channel} 不支持主动拉取，请通过 connect() 订阅推送数据`);

  }

  async testConnection(channel: DataChannel, config: ChannelConfig): Promise<boolean> {

    const wsConfig = (config as ChannelConfig & { wsConfig?: WsSourceConfig }).wsConfig;

    if (!wsConfig) return false;



    return new Promise<boolean>(resolve => {

      let settled = false;

      const testWs = wsConfig.protocols

        ? new WebSocket(wsConfig.url, wsConfig.protocols)

        : new WebSocket(wsConfig.url);



      const timeout = setTimeout(() => {

        if (!settled) {

          settled = true;

          testWs.close();

          resolve(false);

        }

      }, 5000);



      testWs.onopen = () => {

        if (!settled) {

          settled = true;

          clearTimeout(timeout);

          testWs.close();

          resolve(true);

        }

      };



      testWs.onerror = () => {

        if (!settled) {

          settled = true;

          clearTimeout(timeout);

          resolve(false);

        }

      };

    });

  }

  getDiagnostics(): Array<{

    channel: DataChannel;

    state: WsConnectionState;

    url: string;

    reconnectCount: number;

    messagesReceived: number;

    bytesReceived: number;

    errors: number;

    lastMessageTime: number;

    lastMessageAgo: string;

  }> {

    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

    return channels.map(ch => {

      const m = this.getMetrics(ch);

      return {

        channel: ch,

        state: m.state,

        url: m.url ?? '-',

        reconnectCount: m.reconnectCount,

        messagesReceived: m.messagesReceived,

        bytesReceived: m.bytesReceived,

        errors: m.errors,

        lastMessageTime: m.lastMessageTime,

        lastMessageAgo: m.lastMessageTime > 0

          ? `${Math.floor((Date.now() - m.lastMessageTime) / 1000)}s`

          : '-',

      };

    });

  }
}
