// K-盐碱土分布与防治 (调查年限型)
// 数据来源: 1999（基础文献）+ 第三次全国土壤普查（2024年）| 第十三章
// 版本: v2.0 | 更新频率: 5-10年更新

/** 各市盐碱地面积统计 (万亩) */
export const salineSoilDistribution = [
  { region: '沧州', totalSalineAlkali: 245.3, saline: 168.7, alkaline: 76.6, change: '减少32%', trend: '下降', salineRatio: 68.8, reclamationRate: 48.5 },
  { region: '衡水', totalSalineAlkali: 132.5, saline: 88.3, alkaline: 44.2, change: '减少28%', trend: '下降', salineRatio: 66.6, reclamationRate: 52.3 },
  { region: '唐山', totalSalineAlkali: 98.6, saline: 62.4, alkaline: 36.2, change: '减少25%', trend: '下降', salineRatio: 63.3, reclamationRate: 55.1 },
  { region: '廊坊', totalSalineAlkali: 76.2, saline: 48.5, alkaline: 27.7, change: '减少22%', trend: '下降', salineRatio: 63.6, reclamationRate: 58.7 },
  { region: '邢台', totalSalineAlkali: 56.8, saline: 35.2, alkaline: 21.6, change: '减少30%', trend: '下降', salineRatio: 62.0, reclamationRate: 47.2 },
  { region: '保定', totalSalineAlkali: 32.1, saline: 18.6, alkaline: 13.5, change: '减少35%', trend: '下降', salineRatio: 57.9, reclamationRate: 65.4 },
  { region: '张家口', totalSalineAlkali: 28.5, saline: 12.3, alkaline: 16.2, change: '减少18%', trend: '下降', salineRatio: 43.2, reclamationRate: 38.6 },
  { region: '邯郸', totalSalineAlkali: 18.4, saline: 10.5, alkaline: 7.9, change: '减少38%', trend: '下降', salineRatio: 57.1, reclamationRate: 62.3 },
  { region: '承德', totalSalineAlkali: 8.2, saline: 3.1, alkaline: 5.1, change: '减少15%', trend: '下降', salineRatio: 37.8, reclamationRate: 42.1 },
  { region: '秦皇岛', totalSalineAlkali: 5.6, saline: 3.8, alkaline: 1.8, change: '减少20%', trend: '下降', salineRatio: 67.9, reclamationRate: 71.4 },
  { region: '石家庄', totalSalineAlkali: 4.8, saline: 2.2, alkaline: 2.6, change: '减少40%', trend: '下降', salineRatio: 45.8, reclamationRate: 75.6 },
];

/** 盐碱土分类 */
export const salineSoilTypes = [
  { type: '氯化物盐土', area: '~180', unit: '万亩', phRange: '7.0~8.5', distribution: '滨海平原，沧州/唐山', degree: '重度', groundwaterType: '滨海咸水区', treatmentDifficulty: '高' },
  { type: '硫酸盐盐土', area: '~120', unit: '万亩', phRange: '7.5~9.0', distribution: '内陆洼地，衡水/邢台', degree: '中度', groundwaterType: '微咸水区', treatmentDifficulty: '中' },
  { type: '苏打盐土', area: '~45', unit: '万亩', phRange: '8.5~10.5', distribution: '坝上高原/内陆洼地', degree: '重度', groundwaterType: '碱性水区', treatmentDifficulty: '极高' },
  { type: '氯化物-硫酸盐盐土', area: '~95', unit: '万亩', phRange: '7.2~8.8', distribution: '中部平原', degree: '轻度-中度', groundwaterType: '咸淡水过渡区', treatmentDifficulty: '中' },
  { type: '碱化土', area: '~60', unit: '万亩', phRange: '9.0~10.0', distribution: '衡水/沧州/廊坊', degree: '中度', groundwaterType: '低矿化碱性水区', treatmentDifficulty: '高' },
];

