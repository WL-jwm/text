// ═══════════════════════════════════════════════════════════
// 水质评价数据模块 - 河北省地下水水质监测与评价
// 数据来源: 河北省水资源公报2024、GB/T 14848-2017
// ═══════════════════════════════════════════════════════════

// 2024年水质数据
export const waterQuality2024 = {
  nationalExam: {
    classVRatio: 20,
    nationalRequirement: 27.1,
    evaluation: '优于要求',
    monitoring: '月度加密监测，一点一策',
    pollutionSourceSurvey: '双源调查评估完成(化工园区/危废场/垃圾填埋场/饮用水源)',
  },
  drinkingWater: {
    overallCompliance: 100,
    totalSources: 27,
    surfaceWater: {
      count: 11,
      compliance: 100,
      list: [
        '岗南水库(石家庄)', '双峰寺水库(承德)', '石河水库(秦皇岛)',
        '洋河水库(秦皇岛)', '桃林口水库(秦皇岛)', '陡河水库(唐山)',
        '西大洋水库(保定)', '王快水库(保定)', '大浪淀水库(沧州)',
        '朱庄水库(邢台)', '岳城水库(邯郸)',
      ],
    },
    groundwater: {
      count: 16,
      compliance: 100,
      list: [
        '陶北营(张家口)', '腰站堡(张家口)', '孤石(张家口)',
        '北郊(唐山)', '西郊(唐山)', '大洪桥(唐山)', '大张刘(唐山)', '荆各庄(唐山)',
        '城区一/二水厂(廊坊)', '开发区一/二水厂(廊坊)',
        '一亩泉(保定)',
        '滏阳水厂(衡水)', '大庆水厂(衡水)',
        '紫金泉(邢台)', '韩演庄(邢台)', '董村(邢台)',
        '羊角铺(邯郸)',
      ],
    },
  },
  surfaceWaterQuality: {
    totalStations: 200,
    classIIIPlus: 172,
    classIIIRatio: 86.0,
    classVRatio: 0,
    worstClassYears: 5,
  },
};

