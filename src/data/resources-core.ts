// 2024年河北省水资源总量
export const waterResourceSummary2024 = {
  rainfall: { value: 659.3, unit: 'mm', yoyChange: '+12.8%', multiAvg: 520.8, multiChange: '+26.6%' },
  totalResource: { value: 247.92, unit: '亿m3', yoyChange: '+2.7%', multiAvg: 176.47, multiChange: '+40.5%' },
  surfaceWater: { value: 140.76, unit: '亿m3', multiAvg: 90.27, multiChange: '+55.9%' },
  groundwater: { value: 179.94, unit: '亿m3', multiAvg: 114.22, multiChange: '+57.5%' },
  perCapita: { value: 336, unit: 'm3/person' },
  runOffCoeff: { value: 0.20 },
  runOffModule: { value: 13.21, unit: '万m3/km2' },
};

// 历史对比数据
export const historicalComparison = {
  period1980s: { totalResource: 185.52, unit: '亿m3', source: '第六次地下水资源评价(1980s-1990s)' },
  year2024: { totalResource: 179.94, unit: '亿m3', source: '2024河北省水资源公报' },
};

// 2024年各市地下水资源量
export const cityGroundwater2024 = [
  { city: '石家庄', surface: 7.87, ground: 16.58, total: 18.83, coeff: 0.25 },
  { city: '唐山', surface: 23.55, ground: 19.74, total: 37.13, coeff: 0.31 },
  { city: '秦皇岛', surface: 26.08, ground: 15.15, total: 32.44, coeff: 0.40 },
  { city: '邯郸', surface: 5.78, ground: 12.51, total: 12.14, coeff: 0.22 },
  { city: '邢台', surface: 3.93, ground: 12.37, total: 13.07, coeff: 0.20 },
  { city: '保定', surface: 15.43, ground: 28.86, total: 32.26, coeff: 0.25 },
  { city: '张家口', surface: 12.61, ground: 15.13, total: 22.28, coeff: 0.10 },
  { city: '承德', surface: 37.41, ground: 23.31, total: 41.01, coeff: 0.15 },
  { city: '沧州', surface: 6.74, ground: 11.96, total: 16.42, coeff: 0.16 },
  { city: '廊坊', surface: 1.15, ground: 10.09, total: 10.13, coeff: 0.21 },
  { city: '衡水', surface: 0.17, ground: 8.41, total: 6.70, coeff: 0.13 },
  { city: '雄安新区', surface: 0.04, ground: 3.06, total: 3.06, coeff: 0.24 },
  { city: '定州', surface: 0, ground: 1.81, total: 1.72, coeff: 0.24 },
  { city: '辛集', surface: 0, ground: 0.96, total: 0.73, coeff: 0.16 },
];

// 2024年14市地下水供水量
export const cityWaterSupply2024 = [
  { city: '石家庄', gwSupply: 10.0561, totalSupply: 29.816, gwRatio: 33.7 },
  { city: '唐山', gwSupply: 10.412, totalSupply: 25.3106, gwRatio: 41.1 },
  { city: '秦皇岛', gwSupply: 3.418, totalSupply: 6.9567, gwRatio: 49.1 },
  { city: '邯郸', gwSupply: 7.7827, totalSupply: 19.5294, gwRatio: 39.9 },
  { city: '邢台', gwSupply: 6.9269, totalSupply: 18.4207, gwRatio: 37.6 },
  { city: '保定', gwSupply: 11.1105, totalSupply: 22.4497, gwRatio: 49.5 },
  { city: '张家口', gwSupply: 4.7875, totalSupply: 6.9457, gwRatio: 68.9 },
  { city: '承德', gwSupply: 4.1826, totalSupply: 7.3786, gwRatio: 56.7 },
  { city: '沧州', gwSupply: 2.8512, totalSupply: 15.2873, gwRatio: 18.7 },
  { city: '廊坊', gwSupply: 2.9044, totalSupply: 6.3699, gwRatio: 45.6 },
  { city: '衡水', gwSupply: 3.1908, totalSupply: 7.8705, gwRatio: 40.5 },
  { city: '雄安新区', gwSupply: 0.9867, totalSupply: 2.1969, gwRatio: 44.9 },
  { city: '定州', gwSupply: 2.1081, totalSupply: 3.0676, gwRatio: 68.7 },
  { city: '辛集', gwSupply: 0.97, totalSupply: 2.15, gwRatio: 45.1 },
];

// 地下水动态(2024)
export const groundwaterDynamic2024 = {
  shallowLevelRise: 0.70, //  全省平均回升m
  plainShallowRise: 0.63, //  平原区
  shallowRiseArea: 52.4, //  %
  shallowStableArea: 40.6, //  %
  shallowDeclineArea: 7.0, //  %
  deepLevelRise: 1.91, //  全省深层
  plainStorageChange: 33.33, //  亿m3, 正值表示储量增加
  overExploitDeepRise: 2.00, //  超采区深层
  overExploitShallowRise: 0.94, //  超采区浅层
  overExploitAreaReduction: 99, //  严重超采区面积减少%
  gwVolumeReduced: 1.79, //  压减开采量亿m3
  deepWaterSupply: 6.90, //  深层地下水供水量亿m3
  historicalExploitPeak: 154.9, //  1990年代
  currentTotal: 73.18, //  2024年
  declinePercent: 52.7, // %
};

// 水资源总量时序数据(近年)
export const resourceTimeSeries = [
  { year: '2018', total: 167.7, surface: 61.4, ground: 125.4 },
  { year: '2019', total: 214.8, surface: 96.3, ground: 139.3 },
  { year: '2020', total: 206.2, surface: 87.5, ground: 139.4 },
  { year: '2021', total: 226.9, surface: 106.1, ground: 142.5 },
  { year: '2022', total: 168.6, surface: 55.8, ground: 124.0 },
  { year: '2023', total: 241.35, surface: 121.85, ground: 182.75 },
  { year: '2024', total: 247.92, surface: 140.76, ground: 179.94 },
];

// 各市2024年水资源公报详细数据 (承德/邢台/保定为公报原文)
