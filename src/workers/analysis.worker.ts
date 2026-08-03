/**
 * G-06 WebWorker — 分析计算工作线程
 *
 * 将计算密集型任务从主线程迁移到 Worker：
 *   1. idw — IDW 空间插值（haversine 距离 + 网格生成）
 *   2. contours — Marching Squares 等值线提取
 *   3. stats — 统计聚合（均值/标准差/中位数/分位数/小时分桶/站点分组）
 *
 * 消息协议：
 *   主线程 → Worker: { taskId, task, payload }
 *   Worker → 主线程: { taskId, task, success, result | error }
 */

import type { InterpolationPoint, InterpolationGrid, IDWOptions } from '../utils/idwInterpolation';

// ============================================================
// 消息协议类型
// ============================================================

export type WorkerTask = 'idw' | 'contours' | 'stats';

export interface WorkerRequest {
  taskId: number;
  task: WorkerTask;
  payload: unknown;
}

export interface WorkerResponse {
  taskId: number;
  task: WorkerTask;
  success: boolean;
  result?: unknown;
  error?: string;
}

// ============================================================
// IDW 插值（从 idwInterpolation.ts 复制，Worker 内独立运行）
// ============================================================

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degToKm(deg: number): number {
  return deg * 111.32;
}

interface IDWPayload {
  points: InterpolationPoint[];
  bounds?: { minLng: number; maxLng: number; minLat: number; maxLat: number };
  options?: IDWOptions;
}

function executeIDW(payload: IDWPayload): InterpolationGrid {
  const { points, bounds, options } = payload;
  const power = options?.power ?? 2;
  const resolution = options?.resolution ?? 0.05;
  const searchRadiusKm = degToKm(options?.searchRadius ?? 1.0);
  const minPts = options?.minPoints ?? 3;
  const maxPts = options?.maxPoints ?? 12;
  const nodata = -9999;

  if (points.length < minPts) {
    return { bounds: { minLng: 0, maxLng: 1, minLat: 0, maxLat: 1 }, resolution, cols: 0, rows: 0, values: [], nodata };
  }

  const lngs = points.map(p => p.x);
  const lats = points.map(p => p.y);
  const padding = 0.3;
  const gridBounds = bounds ?? {
    minLng: Math.min(...lngs) - padding,
    maxLng: Math.max(...lngs) + padding,
    minLat: Math.min(...lats) - padding,
    maxLat: Math.max(...lats) + padding,
  };

  const cols = Math.ceil((gridBounds.maxLng - gridBounds.minLng) / resolution);
  const rows = Math.ceil((gridBounds.maxLat - gridBounds.minLat) / resolution);
  const values: number[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    const lat = gridBounds.maxLat - r * resolution;
    for (let c = 0; c < cols; c++) {
      const lng = gridBounds.minLng + c * resolution;
      const dists = points
        .map(p => ({ p, dist: haversineDistance(lat, lng, p.y, p.x) }))
        .filter(d => d.dist <= searchRadiusKm)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, maxPts);

      if (dists.length < minPts) {
        row.push(nodata);
      } else {
        let sumW = 0, sumWV = 0;
        for (const d of dists) {
          if (d.dist < 0.001) {
            sumWV = d.p.value;
            sumW = 1;
            break;
          }
          const w = 1 / Math.pow(d.dist, power);
          sumW += w;
          sumWV += w * d.p.value;
        }
        row.push(sumW > 0 ? sumWV / sumW : nodata);
      }
    }
    values.push(row);
  }

  return { bounds: gridBounds, resolution, cols, rows, values, nodata };
}

// ============================================================
// Marching Squares 等值线提取
// ============================================================

interface ContourSegment {
  x1: number; y1: number; z1: number;
  x2: number; y2: number; z2: number;
  level: number;
}

interface ContoursPayload {
  grid: InterpolationGrid;
  levels: number[];
}

