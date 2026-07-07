// G-水化学与同位素 + J-咸水分布 + I-矿泉水 + H-地热 + K-盐碱土
// 数据来源: 1999基础文献 + 2024河北省水资源公报 + 第三次土壤普查
// 版本: v2.0 | 2026-05-17

// ─────────── 咸水分布数据 ───────────
export const salineWater = {
  distribution: {
    totalArea: 40000, // km2 (概数)
    totalStorage: 1793.85, // 亿m3
    note: '数据来源: 百科概数，精确数据待水资源基础调查(2024-2026)成果',
  },
  utilization: {
    status: '南水北调替代深层水开采后，咸水入侵趋势基本遏制',
    recharge: '沧州、唐山等4个深层地下水回补试验场建成',
    channels: '水资源基础调查(2024-2026)将出精确分布数据',
  },
};

// ─────────── 盐碱地数据 ───────────
export const salineAlkaliLand = {
  latest: {
    totalArea: 583.42, // 万亩
    arableLand: 570.25,
    wasteland: 13.17,
    distribution: '9个市35个县',
    source: '第三次全国土壤普查(2025.11发布)',
  },
  historical: [
    { city: '邯郸', total: 48, light: 17, medium: 20, heavy: 3, carbonate: 3, unknown: 5 },
    { city: '邢台', total: 104, light: 30, medium: 0, heavy: 48, carbonate: 5, unknown: 21 },
    { city: '衡水', total: 121, light: 22, medium: 12, heavy: 22, carbonate: 8, unknown: 57 },
    { city: '沧州', total: 440, light: 89, medium: 58, heavy: 186, carbonate: 14, unknown: 93 },
    { city: '廊坊', total: 110, light: 35, medium: 29, heavy: 26, carbonate: 13, unknown: 7 },
    { city: '唐山', total: 333, light: 0, medium: 0, heavy: 314, carbonate: 19, unknown: 0 },
    { city: '保定', total: 6, light: 0, medium: 0, heavy: 0, carbonate: 6, unknown: 0 },
  ],
  treatment: {
    highStandardFarm: 52,
    cangzhouWheat2024: { area: 154.7, yieldPerMu: 260, totalYield: 40.22, unit: '万亩/公斤/万吨' },
    rotationArea: 20,
    saltReduction: 60,
    zhangjiakouCoverage: 53.18,
  },
};

// ─────────── 水化学分类 ───────────
export const hydrochemistry = {
  sukaliefClassification: [
    { type: '重碳酸钙型(HCO3-Ca)', note: '山区、山前地带常见，水质良好', zone: '山前冲洪积扇', typicalTDS: '<500', percentage: '35%', color: '#10b981' },
    { type: '重碳酸硫酸钙型(HCO3-SO4-Ca)', note: '平原过渡带', zone: '冲洪积扇前缘', typicalTDS: '500~1000', percentage: '25%', color: '#06b6d4' },
    { type: '硫酸氯化物型(SO4-Cl)', note: '中部平原', zone: '中部冲积/湖积平原', typicalTDS: '1000~3000', percentage: '22%', color: '#f59e0b' },
    { type: '氯化物型(Cl-Na)', note: '滨海平原，咸水区', zone: '滨海平原', typicalTDS: '>3000', percentage: '18%', color: '#ef4444' },
  ],
};

// ─────────── 水化学水平分带(山前→滨海) ───────────
export const hydrochemicalZoning = [
  { zone: '补给径流区', location: '太行山/燕山山前', tdsRange: '<300 mg/L', mainIons: 'HCO3-Ca', hardnessType: '暂时硬度', phRange: '7.0~7.8', waterType: '淡水', color: '#10b981' },
  { zone: '径流过渡区', location: '冲洪积扇前缘', tdsRange: '300~1000 mg/L', mainIons: 'HCO3·SO4-Ca·Mg', hardnessType: '永久硬度增高', phRange: '7.2~8.0', waterType: '淡水/微咸', color: '#06b6d4' },
  { zone: '蒸发浓缩区', location: '中部平原', tdsRange: '1000~3000 mg/L', mainIons: 'SO4·Cl-Na', hardnessType: '永久硬度为主', phRange: '7.5~8.2', waterType: '微咸/半咸', color: '#f59e0b' },
  { zone: '咸水区', location: '滨海平原', tdsRange: '3000~50000 mg/L', mainIons: 'Cl-Na', hardnessType: '极高矿化', phRange: '7.8~8.5', waterType: '咸水/盐水', color: '#ef4444' },
];

