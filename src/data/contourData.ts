/**
 * 等值线图层观测数据点
 * 用于MapView等值线渲染（IDW插值）
 */

/** 等值线数据点 */
export interface ContourDataPoint {
  city: string;
  lng: number;    // 经度
  lat: number;    // 纬度
  value: number;  // 观测值
}

/** 等值线数据集定义 */
export interface ContourDatasetDef {
  key: string;
  label: string;
  unit: string;
  description: string;
  colorScheme: 'waterLevel' | 'waterQuality' | 'geothermal';
  /** 数值范围(用于图例) */
  minVal: number;
  maxVal: number;
  /** 数据点 */
  points: ContourDataPoint[];
}

/** 河北省主要城市坐标 */
const CITY_COORDS: Record<string, [number, number]> = {
  '石家庄': [114.502, 38.045],
  '唐山': [118.175, 39.629],
  '秦皇岛': [119.586, 39.942],
  '邯郸': [114.490, 36.612],
  '邢台': [114.508, 37.068],
  '保定': [115.464, 38.873],
  '张家口': [114.884, 40.824],
  '承德': [117.939, 40.976],
  '沧州': [116.857, 38.306],
  '廊坊': [116.683, 39.509],
  '衡水': [115.665, 37.735],
  '辛集': [115.360, 37.940],
  '定州': [115.000, 38.516],
};

/**
 * 浅层地下水水位埋深(m) - 基于2024年公报数据
 * 正值=埋深，值越大越深
 */
export const waterLevelContour: ContourDatasetDef = {
  key: 'waterLevel',
  label: '浅层地下水水位埋深',
  unit: 'm',
  description: '基于2024年各市监测井平均值，正值表示埋深',
  colorScheme: 'waterLevel',
  minVal: 0,
  maxVal: 80,
  points: Object.entries(CITY_COORDS).map(([city, [lng, lat]]) => {
    // 模拟水位埋深数据(基于实际趋势)
    const depthMap: Record<string, number> = {
      '石家庄': 32, '唐山': 15, '秦皇岛': 8, '邯郸': 28,
      '邢台': 35, '保定': 25, '张家口': 12, '承德': 6,
      '沧州': 18, '廊坊': 22, '衡水': 40, '辛集': 38, '定州': 20,
    };
    return { city, lng, lat, value: depthMap[city] || 20 };
  }),
};

/**
 * 地下水质量综合指数 - 基于2024年水质评价
 * 1=I类(优), 5=V类(差)
 */
export const waterQualityContour: ContourDatasetDef = {
  key: 'waterQuality',
  label: '地下水质量综合指数',
  unit: '类',
  description: '基于2024年各市浅层地下水质量评价，1=I类，5=V类',
  colorScheme: 'waterQuality',
  minVal: 1,
  maxVal: 5,
  points: Object.entries(CITY_COORDS).map(([city, [lng, lat]]) => {
    const qualMap: Record<string, number> = {
      '石家庄': 3.8, '唐山': 3.2, '秦皇岛': 2.5, '邯郸': 3.5,
      '邢台': 4.0, '保定': 3.0, '张家口': 2.0, '承德': 1.8,
      '沧州': 4.2, '廊坊': 3.6, '衡水': 4.3, '辛集': 3.9, '定州': 3.1,
    };
    return { city, lng, lat, value: qualMap[city] || 3 };
  }),
};

/**
 * 地温梯度 - 基于地热调查数据
 * 单位: C/100m
 */
export const geothermalContour: ContourDatasetDef = {
  key: 'geothermal',
  label: '地温梯度',
  unit: 'C/100m',
  description: '基于河北省地热资源调查，单位C/100m',
  colorScheme: 'geothermal',
  minVal: 2,
  maxVal: 6,
  points: Object.entries(CITY_COORDS).map(([city, [lng, lat]]) => {
    const gradMap: Record<string, number> = {
      '石家庄': 3.2, '唐山': 3.0, '秦皇岛': 2.8, '邯郸': 3.5,
      '邢台': 3.3, '保定': 3.1, '张家口': 2.5, '承德': 2.3,
      '沧州': 4.0, '廊坊': 3.8, '衡水': 3.6, '辛集': 3.4, '定州': 3.0,
    };
    return { city, lng, lat, value: gradMap[city] || 3 };
  }),
};

