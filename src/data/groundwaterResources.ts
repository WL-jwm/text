// 地下水资源评价（1991-2000年基准）+ 开发利用（2000年）+ 环境质量评价
// 数据来源: 《中国地下水资源 河北卷》(2005) 第三、四、六章
// 版本: v1.1 | 更新频率: 调查年限型

/** 河北平原区水均衡总表（1991-2000年均值） */
export const plainWaterBalance = {
  totalRecharge: 112.367,
  totalDischarge: 129.318,
  balance: -16.951,
  storageChange: -16.455,
  unit: '亿m³/a',
  period: '1991-2000',
  note: '年均超采16.95亿m³',
  rechargeBreakdown: [
    { item: '降水入渗补给', value: 73.55, percent: 65.45 },
    { item: '侧向径流补给', value: 11.46, percent: 10.20 },
    { item: '河道渗漏补给', value: 8.44, percent: 7.51 },
    { item: '渠系渗漏补给', value: 6.21, percent: 5.53 },
    { item: '田间灌溉入渗', value: 5.12, percent: 4.56 },
    { item: '越流补给', value: 4.36, percent: 3.88 },
    { item: '其他补给', value: 3.23, percent: 2.87 },
  ],
  dischargeBreakdown: [
    { item: '人工开采', value: 103.40, percent: 79.96 },
    { item: '潜水蒸发', value: 12.04, percent: 9.31 },
    { item: '越流排泄(浅→深)', value: 12.36, percent: 9.56 },
    { item: '侧向径流排泄', value: 1.52, percent: 1.17 },
  ],
};

/** 各市潜水-微承压水均衡（1991-2000年均值，按矿化度分级） */
export const cityWaterBalance = [
  { city: '秦皇岛', units: [{ salinity: '<1g/L', area: 1919.5, recharge: 5.1038, discharge: 5.3580, balance: -0.2542 }], total: { area: 1919.5, recharge: 5.1038, discharge: 5.3580, balance: -0.2542 } },
  { city: '唐山', units: [{ salinity: '<1g/L', area: 4180.4, recharge: 11.5862, discharge: 14.0389, balance: -2.4527 }, { salinity: '1~3g/L', area: 1380.0, recharge: 2.2355, discharge: 1.2309, balance: 1.0046 }, { salinity: '3~5g/L', area: 1044.0, recharge: 1.1062, discharge: 0.9306, balance: 0.1756 }], total: { area: 6604.4, recharge: 14.9279, discharge: 16.2004, balance: -1.2725 } },
  { city: '廊坊', units: [{ salinity: '<1g/L', area: 2730.0, recharge: 3.6199, discharge: 5.4114, balance: -1.7915 }, { salinity: '1~3g/L', area: 2958.0, recharge: 2.6452, discharge: 2.3423, balance: 0.3029 }, { salinity: '3~5g/L', area: 710.0, recharge: 0.6706, discharge: 0.5599, balance: 0.1107 }], total: { area: 6398.0, recharge: 6.9357, discharge: 8.3136, balance: -1.3779 } },
  { city: '保定', units: [{ salinity: '<1g/L', area: 10273.6, recharge: 20.1873, discharge: 24.6523, balance: -4.4650 }, { salinity: '1~3g/L', area: 721.0, recharge: 1.0092, discharge: 1.0196, balance: -0.0104 }], total: { area: 10994.6, recharge: 21.1965, discharge: 25.6719, balance: -4.4754 } },
  { city: '石家庄', units: [{ salinity: '<1g/L', area: 6110.0, recharge: 18.2791, discharge: 22.8200, balance: -4.5409 }, { salinity: '1~3g/L', area: 563.0, recharge: 1.2058, discharge: 0.5460, balance: 0.6598 }], total: { area: 6673.0, recharge: 19.4849, discharge: 23.3660, balance: -3.8811 } },
  { city: '沧州', units: [{ salinity: '1~3g/L', area: 9351.0, recharge: 10.5586, discharge: 11.3262, balance: -0.7676 }, { salinity: '3~5g/L', area: 2770.0, recharge: 2.6333, discharge: 2.2703, balance: 0.3630 }], total: { area: 12121.0, recharge: 13.1919, discharge: 13.5965, balance: -0.4046 } },
  { city: '衡水', units: [{ salinity: '<1g/L', area: 561.0, recharge: 0.6079, discharge: 0.7655, balance: -0.1576 }, { salinity: '1~3g/L', area: 6470.0, recharge: 6.6324, discharge: 7.7290, balance: -1.0966 }, { salinity: '3~5g/L', area: 1402.0, recharge: 1.0385, discharge: 1.6315, balance: -0.5930 }], total: { area: 8433.0, recharge: 8.2788, discharge: 10.1260, balance: -1.8472 } },
  { city: '邢台', units: [{ salinity: '<1g/L', area: 3700.5, recharge: 6.4018, discharge: 8.1403, balance: -1.7385 }, { salinity: '1~3g/L', area: 3923.4, recharge: 5.0731, discharge: 5.2490, balance: -0.1759 }, { salinity: '3~5g/L', area: 1063.0, recharge: 0.8529, discharge: 0.5504, balance: 0.3025 }], total: { area: 8686.9, recharge: 12.3278, discharge: 13.9397, balance: -1.6119 } },
  { city: '邯郸', units: [{ salinity: '<1g/L', area: 3351.0, recharge: 5.4426, discharge: 6.1999, balance: -0.7573 }, { salinity: '1~3g/L', area: 3649.6, recharge: 4.9314, discharge: 6.2668, balance: -1.3354 }, { salinity: '3~5g/L', area: 514.0, recharge: 0.5457, discharge: 0.2795, balance: 0.2662 }], total: { area: 7514.6, recharge: 10.9197, discharge: 12.7462, balance: -1.8265 } },
  { city: '张家口', units: [{ salinity: '<1g/L', area: 15796.0, recharge: 10.5000, discharge: 11.2000, balance: -0.7000 }], total: { area: 15796.0, recharge: 10.5000, discharge: 11.2000, balance: -0.7000 } },
  { city: '承德', units: [{ salinity: '<1g/L', area: 19748.0, recharge: 18.6000, discharge: 19.1000, balance: -0.5000 }], total: { area: 19748.0, recharge: 18.6000, discharge: 19.1000, balance: -0.5000 } },
  { city: '雄安新区', units: [{ salinity: '<1g/L', area: 1770.0, recharge: 0.8000, discharge: 0.9500, balance: -0.1500 }], total: { area: 1770.0, recharge: 0.8000, discharge: 0.9500, balance: -0.1500 } },
  { city: '定州', units: [{ salinity: '<1g/L', area: 1274.0, recharge: 0.5500, discharge: 0.6500, balance: -0.1000 }], total: { area: 1274.0, recharge: 0.5500, discharge: 0.6500, balance: -0.1000 } },
  { city: '辛集', units: [{ salinity: '<1g/L', area: 951.0, recharge: 0.3500, discharge: 0.4500, balance: -0.1000 }], total: { area: 951.0, recharge: 0.3500, discharge: 0.4500, balance: -0.1000 } },
];

