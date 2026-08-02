/**
 * F-01 实时数据接入框架 — 状态指示器组件
 *
 * 提供实时数据连接状态可视化：
 *   - RealtimeStatusBadge: 连接状态徽章（脉冲动画）
 *   - LastUpdateStamp: 最后更新时间戳
 *   - ChannelStatusGrid: 多通道状态网格
 *   - AutoRefreshControl: 自动刷新控制器（倒计时 + 暂停/恢复）
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, AlertCircle, RefreshCw, Pause, Play, Clock } from 'lucide-react';
import { TechCard } from '../UI';
import {
  realtimeService,
  formatTimeAgo,
  formatTimestamp,
  type DataChannel,
  type ConnectionStatus,
} from '../../services/realtimeDataService';
import { useConnectionStatus, useAutoRefresh } from '../../hooks/useRealtimeData';

// ── 连接状态徽章 ──

const STATUS_CONFIG: Record<ConnectionStatus, { icon: typeof Wifi; color: string; label: string; pulse: boolean }> = {
  connected: { icon: Wifi, color: '#10b981', label: '已连接', pulse: true },
  connecting: { icon: Loader2, color: '#f59e0b', label: '连接中', pulse: false },
  disconnected: { icon: WifiOff, color: '#6b7280', label: '未连接', pulse: false },
  error: { icon: AlertCircle, color: '#ef4444', label: '连接异常', pulse: false },
};

export function RealtimeStatusBadge() {
  const status = useConnectionStatus();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gw-card/80 border border-gw-border/40">
      <span className="relative inline-flex">
        <Icon size={12} style={{ color: config.color }} className={status === 'connecting' ? 'animate-spin' : ''} />
        {config.pulse && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ color: config.color, opacity: 0.4 }}
          />
        )}
      </span>
      <span className="text-[10px] font-medium" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  );
}

// ── 最后更新时间戳 ──

export function LastUpdateStamp({ channel }: { channel: DataChannel }) {
  const [lastUpdate, setLastUpdate] = useState<number | undefined>(realtimeService.getLastUpdate(channel));

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(realtimeService.getLastUpdate(channel));
    }, 1000);
    return () => clearInterval(timer);
  }, [channel]);

  return (
    <div className="inline-flex items-center gap-1 text-[10px] text-gw-muted">
      <Clock size={10} />
      <span>{formatTimeAgo(lastUpdate)}</span>
      {lastUpdate && (
        <span className="text-gw-muted/60">({formatTimestamp(lastUpdate)})</span>
      )}
    </div>
  );
}

// ── 多通道状态网格 ──

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

export function ChannelStatusGrid() {
  const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => forceUpdate(n => n + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <TechCard title="数据通道状态" icon={Wifi}>
      <div className="grid grid-cols-2 gap-2">
        {channels.map(ch => {
          const last = realtimeService.getLastUpdate(ch);
          const isStale = realtimeService.isStale(ch);
          const cached = realtimeService.getCachedReadings(ch);
          const count = cached?.length ?? 0;

          return (
            <div
              key={ch}
              className={`p-2.5 rounded-lg border transition-colors ${
                isStale
                  ? 'bg-gw-surface/30 border-gw-border/20'
                  : 'bg-gw-surface/50 border-gw-cyan/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-gw-text">{CHANNEL_LABELS[ch]}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isStale ? 'bg-gw-muted/40' : 'bg-green-500 animate-pulse'
                  }`}
                />
              </div>
              <div className="text-[10px] text-gw-muted">
                {count > 0 ? `${count}个监测点` : '等待数据...'}
              </div>
              <div className="text-[10px] text-gw-muted/60 mt-0.5">
                {formatTimeAgo(last)}
              </div>
            </div>
          );
        })}
      </div>
    </TechCard>
  );
}

// ── 自动刷新控制器 ──

export function AutoRefreshControl({ intervalMs = 30000 }: { intervalMs?: number }) {
  const { nextRefreshIn, isPaused, pause, resume, refresh } = useAutoRefresh(intervalMs);
  const progress = isPaused ? 0 : ((intervalMs / 1000 - nextRefreshIn) / (intervalMs / 1000)) * 100;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPaused ? resume : pause}
        className="w-7 h-7 rounded-lg bg-gw-surface/60 border border-gw-border/40 flex items-center justify-center text-gw-muted hover:text-gw-cyan transition-colors"
        title={isPaused ? '恢复自动刷新' : '暂停自动刷新'}
      >
        {isPaused ? <Play size={12} /> : <Pause size={12} />}
      </button>
      <button
        onClick={refresh}
        className="w-7 h-7 rounded-lg bg-gw-surface/60 border border-gw-border/40 flex items-center justify-center text-gw-muted hover:text-gw-cyan transition-colors"
        title="立即刷新"
      >
        <RefreshCw size={12} className={isPaused ? '' : 'animate-spin'} style={{ animationDuration: '3s' }} />
      </button>
      <div className="flex-1 max-w-[120px]">
        <div className="h-1 rounded-full bg-gw-border/30 overflow-hidden">
          <div
            className="h-full bg-gw-cyan/60 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[9px] text-gw-muted mt-0.5 text-center">
          {isPaused ? '已暂停' : `${nextRefreshIn}s 后刷新`}
        </div>
      </div>
    </div>
  );
}
