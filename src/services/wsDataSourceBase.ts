/**
 * WebSocket 实时数据源 — 抽象基类
 *  连接管理 / 消息解析 / 心跳保活 / 断线重连 / 状态维护（自 wsDataSource.ts 继承拆分）
 */

import { toNumber, toStr, toQuality, getPath } from './realtimeUtils';
import { connectionLogger } from './realtimeLogger';
import type { WsSourceConfig, WsConnectionState, DataSourceType } from './realtimeTypes';
import type { DataChannel, RealtimeReading, ChannelConfig } from './realtimeDataService';
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

    const { channel, wsConfig } = ctx;

    const maxReconnects = wsConfig.maxReconnects ?? 5;



    if (ctx.reconnectCount > maxReconnects) {

      const err = new Error(`WebSocket 超过最大重连次数 ${maxReconnects}`);

      connectionLogger.error(channel, this.type, err.message);

      ctx.onError(err);

      this.updateState(ctx, 'error');

      return;

    }



    this.updateState(ctx, 'connecting');

    connectionLogger.info(channel, this.type, `连接中... (attempt ${ctx.reconnectCount + 1})`, wsConfig.url);



    try {

      const ws = wsConfig.protocols

        ? new WebSocket(wsConfig.url, wsConfig.protocols)

        : new WebSocket(wsConfig.url);



      ctx.ws = ws;



      ws.onopen = () => {

        connectionLogger.info(channel, this.type, '连接已建立');

        this.updateState(ctx, 'open');

        ctx.reconnectCount = 0; // 重置重连计数



        // 发送认证消息

        if (wsConfig.authMessage) {

          ws.send(wsConfig.authMessage);

          connectionLogger.debug(channel, this.type, '已发送认证消息');

        }



        // 启动心跳

        this.startHeartbeat(ctx);

      };



      ws.onmessage = (event: MessageEvent) => {

        ctx.messagesReceived++;

        ctx.lastMessageTime = Date.now();



        let dataStr: string;

        if (typeof event.data === 'string') {

          dataStr = event.data;

        } else if (event.data instanceof ArrayBuffer) {

          dataStr = new TextDecoder().decode(event.data);

        } else if (event.data instanceof Blob) {

          // Blob 需要异步读取，用 FileReader 替代

          const reader = new FileReader();

          reader.onload = () => {

            const text = reader.result as string;

            ctx.bytesReceived += text.length;

            this.parseWsMessage(ctx, text);

          };

          reader.readAsText(event.data);

          return;

        } else {

          return;

        }



        ctx.bytesReceived += dataStr.length;

        this.parseWsMessage(ctx, dataStr);

      };



      ws.onerror = () => {

        ctx.errors++;

        connectionLogger.error(channel, this.type, 'WebSocket 错误');

        // 不直接调用 onError，等 onclose 触发重连

      };



      ws.onclose = (event: CloseEvent) => {

        connectionLogger.warn(channel, this.type, `连接关闭 (code=${event.code}, reason=${event.reason || '无'})`);

        this.stopHeartbeat(ctx);

        ctx.ws = null;



        if (ctx.state === 'error' || ctx.state === 'closed') {

          // 主动关闭或错误终止，不重连

          return;

        }



        this.updateState(ctx, 'closed');

        this.scheduleReconnect(ctx);

      };

    } catch (err) {

      const error = err instanceof Error ? err : new Error(String(err));

      connectionLogger.error(channel, this.type, '创建 WebSocket 失败', error.message);

      ctx.onError(error);

      this.updateState(ctx, 'error');

    }

  }

  private parseWsMessage(ctx: WsChannelContext, data: string): void {

    const { channel, config, wsConfig } = ctx;



    try {

      const json = JSON.parse(data);

      const mapping = wsConfig.responseMapping;



      let dataArr: unknown[];



      if (mapping.dataPath) {

        const wrapped = getPath(json, mapping.dataPath);

        if (!Array.isArray(wrapped)) {

          // 可能是单条消息

          if (wrapped !== null && wrapped !== undefined) {

            dataArr = [wrapped];

          } else {

            return;

          }

        } else {

          dataArr = wrapped;

        }

      } else if (mapping.isArray) {

        if (Array.isArray(json)) {

          dataArr = json;

        } else {

          dataArr = [json];

        }

      } else {

        dataArr = [json];

      }



      const readings: RealtimeReading[] = dataArr.map(item => {

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



      if (readings.length > 0) {

        ctx.onReading(readings);

        connectionLogger.debug(channel, this.type, `收到 ${readings.length} 条读数`);

      }

    } catch (err) {

      const error = err instanceof Error ? err : new Error(String(err));

      connectionLogger.warn(channel, this.type, '消息解析失败', error.message);

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