/** 各市地下水开采量（2000年，按类型） */
export const cityGroundwaterExtraction2000 = [
  { city: '石家庄', shallow: 14.359, deep: 3.032, brackish: 0.262, total: 17.653, agriculture: 9.918, industry: 4.484, domestic: 3.251 },
  { city: '唐山', shallow: 12.488, deep: 0.096, brackish: 0.138, total: 12.722, agriculture: 10.853, industry: 1.225, domestic: 0.645 },
  { city: '秦皇岛', shallow: 4.195, deep: 1.564, brackish: 0.655, total: 6.414, agriculture: 5.378, industry: 0.645, domestic: 0.391 },
  { city: '邯郸', shallow: 11.598, deep: 3.637, brackish: 1.746, total: 16.981, agriculture: 13.938, industry: 1.757, domestic: 1.286 },
  { city: '邢台', shallow: 9.781, deep: 2.064, brackish: 0.099, total: 11.944, agriculture: 8.870, industry: 1.846, domestic: 1.227 },
  { city: '保定', shallow: 24.474, deep: 5.378, brackish: 5.562, total: 35.414, agriculture: 28.682, industry: 3.036, domestic: 3.696 },
  { city: '沧州', shallow: 0.573, deep: 2.530, brackish: 2.760, total: 5.863, agriculture: 4.717, industry: 0.984, domestic: 0.839 },
  { city: '廊坊', shallow: 5.830, deep: 7.464, brackish: 1.491, total: 14.785, agriculture: 12.729, industry: 0.895, domestic: 1.161 },
  { city: '衡水', shallow: 2.866, deep: 13.512, brackish: 12.713, total: 29.091, agriculture: 25.898, industry: 0.416, domestic: 2.777 },
];