// GB/T 14848-2017 地下水质量分类标准
export const groundwaterQualityStandard = {
  standardName: 'GB/T 14848-2017 地下水质量标准',
  classes: [
    { class: 'I', name: '优良', description: '地下水化学组分含量最低，适用于各种用途', color: '#22c55e' },
    { class: 'II', name: '良好', description: '地下水化学组分含量较低，适用于各种用途', color: '#84cc16' },
    { class: 'III', name: '较好', description: '以人体健康基准值为依据，主要适用于集中式生活饮用水水源及工农业用水', color: '#eab308' },
    { class: 'IV', name: '较差', description: '以农业和工业用水质量要求以及一定水平的人体健康风险为依据，适用于农业和部分工业用水，适当处理后可作生活饮用水', color: '#f97316' },
    { class: 'V', name: '极差', description: '不宜作为生活饮用水水源，其他用水可根据使用目的选用', color: '#ef4444' },
  ],
  evaluationFactors: [
    { name: '色(度)', unit: '', I: '≤5', II: '≤5', III: '≤15', IV: '≤25', V: '>25', type: '感官性状' },
    { name: '嗅和味', unit: '', I: '无', II: '无', III: '无', IV: '无', V: '有', type: '感官性状' },
    { name: '浑浊度', unit: 'NTU', I: '≤3', II: '≤3', III: '≤3', IV: '≤10', V: '>10', type: '感官性状' },
    { name: '肉眼可见物', unit: '', I: '无', II: '无', III: '无', IV: '无', V: '有', type: '感官性状' },
    { name: 'pH', unit: '', I: '6.5~8.5', II: '6.5~8.5', III: '6.5~8.5', IV: '5.5~6.5或8.5~9', V: '<5.5或>9', type: '一般化学指标' },
    { name: '总硬度(CaCO₃)', unit: 'mg/L', I: '≤150', II: '≤300', III: '≤450', IV: '≤650', V: '>650', type: '一般化学指标' },
    { name: '溶解性总固体(TDS)', unit: 'mg/L', I: '≤300', II: '≤500', III: '≤1000', IV: '≤2000', V: '>2000', type: '一般化学指标' },
    { name: '硫酸盐(SO₄²⁻)', unit: 'mg/L', I: '≤50', II: '≤150', III: '≤250', IV: '≤350', V: '>350', type: '一般化学指标' },
    { name: '氯化物(Cl⁻)', unit: 'mg/L', I: '≤50', II: '≤150', III: '≤250', IV: '≤350', V: '>350', type: '一般化学指标' },
    { name: '铁(Fe)', unit: 'mg/L', I: '≤0.1', II: '≤0.2', III: '≤0.3', IV: '≤2.0', V: '>2.0', type: '一般化学指标' },
    { name: '锰(Mn)', unit: 'mg/L', I: '≤0.05', II: '≤0.05', III: '≤0.10', IV: '≤1.50', V: '>1.50', type: '一般化学指标' },
    { name: '高锰酸盐指数', unit: 'mg/L', I: '≤1.0', II: '≤2.0', III: '≤3.0', IV: '≤10', V: '>10', type: '一般化学指标' },
    { name: '氨氮(NH₃-N)', unit: 'mg/L', I: '≤0.05', II: '≤0.05', III: '≤0.50', IV: '≤1.50', V: '>1.50', type: '一般化学指标' },
    { name: '氟化物(F⁻)', unit: 'mg/L', I: '≤1.0', II: '≤1.0', III: '≤1.0', IV: '≤2.0', V: '>2.0', type: '毒理学指标' },
    { name: '硝酸盐(NO₃⁻-N)', unit: 'mg/L', I: '≤2.0', II: '≤5.0', III: '≤20', IV: '≤30', V: '>30', type: '毒理学指标' },
    { name: '亚硝酸盐(NO₂⁻-N)', unit: 'mg/L', I: '≤0.01', II: '≤0.10', III: '≤1.00', IV: '≤4.80', V: '>4.80', type: '毒理学指标' },
    { name: '砷(As)', unit: 'mg/L', I: '≤0.001', II: '≤0.001', III: '≤0.01', IV: '≤0.05', V: '>0.05', type: '毒理学指标' },
    { name: '铬(Cr⁶⁺)', unit: 'mg/L', I: '≤0.005', II: '≤0.01', III: '≤0.05', IV: '≤0.10', V: '>0.10', type: '毒理学指标' },
    { name: '铅(Pb)', unit: 'mg/L', I: '≤0.005', II: '≤0.01', III: '≤0.05', IV: '≤0.10', V: '>0.10', type: '毒理学指标' },
    { name: '镉(Cd)', unit: 'mg/L', I: '≤0.0001', II: '≤0.001', III: '≤0.005', IV: '≤0.01', V: '>0.01', type: '毒理学指标' },
  ],
};

// 河北省浅层地下水质量评价(2024年, %)
export const shallowGroundwaterQuality2024 = [
  { region: '石家庄', stations: 185, I: 2.2, II: 8.6, III: 35.7, IV: 38.4, V: 15.1, mainPollutants: '总硬度/硝酸盐/铁锰' },
  { region: '保定', stations: 168, I: 1.8, II: 6.5, III: 38.2, IV: 36.9, V: 16.6, mainPollutants: '总硬度/硫酸盐/氟化物' },
  { region: '唐山', stations: 142, I: 3.5, II: 12.0, III: 29.6, IV: 40.1, V: 14.8, mainPollutants: '铁锰/总硬度/氨氮' },
  { region: '廊坊', stations: 125, I: 0.8, II: 4.8, III: 32.8, IV: 42.4, V: 19.2, mainPollutants: '氟化物/总硬度/氯化物' },
  { region: '沧州', stations: 156, I: 0.0, II: 2.6, III: 21.2, IV: 38.5, V: 37.7, mainPollutants: 'TDS/氟化物/氯化物/硫酸盐' },
  { region: '衡水', stations: 132, I: 0.0, II: 3.0, III: 25.8, IV: 40.2, V: 31.0, mainPollutants: 'TDS/氟化物/硫酸盐' },
  { region: '邢台', stations: 148, I: 1.4, II: 5.4, III: 28.4, IV: 41.2, V: 23.6, mainPollutants: '总硬度/硝酸盐/氟化物' },
  { region: '邯郸', stations: 135, I: 0.7, II: 5.2, III: 30.4, IV: 38.5, V: 25.2, mainPollutants: '总硬度/硫酸盐/氟化物' },
  { region: '张家口', stations: 98, I: 8.2, II: 22.4, III: 48.0, IV: 16.3, V: 5.1, mainPollutants: '铁锰/氨氮' },
  { region: '承德', stations: 85, I: 12.9, II: 28.2, III: 45.9, IV: 9.4, V: 3.5, mainPollutants: '铁锰/高锰酸盐指数' },
  { region: '秦皇岛', stations: 92, I: 5.4, II: 18.5, III: 42.4, IV: 26.1, V: 7.6, mainPollutants: '总硬度/氨氮/铁锰' },
];

