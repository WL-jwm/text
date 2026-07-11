/**
 * standards.ts 评价标准注册表单元测试
 * 覆盖：6个标准注册表 / getCurrentStandard / getStandardVersion / getStandardsStats
 */
import { describe, it, expect } from 'vitest';
import {
  groundwaterQualityStandards,
  surfaceWaterQualityStandards,
  drinkingWaterStandards,
  soilQualityStandards,
  wastewaterStandards,
  overExploitationStandards,
  getCurrentStandard,
  getStandardVersion,
  getStandardsStats,
  type StandardRegistry,
} from '../standards';

const allRegistries: StandardRegistry[] = [
  groundwaterQualityStandards,
  surfaceWaterQualityStandards,
  drinkingWaterStandards,
  soilQualityStandards,
  wastewaterStandards,
  overExploitationStandards,
];

describe('标准注册表完整性', () => {
  it('应包含6个标准注册表', () => {
    expect(allRegistries.length).toBe(6);
  });

  it('每个注册表应有category/code/currentVersion/versions', () => {
    allRegistries.forEach(reg => {
      expect(reg).toHaveProperty('category');
      expect(reg).toHaveProperty('code');
      expect(reg).toHaveProperty('currentVersion');
      expect(reg).toHaveProperty('versions');
      expect(reg.versions.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('每个注册表的currentVersion应在versions中存在', () => {
    allRegistries.forEach(reg => {
      const versionIds = reg.versions.map(v => v.id);
      expect(versionIds).toContain(reg.currentVersion);
    });
  });

  it('category应唯一', () => {
    const categories = allRegistries.map(r => r.category);
    expect(new Set(categories).size).toBe(categories.length);
  });
});

describe('地下水质量标准 (GB/T 14848)', () => {
  it('应有v2017版本', () => {
    expect(groundwaterQualityStandards.versions.find(v => v.id === 'v2017')).toBeDefined();
  });

  it('v2017应包含5个水质类别', () => {
    const v2017 = groundwaterQualityStandards.versions.find(v => v.id === 'v2017')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = v2017.data.classes as any[];
    expect(classes.length).toBe(5);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classNames = classes.map((c: any) => c.class);
    expect(classNames).toEqual(['I', 'II', 'III', 'IV', 'V']);
  });

  it('每个水质类别应有color', () => {
    const v2017 = groundwaterQualityStandards.versions.find(v => v.id === 'v2017')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = v2017.data.classes as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    classes.forEach((c: any) => {
      expect(c.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

describe('地表水质量标准 (GB 3838)', () => {
  it('应包含6个类别（含劣V类）', () => {
    const v2002 = surfaceWaterQualityStandards.versions.find(v => v.id === 'v2002')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = v2002.data.classes as any[];
    expect(classes.length).toBe(6);
  });
});

describe('饮用水卫生标准 (GB 5749)', () => {
  it('当前版本应为v2022', () => {
    expect(drinkingWaterStandards.currentVersion).toBe('v2022');
  });
});

describe('getCurrentStandard', () => {
  it('应返回"地下水质量"标准的当前版本', () => {
    const result = getCurrentStandard('地下水质量');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('v2017');
  });

  it('不存在的category应返回null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getCurrentStandard('不存在的类别' as any)).toBeNull();
  });

  it('所有已知category都应能获取到标准', () => {
    const categories: StandardRegistry['category'][] = [
      '地下水质量', '地表水质量', '饮用水卫生', '土壤质量', '污水排放', '地质矿产',
    ];
    categories.forEach(cat => {
      expect(getCurrentStandard(cat)).not.toBeNull();
    });
  });
});

describe('getStandardVersion', () => {
  it('应返回指定版本', () => {
    const result = getStandardVersion('地下水质量', 'v2017');
    expect(result).not.toBeNull();
    expect(result!.name).toContain('2017');
  });

  it('不存在的版本应返回null', () => {
    expect(getStandardVersion('地下水质量', 'v1999')).toBeNull();
  });
});

describe('getStandardsStats', () => {
  it('应返回正确的统计数据', () => {
    const stats = getStandardsStats();
    expect(stats.total).toBe(6);
    expect(stats.versions).toBeGreaterThanOrEqual(6);
    expect(stats.current).toBe(6);
  });
});