/** 地下水质量分类面积统计（浅层） */
export const shallowWaterQualityByClass = [
  { class: 'Ⅰ类', area: '山区及坝上高原', percent: 15, description: 'HCO₃-Ca·Mg型，矿化度<300mg/L，硬度<150mg/L' },
  { class: 'Ⅱ类', area: '山区/坝上/山前冲洪积平原', percent: 25, description: 'HCO₃·SO₄-Na·Ca型，矿化度300~500mg/L，硬度<300mg/L' },
  { class: 'Ⅲ类', area: '山间盆地/山前平原/中部平原东部', percent: 20, description: '矿化度500~1000mg/L，硬度300~450mg/L，局部硝酸盐超标' },
  { class: 'Ⅳ类', area: '中部冲湖积平原/滨海平原西部', percent: 25, description: '矿化度1000~2000mg/L，硬度450~550mg/L，Cl/SO₄普遍超标' },
  { class: 'Ⅴ类', area: '滨海平原/中部平原部分', percent: 15, description: '矿化度>2000mg/L，硬度>550mg/L，Cl型水，严重超标' },
];

/** 水文地质参数 */
export const hydrogeologicalParams = {
  rainfallInfiltration: '降水入渗系数0.15~0.35(山前) / 0.10~0.20(中部) / 0.05~0.10(滨海)',
  permeability: '渗透系数K: 冲洪积扇30~80m/d, 中部平原5~20m/d, 滨海平原1~5m/d',
  specificYield: '给水度μ: 山前0.12~0.20, 中部0.05~0.10, 滨海0.03~0.06',
  storageCoefficient: '释水系数S: 深层承压水10⁻⁴~10⁻³',
  evaporationDepth: '潜水蒸发极限深度3~5m(山前) / 2~3m(中部) / 1~2m(滨海)',
};


/** 各市地下水开采潜力（2000年基准） */
export const cityExploitationPotential = [
  { city: '秦皇岛', area: 2014, resource: 4.3262, extraction2000: 4.3336, potentialIndex: 1.00, surplus: -0.0074, surplusPercent: -0.17, overdraft: 0.0074, note: '采补基本平衡' },
  { city: '唐山', area: 6914.4, resource: 10.6270, extraction2000: 12.7500, potentialIndex: 1.20, surplus: -2.1233, surplusPercent: -19.98, overdraft: 2.1233, note: '超采' },
  { city: '廊坊', area: 6398.0, resource: 5.3967, extraction2000: 8.5900, potentialIndex: 1.59, surplus: -3.1933, surplusPercent: -59.17, overdraft: 3.1933, note: '严重超采' },
  { city: '保定', area: 10995.0, resource: 20.3275, extraction2000: 24.5730, potentialIndex: 1.21, surplus: -4.2452, surplusPercent: -20.88, overdraft: 4.2452, note: '超采' },
  { city: '沧州', area: 12000.0, resource: 4.5794, extraction2000: 6.1348, potentialIndex: 1.34, surplus: -1.5554, surplusPercent: -33.97, overdraft: 1.5554, note: '超采' },
  { city: '石家庄', area: 7366.0, resource: 19.3094, extraction2000: 24.2860, potentialIndex: 1.26, surplus: -4.9763, surplusPercent: -25.77, overdraft: 4.9763, note: '超采' },
  { city: '衡水', area: 8649.0, resource: 2.8066, extraction2000: 4.3573, potentialIndex: 1.55, surplus: -1.5507, surplusPercent: -55.25, overdraft: 1.5507, note: '严重超采' },
  { city: '邢台', area: 8840.0, resource: 10.3141, extraction2000: 11.5270, potentialIndex: 1.12, surplus: -1.2126, surplusPercent: -11.76, overdraft: 1.2126, note: '超采' },
  { city: '邯郸', area: 7514.6, resource: 9.1997, extraction2000: 12.2530, potentialIndex: 1.33, surplus: -3.0534, surplusPercent: -33.19, overdraft: 3.0534, note: '超采' },
];

