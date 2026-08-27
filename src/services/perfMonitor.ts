/**
 * 性能监控器 — 入口（聚合出口）
 */

import { PerfMonitorService } from './perfMonitorCore';

export { PerfMonitorService } from './perfMonitorCore';
import type { MetricType } from './perfMonitorTypes';
import type { DataChannel } from './realtimeDataService';

export const perfMonitor = new PerfMonitorService();

export function perfTrack(type: MetricType, options?: { label?: string; channel?: DataChannel }) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      const markId = perfMonitor.startMark(type, options?.label, options?.channel);
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.then(
            (val: unknown) => {
              perfMonitor.stopMark(markId, type, { ...options, success: true });
              return val;
            },
            (err: Error) => {
              perfMonitor.stopMark(markId, type, {
                ...options,
                success: false,
                metadata: { error: err.message },
              });
              throw err;
            },
          );
        }
        perfMonitor.stopMark(markId, type, { ...options, success: true });
        return result;
      } catch (err) {
        perfMonitor.stopMark(markId, type, {
          ...options,
          success: false,
          metadata: { error: err instanceof Error ? err.message : String(err) },
        });
        throw err;
      }
    };
    return descriptor;
  };
}

// ============================================================
// React DevTools 兼容
// ============================================================

// 在开发模式下暴露到全局
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__perfMonitor = perfMonitor;
}

export type { MetricType, PerfEntry, PerfStats, ChannelPerfReport, PerfDashboard } from './perfMonitorTypes';
