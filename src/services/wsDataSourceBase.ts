/**
 * WebSocket 实时数据源 — 抽象基类
 *  连接管理 / 消息解析 / 心跳保活 / 断线重连 / 状态维护（自 wsDataSource.ts 继承拆分）
 */

import { connectionLogger } from './realtimeLogger';
import type { WsSourceConfig, WsConnectionState, DataSourceType } from './realtimeTypes';
import type { DataChannel, RealtimeReading, ChannelConfig } from './realtimeDataService';
import { parseWsReadings } from './wsMessageParser';
import { openWsChannel } from './wsLifecycle';
import type { WsChannelContext } from './wsChannelTypes';

export abstract class WebSocketDataSourceBase {
  readonly type: DataSourceType = 'ws';
  readonly isPush = true;
  protected contexts = new Map<DataChannel, WsChannelContext>();
  protected stateListeners = new Set<(channel: DataChannel, state: WsConnectionState) => void>();

  onStateChange(callback: (channel: DataChannel, state: WsConnectionState) => void): () => void {

    this.stateListeners.add(callback);

    return () => this.stateListeners.delete(callback);

  }

  getState(channel: DataChannel): WsConnectionState {

    return this.contexts.get(channel)?.state ?? 'idle';

  }

  getMetrics(channel: DataChannel): {

    state: WsConnectionState;

    reconnectCount: number;

    messagesReceived: number;

    bytesReceived: number;

    errors: number;

    lastMessageTime: number;

    url: string | null;

  } {

    const ctx = this.contexts.get(channel);

    if (!ctx) {

      return {

        state: 'idle',

        reconnectCount: 0,

        messagesReceived: 0,

        bytesReceived: 0,

        errors: 0,

        lastMessageTime: 0,

        url: null,

      };

    }

    return {

      state: ctx.state,

      reconnectCount: ctx.reconnectCount,

      messagesReceived: ctx.messagesReceived,

      bytesReceived: ctx.bytesReceived,

      errors: ctx.errors,

      lastMessageTime: ctx.lastMessageTime,

      url: ctx.wsConfig.url,

    };

  }

  connect(

    channel: DataChannel,

    config: ChannelConfig,

    onReading: (readings: RealtimeReading[]) => void,

    onError: (error: Error) => void,

  ): () => void {

    const wsConfig = (config as ChannelConfig & { wsConfig?: WsSourceConfig }).wsConfig;



    if (!wsConfig) {

      const err = new Error(`通道 ${channel} 未配置 WebSocket 数据源参数`);

      connectionLogger.error(channel, this.type, err.message);

      onError(err);

      return () => {};

    }



    // 如果已有连接，先关闭

    this.disconnectChannel(channel);



    const ctx: WsChannelContext = {

      channel,

      config,

      wsConfig,

      onReading,

      onError,

      ws: null,

      state: 'idle',

      reconnectCount: 0,

      heartbeatTimer: null,

      reconnectTimer: null,

      lastMessageTime: 0,

      messagesReceived: 0,

      bytesReceived: 0,

      errors: 0,

    };



    this.contexts.set(channel, ctx);

    this.connectWs(ctx);



    return () => {

      this.disconnectChannel(channel);

    };

  }

  private connectWs(ctx: WsChannelContext): void {
    openWsChannel(ctx, {
      updateState: (c, s) => this.updateState(c, s),
      startHeartbeat: c => this.startHeartbeat(c),
      stopHeartbeat: c => this.stopHeartbeat(c),
      handleMessage: (c, d) => this.parseWsMessage(c, d),
      scheduleReconnect: c => this.scheduleReconnect(c),
    });
  }

  private parseWsMessage(ctx: WsChannelContext, data: string): void {
    const { channel } = ctx;
    const readings = parseWsReadings(ctx, data);
    if (readings && readings.length > 0) {
      ctx.onReading(readings);
      connectionLogger.debug(channel, this.type, `收到 ${readings.length} 条读数`);
    }
  }

  private startHeartbeat(ctx: WsChannelContext): void {

    const heartbeatMs = ctx.wsConfig.heartbeatMs ?? 30000;

    this.stopHeartbeat(ctx);



    ctx.heartbeatTimer = setInterval(() => {

      if (ctx.ws?.readyState === WebSocket.OPEN) {

        // 发送 ping 帧（以文本形式，服务端需支持）

        try {

          ctx.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));

        } catch {

          // 发送失败，连接可能已断开

          connectionLogger.warn(ctx.channel, this.type, '心跳发送失败');

        }

      }



      // 检查消息超时

      if (ctx.lastMessageTime > 0) {

        const silentMs = Date.now() - ctx.lastMessageTime;

        const maxSilent = heartbeatMs * 3; // 3 倍心跳间隔无消息视为超时

        if (silentMs > maxSilent) {

          connectionLogger.warn(ctx.channel, this.type, `消息超时 ${silentMs}ms，主动断开重连`);

          ctx.ws?.close(4000, 'Heartbeat timeout');

        }

      }

    }, heartbeatMs);

  }

  private stopHeartbeat(ctx: WsChannelContext): void {

    if (ctx.heartbeatTimer) {

      clearInterval(ctx.heartbeatTimer);

      ctx.heartbeatTimer = null;

    }

  }

  private scheduleReconnect(ctx: WsChannelContext): void {

    const reconnectDelayMs = ctx.wsConfig.reconnectDelayMs ?? 3000;

    ctx.reconnectCount++;



    connectionLogger.info(ctx.channel, this.type, `${reconnectDelayMs}ms 后重连 (${ctx.reconnectCount})`);



    ctx.reconnectTimer = setTimeout(() => {

      this.connectWs(ctx);

    }, reconnectDelayMs);

  }

  private disconnectChannel(channel: DataChannel): void {

    const ctx = this.contexts.get(channel);

    if (!ctx) return;



    this.stopHeartbeat(ctx);



    if (ctx.reconnectTimer) {

      clearTimeout(ctx.reconnectTimer);

      ctx.reconnectTimer = null;

    }



    if (ctx.ws) {

      this.updateState(ctx, 'closing');

      try {

        ctx.ws.onclose = null; // 阻止 onclose 触发重连

        ctx.ws.onerror = null;

        ctx.ws.onmessage = null;

        ctx.ws.onopen = null;

        ctx.ws.close(1000, 'Normal closure');

      } catch {

        // 忽略关闭错误

      }

      ctx.ws = null;

    }



    this.updateState(ctx, 'closed');

    connectionLogger.info(channel, this.type, '已主动断开');

    this.contexts.delete(channel);

  }

  private updateState(ctx: WsChannelContext, state: WsConnectionState): void {

    ctx.state = state;

    this.stateListeners.forEach(cb => cb(ctx.channel, state));

  }
}
