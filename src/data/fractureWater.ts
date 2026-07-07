// ═══════════════════════════════════════════════════════════
// 裂隙水数据模块 - 河北省基岩裂隙水分布与开采利用
// 数据来源: 1999年河北省地下水资源评价 | 第九章裂隙水
// ═══════════════════════════════════════════════════════════

/** 裂隙水类型分类 */
export const fractureWaterTypes = [
  {
    type: '风化带网状裂隙水', distribution: '山区广泛分布，花岗岩、片麻岩、火山岩等结晶岩类风化带',
    depth: '2~10', depthUnit: 'm', yield: '一般<100', yieldUnit: 'm³/d',
    waterQuality: 'HCO₃-Ca·Mg型，矿化度<0.5g/L', features: '水量小但分布广，山区分散供水主要水源',
    exploration: '群山环抱洼地、椅形地沟谷汇口处、两山夹窄谷',
    proportion: '~55%', richness: '贫乏~中等', explorationDifficulty: '低',
  },
  {
    type: '层状裂隙水', distribution: '碎屑岩（砂岩、砾岩）和火山碎屑岩中，沿层面裂隙发育',
    depth: '50~200', depthUnit: 'm', yield: '100~500', yieldUnit: 'm³/d',
    waterQuality: 'HCO₃-Ca·Na型，矿化度0.3~1.0g/L', features: '富水性取决于岩层厚度和裂隙发育程度',
    exploration: '厚层砂岩/砾岩，断层带和岩脉等控水构造',
    proportion: '~30%', richness: '中等', explorationDifficulty: '中',
  },
  {
    type: '脉状裂隙水', distribution: '断层破碎带、岩脉接触带、侵入岩体外缘构造裂隙带',
    depth: '可达300', depthUnit: 'm', yield: '500~3000', yieldUnit: 'm³/d',
    waterQuality: '因围岩而异，一般矿化度<1.0g/L', features: '水量集中，脉状/带状分布，山区找水主要目标',
    exploration: '张性断层、压扭性断层转折段、岩脉与围岩接触带',
    proportion: '~15%', richness: '丰富', explorationDifficulty: '高',
  },
];

/** 裂隙水富水性分区 */
export const fractureWaterZones = [
  { zone: '燕山山区', rockType: '岩浆岩+变质岩', fractureType: '风化带+构造裂隙', richness: '中等~丰富', avgYield: '30~60', yieldUnit: 'm³/d', representative: '抚宁/昌黎一带', area: '~34000km²', wellDepthRange: '20~80', mainUse: '农村饮水/灌溉' },
  { zone: '太行山北段', rockType: '变质岩+碎屑岩', fractureType: '风化带+层状裂隙', richness: '中等', avgYield: '10~30', yieldUnit: 'm³/d', representative: '阜平/涞源', area: '~12000km²', wellDepthRange: '15~60', mainUse: '农村饮水' },
  { zone: '太行山中南段', rockType: '碳酸盐岩+碎屑岩', fractureType: '构造裂隙+层间裂隙', richness: '中等', avgYield: '20~50', yieldUnit: 'm³/d', representative: '邢台/邯郸西部', area: '~14000km²', wellDepthRange: '20~100', mainUse: '农村饮水/灌溉' },
  { zone: '坝上高原', rockType: '玄武岩+凝灰岩', fractureType: '柱状节理+气孔构造', richness: '贫乏~中等', avgYield: '5~20', yieldUnit: 'm³/d', representative: '张北/沽源', area: '~18000km²', wellDepthRange: '10~40', mainUse: '牧区饮水' },
  { zone: '冀西北山地', rockType: '变质岩+火山岩', fractureType: '风化带+构造裂隙', richness: '贫乏~中等', avgYield: '10~30', yieldUnit: 'm³/d', representative: '赤城/崇礼', area: '~6000km²', wellDepthRange: '15~60', mainUse: '农村饮水' },
];