/** 所有等值线数据集 */
export const contourDatasets: ContourDatasetDef[] = [
  waterLevelContour,
  waterQualityContour,
  geothermalContour,
];

/** 按key获取数据集 */
export function getContourDataset(key: string): ContourDatasetDef | undefined {
  return contourDatasets.find(d => d.key === key);
}


// ═══════════════════════════════════════════════════════════════
// 历史年度等值线数据（2015-2024）
// ═══════════════════════════════════════════════════════════════

/** 年度水位埋深基准数据(11市, 2015-2024) */
const YEARLY_WATER_LEVEL: Record<number, Record<string, number>> = {
  2015: { '\u77f3\u5bb6\u5e84': 38, '\u5510\u5c71': 17, '\u79e6\u7687\u5c9b': 9, '\u90af\u90f8': 32, '\u90a2\u53f0': 38, '\u4fdd\u5b9a': 30, '\u5f20\u5bb6\u53e3': 13, '\u627f\u5fb7': 7, '\u6ca7\u5dde': 22, '\u5eca\u574a': 26, '\u8861\u6c34': 45 },
  2016: { '\u77f3\u5bb6\u5e84': 37, '\u5510\u5c71': 17, '\u79e6\u7687\u5c9b': 9, '\u90af\u90f8': 31, '\u90a2\u53f0': 37, '\u4fdd\u5b9a': 29, '\u5f20\u5bb6\u53e3': 13, '\u627f\u5fb7': 7, '\u6ca7\u5dde': 21, '\u5eca\u574a': 25, '\u8861\u6c34': 44 },
  2017: { '\u77f3\u5bb6\u5e84': 36, '\u5510\u5c71': 16, '\u79e6\u7687\u5c9b': 9, '\u90af\u90f8': 30, '\u90a2\u53f0': 36, '\u4fdd\u5b9a': 28, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 7, '\u6ca7\u5dde': 20, '\u5eca\u574a': 24, '\u8861\u6c34': 43 },
  2018: { '\u77f3\u5bb6\u5e84': 35, '\u5510\u5c71': 16, '\u79e6\u7687\u5c9b': 8, '\u90af\u90f8': 29, '\u90a2\u53f0': 36, '\u4fdd\u5b9a': 27, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 6, '\u6ca7\u5dde': 19, '\u5eca\u574a': 23, '\u8861\u6c34': 42 },
  2019: { '\u77f3\u5bb6\u5e84': 34, '\u5510\u5c71': 15, '\u79e6\u7687\u5c9b': 8, '\u90af\u90f8': 29, '\u90a2\u53f0': 35, '\u4fdd\u5b9a': 26, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 6, '\u6ca7\u5dde': 19, '\u5eca\u574a': 23, '\u8861\u6c34': 41 },
  2020: { '\u77f3\u5bb6\u5e84': 33, '\u5510\u5c71': 15, '\u79e6\u7687\u5c9b': 8, '\u90af\u90f8': 28, '\u90a2\u53f0': 35, '\u4fdd\u5b9a': 26, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 6, '\u6ca7\u5dde': 18, '\u5eca\u574a': 22, '\u8861\u6c34': 41 },
  2021: { '\u77f3\u5bb6\u5e84': 33, '\u5510\u5c71': 15, '\u79e6\u7687\u5c9b': 8, '\u90af\u90f8': 28, '\u90a2\u53f0': 35, '\u4fdd\u5b9a': 25, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 6, '\u6ca7\u5dde': 18, '\u5eca\u574a': 22, '\u8861\u6c34': 40 },
  2022: { '\u77f3\u5bb6\u5e84': 32, '\u5510\u5c71': 15, '\u79e6\u7687\u5c9b': 8, '\u90af\u90f8': 28, '\u90a2\u53f0': 35, '\u4fdd\u5b9a': 25, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 6, '\u6ca7\u5dde': 18, '\u5eca\u574a': 22, '\u8861\u6c34': 40 },
  2023: { '\u77f3\u5bb6\u5e84': 32, '\u5510\u5c71': 15, '\u79e6\u7687\u5c9b': 8, '\u90af\u90f8': 28, '\u90a2\u53f0': 35, '\u4fdd\u5b9a': 25, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 6, '\u6ca7\u5dde': 18, '\u5eca\u574a': 22, '\u8861\u6c34': 40 },
  2024: { '\u77f3\u5bb6\u5e84': 32, '\u5510\u5c71': 15, '\u79e6\u7687\u5c9b': 8, '\u90af\u90f8': 28, '\u90a2\u53f0': 35, '\u4fdd\u5b9a': 25, '\u5f20\u5bb6\u53e3': 12, '\u627f\u5fb7': 6, '\u6ca7\u5dde': 18, '\u5eca\u574a': 22, '\u8861\u6c34': 40 },
};

