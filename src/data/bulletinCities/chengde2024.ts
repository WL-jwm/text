/**
 * 拆分自 resources-bulletin.ts — 承德 2024 公报数据
 */

import type { CityBulletin2024 } from './types';

export const chengde2024: CityBulletin2024 = {
    city: '承德',
    bulletinDate: '2026-02-12',
    area: 39489, //  省级公报口径km²;市级公报39489.53
    precipitation: 662.1, //  mm
    precipTotal: 26.15, //  亿m³ (公报值)
    multiAvgPrecip: 519.1, //  mm (1956-2014系列)
    prevYearPrecip: null,
    prevYearCompare: null,
    grade: '丰水',
    surfaceWater: 37.86, //  亿m³ (378624万m³)
    groundWater: 22.31, //  亿m³ (223107万m³)
    repeatCalc: 19.71, //  亿m³ (197142万m³)
    totalWater: 40.46, //  亿m³ (404589万m³)
    coeff: 0.15,
    modulus: 10.25,
    totalSupply: 7.38, //  亿m³ (73784万m³)
    localSurfaceSupply: 2.80, //  亿m³ (27952万m³)
    groundSupply: 4.18, //  亿m³ (41826万m³, 全浅层)
    otherSupply: 0.40, //  亿m³ (4006万m³)
    agriUse: 4.38,
    industryUse: 0.96,
    domesticUse: 1.46,
    ecoUse: 0.57,
    shallowDepth: 7.31, //  m
    shallowChange: 0.28, //  +m
    inflow: 2.95, //  亿m³ (29516万m³, 内蒙25452+辽宁4064)
    outflow: 21.20, //  亿m³ (212016万m³)
    notes: '不涉及超采区，全部为浅层地下水自动监测站;全省面积最大(39489km²);出境水量21.20亿m³全省第二',
    counties: [
      { name: '双桥区', precip: 625.0, surface: 0.42, ground: null, total: 0.5594, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.255, gwUse: null },
      { name: '双滦区', precip: 705.0, surface: 0.4185, ground: null, total: 0.5483, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.4226, gwUse: null },
      { name: '鹰手营子矿区', precip: 708.0, surface: 1.2564, ground: null, total: 0.5654, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.0874, gwUse: null },
      { name: '承德县', precip: 622.0, surface: 3.7946, ground: null, total: 4.1353, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.6623, gwUse: null },
      { name: '兴隆县', precip: 842.3, surface: 7.137, ground: null, total: 7.3619, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.4874, gwUse: null },
      { name: '平泉市', precip: 660.0, surface: 3.549, ground: null, total: 3.8756, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.648, gwUse: null },
      { name: '滦平县', precip: 650.0, surface: 2.6404, ground: null, total: 2.9797, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.9143, gwUse: null },
      { name: '隆化县', precip: 635.0, surface: 4.0705, ground: null, total: 4.3802, agri: null, industry: null, domestic: null, eco: null, totalUse: 1.2971, gwUse: null },
      { name: '丰宁满族自治县', precip: 600.8, surface: 5.8267, ground: null, total: 6.1219, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.9679, gwUse: null },
      { name: '宽城满族自治县', precip: 815.0, surface: 3.2474, ground: null, total: 3.4235, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.5685, gwUse: null },
      { name: '围场满族蒙古族自治县', precip: 655.0, surface: 6.2441, ground: null, total: 6.5075, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.4803, gwUse: null }
    ],
    supplyByCounty: [,
      { name: '围场县', surface: 712, ground: 3770, other: 392, total: 4874 },
      { name: '丰宁县', surface: 2529, ground: 2841, other: 316, total: 5685 },
      { name: '隆化县', surface: 1165, ground: 5194, other: 264, total: 6623 },
      { name: '滦平县', surface: 360, ground: 5636, other: 484, total: 6480 },
      { name: '承德县', surface: 7784, ground: 4996, other: 191, total: 12971 },
      { name: '平泉市', surface: 240, ground: 4459, other: 105, total: 4803 },
      { name: '兴隆县', surface: 47, ground: 4439, other: 305, total: 4787 },
      { name: '宽城县', surface: 4935, ground: 5185, other: 51, total: 9143 },
      { name: '双桥区', surface: 3920, ground: 494, other: 638, total: 5052 },
      { name: '双滦区', surface: 0, ground: 1753, other: 0, total: 1753 },
      { name: '营子区', surface: 0, ground: 2094, other: 1216, total: 4226 },
    ],
  };
