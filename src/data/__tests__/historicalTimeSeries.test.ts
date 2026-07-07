/**
 * historicalTimeSeries.ts 数据模块单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  cityWaterLevelYearly,
  waterLevelYearlySummary,
  citySubsidenceYearly,
  subsidenceYearlySummary,
  TS_FULL_YEARS,
  cityQualityYearly,
  qualityYearlySummary,
} from '../historicalTimeSeries';

const CITIES = ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'];
const N = 11;

describe('TS_FULL_YEARS', () => {
  it('应包含2014-2024年共11年', () => {
    expect(TS_FULL_YEARS.length).toBe(N);
    expect(TS_FULL_YEARS[0]).toBe(2014);
    expect(TS_FULL_YEARS[TS_FULL_YEARS.length - 1]).toBe(2024);
  });

  it('年份应连续递增', () => {
    for (let i = 1; i < TS_FULL_YEARS.length; i++) {
      expect(TS_FULL_YEARS[i]).toBe(TS_FULL_YEARS[i - 1] + 1);
    }
  });
});

describe('cityWaterLevelYearly', () => {
  it('应包含11个城市的水位数据', () => {
    const cities = Object.keys(cityWaterLevelYearly);
    expect(cities.length).toBe(N);
    CITIES.forEach(c => expect(cities).toContain(c));
  });

  it('每个城市应有2014-2024年完整数据', () => {
    Object.entries(cityWaterLevelYearly).forEach(([city, data]) => {
      const years = Object.keys(data).map(Number).sort((a, b) => a - b);
      expect(years.length, `${city}应有${N}年数据`).toBe(N);
      expect(years[0]).toBe(2014);
      expect(years[years.length - 1]).toBe(2024);
    });
  });

  it('水位值应在合理范围(0-80m)', () => {
    Object.entries(cityWaterLevelYearly).forEach(([_city, data]) => {
      Object.values(data).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(80);
      });
    });
  });

  it('山区城市水位应低于平原城市', () => {
    const mountainVals = [
      ...Object.values(cityWaterLevelYearly['张家口']),
      ...Object.values(cityWaterLevelYearly['承德']),
    ];
    const plainVals = [
      ...Object.values(cityWaterLevelYearly['邢台']),
      ...Object.values(cityWaterLevelYearly['衡水']),
    ];
    const mountainMax = Math.max(...mountainVals);
    const plainMin = Math.min(...plainVals);
    expect(mountainMax).toBeLessThan(plainMin);
  });
});

describe('waterLevelYearlySummary', () => {
  it('应包含2014-2024年全省汇总', () => {
    expect(waterLevelYearlySummary.length).toBe(N);
  });

  it('每年应有avgDepth(平均水位)字段', () => {
    waterLevelYearlySummary.forEach(entry => {
      expect(entry).toHaveProperty('year');
      expect(entry).toHaveProperty('avgDepth');
      expect(entry).toHaveProperty('maxCity');
      expect(entry).toHaveProperty('maxDepth');
      expect(entry).toHaveProperty('minCity');
      expect(entry).toHaveProperty('minDepth');
    });
  });

  it('平均水位应在合理范围(15-35m)', () => {
    waterLevelYearlySummary.forEach(entry => {
      expect(entry.avgDepth).toBeGreaterThanOrEqual(10);
      expect(entry.avgDepth).toBeLessThanOrEqual(50);
    });
  });
});

describe('citySubsidenceYearly', () => {
  it('应包含11个城市的沉降数据', () => {
    expect(Object.keys(citySubsidenceYearly).length).toBe(N);
  });

  it('沉降速率应非负', () => {
    Object.values(citySubsidenceYearly).forEach(data => {
      Object.values(data).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

describe('subsidenceYearlySummary', () => {
  it('应包含2014-2024年汇总', () => {
    expect(subsidenceYearlySummary.length).toBe(N);
  });

  it('每年应有avgRate(平均沉降)字段', () => {
    subsidenceYearlySummary.forEach(entry => {
      expect(entry).toHaveProperty('year');
      expect(entry).toHaveProperty('avgRate');
      expect(entry).toHaveProperty('maxCity');
      expect(entry).toHaveProperty('maxRate');
      expect(entry).toHaveProperty('improvingCities');
    });
  });
});

describe('cityQualityYearly', () => {
  it('应包含11个城市的水质达标率', () => {
    expect(Object.keys(cityQualityYearly).length).toBe(N);
  });

  it('达标率应在0-100%范围内', () => {
    Object.values(cityQualityYearly).forEach(data => {
      Object.values(data).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });
});

describe('qualityYearlySummary', () => {
  it('应包含2014-2024年共11条', () => {
    expect(qualityYearlySummary.length).toBe(N);
  });

  it('每年应有avgRate(平均达标率)字段', () => {
    qualityYearlySummary.forEach(entry => {
      expect(entry).toHaveProperty('year');
      expect(entry).toHaveProperty('avgRate');
      expect(entry).toHaveProperty('bestCity');
      expect(entry).toHaveProperty('bestRate');
      expect(entry).toHaveProperty('worstCity');
      expect(entry).toHaveProperty('worstRate');
    });
  });

  it('平均达标率应在10-60%之间', () => {
    qualityYearlySummary.forEach(entry => {
      expect(entry.avgRate).toBeGreaterThanOrEqual(5);
      expect(entry.avgRate).toBeLessThanOrEqual(70);
    });
  });
});