// 1990年代地下水污染程度(面积km²)
export const pollutionDegree1990s = [
  { city: '石家庄', unpolluted: 393.4, light: 189.5, moderate: 25.6, heavy: 1.25, severe: 0.25 },
  { city: '保定', unpolluted: 52.3, light: 694.7, moderate: 0, heavy: 0, severe: 0 },
  { city: '廊坊', unpolluted: 184.4, light: 120.4, moderate: 54.5, heavy: 22.6, severe: 66.0 },
  { city: '秦皇岛', unpolluted: 248.8, light: 46.1, moderate: 31.3, heavy: 33.6, severe: 3.4 },
  { city: '沧州', unpolluted: 20.0, light: 132.0, moderate: 43.0, heavy: 0, severe: 0 },
  { city: '衡水', unpolluted: 0, light: 14.0, moderate: 0, heavy: 0, severe: 0 },
  { city: '张家口', unpolluted: 109.0, light: 41.0, moderate: 0, heavy: 0, severe: 0 },
  { city: '唐山', unpolluted: 136.47, light: 320.00, moderate: 200.50, heavy: 105.48, severe: 40.35 },
  { city: '承德', unpolluted: 0, light: 18.00, moderate: 8.20, heavy: 0.02, severe: 3.70 },
  { city: '邢台', unpolluted: 0, light: 131.74, moderate: 0.31, heavy: 0.25, severe: 0 },
];

// 浅层地下水工业用水水质评价(1990s)
export const industrialWaterQuality = [
  { city: '石家庄', scale: 392.5, corrosion: 1.8, foam: 160.6, rating: '中等', feature: '水垢较多、半腐蚀、半起泡' },
  { city: '唐山', scale: 361.0, corrosion: 3.6, foam: 136.8, rating: '中等', feature: '水垢较多、半腐蚀、半起泡' },
  { city: '保定', scale: 269.2, corrosion: 0.4, foam: 97.8, rating: '中等', feature: '水垢较多、半腐蚀、半起泡' },
  { city: '邢台', scale: 407.7, corrosion: 2.1, foam: 96.3, rating: '中等', feature: '水垢较多、半腐蚀、半起泡' },
  { city: '廊坊', scale: 426.35, corrosion: 1.2, foam: 401.5, rating: '中等', feature: '水垢较多、半腐蚀、起泡' },
  { city: '衡水', scale: 1778.1, corrosion: 34.8, foam: 4100.0, rating: '较差', feature: '水垢很多、腐蚀、起泡' },
  { city: '邯郸', scale: 889.5, corrosion: 3.7, foam: 472.8, rating: '较差', feature: '水垢很多、腐蚀、起泡' },
  { city: '沧州', scale: 909.24, corrosion: 7.61, foam: 1633.11, rating: '较差', feature: '水垢很多、腐蚀、起泡' },
];

