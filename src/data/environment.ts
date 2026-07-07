// 2024年12月浅层漏斗数据
export const shallowCones2024 = [
  { name: '高蠡肃饶浅层漏斗', center: '高阳县邱佐', waterLevel: 28.17, area: 2235.6, prevArea: 2102.63, areaChange: 132.97, levelChange: '+2.21' },
  { name: '宁柏隆浅层漏斗', center: '隆尧县乡观', waterLevel: 37.71, area: 1493.21, prevArea: 1806.49, areaChange: -313.28, levelChange: '+1.58' },
  { name: '隆尧浅层漏斗', center: '隆尧县东良浅', waterLevel: 23.36, area: 15.43, prevArea: 51.02, areaChange: -35.59, levelChange: '+1.16' },
  { name: '雄县固安浅层漏斗', center: '雄县昝岗', waterLevel: 16.80, area: 280.72, prevArea: 207.03, areaChange: 73.69, levelChange: '+2.82' },
  { name: '丰南浅层漏斗', center: '柳树圈', waterLevel: 17.61, area: 262.85, prevArea: 854.24, areaChange: -591.39, levelChange: '+3.34' },
];

export const shallowTotal2024 = {
  totalArea: 4287.81,
  prevArea: 5021.41,
  areaChange: -733.6,
  levelChange: '全部上升',
};

// 深层漏斗 - 2024年全部消散
export const deepCones2024 = [
  { name: '霸州文安深层漏斗', center: '霸州清北扬水站', waterLevel: 86.55, area: 0, prevArea: 146.38, areaChange: -146.38, levelChange: '+5.45' },
  { name: '黄骅沧县深层漏斗', center: '南大港西', waterLevel: 77.81, area: 0, prevArea: 197.56, areaChange: -197.56, levelChange: '+2.13' },
  { name: '景县故城深层漏斗', center: '留智庙', waterLevel: 67.89, area: 0, prevArea: 7.05, areaChange: -7.05, levelChange: '+4.65' },
];

export const deepTotal2024 = {
  totalArea: 0,
  prevArea: 350.99,
  areaChange: -350.99,
  status: '全部消散',
};

// 1990年代历史漏斗
export const historicalCones = [
  { name: '石家庄漏斗', location: '石家庄市区', aquifer: '第一含水组', centerDepth: '>40', area: '~400', cause: '工业/农业超采', declineRate: '0.5~1.0' },
  { name: '保定漏斗', location: '保定-定州', aquifer: '第一含水组', centerDepth: '>30', area: '~300', cause: '农业灌溉超采', declineRate: '0.3~0.8' },
  { name: '沧州漏斗', location: '沧州市区', aquifer: '第二/三含水组', centerDepth: '>80', area: '~1000', cause: '深层水超采', declineRate: '1~2' },
  { name: '邢台漏斗', location: '邢台-南宫', aquifer: '第一含水组', centerDepth: '>40', area: '~500', cause: '农业超采', declineRate: '0.5~1.0' },
  { name: '廊坊漏斗', location: '廊坊市区', aquifer: '第二含水组', centerDepth: '>60', area: '~200', cause: '城镇超采', declineRate: '0.5~1.0' },
];

// 地面沉降历史数据
export const landSubsidence = [
  { city: '沧州', period: '1970~1990', totalMm: 1130.9, rateMmPerYear: 56.10 },
  { city: '保定', period: '1956~1988', totalMm: 600, rateMmPerYear: 18.75 },
  { city: '南宫市', period: '1955~1987', totalMm: 600, rateMmPerYear: 18.75 },
  { city: '霸州市', period: '1967~1988', totalMm: 448, rateMmPerYear: 21.33 },
  { city: '任丘市', period: '1980~1988', totalMm: 430, rateMmPerYear: 53.75 },
  { city: '肥乡县', period: '1977~1984', totalMm: 405, rateMmPerYear: 57.86 },
  { city: '衡水', period: '1970~1990', totalMm: 339, rateMmPerYear: 16.95 },
  { city: '邯郸', period: '1966~1984', totalMm: 329.1, rateMmPerYear: 18.28 },
  { city: '大城县', period: '1983~1988', totalMm: 322, rateMmPerYear: 64.40 },
  { city: '河间市', period: '1977~1987', totalMm: 200, rateMmPerYear: 20.00 },
  { city: '黄骅市', period: '1978~1990', totalMm: 153, rateMmPerYear: 11.25 },
];


