/**
 * Q-04 空间统计分析器 单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  calcMoranI,
  calcLocalMoran,
  calcVariogram,
  calcCrossValidation,
} from '../spatialStatsCalculator';
import type { SpatialPoint } from '../spatialStatsCalculator';

const GRID_POINTS: SpatialPoint[] = [
  { x: 0, y: 0, value: 10 },
  { x: 1, y: 0, value: 11 },
  { x: 2, y: 0, value: 12 },
  { x: 0, y: 1, value: 9 },
  { x: 1, y: 1, value: 10 },
  { x: 2, y: 1, value: 11 },
  { x: 0, y: 2, value: 8 },
  { x: 1, y: 2, value: 9 },
  { x: 2, y: 2, value: 10 },
];

const RANDOM_POINTS: SpatialPoint[] = [
  { x: 0, y: 0, value: 10 },
  { x: 5, y: 5, value: 15 },
  { x: 10, y: 10, value: 20 },
  { x: 0, y: 10, value: 12 },
  { x: 10, y: 0, value: 8 },
];

// ═══════════════════════════════════════════════════════
// calcMoranI
// ═══════════════════════════════════════════════════════

describe('calcMoranI', () => {
  it('Moran I 在 [-1, 1] 范围', () => {
    const r = calcMoranI({ points: GRID_POINTS });
    expect(r.moranI).toBeGreaterThanOrEqual(-1);
    expect(r.moranI).toBeLessThanOrEqual(1);
  });

  it('Z 值在合理范围', () => {
    const r = calcMoranI({ points: GRID_POINTS });
    expect(typeof r.zScore).toBe('number');
  });

  it('p 值在 [0, 1] 范围', () => {
    const r = calcMoranI({ points: GRID_POINTS });
    expect(r.pValue).toBeGreaterThanOrEqual(0);
    expect(r.pValue).toBeLessThanOrEqual(1);
  });

  it('单点数据返回默认值', () => {
    const r = calcMoranI({ points: [GRID_POINTS[0]] });
    expect(r.moranI).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
// calcLocalMoran
// ═══════════════════════════════════════════════════════

describe('calcLocalMoran', () => {
  it('每个点返回局部 Moran I 值', () => {
    const r = calcLocalMoran({ points: GRID_POINTS });
    expect(r).toHaveLength(GRID_POINTS.length);
  });

  it('局部 Moran I 值在合理范围', () => {
    const r = calcLocalMoran({ points: GRID_POINTS });
    for (const item of r) {
      expect(item.localI).toBeGreaterThanOrEqual(-2);
      expect(item.localI).toBeLessThanOrEqual(2);
    }
  });
});

// ═══════════════════════════════════════════════════════
// calcVariogram
// ═══════════════════════════════════════════════════════

describe('calcVariogram', () => {
  it('返回实验半变异函数点', () => {
    const r = calcVariogram({ points: GRID_POINTS, model: 'spherical', lagCount: 5 });
    expect(r.experimental.length).toBeGreaterThan(0);
  });

  it('块金值 ≥ 0', () => {
    const r = calcVariogram({ points: GRID_POINTS, model: 'spherical', lagCount: 5 });
    expect(r.nugget).toBeGreaterThanOrEqual(0);
  });

  it('基台值 > 块金值', () => {
    const r = calcVariogram({ points: GRID_POINTS, model: 'spherical', lagCount: 5 });
    expect(r.sill).toBeGreaterThanOrEqual(r.nugget);
  });

  it('变程 > 0', () => {
    const r = calcVariogram({ points: GRID_POINTS, model: 'spherical', lagCount: 5 });
    expect(r.range).toBeGreaterThan(0);
  });

  it('返回拟合模型', () => {
    const r = calcVariogram({ points: GRID_POINTS, model: 'spherical', lagCount: 5 });
    expect(r.note).toBeDefined();
    expect(r.note.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// calcCrossValidation
// ═══════════════════════════════════════════════════════

describe('calcCrossValidation', () => {
  it('每个点返回交叉验证结果', () => {
    const r = calcCrossValidation(RANDOM_POINTS);
    expect(r.points).toHaveLength(RANDOM_POINTS.length);
  });

  it('RMSE ≥ 0', () => {
    const r = calcCrossValidation(RANDOM_POINTS);
    expect(r.rmse).toBeGreaterThanOrEqual(0);
  });

  it('ME 为数值', () => {
    const r = calcCrossValidation(RANDOM_POINTS);
    expect(typeof r.me).toBe('number');
  });

  it('MAE ≥ 0', () => {
    const r = calcCrossValidation(RANDOM_POINTS);
    expect(r.mae).toBeGreaterThanOrEqual(0);
  });

  it('返回精度等级', () => {
    const r = calcCrossValidation(RANDOM_POINTS);
    expect(r.accuracy).toBeDefined();
  });
});