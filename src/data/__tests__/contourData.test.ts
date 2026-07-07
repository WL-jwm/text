/**
 * contourData.ts 等值线数据模块单元测试
 * 覆盖：数据集结构、历史数据函数、数据点完整性
 */
import { describe, it, expect } from 'vitest';
import {
  waterLevelContour,
  waterQualityContour,
  geothermalContour,
  contourDatasets,
  getContourDataset,
  CONTOUR_YEARS,
  getHistoricalContourDataset,
  getAllContourDatasetsWithHistory,
} from '../contourData';

describe('基础等值线数据集', () => {
  it('waterLevelContour应包含13个数据点', () => {
    expect(waterLevelContour.points.length).toBe(13);
  });

  it('每个数据点应有city、lng、lat、value属性', () => {
    waterLevelContour.points.forEach(point => {
      expect(point).toHaveProperty('city');
      expect(point).toHaveProperty('lng');
      expect(point).toHaveProperty('lat');
      expect(point).toHaveProperty('value');
      expect(typeof point.lng).toBe('number');
      expect(typeof point.lat).toBe('number');
      expect(typeof point.value).toBe('number');
    });
  });

  it('waterLevelContour的水位值应在1-50m范围内', () => {
    waterLevelContour.points.forEach(point => {
      expect(point.value).toBeGreaterThanOrEqual(1);
      expect(point.value).toBeLessThanOrEqual(50);
    });
  });

  it('waterQualityContour的水质指数应在1-5范围内', () => {
    waterQualityContour.points.forEach(point => {
      expect(point.value).toBeGreaterThanOrEqual(1);
      expect(point.value).toBeLessThanOrEqual(5);
    });
  });

  it('geothermalContour应包含地温梯度数据', () => {
    expect(geothermalContour.points.length).toBeGreaterThanOrEqual(8);
    geothermalContour.points.forEach(point => {
      expect(point.value).toBeGreaterThanOrEqual(1);
      expect(point.value).toBeLessThanOrEqual(6);
    });
  });

  it('每个数据集应有key、label、unit、colorScheme', () => {
    [waterLevelContour, waterQualityContour, geothermalContour].forEach(ds => {
      expect(ds).toHaveProperty('key');
      expect(ds).toHaveProperty('label');
      expect(ds).toHaveProperty('unit');
      expect(ds).toHaveProperty('colorScheme');
      expect(ds).toHaveProperty('minVal');
      expect(ds).toHaveProperty('maxVal');
    });
  });
});

describe('contourDatasets', () => {
  it('应包含3个基础数据集', () => {
    expect(contourDatasets.length).toBe(3);
  });
});

describe('getContourDataset', () => {
  it('应能按key获取已有数据集', () => {
    const result = getContourDataset('waterLevel');
    expect(result).toBeDefined();
    expect(result!.key).toBe('waterLevel');
  });

  it('不存在的key应返回undefined', () => {
    expect(getContourDataset('nonexistent')).toBeUndefined();
  });
});

describe('CONTOUR_YEARS', () => {
  it('应包含2015-2024年共10年', () => {
    expect(CONTOUR_YEARS.length).toBe(10);
    expect(CONTOUR_YEARS[0]).toBe(2015);
    expect(CONTOUR_YEARS[CONTOUR_YEARS.length - 1]).toBe(2024);
  });
});

describe('getHistoricalContourDataset', () => {
  it('应能生成2015年水位数据集', () => {
    const ds = getHistoricalContourDataset(2015, 'waterLevel');
    expect(ds).toBeDefined();
    expect(ds!.label).toContain('2015');
    expect(ds!.points.length).toBe(11);
  });

  it('应能生成2024年水质数据集', () => {
    const ds = getHistoricalContourDataset(2024, 'waterQuality');
    expect(ds).toBeDefined();
    expect(ds!.label).toContain('2024');
    expect(ds!.points.length).toBe(11);
  });

  it('未知年份应返回undefined', () => {
    expect(getHistoricalContourDataset(1990, 'waterLevel')).toBeUndefined();
  });

  it('所有数据点应有有效坐标和值', () => {
    for (const year of CONTOUR_YEARS) {
      const ds = getHistoricalContourDataset(year, 'waterLevel');
      expect(ds, `${year}年应有数据`).toBeDefined();
      ds!.points.forEach(point => {
        expect(point.lng).toBeGreaterThan(110);
        expect(point.lng).toBeLessThan(125);
        expect(point.lat).toBeGreaterThan(35);
        expect(point.lat).toBeLessThan(43);
        expect(point.value).toBeGreaterThan(0);
      });
    }
  });
});

describe('getAllContourDatasetsWithHistory', () => {
  it('应包含基础数据集+历史数据集', () => {
    const all = getAllContourDatasetsWithHistory();
        expect(all.length).toBe(23);
  });

  it('所有数据集的key应唯一', () => {
    const all = getAllContourDatasetsWithHistory();
    const keys = all.map(d => d.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});
