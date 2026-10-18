/**
 * 拆分自 wsDataSourceBase.ts — WebSocket 连接生命周期（纯函数）
 *  连接建立 / 事件绑定 / 认证消息 / 断线重连判定
 */

import { connectionLogger } from './realtimeLogger';
import type { WsChannelContext } from './wsChannelTypes';
import type { WsConnectionState } from './realtimeTypes';

/** 生命周期回调集合（由类提供状态与心跳管理） */
export interface WsLifecycleCallbacks {
  updateState(ctx: WsChannelContext, state: WsConnectionState): void;
  startHeartbeat(ctx: WsChannelContext): void;
  stopHeartbeat(ctx: WsChannelContext): void;
  handleMessage(ctx: WsChannelContext, data: string): void;
  scheduleReconnect(ctx: WsChannelContext): void;
}

/**
 * 建立 WebSocket 连接并绑定生命周期事件
 * 超出最大重连次数时回调 onError 并进入 error 状态
 */
export function openWsChannel(ctx: WsChannelContext, cb: WsLifecycleCallbacks): void {
  const { channel, wsConfig } = ctx;
  const maxReconnects = wsConfig.maxReconnects ?? 5;

  if (ctx.reconnectCount > maxReconnects) {
    const err = new Error(`WebSocket 超过最大重连次数 ${maxReconnects}`);
    connectionLogger.error(channel, 'ws', err.message);
    ctx.onError(err);
    cb.updateState(ctx, 'error');
    return;
  }

  cb.updateState(ctx, 'connecting');
  connectionLogger.info(channel, 'ws', `连接中... (attempt ${ctx.reconnectCount + 1})`, wsConfig.url);

  try {
    const ws = wsConfig.protocols
      ? new WebSocket(wsConfig.url, wsConfig.protocols)
      : new WebSocket(wsConfig.url);

    ctx.ws = ws;

    ws.onopen = () => {
      connectionLogger.info(channel, 'ws', '连接已建立');
      cb.updateState(ctx, 'open');
      ctx.reconnectCount = 0; // 重置重连计数

      // 发送认证消息
      if (wsConfig.authMessage) {
        ws.send(wsConfig.authMessage);
        connectionLogger.debug(channel, 'ws', '已发送认证消息');
      }

      // 启动心跳
      cb.startHeartbeat(ctx);
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
          cb.handleMessage(ctx, text);
        };
        reader.readAsText(event.data);
        return;
      } else {
        return;
      }

      ctx.bytesReceived += dataStr.length;
      cb.handleMessage(ctx, dataStr);
    };

    ws.onerror = () => {
      ctx.errors++;
      connectionLogger.error(channel, 'ws', 'WebSocket 错误');
      // 不直接调用 onError，等 onclose 触发重连
    };

    ws.onclose = (event: CloseEvent) => {
      connectionLogger.warn(channel, 'ws', `连接关闭 (code=${event.code}, reason=${event.reason || '无'})`);
      cb.stopHeartbeat(ctx);
      ctx.ws = null;

      if (ctx.state === 'error' || ctx.state === 'closed') {
        // 主动关闭或错误终止，不重连
        return;
      }

      cb.updateState(ctx, 'closed');
      cb.scheduleReconnect(ctx);
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    connectionLogger.error(channel, 'ws', '创建 WebSocket 失败', error.message);
    ctx.onError(error);
    cb.updateState(ctx, 'error');
  }
}
