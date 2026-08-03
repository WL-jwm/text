/**
 * G-06 WebWorker — React Hooks 封装
 *
 * 提供 3 个专用 Hook：
 *   - useWorkerInterpolation: IDW 插值（Worker 化）
 *   - useWorkerContours: 等值线提取（Worker 化）
 *   - useWorkerStats: 统计聚合（Worker 化）
 *
 * 设计原则：
 *   - Worker 不可用时自动回退到主线程执行（Safari < 15 / Electron 旧版）
 *   - Promise 化 API，配合 async/await
 *   - 任务取消（组件卸载时自动取消未完成任务）
 *   - 计算耗时度量
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type {
  WorkerRequest,
  WorkerResponse,
  WorkerTask,
} from '../workers/analysis.worker';
import type {
  InterpolationPoint,
  InterpolationGrid,
  IDWOptions,
} from '../utils/idwInterpolation';
import { idwInterpolate } from '../utils/idwInterpolation';

// ============================================================
// Worker 管理
// ============================================================

/** Worker 单例（懒加载） */
let workerInstance: Worker | null = null;
let workerReady = false;

/** 任务计数器 */
let taskCounter = 1;

/** 待处理任务的 Promise resolve/reject */
const pendingTasks = new Map<number, {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  startTime: number;
}>();

/**
 * 获取 Worker 实例（如果支持）
 */
function getWorker(): Worker | null {
  if (workerInstance !== null) return workerInstance;

  try {
    // Vite 支持 new URL + import.meta.url 语法打包 Worker
    workerInstance = new Worker(
      new URL('../workers/analysis.worker.ts', import.meta.url),
      { type: 'module' },
    );

    workerInstance.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { taskId, success, result, error } = e.data;

      // ready 消息
      if (taskId === 0) {
        workerReady = true;
        console.debug('[WorkerClient] Worker ready');
        return;
      }

      const pending = pendingTasks.get(taskId);
      if (!pending) return;

      pendingTasks.delete(taskId);

      if (success) {
        pending.resolve(result);
      } else {
        pending.reject(new Error(error ?? 'Unknown worker error'));
      }
    };

    workerInstance.onerror = (err) => {
      console.error('[WorkerClient] Worker error:', err);
      // 通知所有待处理任务失败
      pendingTasks.forEach((pending, taskId) => {
        pending.reject(new Error('Worker crashed'));
        pendingTasks.delete(taskId);
      });
    };

    return workerInstance;
  } catch (err) {
    console.warn('[WorkerClient] Worker creation failed, falling back to main thread:', err);
    return null;
  }
}

/**
 * 检查 Worker 是否可用
 */
export function isWorkerAvailable(): boolean {
  return getWorker() !== null;
}

// ============================================================
// 通用 Worker 调用
// ============================================================

/**
 * 向 Worker 发送任务（Promise 化）
 * 如果 Worker 不可用，返回 null（由调用方决定回退策略）
 */
function postTask<T>(task: WorkerTask, payload: unknown): Promise<T> | null {
  const worker = getWorker();
  if (!worker) return null;

  const taskId = taskCounter++;
  const promise = new Promise<T>((resolve, reject) => {
    pendingTasks.set(taskId, {
      resolve: resolve as (result: unknown) => void,
      reject,
      startTime: performance.now(),
    });
  });

  const request: WorkerRequest = { taskId, task, payload };
  worker.postMessage(request);

  return promise;
}

// ============================================================
// useWorkerInterpolation — IDW 插值
// ============================================================

export function useWorkerInterpolation(): {
  interpolate: (
    points: InterpolationPoint[],
    bounds?: { minLng: number; maxLng: number; minLat: number; maxLat: number },
    options?: IDWOptions,
  ) => Promise<InterpolationGrid>;
  usingWorker: boolean;
  lastElapsed: number;
} {
  const [usingWorker, setUsingWorker] = useState(false);
  const [lastElapsed, setLastElapsed] = useState(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => { cancelledRef.current = true; };
  }, []);

  const interpolate = useCallback(async (
    points: InterpolationPoint[],
    bounds?: { minLng: number; maxLng: number; minLat: number; maxLat: number },
    options?: IDWOptions,
  ): Promise<InterpolationGrid> => {
    const startTime = performance.now();

    // 尝试 Worker
    const workerPromise = postTask<InterpolationGrid>('idw', { points, bounds, options });
    if (workerPromise) {
      setUsingWorker(true);
      try {
        const result = await workerPromise;
        if (!cancelledRef.current) {
          setLastElapsed(performance.now() - startTime);
        }
        return result;
      } catch (err) {
        console.warn('[useWorkerInterpolation] Worker failed, falling back:', err);
      }
    }

    // 回退到主线程
    setUsingWorker(false);
    const result = idwInterpolate(points, bounds, options);
    if (!cancelledRef.current) {
      setLastElapsed(performance.now() - startTime);
    }
    return result;
  }, []);

  return { interpolate, usingWorker, lastElapsed };
}

