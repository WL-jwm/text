/**
 * 拆分自 resources-bulletin.ts — 保定 2024 公报数据
 */

import type { CityBulletin2024 } from './types';

export const baoding2024: CityBulletin2024 = {
    city: '保定',
    bulletinDate: '2026-01-05',
    area: 19220,
    precipitation: 677.2, //  mm
    precipTotal: 130.16, //  亿m³
    multiAvgPrecip: 577.8, //  mm (1956-2014系列)
    prevYearPrecip: 171.92,
    prevYearCompare: '-24.3%',
    grade: '偏丰',
    surfaceWater: 15.43, //  亿m³ (154300万m³)
    groundWater: 28.86, //  亿m³ (288600万m³, 平原185200+山区134600)
    repeatCalc: 12.03, //  亿m³ (河川基流107300+重复120300)
    totalWater: 32.26, //  亿m³
    coeff: 0.25,
    modulus: 16.79,
    perCapita: 357, //  m³
    totalSupply: 22.45, //  亿m³ (224502万m³)
    localSurfaceSupply: 1.42, //  本地地表水
    interBasinTransferSupply: 7.28, //  跨流域调水(引江)
    groundSupply: 11.11, //  亿m³ (浅层109440+深层1671)
    otherSupply: 2.64, //  亿m³ (再生水26449万m³)
    agriUse: 11.18,
    industryUse: 0.84,
    domesticUse: 3.45,
    ecoUse: 6.98,
    shallowDepth: 16.65, //  m (平原区平均)
    shallowChange: 1.97, //  +m
    reservoirStorage: 14.70, //  10座大中型水库年末蓄水亿m³
    baiyangdianLevel: 7.24, //  m (85高程)
    baiyangdianStorage: 4.355, //  亿m³
    inflow: 20.67, //  亿m³
    outflow: 27.98, //  亿m³
    notes: '4座大型水库(王快/西大洋/安格庄/龙门)水质Ⅱ类;生态补水6.98亿m³占总用水31.1%;一亩泉地下水埋深回升到3.97m',
    counties: [
      { name: '涞水县', area: 1644, precip: 688.9, precipTotal: 11.33, surface: 2.03, ground: 3.03, total: 3.03, agri: 0.38, industry: 0.01, domestic: 0.13, eco: 0.03, totalUse: 0.55, gwUse: 0.44 },
      { name: '涿州市', area: 742, precip: 742.5, precipTotal: 5.51, surface: 0, ground: 1.51, total: 1.51, agri: 0.96, industry: 0.06, domestic: 0.41, eco: 0.25, totalUse: 1.67, gwUse: 1.09 },
      { name: '易县', area: 2534, precip: 713.9, precipTotal: 18.09, surface: 2.96, ground: 4.99, total: 4.99, agri: 0.56, industry: 0.03, domestic: 0.20, eco: 0.05, totalUse: 0.84, gwUse: 0.62 },
      { name: '高碑店市', area: 672, precip: 699.6, precipTotal: 4.70, surface: 0, ground: 1.21, total: 1.21, agri: 0.81, industry: 0.03, domestic: 0.30, eco: 0.10, totalUse: 1.24, gwUse: 0.87 },
      { name: '定兴县', area: 707, precip: 685.1, precipTotal: 4.84, surface: 0, ground: 1.19, total: 1.19, agri: 0.91, industry: 0.01, domestic: 0.13, eco: 0.11, totalUse: 1.17, gwUse: 0.95 },
      { name: '徐水区', area: 748, precip: 759.8, precipTotal: 5.68, surface: 0.12, ground: 1.53, total: 1.53, agri: 0.78, industry: 0.05, domestic: 0.14, eco: 0.22, totalUse: 1.19, gwUse: 0.83 },
      { name: '满城区', area: 630, precip: 745.8, precipTotal: 4.70, surface: 0.42, ground: 1.34, total: 1.34, agri: 0.52, industry: 0.12, domestic: 0.12, eco: 0.03, totalUse: 0.78, gwUse: 0.56 },
      { name: '顺平县', area: 708, precip: 610.6, precipTotal: 4.32, surface: 0.60, ground: 1.08, total: 1.08, agri: 0.51, industry: 0.01, domestic: 0.08, eco: 0.08, totalUse: 0.69, gwUse: 0.55 },
      { name: '唐县', area: 1402, precip: 650.0, precipTotal: 9.11, surface: 1.51, ground: 2.16, total: 2.16, agri: 0.66, industry: 0.01, domestic: 0.14, eco: 0.04, totalUse: 0.85, gwUse: 0.37 },
      { name: '望都县', area: 374, precip: 709.3, precipTotal: 2.65, surface: 0, ground: 0.68, total: 0.68, agri: 0.54, industry: 0.02, domestic: 0.06, eco: 0.05, totalUse: 0.67, gwUse: 0.52 },
      { name: '清苑区', area: 863, precip: 682.3, precipTotal: 5.89, surface: 0, ground: 1.32, total: 1.32, agri: 0.99, industry: 0.06, domestic: 0.11, eco: 0.05, totalUse: 1.21, gwUse: 0.89 },
      { name: '曲阳县', area: 1068, precip: 580.0, precipTotal: 6.19, surface: 1.07, ground: 1.76, total: 1.76, agri: 0.57, industry: 0.01, domestic: 0.11, eco: 0.02, totalUse: 0.71, gwUse: 0.40 },
      { name: '安国市', area: 486, precip: 516.6, precipTotal: 2.51, surface: 0, ground: 0.52, total: 0.52, agri: 0.95, industry: 0.01, domestic: 0.11, eco: 0.09, totalUse: 1.16, gwUse: 1.00 },
      { name: '博野县', area: 340, precip: 625.3, precipTotal: 2.13, surface: 0, ground: 0.55, total: 0.55, agri: 0.36, industry: 0.01, domestic: 0.06, eco: 0.04, totalUse: 0.47, gwUse: 0.34 },
      { name: '蠡县', area: 644, precip: 681.1, precipTotal: 4.39, surface: 0, ground: 1.02, total: 1.02, agri: 0.62, industry: 0.03, domestic: 0.11, eco: 0.02, totalUse: 0.77, gwUse: 0.57 },
      { name: '高阳县', area: 435, precip: 720.5, precipTotal: 3.13, surface: 0, ground: 0.68, total: 0.68, agri: 0.51, industry: 0.13, domestic: 0.11, eco: 0.07, totalUse: 0.83, gwUse: 0.46 },
      { name: '莲池/竞秀区', area: 304, precip: 795.3, precipTotal: 2.42, surface: 0.01, ground: 0.67, total: 0.67, agri: 0.01, industry: 0.20, domestic: 0.82, eco: 2.49, totalUse: 3.52, gwUse: 0.14 },
      { name: '涞源县', area: 2448, precip: 680.8, precipTotal: 16.67, surface: 3.57, ground: 3.74, total: 3.74, agri: 0.10, industry: 0.02, domestic: 0.15, eco: 0.05, totalUse: 0.31, gwUse: 0.19 },
      { name: '阜平县', area: 2471, precip: 642.5, precipTotal: 15.88, surface: 3.15, ground: 3.27, total: 3.27, agri: 0.25, industry: 0.03, domestic: 0.05, eco: 0.03, totalUse: 0.33, gwUse: 0.15 },
    ],
    reservoirs: [
      { name: '王快', type: '大型', lastYearStorage: 5.864, yearEndStorage: 6.891, change: 1.027, inflow: 4.931, outflow: 3.882 },
      { name: '西大洋', type: '大型', lastYearStorage: 5.534, yearEndStorage: 5.748, change: 0.214, inflow: 4.105, outflow: 3.800 },
      { name: '安格庄', type: '大型', lastYearStorage: 1.220, yearEndStorage: 1.536, change: 0.316, inflow: 0.811, outflow: 2.307 },
      { name: '龙门', type: '大型', lastYearStorage: 0.518, yearEndStorage: 0.335, change: -0.184, inflow: 1.048, outflow: 1.223 },
    ],
    countyGroundwater: [,
      { name: '竞秀区', depth2024: 9.17, depth2023: 11.92, change: 2.75 },
      { name: '莲池区', depth2024: 13.84, depth2023: 16.24, change: 2.40 },
      { name: '满城区', depth2024: 13.51, depth2023: 16.61, change: 3.10 },
      { name: '清苑区', depth2024: 23.01, depth2023: 25.46, change: 2.45 },
      { name: '徐水区', depth2024: 12.66, depth2023: 17.00, change: 4.34 },
      { name: '涞水县', depth2024: 10.14, depth2023: 12.31, change: 2.17 },
      { name: '定兴县', depth2024: 9.75, depth2023: 11.48, change: 1.73 },
      { name: '唐县', depth2024: 21.13, depth2023: 21.70, change: 0.57 },
      { name: '高阳县', depth2024: 28.61, depth2023: 30.56, change: 1.95 },
      { name: '望都县', depth2024: 23.57, depth2023: 25.56, change: 1.99 },
      { name: '易县', depth2024: 11.83, depth2023: 13.15, change: 1.32 },
      { name: '曲阳县', depth2024: 16.03, depth2023: 17.38, change: 1.35 },
      { name: '蠡县', depth2024: 35.11, depth2023: 35.61, change: 0.50 },
      { name: '顺平县', depth2024: 16.56, depth2023: 20.79, change: 4.23 },
      { name: '博野县', depth2024: 30.50, depth2023: 31.71, change: 1.21 },
      { name: '涿州市', depth2024: 10.41, depth2023: 12.62, change: 2.21 },
      { name: '安国市', depth2024: 25.30, depth2023: 26.71, change: 1.41 },
      { name: '高碑店市', depth2024: 15.89, depth2023: 19.04, change: 3.15 },
    ],
  };