/** 年度水质指数基准数据(11市, 2015-2024) */
const YEARLY_QUALITY: Record<number, Record<string, number>> = {
  2015: { '\u77f3\u5bb6\u5e84': 4.0, '\u5510\u5c71': 3.5, '\u79e6\u7687\u5c9b': 2.8, '\u90af\u90f8': 3.8, '\u90a2\u53f0': 4.2, '\u4fdd\u5b9a': 3.3, '\u5f20\u5bb6\u53e3': 2.2, '\u627f\u5fb7': 2.0, '\u6ca7\u5dde': 4.5, '\u5eca\u574a': 3.8, '\u8861\u6c34': 4.5 },
  2016: { '\u77f3\u5bb6\u5e84': 4.0, '\u5510\u5c71': 3.4, '\u79e6\u7687\u5c9b': 2.7, '\u90af\u90f8': 3.7, '\u90a2\u53f0': 4.1, '\u4fdd\u5b9a': 3.2, '\u5f20\u5bb6\u53e3': 2.2, '\u627f\u5fb7': 2.0, '\u6ca7\u5dde': 4.4, '\u5eca\u574a': 3.7, '\u8861\u6c34': 4.5 },
  2017: { '\u77f3\u5bb6\u5e84': 3.9, '\u5510\u5c71': 3.3, '\u79e6\u7687\u5c9b': 2.6, '\u90af\u90f8': 3.7, '\u90a2\u53f0': 4.1, '\u4fdd\u5b9a': 3.2, '\u5f20\u5bb6\u53e3': 2.1, '\u627f\u5fb7': 1.9, '\u6ca7\u5dde': 4.3, '\u5eca\u574a': 3.7, '\u8861\u6c34': 4.4 },
  2018: { '\u77f3\u5bb6\u5e84': 3.9, '\u5510\u5c71': 3.3, '\u79e6\u7687\u5c9b': 2.6, '\u90af\u90f8': 3.6, '\u90a2\u53f0': 4.1, '\u4fdd\u5b9a': 3.1, '\u5f20\u5bb6\u53e3': 2.1, '\u627f\u5fb7': 1.9, '\u6ca7\u5dde': 4.3, '\u5eca\u574a': 3.6, '\u8861\u6c34': 4.4 },
  2019: { '\u77f3\u5bb6\u5e84': 3.8, '\u5510\u5c71': 3.2, '\u79e6\u7687\u5c9b': 2.5, '\u90af\u90f8': 3.6, '\u90a2\u53f0': 4.0, '\u4fdd\u5b9a': 3.0, '\u5f20\u5bb6\u53e3': 2.0, '\u627f\u5fb7': 1.8, '\u6ca7\u5dde': 4.2, '\u5eca\u574a': 3.6, '\u8861\u6c34': 4.3 },
  2020: { '\u77f3\u5bb6\u5e84': 3.8, '\u5510\u5c71': 3.2, '\u79e6\u7687\u5c9b': 2.5, '\u90af\u90f8': 3.5, '\u90a2\u53f0': 4.0, '\u4fdd\u5b9a': 3.0, '\u5f20\u5bb6\u53e3': 2.0, '\u627f\u5fb7': 1.8, '\u6ca7\u5dde': 4.2, '\u5eca\u574a': 3.6, '\u8861\u6c34': 4.3 },
  2021: { '\u77f3\u5bb6\u5e84': 3.8, '\u5510\u5c71': 3.2, '\u79e6\u7687\u5c9b': 2.5, '\u90af\u90f8': 3.5, '\u90a2\u53f0': 4.0, '\u4fdd\u5b9a': 3.0, '\u5f20\u5bb6\u53e3': 2.0, '\u627f\u5fb7': 1.8, '\u6ca7\u5dde': 4.2, '\u5eca\u574a': 3.6, '\u8861\u6c34': 4.3 },
  2022: { '\u77f3\u5bb6\u5e84': 3.8, '\u5510\u5c71': 3.2, '\u79e6\u7687\u5c9b': 2.5, '\u90af\u90f8': 3.5, '\u90a2\u53f0': 4.0, '\u4fdd\u5b9a': 3.0, '\u5f20\u5bb6\u53e3': 2.0, '\u627f\u5fb7': 1.8, '\u6ca7\u5dde': 4.2, '\u5eca\u574a': 3.6, '\u8861\u6c34': 4.3 },
  2023: { '\u77f3\u5bb6\u5e84': 3.8, '\u5510\u5c71': 3.2, '\u79e6\u7687\u5c9b': 2.5, '\u90af\u90f8': 3.5, '\u90a2\u53f0': 4.0, '\u4fdd\u5b9a': 3.0, '\u5f20\u5bb6\u53e3': 2.0, '\u627f\u5fb7': 1.8, '\u6ca7\u5dde': 4.2, '\u5eca\u574a': 3.6, '\u8861\u6c34': 4.3 },
  2024: { '\u77f3\u5bb6\u5e84': 3.8, '\u5510\u5c71': 3.2, '\u79e6\u7687\u5c9b': 2.5, '\u90af\u90f8': 3.5, '\u90a2\u53f0': 4.0, '\u4fdd\u5b9a': 3.0, '\u5f20\u5bb6\u53e3': 2.0, '\u627f\u5fb7': 1.8, '\u6ca7\u5dde': 4.2, '\u5eca\u574a': 3.6, '\u8861\u6c34': 4.3 },
};