// ============================================================
// useWorkerContours — 等值线提取
// ============================================================

export interface ContourSegment {
  x1: number; y1: number; z1: number;
  x2: number; y2: number; z2: number;
  level: number;
}

export function useWorkerContours(): {
  extractContours: (
    grid: InterpolationGrid,
    levels: number[],
  ) => Promise<ContourSegment[]>;
  usingWorker: boolean;
} {
  const [usingWorker, setUsingWorker] = useState(false);

  const extractContours = useCallback(async (
    grid: InterpolationGrid,
    levels: number[],
  ): Promise<ContourSegment[]> => {
    // 尝试 Worker
    const workerPromise = postTask<ContourSegment[]>('contours', { grid, levels });
    if (workerPromise) {
      setUsingWorker(true);
      try {
        return await workerPromise;
      } catch (err) {
        console.warn('[useWorkerContours] Worker failed, falling back:', err);
      }
    }

    // 回退：在主线程执行（内联 Marching Squares）
    setUsingWorker(false);
    const segments: ContourSegment[] = [];
    const { values, cols, rows, nodata } = grid;

    for (const level of levels) {
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const v00 = values[r]?.[c] ?? nodata;
          const v10 = values[r]?.[c + 1] ?? nodata;
          const v01 = values[r + 1]?.[c] ?? nodata;
          const v11 = values[r + 1]?.[c + 1] ?? nodata;
          if (v00 === nodata || v10 === nodata || v01 === nodata || v11 === nodata) continue;

          const x0 = c, x1 = c + 1, y0 = r, y1 = r + 1;
          const edgePoints: Array<[number, number, number]> = [];

          if ((v00 - level) * (v10 - level) < 0) {
            const t = (level - v00) / (v10 - v00);
            edgePoints.push([x0 + t * (x1 - x0), y0, level]);
          }
          if ((v10 - level) * (v11 - level) < 0) {
            const t = (level - v10) / (v11 - v10);
            edgePoints.push([x1, y0 + t * (y1 - y0), level]);
          }
          if ((v01 - level) * (v11 - level) < 0) {
            const t = (level - v01) / (v11 - v01);
            edgePoints.push([x0 + t * (x1 - x0), y1, level]);
          }
          if ((v00 - level) * (v01 - level) < 0) {
            const t = (level - v00) / (v01 - v00);
            edgePoints.push([x0, y0 + t * (y1 - y0), level]);
          }

          if (edgePoints.length >= 2) {
            segments.push({
              x1: edgePoints[0]![0], y1: edgePoints[0]![1], z1: edgePoints[0]![2],
              x2: edgePoints[1]![0], y2: edgePoints[1]![1], z2: edgePoints[1]![2],
              level,
            });
          }
        }
      }
    }

    return segments;
  }, []);

  return { extractContours, usingWorker };
}

// ============================================================
// useWorkerStats — 统计聚合
// ============================================================

export interface WorkerStatsResult {
  count: number;
  mean: number;
  min: number;
  max: number;
  std: number;
  median: number;
  p25: number;
  p75: number;
  byStation: Array<{
    stationId: string;
    stationName: string;
    count: number;
    mean: number;
    min: number;
    max: number;
  }>;
  hourlyAverages: number[];
}

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

// ============================================================
// useWorkerStatus — Worker 状态监控
// ============================================================

export function useWorkerStatus(): {
  available: boolean;
  ready: boolean;
} {
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAvailable(getWorker() !== null);

    // 检查 ready 状态（通过轮询，因为 ready 消息是异步的）
    const timer = setInterval(() => {
      if (workerReady) {
        setReady(true);
        clearInterval(timer);
      }
    }, 100);

    // 3 秒后超时
    const timeout = setTimeout(() => {
      clearInterval(timer);
      setReady(true); // 即使没有 ready 消息，也允许执行（回退模式）
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  return { available, ready };
}