/** 防治措施与成效 */
export const salineSoilMeasures = [
  { measure: '水利改良', description: '井灌井排、渠灌渠排、暗管排水，降低地下水位至临界深度以下', effectiveness: '核心措施，治理面积占比约45%', cost: '~800元/亩', cycle: '1~3年见效', suitableTypes: '氯化物/硫酸盐盐土' },
  { measure: '农业改良', description: '增施有机肥、秸秆还田、种植绿肥、深翻耕作', effectiveness: '改善土壤结构，治理面积占比约25%', cost: '~300元/亩', cycle: '2~5年见效', suitableTypes: '轻度-中度各类盐碱土' },
  { measure: '生物改良', description: '种植耐盐碱作物（苜蓿/碱蓬/向日葵等），建立耐盐植被', effectiveness: '生态修复，治理面积占比约15%', cost: '~200元/亩', cycle: '3~5年见效', suitableTypes: '中度盐碱土' },
  { measure: '化学改良', description: '施用石膏/磷石膏/脱硫石膏，置换土壤中的交换性钠', effectiveness: '针对碱化土，治理面积占比约10%', cost: '~500元/亩', cycle: '1~2年见效', suitableTypes: '苏打盐土/碱化土' },
  { measure: '综合措施', description: '水利+农业+生物+化学综合施策，因地制宜分区治理', effectiveness: '最有效，治理面积占比约5%但效果最好', cost: '~1200元/亩', cycle: '2~4年见效', suitableTypes: '重度/复杂盐碱土' },
];

/** 盐碱土成因与形成条件 */
export const salineSoilGenesis = [
  { factor: '气候', description: '年蒸发量1800~2200mm，是降水量的3~4倍，蒸发浓缩作用强烈', contribution: '高' },
  { factor: '地形', description: '平原低平洼地排水不畅，地下水埋深小于临界深度(2~3m)', contribution: '高' },
  { factor: '地下水', description: '矿化度1~50g/L咸水广泛分布，毛管上升导致盐分表聚', contribution: '极高' },
  { factor: '母质', description: '冲积/海积母质含盐量高，滨海地区受海侵影响', contribution: '中-高' },
  { factor: '人为活动', description: '大水漫灌、渠道渗漏、排水不畅等不合理灌溉方式加剧盐碱化', contribution: '中' },
];

/** 盐碱土分区治理策略 */
export const salineSoilZoning = [
  { zone: '滨海氯化物型重盐碱区', area: '~380万亩', cities: '沧州东部、唐山南部、秦皇岛沿海', mainIssue: '海水倒灌、矿化度>10g/L', strategy: '暗管排盐+耐盐水稻/盐地碱蓬，雨季蓄淡压盐', keyTech: '暗管排盐工程', priority: '高' },
  { zone: '内陆硫酸盐型中盐碱区', area: '~215万亩', cities: '衡水、邢台中东部、廊坊南部', mainIssue: '矿化度3~5g/L微咸水，土壤板结', strategy: '井灌井排+有机肥改良+耐盐小麦/苜蓿轮作', keyTech: '咸淡混灌技术', priority: '高' },
  { zone: '坝上高原苏打型盐碱区', area: '~45万亩', cities: '张家口坝上地区', mainIssue: '高pH(>9.0)、钠质化严重', strategy: '石膏改良+深松耕作+耐寒耐碱草被', keyTech: '化学改良剂应用', priority: '中' },
  { zone: '山前平原轻度盐碱区', area: '~45万亩', cities: '保定、石家庄、邯郸、邢台西部', mainIssue: '零星分布，局部排水不畅', strategy: '完善排水系统+秸秆还田+合理灌溉', keyTech: '节水灌溉技术', priority: '低' },
];

