/**
 * 拆分自 resources-bulletin.ts — 秦皇岛 2024 公报数据
 */

import type { CityBulletin2024 } from './types';

export const qinhuangdao2024: CityBulletin2024 = {
    city: '秦皇岛',
    area: 7750,
    precipitation: 1054.7,
    precipTotal: 81.74,
    multiAvgPrecip: 655.5,
    modulus: 41.86,
    prevYearPrecip: 46.09,
    prevYearCompare: '+77.3%',
    grade: '丰水',
    surfaceWater: 26.08,
    groundWater: 15.15,
    totalWater: 32.44,
    coeff: 0.40,
    totalSupply: 6.96,
    localSurfaceSupply: 3.00,
    interBasinTransferSupply: 0,
    groundSupply: 3.42,
    otherSupply: 0.54,
    agriUse: 3.88,
    industryUse: 0.69,
    domesticUse: 1.51,
    ecoUse: 0.88,
    notes: '全省降水量最大(1054.7mm)，入海水量20.85亿m³全省第一',
    counties: [
      { name: '海港区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '山海关区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '北戴河区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '抚宁区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '青龙满族自治县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '昌黎县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '卢龙县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
    ],
  };
