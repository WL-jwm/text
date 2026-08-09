/**
 * Q-04 地下水均衡计算器 单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  calcBalance,
  calcBalanceSummary,
  fmt,
  getBalanceStatusLabel,
  getOverdraftStatusLabel,
  calcExtractionTrendSummary,
} from '../balanceCalculator';
import type { BalanceInput } from '../balanceCalculator';

const SAMPLE_INPUT: BalanceInput = {
  city: '石家庄',
  area: 1000,
  precipitationInfiltration: 5.0,
  lateralRecharge: 2.0,
  riverLeakage: 1.0,
  canalLeakage: 0.5,
  irrigationRecharge: 0.3,
  crossFlowRecharge: 0.2,
  otherRecharge: 0.1,
  extraction: 6.0,
  evaporation: 1.0,
  crossFlowDischarge: 0.3,
  lateralDischarge: 0.5,
  springDischarge: 0.1,
  allowableExtraction: 6.5,
};

// ═══════════════════════════════════════════════════════
// calcBalance
// ═══════════════════════════════════════════════════════

describe('calcBalance', () => {
  it('补给合计 = 各项之和', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.totalRecharge).toBeCloseTo(5.0 + 2.0 + 1.0 + 0.5 + 0.3 + 0.2 + 0.1, 6);
  });

  it('排泄合计 = 各项之和', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.totalDischarge).toBeCloseTo(6.0 + 1.0 + 0.3 + 0.5 + 0.1, 6);
  });

  it('均衡差 = 补给 - 排泄', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.balance).toBeCloseTo(r.totalRecharge - r.totalDischarge, 6);
  });

  it('均衡率 = 均衡差 / 补给', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.balanceRate).toBeCloseTo(r.balance / r.totalRecharge, 6);
  });

  it('补给项列表包含所有项', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.rechargeItems).toHaveLength(7);
    expect(r.rechargeItems[0].name).toBe('降水入渗');
    expect(r.rechargeItems[0].value).toBe(5.0);
  });

  it('排泄项列表包含所有项', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.dischargeItems).toHaveLength(5);
    expect(r.dischargeItems[0].name).toBe('人工开采');
    expect(r.dischargeItems[0].value).toBe(6.0);
  });

  it('补给项百分比之和 ≈ 100%', () => {
    const r = calcBalance(SAMPLE_INPUT);
    const sum = r.rechargeItems.reduce((s, it) => s + it.percent, 0);
    expect(sum).toBeCloseTo(100, 1);
  });

  it('开采系数 = 开采 / 总补给', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.exploitationCoefficient).toBeCloseTo(6.0 / r.totalRecharge, 6);
  });

  it('开采模数 = 亿m³→万m³ / 面积', () => {
    const r = calcBalance(SAMPLE_INPUT);
    // 源: (extraction * 10000) / area = 6*10000/1000 = 60
    expect(r.exploitationModulus).toBeCloseTo((6.0 * 10000) / 1000, 6);
  });

  it('补给模数 = 亿m³→万m³ / 面积', () => {
    const r = calcBalance(SAMPLE_INPUT);
    expect(r.rechargeModulus).toBeCloseTo((r.totalRecharge * 10000) / 1000, 6);
  });

  it('超采量 = 开采 - 允许开采量（负值表示有盈余）', () => {
    const r = calcBalance(SAMPLE_INPUT);
    // 源: extraction - allowableExtraction = 6.0 - 6.5 = -0.5
    expect(r.overdraftAmount).toBeCloseTo(6.0 - 6.5, 6);
  });

  it('无 allowableExtraction 时超采量 = 均衡差（仅当均衡差为负）', () => {
    const input = { ...SAMPLE_INPUT, allowableExtraction: undefined };
    const r = calcBalance(input);
    // 源: balance < 0 ? balance : 0
    expect(r.overdraftAmount).toBe(r.balance < 0 ? r.balance : 0);
  });
});

describe('calcBalance - 均衡状态', () => {
  it('盈余状态 (balanceRate > 5%)', () => {
    const input: BalanceInput = {
      ...SAMPLE_INPUT,
      precipitationInfiltration: 10,
      extraction: 3,
    };
    const r = calcBalance(input);
    expect(r.balanceStatus).toBe('surplus');
  });

  it('均衡状态 (balanceRate -5%~5%)', () => {
    // 调整使得 balanceRate ≈ 0
    const input: BalanceInput = {
      ...SAMPLE_INPUT,
      precipitationInfiltration: 3.1,
      extraction: 3.0,
      lateralRecharge: 0.5,
    };
    const r = calcBalance(input);
    // 补给=3.1+0.5+1+0.5+0.3+0.2+0.1=5.7, 排泄=3+1+0.3+0.5+0.1=4.9
    // balanceRate=(5.7-4.9)/5.7=14% > 5%, still surplus
    // Need more precise input
    const r2 = calcBalance({
      ...SAMPLE_INPUT,
      precipitationInfiltration: 4.0,
      extraction: 4.0,
      lateralRecharge: 0.3,
      riverLeakage: 0.1,
      canalLeakage: 0.1,
      irrigationRecharge: 0.1,
      crossFlowRecharge: 0.1,
      otherRecharge: 0.1,
      evaporation: 0.1,
      crossFlowDischarge: 0.1,
      lateralDischarge: 0.1,
      springDischarge: 0.1,
    });
    // 补给=4+0.3+0.1+0.1+0.1+0.1+0.1=4.8, 排泄=4+0.1+0.1+0.1+0.1=4.4
    // balanceRate=0.4/4.8=8.3% > 5%
    // Let me try harder
    const r3 = calcBalance({
      ...SAMPLE_INPUT,
      precipitationInfiltration: 3.5,
      extraction: 3.0,
      lateralRecharge: 0.5,
      riverLeakage: 0.2,
      canalLeakage: 0.1,
      irrigationRecharge: 0.1,
      crossFlowRecharge: 0.1,
      otherRecharge: 0.1,
      evaporation: 0.3,
      crossFlowDischarge: 0.1,
      lateralDischarge: 0.2,
      springDischarge: 0.1,
    });
    // 补给=3.5+0.5+0.2+0.1+0.1+0.1+0.1=4.6, 排泄=3+0.3+0.1+0.2+0.1=3.7
    // balanceRate=0.9/4.6=19.6%
    // OK I need to be more precise. Let me just adjust extraction to match recharge exactly.
    // totalRecharge without extraction: 3.5+0.5+0.2+0.1+0.1+0.1+0.1=4.6
    // For balanceRate to be 0%, need extraction = totalRecharge - evaporation - ... = 4.6 - 0.3 - 0.1 - 0.2 - 0.1 = 3.9
    // Actually, balanceRate = (totalRecharge - totalDischarge) / totalRecharge
    // For balanceRate to be within ±5%, need balance/totalRecharge ≈ 0
    // totalDischarge = extraction + 0.3 + 0.1 + 0.2 + 0.1 = extraction + 0.7
    // balance = 4.6 - (extraction + 0.7) = 3.9 - extraction
    // balanceRate = (3.9 - extraction) / 4.6
    // For 0%: extraction = 3.9
    const r4 = calcBalance({
      ...SAMPLE_INPUT,
      precipitationInfiltration: 3.5,
      extraction: 3.9,
      lateralRecharge: 0.5,
      riverLeakage: 0.2,
      canalLeakage: 0.1,
      irrigationRecharge: 0.1,
      crossFlowRecharge: 0.1,
      otherRecharge: 0.1,
      evaporation: 0.3,
      crossFlowDischarge: 0.1,
      lateralDischarge: 0.2,
      springDischarge: 0.1,
    });
    // 补给=4.6, 排泄=3.9+0.3+0.1+0.2+0.1=4.6, balance=0, balanceRate=0
    expect(r4.balanceStatus).toBe('balanced');
  });

  it('亏损状态 (balanceRate -5%~-20%)', () => {
    const input: BalanceInput = {
      ...SAMPLE_INPUT,
      precipitationInfiltration: 3.0,
      extraction: 6.0,
    };
    const r = calcBalance(input);
    expect(r.balanceStatus).toBe('deficit');
  });

  it('严重亏损 (balanceRate < -20%)', () => {
    const input: BalanceInput = {
      ...SAMPLE_INPUT,
      precipitationInfiltration: 1.0,
      extraction: 6.0,
    };
    const r = calcBalance(input);
    expect(r.balanceStatus).toBe('severe');
  });
});

describe('calcBalance - 超采状态', () => {
  // 总补给=SAMPLE_INPUT各补给项之和=9.1
  // safe: 开采系数 ≤ 0.6 → extraction ≤ 5.46
  // warning: 0.6 < 开采系数 ≤ 0.8 → 5.46 < extraction ≤ 7.28
  // over: 0.8 < 开采系数 ≤ 1.0 → 7.28 < extraction ≤ 9.1
  // critical: 开采系数 > 1.0 → extraction > 9.1

  it('安全 (开采系数 ≤ 0.6)', () => {
    const input: BalanceInput = { ...SAMPLE_INPUT, extraction: 5.0 };
    const r = calcBalance(input);
    expect(r.overdraftStatus).toBe('safe');
  });

  it('预警 (0.6 < 开采系数 ≤ 0.8)', () => {
    const input: BalanceInput = { ...SAMPLE_INPUT, extraction: 6.0 };
    const r = calcBalance(input);
    // 6/9.1 ≈ 0.66, 在(0.6, 0.8]范围
    expect(r.overdraftStatus).toBe('warning');
  });

  it('超采 (0.8 < 开采系数 ≤ 1.0)', () => {
    const input: BalanceInput = { ...SAMPLE_INPUT, extraction: 8.0 };
    const r = calcBalance(input);
    // 8/9.1 ≈ 0.88, 在(0.8, 1.0]范围
    expect(r.overdraftStatus).toBe('over');
  });

  it('严重超采 (开采系数 > 1.0)', () => {
    const input: BalanceInput = { ...SAMPLE_INPUT, extraction: 10.0 };
    const r = calcBalance(input);
    // 10/9.1 ≈ 1.10 > 1.0
    expect(r.overdraftStatus).toBe('critical');
  });
});

// ═══════════════════════════════════════════════════════
// calcBalanceSummary
// ═══════════════════════════════════════════════════════

describe('calcBalanceSummary', () => {
  const results = [
    calcBalance(SAMPLE_INPUT),
    calcBalance({ ...SAMPLE_INPUT, city: '保定', area: 800, extraction: 3.0, precipitationInfiltration: 8.0 }),
    calcBalance({ ...SAMPLE_INPUT, city: '邯郸', area: 1200, extraction: 7.0, precipitationInfiltration: 4.0 }),
  ];

  const summary = calcBalanceSummary(results);

  it('总面积 = 各市之和', () => {
    expect(summary.totalArea).toBe(1000 + 800 + 1200);
  });

  it('总补给 = 各市之和', () => {
    const total = results.reduce((s, r) => s + r.totalRecharge, 0);
    expect(summary.totalRecharge).toBeCloseTo(total, 6);
  });

  it('总排泄 = 各市之和', () => {
    const total = results.reduce((s, r) => s + r.totalDischarge, 0);
    expect(summary.totalDischarge).toBeCloseTo(total, 6);
  });

  it('汇总统计城市数', () => {
    expect(summary.totalOverdraftCities + summary.totalBalancedCities + summary.totalSurplusCities).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

describe('fmt', () => {
  it('默认保留2位', () => {
    expect(fmt(3.14159)).toBe('3.14');
  });

  it('指定小数位数', () => {
    expect(fmt(3.14159, 4)).toBe('3.1416');
  });

  it('整数', () => {
    expect(fmt(5)).toBe('5.00');
  });
});

describe('getBalanceStatusLabel', () => {
  it('surplus → 盈余', () => {
    expect(getBalanceStatusLabel('surplus')).toBe('盈余');
  });
  it('balanced → 均衡', () => {
    expect(getBalanceStatusLabel('balanced')).toBe('均衡');
  });
  it('deficit → 亏损', () => {
    expect(getBalanceStatusLabel('deficit')).toBe('亏损');
  });
  it('severe → 严重亏损', () => {
    expect(getBalanceStatusLabel('severe')).toBe('严重亏损');
  });
});

describe('getOverdraftStatusLabel', () => {
  it('safe → 安全', () => {
    expect(getOverdraftStatusLabel('safe')).toBe('安全');
  });
  it('warning → 警戒', () => {
    expect(getOverdraftStatusLabel('warning')).toBe('警戒');
  });
  it('over → 超采', () => {
    expect(getOverdraftStatusLabel('over')).toBe('超采');
  });
  it('critical → 严重超采', () => {
    expect(getOverdraftStatusLabel('critical')).toBe('严重超采');
  });
});

// ═══════════════════════════════════════════════════════
// calcExtractionTrendSummary
// ═══════════════════════════════════════════════════════

describe('calcExtractionTrendSummary', () => {
  const data = [
    { year: 2016, totalExtraction: 5.0, shallowExtraction: 3.0, deepExtraction: 2.0 },
    { year: 2017, totalExtraction: 5.2, shallowExtraction: 3.1, deepExtraction: 2.1 },
    { year: 2018, totalExtraction: 5.5, shallowExtraction: 3.2, deepExtraction: 2.3 },
    { year: 2019, totalExtraction: 5.3, shallowExtraction: 3.0, deepExtraction: 2.3 },
    { year: 2020, totalExtraction: 5.8, shallowExtraction: 3.3, deepExtraction: 2.5 },
  ];

  it('返回峰值年份和值', () => {
    const r = calcExtractionTrendSummary(data);
    expect(r.peakYear).toBe(2020);
    expect(r.peakValue).toBe(5.8);
  });

  it('返回最新年份和值', () => {
    const r = calcExtractionTrendSummary(data);
    expect(r.latestYear).toBe(2020);
    expect(r.latestValue).toBe(5.8);
  });

  it('返回总削减量', () => {
    const r = calcExtractionTrendSummary(data);
    const expected = 5.8 - 5.8; // peak=latest=5.8
    expect(r.totalReduction).toBeCloseTo(expected, 6);
  });

  it('空数组返回默认值', () => {
    const r = calcExtractionTrendSummary([]);
    expect(r.peakYear).toBe(0);
    expect(r.peakValue).toBe(0);
    expect(r.latestYear).toBe(0);
    expect(r.latestValue).toBe(0);
  });
});