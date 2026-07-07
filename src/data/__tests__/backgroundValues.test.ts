import { describe, it, expect } from 'vitest';
import {
  groundwaterBackground,
  cityExceedanceFactors,
  waterQualityStandard,
} from '../backgroundValues';

describe('backgroundValues', () => {
  describe('groundwaterBackground', () => {
    it('应包含summary/dataSource/shallow/deep', () => {
      expect(groundwaterBackground).toHaveProperty('summary');
      expect(groundwaterBackground).toHaveProperty('dataSource');
      expect(groundwaterBackground).toHaveProperty('shallow');
      expect(groundwaterBackground).toHaveProperty('deep');
    });

    it('浅层应有3个水文地质分区', () => {
      expect(groundwaterBackground.shallow).toHaveLength(3);
      const zones = groundwaterBackground.shallow.map(z => z.zone);
      expect(zones).toEqual(['山前平原', '中部平原', '滨海平原']);
    });

    it('深层应有3个分区', () => {
      expect(groundwaterBackground.deep).toHaveLength(3);
    });

    it('浅层每个分区应包含核心指标', () => {
      const coreKeys = ['zone', 'cities', 'pH', 'TDS', 'totalHardness', 'Cl', 'SO4', 'HCO3', 'Na', 'Ca', 'Mg', 'F', 'waterType', 'note'];
      for (const z of groundwaterBackground.shallow) {
        for (const key of coreKeys) {
          expect(z).toHaveProperty(key);
        }
      }
    });

    it('从山前到滨海TDS应递增', () => {
      const zones = groundwaterBackground.shallow;
      const parseRange = (s: string) => {
        const parts = s.split('~');
        return parseFloat(parts[0]);
      };
      expect(parseRange(zones[1].TDS)).toBeGreaterThan(parseRange(zones[0].TDS));
      expect(parseRange(zones[2].TDS)).toBeGreaterThan(parseRange(zones[1].TDS));
    });

    it('深层水Na应高于浅层(平原区)', () => {
      // 中部平原深层Na > 浅层Na
      const shallowCenter = groundwaterBackground.shallow.find(z => z.zone === '中部平原');
      const deepCenter = groundwaterBackground.deep.find(z => z.zone === '中部平原深层');
      expect(shallowCenter).toBeDefined();
      expect(deepCenter).toBeDefined();
      const parseRange = (s: string) => parseFloat(s.split('~')[0]);
      expect(parseRange(deepCenter!.Na)).toBeGreaterThan(parseRange(shallowCenter!.Na));
    });
  });

  describe('cityExceedanceFactors', () => {
    it('应有11个城市', () => {
      expect(cityExceedanceFactors).toHaveLength(11);
    });

    it('每个城市应有city/shallow/deep/note', () => {
      for (const c of cityExceedanceFactors) {
        expect(c).toHaveProperty('city');
        expect(c).toHaveProperty('shallow');
        expect(c).toHaveProperty('deep');
        expect(c).toHaveProperty('note');
        expect(c.shallow).toBeTruthy();
        expect(c.note).toBeTruthy();
      }
    });

    it('应包含河北省11个地级市', () => {
      const cities = new Set(cityExceedanceFactors.map(c => c.city));
      expect(cities.has('石家庄')).toBe(true);
      expect(cities.has('唐山')).toBe(true);
      expect(cities.has('保定')).toBe(true);
      expect(cities.has('邯郸')).toBe(true);
      expect(cities.has('沧州')).toBe(true);
    });
  });

  describe('waterQualityStandard', () => {
    it('应引用GB/T 14848-2017标准', () => {
      expect(waterQualityStandard.standard).toBe('GB/T 14848-2017');
    });

    it('应有5个类别', () => {
      expect(waterQualityStandard.classes).toHaveLength(5);
    });

    it('每个类别应有class和description', () => {
      for (const c of waterQualityStandard.classes) {
        expect(c).toHaveProperty('class');
        expect(c).toHaveProperty('description');
      }
    });

    it('应有至少10个指标', () => {
      expect(waterQualityStandard.indicators.length).toBeGreaterThanOrEqual(10);
    });

    it('每个指标应有name/III/V/unit', () => {
      for (const i of waterQualityStandard.indicators) {
        expect(i).toHaveProperty('name');
        expect(i).toHaveProperty('III');
        expect(i).toHaveProperty('V');
        expect(i).toHaveProperty('unit');
      }
    });

    it('应包含常见指标', () => {
      const names = waterQualityStandard.indicators.map(i => i.name);
      expect(names).toContain('pH');
      expect(names).toContain('总硬度(CaCO₃)');
      expect(names).toContain('TDS');
      expect(names).toContain('氟化物');
      expect(names).toContain('砷');
    });
  });
});