function executeContours(payload: ContoursPayload): ContourSegment[] {
  const { grid, levels } = payload;
  const { values, cols, rows, nodata } = grid;
  const segments: ContourSegment[] = [];

  for (const level of levels) {
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const v00 = values[r]?.[c] ?? nodata;
        const v10 = values[r]?.[c + 1] ?? nodata;
        const v01 = values[r + 1]?.[c] ?? nodata;
        const v11 = values[r + 1]?.[c + 1] ?? nodata;

        if (v00 === nodata || v10 === nodata || v01 === nodata || v11 === nodata) continue;

        const x0 = c, x1 = c + 1;
        const y0 = r, y1 = r + 1;
        const edgePoints: Array<[number, number, number]> = [];

        // 上边
        if ((v00 - level) * (v10 - level) < 0) {
          const t = (level - v00) / (v10 - v00);
          edgePoints.push([x0 + t * (x1 - x0), y0, level]);
        }
        // 右边
        if ((v10 - level) * (v11 - level) < 0) {
          const t = (level - v10) / (v11 - v10);
          edgePoints.push([x1, y0 + t * (y1 - y0), level]);
        }
        // 下边
        if ((v01 - level) * (v11 - level) < 0) {
          const t = (level - v01) / (v11 - v01);
          edgePoints.push([x0 + t * (x1 - x0), y1, level]);
        }
        // 左边
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
}

// ============================================================
// 统计聚合
// ============================================================

interface StatsPayload {
  values: number[];
  /** 按站点分组（可选） */
  stationGroups?: Array<{ stationId: string; stationName: string; values: number[] }>;
  /** 按时间戳分桶（可选，用于小时热力图） */
  timestamps?: number[];
}

interface StatsResult {
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

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx]!;
}

function executeStats(payload: StatsPayload): StatsResult {
  const { values, stationGroups, timestamps } = payload;

  // 小时分桶
  const hourlyAverages = new Array(24).fill(0);
  if (timestamps && timestamps.length === values.length) {
    const hourlyBuckets: number[][] = Array.from({ length: 24 }, () => []);
    for (let i = 0; i < values.length; i++) {
      const hour = new Date(timestamps[i]!).getHours();
      hourlyBuckets[hour]!.push(values[i]!);
    }
    for (let h = 0; h < 24; h++) {
      hourlyAverages[h] = hourlyBuckets[h]!.length > 0 ? mean(hourlyBuckets[h]!) : 0;
    }
  }

  // 站点分组
  const byStation = (stationGroups ?? []).map(group => ({
    stationId: group.stationId,
    stationName: group.stationName,
    count: group.values.length,
    mean: mean(group.values),
    min: Math.min(...group.values),
    max: Math.max(...group.values),
  }));

  return {
    count: values.length,
    mean: mean(values),
    min: values.length > 0 ? Math.min(...values) : 0,
    max: values.length > 0 ? Math.max(...values) : 0,
    std: std(values),
    median: median(values),
    p25: percentile(values, 0.25),
    p75: percentile(values, 0.75),
    byStation,
    hourlyAverages,
  };
}

// ============================================================
// Worker 消息处理
// ============================================================

const ctx = self as unknown as { onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null; postMessage: (msg: WorkerResponse) => void; };

ctx.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { taskId, task, payload } = e.data;
  const startTime = performance.now();

  try {
    let result: unknown;

    switch (task) {
      case 'idw':
        result = executeIDW(payload as IDWPayload);
        break;
      case 'contours':
        result = executeContours(payload as ContoursPayload);
        break;
      case 'stats':
        result = executeStats(payload as StatsPayload);
        break;
      default:
        throw new Error(`Unknown task: ${task}`);
    }

    const elapsed = performance.now() - startTime;
    const response: WorkerResponse = { taskId, task, success: true, result };
    ctx.postMessage(response);

    // 性能日志（debug 级别）
    console.debug(`[Worker] ${task} completed in ${elapsed.toFixed(1)}ms`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const response: WorkerResponse = { taskId, task, success: false, error };
    ctx.postMessage(response);
  }
};

// 通知主线程 Worker 已就绪
ctx.postMessage({ taskId: 0, task: 'ready' as WorkerTask, success: true, result: 'ready' } as WorkerResponse);
