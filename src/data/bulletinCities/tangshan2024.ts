/**
 * 拆分自 resources-bulletin.ts — 唐山 2024 公报数据
 */

import type { CityBulletin2024 } from './types';

export const tangshan2024: CityBulletin2024 = {
    city: '唐山',
    area: 13385,
    precipitation: 891.1,
    precipTotal: 119.27,
    multiAvgPrecip: 629.8, //  省级公报未给出各市多年平均
    modulus: 27.74,
    prevYearPrecip: 75.45,
    prevYearCompare: '+58.1%',
    grade: '丰水',
    surfaceWater: 23.55,
    groundWater: 19.74,
    totalWater: 37.13,
    coeff: 0.31,
    totalSupply: 25.31,
    localSurfaceSupply: 11.43,
    interBasinTransferSupply: 0,
    groundSupply: 10.41,
    otherSupply: 3.47,
    agriUse: 12.34,
    industryUse: 5.05,
    domesticUse: 3.76,
    ecoUse: 4.16,
    notes: '降水丰水年，浅层地下水供给10.41亿m³，海水入侵回补试验场建成',
    counties: [
      { name: '路南区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '路北区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '古冶区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '开平区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '丰南区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '丰润区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '曹妃甸区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '滦南县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '乐亭县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '迁西县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '玉田县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '遵化市', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '迁安市', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null }
    ],
  };
