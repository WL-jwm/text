/**
 * 拆分自 resources-bulletin.ts — 邢台 2024 公报数据
 */

import type { CityBulletin2024 } from './types';

export const xingtai2024: CityBulletin2024 = {
    city: '邢台',
    bulletinDate: '2026-02-26',
    area: 12456,
    precipitation: 540.1, //  mm (公报值)
    precipTotal: 67.27, //  亿m³
    multiAvgPrecip: 525.1, //  mm (多年平均)
    prevYearPrecip: 96.14,
    prevYearCompare: '-30.0%',
    grade: '平水', //  省级公报口径;市级公报为丰水(2.9%)
    surfaceWater: 4.12, //  亿m³
    groundWater: 12.40, //  亿m³
    repeatCalc: 3.76, //  4.12+12.40-12.76
    totalWater: 12.76, //  亿m³
    coeff: 0.19,
    modulus: 10.2,
    perCapita: 520.3, //  m³
    totalSupply: 18.42, //  亿m³
    surfaceSupply: 9.81, //  亿m³
    localSurfaceSupply: 6.93, //  本地地表水
    interBasinTransferSupply: 2.88, //  跨流域调水(引江)
    groundSupply: 6.93, //  亿m³
    otherSupply: 1.69, //  亿m³
    agriUse: 10.96,
    industryUse: 0.89,
    domesticUse: 2.13,
    ecoUse: 4.44,
    shallowDepth: 19.34, //  m
    shallowChange: 2.71, //  回升m
    deepDepth: 51.49, //  m
    deepChange: 1.62, //  回升m
    shallowOverExploitDepth: 23.90,
    deepOverExploitDepth: 54.65,
    gwReduction: 0.21, //  压减地下水亿m³
    inflow: 14.64, //  入境水量(清临干渠+洨河+汪洋沟+老漳河+滏阳河+留垒河+沙洺河+老沙河+引江)
    outflow: 10.24, //  出境水量(滏阳河+滏东排河+清凉江)
    reservoirs: [
      { name: '朱庄', type: '大型', lastYearStorage: 2.088, yearEndStorage: 1.614, change: -0.474, inflow: null, outflow: null },
      { name: '临城', type: '大型', lastYearStorage: 0.593, yearEndStorage: 0.465, change: -0.128, inflow: null, outflow: null },
      { name: '野沟门', type: '中型', lastYearStorage: 0.243, yearEndStorage: 0.063, change: -0.180, inflow: null, outflow: null },
      { name: '东石岭', type: '中型', lastYearStorage: 0.373, yearEndStorage: 0.297, change: -0.077, inflow: null, outflow: null },
      { name: '乱木', type: '中型', lastYearStorage: 0.049, yearEndStorage: 0.028, change: -0.021, inflow: null, outflow: null },
      { name: '马河', type: '中型', lastYearStorage: 0.096, yearEndStorage: 0.109, change: 0.013, inflow: null, outflow: null },
    ],
    counties: [
      { name: '沙河市', area: 890, precip: 525.6, precipTotal: 4.68, surface: 0.746, ground: 1.259, total: 1.436, agri: 0.591, industry: 0.109, domestic: 0.102, eco: 0.076, totalUse: 0.878, gwUse: 0.556 },
      { name: '信都区', area: 1893, precip: 622.3, precipTotal: 11.78, surface: 2.319, ground: 2.453, total: 3.289, agri: 0.433, industry: 0.206, domestic: 0.373, eco: 0.451, totalUse: 1.463, gwUse: 0.340 },
      { name: '内丘县', area: 775, precip: 612.3, precipTotal: 4.75, surface: 0.456, ground: 1.330, total: 1.544, agri: 0.223, industry: 0.050, domestic: 0.070, eco: 0.025, totalUse: 0.369, gwUse: 0.223 },
      { name: '临城县', area: 797, precip: 590.4, precipTotal: 4.71, surface: 0.508, ground: 0.693, total: 0.925, agri: 0.218, industry: 0.015, domestic: 0.054, eco: 0.012, totalUse: 0.298, gwUse: 0.145 },
      { name: '任泽区', area: 431, precip: 546.2, precipTotal: 2.35, surface: 0.000, ground: 0.581, total: 0.468, agri: 0.612, industry: 0.006, domestic: 0.079, eco: 0.060, totalUse: 0.758, gwUse: 0.347 },
      { name: '南和区', area: 413, precip: 466.1, precipTotal: 1.92, surface: 0.000, ground: 0.413, total: 0.347, agri: 0.569, industry: 0.090, domestic: 0.114, eco: 0.078, totalUse: 0.852, gwUse: 0.570 },
      { name: '襄都区', area: 91, precip: 544.8, precipTotal: 0.50, surface: 0.037, ground: 0.127, total: 0.147, agri: 0.093, industry: 0.058, domestic: 0.223, eco: 0.061, totalUse: 0.435, gwUse: 0.095 },
      { name: '经开区', area: 159, precip: 464.4, precipTotal: 0.74, surface: 0.035, ground: 0.177, total: 0.205, agri: 0.188, industry: 0.002, domestic: 0.051, eco: 0.049, totalUse: 0.290, gwUse: 0.193 },
      { name: '邢东新区', area: 68, precip: 550.0, precipTotal: 0.37, surface: 0.008, ground: 0.098, total: 0.094, agri: 0.049, industry: 0.009, domestic: 0.028, eco: 0.072, totalUse: 0.159, gwUse: 0.067 },
      { name: '柏乡县', area: 268, precip: 529.6, precipTotal: 1.42, surface: 0.000, ground: 0.330, total: 0.326, agri: 0.399, industry: 0.014, domestic: 0.049, eco: 0.028, totalUse: 0.490, gwUse: 0.400 },
      { name: '隆尧县', area: 749, precip: 550.0, precipTotal: 4.12, surface: 0.001, ground: 0.815, total: 0.789, agri: 1.033, industry: 0.059, domestic: 0.106, eco: 0.061, totalUse: 1.259, gwUse: 1.026 },
      { name: '宁晋县', area: 1107, precip: 550.0, precipTotal: 6.09, surface: 0.001, ground: 0.780, total: 0.656, agri: 1.478, industry: 0.109, domestic: 0.175, eco: 0.137, totalUse: 1.899, gwUse: 0.611 },
      { name: '巨鹿县', area: 631, precip: 546.8, precipTotal: 3.45, surface: 0.004, ground: 0.255, total: 0.119, agri: 0.744, industry: 0.017, domestic: 0.083, eco: 0.020, totalUse: 0.864, gwUse: 0.174 },
      { name: '新河县', area: 366, precip: 541.3, precipTotal: 1.98, surface: 0.002, ground: 0.104, total: 0.002, agri: 0.451, industry: 0.005, domestic: 0.066, eco: 0.023, totalUse: 0.544, gwUse: 0.094 },
      { name: '广宗县', area: 513, precip: 493.0, precipTotal: 2.53, surface: 0.000, ground: 0.236, total: 0.151, agri: 0.455, industry: 0.013, domestic: 0.057, eco: 0.045, totalUse: 0.570, gwUse: 0.109 },
      { name: '平乡县', area: 406, precip: 450.3, precipTotal: 1.83, surface: 0.000, ground: 0.277, total: 0.200, agri: 0.399, industry: 0.013, domestic: 0.057, eco: 0.031, totalUse: 0.501, gwUse: 0.119 },
      { name: '威县', area: 994, precip: 465.6, precipTotal: 4.63, surface: 0.000, ground: 0.679, total: 0.502, agri: 0.925, industry: 0.036, domestic: 0.110, eco: 0.059, totalUse: 1.130, gwUse: 0.618 },
      { name: '清河县', area: 501, precip: 529.6, precipTotal: 2.65, surface: 0.001, ground: 0.629, total: 0.531, agri: 0.637, industry: 0.054, domestic: 0.174, eco: 0.076, totalUse: 0.941, gwUse: 0.348 },
      { name: '临西县', area: 550, precip: 438.1, precipTotal: 2.41, surface: 0.000, ground: 0.442, total: 0.362, agri: 0.664, industry: 0.015, domestic: 0.057, eco: 0.062, totalUse: 0.798, gwUse: 0.400 },
      { name: '南宫市', area: 854, precip: 512.1, precipTotal: 4.37, surface: 0.000, ground: 0.721, total: 0.667, agri: 0.796, industry: 0.013, domestic: 0.103, eco: 0.062, totalUse: 0.974, gwUse: 0.492 },
    ],
    notes: '浅层超采区连续42个月水位回升，百泉新增16处泉眼复涌;宁柏隆浅层漏斗面积-313.28km²;南宫深层漏斗回升0.57m',
  };
