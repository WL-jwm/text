import { describe, it, expect } from 'vitest';
import {
  dataSourceRegistry,
  getSourceByModule,
  getSourcesByCategory,
  getSourceStats,
} from '../dataSourceRegistry';

describe('dataSourceRegistry', () => {
  describe('dataSourceRegistry', () => {
    it('应有至少25个数据源', () => {
      expect(dataSourceRegistry.length).toBeGreaterThanOrEqual(25);
    });

    it('每个条目应包含必要字段', () => {
      for (const entry of dataSourceRegistry) {
        expect(entry).toHaveProperty('module');
        expect(entry).toHaveProperty('category');
        expect(entry).toHaveProperty('source');
        expect(entry).toHaveProperty('dataYears');
        expect(entry).toHaveProperty('updateFrequency');
        expect(entry).toHaveProperty('reliability');
      }
    });

    it('module应唯一', () => {
      const modules = dataSourceRegistry.map(e => e.module);
      expect(new Set(modules).size).toBe(modules.length);
    });

    it('reliability应为高/中/低之一', () => {
      const validReliabilities = ['高', '中', '低'];
      for (const entry of dataSourceRegistry) {
        expect(validReliabilities).toContain(entry.reliability);
      }
    });

    it('应包含核心模块的注册', () => {
      const modules = dataSourceRegistry.map(e => e.module);
      expect(modules).toContain('resources');
      expect(modules).toContain('waterQuality');
      expect(modules).toContain('geology');
      expect(modules).toContain('hydroParams');
      expect(modules).toContain('mapData');
    });
  });

  describe('getSourceByModule', () => {
    it('已知模块应返回条目', () => {
      const result = getSourceByModule('geology');
      expect(result).toBeDefined();
      expect(result!.module).toBe('geology');
      expect(result!.category).toBe('A-基础地质');
    });

    it('未知模块应返回undefined', () => {
      const result = getSourceByModule('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getSourcesByCategory', () => {
    it('按类别筛选应返回正确数量', () => {
      // Test with a known category
      const geo = getSourcesByCategory('A-基础地质');
      expect(geo.length).toBeGreaterThanOrEqual(1);
      expect(geo.every(e => e.category === 'A-基础地质')).toBe(true);
    });

    it('不存在的类别返回空数组', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getSourcesByCategory('Z-未知' as any);
      expect(result).toHaveLength(0);
    });
  });

  describe('getSourceStats', () => {
    it('应返回统计信息', () => {
      const stats = getSourceStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byUpdateFrequency');
      expect(stats).toHaveProperty('byReliability');
    });

    it('total应与注册表长度一致', () => {
      const stats = getSourceStats();
      expect(stats.total).toBe(dataSourceRegistry.length);
    });

    it('各频率之和应等于total', () => {
      const stats = getSourceStats();
      const sum = Object.values(stats.byUpdateFrequency).reduce((a, b) => a + b, 0);
      expect(sum).toBe(stats.total);
    });

    it('可靠度之和应等于total', () => {
      const stats = getSourceStats();
      const sum = Object.values(stats.byReliability).reduce((a, b) => a + b, 0);
      expect(sum).toBe(stats.total);
    });
  });
});