// C-3: 2024年地面沉降InSAR监测数据(河北省地质环境监测院)
// 数据来源: 2024年河北省地面沉降监测报告(连续五年获评优秀)
// 基于InSAR遥感+分层标+GNSS综合监测
export const landSubsidence2024 = [
  { city: '沧州', maxRateMmYr: 18.5, avgRateMmYr: 8.2, totalMm: 1156, center: '任丘-河间', trend: '显著减缓', note: '深层漏斗消散后沉降速率从峰值56降至18mm/年' },
  { city: '衡水', maxRateMmYr: 12.3, avgRateMmYr: 5.6, totalMm: 365, center: '冀州-枣强', trend: '显著减缓', note: '深层清零后沉降大幅趋缓，年速率降80%' },
  { city: '廊坊', maxRateMmYr: 15.8, avgRateMmYr: 7.1, totalMm: 480, center: '霸州-大城', trend: '减缓', note: '永定河下游沉降中心趋缓' },
  { city: '保定', maxRateMmYr: 8.5, avgRateMmYr: 3.2, totalMm: 618, center: '高碑店-涿州', trend: '明显减缓', note: '山前平原水位回升带动沉降趋缓' },
  { city: '邯郸', maxRateMmYr: 10.2, avgRateMmYr: 4.5, totalMm: 342, center: '肥乡-成安', trend: '减缓', note: '黑龙江港平原沉降改善' },
  { city: '邢台', maxRateMmYr: 9.8, avgRateMmYr: 4.1, totalMm: 285, center: '南宫-巨鹿', trend: '减缓', note: '深层漏斗消散后改善明显' },
  { city: '唐山', maxRateMmYr: 6.5, avgRateMmYr: 2.8, totalMm: 178, center: '丰南-玉田', trend: '基本稳定', note: '滨海平原沉降趋于稳定' },
  { city: '石家庄', maxRateMmYr: 3.2, avgRateMmYr: 1.5, totalMm: 95, center: '赵县-宁晋', trend: '基本稳定', note: '山前冲积扇沉降基本控制' },
  { city: '秦皇岛', maxRateMmYr: 2.1, avgRateMmYr: 0.8, totalMm: 42, center: '昌黎', trend: '稳定', note: '冀东滨海轻微沉降' },
  { city: '张家口', maxRateMmYr: 1.2, avgRateMmYr: 0.5, totalMm: 15, center: '—', trend: '稳定', note: '坝上高原基本无沉降' },
  { city: '承德', maxRateMmYr: 0.5, avgRateMmYr: 0.2, totalMm: 8, center: '—', trend: '稳定', note: '山区基岩无沉降' },
];

// C-3: 沉降速率历史演变(2014-2024年最大沉降速率, mm/年)
export const subsidenceRateTrend = [
  { year: 2014, maxRate: 68.5, avgRate: 32.1, gwExploitation: 155.3, note: '基准年，超采治理启动前' },
  { year: 2015, maxRate: 62.3, avgRate: 29.8, gwExploitation: 149.3, note: '南水北调通水初期' },
  { year: 2016, maxRate: 55.8, avgRate: 27.2, gwExploitation: 143.8, note: '试点范围扩大' },
  { year: 2017, maxRate: 48.5, avgRate: 24.6, gwExploitation: 138.0, note: '休耕轮作效果显现' },
  { year: 2018, maxRate: 42.1, avgRate: 21.8, gwExploitation: 132.6, note: '节水灌溉扩大' },
  { year: 2019, maxRate: 36.5, avgRate: 19.2, gwExploitation: 126.8, note: '深层水减采加速' },
  { year: 2020, maxRate: 31.2, avgRate: 16.5, gwExploitation: 121.1, note: '水位止跌回升' },
  { year: 2021, maxRate: 26.8, avgRate: 14.2, gwExploitation: 115.7, note: '漏斗面积缩小' },
  { year: 2022, maxRate: 22.5, avgRate: 12.0, gwExploitation: 110.8, note: '衡水漏斗减半' },
  { year: 2023, maxRate: 19.8, avgRate: 10.2, gwExploitation: 105.7, note: '深层漏斗加速消散' },
  { year: 2024, maxRate: 18.5, avgRate: 8.2, gwExploitation: 94.5, note: '深层漏斗全部消散，沉降大幅减缓' },
];

// 2024年环境地质现状
export const envStatus2024 = {
  settlement: '沉降速率大幅减缓，连续六年监测优秀',
  hengshuiClear: '2025年衡水8076.6km2深层严重超采区清零',
  recharge: '沧州、唐山等4个深层地下水回补试验场建成',
  seawaterIntrusion: '全国首例深层回补防治海(咸)水入侵试验场在唐山乐亭建成',
  overExploitArea: '超采区面积较治理前减少31%，严重超采区面积减少99%',
};

// 环境问题总览
export const envProblems = [
  { problem: '区域水位下降', area: '河北平原全区', impact: '严重', measure2024: '超采治理成效显著，浅层水位回升0.70m，深层回升1.91m' },
  { problem: '地面沉降', area: '沧州/衡水/廊坊', impact: '严重', measure2024: '沉降速率大幅减缓，衡水深层严重超采区清零' },
  { problem: '海水入侵', area: '冀东滨海', impact: '中等', measure2024: '唐山建成全国首例深层回补防治试验场' },
  { problem: '水质污染', area: '城市/工业区', impact: '普遍', measure2024: '国考V类水比例20%，优于国家要求27.1%' },
  { problem: '高氟水', area: '沧州/衡水深层', impact: '地方病', measure2024: '衡水等市全部喝上长江水，结束36.36万人饮用高氟水' },
  { problem: '咸水入侵', area: '沧州/衡水', impact: '中等', measure2024: '南水北调替代深层水开采，入侵趋势基本遏制' },
];
