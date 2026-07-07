// R-岩溶水 (稳定可更新)
// 数据来源: 1999（基础文献）| 第八章 岩溶与岩溶水分布特征及开采利用
// 版本: v2.0 | 更新频率: 新监测数据入库时追加

/** 岩溶水主要泉域 */
export const karstSprings = [
  { name: '黑龙洞泉群', location: '邯郸峰峰', discharge: '10.4', unit: 'm³/s', type: '全排型', area: '2074.5', lithology: '奥陶系中统灰岩', features: '岩溶盆地型，泉群排泄', rechargeArea: '2700', waterLevel: '120~160', tds: '0.3~0.6' },
  { name: '邢台百泉', location: '邢台', discharge: '6.5', unit: 'm³/s', type: '全排型', area: '3843', lithology: '奥陶系+寒武系灰岩', features: '岩溶盆地型，大型泉群', rechargeArea: '3800', waterLevel: '80~120', tds: '0.3~0.5' },
  { name: '威州泉', location: '石家庄井陉', discharge: '9.48', unit: 'm³/s', type: '全排型', area: '2702.8', lithology: '奥陶系+寒武系灰岩', features: '岩溶盆地型，跨流域排泄', rechargeArea: '2800', waterLevel: '100~150', tds: '0.3~0.5' },
  { name: '东风湖泉', location: '邯郸涉县', discharge: '2.5', unit: 'm³/s', type: '全排型', area: '691', lithology: '奥陶系中统灰岩', features: '岩溶盆地型', rechargeArea: '800', waterLevel: '150~200', tds: '0.3~0.4' },
  { name: '涞源泉', location: '保定涞源', discharge: '3.2', unit: 'm³/s', type: '全排型', area: '1149.2', lithology: '奥陶系+寒武系+中上元古界', features: '岩溶盆地型', rechargeArea: '1200', waterLevel: '200~300', tds: '0.2~0.4' },
  { name: '水磨槽泉群', location: '保定曲阳', discharge: '0.515', unit: 'm³/s', type: '全排型', area: '919.6', lithology: '奥陶系+寒武系+中上元古界', features: '岩溶盆地型', rechargeArea: '950', waterLevel: '100~150', tds: '0.3~0.5' },
  { name: '十股泉', location: '邢台', discharge: '-', unit: 'm³/s', type: '全排型', area: '1237.5', lithology: '奥陶系中统灰岩', features: '岩溶盆地型', rechargeArea: '-', waterLevel: '-', tds: '-' },
  { name: '白鹿泉', location: '石家庄鹿泉', discharge: '-', unit: 'm³/s', type: '全排型', area: '203', lithology: '奥陶系+寒武系灰岩', features: '岩溶盆地型', rechargeArea: '250', waterLevel: '-', tds: '-' },
  { name: '南焦泉', location: '石家庄元氏', discharge: '-', unit: 'm³/s', type: '全排型', area: '314', lithology: '奥陶系+寒武系灰岩', features: '岩溶盆地型', rechargeArea: '-', waterLevel: '-', tds: '-' },
  { name: '龙潭泉', location: '张家口赤城', discharge: '-', unit: 'm³/s', type: '全排型', area: '600', lithology: '中上元古界白云岩', features: '岩溶盆地型', rechargeArea: '-', waterLevel: '-', tds: '-' },
];

/** 岩溶水系统分区特征 */
export const karstSystemZones = [
  { zone: '太行山南段', area: '~8000', aquifer: 'O₂+∈灰岩', feature: '黑龙洞/百泉泉域，强岩溶发育，排泄基准面控制', karstType: '溶隙-溶洞型', T: '58320～83600', avgYield: '3.6～26.64', rainfall: '500~600', rechargeCoeff: '0.20~0.30' },
  { zone: '太行山中段', area: '~6000', aquifer: 'O+∈+Pt白云岩', feature: '威州/涞源泉域，岩溶较发育，多层含水', karstType: '溶隙型', T: '5000～30000', avgYield: '5～15', rainfall: '500~650', rechargeCoeff: '0.15~0.25' },
  { zone: '太行山北段', area: '~4000', aquifer: '∈+Pt白云岩/灰岩', feature: '拒马河岩溶系统，岩溶中等发育', karstType: '溶隙-溶孔型', T: '1000～5000', avgYield: '2～10', rainfall: '550~700', rechargeCoeff: '0.12~0.20' },
  { zone: '燕山南麓', area: '~3000', aquifer: 'O₂灰岩', feature: '柳江盆地/三河向斜，局部岩溶发育', karstType: '溶隙型', T: '500～2000', avgYield: '1～5', rainfall: '600~750', rechargeCoeff: '0.10~0.18' },
  { zone: '冀西北山间', area: '~2000', aquifer: '∈+Pt白云岩', feature: '赤城/蔚县岩溶，岩溶较弱', karstType: '溶隙-溶孔型', T: '200～1000', avgYield: '<5', rainfall: '350~450', rechargeCoeff: '0.08~0.15' },
];

