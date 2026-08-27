/**
 * G-06 WebWorker — useWorkerStats（统计聚合）
 *
 * 拆分自 useWorker.ts：Worker 化统计聚合，自动回退主线程。
 */

import { useCallback, useState } from 'react';
import { postTask } from './workerCore';
import type { WorkerStatsResult } from './workerTypes';

export function useWorkerStats(): {
  computeStats: (
    values: number[],
    stationGroups?: Array<{ stationId: string; stationName: string; values: number[] }>,
    timestamps?: number[],
  ) => Promise<WorkerStatsResult>;
  usingWorker: boolean;
} {
  const [usingWorker, setUsingWorker] = useState(false);

  const computeStats = useCallback(async (
    values: number[],
    stationGroups?: Array<{ stationId: string; stationName: string; values: number[] }>,
    timestamps?: number[],
  ): Promise<WorkerStatsResult> => {
    // 尝试 Worker
    const workerPromise = postTask<WorkerStatsResult>('stats', { values, stationGroups, timestamps });
    if (workerPromise) {
      setUsingWorker(true);
      try {
        return await workerPromise;
      } catch (err) {
        console.warn('[useWorkerStats] Worker failed, falling back:', err);
      }
    }

    // 回退：主线程执行
    setUsingWorker(false);
    const m = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    const variance = values.length > 1
      ? values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1)
      : 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const med = sorted.length === 0 ? 0
      : sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;

    const hourlyAverages = new Array(24).fill(0);
    if (timestamps && timestamps.length === values.length) {
      const buckets: number[][] = Array.from({ length: 24 }, () => []);
      for (let i = 0; i < values.length; i++) {
        const h = new Date(timestamps[i]!).getHours();
        buckets[h]!.push(values[i]!);
      }
      for (let h = 0; h < 24; h++) {
        hourlyAverages[h] = buckets[h]!.length > 0
          ? buckets[h]!.reduce((s, v) => s + v, 0) / buckets[h]!.length
          : 0;
      }
    }

    return {
      count: values.length,
      mean: m,
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
      std: Math.sqrt(variance),
      median: med,
      p25: sorted.length > 0 ? sorted[Math.floor(0.25 * (sorted.length - 1))]! : 0,
      p75: sorted.length > 0 ? sorted[Math.floor(0.75 * (sorted.length - 1))]! : 0,
      byStation: (stationGroups ?? []).map(g => ({
        stationId: g.stationId,
        stationName: g.stationName,
        count: g.values.length,
        mean: g.values.length > 0 ? g.values.reduce((s, v) => s + v, 0) / g.values.length : 0,
        min: g.values.length > 0 ? Math.min(...g.values) : 0,
        max: g.values.length > 0 ? Math.max(...g.values) : 0,
      })),
      hourlyAverages,
    };
  }, []);

  return { computeStats, usingWorker };
}
