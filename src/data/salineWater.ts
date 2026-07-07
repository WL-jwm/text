// J-咸水分布与利用 (调查年限型)
// 数据来源: 1999（基础文献）+ 2024河北省水资源公报 | 第十二章
// 版本: v2.0 | 更新频率: 5-10年更新

/** 各市咸水面积统计 (km²) */
export const salineDistribution = [
  { region: '秦皇岛', totalArea: 7750, salineArea: 0, freshRatio: '100%', freshArea: 7750, shallowSaline: 0, deepSaline: 0 },
  { region: '唐山', totalArea: 13348, salineArea: 3265, freshRatio: '75.5%', freshArea: 10083, shallowSaline: 1890, deepSaline: 1375 },
  { region: '廊坊', totalArea: 6429, salineArea: 1893, freshRatio: '70.6%', freshArea: 4536, shallowSaline: 1120, deepSaline: 773 },
  { region: '保定', totalArea: 20584, salineArea: 0, freshRatio: '100%', freshArea: 20584, shallowSaline: 0, deepSaline: 0 },
  { region: '沧州', totalArea: 14056, salineArea: 6570, freshRatio: '53.3%', freshArea: 7486, shallowSaline: 3680, deepSaline: 2890 },
  { region: '衡水', totalArea: 8815, salineArea: 3784, freshRatio: '57.1%', freshArea: 5031, shallowSaline: 2180, deepSaline: 1604 },
  { region: '邢台', totalArea: 12400, salineArea: 2135, freshRatio: '82.8%', freshArea: 10265, shallowSaline: 1280, deepSaline: 855 },
  { region: '邯郸', totalArea: 12047, salineArea: 0, freshRatio: '100%', freshArea: 12047, shallowSaline: 0, deepSaline: 0 },
  { region: '石家庄', totalArea: 14530, salineArea: 0, freshRatio: '100%', freshArea: 14530, shallowSaline: 0, deepSaline: 0 },
  { region: '张家口', totalArea: 36800, salineArea: 0, freshRatio: '100%', freshArea: 36800, shallowSaline: 0, deepSaline: 0 },
  { region: '承德', totalArea: 39500, salineArea: 0, freshRatio: '100%', freshArea: 39500, shallowSaline: 0, deepSaline: 0 },
];

/** 咸水类型与矿化度分级 */
export const salineTypes = [
  { type: '淡水', salinityRange: '<1', unit: 'g/L', area: 57833, proportion: '64.9%', color: '#3b82f6' },
  { type: '微咸水', salinityRange: '1~3', unit: 'g/L', area: 10354, proportion: '11.6%', color: '#06b6d4' },
  { type: '半咸水', salinityRange: '3~5', unit: 'g/L', area: 7289, proportion: '8.2%', color: '#f59e0b' },
  { type: '咸水', salinityRange: '5~10', unit: 'g/L', area: 8967, proportion: '10.1%', color: '#ef4444' },
  { type: '盐水', salinityRange: '10~50', unit: 'g/L', area: 4509, proportion: '5.1%', color: '#dc2626' },
  { type: '卤水', salinityRange: '>50', unit: 'g/L', area: 49, proportion: '0.1%', color: '#7c2d12' },
];

/** 咸水开发利用情况 */
export const salineUtilization = [
  { use: '农业灌溉(微咸水)', area: '~15万', unit: '亩', description: '矿化度1~3g/L微咸水直接灌溉或混灌', benefit: '节约淡水资源约2亿m³/a', trend: '稳步扩大' },
  { use: '工业冷却用水', quantity: '~0.5', unit: '亿m³/a', description: '沧州/唐山沿海工业区', benefit: '降低工业用水成本30%', trend: '增长中' },
  { use: '盐业生产', area: '~3万', unit: '亩', description: '黄骅/海兴盐田', benefit: '年产量约200万吨', trend: '稳定' },
  { use: '养殖用水', area: '~8万', unit: '亩', description: '对虾/罗非鱼等耐盐品种养殖', benefit: '产值约15亿元/a', trend: '快速发展' },
];

/** 咸水分布特征 */
export const salineFeatures = [
  { feature: '水平分带', description: '山前全淡水→中部浅层淡水+深层咸水→滨海全咸水，矿化度自西向东递增', importance: '极高' },
  { feature: '垂直分层', description: '浅层淡水(0~20m)→咸水体(20~200m)→深层淡水(200m以下)，咸水厚度自西向东增大', importance: '极高' },
  { feature: '咸淡水界面', description: '石德线(石家庄-德州)为浅层咸水西界，滨海地区淡水底界可深达200~300m', importance: '高' },
  { feature: '动态变化', description: '超采导致咸淡水界面下移，局部地区淡水层咸化趋势明显', importance: '高' },
];

