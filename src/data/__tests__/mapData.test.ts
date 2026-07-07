import { describe, it, expect } from 'vitest';
import {
  mapLayerConfigs,
  mapZones,
  springMarkers,
  geothermalMarkers,
  salineMarkers,
  waterSourceMarkers,
  mineMarkers,
  allMarkers,
  hebeiBoundary,
  cityCenters,
  getMarkersByCategory,
  getVisibleMarkers,
} from '../mapData';

describe('mapData', () => {
  describe('mapLayerConfigs', () => {
    it('应有6个图层配置', () => {
      expect(mapLayerConfigs).toHaveLength(6);
    });

    it('每个配置应包含必要字段', () => {
      for (const cfg of mapLayerConfigs) {
        expect(cfg).toHaveProperty('key');
        expect(cfg).toHaveProperty('label');
        expect(cfg).toHaveProperty('icon');
        expect(cfg).toHaveProperty('color');
        expect(cfg).toHaveProperty('categories');
        expect(cfg.categories).toBeInstanceOf(Array);
        expect(cfg.color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('key应唯一', () => {
      const keys = mapLayerConfigs.map(c => c.key);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });

  describe('mapZones', () => {
    it('应有10个系统区划面', () => {
      expect(mapZones).toHaveLength(10);
    });

    it('每个区划面应包含必要字段', () => {
      for (const zone of mapZones) {
        expect(zone).toHaveProperty('id');
        expect(zone).toHaveProperty('code');
        expect(zone).toHaveProperty('name');
        expect(zone).toHaveProperty('center');
        expect(zone).toHaveProperty('bounds');
        expect(zone).toHaveProperty('color');
        expect(zone).toHaveProperty('fillColor');
        expect(zone).toHaveProperty('info');
        // center应为[lng,lat]格式，纬度在合理范围
        expect(zone.center[0]).toBeGreaterThan(35);
        expect(zone.center[0]).toBeLessThan(43);
        expect(zone.center[1]).toBeGreaterThan(112);
        expect(zone.center[1]).toBeLessThan(121);
        // bounds: [[south, west], [north, east]]
        expect(zone.bounds[0][0]).toBeLessThan(zone.bounds[1][0]); // south < north
        expect(zone.bounds[0][1]).toBeLessThan(zone.bounds[1][1]); // west < east
      }
    });

    it('id应唯一', () => {
      const ids = mapZones.map(z => z.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('code应唯一', () => {
      const codes = mapZones.map(z => z.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  });

  describe('springMarkers', () => {
    it('应有10个泉域标注点', () => {
      expect(springMarkers).toHaveLength(10);
    });

    it('所有泉域category应为spring', () => {
      for (const m of springMarkers) {
        expect(m.category).toBe('spring');
      }
    });

    it('坐标应在河北省范围内', () => {
      for (const m of springMarkers) {
        expect(m.lat).toBeGreaterThan(35);
        expect(m.lat).toBeLessThan(42);
        expect(m.lng).toBeGreaterThan(113);
        expect(m.lng).toBeLessThan(120);
      }
    });
  });

  describe('geothermalMarkers', () => {
    it('应返回8个地热田标注点', () => {
      const markers = geothermalMarkers();
      expect(markers).toHaveLength(8);
    });

    it('所有地热田category应为geothermal', () => {
      const markers = geothermalMarkers();
      for (const m of markers) {
        expect(m.category).toBe('geothermal');
      }
    });

    it('每个地热田应有温度信息', () => {
      const markers = geothermalMarkers();
      for (const m of markers) {
        expect(m.detail).toBeDefined();
      }
    });
  });

  describe('salineMarkers', () => {
    it('应有6个咸水分布标注点', () => {
      expect(salineMarkers).toHaveLength(6);
    });

    it('所有咸水category应为saline', () => {
      for (const m of salineMarkers) {
        expect(m.category).toBe('saline');
      }
    });

    it('每个咸水区应有矿化度信息', () => {
      for (const m of salineMarkers) {
        expect(m.detail).toHaveProperty('矿化度');
      }
    });
  });

  describe('waterSourceMarkers', () => {
    it('应有12个水源地标注点', () => {
      expect(waterSourceMarkers).toHaveLength(12);
    });

    it('所有水源地category应为waterSource', () => {
      for (const m of waterSourceMarkers) {
        expect(m.category).toBe('waterSource');
      }
    });

    it('每个水源地应有城市和类型信息', () => {
      for (const m of waterSourceMarkers) {
        expect(m.detail).toHaveProperty('城市');
        expect(m.detail).toHaveProperty('类型');
        expect(m.detail).toHaveProperty('供水规模');
      }
    });
  });

  describe('mineMarkers', () => {
    it('应有8个矿区标注点', () => {
      expect(mineMarkers).toHaveLength(8);
    });

    it('所有矿区category应为mine', () => {
      for (const m of mineMarkers) {
        expect(m.category).toBe('mine');
      }
    });

    it('矿区类型应仅包含煤矿和铁矿', () => {
      const types = new Set(mineMarkers.map(m => m.type));
      expect([...types].every(t => t === '煤矿' || t === '铁矿')).toBe(true);
    });
  });

  describe('allMarkers', () => {
    it('应返回所有标注点的合集', () => {
      const markers = allMarkers();
      expect(markers.length).toBe(
        springMarkers.length +
        geothermalMarkers().length +
        salineMarkers.length +
        waterSourceMarkers.length +
        mineMarkers.length
      );
    });

    it('id应唯一', () => {
      const markers = allMarkers();
      const ids = markers.map(m => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('所有标注点坐标应在合理范围内', () => {
      const markers = allMarkers();
      for (const m of markers) {
        expect(m.lat).toBeGreaterThan(34);
        expect(m.lat).toBeLessThan(43);
        expect(m.lng).toBeGreaterThan(112);
        expect(m.lng).toBeLessThan(121);
        expect(m.id).toBeTruthy();
        expect(m.name).toBeTruthy();
        expect(m.description).toBeTruthy();
      }
    });
  });

  describe('hebeiBoundary', () => {
    it('应包含至少30个坐标点', () => {
      expect(hebeiBoundary.length).toBeGreaterThanOrEqual(30);
    });

    it('首尾坐标应闭合', () => {
      expect(hebeiBoundary[0]).toEqual(hebeiBoundary[hebeiBoundary.length - 1]);
    });

    it('所有坐标应在河北省合理范围', () => {
      for (const [lat, lng] of hebeiBoundary) {
        expect(lat).toBeGreaterThan(35);
        expect(lat).toBeLessThan(43);
        expect(lng).toBeGreaterThan(112);
        expect(lng).toBeLessThan(121);
      }
    });
  });

  describe('cityCenters', () => {
    it('应有12个城市(含全省)', () => {
      expect(cityCenters).toHaveLength(12);
    });

    it('第一项应为全省概览', () => {
      expect(cityCenters[0].name).toBe('全省');
      expect(cityCenters[0].zoom).toBe(7.5);
    });

    it('每个城市应有name/lat/lng/zoom', () => {
      for (const city of cityCenters) {
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('lat');
        expect(city).toHaveProperty('lng');
        expect(city).toHaveProperty('zoom');
        expect(city.zoom).toBeGreaterThan(0);
      }
    });
  });

  describe('getMarkersByCategory', () => {
    it('返回指定类别的标注点', () => {
      const springs = getMarkersByCategory('spring');
      expect(springs).toHaveLength(springMarkers.length);
      expect(springs.every(m => m.category === 'spring')).toBe(true);
    });

    it('不存在的类别返回空数组', () => {
      const result = getMarkersByCategory('nonexistent');
      expect(result).toHaveLength(0);
    });

    it('每个类别都能正确筛选', () => {
      const categories = ['spring', 'geothermal', 'saline', 'waterSource', 'mine'];
      for (const cat of categories) {
        const result = getMarkersByCategory(cat);
        expect(result.length).toBeGreaterThan(0);
        expect(result.every(m => m.category === cat)).toBe(true);
      }
    });
  });

  describe('getVisibleMarkers', () => {
    it('空Set返回空数组', () => {
      expect(getVisibleMarkers(new Set())).toHaveLength(0);
    });

    it('传入所有类别返回全部标注点', () => {
      const allCategories = new Set(['spring', 'geothermal', 'saline', 'waterSource', 'mine']);
      const visible = getVisibleMarkers(allCategories);
      expect(visible.length).toBe(allMarkers().length);
    });

    it('传入部分类别仅返回对应标注点', () => {
      const visible = getVisibleMarkers(new Set(['spring', 'mine']));
      expect(visible.length).toBe(springMarkers.length + mineMarkers.length);
    });

    it('传入不存在的类别不影响结果', () => {
      const visible = getVisibleMarkers(new Set(['spring', 'nonexistent']));
      expect(visible.length).toBe(springMarkers.length);
    });
  });
});
