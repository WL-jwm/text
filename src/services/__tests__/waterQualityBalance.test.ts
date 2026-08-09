/**
 * H-06 均衡-水质联动分析 测试
 */
import { describe, it, expect } from 'vitest';
import {
  calcCompositeScore,
  calcBalanceScore,
  calcQualityScore,
  determineQuadrant,
  generateSuggestion,
  buildIntegratedAnalysis,
} from '../waterQualityBalance';
import type { CityBalanceResult } from '../waterBalance';
import type { CityWaterQualityStats } from '../waterQuality';

const mockBalance: CityBalanceResult = {
  city: '石家庄',
  area: 6673,
  wellCount: 5,
  recharge: 19.485,
  discharge: 23.366,
  balance: -3.881,
  isOverdrafted: true,
  overdraftIntensity: 0.58,
  factor: '开采强度高',
};

const mockQuality: CityWaterQualityStats = {
  city: '石家庄',
  siteCount: 3,
  classDistribution: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 },
  exceededSites: 1,
  averageClass: 4.0,
  mainFactors: ['TDS'],
};

const goodQuality: CityWaterQualityStats = {
  city: '秦皇岛',
  siteCount: 2,
  classDistribution: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0 },
  exceededSites: 0,
  averageClass: 1.5,
  mainFactors: [],
};

const surplusBalance: CityBalanceResult = {
  city: '秦皇岛',
  area: 1919.5,
  wellCount: 2,
  recharge: 5.104,
  discharge: 5.358,
  balance: -0.254,
  isOverdrafted: true,
  overdraftIntensity: 0.13,
  factor: '补给条件差',
};

describe('calcCompositeScore', () => {
  it('超采+差水质应得低分', () => {
    const score = calcCompositeScore(mockBalance, mockQuality);
    expect(score).toBeLessThan(50);
  });

  it('无数据应返回默认中值', () => {
    const score = calcCompositeScore(null, null);
    expect(score).toBe(50);
  });

  it('仅均衡数据应正确', () => {
    const score = calcCompositeScore(mockBalance, null);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

describe('calcBalanceScore', () => {
  it('亏损越严重得分越低', () => {
    const severe = { ...mockBalance, balance: -15 };
    const mild = { ...mockBalance, balance: -2 };
    expect(calcBalanceScore(severe)).toBeLessThan(calcBalanceScore(mild));
  });

  it('null 返回 0', () => {
    expect(calcBalanceScore(null)).toBe(0);
  });
});

describe('calcQualityScore', () => {
  it('水质越好得分越高', () => {
    const good = { ...mockQuality, averageClass: 1.5 };
    const bad = { ...mockQuality, averageClass: 4.5 };
    expect(calcQualityScore(good)).toBeGreaterThan(calcQualityScore(bad));
  });

  it('null 返回 0', () => {
    expect(calcQualityScore(null)).toBe(0);
  });
});

describe('determineQuadrant', () => {
  it('超采+差水质 = 象限1', () => {
    expect(determineQuadrant(mockBalance, mockQuality)).toBe(1);
  });

  it('超采+好水质 = 象限3', () => {
    expect(determineQuadrant(mockBalance, goodQuality)).toBe(3);
  });

  it('数据不足 = 象限0', () => {
    expect(determineQuadrant(null, null)).toBe(0);
  });

  it('盈余+好水质 = 象限4', () => {
    const surplus = { ...mockBalance, balance: 5, isOverdrafted: false };
    expect(determineQuadrant(surplus, goodQuality)).toBe(4);
  });
});

describe('generateSuggestion', () => {
  it('双差城市应建议优先治理', () => {
    const suggestion = generateSuggestion(1, mockBalance, mockQuality);
    expect(suggestion).toContain('优先治理');
    expect(suggestion).toContain('TDS');
  });

  it('双优城市应建议维持', () => {
    const suggestion = generateSuggestion(4, { ...mockBalance, balance: 5, isOverdrafted: false }, goodQuality);
    expect(suggestion).toContain('维持');
  });

  it('数据不足应提示补充', () => {
    expect(generateSuggestion(0, null, null)).toBe('补充监测数据');
  });
});

describe('buildIntegratedAnalysis', () => {
  it('应正确合并城市数据', () => {
    const result = buildIntegratedAnalysis(
      [mockBalance, { ...mockBalance, city: '保定', balance: -2, isOverdrafted: true }],
      [mockQuality, { ...mockQuality, city: '保定', siteCount: 2, averageClass: 2.0 }],
    );
    expect(result.cities).toHaveLength(2);
    expect(result.hasData).toBe(true);
    expect(result.ranking).toHaveLength(2);
    expect(result.summary.totalCities).toBe(2);
  });

  it('应识别双差城市', () => {
    const result = buildIntegratedAnalysis([mockBalance], [mockQuality]);
    expect(result.summary.dualPoor).toBe(1);
    expect(result.alertCities).toHaveLength(1);
    expect(result.alertCities[0].city).toBe('石家庄');
  });

  it('应处理空数据', () => {
    const result = buildIntegratedAnalysis([], []);
    expect(result.cities).toHaveLength(0);
    expect(result.hasData).toBe(false);
    expect(result.summary.totalCities).toBe(0);
  });

  it('应处理只有均衡数据', () => {
    const result = buildIntegratedAnalysis([mockBalance], []);
    expect(result.cities).toHaveLength(1);
    expect(result.cities[0].quadrant).toBe(0); // 水质数据不足
  });

  it('应生成综合排名', () => {
    const result = buildIntegratedAnalysis(
      [mockBalance, surplusBalance],
      [mockQuality, goodQuality],
    );
    // 秦皇岛水质好，应排前面
    expect(result.ranking[0].city).toBe('秦皇岛');
    expect(result.ranking[1].city).toBe('石家庄');
  });

  it('应生成合理建议', () => {
    const result = buildIntegratedAnalysis([mockBalance], [mockQuality]);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0]).toContain('石家庄');
  });
});