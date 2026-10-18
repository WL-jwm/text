/**
 * 拆分自 resources-bulletin.ts — 石家庄 2024 公报数据
 */

import type { CityBulletin2024 } from './types';

export const shijiazhuang2024: CityBulletin2024 = {
    city: '石家庄',
    bulletinDate: '2026-03-11',
    area: 13126, //  省级公报口径
    precipitation: 567.2, //  mm
    precipTotal: 74.45, //  亿m³（省级公报，面积13126km²）
    multiAvgPrecip: 534.1, //  mm（1956-2016系列）
    prevYearPrecip: 106.56,
    prevYearCompare: '-30.1%',
    grade: '偏丰',
    surfaceWater: 7.87,
    groundWater: 16.58,
    repeatCalc: 5.62, //  7.87+16.58-18.83
    totalWater: 18.83,
    coeff: 0.21,
    multiAvgTotal: 21.95,
    perCapita: null,
    totalSupply: 29.82, //  亿m³（省级公报29.8160）
    localSurfaceSupply: 9.49, //  本地地表水
    interBasinTransferSupply: 7.23, //  跨流域调水(引江7.23)
    groundSupply: 10.06,
    otherSupply: 3.04,
    agriUse: 11.59,
    industryUse: 1.87,
    domesticUse: 5.18,
    ecoUse: 11.18,
    southWaterDiversion: 7.23, //  引江水
    inflow: 17.33, //  入境水量亿m³
    outflow: 9.55, //  出境水量亿m³
    reservoirStorage: 13.68, //  12座大中型水库年末蓄水亿m³
    reservoirStorageChange: -1.84, //  比去年减少
    shallowDepth: 27.25, //  m（平原区平均）
    shallowChange: 0.95, //  回升m
    plainStorageChange: 7.27, //  亿m³, 平原地下水蓄水量增加
    gdpWaterUse: 41.69, //  万元GDP用水量m³（2015价）
    industrialWaterUse: 11.58, //  万元工业增加值用水量m³
    counties: [
      { name: '市内四区', precip: 650.0, surface: 0, ground: null, total: null, agri: 0.0689, industry: 0.1167, domestic: 2.7784, eco: 1.9256, totalUse: 4.8896, gwUse: 0.1028 },
      { name: '高新区', precip: null, surface: 0, ground: null, total: null, agri: 0.1317, industry: 0.3330, domestic: 0.1856, eco: 0.0852, totalUse: 0.7355, gwUse: 0.1510 },
      { name: '行唐县', precip: 580.0, surface: null, ground: null, total: null, agri: 1.0317, industry: 0.0112, domestic: 0.0919, eco: 0.1425, totalUse: 1.2773, gwUse: 1.0217 },
      { name: '灵寿县', precip: 658.4, surface: 1.12, ground: null, total: null, agri: 0.6855, industry: 0.0188, domestic: 0.0928, eco: 0.1181, totalUse: 0.9152, gwUse: 0.4824 },
      { name: '平山县', precip: 550.0, surface: 3.25, ground: null, total: null, agri: 0.9120, industry: 0.4453, domestic: 0.0917, eco: 0.0642, totalUse: 1.5132, gwUse: 0.1618 },
      { name: '井陉县', precip: 580.0, surface: 1.21, ground: null, total: null, agri: 0.2673, industry: 0.1437, domestic: 0.0640, eco: 0.0453, totalUse: 0.5203, gwUse: 0.1818 },
      { name: '井陉矿区', precip: 560.0, surface: null, ground: null, total: null, agri: 0.0588, industry: 0.0397, domestic: 0.0261, eco: 0.0397, totalUse: 0.1643, gwUse: 0.0420 },
      { name: '鹿泉区', precip: 640.0, surface: null, ground: null, total: null, agri: 0.7746, industry: 0.1515, domestic: 0.3857, eco: 0.1555, totalUse: 1.4673, gwUse: 0.2473 },
      { name: '元氏县', precip: 570.0, surface: null, ground: null, total: null, agri: 0.6715, industry: 0.0483, domestic: 0.1373, eco: 0.1879, totalUse: 1.0451, gwUse: 0.5773 },
      { name: '赞皇县', precip: 660.0, surface: null, ground: null, total: null, agri: 0.2313, industry: 0.0033, domestic: 0.0693, eco: 0.1427, totalUse: 0.4466, gwUse: 0.1398 },
      { name: '高邑县', precip: 590.0, surface: 0, ground: null, total: null, agri: 0.2940, industry: 0.0090, domestic: 0.0679, eco: 0.0549, totalUse: 0.4258, gwUse: 0.2940 },
      { name: '赵县', precip: 560.0, surface: 0, ground: null, total: null, agri: 1.0565, industry: 0.0716, domestic: 0.1404, eco: 0.1256, totalUse: 1.3941, gwUse: 1.0571 },
      { name: '栾城区', precip: 590.0, surface: 0, ground: null, total: null, agri: 0.5095, industry: 0.1067, domestic: 0.1272, eco: 0.0790, totalUse: 0.8224, gwUse: 0.5218 },
      { name: '藁城区', precip: 540.0, surface: 0, ground: null, total: null, agri: 1.1986, industry: 0.2296, domestic: 0.2220, eco: 0.0596, totalUse: 1.7098, gwUse: 1.3361 },
      { name: '晋州市', precip: 470.0, surface: 0, ground: null, total: null, agri: 0.6942, industry: 0.0425, domestic: 0.1175, eco: 0.0574, totalUse: 0.9116, gwUse: 0.6956 },
      { name: '深泽县', precip: 462.4, surface: 0, ground: null, total: null, agri: 0.4941, industry: 0.0232, domestic: 0.0564, eco: 0.0210, totalUse: 0.5948, gwUse: 0.5069 },
      { name: '无极县', precip: 480.0, surface: 0, ground: null, total: null, agri: 0.6307, industry: 0.0297, domestic: 0.0933, eco: 0.1210, totalUse: 0.8747, gwUse: 0.6466 },
      { name: '正定县', precip: 570.0, surface: 0, ground: null, total: null, agri: 0.8664, industry: 0.0220, domestic: 0.2633, eco: 0.0652, totalUse: 1.2170, gwUse: 0.8769 },
      { name: '新乐市', precip: 550.0, surface: 0, ground: null, total: null, agri: 1.0132, industry: 0.0200, domestic: 0.1710, eco: 2.0309, totalUse: 3.2351, gwUse: 1.0132 },
    ],
    reservoirs: [
      { name: '岗南', type: '大型', lastYearStorage: 8.3470, yearEndStorage: 7.8050, change: -0.5420, inflow: 5.9990, outflow: 6.5410 },
      { name: '黄壁庄', type: '大型', lastYearStorage: 3.9030, yearEndStorage: 3.1000, change: -0.8030, inflow: 10.0870, outflow: 10.8900 },
      { name: '横山岭', type: '大型', lastYearStorage: 1.1010, yearEndStorage: 0.7816, change: -0.3194, inflow: 0.4683, outflow: 0.7877 },
      { name: '口头', type: '大型', lastYearStorage: 0.5168, yearEndStorage: 0.4455, change: -0.0713, inflow: 0.0902, outflow: 0.1615 },
      { name: '红领巾', type: '中型', lastYearStorage: 0.1168, yearEndStorage: 0.0913, change: -0.0255, inflow: 0, outflow: 0.0208 },
      { name: '燕川', type: '中型', lastYearStorage: 0.0634, yearEndStorage: 0.0642, change: 0.0008, inflow: 0.0627, outflow: 0.0619 },
      { name: '石板', type: '中型', lastYearStorage: 0.0951, yearEndStorage: 0.0605, change: -0.0346, inflow: 0.2943, outflow: 0.3289 },
      { name: '下观', type: '中型', lastYearStorage: 0.0669, yearEndStorage: 0.0310, change: -0.0359, inflow: 0.0202, outflow: 0.0561 },
      { name: '张河湾', type: '中型', lastYearStorage: 0.5911, yearEndStorage: 0.6046, change: 0.0135, inflow: 0.7046, outflow: 0.6911 },
      { name: '八一', type: '中型', lastYearStorage: 0.3283, yearEndStorage: 0.2948, change: -0.0335, inflow: 0.1109, outflow: 0.1444 },
      { name: '白草坪', type: '中型', lastYearStorage: 0.2231, yearEndStorage: 0.2416, change: 0.0185, inflow: 0.1621, outflow: 0.1436 },
      { name: '南平旺', type: '中型', lastYearStorage: 0.1685, yearEndStorage: 0.1595, change: -0.0090, inflow: 0.0405, outflow: 0.0495 },
    ],
    rivers: {
      inflow: [
        { river: '滹沱河', volume: 4.2052 },
        { river: '绵河', volume: 2.8230 },
        { river: '甘陶河', volume: 0.7046 },
        { river: '沙河', volume: 2.3653 },
        { river: '南水北调中线', volume: 7.2328 },
      ],
      outflow: [
        { river: '滹沱河', volume: 2.7487 },
        { river: '石津渠', volume: 4.5532 },
        { river: '沙河', volume: 2.0751 },
        { river: '磁河(木刀沟)', volume: 0 },
        { river: '槐河', volume: 0.1715 },
        { river: '泜河', volume: 0 },
        { river: '洨河', volume: 0 },
      ],
    },
    modulus: 14.35,
    notes: '石家庄水位降落漏斗2016年已消散；平原地下水蓄水量增加7.27亿m³；全市水位均回升',
  };
