/**
 * zoneParams.ts 地下水系统分区参数单元测试
 * 覆盖：systemZones / subZones / plainZones / zoneColors 数据完整性
 */
import { describe, it, expect } from 'vitest';
import {
  systemZones,
  subZones,
  plainZones,
  zoneColors,
  type ZoneParam,
} from '../zoneParams';

describe('systemZones — 10个一级系统区', () => {
  it('应包含10个系统区', () => {
    expect(systemZones.length).toBe(10);
  });

  it('所有系统区level应为"系统区"', () => {
    systemZones.forEach(z => {
      expect(z.level).toBe('系统区');
    });
  });

  it('所有系统区parent应为"-"', () => {
    systemZones.forEach(z => {
      expect(z.parent).toBe('-');
    });
  });

  it('code应从I到X（罗马数字）', () => {
    const expectedCodes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const actualCodes = systemZones.map(z => z.code);
    expect(actualCodes).toEqual(expectedCodes);
  });

  it('每个系统区应有name和code', () => {
    systemZones.forEach(z => {
      expect(z.name).toBeTruthy();
      expect(z.code).toBeTruthy();
    });
  });

  it('area应为正数（km²）', () => {
    systemZones.forEach(z => {
      if (z.area !== null) {
        expect(z.area).toBeGreaterThan(0);
      }
    });
  });

  it('areaPercent总和应接近100%', () => {
    const total = systemZones.reduce((s, z) => s + (z.areaPercent ?? 0), 0);
    expect(total).toBeCloseTo(100, 0); // 整数精度
  });

  it('所有系统区应包含ZoneParam接口全部属性', () => {
    const requiredKeys: (keyof ZoneParam)[] = [
      'code', 'name', 'level', 'parent', 'area', 'areaPercent',
      'alpha', 'T', 'q', 'aquiferThickness', 'waterLevel', 'runoffModulus',
    ];
    systemZones.forEach(z => {
      requiredKeys.forEach(k => {
        expect(z).toHaveProperty(k);
      });
    });
  });
});

describe('subZones — 子区/小区参数', () => {
  it('应包含至少20个子区', () => {
    expect(subZones.length).toBeGreaterThanOrEqual(20);
  });

  it('level应仅为"子区"或"小区"', () => {
    subZones.forEach(z => {
      expect(['子区', '小区']).toContain(z.level);
    });
  });

  it('parent应指向已有的系统区code', () => {
    const systemCodes = new Set(systemZones.map(z => z.code));
    subZones.forEach(z => {
      expect(systemCodes.has(z.parent)).toBe(true);
    });
  });

  it('code不应与systemZones重复', () => {
    const systemCodes = new Set(systemZones.map(z => z.code));
    subZones.forEach(z => {
      expect(systemCodes.has(z.code)).toBe(false);
    });
  });

  it('所有code应唯一', () => {
    const codes = subZones.map(z => z.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('plainZones — 河北平原四分区', () => {
  it('应包含4个分区', () => {
    expect(plainZones.length).toBe(4);
  });

  const zoneNames = ['山前冲洪积扇', '冲洪积扇前缘', '中部平原', '滨海平原'];
  zoneNames.forEach((name, i) => {
    it(`分区${i + 1}应为"${name}"`, () => {
      expect(plainZones[i].name).toBe(name);
    });
  });

  it('每个分区应有location/aquifer/T/q/mu/alpha/salinity/depth/feature', () => {
    const requiredKeys = ['location', 'aquifer', 'T', 'q', 'mu', 'alpha', 'salinity', 'depth', 'feature'];
    plainZones.forEach(z => {
      requiredKeys.forEach(k => {
        expect(z).toHaveProperty(k);
      });
    });
  });

  it('T值应按"山前>前缘>中部>滨海"递减', () => {
    // 提取T中数值（取上限）
    const parseT = (t: string) => {
      const match = t.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    for (let i = 1; i < plainZones.length; i++) {
      expect(parseT(plainZones[i - 1].T)).toBeGreaterThanOrEqual(parseT(plainZones[i].T));
    }
  });
});

describe('zoneColors — 分区颜色映射', () => {
  it('应包含10个系统区的颜色', () => {
    expect(Object.keys(zoneColors).length).toBe(10);
  });

  it('每个颜色应为有效hex格式', () => {
    Object.values(zoneColors).forEach(color => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('应覆盖所有系统区code', () => {
    systemZones.forEach(z => {
      expect(zoneColors).toHaveProperty(z.code);
    });
  });
});
