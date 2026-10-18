/**
 * 拆分自 resources-bulletin.ts — 沧州 2024 公报数据
 */

import type { CityBulletin2024 } from './types';

export const cangzhou2024: CityBulletin2024 = {
    city: '沧州',
    bulletinDate: '2026-04-07',
    area: 13904, //  省级公报口径km²
    precipitation: 731.2, //  mm
    precipTotal: 101.67, //  亿m³ (省级公报)
    multiAvgPrecip: 543.8, //  mm（1956-2015系列）
    modulus: 11.81,
    prevYearPrecip: 80.99,
    prevYearCompare: '+25.5%',
    grade: '丰水',
    surfaceWater: 6.74, //  亿m³ (67465万m³)
    groundWater: 11.96, //  亿m³ (119809万m³, 降雨入渗96763+地表水体入渗23046)
    repeatCalc: 2.28, //  6.74+11.96-16.42
    totalWater: 16.42, //  亿m³ (164228万m³)
    coeff: 0.16,
    totalSupply: 15.29, //  亿m³ (152873.6万m³)
    localSurfaceSupply: 3.42, //  本地地表水
    interBasinTransferSupply: 7.31, //  外调水
    groundSupply: 2.85, //  亿m³ (28510万m³)
    shallowGround: 1.91, //  浅层地下水19124万m³
    deepGround: 0.94, //  深层地下水9386万m³
    otherSupply: 1.71, //  亿m³ (17105.3万m³)
    agriUse: 8.65,
    industryUse: 1.62,
    domesticUse: 2.58,
    ecoUse: 2.44,
    inflow: 17.36, //  亿m³
    outflow: 1.51, //  亿m³
    seaOutflow: 18.56, //  亿m³
    southWaterDiversion: 3.92, //  南水北调中线引江水
    yellowRiverWater: 2.24, //  引黄水
    notes: '特丰水年，降水量偏多34.5%；深层地下水开采9386万m³；黄骅沧县深层漏斗面积197.56→0km²消散',
    counties: [
      { name: '新华区', precip: 807.8, surface: 0.0794, ground: 0.0063, total: 0.0794, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.3365, gwUse: null },
      { name: '运河区', precip: 803.8, surface: 0.0814, ground: 0.133, total: 0.1409, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.4183, gwUse: null },
      { name: '沧县', precip: 785.2, surface: 1.1663, ground: 1.2277, total: 2.2303, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.7618, gwUse: null },
      { name: '青县', precip: 702.0, surface: 0.439, ground: 0.7881, total: 1.0354, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.8662, gwUse: null },
      { name: '东光县', precip: 659.3, surface: 0.0425, ground: 0.8191, total: 0.6907, agri: null, industry: null, domestic: null, eco: null, totalUse: 1.014, gwUse: null },
      { name: '海兴县', precip: 804.8, surface: 0.8331, ground: 0.165, total: 0.9232, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.2692, gwUse: null },
      { name: '盐山县', precip: 690.1, surface: 0.461, ground: 0.4731, total: 0.8281, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.5885, gwUse: null },
      { name: '肃宁县', precip: 607.2, surface: 0.0129, ground: 0.6455, total: 0.5578, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.6354, gwUse: null },
      { name: '南皮县', precip: 752.5, surface: 0.3617, ground: 1.1933, total: 1.4367, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.832, gwUse: null },
      { name: '吴桥县', precip: 630.1, surface: 0.0246, ground: 0.9488, total: 0.7717, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.7507, gwUse: null },
      { name: '献县', precip: 663.1, surface: 0.1418, ground: 1.2535, total: 1.1517, agri: null, industry: null, domestic: null, eco: null, totalUse: 1.3206, gwUse: null },
      { name: '孟村回族自治县', precip: 717.3, surface: 0.257, ground: 0.4211, total: 0.6423, agri: null, industry: null, domestic: null, eco: null, totalUse: 0.3694, gwUse: null },
      { name: '泊头市', precip: 721.6, surface: 0.1855, ground: 1.251, total: 1.1676, agri: null, industry: null, domestic: null, eco: null, totalUse: 1.0995, gwUse: null },
      { name: '任丘市', precip: 754.5, surface: 0.2409, ground: 1.6535, total: 1.5656, agri: null, industry: null, domestic: null, eco: null, totalUse: 1.4768, gwUse: null },
      { name: '黄骅市', precip: 833.2, surface: 2.2799, ground: 0.0645, total: 2.3304, agri: null, industry: null, domestic: null, eco: null, totalUse: 1.6597, gwUse: null },
      { name: '河间市', precip: 671.5, surface: 0.1395, ground: 0.9374, total: 0.871, agri: null, industry: null, domestic: null, eco: null, totalUse: 1.3867, gwUse: null }
    ],
  };