// ─────────── 同位素水文数据 ───────────
export const isotopeData = {
  stableIsotopes: {
    note: '环境同位素(2H、18O、3H、14C)用于示踪地下水补径排条件与成因',
    dewLine: {
      description: '全球大气降水线: δD = 8δ18O + 10，河北地区: δD = 7.2δ18O + 4.5',
      intercept: 4.5,
      slope: 7.2,
      implications: '蒸发效应明显，δ18O富集2~4‰',
    },
    tritium: {
      description: '3H半衰期12.43年，1950s核试验峰值可识别现代水与古水',
      shallowWater: '3~20 TU，表明含现代水补给成分',
      deepWater: '<1 TU，表明为1950s以前入渗的古水',
      rechargeTime: '深层承压水14C年龄可达1~3万年',
    },
    carbon14: {
      description: '14C半衰期5730年，用于测定深层地下水年龄',
      shallowUnconfined: '现代至数百年',
      deepConfined: '5000~30000年(平原深层)',
      implication: '深层水更新极缓慢，超采后难以恢复',
    },
  },
  isotopicZoning: [
    { zone: '山前冲洪积扇', delta18O: '-9~-7‰', deltaD: '-65~-55‰', tritium: '5~20 TU', age: '现代~数百年', recharge: '大气降水入渗' },
    { zone: '中部冲积平原', delta18O: '-8~-6‰', deltaD: '-58~-48‰', tritium: '1~5 TU', age: '数百年~数千年', recharge: '山前侧向径流+降水入渗' },
    { zone: '滨海平原', delta18O: '-7~-4‰', deltaD: '-50~-35‰', tritium: '<1 TU', age: '数千年~数万年', recharge: '侧向径流(极其缓慢)' },
  ],
};


// C-5: 丰富同位素数据 — δD-δ18O样品点(典型采样点)
export const isotopeSamples = [
  // 山前冲洪积扇(现代降水补给)
  { id: 'S01', location: '石家庄鹿泉', depth: 25, type: 'shallow', delta18O: -8.5, deltaD: -62, tritium: 15.2, age: '现代', zone: '山前冲洪积扇', recharge: '降水入渗' },
  { id: 'S02', location: '保定满城', depth: 32, type: 'shallow', delta18O: -9.1, deltaD: -66, tritium: 18.5, age: '现代', zone: '山前冲洪积扇', recharge: '降水入渗' },
  { id: 'S03', location: '邢台沙河', depth: 18, type: 'shallow', delta18O: -8.8, deltaD: -63, tritium: 12.8, age: '现代', zone: '山前冲洪积扇', recharge: '降水入渗' },
  { id: 'S04', location: '邯郸武安', depth: 15, type: 'shallow', delta18O: -8.2, deltaD: -60, tritium: 14.5, age: '现代', zone: '山前冲洪积扇', recharge: '降水入渗' },
  { id: 'S05', location: '张家口蔚县', depth: 40, type: 'shallow', delta18O: -10.2, deltaD: -72, tritium: 16.8, age: '现代', zone: '山间盆地', recharge: '降水+融雪' },
  { id: 'S06', location: '承德兴隆', depth: 20, type: 'shallow', delta18O: -10.8, deltaD: -76, tritium: 19.2, age: '现代', zone: '燕山山区', recharge: '降水入渗' },
  // 中部冲积平原(混合水)
  { id: 'M01', location: '石家庄藁城', depth: 55, type: 'mid', delta18O: -7.8, deltaD: -56, tritium: 6.5, age: '数百年', zone: '中部冲积平原', recharge: '山前侧向+降水' },
  { id: 'M02', location: '邢台任县', depth: 62, type: 'mid', delta18O: -7.2, deltaD: -52, tritium: 4.2, age: '数百年', zone: '中部冲积平原', recharge: '山前侧向+降水' },
  { id: 'M03', location: '衡水桃城', depth: 48, type: 'mid', delta18O: -6.5, deltaD: -46, tritium: 3.1, age: '数千年', zone: '中部冲积平原', recharge: '山前侧向' },
  { id: 'M04', location: '沧州运西', depth: 58, type: 'mid', delta18O: -6.0, deltaD: -42, tritium: 2.0, age: '数千年', zone: '中部冲积平原', recharge: '山前侧向' },
  { id: 'M05', location: '廊坊安次', depth: 50, type: 'mid', delta18O: -6.8, deltaD: -50, tritium: 3.8, age: '数百年', zone: '中部冲积平原', recharge: '山前侧向+降水' },
  { id: 'M06', location: '唐山丰南', depth: 45, type: 'mid', delta18O: -7.0, deltaD: -51, tritium: 5.0, age: '数百年', zone: '冀东平原', recharge: '降水+河水' },
  // 滨海平原深层承压水(古水)
  { id: 'D01', location: '沧州青县', depth: 280, type: 'deep', delta18O: -5.5, deltaD: -38, tritium: 0.3, age: '15000年', zone: '滨海平原', recharge: '末次冰期古水' },
  { id: 'D02', location: '衡水景县', depth: 320, type: 'deep', delta18O: -5.8, deltaD: -40, tritium: 0.5, age: '12000年', zone: '滨海平原', recharge: '末次冰期古水' },
  { id: 'D03', location: '邢台南宫', depth: 250, type: 'deep', delta18O: -6.2, deltaD: -44, tritium: 0.8, age: '8000年', zone: '中部深层', recharge: '晚冰期古水' },
  { id: 'D04', location: '邯郸大名', depth: 300, type: 'deep', delta18O: -5.2, deltaD: -36, tritium: 0.2, age: '20000年', zone: '滨海平原', recharge: '末次冰期古水' },
  { id: 'D05', location: '廊坊大城', depth: 350, type: 'deep', delta18O: -5.0, deltaD: -34, tritium: 0.1, age: '25000年', zone: '深层承压', recharge: '末次冰期古水' },
  // 岩溶水
  { id: 'K01', location: '峰峰黑龙洞泉', depth: 180, type: 'karst', delta18O: -9.5, deltaD: -68, tritium: 22.0, age: '现代', zone: '太行山岩溶', recharge: '灰岩降水入渗' },
  { id: 'K02', location: '邢台百泉', depth: 150, type: 'karst', delta18O: -9.2, deltaD: -65, tritium: 18.5, age: '现代', zone: '太行山岩溶', recharge: '灰岩降水入渗' },
  { id: 'K03', location: '涞源泉', depth: 200, type: 'karst', delta18O: -10.5, deltaD: -74, tritium: 20.5, age: '现代', zone: '太行山岩溶', recharge: '灰岩降水入渗' },
];

