/**
 * G-06 WebWorker — 类型定义
 *
 * 拆分自 useWorker.ts：等值线段 / 统计聚合结果
 */

// ============================================================
// 等值线段
// ============================================================

export interface ContourSegment {
  x1: number; y1: number; z1: number;
  x2: number; y2: number; z2: number;
  level: number;
}


// ============================================================
// 统计聚合结果
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
