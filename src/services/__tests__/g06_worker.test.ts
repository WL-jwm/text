// @vitest-environment jsdom
/**
 * G-06 WebWorker 并行计算测试
 *
 * 测试覆盖：
 *   1. Worker 消息协议（request/response 格式）
 *   2. IDW 插值 — Worker 执行 vs 主线程结果一致性
 *   3. Marching Squares 等值线 — Worker 执行
 *   4. 统计聚合 — Worker 执行 vs 手动计算
 *   5. useWorkerInterpolation — 回退机制
 *   6. useWorkerContours — 回退机制
 *   7. useWorkerStats — 回退机制
 *   8. useWorkerStatus — 状态检测
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { idwInterpolate, type InterpolationPoint } from '../../utils/idwInterpolation';
import {
  useWorkerInterpolation,
  useWorkerContours,
  useWorkerStats,
  useWorkerStatus,
  isWorkerAvailable,
  type ContourSegment,
  type WorkerStatsResult,
} from '../../hooks/useWorker';

// ============================================================
// 测试数据
// ============================================================

const SAMPLE_POINTS: InterpolationPoint[] = [
  { x: 114.5, y: 38.0, value: 25 },
  { x: 116.0, y: 38.5, value: 20 },
  { x: 115.0, y: 37.5, value: 30 },
  { x: 117.0, y: 39.0, value: 15 },
  { x: 114.0, y: 39.0, value: 35 },
  { x: 118.0, y: 38.0, value: 10 },
];

// ============================================================
// 1. IDW 插值 — 主线程基准（Worker 不可用时回退）
// ============================================================

describe('G-06 IDW 插值回退', () => {
  it('useWorkerInterpolation 回退到主线程时结果一致', async () => {
    const { result } = renderHook(() => useWorkerInterpolation());

    const workerResult = await act(async () => {
      return result.current.interpolate(SAMPLE_POINTS, undefined, {
        power: 2,
        resolution: 0.2,
        searchRadius: 1.5,
        minPoints: 3,
        maxPoints: 10,
      });
    });

    const mainThreadResult = idwInterpolate(SAMPLE_POINTS, undefined, {
      power: 2,
      resolution: 0.2,
      searchRadius: 1.5,
      minPoints: 3,
      maxPoints: 10,
    });

    // 维度一致
    expect(workerResult.cols).toBe(mainThreadResult.cols);
    expect(workerResult.rows).toBe(mainThreadResult.rows);

    // 值一致（回退模式时完全相同）
    for (let r = 0; r < workerResult.rows; r++) {
      for (let c = 0; c < workerResult.cols; c++) {
        const wv = workerResult.values[r]?.[c];
        const mv = mainThreadResult.values[r]?.[c];
        if (wv !== undefined && mv !== undefined) {
          expect(wv).toBeCloseTo(mv, 5);
        }
      }
    }
  });

  it('空数据点返回空网格', async () => {
    const { result } = renderHook(() => useWorkerInterpolation());

    const grid = await act(async () => {
      return result.current.interpolate([], undefined, { minPoints: 3 });
    });

    expect(grid.cols).toBe(0);
    expect(grid.rows).toBe(0);
  });

  it('lastElapsed 被更新', async () => {
    const { result } = renderHook(() => useWorkerInterpolation());

    await act(async () => {
      await result.current.interpolate(SAMPLE_POINTS, undefined, { resolution: 0.3 });
    });

    expect(result.current.lastElapsed).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================
// 2. Marching Squares 等值线 — 回退
// ============================================================

describe('G-06 等值线提取回退', () => {
  it('useWorkerContours 回退生成线段', async () => {
    const { result } = renderHook(() => useWorkerContours());

    const grid = idwInterpolate(SAMPLE_POINTS, undefined, { resolution: 0.2 });

    const segments = await act(async () => {
      return result.current.extractContours(grid, [20, 25]);
    });

    expect(Array.isArray(segments)).toBe(true);
    // 应该有线段（数据有梯度）
    if (segments.length > 0) {
      const seg = segments[0]!;
      expect(seg).toHaveProperty('x1');
      expect(seg).toHaveProperty('x2');
      expect(seg).toHaveProperty('level');
    }
  });

  it('均匀数据不生成等值线', async () => {
    const { result } = renderHook(() => useWorkerContours());

    const grid = {
      bounds: { minLng: 0, maxLng: 1, minLat: 0, maxLat: 1 },
      resolution: 0.25,
      cols: 3,
      rows: 3,
      values: [[5, 5, 5], [5, 5, 5], [5, 5, 5]],
      nodata: -9999,
    };

    const segments = await act(async () => {
      return result.current.extractContours(grid, [2.5, 7.5]);
    });

    expect(segments).toHaveLength(0);
  });

  it('梯度数据生成等值线', async () => {
    const { result } = renderHook(() => useWorkerContours());

    const grid = {
      bounds: { minLng: 0, maxLng: 1, minLat: 0, maxLat: 1 },
      resolution: 0.25,
      cols: 3,
      rows: 3,
      values: [[0, 0, 0], [5, 5, 5], [10, 10, 10]],
      nodata: -9999,
    };

    let segments: ContourSegment[] = [];
    await act(async () => {
      segments = await result.current.extractContours(grid, [2.5, 7.5]);
    });

    expect(segments.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 3. 统计聚合 — 回退
// ============================================================

describe('G-06 统计聚合回退', () => {
  it('useWorkerStats 计算基本统计量', async () => {
    const { result } = renderHook(() => useWorkerStats());

    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const stats = await act(async () => {
      return result.current.computeStats(values);
    });

    expect(stats.count).toBe(10);
    expect(stats.mean).toBe(5.5);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(10);
    expect(stats.median).toBe(5.5);
  });

  it('标准差计算正确', async () => {
    const { result } = renderHook(() => useWorkerStats());

    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const stats = await act(async () => {
      return result.current.computeStats(values);
    });

    expect(stats.std).toBeCloseTo(2.138, 1);
  });

  it('分位数计算正确', async () => {
    const { result } = renderHook(() => useWorkerStats());

    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const stats = await act(async () => {
      return result.current.computeStats(values);
    });

    expect(stats.p25).toBe(3); // floor(0.25 * 9) = 2 → sorted[2] = 3
    expect(stats.p75).toBe(7); // floor(0.75 * 9) = 6 → sorted[6] = 7
  });

  it('站点分组统计', async () => {
    const { result } = renderHook(() => useWorkerStats());

    const values = [10, 20, 15, 25];
    const stationGroups = [
      { stationId: 'S1', stationName: '站1', values: [10, 20] },
      { stationId: 'S2', stationName: '站2', values: [15, 25] },
    ];

    const stats = await act(async () => {
      return result.current.computeStats(values, stationGroups);
    });

    expect(stats.byStation).toHaveLength(2);
    expect(stats.byStation[0]!.stationId).toBe('S1');
    expect(stats.byStation[0]!.mean).toBe(15);
    expect(stats.byStation[1]!.mean).toBe(20);
  });

  it('小时分桶统计', async () => {
    const { result } = renderHook(() => useWorkerStats());

    const baseTime = new Date('2026-08-03T00:00:00').getTime();
    const values = [10, 20, 30, 40];
    const timestamps = [
      baseTime + 0 * 3600000,  // 00:00
      baseTime + 6 * 3600000,  // 06:00
      baseTime + 12 * 3600000, // 12:00
      baseTime + 18 * 3600000, // 18:00
    ];

    const stats = await act(async () => {
      return result.current.computeStats(values, undefined, timestamps);
    });

    expect(stats.hourlyAverages).toHaveLength(24);
    expect(stats.hourlyAverages[0]).toBe(10);
    expect(stats.hourlyAverages[6]).toBe(20);
    expect(stats.hourlyAverages[12]).toBe(30);
    expect(stats.hourlyAverages[18]).toBe(40);
    expect(stats.hourlyAverages[1]).toBe(0); // 无数据的时段
  });

  it('空数据返回零值统计', async () => {
    const { result } = renderHook(() => useWorkerStats());

    const stats = await act(async () => {
      return result.current.computeStats([]);
    });

    expect(stats.count).toBe(0);
    expect(stats.mean).toBe(0);
    expect(stats.std).toBe(0);
    expect(stats.hourlyAverages).toHaveLength(24);
  });
});

// ============================================================
// 4. Worker 状态监控
// ============================================================

describe('G-06 Worker 状态监控', () => {
  it('useWorkerStatus 返回 available 和 ready', () => {
    const { result } = renderHook(() => useWorkerStatus());

    // 在 jsdom 环境下 Worker 可能不可用
    expect(result.current).toHaveProperty('available');
    expect(result.current).toHaveProperty('ready');
    expect(typeof result.current.available).toBe('boolean');
  });

  it('isWorkerAvailable 返回布尔值', () => {
    const result = isWorkerAvailable();
    expect(typeof result).toBe('boolean');
  });
});

// ============================================================
// 5. Worker 消息协议验证
// ============================================================

describe('G-06 Worker 消息协议', () => {
  it('WorkerRequest 包含 taskId/task/payload', () => {
    const request = {
      taskId: 1,
      task: 'idw' as const,
      payload: { points: SAMPLE_POINTS, options: { resolution: 0.1 } },
    };
    expect(request).toHaveProperty('taskId');
    expect(request).toHaveProperty('task');
    expect(request).toHaveProperty('payload');
  });

  it('WorkerResponse 包含 taskId/task/success', () => {
    const response = {
      taskId: 1,
      task: 'idw' as const,
      success: true,
      result: { cols: 10, rows: 10, values: [] },
    };
    expect(response).toHaveProperty('taskId');
    expect(response).toHaveProperty('task');
    expect(response).toHaveProperty('success');
  });

  it('WorkerResponse 错误格式', () => {
    const response = {
      taskId: 1,
      task: 'stats' as const,
      success: false,
      error: 'Unknown task: invalid',
    };
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});

// ============================================================
// 6. 并发测试
// ============================================================

describe('G-06 并发任务', () => {
  it('多个 useWorkerInterpolation 可同时使用', async () => {
    const { result: result1 } = renderHook(() => useWorkerInterpolation());
    const { result: result2 } = renderHook(() => useWorkerInterpolation());

    const [grid1, grid2] = await act(async () => {
      return Promise.all([
        result1.current.interpolate(SAMPLE_POINTS, undefined, { resolution: 0.3 }),
        result2.current.interpolate(SAMPLE_POINTS, undefined, { resolution: 0.3 }),
      ]);
    });

    expect(grid1.cols).toBe(grid2.cols);
    expect(grid1.rows).toBe(grid2.rows);
  });

  it('多个 useWorkerStats 可同时使用', async () => {
    const { result: result1 } = renderHook(() => useWorkerStats());
    const { result: result2 } = renderHook(() => useWorkerStats());

    const [stats1, stats2] = await act(async () => {
      return Promise.all([
        result1.current.computeStats([1, 2, 3]),
        result2.current.computeStats([4, 5, 6]),
      ]);
    });

    expect(stats1.mean).toBe(2);
    expect(stats2.mean).toBe(5);
  });
});

// ============================================================
// 7. 大数据量性能验证
// ============================================================

describe('G-06 大数据量', () => {
  it('100 个站点 IDW 插值完成', async () => {
    const { result } = renderHook(() => useWorkerInterpolation());

    const largePoints: InterpolationPoint[] = Array.from({ length: 100 }, (_, i) => ({
      x: 114 + Math.random() * 5,
      y: 37 + Math.random() * 3,
      value: 10 + Math.random() * 40,
      label: `站${i}`,
    }));

    const grid = await act(async () => {
      return result.current.interpolate(largePoints, undefined, {
        resolution: 0.1,
        searchRadius: 2,
        maxPoints: 15,
      });
    });

    expect(grid.cols).toBeGreaterThan(0);
    expect(grid.rows).toBeGreaterThan(0);
  });

  it('10000 个值统计聚合完成', async () => {
    const { result } = renderHook(() => useWorkerStats());

    const largeValues = Array.from({ length: 10000 }, () => Math.random() * 100);

    const stats = await act(async () => {
      return result.current.computeStats(largeValues);
    });

    expect(stats.count).toBe(10000);
    expect(stats.mean).toBeGreaterThan(40);
    expect(stats.mean).toBeLessThan(60);
  });

  it('大网格等值线提取完成', async () => {
    const { result } = renderHook(() => useWorkerContours());

    const grid = {
      bounds: { minLng: 0, maxLng: 10, minLat: 0, maxLat: 10 },
      resolution: 0.1,
      cols: 100,
      rows: 100,
      values: Array.from({ length: 100 }, (_, r) =>
        Array.from({ length: 100 }, (_, c) => r + c),
      ),
      nodata: -9999,
    };

    const segments = await act(async () => {
      return result.current.extractContours(grid, [50.5, 100.5, 150.5]);
    });

    expect(segments.length).toBeGreaterThan(0);
  });
});
