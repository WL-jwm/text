/**
 * G-02 IDB 缓存与离线分析 — React Hooks
 *
 * 封装 realtimeCache 服务，提供声明式缓存访问：
 *   - useRealtimeCache: 缓存初始化 + 计数 + 大小
 *   - useCachedReadings: 获取通道缓存数据
 *   - useOfflineAnalysis: 离线分析结果
 *   - useCacheManager: 缓存管理（清理/导出）
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeCache } from '../services/realtimeCache';
import type { CachedReading, OfflineAnalysisResult, ChannelStats } from '../services/realtimeCache';
import type { DataChannel, RealtimeReading } from '../services/realtimeDataService';

// ============================================================
// useRealtimeCache — 缓存初始化 + 计数 + 大小
// ============================================================

export function useRealtimeCache(): {
  ready: boolean;
  counts: Record<DataChannel, number>;
  cacheSize: number;
  refresh: () => void;
} {
  const [ready, setReady] = useState(false);
  const [counts, setCounts] = useState<Record<DataChannel, number>>({
    waterLevel: 0, waterQuality: 0, subsidence: 0, extraction: 0,
  });
  const [cacheSize, setCacheSize] = useState(0);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    const [newCounts, newSize] = await Promise.all([
      realtimeCache.getCacheCounts(),
      realtimeCache.getCacheSize(),
    ]);
    if (mountedRef.current) {
      setCounts(newCounts);
      setCacheSize(newSize);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      await realtimeCache.init();
      if (mountedRef.current) {
        setReady(true);
        await refresh();
      }
    })();

    // 定期刷新计数（每 30s）
    const timer = setInterval(refresh, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [refresh]);

  return { ready, counts, cacheSize, refresh };
}

// ============================================================
// useCachedReadings — 获取通道缓存数据
// ============================================================

export function useCachedReadings(
  channel: DataChannel,
  limit: number = 200,
): {
  readings: CachedReading[];
  loading: boolean;
  refresh: () => void;
} {
  const [readings, setReadings] = useState<CachedReading[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await realtimeCache.getRecentReadings(channel, limit);
    if (mountedRef.current) {
      setReadings(data);
      setLoading(false);
    }
  }, [channel, limit]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

    return () => { mountedRef.current = false; };
  }, [refresh]);

  return { readings, loading, refresh };
}

// ============================================================
// useOfflineAnalysis — 离线分析
// ============================================================

export function useOfflineAnalysis(
  channel: DataChannel,
  timeRange?: { start: number; end: number },
): {
  result: OfflineAnalysisResult | null;
  loading: boolean;
  refresh: () => void;
} {
  const [result, setResult] = useState<OfflineAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const analysis = await realtimeCache.analyzeChannel(channel, timeRange);
    if (mountedRef.current) {
      setResult(analysis);
      setLoading(false);
    }
  }, [channel, timeRange?.start, timeRange?.end]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => { mountedRef.current = false; };
  }, [refresh]);

  return { result, loading, refresh };
}

// ============================================================
// useCacheManager — 缓存管理
// ============================================================

export function useCacheManager(): {
  clearChannel: (channel: DataChannel) => Promise<number>;
  clearAll: () => Promise<void>;
  cleanup: () => Promise<{ readingsDeleted: number; expiredBefore: number }>;
  exportChannel: (channel: DataChannel, format: 'json' | 'csv') => Promise<string>;
} {
  const clearChannel = useCallback(async (channel: DataChannel) => {
    return realtimeCache.clearChannel(channel);
  }, []);

  const clearAll = useCallback(async () => {
    await realtimeCache.clearAll();
  }, []);

  const cleanup = useCallback(async () => {
    return realtimeCache.cleanup();
  }, []);

  const exportChannel = useCallback(async (channel: DataChannel, format: 'json' | 'csv') => {
    return realtimeCache.exportChannelData(channel, format);
  }, []);

  return { clearChannel, clearAll, cleanup, exportChannel };
}

// ============================================================
// useAutoCache — 自动缓存实时数据
// ============================================================

export function useAutoCache(
  readings: RealtimeReading[],
  enabled: boolean = true,
): { cachedCount: number } {
  const [cachedCount, setCachedCount] = useState(0);
  const lastCacheRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || readings.length === 0) return;

    // 防抖：500ms 内只缓存一次
    const now = Date.now();
    if (now - lastCacheRef.current < 500) return;
    lastCacheRef.current = now;

    realtimeCache.putReadings(readings).then(count => {
      setCachedCount(prev => prev + count);
    }).catch(() => {});
  }, [readings, enabled]);

  return { cachedCount };
}

// ============================================================
// useChannelStats — 获取预聚合统计
// ============================================================

export function useChannelStats(
  channel: DataChannel,
  days: number = 7,
): {
  stats: ChannelStats[];
  loading: boolean;
} {
  const [stats, setStats] = useState<ChannelStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const data = await realtimeCache.getStats(channel, days);
      if (mounted) {
        setStats(data);
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [channel, days]);

  return { stats, loading };
}