// C-5: 大气降水线参考点(用于绘图)
export const gmwl = { slope: 8.0, intercept: 10, label: '全球大气降水线: δD = 8δ18O + 10' };
export const lmwl = { slope: 7.2, intercept: 4.5, label: '河北地区: δD = 7.2δ18O + 4.5' };

// C-5: δ18O沿径向路径变化(山前→滨海)
export const delta18OPathway = [
  { distance: 0, zone: '太行山补给区', delta18O_shallow: -9.5, delta18O_deep: -10.0, tritium_shallow: 18, tritium_deep: 0.5 },
  { distance: 30, zone: '山前冲洪积扇', delta18O_shallow: -8.5, delta18O_deep: -8.0, tritium_shallow: 15, tritium_deep: 1.0 },
  { distance: 60, zone: '扇前缘过渡带', delta18O_shallow: -7.5, delta18O_deep: -7.0, tritium_shallow: 8, tritium_deep: 0.8 },
  { distance: 100, zone: '中部冲积平原', delta18O_shallow: -6.5, delta18O_deep: -6.0, tritium_shallow: 4, tritium_deep: 0.5 },
  { distance: 150, zone: '黑龙江港平原', delta18O_shallow: -5.8, delta18O_deep: -5.5, tritium_shallow: 2, tritium_deep: 0.3 },
  { distance: 200, zone: '滨海平原', delta18O_shallow: -5.0, delta18O_deep: -5.2, tritium_shallow: 1, tritium_deep: 0.1 },
];

// C-5: 地下水14C年龄-深度关系
export const carbon14AgeDepth = [
  { depth: 20, age: 50, type: '潜水', note: '现代补给' },
  { depth: 60, age: 500, type: '第I含水层组', note: '数百年' },
  { depth: 120, age: 3000, type: '第II含水层组', note: '约3000年' },
  { depth: 200, age: 12000, type: '第III含水层组', note: '末次冰期' },
  { depth: 300, age: 20000, type: '第IV含水层组', note: '约2万年' },
  { depth: 450, age: 30000, type: '明化镇组下段', note: '约3万年' },
];

