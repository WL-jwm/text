/**
 * F-01 实时数据接入框架 — React Hook
 *
 * 封装 realtimeDataService，提供声明式实时数据访问：
 *   - useRealtimeChannel: 订阅单个通道
 *   - useRealtimeAll: 订阅所有通道
 *   - useConnectionStatus: 监听连接状态
 *   - useAutoRefresh: 自动刷新管理
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  realtimeService,
  type RealtimeReading,
  type DataChannel,
  type ConnectionStatus,
} from '../services/realtimeDataService';

// ============================================================
// useRealtimeChannel — 订阅单个数据通道
// ============================================================

export function useRealtimeChannel(channel: DataChannel): {
  readings: RealtimeReading[];
  lastUpdate: number | undefined;
  isStale: boolean;
  refresh: () => void;
} {
  const [readings, setReadings] = useState<RealtimeReading[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number | undefined>(undefined);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const unsub = realtimeService.subscribe(channel, fresh => {
      setReadings(fresh);
      setLastUpdate(Date.now());
      setIsStale(false);
    });

    const staleTimer = setInterval(() => {
      setIsStale(realtimeService.isStale(channel));
    }, 5000);

    return () => {
      unsub();
      clearInterval(staleTimer);
    };
  }, [channel]);

  const refresh = useCallback(() => {
    realtimeService.refresh(channel).catch(() => {
      // 错误已由 service 内部处理并通知订阅者
    });
  }, [channel]);

  return { readings, lastUpdate, isStale, refresh };
}

// ============================================================
// useRealtimeAll — 订阅所有通道
// ============================================================

export function useRealtimeAll(): {
  allReadings: RealtimeReading[];
  lastUpdates: Record<DataChannel, number | undefined>;
  refreshAll: () => void;
} {
  const [allReadings, setAllReadings] = useState<RealtimeReading[]>([]);
  const [lastUpdates, setLastUpdates] = useState<Record<DataChannel, number | undefined>>(
    realtimeService.getAllLastUpdates(),
  );

  useEffect(() => {
    const unsub = realtimeService.subscribeAll(fresh => {
      setAllReadings(prev => {
        const channelReadings = fresh.reduce((map, r) => {
          if (!map.has(r.channel)) map.set(r.channel, []);
          map.get(r.channel)!.push(r);
          return map;
        }, new Map<DataChannel, RealtimeReading[]>());

        const filtered = prev.filter(r => !channelReadings.has(r.channel));
        return [...filtered, ...fresh];
      });
      setLastUpdates(realtimeService.getAllLastUpdates());
    });

    return unsub;
  }, []);

  const refreshAll = useCallback(() => {
    realtimeService.refreshAll().catch(() => {
      // 错误已由 service 内部处理并通知订阅者
    });
  }, []);

  return { allReadings, lastUpdates, refreshAll };
}

// ============================================================
// useConnectionStatus — 监听连接状态
// ============================================================

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(realtimeService.getStatus());

  useEffect(() => {
    const unsub = realtimeService.onStatusChange(s => setStatus(s));
    return unsub;
  }, []);

  return status;
}

// ============================================================
// useAutoRefresh — 自动刷新管理（带倒计时）
// ============================================================

export function useAutoRefresh(intervalMs: number = 30000): {
  lastRefresh: number;
  nextRefreshIn: number;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
  refresh: () => void;
} {
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [nextRefreshIn, setNextRefreshIn] = useState(Math.floor(intervalMs / 1000));
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (pausedRef.current) return;
      setNextRefreshIn(prev => {
        if (prev <= 1) {
          realtimeService.refreshAll().catch(() => {});
          setLastRefresh(Date.now());
          return Math.floor(intervalMs / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [intervalMs]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => {
    setIsPaused(false);
    setLastRefresh(Date.now());
    setNextRefreshIn(Math.floor(intervalMs / 1000));
  }, [intervalMs]);

  const refresh = useCallback(() => {
    realtimeService.refreshAll().catch(() => {});
    setLastRefresh(Date.now());
    setNextRefreshIn(Math.floor(intervalMs / 1000));
  }, []);

  return { lastRefresh, nextRefreshIn, pause, resume, isPaused, refresh };
}
