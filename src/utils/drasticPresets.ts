/**
 * DRASTIC脆弱性评价 — 预设区与汇总
 */

import type { DrasticPresetZone, DrasticResult, DrasticInput } from './drasticTypes';
import { calcDrastic } from './drasticAlgorithms';

export const PRESET_ZONES: DrasticPresetZone[] = [
  {
    name: '山前冲洪积扇顶部',
    region: '保定-石家庄山前',
    depth: 8, recharge: 220, aquiferMedia: 'sand_gravel', soilMedia: 'gravel',
    topography: 3, vadoseMedia: 'sand_gravel', conductivity: 65, area: 3200,
    note: '含水层渗透性强，脆弱性高',
  },
  {
    name: '冲洪积扇前缘',
    region: '邢台-邯郸中部',
    depth: 5, recharge: 180, aquiferMedia: 'sand_gravel', soilMedia: 'loam',
    topography: 1, vadoseMedia: 'sand_gravel', conductivity: 35, area: 4500,
    note: '含水层较厚，过渡带',
  },
  {
    name: '冲积平原中部',
    region: '衡水-沧州中部',
    depth: 6, recharge: 130, aquiferMedia: 'bedded', soilMedia: 'clay_loam',
    topography: 0.5, vadoseMedia: 'silt', conductivity: 15, area: 8800,
    note: '多层结构，粘性土层发育',
  },
  {
    name: '滨海平原',
    region: '沧州东部-唐山南部',
    depth: 3, recharge: 90, aquiferMedia: 'bedded', soilMedia: 'clay',
    topography: 0.3, vadoseMedia: 'silt', conductivity: 8, area: 5600,
    note: '粘性土厚层，但埋深浅',
  },
  {
    name: '山间盆地',
    region: '张家口-承德盆地',
    depth: 12, recharge: 160, aquiferMedia: 'sandstone', soilMedia: 'loam',
    topography: 8, vadoseMedia: 'sandstone', conductivity: 20, area: 6500,
    note: '盆地汇水，含水层中等',
  },
  {
    name: '岩溶山区',
    region: '邢台-邯郸西部山区',
    depth: 25, recharge: 140, aquiferMedia: 'karst', soilMedia: 'thin_absent',
    topography: 25, vadoseMedia: 'karst', conductivity: 50, area: 4200,
    note: '岩溶发育，污染快速通道',
  },
  {
    name: '滨海低平原深层水',
    region: '廊坊-沧州深层',
    depth: 30, recharge: 60, aquiferMedia: 'bedded', soilMedia: 'clay',
    topography: 0.5, vadoseMedia: 'confining', conductivity: 5, area: 7800,
    note: '承压水，隔水顶板保护',
  },
  {
    name: '城市建成区',
    region: '石家庄-唐山城区',
    depth: 15, recharge: 110, aquiferMedia: 'sand_gravel', soilMedia: 'thin_absent',
    topography: 1, vadoseMedia: 'sand_gravel', conductivity: 40, area: 1200,
    note: '人工扰动大，地面硬化',
  },
];

/**
 * 批量计算预设分区
 */

export function calcAllPresetZones(): DrasticResult[] {
  return PRESET_ZONES.map(z => {
    const input: DrasticInput = {
      name: z.name,
      depth: z.depth,
      recharge: z.recharge,
      aquiferMedia: z.aquiferMedia,
      soilMedia: z.soilMedia,
      topography: z.topography,
      vadoseMedia: z.vadoseMedia,
      conductivity: z.conductivity,
    };
    const result = calcDrastic(input);
    return { ...result, area: z.area };
  });
}

/**
 * 汇总统计
 */

export function calcDrasticSummary() {
  const results = calcAllPresetZones();
  const totalArea = results.reduce((s, r) => s + (r.area ?? 0), 0);

  const byLevel = {
    '低': results.filter(r => r.vulnerability === '低'),
    '中等': results.filter(r => r.vulnerability === '中等'),
    '高': results.filter(r => r.vulnerability === '高'),
    '极高': results.filter(r => r.vulnerability === '极高'),
  };

  const areaByLevel = {
    '低': byLevel['低'].reduce((s, r) => s + (r.area ?? 0), 0),
    '中等': byLevel['中等'].reduce((s, r) => s + (r.area ?? 0), 0),
    '高': byLevel['高'].reduce((s, r) => s + (r.area ?? 0), 0),
    '极高': byLevel['极高'].reduce((s, r) => s + (r.area ?? 0), 0),
  };

  const avgIndex = results.reduce((s, r) => s + r.drasticIndex, 0) / results.length;
  const maxIndex = Math.max(...results.map(r => r.drasticIndex));
  const minIndex = Math.min(...results.map(r => r.drasticIndex));

  return {
    totalArea,
    areaByLevel,
    avgIndex: Math.round(avgIndex * 10) / 10,
    maxIndex: Math.round(maxIndex * 10) / 10,
    minIndex: Math.round(minIndex * 10) / 10,
    zoneCount: results.length,
    results,
  };
}