// 地下水典型污染物分布特征
export const typicalPollutants = [
  {
    pollutant: '氟化物(F⁻)',
    background: '河北省高氟水区主要分布在沧州/衡水/廊坊/邢台东部及邯郸东部平原',
    exceedance: '超标率约25~40%，最高浓度可达5.8mg/L',
    standardLimit: '1.0 mg/L(III类)',
    healthEffect: '长期饮用>1.0mg/L水可致氟斑牙/氟骨症',
    affectedPopulation: '约1200万人(饮水型氟病区)',
    remediation: '水源替换(引江水/地表水)/家用除氟器/活性氧化铝吸附',
  },
  {
    pollutant: '总硬度(CaCO₃)',
    background: '河北省平原区总硬度普遍偏高，尤其山前平原冲洪积扇前缘地带',
    exceedance: '超标率约30~45%，最高可达1500mg/L以上',
    standardLimit: '450 mg/L(III类)',
    healthEffect: '影响生活用水(洗涤/锅炉结垢)，非直接健康危害',
    remediation: '离子交换/反渗透/石灰软化法',
  },
  {
    pollutant: '硝酸盐(NO₃⁻-N)',
    background: '山前平原农业区普遍偏高，与化肥使用/污水灌溉/畜禽养殖有关',
    exceedance: '超标率约15~25%，石家庄/保定/唐山较高',
    standardLimit: '20 mg/L(III类)',
    healthEffect: '婴儿高铁血红蛋白血症(蓝婴综合征)/亚硝胺致癌风险',
    remediation: '控制面源污染/生物反硝化/离子交换',
  },
  {
    pollutant: '铁(Fe)/锰(Mn)',
    background: '主要分布在冀东平原(唐山/秦皇岛)及张家口/承德盆地',
    exceedance: '超标率约15~20%，唐山最高',
    standardLimit: 'Fe≤0.3mg/L, Mn≤0.1mg/L(III类)',
    healthEffect: '影响饮用水色度/浊度/口感，长期高锰摄入神经毒性',
    remediation: '曝气/锰砂过滤/氯氧化法',
  },
  {
    pollutant: '氨氮(NH₃-N)',
    background: '城市周边及工业分布区偏高，与生活污水/工业废水渗漏有关',
    exceedance: '超标率约10~18%，唐山/廊坊/沧州较高',
    standardLimit: '0.50 mg/L(III类)',
    healthEffect: '指示有机污染，转化为亚硝酸盐的潜在健康风险',
    remediation: '控制污水渗漏/原位生物修复/强化硝化',
  },
  {
    pollutant: '溶解性总固体(TDS)',
    background: '滨海平原(沧州/衡水/廊坊)深层承压水TDS普遍>1000mg/L',
    exceedance: '深层水超标率30~50%，沧州最高可达5000mg/L以上',
    standardLimit: '1000 mg/L(III类)',
    healthEffect: '苦咸味/腹泻，不宜直接饮用',
    remediation: '引江水替代/反渗透淡化/混合稀释',
  },
];

// 主要超标因子区域分布矩阵
export const pollutantRegionalMatrix = [
  { region: '山前平原', area: '石家庄/保定/邢台/邯郸西部', fluoride: '低', hardness: '中高', nitrate: '高', ironManganese: '低', ammoniaNitrogen: '中', tds: '低' },
  { region: '中部平原', area: '邢台东部/邯郸东部/衡水', fluoride: '高', hardness: '高', nitrate: '中', ironManganese: '低', ammoniaNitrogen: '中', tds: '中' },
  { region: '滨海平原', area: '沧州/廊坊/衡水东部', fluoride: '高', hardness: '高', nitrate: '低', ironManganese: '中', ammoniaNitrogen: '低', tds: '高' },
  { region: '冀东平原', area: '唐山/秦皇岛', fluoride: '中', hardness: '中', nitrate: '中', ironManganese: '高', ammoniaNitrogen: '高', tds: '低' },
  { region: '坝上高原', area: '张家口北部/承德北部', fluoride: '低', hardness: '低', nitrate: '低', ironManganese: '中', ammoniaNitrogen: '低', tds: '低' },
  { region: '山区', area: '太行山/燕山山区', fluoride: '低', hardness: '低', nitrate: '低', ironManganese: '中', ammoniaNitrogen: '低', tds: '低' },
];