// ─────────── 咸淡水界面数据 ───────────
export const freshSalineInterface = [
  { region: '石家庄-邢台山前', shallowFreshDepth: '0~60', salineBodyTop: '无咸水体', interfaceDesc: '全淡水区', trend: '稳定' },
  { region: '邢台-邯郸中部', shallowFreshDepth: '0~30', salineBodyTop: '30~50', interfaceDesc: '浅层淡水+深层咸水体', trend: '界面下移' },
  { region: '衡水-沧州', shallowFreshDepth: '0~20', salineBodyTop: '20~60', interfaceDesc: '上淡下咸双层结构', trend: '超采治理后趋于稳定' },
  { region: '沧州-黄骅滨海', shallowFreshDepth: '0~5', salineBodyTop: '5~10', interfaceDesc: '薄层淡水/全咸水', trend: '南水北调后入侵遏制' },
  { region: '唐山-乐亭', shallowFreshDepth: '0~10', salineBodyTop: '10~30', interfaceDesc: '滨海过渡带', trend: '深层回补试验场稳定' },
];

// ─────────── 水化学指标分区统计 ───────────
export const hydrochemicalByRegion = [
  { region: '石家庄', tds: 420, hardness: 265, sulfate: 85, chloride: 45, fluoride: 0.6, ph: 7.5, type: 'HCO3-Ca' },
  { region: '保定', tds: 380, hardness: 240, sulfate: 72, chloride: 38, fluoride: 0.5, ph: 7.4, type: 'HCO3-Ca' },
  { region: '邯郸', tds: 650, hardness: 380, sulfate: 120, chloride: 85, fluoride: 0.8, ph: 7.6, type: 'HCO3·SO4-Ca' },
  { region: '邢台', tds: 780, hardness: 420, sulfate: 150, chloride: 120, fluoride: 1.0, ph: 7.7, type: 'SO4·HCO3-Ca·Na' },
  { region: '衡水', tds: 1200, hardness: 580, sulfate: 280, chloride: 350, fluoride: 1.2, ph: 7.8, type: 'SO4·Cl-Na' },
  { region: '沧州', tds: 2800, hardness: 1200, sulfate: 450, chloride: 980, fluoride: 2.1, ph: 8.0, type: 'Cl-Na' },
  { region: '廊坊', tds: 850, hardness: 450, sulfate: 160, chloride: 150, fluoride: 0.9, ph: 7.7, type: 'HCO3·Cl-Na' },
  { region: '唐山', tds: 680, hardness: 380, sulfate: 130, chloride: 110, fluoride: 0.7, ph: 7.5, type: 'HCO3·Cl-Ca·Na' },
  { region: '张家口', tds: 280, hardness: 180, sulfate: 45, chloride: 22, fluoride: 0.4, ph: 7.3, type: 'HCO3-Ca' },
  { region: '承德', tds: 220, hardness: 150, sulfate: 35, chloride: 18, fluoride: 0.3, ph: 7.2, type: 'HCO3-Ca' },
  { region: '秦皇岛', tds: 350, hardness: 210, sulfate: 65, chloride: 42, fluoride: 0.5, ph: 7.4, type: 'HCO3-Ca·Mg' },
];

// ─────────── 矿泉水概况 ───────────
export const mineralWater = {
  note: '1999年基础文献记录的矿泉水水源地为历史数据，无2024年更新',
  sourceTypes: ['偏硅酸型', '锶型', '偏硅酸锶复合型', '碳酸型'],
};

// ─────────── 地热资源概况 ───────────
export const geothermal = {
  note: '1999年基础文献记录的地热资源为历史数据，无2024年更新',
  keyAreas: ['雄县', '霸州', '安次', '牛驼镇凸起', '高阳', '献县'],
  feature: '京津冀地热资源富集区，雄县地热田为典型代表',
};
export const resistivityMineralization = [
  { waterType: '淡水', resistivity: '>30', mineralization: '<1.0' },
  { waterType: '微咸水', resistivity: '15~30', mineralization: '1.0~2.0' },
  { waterType: '半咸水', resistivity: '5~15', mineralization: '2.0~5.0' },
  { waterType: '咸水', resistivity: '1~5', mineralization: '5.0~10.0' },
  { waterType: '高矿化咸水', resistivity: '<1', mineralization: '>10.0' },
];
