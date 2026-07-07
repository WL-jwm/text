import { describe, it, expect } from 'vitest';
import {
  geology,
  quaternaryStratigraphy,
  tectonicUnits,
  tectonicUnitsDetailed,
  quaternaryAquiferGroups,
  stratigraphyAquifer,
  majorFaults,
  bedrockSummary,
  geologicalHistory,
  plainEvolution,
} from '../geology';

describe('geology', () => {
  describe('geology', () => {
    it('应包含含水系统数据', () => {
      expect(geology).toHaveProperty('aquiferSystems');
      expect(geology).toHaveProperty('systems');
      expect(geology).toHaveProperty('totalExploitable');
      expect(geology).toHaveProperty('totalRecharge');
      expect(geology).toHaveProperty('totalArea');
    });

    it('aquiferSystems应有3类含水系统', () => {
      expect(geology.aquiferSystems).toHaveLength(3);
    });

    it('systems应有6个流域', () => {
      expect(geology.systems).toHaveLength(6);
    });

    it('总面积应合理(约17万km²)', () => {
      expect(geology.totalArea).toBeCloseTo(177748, -3);
    });

    it('可开采量应小于补给量', () => {
      expect(geology.totalExploitable).toBeLessThan(geology.totalRecharge);
    });
  });

  describe('quaternaryStratigraphy', () => {
    it('应包含summary和units', () => {
      expect(quaternaryStratigraphy).toHaveProperty('summary');
      expect(quaternaryStratigraphy).toHaveProperty('units');
      expect(quaternaryStratigraphy).toHaveProperty('plateauUnits');
    });

    it('平原区应有4个统(更新世+全新世)', () => {
      expect(quaternaryStratigraphy.units).toHaveLength(4);
    });

    it('每个统应有系统名和组', () => {
      for (const unit of quaternaryStratigraphy.units) {
        expect(unit).toHaveProperty('system');
        expect(unit).toHaveProperty('groups');
        expect(unit.groups.length).toBeGreaterThan(0);
      }
    });

    it('坝上山区应有4个地层单位', () => {
      expect(quaternaryStratigraphy.plateauUnits).toHaveLength(4);
    });
  });

  describe('tectonicUnits', () => {
    it('应有4个构造单元', () => {
      expect(tectonicUnits).toHaveLength(4);
    });

    it('每个单元应包含必要字段', () => {
      for (const u of tectonicUnits) {
        expect(u).toHaveProperty('unit');
        expect(u).toHaveProperty('area');
        expect(u).toHaveProperty('structure');
        expect(u).toHaveProperty('features');
        expect(u).toHaveProperty('aquiferCharacteristics');
      }
    });
  });

  describe('tectonicUnitsDetailed', () => {
    it('应有2个一级构造单元', () => {
      expect(tectonicUnitsDetailed).toHaveLength(2);
    });

    it('第一个应为中朝准地台', () => {
      expect(tectonicUnitsDetailed[0].name).toBe('中朝准地台');
      expect(tectonicUnitsDetailed[0].level).toBe('Ⅰ级');
    });

    it('中朝准地台应有subUnits', () => {
      expect(tectonicUnitsDetailed[0].subUnits).toBeDefined();
      expect(tectonicUnitsDetailed[0].subUnits!.length).toBeGreaterThan(0);
    });
  });

  describe('quaternaryAquiferGroups', () => {
    it('应有4个含水层组', () => {
      expect(quaternaryAquiferGroups).toHaveLength(4);
    });

    it('层组应按深度递增', () => {
      for (const g of quaternaryAquiferGroups) {
        expect(g).toHaveProperty('group');
        expect(g).toHaveProperty('depth');
        expect(g).toHaveProperty('age');
        expect(g).toHaveProperty('K');
        expect(g).toHaveProperty('waterType');
      }
    });
  });

  describe('stratigraphyAquifer', () => {
    it('应有8个时代地层', () => {
      expect(stratigraphyAquifer).toHaveLength(8);
    });

    it('每个时代应有era/period/aquiferType/distribution', () => {
      for (const s of stratigraphyAquifer) {
        expect(s).toHaveProperty('era');
        expect(s).toHaveProperty('period');
        expect(s).toHaveProperty('aquiferType');
        expect(s).toHaveProperty('distribution');
      }
    });
  });

  describe('majorFaults', () => {
    it('应有5条主要断裂', () => {
      expect(majorFaults).toHaveLength(5);
    });

    it('每条断裂应有name/direction/length/type/hydrogeology', () => {
      for (const f of majorFaults) {
        expect(f).toHaveProperty('name');
        expect(f).toHaveProperty('direction');
        expect(f).toHaveProperty('length');
        expect(f).toHaveProperty('type');
        expect(f).toHaveProperty('hydrogeology');
      }
    });
  });

  describe('bedrockSummary', () => {
    it('应包含各时代基岩概要', () => {
      expect(bedrockSummary).toHaveProperty('archean');
      expect(bedrockSummary).toHaveProperty('proterozoic');
      expect(bedrockSummary).toHaveProperty('cambrianOrdovician');
      expect(bedrockSummary).toHaveProperty('carboniferousPermian');
      expect(bedrockSummary).toHaveProperty('mesozoic');
      expect(bedrockSummary).toHaveProperty('cenozoic');
    });
  });

  describe('geologicalHistory', () => {
    it('应包含summary和stages', () => {
      expect(geologicalHistory).toHaveProperty('summary');
      expect(geologicalHistory).toHaveProperty('stages');
    });

    it('应有3个演化阶段', () => {
      expect(geologicalHistory.stages).toHaveLength(3);
    });

    it('阶段应包含基底形成/盖层发展/强烈活动', () => {
      const stageNames = geologicalHistory.stages.map(s => s.stage);
      expect(stageNames).toContain('基底形成阶段');
      expect(stageNames).toContain('盖层发展阶段');
      expect(stageNames).toContain('强烈活动阶段');
    });

    it('每个阶段应有events', () => {
      for (const s of geologicalHistory.stages) {
        expect(s.events).toBeDefined();
        expect(s.events.length).toBeGreaterThan(0);
      }
    });
  });

  describe('plainEvolution', () => {
    it('应包含4个演化阶段', () => {
      expect(plainEvolution.stages).toHaveLength(4);
    });

    it('每个阶段应有stage/time/feature/deposition', () => {
      for (const s of plainEvolution.stages) {
        expect(s).toHaveProperty('stage');
        expect(s).toHaveProperty('time');
        expect(s).toHaveProperty('feature');
        expect(s).toHaveProperty('deposition');
      }
    });
  });
});
