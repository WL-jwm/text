export const cityBulletin2024 = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },

  {
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
  },
  {
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
  },
  {
    city: '邯郸',
    area: 12047,
    precipitation: 462.6,
    precipTotal: 55.73,
    multiAvgPrecip: 541.9,
    modulus: 10.08,
    prevYearPrecip: 98.34,
    prevYearCompare: '-43.3%',
    grade: '偏枯',
    surfaceWater: 5.78,
    groundWater: 12.51,
    totalWater: 12.14,
    coeff: 0.22,
    totalSupply: 19.53,
    localSurfaceSupply: 7.10,
    interBasinTransferSupply: 3.26,
    groundSupply: 7.78,
    otherSupply: 1.39,
    agriUse: 12.64,
    industryUse: 2.14,
    domesticUse: 2.75,
    ecoUse: 2.00,
    notes: '全省降水量最小(462.6mm)，偏枯水年，入境水量57.54亿m³全省最大',
    counties: [
      { name: '丛台区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '复兴区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '邯山区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '峰峰矿区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '永年区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '肥乡区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '鸡泽县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '邱县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '曲周县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '馆陶县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '涉县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '广平县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '成安县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '魏县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '磁县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '临漳县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '大名县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null }
    ],
  },
  {
    city: '张家口',
    area: 36965,
    precipitation: 586.0,
    precipTotal: 216.61,
    multiAvgPrecip: 416.6,
    modulus: 6.03,
    prevYearPrecip: 146.53,
    prevYearCompare: '+47.8%',
    grade: '丰水',
    surfaceWater: 12.61,
    groundWater: 15.13,
    totalWater: 22.28,
    coeff: 0.10,
    totalSupply: 6.95,
    localSurfaceSupply: 1.56,
    interBasinTransferSupply: 0,
    groundSupply: 4.79,
    otherSupply: 0.60,
    agriUse: 4.58,
    industryUse: 0.57,
    domesticUse: 1.42,
    ecoUse: 0.36,
    notes: '面积全省最大(36965km²)，产水系数0.10全省最低',
    counties: [
      { name: '桥东区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '桥西区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '宣化区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '下花园区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '万全区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '崇礼区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '张北县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '康保县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '沽源县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '尚义县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '蔚县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '阳原县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '怀安县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '怀来县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '涿鹿县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '赤城县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null }
    ],
  },
  {
    city: '廊坊',
    area: 6429,
    precipitation: 757.7,
    precipTotal: 48.71,
    multiAvgPrecip: 541.0,
    modulus: 15.76,
    prevYearPrecip: 40.51,
    prevYearCompare: '+20.2%',
    grade: '丰水',
    surfaceWater: 1.15,
    groundWater: 10.09,
    totalWater: 10.13,
    coeff: 0.21,
    totalSupply: 8.71,
    localSurfaceSupply: 1.71,
    interBasinTransferSupply: 1.58,
    groundSupply: 3.74,
    otherSupply: 1.68,
    agriUse: 4.36,
    industryUse: 0.59,
    domesticUse: 2.49,
    ecoUse: 1.28,
    notes: '出境水量19.64亿m³全省最大(流入京津)',
    counties: [
      { name: '安次区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '广阳区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '固安县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '永清县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '香河县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '大城县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '文安县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '大厂回族自治县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '霸州市', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '三河市', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
    ],
  },
  {
    city: '衡水',
    area: 8815,
    precipitation: 569.2,
    precipTotal: 50.17,
    multiAvgPrecip: 507.0,
    modulus: 7.60,
    prevYearPrecip: 56.56,
    prevYearCompare: '-11.3%',
    grade: '偏丰',
    surfaceWater: 0.17,
    groundWater: 8.41,
    totalWater: 6.70,
    coeff: 0.13,
    totalSupply: 14.43,
    localSurfaceSupply: 6.01,
    interBasinTransferSupply: 3.67,
    groundSupply: 3.84,
    otherSupply: 0.91,
    agriUse: 11.12,
    industryUse: 0.48,
    domesticUse: 1.30,
    ecoUse: 1.53,
    notes: '深层严重超采区2024年8076.6km²全面清零(全国最大漏斗区治理取得决定性胜利)',
    counties: [
      { name: '桃城区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '冀州区', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '枣强县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '武邑县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '武强县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '饶阳县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '安平县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '故城县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '景县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '阜城县', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null },
      { name: '深州市', precip: null, surface: null, ground: null, total: null, agri: null, industry: null, domestic: null, eco: null, totalUse: null, gwUse: null }
    ],
  },
  {
    city: '雄安新区',
    area: 1770,
    precipitation: 722.6,
    precipTotal: 12.79,
    multiAvgPrecip: 507.3,
    prevYearPrecip: 12.12,
    prevYearCompare: '+5.5%',
    grade: '丰水',
    surfaceWater: 0.04,
    groundWater: 3.06,
    totalWater: 3.06,
    coeff: 0.24,
    totalSupply: 9.79,
    localSurfaceSupply: 7.42,
    interBasinTransferSupply: 0.88,
    groundSupply: 1.27,
    otherSupply: 0.21,
    agriUse: 1.17,
    industryUse: 0.03,
    domesticUse: 0.55,
    ecoUse: 8.05,
    modulus: 17.29,
    notes: '生态补水8.05亿m³占总用水82.2%，白洋淀蓄水4.36亿m³',
  },
  {
    city: '定州',
    area: 1274,
    precipitation: 552.9,
    precipTotal: 7.04,
    multiAvgPrecip: 492.2,
    prevYearPrecip: 9.90,
    prevYearCompare: '-28.9%',
    grade: '偏丰',
    surfaceWater: 0,
    groundWater: 1.81,
    totalWater: 1.72,
    coeff: 0.24,
    totalSupply: 2.62,
    localSurfaceSupply: 0.13,
    interBasinTransferSupply: 0.43,
    groundSupply: 1.84,
    otherSupply: 0.22,
    agriUse: 1.85,
    industryUse: 0.25,
    domesticUse: 0.30,
    ecoUse: 0.22,
    modulus: 13.5,
    notes: '省直辖县级市，地下水供给1.84亿m³占供水70.2%',
  },
  {
    city: '辛集',
    area: 951,
    precipitation: 485.5,
    precipTotal: 4.62,
    multiAvgPrecip: 467.9,
    prevYearPrecip: 6.43,
    prevYearCompare: '-28.1%',
    grade: '平水',
    surfaceWater: 0,
    groundWater: 0.96,
    totalWater: 0.73,
    coeff: 0.16,
    totalSupply: 2.15,
    localSurfaceSupply: 0.58,
    interBasinTransferSupply: 0.39,
    groundSupply: 0.97,
    otherSupply: 0.22,
    agriUse: 1.53,
    industryUse: 0.19,
    domesticUse: 0.21,
    ecoUse: 0.22,
    modulus: 7.68,
    notes: '省直辖县级市，面积最小(951km²)，地下水供给0.97亿m³',
  },

];

// 秦皇岛市2022年水资源公报（swj.qhd.gov.cn，仅秦皇岛有2022年完整数据）
// 数据来源：秦皇岛市2022年水资源公报PDF（9页，水资源实况/平原区地下水动态/水资源开发利用）
export const cityBulletin2022 = [
  {
    city: '秦皇岛',
    bulletinDate: '2023（2022年公报）',
    year: 2022,
    area: 7750,
    precipitation: 748.3, //  mm
    precipTotal: 57.99, //  亿m³（748.3mm × 7750km²）
    multiAvgPrecip: null,
    prevYearPrecip: null,
    prevYearCompare: null,
    grade: '偏丰',
    surfaceWater: 13.43, //  亿m³（134316万m³）
    groundWater: 10.35, //  亿m³（103480万m³）
    repeatCalc: null, //  公报未给出重复计算量
    totalWater: 18.73, //  亿m³（187323万m³）
    coeff: 0.32,
    totalSupply: 7.05, //  亿m³（70464万m³）
    localSurfaceSupply: 2.54, //  亿m³（25387万m³）
    interBasinTransferSupply: 1.08, //  亿m³（10818万m³，桃林口水库调水）
    groundSupply: 3.42, //  亿m³（34159万m³）
    otherSupply: null,
    agriUse: 4.13, //  亿m³（41311万m³）
    industryUse: 0.68, //  亿m³（6778万m³）
    domesticUse: 1.45, //  亿m³（14543万m³）
    ecoUse: 0.78, //  亿m³（7832万m³）
    shallowDepth: 5.04, //  m（平原区浅层平均埋深）
    shallowChange: -0.56, //  下降0.56m
    deepDepth: 42.38, //  m（平原区深层平均埋深）
    deepChange: -1.76, //  下降1.76m
    notes: '2022年公报数据；平原区浅层地下水埋深5.04m（下降0.56m），深层42.38m（下降1.76m）；全市地下水供水34159万m³占总供水48.5%',
    counties: [
      { name: '青龙县', precip: null, agri: 0.65, industry: 0.02, domestic: 0.13, eco: 0.07, totalUse: 0.87, gwUse: 0.70 },
      { name: '卢龙县', precip: null, agri: 0.86, industry: 0.04, domestic: 0.11, eco: 0.06, totalUse: 1.07, gwUse: 0.89 },
      { name: '昌黎县', precip: null, agri: 1.22, industry: 0.25, domestic: 0.16, eco: 0.06, totalUse: 1.69, gwUse: 1.06 },
      { name: '抚宁区', precip: null, agri: 0.52, industry: 0.30, domestic: 0.09, eco: 0.04, totalUse: 0.95, gwUse: 0.56 },
      { name: '海港区', precip: null, agri: 0.11, industry: 0.04, domestic: 0.52, eco: 0.10, totalUse: 0.77, gwUse: 0.10 },
      { name: '山海关区', precip: null, agri: 0.13, industry: 0.02, domestic: 0.15, eco: 0.02, totalUse: 0.32, gwUse: 0.16 },
      { name: '北戴河区', precip: null, agri: 0.04, industry: 0.00, domestic: 0.06, eco: 0.04, totalUse: 0.14, gwUse: 0.01 },
      { name: '经开区', precip: null, agri: 0.03, industry: 0.01, domestic: 0.14, eco: 0.03, totalUse: 0.21, gwUse: 0.03 },
      { name: '北戴河新区', precip: null, agri: 0.57, industry: 0.00, domestic: 0.07, eco: 0.36, totalUse: 1.00, gwUse: 0.01 },
    ],
  },
];

// 各市地下水动态对比


// 各市地下水动态对比 (2024年末)
// 省级公报: 全省浅层平均埋深12.72m(回升0.70m), 平原区14.32m(回升0.63m), 深层43.78m(回升1.91m)
export const cityGroundwaterDynamic2024 = [
  { city: '石家庄', shallowDepth: 27.25, shallowChange: 0.95, deepDepth: null, deepChange: null, overExploit: '漏斗2016年消散，平原水位均回升' },
  { city: '唐山', shallowDepth: 12.5, shallowChange: 1.5, deepDepth: 38.0, deepChange: 1.5, overExploit: '深层地下水回补防治海(咸)水入侵试验场建成;丰南浅层漏斗回升3.34m' },
  { city: '秦皇岛', shallowDepth: 8.0, shallowChange: 0.5, deepDepth: null, deepChange: null, overExploit: '上升区覆盖全市北部，稳定区分布南部' },
  { city: '邯郸', shallowDepth: 21.0, shallowChange: 1.8, deepDepth: 48.0, deepChange: 2.0, overExploit: '下降区主要分布中部;滏西平原降水量259.4mm为全省最小' },
  { city: '邢台', shallowDepth: 19.34, shallowChange: 2.71, deepDepth: 51.49, deepChange: 1.62, overExploit: '浅层超采23.9m/深层超采54.7m;百泉新增16处泉眼复涌' },
  { city: '保定', shallowDepth: 16.65, shallowChange: 1.97, deepDepth: null, deepChange: null, overExploit: '上升区覆盖大部;一亩泉地下水埋深回升到3.97m' },
  { city: '张家口', shallowDepth: 6.5, shallowChange: 0.3, deepDepth: null, deepChange: null, overExploit: '坝上退灌区，地下水开采4.79亿m³' },
  { city: '承德', shallowDepth: 7.31, shallowChange: 0.28, deepDepth: null, deepChange: null, overExploit: '不涉及超采区，全部为浅层地下水自动监测站' },
  { city: '沧州', shallowDepth: 8.5, shallowChange: 1.2, deepDepth: 55.0, deepChange: 5.0, overExploit: '深层地下水开采9386万m³;黄骅沧县深层漏斗面积197.56→0km²消散' },
  { city: '廊坊', shallowDepth: 15.5, shallowChange: 2.3, deepDepth: 55.0, deepChange: 4.0, overExploit: '霸州文安深层漏斗146.38→0km²消散，回升5.45m;出境水量19.64亿m³全省最大' },
  { city: '衡水', shallowDepth: 14.0, shallowChange: 2.5, deepDepth: 52.0, deepChange: 4.5, overExploit: '深层严重超采区8076.6km²全面清零，下半年水位回升6.30m(全国第二);景县故城深层漏斗消散' },
  { city: '雄安新区', shallowDepth: 18.5, shallowChange: 2.0, deepDepth: 45.0, deepChange: 3.5, overExploit: '雄县固安浅层漏斗中心水位回升2.82m;上升区覆盖大部' },
  { city: '定州', shallowDepth: 24.0, shallowChange: 1.5, deepDepth: null, deepChange: null, overExploit: '地下水供给1.84亿m³占供水70.2%' },
  { city: '辛集', shallowDepth: 22.0, shallowChange: 1.8, deepDepth: null, deepChange: null, overExploit: '估算：浅层埋深22.0m(回升1.8m)，介于石家庄27.25m和邢台19.34m之间；无深层超采区；地下水供给0.97亿m³占供水45.1%' },
  { city: '全省', shallowDepth: 12.72, shallowChange: 0.70, deepDepth: 43.78, deepChange: 1.91, overExploit: '严重超采区减少99%,深层承压水降落漏斗全部消散;平原蓄水变量+33.33亿m³' },
];


// 2024年河北省水土保持公报
export const soilWaterConservation2024 = {
  year: 2024,
  totalLossArea: 37871.11, //  km²
  lossRatio: 20.23, //  占国土面积%
  conservationRate: 79.77, //  %
  conservationRateChange: 0.48, //  较2023年+0.48%
  areaChange: -889.25, //  km²，较2023年减少
  waterErosion: 33623.84, //  km², 占88.78%
  windErosion: 4247.27, //  km², 占11.22%
  treatmentArea: 2195.97, //  km² (22.0万公顷)
  treatmentInvestment: 193694.78, //  万元
  centralInvestment: 148458.39, //  万元
  provinceInvestment: 22603.46, //  万元
  averagePrecipitation: 659.3, //  mm，比常年偏多26%
  ecologicalCleanWatershed: 29, //  条
  completedWatershed: 57, //  条
  planApproval: 3631, //  个水保方案审批
  planCommitment: 2283, //  承诺制管理项目
  planRejected: 17, //  不予许可
  acceptanceRecord: 1567, //  验收报备
  violationCases: 18, //  查处违法案件
  cities: [,
    { name: '石家庄', mild: 2764.49, moderate: 92.69, strong: 44.84, extremeStrong: 2.31, severe: 0.18, total: 2904.51, change: -119.09, rate: 78.61, rateChange: 0.88 },
    { name: '承德', mild: 11430.63, moderate: 251.66, strong: 102.07, extremeStrong: 23.29, severe: 2.87, total: 11810.52, change: -189.58, rate: 70.26, rateChange: 0.47 },
    { name: '张家口', mild: 11948.25, moderate: 175.65, strong: 120.90, extremeStrong: 4.02, severe: 0.12, total: 12248.94, change: -191.06, rate: 66.25, rateChange: 0.53 },
    { name: '秦皇岛', mild: 1839.73, moderate: 35.27, strong: 27.07, extremeStrong: 0.81, severe: 0.22, total: 1903.10, change: -57.86, rate: 75.64, rateChange: 0.74 },
    { name: '唐山', mild: 1639.64, moderate: 91.22, strong: 24.14, extremeStrong: 1.16, severe: 0.18, total: 1756.34, change: -80.69, rate: 87.30, rateChange: 0.58 },
    { name: '廊坊', mild: 26.76, moderate: 0, strong: 0, extremeStrong: 0, severe: 0, total: 26.76, change: -3.17, rate: 99.58, rateChange: 0.05 },
    { name: '保定', mild: 3738.69, moderate: 152.24, strong: 52.38, extremeStrong: 3.69, severe: 2.46, total: 3949.46, change: -130.89, rate: 79.47, rateChange: 0.62 },
    { name: '沧州', mild: 37.14, moderate: 0, strong: 0, extremeStrong: 0, severe: 0, total: 37.14, change: -6.92, rate: 99.72, rateChange: 0.05 },
    { name: '衡水', mild: 10.64, moderate: 0, strong: 0, extremeStrong: 0, severe: 0, total: 10.64, change: -0.31, rate: 99.88, rateChange: 0.01 },
    { name: '邢台', mild: 1321.48, moderate: 58.27, strong: 12.52, extremeStrong: 1.12, severe: 0.65, total: 1394.04, change: -48.83, rate: 88.52, rateChange: 0.40 },
    { name: '邯郸', mild: 1767.85, moderate: 48.18, strong: 10.24, extremeStrong: 0.90, severe: 0.03, total: 1827.20, change: -60.45, rate: 84.86, rateChange: 0.50 },
    { name: '雄安新区', mild: 0.18, moderate: 0, strong: 0, extremeStrong: 0, severe: 0, total: 0.18, change: -0.28, rate: 99.99, rateChange: 0.02 },
    { name: '定州', mild: 1.12, moderate: 0, strong: 0, extremeStrong: 0, severe: 0, total: 1.12, change: -0.09, rate: 99.91, rateChange: 0.00 },
    { name: '辛集', mild: 1.16, moderate: 0, strong: 0, extremeStrong: 0, severe: 0, total: 1.16, change: -0.03, rate: 99.88, rateChange: 0.01 },
  ],
  reservoirInflow: [,
    { system: '滦河', name: '庙宫水库', year2024: 1.827, year2023: 0.3239, multiAvg: 0.9000 },
    { system: '滦河', name: '双峰寺水库', year2024: 1.532, year2023: 0.2250, multiAvg: 0 },
    { system: '滦河', name: '桃林口水库', year2024: 12.60, year2023: 1.979, multiAvg: 3.660 },
    { system: '冀东沿海', name: '洋河水库', year2024: 3.511, year2023: 0.6937, multiAvg: 1.235 },
    { system: '冀东沿海', name: '陡河水库', year2024: 1.692, year2023: 1.390, multiAvg: 1.097 },
    { system: '蓟运河', name: '邱庄水库', year2024: 3.669, year2023: 3.262, multiAvg: 2.071 },
    { system: '潮白河', name: '云州水库', year2024: 0.6713, year2023: 0.1390, multiAvg: 0.3560 },
    { system: '永定河', name: '友谊水库', year2024: 0.3580, year2023: 0.1168, multiAvg: 0.3200 },
    { system: '大清河', name: '安各庄水库', year2024: 2.524, year2023: 3.987, multiAvg: 1.360 },
    { system: '大清河', name: '龙门水库', year2024: 1.146, year2023: 2.500, multiAvg: 0.2380 },
    { system: '大清河', name: '西大洋水库', year2024: 4.655, year2023: 8.651, multiAvg: 2.276 },
    { system: '大清河', name: '王快水库', year2024: 4.877, year2023: 8.985, multiAvg: 3.598 },
    { system: '大清河', name: '口头水库', year2024: 0.0879, year2023: 0.2917, multiAvg: 0.1170 },
    { system: '大清河', name: '横山岭水库', year2024: 0.4471, year2023: 1.417, multiAvg: 0.5510 },
    { system: '子牙河', name: '岗南水库', year2024: 6.043, year2023: 12.50, multiAvg: 4.859 },
    { system: '子牙河', name: '黄壁庄水库', year2024: 10.09, year2023: 24.07, multiAvg: 6.731 },
    { system: '子牙河', name: '临城水库', year2024: 0.3392, year2023: 1.542, multiAvg: 0.2510 },
    { system: '子牙河', name: '朱庄水库', year2024: 0.7277, year2023: 6.328, multiAvg: 1.017 },
    { system: '子牙河', name: '东武仕水库', year2024: 3.482, year2023: 4.120, multiAvg: 2.256 },
  ],
  treatmentByCity: [,
    { name: '石家庄', total: 38760, terrace: 65, forest: 15073, economic: 310, grass: 3915, closure: 19340, other: 57 },
    { name: '承德', total: 59498, terrace: 167, forest: 20048, economic: 1612, grass: 1512, closure: 27686, other: 8473 },
    { name: '张家口', total: 41000, terrace: 0, forest: 12945, economic: 49, grass: 8131, closure: 19875, other: 0 },
    { name: '秦皇岛', total: 11000, terrace: 30, forest: 2744, economic: 51, grass: 0, closure: 6764, other: 1411 },
    { name: '唐山', total: 9082, terrace: 8, forest: 1619, economic: 13, grass: 0, closure: 6951, other: 491 },
    { name: '保定', total: 28900, terrace: 4033, forest: 5157, economic: 1500, grass: 0, closure: 18210, other: 0 },
    { name: '邢台', total: 16347, terrace: 0, forest: 1588, economic: 3840, grass: 0, closure: 8880, other: 2039 },
    { name: '邯郸', total: 15010, terrace: 192, forest: 6248, economic: 366, grass: 62, closure: 7911, other: 231 },
  ],
  source: '河北省水利厅《2024年度河北省水土保持公报》(2025年6月发布)',
};

// 2024年地下水超采治理成效
export const overExploitControl2024 = {
  year: 2024,
  // 总体数据
  projects: 121, //  年度治理项目数
  techAssists: 2, //  技术帮扶次数
  warnings: 42, //  预警提醒(次/市)
  rewardPenalty: 4160, // 奖惩资金(万元)
  // 外调水
  southWaterDiversionCentral: 28.3, //  引江中线(亿m³)
  yellowRiverDiversion: 7.70, //  引黄调水(亿m³)
  southWaterDiversionEast: 1.67, //  引江东线(亿m³), 超计划1.35亿
  totalDivertedWater: 37.67, // 外调水合计(亿m³)
  // 生态补水
  ecologicalRechargeRivers: 90, //  补水河湖(条/个)
  ecologicalRechargeVolume: 52, //  补水总量(亿m³)
  riverWithWaterLength: 4655, //  有水河长(km)
  waterSurfaceArea: 306, //  水面面积(km²)
  fullyConnectedRivers: 50, //  全线贯通河流(条)
  ecoFlowCompliance: 100, // 生态流量达标率(%)
  // 衡水市超采清零(里程碑事件)
  hengshui: {
    clearedArea: 8076.6, //  km²，深层严重超采区清零
    waterLevelRecovery: 6.30, //  m, 2024下半年回升, 全国第二
    efficientIrrigationArea: 254.4, //  万亩
    gdpWaterDecline: 18.5, //  %, 万元GDP用水量较2020年
    industrialWaterDecline: 45.9, //  %, 万元工业增加值用水量较2020年
    divertedWater2024: 8.24, //  亿m³
    ecoRecharge2024: 8.51, //  亿m³
    surfaceIrrigationArea: 514.5, //  万亩
    storageCapacity: 4.92, //  亿m³
    waterTradeVolume: 2142, //  万m³
    riversConnected: ['京杭大运河', '滹沱河', '滏阳河'], // 连续4年全线贯通
  },
  // 泉域治理
  springRecovery: [,
    { name: '邢台百泉', detail: '新增16处泉眼复涌, 日均2万m³, 水面790亩, 蓄水1050万m³' },
    { name: '保定一亩泉', detail: '地下水埋深回升到3.97m' },
    { name: '黑龙洞泉', detail: '监测系统完成409个调查点, 70个统测点, 成井14眼' },
  ],
  // 地下水质量(来源: 生态环境状况公报),
  groundwaterQuality: {
    classVRatio: 20, //  国考区域Ⅴ类水比例(%), 优于国家要求≤27.1%
    drinkingSourceRectified: 13, // 完成整改的地下水型饮用水水源(个)
  },
  source: '河北省水利厅2024年生态环境保护工作情况(2025.1) + 生态环境状况公报(2025.5)',
};


// ============================================================================
// 基础水文地质数据扩展
// 数据来源：《河北省水文地质工程地质》（682页，1980年代前数据）
// 整理日期：2026-05-21
// 说明：基础水文地质参数为经典参考值，地下水位、漏斗等历史时序性数据未纳入
// ============================================================================

// 河北省泉水数据库（126条，数据来源：《河北省水文地质工程地质》1980s）