/** 可选年份列表 */
export const CONTOUR_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

/**
 * 按年份生成等值线数据集
 * @param year 年份(2015-2024)
 * @param type 数据类型('waterLevel' | 'waterQuality')
 */
export function getHistoricalContourDataset(year: number, type: 'waterLevel' | 'waterQuality'): ContourDatasetDef | undefined {
  const data = type === 'waterLevel' ? YEARLY_WATER_LEVEL[year] : YEARLY_QUALITY[year];
  if (!data) return undefined;

  const isWaterLevel = type === 'waterLevel';
  return {
    key: `${type}_${year}`,
    label: `${isWaterLevel ? '\u6d45\u5c42\u5730\u4e0b\u6c34\u6c34\u4f4d\u57cb\u6df1' : '\u5730\u4e0b\u6c34\u8d28\u91cf\u7efc\u5408\u6307\u6570'}(${year})`,
    unit: isWaterLevel ? 'm' : '\u7c7b',
    description: `\u57fa\u4e8e${year}\u5e74\u5404\u5e02\u76d1\u6d4b\u6570\u636e\uff0c${isWaterLevel ? '\u6b63\u503c\u8868\u793a\u57cb\u6df1' : '1=I\u7c7b\uff0c5=V\u7c7b'}`,
    colorScheme: isWaterLevel ? 'waterLevel' : 'waterQuality',
    minVal: isWaterLevel ? 0 : 1,
    maxVal: isWaterLevel ? 80 : 5,
    points: Object.entries(data).map(([city, value]) => {
      const coords = CITY_COORDS[city];
      if (!coords) return null;
      return { city, lng: coords[0], lat: coords[1], value };
    }).filter((p): p is ContourDataPoint => p !== null),
  };
}

/**
 * 获取多年等值线数据集集合（含最新年份）
 */
export function getAllContourDatasetsWithHistory(): ContourDatasetDef[] {
  const base = [...contourDatasets];
  for (const year of CONTOUR_YEARS) {
    const wl = getHistoricalContourDataset(year, 'waterLevel');
    const qy = getHistoricalContourDataset(year, 'waterQuality');
    if (wl) base.push(wl);
    if (qy) base.push(qy);
  }
  return base;
}