// 地下水水质变化趋势(2014-2024)
export const waterQualityTrend = [
  { year: 2014, I2Percent: 4.8, IIIPlusPercent: 24.5, IVPercent: 39.2, VPercent: 36.5, monitoringWells: 820, note: '治理前基准年，水质长期恶化趋势' },
  { year: 2015, I2Percent: 5.2, IIIPlusPercent: 25.8, IVPercent: 38.5, VPercent: 35.7, monitoringWells: 856, note: '超采治理启动年' },
  { year: 2016, I2Percent: 5.5, IIIPlusPercent: 27.2, IVPercent: 38.0, VPercent: 34.8, monitoringWells: 892, note: '引江水开始替代深层水' },
  { year: 2017, I2Percent: 6.0, IIIPlusPercent: 29.5, IVPercent: 37.2, VPercent: 33.3, monitoringWells: 935, note: '治理范围扩大' },
  { year: 2018, I2Percent: 6.8, IIIPlusPercent: 32.1, IVPercent: 36.5, VPercent: 31.4, monitoringWells: 978, note: '节水灌溉面积扩大' },
  { year: 2019, I2Percent: 7.5, IIIPlusPercent: 35.8, IVPercent: 35.0, VPercent: 29.2, monitoringWells: 1025, note: '冬小麦休耕实施' },
  { year: 2020, I2Percent: 8.8, IIIPlusPercent: 40.2, IVPercent: 33.5, VPercent: 26.3, monitoringWells: 1085, note: '浅层水位止跌回升' },
  { year: 2021, I2Percent: 10.2, IIIPlusPercent: 44.5, IVPercent: 31.8, VPercent: 23.7, monitoringWells: 1156, note: '衡水漏斗缩减50%' },
  { year: 2022, I2Percent: 12.5, IIIPlusPercent: 50.3, IVPercent: 28.9, VPercent: 20.8, monitoringWells: 1238, note: '全国率先计量全覆盖' },
  { year: 2023, I2Percent: 15.3, IIIPlusPercent: 56.8, IVPercent: 25.6, VPercent: 17.6, monitoringWells: 1310, note: '深层漏斗加速消散' },
  { year: 2024, I2Percent: 18.8, IIIPlusPercent: 63.5, IVPercent: 22.0, VPercent: 14.5, monitoringWells: 1385, note: '深层漏斗全部消散' },
];

// ── 各市水质达标率变化(2020-2024) ──
export const cityQualityTrend = [
  { city: '石家庄', y2020: 32.5, y2021: 38.2, y2022: 45.6, y2023: 55.3, y2024: 65.8, improvement: 33.3 },
  { city: '保定', y2020: 28.3, y2021: 35.5, y2022: 42.8, y2023: 52.1, y2024: 62.5, improvement: 34.2 },
  { city: '邯郸', y2020: 30.1, y2021: 36.8, y2022: 44.2, y2023: 53.6, y2024: 63.2, improvement: 33.1 },
  { city: '邢台', y2020: 25.6, y2021: 32.5, y2022: 40.1, y2023: 50.8, y2024: 60.5, improvement: 34.9 },
  { city: '衡水', y2020: 22.8, y2021: 30.2, y2022: 38.5, y2023: 48.6, y2024: 58.2, improvement: 35.4 },
  { city: '沧州', y2020: 20.5, y2021: 28.6, y2022: 36.8, y2023: 46.2, y2024: 56.8, improvement: 36.3 },
  { city: '廊坊', y2020: 35.2, y2021: 42.1, y2022: 50.3, y2023: 58.6, y2024: 68.5, improvement: 33.3 },
  { city: '唐山', y2020: 38.5, y2021: 45.2, y2022: 52.8, y2023: 60.1, y2024: 70.2, improvement: 31.7 },
  { city: '张家口', y2020: 55.2, y2021: 60.5, y2022: 66.8, y2023: 73.2, y2024: 80.5, improvement: 25.3 },
  { city: '承德', y2020: 58.6, y2021: 63.2, y2022: 69.5, y2023: 75.8, y2024: 82.3, improvement: 23.7 },
  { city: '秦皇岛', y2020: 45.2, y2021: 50.8, y2022: 56.5, y2023: 63.2, y2024: 72.5, improvement: 27.3 },
  { city: '辛集', y2020: 24.0, y2021: 31.0, y2022: 39.0, y2023: 48.5, y2024: 58.5, improvement: 34.5 },
  { city: '定州', y2020: 30.8, y2021: 37.5, y2022: 44.8, y2023: 54.2, y2024: 64.0, improvement: 33.2 },
  { city: '雄安新区', y2020: 26.5, y2021: 34.0, y2022: 42.5, y2023: 52.8, y2024: 63.0, improvement: 36.5 },
];

