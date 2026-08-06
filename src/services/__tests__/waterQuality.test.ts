/**
 * H-05 水质综合评价引擎 测试
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateSingleIndicator,
  comprehensiveAssessment,
  classifySulin,
  calcIonEq,
  buildWaterQualitySummary,
  buildCityWaterQualityStats,
  getClassLabel,
  getClassColor,
  getClassDescription,
  INDICATOR_META,
  GB_T14848_2017_LIMITS,
} from '../waterQuality';

describe('evaluateSingleIndicator', () => {
  it('TDS: Ⅰ类(≤300)', () => {
    const r = evaluateSingleIndicator('TDS', 250);
    expect(r.class).toBe(1);
    expect(r.isExceeded).toBe(false);
    expect(r.class3Limit).toBe(1000);
  });

  it('TDS: Ⅲ类(≤1000)', () => {
    const r = evaluateSingleIndicator('TDS', 800);
    expect(r.class).toBe(3);
    expect(r.isExceeded).toBe(false);
  });

  it('TDS: Ⅳ类(>1000, ≤2000)', () => {
    const r = evaluateSingleIndicator('TDS', 1500);
    expect(r.class).toBe(4);
    expect(r.isExceeded).toBe(true);
    expect(r.exceedRatio).toBeCloseTo(1.5, 1);
  });

  it('TDS: Ⅴ类(>2000)', () => {
    const r = evaluateSingleIndicator('TDS', 2500);
    expect(r.class).toBe(5);
    expect(r.isExceeded).toBe(true);
  });

  it('pH: 正常范围(7.0)', () => {
    const r = evaluateSingleIndicator('pH', 7.0);
    expect(r.class).toBe(1);
    expect(r.isExceeded).toBe(false);
  });

  it('pH: Ⅳ类(5.8)', () => {
    const r = evaluateSingleIndicator('pH', 5.8);
    expect(r.class).toBe(4);
    expect(r.isExceeded).toBe(true);
  });

  it('pH: Ⅴ类(4.5)', () => {
    const r = evaluateSingleIndicator('pH', 4.5);
    expect(r.class).toBe(5);
    expect(r.isExceeded).toBe(true);
  });

  it('DO: 下限型，Ⅰ类(≥7.5)', () => {
    const r = evaluateSingleIndicator('DO', 8.0);
    expect(r.class).toBe(1);
  });

  it('DO: Ⅳ类(3.0~3.9)', () => {
    const r = evaluateSingleIndicator('DO', 3.5);
    expect(r.class).toBe(4);
    expect(r.isExceeded).toBe(true);
  });

  it('NO3: Ⅲ类(≤20)', () => {
    const r = evaluateSingleIndicator('NO3', 15);
    expect(r.class).toBe(3);
    expect(r.isExceeded).toBe(false);
  });

  it('NO3: 超标(>20)', () => {
    const r = evaluateSingleIndicator('NO3', 25);
    expect(r.class).toBe(4);
    expect(r.isExceeded).toBe(true);
  });

  it('F: Ⅱ类(≤1.0)', () => {
    const r = evaluateSingleIndicator('F', 0.8);
    expect(r.class).toBe(2);
  });

  it('F: Ⅳ类(>1.0, ≤2.0)', () => {
    const r = evaluateSingleIndicator('F', 1.5);
    expect(r.class).toBe(4);
    expect(r.isExceeded).toBe(true);
  });
});

describe('calcIonEq', () => {
  it('Ca²⁺ 100mg/L 当量计算', () => {
    // 100 * 2 / 40.08 = 4.990
    const eq = calcIonEq(100, 2, 40.08);
    expect(eq).toBeCloseTo(4.990, 2);
  });

  it('HCO₃⁻ 300mg/L 当量计算', () => {
    // 300 * 1 / 61.02 = 4.916
    const eq = calcIonEq(300, 1, 61.02);
    expect(eq).toBeCloseTo(4.916, 2);
  });
});

describe('classifySulin', () => {
  it('石家庄: HCO₃-Ca·Mg型', () => {
    const result = classifySulin({
      HCO3: 300, SO4: 75, Cl: 50,
      Ca: 90, Mg: 35, Na: 40,
    });
    expect(result.fullName).toContain('HCO₃');
    expect(result.cationType).toMatch(/Ca/);
  });

  it('沧州: Cl-Na型（高Na, Cl）', () => {
    const result = classifySulin({
      HCO3: 280, SO4: 150, Cl: 120,
      Ca: 100, Mg: 45, Na: 120,
    });
    // 阴离子：Cl 占比高
    expect(result.anionType).toMatch(/Cl/);
    // 阳离子：Na 占比高
    expect(result.cationType).toMatch(/Na/);
  });

  it('所有离子均为0时的处理', () => {
    const result = classifySulin({ HCO3: 0, SO4: 0, Cl: 0, Ca: 0, Mg: 0, Na: 0 });
    expect(result.fullName).toBeDefined();
    expect(result.fullName.length).toBeGreaterThan(0);
  });
});

describe('comprehensiveAssessment', () => {
  it('应返回综合水质类别（取最差单项）', () => {
    const result = comprehensiveAssessment(
      'WQ-SJZ-01', '石家庄水质站', '石家庄',
      { pH: 7.5, TDS: 1200, NO3: 8.5, F: 0.6 },
    );
    // TDS=1200 属于Ⅳ类，其他为Ⅰ~Ⅲ类
    expect(result.comprehensiveClass).toBe(4);
    expect(result.comprehensiveLabel).toBe('较差');
    expect(result.exceededCount).toBe(1);
    expect(result.exceededFactors[0].indicator).toBe('TDS');
  });

  it('应支持苏卡列夫分类', () => {
    const sulin = classifySulin({ HCO3: 300, SO4: 75, Cl: 50, Ca: 90, Mg: 35, Na: 40 });
    const result = comprehensiveAssessment(
      'WQ-SJZ-01', '石家庄水质站', '石家庄',
      { pH: 7.5, TDS: 450, NO3: 5.0 },
      sulin,
    );
    expect(result.sulin).toBeDefined();
    expect(result.hydrochemicalType).toContain('HCO₃');
  });

  it('应处理空指标值', () => {
    const result = comprehensiveAssessment('WQ-01', '站', '石家庄', {});
    expect(result.indicators).toHaveLength(0);
    expect(result.comprehensiveClass).toBe(1);
    expect(result.exceededCount).toBe(0);
  });
});

describe('buildWaterQualitySummary', () => {
  it('应正确汇总多个井的评估结果', () => {
    const a1 = comprehensiveAssessment('W1', '站1', '石家庄', { TDS: 1500, NO3: 5 });
    const a2 = comprehensiveAssessment('W2', '站2', '保定', { TDS: 250, NO3: 25 });
    const a3 = comprehensiveAssessment('W3', '站3', '沧州', { TDS: 2500, NO3: 30 });

    const summary = buildWaterQualitySummary([a1, a2, a3]);
    expect(summary.totalSites).toBe(3);
    expect(summary.exceededSites).toBe(3); // 全部超标
    expect(summary.topFactors.length).toBeGreaterThan(0);
    // TDS 超标因子排在前面
    expect(summary.topFactors[0].indicator).toBe('TDS');
  });

  it('应处理空列表', () => {
    const summary = buildWaterQualitySummary([]);
    expect(summary.totalSites).toBe(0);
    expect(summary.exceededSites).toBe(0);
    expect(summary.topFactors).toHaveLength(0);
  });
});

describe('buildCityWaterQualityStats', () => {
  it('应按城市分组统计', () => {
    const a1 = comprehensiveAssessment('W1', '站1', '石家庄', { TDS: 1500 });
    const a2 = comprehensiveAssessment('W2', '站2', '石家庄', { TDS: 250 });
    const a3 = comprehensiveAssessment('W3', '站3', '保定', { TDS: 2500 });

    const stats = buildCityWaterQualityStats([a1, a2, a3]);
    expect(stats).toHaveLength(2);
    const sjz = stats.find(s => s.city === '石家庄');
    expect(sjz).toBeDefined();
    expect(sjz?.siteCount).toBe(2);
    expect(sjz?.exceededSites).toBe(1);
  });
});

describe('WATER_CLASS_LABELS', () => {
  it('应包含所有水质类别', () => {
    for (let i = 1; i <= 5; i++) {
      const cls = i as 1 | 2 | 3 | 4 | 5;
      expect(getClassLabel(cls)).toBeDefined();
      expect(getClassColor(cls)).toBeDefined();
      expect(getClassDescription(cls)).toBeDefined();
    }
  });
});

describe('INDICATOR_META', () => {
  it('应包含所有必需指标', () => {
    const required = ['pH', 'TDS', 'totalHardness', 'Cl', 'SO4', 'NO3', 'F', 'Fe', 'Mn'];
    for (const ind of required) {
      expect(INDICATOR_META[ind as keyof typeof INDICATOR_META]).toBeDefined();
    }
  });
});

describe('GB_T14848_2017_LIMITS', () => {
  it('pH 限值应正确', () => {
    expect(GB_T14848_2017_LIMITS.pH[0]).toBe(8.5);
    expect(GB_T14848_2017_LIMITS.pH[3]).toBe(9.0);
  });

  it('TDS Ⅲ类限值为1000', () => {
    expect(GB_T14848_2017_LIMITS.TDS[2]).toBe(1000);
  });

  it('各指标限值应有5个', () => {
    for (const [, limits] of Object.entries(GB_T14848_2017_LIMITS)) {
      expect(limits).toHaveLength(5);
    }
  });
});