/** 岩溶水开发分区统计 */
export const karstExploitation = [
  { zone: '太行山南段', totalAllowable: '~15', currentExtraction: '~8', status: '有潜力', overExploitRatio: '53%' },
  { zone: '太行山中段', totalAllowable: '~10', currentExtraction: '~6', status: '基本平衡', overExploitRatio: '60%' },
  { zone: '太行山北段', totalAllowable: '~5', currentExtraction: '~3', status: '有潜力', overExploitRatio: '60%' },
  { zone: '燕山南麓', totalAllowable: '~3', currentExtraction: '~2', status: '基本平衡', overExploitRatio: '67%' },
  { zone: '冀西北山间', totalAllowable: '~2', currentExtraction: '~0.5', status: '潜力较大', overExploitRatio: '25%' },
];

/** 岩溶水水化学特征（v2.0新增） */
export const karstWaterChemistry = [
  { zone: '太行山南段', waterType: 'HCO₃-Ca·Mg', tds: '0.3~0.6', hardness: '180~300', pH: '7.2~7.8', temperature: '14~16', features: '低矿化度，水质优良' },
  { zone: '太行山中段', waterType: 'HCO₃-Ca', tds: '0.3~0.5', hardness: '150~280', pH: '7.3~7.9', temperature: '13~15', features: '低矿化度，富含Ca²⁺' },
  { zone: '太行山北段', waterType: 'HCO₃-Ca·Mg', tds: '0.2~0.4', hardness: '120~250', pH: '7.4~8.0', temperature: '12~14', features: '极低矿化度，适合饮用' },
  { zone: '燕山南麓', waterType: 'HCO₃-Ca', tds: '0.2~0.5', hardness: '150~300', pH: '7.2~8.0', temperature: '12~15', features: '水质变化较大，局部SO₄偏高' },
  { zone: '冀西北山间', waterType: 'HCO₃-Ca·Mg', tds: '0.2~0.4', hardness: '100~220', pH: '7.5~8.2', temperature: '8~12', features: '低温低矿化度，山区特征明显' },
];

/** 岩溶水保护分区（v2.0新增） */
export const karstProtectionZones = [
  { spring: '黑龙洞泉域', protectionLevel: '省级', protectionArea: '420', coreArea: '85', keyMeasure: '禁止在补给区建设污染项目，限制开采量' },
  { spring: '邢台百泉', protectionLevel: '省级', protectionArea: '580', coreArea: '120', keyMeasure: '泉域内禁止新设排污口，关停自备井' },
  { spring: '威州泉', protectionLevel: '省级', protectionArea: '380', coreArea: '65', keyMeasure: '限制岩溶水开采，补给区植被恢复' },
  { spring: '涞源泉', protectionLevel: '市级', protectionArea: '200', coreArea: '30', keyMeasure: '泉域内禁止采矿活动，控制旅游开发强度' },
  { spring: '东风湖泉', protectionLevel: '市级', protectionArea: '120', coreArea: '20', keyMeasure: '限制铁矿排水，建立监测预警体系' },
];


/** 岩溶发育深度分带（据钻孔统计） */
export const karstDevelopmentDepth = [
  { zone: '太行山南段', shallow: '0~80m', moderate: '80~200m', deep: '200~400m', base: '400~500m', feature: '表层溶蚀强烈，溶洞多发育在100m以上', typical: '黑龙洞泉域' },
  { zone: '太行山中段', shallow: '0~60m', moderate: '60~150m', deep: '150~300m', base: '300~400m', feature: '溶隙为主，局部溶洞，发育深度受侵蚀基准面控制', typical: '威州泉域' },
  { zone: '太行山北段', shallow: '0~50m', moderate: '50~120m', deep: '120~250m', base: '250~350m', feature: '溶隙-溶孔型，岩溶发育较弱', typical: '涞源泉域' },
  { zone: '燕山南麓', shallow: '0~40m', moderate: '40~100m', deep: '100~200m', base: '200~300m', feature: '局部溶洞，受构造控制明显', typical: '柳江盆地' },
  { zone: '隐伏岩溶区', shallow: '0~50m(埋深)', moderate: '50~150m(埋深)', deep: '150~300m(埋深)', base: '>300m(埋深)', feature: '平原区隐伏岩溶，受上覆第四系覆盖，溶蚀较弱', typical: '冀中坳陷' },
];

