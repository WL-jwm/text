/**
 * waterQuality.ts 数据模块单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  waterQuality2024,
  groundwaterQualityStandard,
  waterQualityTrend,
  cityQualityTrend,
  cityGroundwaterQuality2024,
  qualityLevelTrend2020_2024,
} from '../waterQuality';

describe('waterQuality2024', () => {
  it('应包含三类水质考核数据', () => {
    const keys = Object.keys(waterQuality2024);
    expect(keys).toContain('nationalExam');
    expect(keys).toContain('drinkingWater');
    expect(keys).toContain('surfaceWaterQuality');
  });

  it('nationalExam应有考核字段', () => {
    expect(waterQuality2024.nationalExam).toHaveProperty('classVRatio');
    expect(waterQuality2024.nationalExam).toHaveProperty('nationalRequirement');
    expect(waterQuality2024.nationalExam).toHaveProperty('evaluation');
  });

  it('drinkingWater应有水源地字段', () => {
    expect(waterQuality2024.drinkingWater).toHaveProperty('overallCompliance');
    expect(waterQuality2024.drinkingWater).toHaveProperty('totalSources');
  });

  it('surfaceWaterQuality应有水质达标字段', () => {
    expect(waterQuality2024.surfaceWaterQuality).toHaveProperty('classIIIPlus');
    expect(waterQuality2024.surfaceWaterQuality).toHaveProperty('classIIIRatio');
  });

  it('有classVRatio的记录的V类水比例应合理', () => {
    ['nationalExam', 'surfaceWaterQuality'].forEach(key => {
      const entry = waterQuality2024[key];
      if ('classVRatio' in entry) {
        expect(entry.classVRatio).toBeGreaterThanOrEqual(0);
        expect(entry.classVRatio).toBeLessThanOrEqual(100);
      }
    });
  });
});

describe('groundwaterQualityStandard', () => {
  it('应包含标准名称和分类', () => {
    expect(groundwaterQualityStandard).toHaveProperty('standardName');
    expect(groundwaterQualityStandard).toHaveProperty('classes');
    expect(groundwaterQualityStandard).toHaveProperty('evaluationFactors');
  });

  it('类别应为数组形式', () => {
    expect(Array.isArray(groundwaterQualityStandard.classes)).toBe(true);
  });
});

describe('waterQualityTrend', () => {
  it('应包含2014-2024年共11年数据', () => {
    expect(waterQualityTrend.length).toBe(11);
    expect(waterQualityTrend[0].year).toBe(2014);
    expect(waterQualityTrend[10].year).toBe(2024);
  });

  it('每年应有水质等级占比字段', () => {
    waterQualityTrend.forEach(entry => {
      expect(entry).toHaveProperty('I2Percent');
      expect(entry).toHaveProperty('IIIPlusPercent');
      expect(entry).toHaveProperty('IVPercent');
      expect(entry).toHaveProperty('VPercent');
      expect(entry).toHaveProperty('monitoringWells');
    });
  });

  it('各等级占比应在合理范围内', () => {
    waterQualityTrend.forEach(entry => {
      expect(entry.I2Percent).toBeGreaterThanOrEqual(0);
      expect(entry.I2Percent).toBeLessThanOrEqual(100);
      expect(entry.VPercent).toBeGreaterThanOrEqual(0);
      expect(entry.VPercent).toBeLessThanOrEqual(100);
    });
  });
});

describe('cityQualityTrend', () => {
  it('应包含14个城市单元(含辖市/新区)', () => {
    expect(cityQualityTrend.length).toBe(14);
    const cities = cityQualityTrend.map(c => c.city);
    expect(cities).toContain('石家庄');
    expect(cities).toContain('唐山');
  });

  it('每个城市应有2020-2024年达标率', () => {
    cityQualityTrend.forEach(city => {
      expect(city).toHaveProperty('y2020');
      expect(city).toHaveProperty('y2021');
      expect(city).toHaveProperty('y2022');
      expect(city).toHaveProperty('y2023');
      expect(city).toHaveProperty('y2024');
      expect(city).toHaveProperty('improvement');
    });
  });

  it('达标率应在0-100范围内', () => {
    cityQualityTrend.forEach(city => {
      expect(city.y2020).toBeGreaterThanOrEqual(0);
      expect(city.y2020).toBeLessThanOrEqual(100);
      expect(city.y2024).toBeGreaterThanOrEqual(0);
      expect(city.y2024).toBeLessThanOrEqual(100);
    });
  });
});

describe('cityGroundwaterQuality2024', () => {
  it('应包含14个城市单元的监测数据', () => {
    expect(cityGroundwaterQuality2024.length).toBe(14);
  });

  it('每个城市应有达标率和监测井数', () => {
    cityGroundwaterQuality2024.forEach(city => {
      expect(city).toHaveProperty('city');
      expect(city).toHaveProperty('rate');
      expect(city).toHaveProperty('wells');
      expect(city.rate).toBeGreaterThanOrEqual(0);
      expect(city.rate).toBeLessThanOrEqual(100);
    });
  });
});

describe('qualityLevelTrend2020_2024', () => {
  it('应包含2020-2024年共5年数据', () => {
    expect(qualityLevelTrend2020_2024.length).toBe(5);
  });

  it('每年应有水质级别分布数据', () => {
    qualityLevelTrend2020_2024.forEach(entry => {
      expect(entry).toHaveProperty('year');
      expect(entry).toHaveProperty('I2');
      expect(entry).toHaveProperty('III');
      expect(entry).toHaveProperty('IV');
      expect(entry).toHaveProperty('V');
      expect(entry).toHaveProperty('IIIplus');
    });
  });

  it('各类占比应在0-100之间', () => {
    qualityLevelTrend2020_2024.forEach(entry => {
      expect(entry.I2).toBeGreaterThanOrEqual(0);
      expect(entry.I2).toBeLessThanOrEqual(100);
      expect(entry.V).toBeGreaterThanOrEqual(0);
      expect(entry.V).toBeLessThanOrEqual(100);
    });
  });
});
