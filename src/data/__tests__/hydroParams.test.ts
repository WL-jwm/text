import { describe, it, expect } from 'vitest';
import {
  aquiferGroups,
  lithologyMu,
  infiltrationCoeff,
  permeability,
  karstParams,
  fractureParams,
  storageCoeff,
  dispersivity,
  stationInfiltration,
  lithInfiltration,
} from '../hydroParams';

describe('hydroParams', () => {
  describe('aquiferGroups', () => {
    it('应有4个含水层组', () => {
      expect(aquiferGroups).toHaveLength(4);
    });

    it('每组应包含必要字段', () => {
      for (const g of aquiferGroups) {
        expect(g).toHaveProperty('group');
        expect(g).toHaveProperty('era');
        expect(g).toHaveProperty('property');
        expect(g).toHaveProperty('depth');
        expect(g).toHaveProperty('lithology');
        expect(g).toHaveProperty('K');
        expect(g).toHaveProperty('T');
        expect(g).toHaveProperty('mu');
        expect(g).toHaveProperty('salinity');
        expect(g).toHaveProperty('note');
      }
    });

    it('层组应按深度递增', () => {
      const depths = aquiferGroups.map(g => {
        const parts = g.depth.split('~');
        return parseFloat(parts[0]);
      });
      for (let i = 1; i < depths.length; i++) {
        expect(depths[i]).toBeGreaterThan(depths[i - 1]);
      }
    });
  });

  describe('lithologyMu', () => {
    it('应有7种岩性参数', () => {
      expect(lithologyMu).toHaveLength(7);
    });

    it('应包含粘性土、砂性土和碎屑岩类', () => {
      const categories = new Set(lithologyMu.map(l => l.category));
      expect(categories.has('粘性土')).toBe(true);
      expect(categories.has('砂性土')).toBe(true);
      expect(categories.has('碎屑岩类')).toBe(true);
    });

    it('每种岩性应有mu/K/ne/source', () => {
      for (const l of lithologyMu) {
        expect(l).toHaveProperty('lithology');
        expect(l).toHaveProperty('mu');
        expect(l).toHaveProperty('K');
        expect(l).toHaveProperty('ne');
        expect(l).toHaveProperty('source');
      }
    });
  });

  describe('infiltrationCoeff', () => {
    it('应有5种岩性入渗系数', () => {
      expect(infiltrationCoeff).toHaveLength(5);
    });

    it('每种岩性应有plain/basin/mountain/optDepth', () => {
      for (const i of infiltrationCoeff) {
        expect(i).toHaveProperty('plain');
        expect(i).toHaveProperty('basin');
        expect(i).toHaveProperty('mountain');
        expect(i).toHaveProperty('optDepth');
      }
    });
  });

  describe('permeability', () => {
    it('应有9种渗透系数参数', () => {
      expect(permeability).toHaveLength(9);
    });

    it('每种岩性应有Kh/Kv/ratio', () => {
      for (const p of permeability) {
        expect(p).toHaveProperty('Kh');
        expect(p).toHaveProperty('Kv');
        expect(p).toHaveProperty('ratio');
      }
    });
  });

  describe('karstParams', () => {
    it('应有4种岩溶类型', () => {
      expect(karstParams).toHaveLength(4);
    });

    it('每种应包含K/T/mu/area', () => {
      for (const k of karstParams) {
        expect(k).toHaveProperty('type');
        expect(k).toHaveProperty('K');
        expect(k).toHaveProperty('T');
        expect(k).toHaveProperty('mu');
        expect(k).toHaveProperty('area');
      }
    });
  });

  describe('fractureParams', () => {
    it('应有4种裂隙介质参数', () => {
      expect(fractureParams).toHaveLength(4);
    });

    it('每种应包含type/lithology/K/springFlow/modulus', () => {
      for (const f of fractureParams) {
        expect(f).toHaveProperty('type');
        expect(f).toHaveProperty('lithology');
        expect(f).toHaveProperty('K');
        expect(f).toHaveProperty('springFlow');
        expect(f).toHaveProperty('modulus');
      }
    });
  });

  describe('storageCoeff', () => {
    it('应有5个释水系数', () => {
      expect(storageCoeff).toHaveLength(5);
    });

    it('应按时代排列', () => {
      const eras = storageCoeff.map(s => s.era);
      expect(eras).toEqual([
        'Q3(第一含水层组)',
        'Q2(第二含水层组)',
        'Q1(第三含水层组)',
        'N2(第四含水层组)',
        'N1(明化镇组下段)',
      ]);
    });
  });

  describe('dispersivity', () => {
    it('应有5种介质弥散度参数', () => {
      expect(dispersivity).toHaveLength(5);
    });

    it('每种应包含medium/aL/aT', () => {
      for (const d of dispersivity) {
        expect(d).toHaveProperty('medium');
        expect(d).toHaveProperty('aL');
        expect(d).toHaveProperty('aT');
      }
    });
  });

  describe('stationInfiltration', () => {
    it('应有15个水文站入渗系数', () => {
      expect(stationInfiltration).toHaveLength(15);
    });

    it('每个站应有id/station/area/lithology/alpha', () => {
      for (const s of stationInfiltration) {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('station');
        expect(s).toHaveProperty('area');
        expect(s).toHaveProperty('lithology');
        expect(s).toHaveProperty('alpha');
      }
    });

    it('alpha应为数值', () => {
      for (const s of stationInfiltration) {
        expect(parseFloat(s.alpha)).not.toBeNaN();
      }
    });

    it('id应唯一递增', () => {
      const ids = stationInfiltration.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i]).toBeGreaterThan(ids[i - 1]);
      }
    });
  });

  describe('lithInfiltration', () => {
    it('应有20条岩性入渗系数', () => {
      expect(lithInfiltration).toHaveLength(20);
    });

    it('每条应包含lithology/basin/area/modulus/P/alpha', () => {
      for (const l of lithInfiltration) {
        expect(l).toHaveProperty('lithology');
        expect(l).toHaveProperty('basin');
        expect(l).toHaveProperty('area');
        expect(l).toHaveProperty('modulus');
        expect(l).toHaveProperty('P');
        expect(l).toHaveProperty('alpha');
      }
    });

    it('应覆盖多种岩性类型', () => {
      const liths = new Set(lithInfiltration.map(l => l.lithology));
      expect(liths.has('碳酸盐岩')).toBe(true);
      expect(liths.has('岩浆岩和变质岩')).toBe(true);
      expect(liths.has('碎屑岩')).toBe(true);
    });
  });
});