/** 主要泉域流量动态特征 */
export const springFlowDynamics = [
  { spring: '黑龙洞泉群', period: '1970-2000', maxFlow: 15.2, minFlow: 6.8, avgFlow: 10.4, cv: 0.25, recessionCoeff: 0.0035, regulationType: '强调节', rainfallResponse: '滞后3~6个月' },
  { spring: '邢台百泉', period: '1970-2000', maxFlow: 10.5, minFlow: 2.5, avgFlow: 6.5, cv: 0.38, recessionCoeff: 0.0042, regulationType: '中调节', rainfallResponse: '滞后2~4个月' },
  { spring: '威州泉', period: '1970-2000', maxFlow: 12.8, minFlow: 5.2, avgFlow: 9.48, cv: 0.28, recessionCoeff: 0.0038, regulationType: '强调节', rainfallResponse: '滞后3~5个月' },
  { spring: '涞源泉', period: '1970-2000', maxFlow: 5.8, minFlow: 1.5, avgFlow: 3.2, cv: 0.42, recessionCoeff: 0.0050, regulationType: '弱调节', rainfallResponse: '滞后1~3个月' },
  { spring: '东风湖泉', period: '1970-2000', maxFlow: 3.8, minFlow: 1.2, avgFlow: 2.5, cv: 0.35, recessionCoeff: 0.0045, regulationType: '中调节', rainfallResponse: '滞后2~4个月' },
];

/** 岩溶水系统补给特征 */
export const karstRechargeFeatures = [
  { spring: '黑龙洞泉群', rechargeArea: 2700, rainfall: 550, totalRecharge: 2.97, precipInfiltration: 1.86, riverLeakage: 0.89, lateralInflow: 0.22, infiltrationCoeff: 0.25 },
  { spring: '邢台百泉', rechargeArea: 3800, rainfall: 520, totalRecharge: 2.86, precipInfiltration: 1.72, riverLeakage: 0.95, lateralInflow: 0.19, infiltrationCoeff: 0.22 },
  { spring: '威州泉', rechargeArea: 2800, rainfall: 560, totalRecharge: 3.12, precipInfiltration: 1.96, riverLeakage: 0.88, lateralInflow: 0.28, infiltrationCoeff: 0.25 },
  { spring: '涞源泉', rechargeArea: 1200, rainfall: 580, totalRecharge: 1.08, precipInfiltration: 0.72, riverLeakage: 0.28, lateralInflow: 0.08, infiltrationCoeff: 0.21 },
  { spring: '东风湖泉', rechargeArea: 800, rainfall: 540, totalRecharge: 0.62, precipInfiltration: 0.38, riverLeakage: 0.20, lateralInflow: 0.04, infiltrationCoeff: 0.20 },
];

/** 岩溶水环境同位素特征 */
export const karstIsotopeFeatures = [
  { spring: '黑龙洞泉群', deltaD: -68, delta18O: -9.2, tritium: 8.5, carbon14: 65, age: '现代水+1950s混合', rechargeElevation: '800~1200m', circulationDepth: '300~500m' },
  { spring: '邢台百泉', deltaD: -65, delta18O: -8.8, tritium: 6.2, carbon14: 48, age: '现代水为主', rechargeElevation: '700~1100m', circulationDepth: '250~450m' },
  { spring: '威州泉', deltaD: -70, delta18O: -9.5, tritium: 7.8, carbon14: 55, age: '现代水+部分老水', rechargeElevation: '900~1300m', circulationDepth: '350~550m' },
  { spring: '涞源泉', deltaD: -72, delta18O: -9.8, tritium: 5.5, carbon14: 35, age: '老水比例较高', rechargeElevation: '1000~1500m', circulationDepth: '400~600m' },
];