/** 历史变化趋势 */
export const salineSoilHistory = [
  { period: '1950s', totalArea: '~1800', unit: '万亩', majorMeasure: '自然状态', reduction: '-', cumulativeReduction: '-' },
  { period: '1970s', totalArea: '~1500', unit: '万亩', majorMeasure: '初期排水工程', reduction: '~300', cumulativeReduction: '~300' },
  { period: '1985年', totalArea: '~1100', unit: '万亩', majorMeasure: '综合治理起步', reduction: '~400', cumulativeReduction: '~700' },
  { period: '2000年', totalArea: '~900', unit: '万亩', majorMeasure: '节水农业推广', reduction: '~200', cumulativeReduction: '~900' },
  { period: '2015年', totalArea: '~750', unit: '万亩', majorMeasure: '南水北调补水/土地整治', reduction: '~150', cumulativeReduction: '~1050' },
  { period: '2024年', totalArea: '~707', unit: '万亩', majorMeasure: '科技治碱/种业创新', reduction: '~43', cumulativeReduction: '~1093' },
];

/** 旱碱麦推广数据 */
export const salineWheatData = {
  plantingArea: 130.5,
  unit: '万亩',
  mainRegions: '沧州/衡水/邢台/廊坊',
  yieldRange: '250~450 kg/亩',
  mainVarieties: '捷麦19/沧麦6002/衡S29/捷麦20',
  processing: '泊头/南皮建成旱碱麦加工产业园',
  brand: '"黄骅旱碱麦"地理标志产品',
  nutritionalFeatures: '高蛋白、低筋度，适合制作面食',
};

/** 典型治理案例 */
export const salineSoilCaseStudies = [
  { name: '黄骅市旱碱麦示范区', location: '黄骅市常郭镇', area: '8.5万亩', originalSalinity: '3~6 g/kg', currentSalinity: '1~2 g/kg', period: '2018~2024', measures: '秸秆覆盖+有机肥+耐盐品种', result: '耕层含盐量降低60%，亩产达450kg' },
  { name: '南皮县咸淡混灌示范区', location: '南皮县乌马营镇', area: '3.2万亩', originalSalinity: '2~4 g/kg', currentSalinity: '1~2 g/kg', period: '2015~2023', measures: '咸淡混灌(1:2)+暗管排盐', result: '小麦亩产从150kg增至380kg' },
  { name: '康保县苏打盐碱治理', location: '张家口康保县', area: '2.8万亩', originalSalinity: 'pH 9.2~10.0', currentSalinity: 'pH 7.8~8.5', period: '2019~2024', measures: '脱硫石膏+有机肥+深松', result: 'pH降低1.5个单位，苜蓿亩产达800kg' },
  { name: '曹妃甸滨海盐土修复', location: '唐山市曹妃甸区', area: '5.0万亩', originalSalinity: '8~15 g/kg', currentSalinity: '3~5 g/kg', period: '2020~2025', measures: '暗管排盐+蓄淡压盐+盐地碱蓬', result: '表层盐分降低65%，植被覆盖率从10%增至85%' },
  { name: '景县盐碱地综合整治', location: '衡水景县', area: '4.5万亩', originalSalinity: '2~5 g/kg', currentSalinity: '1~2 g/kg', period: '2016~2024', measures: '井灌井排+秸秆还田+绿肥轮作', result: '有机质提高0.8%，小麦亩产达400kg' },
];

/** 咸水-盐碱土关联性指标 */
export const salineWaterSoilRelation = [
  { depth: '0~20cm', avgSalinity: '5.8 g/kg', pH: '8.2', mainSaltType: '氯化物/硫酸盐', groundwaterMineralization: '2~5 g/L' },
  { depth: '20~50cm', avgSalinity: '3.2 g/kg', pH: '8.0', mainSaltType: '硫酸盐/氯化物', groundwaterMineralization: '2~5 g/L' },
  { depth: '50~100cm', avgSalinity: '1.8 g/kg', pH: '7.8', mainSaltType: '重碳酸盐', groundwaterMineralization: '1~3 g/L' },
  { depth: '100~200cm', avgSalinity: '1.2 g/kg', pH: '7.6', mainSaltType: '重碳酸盐', groundwaterMineralization: '1~2 g/L' },
];