/** 咸水区水文地质参数 */
export const salineHydroParams = [
  { zone: '山前淡水区', mineralization: '<1 g/L', aquiferType: '冲洪积扇孔隙水', aquiferThickness: '30~80m', K: '15~50 m/d', yield: '50~150 m³/h·m', depth: '0~150m' },
  { zone: '中部咸淡水交错区', mineralization: '1~5 g/L', aquiferType: '冲积/湖积孔隙水', aquiferThickness: '20~60m(淡水层)', K: '5~15 m/d', yield: '20~50 m³/h·m', depth: '0~200m' },
  { zone: '滨海全咸水区', mineralization: '5~50+ g/L', aquiferType: '海积/冲积孔隙水', aquiferThickness: '全咸200~300m', K: '2~8 m/d', yield: '<20 m³/h·m', depth: '0~300m+' },
  { zone: '深层淡水区', mineralization: '<1 g/L', aquiferType: '河湖相孔隙水', aquiferThickness: '40~100m', K: '1~5 m/d', yield: '10~30 m³/h·m', depth: '200~400m' },
];

/** 咸淡水界面变化趋势 */
export const interfaceChange = [
  { period: '1970s', interfaceDepth: '30~50m', trend: '稳定', description: '大规模开采前界面相对稳定' },
  { period: '1980s', interfaceDepth: '40~70m', trend: '下移', description: '深层水开采加剧，界面开始下移' },
  { period: '1990s', interfaceDepth: '60~100m', trend: '加速下移', description: '超采严重，咸淡水界面大幅下移' },
  { period: '2000s', interfaceDepth: '80~120m', trend: '下移趋缓', description: '南水北调工程启动，开采得到控制' },
  { period: '2015s', interfaceDepth: '70~100m', trend: '开始回升', description: '超采综合治理成效显现' },
  { period: '2024年', interfaceDepth: '60~90m', trend: '持续回升', description: '深层漏斗消散，界面恢复明显' },
];


/** 咸水体三维分布特征 */
export const salineBody3D = {
  summary: '河北平原中东部普遍分布咸水体，以2g/L为咸淡水划分标准，分为全淡水区和有咸水区。咸水体垂向结构分为淡-咸-淡型、咸-淡型和全咸型三类。',
  divisionStandard: '2g/L',
  freshOnly: { area: 32826, cities: '乐亭-丰南一线以北, 廊坊-安新-安平-宁晋-鸡泽-邯郸-成安-魏县以西', note: '全淡水区' },
  salinePresent: { area: 36519, cities: '中东部平原', note: '有咸水区' },
  verticalTypes: [
    { type: '淡-咸-淡型', description: '浅层淡水(0~30m)→中层咸水(30~150m)→深层淡水(>150m)', distribution: '中部平原大部分地区', typical: '衡水/沧州西部/邢台东部' },
    { type: '咸-淡型', description: '表层咸水(0~50m)→深层淡水(>50m)', distribution: '滨海平原部分地区', typical: '沧州东部/黄骅' },
    { type: '全咸型', description: '全剖面均为咸水', distribution: '滨海平原沿海地带', typical: '海兴/盐山沿海' },
  ],
  salineRoofDepth: [
    { zone: '山前平原过渡带', depth: '30~50m', note: '咸水体顶板埋深较大' },
    { zone: '中部平原', depth: '10~30m', note: '咸水体顶板埋深中等' },
    { zone: '滨海平原', depth: '0~10m', note: '咸水体接近地表' },
  ],
  salineThickness: [
    { zone: '衡水-沧州西部', thickness: '80~150m', note: '咸水体厚度最大区域' },
    { zone: '邢台东部-邯郸东部', thickness: '50~100m', note: '咸水体厚度中等' },
    { zone: '廊坊南部', thickness: '30~80m', note: '咸水体厚度较薄' },
    { zone: '唐山沿海', thickness: '20~60m', note: '咸水体厚度较薄' },
  ],
};

/** 各市咸水分布面积统计 */
export const citySalineArea = [
  { city: '唐山', total: 13348, saline: 3265, freshRatio: '75.5%', shallowSaline: 1890, deepSaline: 1375 },
  { city: '廊坊', total: 6398, saline: 3668, freshRatio: '42.7%', shallowSaline: 2958, deepSaline: 710 },
  { city: '保定', total: 10995, saline: 721, freshRatio: '93.4%', shallowSaline: 721, deepSaline: 0 },
  { city: '石家庄', total: 6673, saline: 563, freshRatio: '91.6%', shallowSaline: 563, deepSaline: 0 },
  { city: '沧州', total: 12121, saline: 12121, freshRatio: '0%', shallowSaline: 9351, deepSaline: 2770 },
  { city: '衡水', total: 8433, saline: 7872, freshRatio: '6.7%', shallowSaline: 6470, deepSaline: 1402 },
  { city: '邢台', total: 8687, saline: 4986, freshRatio: '42.6%', shallowSaline: 3923, deepSaline: 1063 },
  { city: '邯郸', total: 7515, saline: 4164, freshRatio: '44.6%', shallowSaline: 3650, deepSaline: 514 },
];

/** 咸水利用现状 */
export const salineUtilizationCurrent = [
  { use: '农业灌溉(混合)', scale: '~8亿m³/a', note: '淡水+咸水混合灌溉，主要在沧州/衡水' },
  { use: '工业冷却', scale: '~2亿m³/a', note: '咸水用于循环冷却，沧州/黄骅' },
  { use: '养殖', scale: '~0.5亿m³/a', note: '咸水养殖对虾/鱼类，沿海地区' },
  { use: '淡化利用(试点)', scale: '~0.1亿m³/a', note: '反渗透淡化试验，成本较高' },
];
