/**
 * G-07 性能监控 — React Hooks
 *
 * 提供性能监控的 React 封装：
 *   1. usePerfMonitor — 访问性能监控服务
 *   2. usePerfDashboard — 获取性能仪表盘数据
 *   3. useChannelPerf — 获取单通道性能报告
 *   4. useRenderTimer — 组件渲染计时
 *   5. usePerfSubscriber — 订阅实时性能事件
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { perfMonitor } from '../services/perfMonitor';
import type { PerfEntry, PerfStats, PerfDashboard, ChannelPerfReport, MetricType } from '../services/perfMonitor';
import type { DataChannel } from '../services/realtimeDataService';

// ============================================================
// usePerfMonitor — 访问性能监控服务
// ============================================================

export function usePerfMonitor() {
  const timeAsync = useCallback(
    <T>(type: MetricType, fn: () => Promise<T>, options?: { label?: string; channel?: DataChannel }) => {
      return perfMonitor.timeAsync(type, fn, options);
    },
    [],
  );

  const timeSync = useCallback(
    <T>(type: MetricType, fn: () => T, options?: { label?: string; channel?: DataChannel }) => {
      return perfMonitor.timeSync(type, fn, options);
    },
    [],
  );

  const clear = useCallback((sinceMs?: number) => {
    perfMonitor.clear(sinceMs);
  }, []);

  return { perfMonitor, timeAsync, timeSync, clear };
}

// ============================================================
// usePerfDashboard — 获取性能仪表盘数据
// ============================================================

export function usePerfDashboard(refreshIntervalMs = 5000, sinceMs = 300000) {
  const [dashboard, setDashboard] = useState<PerfDashboard | null>(null);
  const [liveEntries, setLiveEntries] = useState<PerfEntry[]>([]);

  // 定期刷新仪表盘
  useEffect(() => {
    const update = () => {
      setDashboard(perfMonitor.getDashboard(sinceMs));
    };

    update();
    const timer = setInterval(update, refreshIntervalMs);
    return () => clearInterval(timer);
  }, [refreshIntervalMs, sinceMs]);

  // 订阅实时事件
  useEffect(() => {
    const unsub = perfMonitor.subscribe(entry => {
      setLiveEntries(prev => {
        const next = [entry, ...prev];
        if (next.length > 50) next.length = 50;
        return next;
      });
    });
    return unsub;
  }, []);

  return { dashboard, liveEntries };
}

// ============================================================
// useChannelPerf — 获取单通道性能报告
// ============================================================

export function useChannelPerf(channel: DataChannel, refreshIntervalMs = 5000) {
  const [report, setReport] = useState<ChannelPerfReport | null>(null);

  useEffect(() => {
    const update = () => {
      setReport(perfMonitor.getChannelReport(channel));
    };

    update();
    const timer = setInterval(update, refreshIntervalMs);
    return () => clearInterval(timer);
  }, [channel, refreshIntervalMs]);

  return report;
}

// ============================================================
// useRenderTimer — 组件渲染计时
// ============================================================

export function useRenderTimer(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());

  renderCount.current++;

  useEffect(() => {
    mountTime.current = performance.now();
    return () => {
      // 卸载时记录总生命周期
      const lifetime = performance.now() - mountTime.current;
      perfMonitor.record({
        type: 'renderCycle',
        durationMs: Math.round(lifetime * 100) / 100,
        label: `${componentName}:lifetime`,
        success: true,
      });
    };
  }, [componentName]);

  // 记录每次渲染（跳过首次）
  useEffect(() => {
    if (renderCount.current > 1) {
      // 使用 requestAnimationFrame 确保在浏览器绘制后记录
      const raf = requestAnimationFrame(() => {
        perfMonitor.record({
          type: 'renderCycle',
          durationMs: 0, // 由外部计时
          label: `${componentName}:render`,
          success: true,
          metadata: { count: renderCount.current },
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  });

  return { renderCount: renderCount.current };
}

// ============================================================
// usePerfSubscriber — 订阅实时性能事件
// ============================================================

export function usePerfSubscriber(
  filter?: { type?: MetricType; channel?: DataChannel },
  maxEntries = 50,
) {
  const [entries, setEntries] = useState<PerfEntry[]>([]);

  useEffect(() => {
    const unsub = perfMonitor.subscribe(entry => {
      // 应用过滤器
      if (filter?.type && entry.type !== filter.type) return;
      if (filter?.channel && entry.channel !== filter.channel) return;

      setEntries(prev => {
        const next = [entry, ...prev];
        if (next.length > maxEntries) next.length = maxEntries;
        return next;
      });
    });
    return unsub;
  }, [filter?.type, filter?.channel, maxEntries]);

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, clear };
}

// ============================================================
// 类型导出
// ============================================================

export type { PerfEntry, PerfStats, PerfDashboard, ChannelPerfReport, MetricType };