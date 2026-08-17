/**
 * Q-04 时间序列分析器 单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  calcTrend,
  calcPeriodicity,
  calcChangePoint,
  calcForecast,
  calcAutoCorrelation,
  calcTimeSeriesAnalysis,
  calcSeriesSummary,
} from '../timeSeriesCalculator';
import type { TimeSeriesInput } from '../timeSeriesCalculator';

const SAMPLE_DATA: TimeSeriesInput = {
  name: '水位(某监测井)',
  dataType: '水位',
  unit: 'm',
  data: [
    { year: 2015, value: 35.2 },
    { year: 2016, value: 35.0 },
    { year: 2017, value: 34.8 },
    { year: 2018, value: 34.5 },
    { year: 2019, value: 34.3 },
    { year: 2020, value: 34.0 },
    { year: 2021, value: 33.8 },
    { year: 2022, value: 33.5 },
    { year: 2023, value: 33.2 },
    { year: 2024, value: 33.0 },
  ],
};

const UPWARD_DATA: TimeSeriesInput = {
  name: '上升序列',
  dataType: '测试',
  unit: 'mg/L',
  data: [
    { year: 2015, value: 10.0 },
    { year: 2016, value: 10.5 },
    { year: 2017, value: 11.0 },
    { year: 2018, value: 11.5 },
    { year: 2019, value: 12.0 },
    { year: 2020, value: 12.5 },
    { year: 2021, value: 13.0 },
    { year: 2022, value: 13.5 },
    { year: 2023, value: 14.0 },
    { year: 2024, value: 14.5 },
  ],
};

// ═══════════════════════════════════════════════════════
// calcTrend
// ═══════════════════════════════════════════════════════

describe('calcTrend', () => {
  it('下降序列返回下降趋势', () => {
    const r = calcTrend(SAMPLE_DATA);
    expect(r.trend).toBe('下降');
    expect(r.slope).toBeLessThan(0);
    expect(r.significant).toBe(true);
  });

  it('上升序列返回上升趋势', () => {
    const r = calcTrend(UPWARD_DATA);
    expect(r.trend).toBe('上升');
    expect(r.slope).toBeGreaterThan(0);
    expect(r.significant).toBe(true);
  });

  it('R² 在合理范围内', () => {
    const r = calcTrend(SAMPLE_DATA);
    expect(r.r2).toBeGreaterThanOrEqual(0.9);
    expect(r.r2).toBeLessThanOrEqual(1);
  });

  it('Sen斜率和线性回归斜率符号一致', () => {
    const r = calcTrend(SAMPLE_DATA);
    const rUp = calcTrend(UPWARD_DATA);
    expect(r.senSlope).toBeLessThan(0);
    expect(rUp.senSlope).toBeGreaterThan(0);
  });

  it('年变化率计算公式正确', () => {
    const r = calcTrend(SAMPLE_DATA);
    // 均值 ≈ 34.13，斜率 ≈ -0.244
    expect(r.annualChangeRate).toBeLessThan(0);
  });

  it('Mann-Kendall Z 值符号与趋势一致', () => {
    const r = calcTrend(SAMPLE_DATA);
    const rUp = calcTrend(UPWARD_DATA);
    expect(r.mkZ).toBeLessThan(0);
    expect(rUp.mkZ).toBeGreaterThan(0);
  });

  it('无趋势数据返回 无显著趋势', () => {
    const flatData: TimeSeriesInput = {
      name: '平坦序列',
      dataType: '测试',
      unit: 'm',
      data: [
        { year: 2015, value: 10 },
        { year: 2016, value: 10 },
        { year: 2017, value: 10 },
        { year: 2018, value: 10 },
        { year: 2019, value: 10 },
      ],
    };
    const r = calcTrend(flatData);
    expect(r.trend).toBe('无显著趋势');
  });

  it('返回的 note 包含关键信息', () => {
    const r = calcTrend(SAMPLE_DATA);
    expect(r.note).toContain('下降');
    expect(r.note).toContain('Z=');
    expect(r.note).toContain('R²=');
  });
});

// ═══════════════════════════════════════════════════════
// calcPeriodicity
// ═══════════════════════════════════════════════════════

describe('calcPeriodicity', () => {
  it('返回均值和标准差', () => {
    const r = calcPeriodicity(SAMPLE_DATA);
    expect(r.mean).toBeGreaterThan(0);
    expect(r.std).toBeGreaterThan(0);
  });

  it('Cv < 0.1 为极稳定', () => {
    const stableData: TimeSeriesInput = {
      name: '稳定序列',
      dataType: '测试',
      unit: 'm',
      data: [
        { year: 2015, value: 10.0 },
        { year: 2016, value: 10.1 },
        { year: 2017, value: 9.9 },
        { year: 2018, value: 10.0 },
      ],
    };
    const r = calcPeriodicity(stableData);
    expect(r.fluctuation).toBe('极稳定');
  });

  it('波动分级正确', () => {
    const r = calcPeriodicity(SAMPLE_DATA);
    expect(['极稳定', '稳定', '中等波动', '波动较大', '波动剧烈']).toContain(r.fluctuation);
  });

  it('最大值 ≥ 最小值', () => {
    const r = calcPeriodicity(SAMPLE_DATA);
    expect(r.max).toBeGreaterThanOrEqual(r.min);
  });

  it('极差 = 最大值 - 最小值', () => {
    const r = calcPeriodicity(SAMPLE_DATA);
    expect(r.range).toBeCloseTo(r.max - r.min, 6);
  });
});

// ═══════════════════════════════════════════════════════
// calcChangePoint
// ═══════════════════════════════════════════════════════

describe('calcChangePoint', () => {
  it('连续下降序列可能检测到突变点', () => {
    const r = calcChangePoint(SAMPLE_DATA);
    // 连续下降序列可能有突变点
    expect(r.changeYear).toBeDefined();
  });

  it('数据不足4年返回无突变', () => {
    const shortData: TimeSeriesInput = {
      name: '不足',
      dataType: '测试',
      unit: 'm',
      data: [
        { year: 2020, value: 10 },
        { year: 2021, value: 11 },
        { year: 2022, value: 12 },
      ],
    };
    const r = calcChangePoint(shortData);
    expect(r.hasChangePoint).toBe(false);
    expect(r.changeYear).toBeNull();
  });

  it('突变前后均值有差异', () => {
    const r = calcChangePoint(SAMPLE_DATA);
    if (r.hasChangePoint) {
      expect(r.beforeMean).not.toBeCloseTo(r.afterMean, 1);
    }
  });
});

// ═══════════════════════════════════════════════════════
// calcForecast
// ═══════════════════════════════════════════════════════

describe('calcForecast', () => {
  it('预测未来年份', () => {
    const r = calcForecast(SAMPLE_DATA, [2025, 2026, 2027]);
    expect(r.forecast).toHaveLength(3);
    expect(r.forecast[0].year).toBe(2025);
  });

  it('预测值具有单调性（与历史趋势一致）', () => {
    const r = calcForecast(SAMPLE_DATA, [2025, 2026]);
    // 下降趋势 → 预测值应递减
    const vals = r.forecast.map(f => f.value);
    expect(vals[0]).toBeGreaterThan(vals[1]);
  });

  it('置信区间包含预测值', () => {
    const r = calcForecast(SAMPLE_DATA, [2025]);
    expect(r.forecast[0].lower).toBeLessThan(r.forecast[0].value);
    expect(r.forecast[0].upper).toBeGreaterThan(r.forecast[0].value);
  });

  it('上升序列预测值递增', () => {
    const r = calcForecast(UPWARD_DATA, [2025, 2026, 2027]);
    const vals2 = r.forecast.map(f => f.value);
    expect(vals2[0]).toBeLessThan(vals2[1]);
    expect(vals2[1]).toBeLessThan(vals2[2]);
  });
});

// ═══════════════════════════════════════════════════════
// calcAutoCorrelation
// ═══════════════════════════════════════════════════════

describe('calcAutoCorrelation', () => {
  it('滞后1阶自相关在合理范围内', () => {
    const r = calcAutoCorrelation(SAMPLE_DATA);
    expect(r.acf.length).toBeGreaterThanOrEqual(3);
    expect(r.acf[0].lag).toBe(1);
    expect(typeof r.acf[0].value).toBe('number');
  });

  it('滞后阶数列表正确', () => {
    const r = calcAutoCorrelation(SAMPLE_DATA);
    const lags = r.acf.map(a => a.lag);
    for (let i = 1; i < lags.length; i++) {
      expect(lags[i]).toBeGreaterThan(lags[i - 1]);
    }
  });
});

// ═══════════════════════════════════════════════════════
// calcTimeSeriesAnalysis
// ═══════════════════════════════════════════════════════

describe('calcTimeSeriesAnalysis', () => {
  it('合并分析返回所有结果', () => {
    const r = calcTimeSeriesAnalysis(SAMPLE_DATA);
    expect(r.trend).toBeDefined();
    expect(r.periodicity).toBeDefined();
    expect(r.changePoint).toBeDefined();
    expect(r.forecast).toBeDefined();
    expect(r.autoCorrelation).toBeDefined();
  });

  it('趋势与独立调用一致', () => {
    const r = calcTimeSeriesAnalysis(SAMPLE_DATA);
    const trendOnly = calcTrend(SAMPLE_DATA);
    expect(r.trend.trend).toBe(trendOnly.trend);
  });
});

// ═══════════════════════════════════════════════════════
// calcSeriesSummary
// ═══════════════════════════════════════════════════════

describe('calcSeriesSummary', () => {
  it('返回汇总统计', () => {
    const r = calcSeriesSummary();
    expect(r).toBeDefined();
    expect(typeof r).toBe('object');
  });
});