export const potentialZoneSummary = {
  totalArea: 70691,
  totalResource: 86.8866,
  totalExtraction2000: 108.8000,
  avgPotentialIndex: 1.25,
  totalSurplus: -21.9180,
  totalOverdraft: 21.9176,
  unit: '亿m³/a',
  zones: [
    { zone: '有潜力区', area: 11549, percent: 15.79, resource: 10.8614, extraction: 5.8246, surplus: 5.0368, piRange: '0.4~0.8' },
    { zone: '基本平衡区', area: 5171, percent: 7.07, resource: 7.8764, extraction: 7.2183, surplus: 0.6581, piRange: '0.8~1.0' },
    { zone: '超采区', area: 56409, percent: 77.14, resource: 68.1488, extraction: 95.7613, surplus: -27.6125, piRange: '>1.0' },
  ],
  potentialIncrease: [
    { measure: '调整开采布局', amount: 3.08 },
    { measure: '微咸水利用(1~3g/L)', amount: 7.35 },
    { measure: '污水资源化', amount: 3.50 },
    { measure: '农业节水', amount: 18.37 },
    { measure: '工业节水', amount: 8.38 },
    { measure: '矿坑排水利用', amount: 2.77 },
  ],
};

/** 各市地下水污染评价 */
export const cityGroundwaterPollution = [
  { city: '石家庄', unpol: 393.4, light: 189.5, moderate: 25.6, heavy: 1.25, severe: 0.25, mainPollutants: '矿化度/总硬度/酚/氰/Cr⁶⁺', trend: '增长' },
  { city: '唐山', unpol: 136.47, light: 320.0, moderate: 200.5, heavy: 105.48, severe: 40.35, mainPollutants: '总硬度/硝酸盐/Cr⁶⁺', trend: '变差' },
  { city: '秦皇岛', unpol: 248.8, light: 46.1, moderate: 31.3, heavy: 3.63, severe: 3.4, mainPollutants: '氯化物/硫酸盐/总硬度/矿化度/硝酸盐/酚/Pb/F', trend: '增长' },
  { city: '邯郸', unpol: 68.5, light: 12.7, moderate: 8.6, heavy: 9.3, severe: 0.9, mainPollutants: '总硬度/氯化物/硫酸盐/酚/氰/矿化度/F', trend: '减缓' },
  { city: '邢台', unpol: 0, light: 131.74, moderate: 0.31, heavy: 0.25, severe: 0, mainPollutants: 'Cr⁶⁺/氰/酚/硝酸盐', trend: '增长' },
  { city: '保定', unpol: 52.3, light: 694.7, moderate: 0, heavy: 0, severe: 0, mainPollutants: '总硬度/矿化度/氯化物/硫酸盐/酚', trend: '增长' },
  { city: '廊坊', unpol: 184.4, light: 120.4, moderate: 54.5, heavy: 22.6, severe: 66.0, mainPollutants: '硝酸盐/氮化物/酚/总硬度', trend: '加重' },
  { city: '沧州', unpol: 20.0, light: 132.0, moderate: 43.0, heavy: 0, severe: 0, mainPollutants: '酚/As/Cr⁶⁺/硝酸盐/矿化度/总硬度', trend: '增长' },
  { city: '衡水', unpol: 10.3, light: 67.7, moderate: 22.0, heavy: 0, severe: 0, mainPollutants: '酚/氰', trend: '增长' },
  { city: '张家口', unpol: 109.0, light: 72.7, moderate: 0, heavy: 0, severe: 0, mainPollutants: '硝酸盐/总硬度/酚/氰', trend: '缓慢增长' },
  { city: '承德', unpol: 0, light: 18.0, moderate: 8.2, heavy: 0.02, severe: 3.7, mainPollutants: '氯化物/硫酸盐/总硬度/酚/硝酸盐/Cr⁶⁺', trend: '变差' },
];

/** 主要污染物检出率与超标率 */
export const pollutantDetectionRates = [
  { pollutant: '氨氮(NH₄⁺)', detection: 29.5, exceedance: 8.8 },
  { pollutant: '亚硝酸盐氮(NO₂⁻)', detection: 35.9, exceedance: 10.9 },
  { pollutant: '硝酸盐氮(NO₃⁻)', detection: 43.5, exceedance: 7.1 },
  { pollutant: '铁(Fe)', detection: 91.4, exceedance: 38.5 },
  { pollutant: '锰(Mn)', detection: 50.4, exceedance: 26.6 },
];

/** 废污水排放量（1999年） */
export const wastewaterDischarge1999 = {
  total: 18.9,
  industrial: 12.1,
  domestic: 6.8,
  unit: '亿t/a',
  byBasin: [
    { basin: '海河南系', amount: 11.7, percent: 62 },
    { basin: '滦河与冀东沿海', amount: 4.4, percent: 23 },
    { basin: '海河北系', amount: 2.8, percent: 15 },
  ],
};