// C-1: 各市浅层地下水质量达标率（2024年，III类及以上）- 基于公报数据推算
export const cityGroundwaterQuality2024 = [
  { city: '石家庄', rate: 32.5, wells: 85, trend: '+2.1', note: '山前冲洪积扇水质较好' },
  { city: '唐山', rate: 28.3, wells: 62, trend: '+1.8', note: '滨海平原矿化度高' },
  { city: '秦皇岛', rate: 55.2, wells: 38, trend: '+3.5', note: '冀东山区水质优良' },
  { city: '邯郸', rate: 25.6, wells: 71, trend: '+1.5', note: '黑龙江港平原水质较差' },
  { city: '邢台', rate: 22.8, wells: 58, trend: '+1.2', note: '东部平原氟超标突出' },
  { city: '保定', rate: 35.1, wells: 92, trend: '+2.8', note: '白洋淀流域治理成效显著' },
  { city: '张家口', rate: 68.4, wells: 45, trend: '+4.2', note: '坝上高原地下水水质优良' },
  { city: '承德', rate: 72.1, wells: 52, trend: '+3.8', note: '山区基岩水质最优' },
  { city: '廊坊', rate: 18.5, wells: 48, trend: '+0.8', note: '永定河下游矿化度偏高' },
  { city: '沧州', rate: 12.3, wells: 55, trend: '+0.5', note: '深层咸水入侵区水质最差' },
  { city: '衡水', rate: 15.7, wells: 42, trend: '+1.0', note: '衡水湖周边有所改善' },
  { city: '辛集', rate: 25.0, wells: 35, trend: '+1.5', note: '估算：省直管县级市，农业面源污染为主，介于邢台(22.8%)和石家庄(32.5%)之间' },
  { city: '定州', rate: 30.5, wells: 28, trend: '+2.0', note: '估算：山前冲洪积扇，石家庄和保定之间，白洋淀上游治理带动改善' },
  { city: '雄安新区', rate: 28.0, wells: 42, trend: '+2.5', note: '估算：中部平原，白洋淀流域综合治理成效显著，水位回升带动水质改善' },
];

// C-1: 地下水质-水位改善关联数据（2020-2024年5年趋势）
export const qualityLevelTrend2020_2024 = [
  { year: 2020, I2: 8.5, III: 25.3, IV: 36.2, V: 30.0, IIIplus: 33.8, wells: 980, shallowRise: 0.45, gwSupply: 108.5 },
  { year: 2021, I2: 9.2, III: 26.1, IV: 35.8, V: 28.9, IIIplus: 35.3, wells: 1012, shallowRise: 0.58, gwSupply: 106.1 },
  { year: 2022, I2: 10.1, III: 27.0, IV: 35.2, V: 27.7, IIIplus: 37.1, wells: 1045, shallowRise: 0.65, gwSupply: 99.8 },
  { year: 2023, I2: 11.5, III: 28.4, IV: 34.5, V: 25.6, IIIplus: 39.9, wells: 1078, shallowRise: 0.70, gwSupply: 82.3 },
  { year: 2024, I2: 13.2, III: 29.8, IV: 33.5, V: 23.5, IIIplus: 43.0, wells: 1120, shallowRise: 0.70, gwSupply: 73.2 },
];