/** 典型裂隙水开发案例 */
export const fractureWaterCases = [
  { location: '邢台县赵家沟', rockType: '花岗片麻岩', fractureType: '风化带', wellDepth: '~40', yield: '4.8~20', yieldUnit: 'm³/d', method: '风化带找水', servicePop: '~800人', status: '运行中' },
  { location: '抚宁台头营', rockType: '岩浆岩/混合岩', fractureType: '块状裂隙', wellDepth: '~50', yield: '30~60', yieldUnit: 'm³/d', method: '构造裂隙带定位', servicePop: '~2000人', status: '运行中' },
  { location: '某碎屑岩区', rockType: '砾岩', fractureType: '层状裂隙', wellDepth: '100~200', yield: '60~80', yieldUnit: 'm³/d', method: '层间裂隙+断层带综合定位', servicePop: '~3000人', status: '运行中' },
  { location: '阜平天生桥', rockType: '片麻岩', fractureType: '风化带+构造', wellDepth: '~35', yield: '8~15', yieldUnit: 'm³/d', method: '地貌法+电法勘探', servicePop: '~500人', status: '运行中' },
  { location: '围场塞罕坝', rockType: '玄武岩', fractureType: '柱状节理', wellDepth: '~25', yield: '10~25', yieldUnit: 'm³/d', method: '节理密集带定位', servicePop: '~300人', status: '运行中' },
  { location: '涞源白石山', rockType: '片麻岩+石英岩', fractureType: '构造裂隙', wellDepth: '~60', yield: '15~35', yieldUnit: 'm³/d', method: '遥感解译+电法综合', servicePop: '~1200人', status: '运行中' },
  { location: '赤城龙关镇', rockType: '火山碎屑岩', fractureType: '层间裂隙+构造', wellDepth: '~45', yield: '12~28', yieldUnit: 'm³/d', method: '地质构造法+激电法', servicePop: '~600人', status: '运行中' },
  { location: '平山温塘', rockType: '花岗岩+片麻岩', fractureType: '构造裂隙+风化', wellDepth: '~55', yield: '20~40', yieldUnit: 'm³/d', method: '综合物探', servicePop: '~1500人', status: '运行中' },
];

/** 裂隙水勘查方法 */
export const fractureExplorationMethods = [
  { method: '地貌法', description: '利用地貌形态判断裂隙水富集地段，如洼地、沟谷汇口、山前坡脚', cost: '极低', accuracy: '中等', suitableScale: '1:1万~1:5万' },
  { method: '地质构造法', description: '分析断层、褶皱、岩脉等构造控水因素，圈定找水靶区', cost: '低', accuracy: '中高', suitableScale: '1:5万~1:10万' },
  { method: '电法勘探', description: '电阻率法/激电法/电磁法探测低阻异常带，确定含水断裂位置', cost: '中', accuracy: '高', suitableScale: '1:1万~1:5万' },
  { method: '地震勘探', description: '浅层反射波法探测断层破碎带和基岩面起伏', cost: '高', accuracy: '高', suitableScale: '1:1万' },
  { method: '遥感解译', description: '利用卫星/航空影像提取线状构造、植被异常等找水线索', cost: '低', accuracy: '中', suitableScale: '1:10万~1:50万' },
  { method: '综合物探', description: '多种物探方法联合解释，提高勘查精度和可靠性', cost: '高', accuracy: '极高', suitableScale: '1:1万' },
];

/** 裂隙水资源量统计 */
export const fractureWaterResources = {
  totalArea: '~84000km²',
  totalNaturalYield: '~12.5亿m³/a',
  totalExploitable: '~3.2亿m³/a',
  currentExploitation: '~1.8亿m³/a',
  exploitationRate: '56%',
  mainChallenge: '单井出水量小、分布不均、季节性变化大',
  prospect: '山区分散供水和特色产业用水的主要水源',
};

/** 裂隙水水化学特征 */
export const fractureWaterChemistry = [
  {
    rockType: '花岗岩/片麻岩(酸性岩)',
    waterType: 'HCO₃-Ca·Na型',
    tds: '100~300',
    ph: '6.5~7.5',
    hardness: '50~150',
    siliconContent: '高(SiO₂ 20~40mg/L)',
    radonContent: '偏高(Rn可达50~200Bq/L)',
    features: '低矿化度软水，偏硅酸含量高，部分地区氡含量超标',
  },
  {
    rockType: '玄武岩/安山岩(基性岩)',
    waterType: 'HCO₃-Ca·Mg型',
    tds: '200~500',
    ph: '7.0~8.0',
    hardness: '100~250',
    siliconContent: '较高(SiO₂ 15~30mg/L)',
    radonContent: '中等(Rn 10~50Bq/L)',
    features: '偏硅酸含量较高，硬度中等，适合饮用矿泉水开发',
  },
  {
    rockType: '砂岩/砾岩(碎屑岩)',
    waterType: 'HCO₃-Ca·Mg·Na型',
    tds: '300~800',
    ph: '7.0~7.8',
    hardness: '150~350',
    siliconContent: '低(SiO₂ 5~15mg/L)',
    radonContent: '低',
    features: '矿化度和硬度略高，含盐量与岩层胶结物有关',
  },
  {
    rockType: '石灰岩/白云岩(碳酸盐岩)',
    waterType: 'HCO₃-Ca型',
    tds: '200~500',
    ph: '7.2~8.0',
    hardness: '200~400',
    siliconContent: '低',
    radonContent: '低',
    features: '硬度偏高(与碳酸钙溶解有关)，裂隙-溶隙过渡类型',
  },
];

