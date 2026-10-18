/**
 * 河北省地下水资源公报数据
 * 说明: cityBulletin2024 按城市拆分至 bulletinCities/ 子目录
 */

import { shijiazhuang2024 } from './bulletinCities/shijiazhuang2024';
import { cangzhou2024 } from './bulletinCities/cangzhou2024';
import { chengde2024 } from './bulletinCities/chengde2024';
import { xingtai2024 } from './bulletinCities/xingtai2024';
import { baoding2024 } from './bulletinCities/baoding2024';
import { tangshan2024 } from './bulletinCities/tangshan2024';
import { qinhuangdao2024 } from './bulletinCities/qinhuangdao2024';
import { handan2024 } from './bulletinCities/handan2024';
import { zhangjiakou2024 } from './bulletinCities/zhangjiakou2024';
import { langfang2024 } from './bulletinCities/langfang2024';
import { hengshui2024 } from './bulletinCities/hengshui2024';
import { xiongan2024 } from './bulletinCities/xiongan2024';
import { dingzhou2024 } from './bulletinCities/dingzhou2024';
import { xinji2024 } from './bulletinCities/xinji2024';
import type { CityBulletin2024 } from './bulletinCities/types';

export const cityBulletin2024: CityBulletin2024[] = [shijiazhuang2024, cangzhou2024, chengde2024, xingtai2024, baoding2024, tangshan2024, qinhuangdao2024, handan2024, zhangjiakou2024, langfang2024, hengshui2024, xiongan2024, dingzhou2024, xinji2024];

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