/** 裂隙水开发利用现状 */
export const fractureWaterUtilization = {
  byPurpose: [
    { purpose: '农村生活用水', volume: '~8500万m³/a', percent: 47.2, note: '覆盖约200万山区农村人口' },
    { purpose: '农业灌溉', volume: '~5200万m³/a', percent: 28.9, note: '山间盆地和小型冲洪积扇' },
    { purpose: '特色产业发展', volume: '~2800万m³/a', percent: 15.6, note: '矿泉水/温泉/生态农业' },
    { purpose: '生态用水', volume: '~1500万m³/a', percent: 8.3, note: '山区河道基流维持' },
  ],
  wellStatistics: {
    totalWells: '~45000',
    avgWellDepth: '~40m',
    avgYield: '~15m³/d',
    failureRate: '~18%',
    mainFailureCause: '风化带厚度不足/裂隙不发育/成井工艺不当',
  },
  keyProjects: [
    { name: '太行山山区找水打井工程', period: '2015-2020', wells: 3200, servicePop: 85, unit: '万人', note: '解决山区农村饮水安全问题' },
    { name: '燕山山区抗旱找水工程', period: '2018-2022', wells: 1800, servicePop: 42, unit: '万人', note: '重点解决冀北山区缺水问题' },
    { name: '坝上地区水源保障工程', period: '2020-2023', wells: 960, servicePop: 18, unit: '万人', note: '坝上高原饮水安全巩固提升' },
  ],
};

/** 不同岩性裂隙水富水性经验值 */
export const fractureWaterYieldByLithology = [
  { lithology: '花岗岩', weatheredDepth: '5~15m', fractureYield: '10~50', unit: 'm³/d', productivityRating: '中等', bestLocation: '断裂交汇处/岩脉接触带' },
  { lithology: '片麻岩', weatheredDepth: '3~12m', fractureYield: '5~30', unit: 'm³/d', productivityRating: '中等', bestLocation: '片理发育带/断层影响带' },
  { lithology: '石英岩', weatheredDepth: '2~8m', fractureYield: '5~20', unit: 'm³/d', productivityRating: '贫乏~中等', bestLocation: '构造裂隙密集段' },
  { lithology: '砂岩', weatheredDepth: '8~20m', fractureYield: '20~100', unit: 'm³/d', productivityRating: '中等~丰富', bestLocation: '厚层砂岩段/节理密集带' },
  { lithology: '砾岩', weatheredDepth: '10~25m', fractureYield: '30~150', unit: 'm³/d', productivityRating: '丰富', bestLocation: '胶结疏松段/断层影响带' },
  { lithology: '页岩/泥岩', weatheredDepth: '2~5m', fractureYield: '1~5', unit: 'm³/d', productivityRating: '贫乏', bestLocation: '页理发育段(水量有限)' },
  { lithology: '玄武岩', weatheredDepth: '5~20m', fractureYield: '10~40', unit: 'm³/d', productivityRating: '中等', bestLocation: '柱状节理/气孔构造带' },
  { lithology: '凝灰岩', weatheredDepth: '3~10m', fractureYield: '5~25', unit: 'm³/d', productivityRating: '贫乏~中等', bestLocation: '层间裂隙/风化带底部' },
  { lithology: '安山岩', weatheredDepth: '5~15m', fractureYield: '10~50', unit: 'm³/d', productivityRating: '中等', bestLocation: '杏仁体构造发育段/断层带' },
  { lithology: '石灰岩(裂隙型)', weatheredDepth: '5~15m', fractureYield: '20~80', unit: 'm³/d', productivityRating: '中等~丰富', bestLocation: '层面裂隙+溶蚀裂隙(与岩溶过渡)' },
];
