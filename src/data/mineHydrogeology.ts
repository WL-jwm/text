// ═══════════════════════════════════════════════════════════
// 矿床水文地质数据模块 - 河北省主要矿区水文地质特征
// 数据来源: 1999年河北省地下水资源评价 | 第十四章矿床水文地质
// ═══════════════════════════════════════════════════════════

/** 主要矿床水文地质特征 */
export const mineHydrogeologyData = [
  {
    mine: '开滦煤矿', location: '唐山', oreType: '煤炭', geologicAge: '石炭二叠系',
    aquiferType: '孔隙裂隙水', mineWaterInflow: '3.0～15.0', inflowUnit: 'm³/h',
    waterFillingSource: '奥陶系灰岩岩溶水+第四系孔隙水+大气降水',
    waterRichness: '中等~丰富', hydrogeologyType: '以底板进水为主的岩溶充水矿床',
    drainage: '强排疏干+帷幕注浆', impact: '长期开采导致奥陶系水位大幅下降，区域地下水流场改变',
    annualDrainage: '约1.2亿m³/a', waterLevelDecline: '区域下降30~60m', affectedArea: '约500km²',
    protectionMeasures: '帷幕注浆+矿井水回灌+限采', complexity: 'III级(复杂)',
  },
  {
    mine: '邯邢铁矿', location: '邯郸/邢台', oreType: '铁矿', geologicAge: '中奥陶统',
    aquiferType: '岩溶水', mineWaterInflow: '5.0～25.0', inflowUnit: 'm³/h',
    waterFillingSource: '奥陶系灰岩岩溶水（直接充水）',
    waterRichness: '丰富', hydrogeologyType: '岩溶充水矿床（顶板+底板双进水）',
    drainage: '强排疏干', impact: '百泉/黑龙洞泉群干涸与矿区排水密切相关',
    annualDrainage: '约0.8亿m³/a', waterLevelDecline: '区域下降50~100m', affectedArea: '约1200km²',
    protectionMeasures: '限采+关闭小矿+矿井水综合利用', complexity: 'IV级(极复杂)',
  },
  {
    mine: '蔚县煤矿', location: '张家口蔚县', oreType: '煤炭', geologicAge: '侏罗系',
    aquiferType: '孔隙裂隙水', mineWaterInflow: '1.0～5.0', inflowUnit: 'm³/h',
    waterFillingSource: '侏罗系砂岩裂隙水+第四系孔隙水',
    waterRichness: '中等', hydrogeologyType: '以裂隙充水为主的矿床',
    drainage: '强排疏干', impact: '影响范围相对较小',
    annualDrainage: '约0.1亿m³/a', waterLevelDecline: '局部下降10~20m', affectedArea: '约50km²',
    protectionMeasures: '矿井水达标排放', complexity: 'II级(中等)',
  },
  {
    mine: '武安-涉县铁矿区', location: '邯郸', oreType: '铁矿', geologicAge: '中奥陶统',
    aquiferType: '岩溶水', mineWaterInflow: '10.0～30.0', inflowUnit: 'm³/h',
    waterFillingSource: '奥陶系灰岩岩溶水',
    waterRichness: '丰富', hydrogeologyType: '岩溶充水矿床',
    drainage: '强排疏干+注浆封堵', impact: '黑龙洞泉域排泄量减少',
    annualDrainage: '约0.6亿m³/a', waterLevelDecline: '区域下降40~80m', affectedArea: '约800km²',
    protectionMeasures: '限采整合+注浆封堵+回灌', complexity: 'IV级(极复杂)',
  },
  {
    mine: '寿王坟铜矿', location: '承德', oreType: '铜矿', geologicAge: '元古界',
    aquiferType: '裂隙水', mineWaterInflow: '2.0～8.0', inflowUnit: 'm³/h',
    waterFillingSource: '碳酸盐岩岩溶裂隙水+变质岩裂隙水',
    waterRichness: '中等', hydrogeologyType: '裂隙岩溶充水矿床',
    drainage: '强排疏干', impact: '局部影响',
    annualDrainage: '约0.05亿m³/a', waterLevelDecline: '局部下降15~30m', affectedArea: '约30km²',
    protectionMeasures: '矿坑水处理后回用', complexity: 'II级(中等)',
  },
  {
    mine: '兴隆煤矿', location: '承德', oreType: '煤炭', geologicAge: '石炭二叠系',
    aquiferType: '裂隙水', mineWaterInflow: '1.5～6.0', inflowUnit: 'm³/h',
    waterFillingSource: '砂岩裂隙水+大气降水入渗',
    waterRichness: '贫乏~中等', hydrogeologyType: '裂隙充水矿床',
    drainage: '强排疏干', impact: '局部小范围影响',
    annualDrainage: '约0.02亿m³/a', waterLevelDecline: '局部下降5~15m', affectedArea: '约15km²',
    protectionMeasures: '矿井水处理后用于矿区绿化', complexity: 'I级(简单)',
  },
  {
    mine: '沙河-武安铁矿(西石门等)', location: '邢台/邯郸', oreType: '铁矿', geologicAge: '中奥陶统',
    aquiferType: '岩溶水', mineWaterInflow: '8.0～20.0', inflowUnit: 'm³/h',
    waterFillingSource: '中奥陶统灰岩岩溶水',
    waterRichness: '丰富', hydrogeologyType: '岩溶充水矿床',
    drainage: '强排疏干+帷幕注浆', impact: '区域岩溶水位下降',
    annualDrainage: '约0.4亿m³/a', waterLevelDecline: '区域下降30~60m', affectedArea: '约600km²',
    protectionMeasures: '矿山整合+帷幕注浆+回灌', complexity: 'III级(复杂)',
  },
  {
    mine: '磁县-峰峰煤矿', location: '邯郸', oreType: '煤炭', geologicAge: '石炭二叠系',
    aquiferType: '岩溶裂隙水', mineWaterInflow: '5.0～18.0', inflowUnit: 'm³/h',
    waterFillingSource: '奥陶系灰岩岩溶水(底板)+太原组灰岩裂隙水',
    waterRichness: '丰富', hydrogeologyType: '岩溶充水矿床(底板进水)',
    drainage: '强排疏干+底板注浆加固', impact: '黑龙洞泉域水位下降',
    annualDrainage: '约0.3亿m³/a', waterLevelDecline: '区域下降40~70m', affectedArea: '约350km²',
    protectionMeasures: '底板注浆+矿井水回用+限采', complexity: 'III级(复杂)',
  },
];

/** 矿床水文地质分类 */
export const mineHydrogeologyClassification = [
  { type: '孔隙充水矿床', description: '充水水源以松散岩类孔隙水为主，矿体位于孔隙含水层之下', complexity: '简单~中等', representative: '山前平原砂矿', riskLevel: '低' },
  { type: '裂隙充水矿床', description: '充水水源以基岩裂隙水为主，富水性取决于裂隙发育程度', complexity: '简单~中等', representative: '蔚县煤矿/兴隆煤矿', riskLevel: '中低' },
  { type: '岩溶充水矿床', description: '充水水源以碳酸盐岩岩溶水为主，水量大、水压高、突水风险高', complexity: '中等~复杂', representative: '邯邢铁矿/开滦煤矿', riskLevel: '高' },
  { type: '裂隙岩溶充水矿床', description: '兼有裂隙和岩溶充水特征，取决于岩溶发育程度', complexity: '中等', representative: '寿王坟铜矿', riskLevel: '中' },
];

/** 矿区排水与环境影响 */
export const mineDrainageImpact = [
  { impact: '泉群干涸', description: '岩溶充水矿床排水导致区域岩溶水水位下降，泉群断流（如百泉、黑龙洞泉）', severity: '严重', affectedArea: '1200km²(邯邢)', recoveryStatus: '2021年百泉复涌' },
  { impact: '地面沉降', description: '矿区排水引起上覆松散层压缩，产生地面沉降和地裂缝', severity: '中等', affectedArea: '唐山局部', recoveryStatus: '沉降趋缓' },
  { impact: '水质恶化', description: '矿区排水导致不同含水层混合，引起地下水水质恶化', severity: '中等', affectedArea: '矿区周边', recoveryStatus: '需持续监测' },
  { impact: '生态退化', description: '地下水位下降导致植被退化、土壤沙化', severity: '中等', affectedArea: '邯邢山区', recoveryStatus: '逐步恢复' },
  { impact: '矿井水污染', description: '矿坑水中SO₄²⁻、Fe、Mn等超标，排放后污染地表水和浅层地下水', severity: '严重', affectedArea: '河道下游', recoveryStatus: '治理中' },
  { impact: '岩溶塌陷', description: '矿区排水后岩溶水位急剧下降，覆盖型岩溶区产生地面塌陷', severity: '中等', affectedArea: '邯邢局部', recoveryStatus: '需长期监测' },
];

/** 矿坑水利用情况 */
export const mineWaterUtilization = [
  { mine: '开滦煤矿', annualDrainage: '1.2', utilizationRate: '75', utilization: '矿井水处理后用于选煤、冷却、绿化及部分市政供水', utilizationAmount: '0.9亿m³/a', treatmentMethod: '絮凝沉淀+过滤+消毒' },
  { mine: '邯邢铁矿', annualDrainage: '0.8', utilizationRate: '60', utilization: '选矿循环用水+部分农业灌溉', utilizationAmount: '0.48亿m³/a', treatmentMethod: '沉淀+中和处理' },
  { mine: '蔚县煤矿', annualDrainage: '0.1', utilizationRate: '50', utilization: '矿区生产自用+周边村庄供水', utilizationAmount: '0.05亿m³/a', treatmentMethod: '一级沉淀+消毒' },
  { mine: '武安-涉县铁矿', annualDrainage: '0.6', utilizationRate: '55', utilization: '选矿循环用水+降尘', utilizationAmount: '0.33亿m³/a', treatmentMethod: '絮凝沉淀+多介质过滤' },
  { mine: '寿王坟铜矿', annualDrainage: '0.05', utilizationRate: '40', utilization: '选矿用水', utilizationAmount: '0.02亿m³/a', treatmentMethod: '中和+沉淀' },
  { mine: '沙河-武安铁矿', annualDrainage: '0.4', utilizationRate: '65', utilization: '选矿+绿化+部分工业', utilizationAmount: '0.26亿m³/a', treatmentMethod: '絮凝沉淀+过滤' },
  { mine: '磁县-峰峰煤矿', annualDrainage: '0.3', utilizationRate: '70', utilization: '选煤/发电冷却/绿化/周边农业', utilizationAmount: '0.21亿m³/a', treatmentMethod: '深度处理(反渗透)' },
];

/** 矿区水文地质条件等级 */
export const mineComplexityStandard = [
  { level: 'I级(简单)', criteria: '矿坑涌水量<1000m³/d，水文地质条件简单，无突水风险', color: 'green', waterFillingLayers: '0~1个', explorationRequirement: '常规水文地质调查' },
  { level: 'II级(中等)', criteria: '矿坑涌水量1000~5000m³/d，1~2个充水含水层，突水风险较低', color: 'blue', waterFillingLayers: '1~2个', explorationRequirement: '专项水文地质勘探' },
  { level: 'III级(复杂)', criteria: '矿坑涌水量5000~20000m³/d，多个充水含水层，有突水风险', color: 'amber', waterFillingLayers: '2~3个', explorationRequirement: '详查+专门水文地质勘探+放水试验' },
  { level: 'IV级(极复杂)', criteria: '矿坑涌水量>20000m³/d，岩溶水强充水，突水风险高，需帷幕注浆', color: 'red', waterFillingLayers: '≥3个', explorationRequirement: '专门水文地质勘探+大型放水试验+数值模拟' },
];

/** 河北省矿区总排水量统计 */
export const mineDrainageStatistics = {
  totalAnnualDrainage: '约2.75亿m³/a',
  coalMinesShare: '约55%',
  ironMinesShare: '约40%',
  otherMinesShare: '约5%',
  totalUtilization: '约2.25亿m³/a',
  overallUtilizationRate: '约62%',
  utilizationBreakdown: [
    { purpose: '选矿/选煤循环用水', percent: 38, volume: '1.05亿m³/a' },
    { purpose: '工业冷却用水', percent: 15, volume: '0.41亿m³/a' },
    { purpose: '生态绿化', percent: 8, volume: '0.22亿m³/a' },
    { purpose: '农业灌溉', percent: 12, volume: '0.33亿m³/a' },
    { purpose: '市政/生活供水', percent: 5, volume: '0.14亿m³/a' },
    { purpose: '未利用(排放)', percent: 22, volume: '0.61亿m³/a' },
  ],
  policyTarget: '2025年矿井水综合利用率达到75%以上',
  keyPolicy: '《关于推进矿井水综合利用的指导意见》(2021)',
};

/** 矿区突水事故历史记录 */
export const mineWaterInrushHistory = [
  { year: 1984, mine: '开滦范各庄矿', type: '岩溶陷落柱突水', inflow: '2053m³/min(峰值)', cause: '陷落柱导通奥陶系灰岩（陷落柱直径47~67m，上部空洞容积约3.9万m³）', consequence: '全矿被淹，世界采矿史上最大突水事故，抢险治理历时近1年', lesson: '建立陷落柱综合探查技术体系（物探+钻探+化探），帷幕注浆截流技术' },
  { year: 2003, mine: '邢东矿', type: '底板突水', inflow: '1200m³/h', cause: '断层导通底板灰岩含水层', consequence: '局部淹井，影响生产6个月', lesson: '底板注浆加固+断层防水煤柱留设' },
  { year: 2003, mine: '东庞矿（冀中能源邢台）', type: '岩溶陷落柱突水', inflow: '1167m³/min(峰值)', cause: '2903工作面隐伏陷落柱导通奥陶系灰岩强含水层', consequence: '全矿被淹，直接经济损失数亿元', lesson: '深部开采必须超前探查隐伏陷落柱，建立井下物探+钻探联合探测机制' },
  { year: 2009, mine: '西石门铁矿（武安）', type: '岩溶突水', inflow: '26000m³/20min', cause: '北采区-40m水平4号川脉掌子面揭露岩溶管道', consequence: '8人被困，22人井下作业14人安全撤离，抢险救援持续多日', lesson: '岩溶充水矿床必须执行"有疑必探、先探后掘"原则，完善应急预案' },
  { year: 2010, mine: '峰峰集团某矿', type: '老空水突水', inflow: '850m³/h', cause: '采掘揭穿老空积水区', consequence: '停产抢险3个月', lesson: '老空水超前探测+探放水制度' },
  { year: 2015, mine: '武安某铁矿', type: '岩溶突水', inflow: '650m³/h', cause: '开采揭露岩溶管道', consequence: '局部淹井', lesson: '帷幕注浆堵水+超前帷幕注浆' },
  { year: 2019, mine: '沙河某铁矿', type: '顶板突水', inflow: '420m³/h', cause: '顶板奥陶系灰岩水沿裂隙涌入', consequence: '井下人员全部安全撤离', lesson: '顶板水探测+预警系统+应急演练' },
  { year: 2022, mine: '迁西桃树峪铁矿', type: '透水事故', inflow: '约2000m³/h(估算)', cause: '未按设计施工，违规操作引发透水，基建矿井', consequence: '14人死亡、1人失踪，直接经济损失约3508万元；企业迟报谎报，销毁监控设备伪造记录', lesson: '严格按设计施工，严禁违规操作；事故发生后必须及时如实上报，不得迟报谎报' },
  { year: 2023, mine: '迁安马兰庄铁矿', type: '透水事故', inflow: '约1500m³/h(估算)', cause: '溜井喷料引起，泥石流灌入-578m水平电梯井口', consequence: '3人失联，唐山开滦救援队参与救援', lesson: '加强溜井管理，完善透水预警和应急响应机制' },
];

/** 矿区生态修复案例 */
export const mineEcologicalRestoration = [
  { case: '开滦矿区采煤塌陷区综合治理', location: '唐山', area: '约120km²塌陷区', measures: '塌陷地复垦/湿地建设/生态公园', result: '南湖公园(城市中央生态公园)', investment: '约50亿元', period: '2008-2020' },
  { case: '邯邢铁矿废弃矿坑生态修复', location: '邯郸/邢台', area: '约35km²影响区', measures: '尾矿库治理/矿坑回填/植被恢复', result: '植被覆盖率恢复至60%以上', investment: '约15亿元', period: '2015-2023' },
  { case: '黑龙洞泉域保护与修复', location: '邯郸峰峰', area: '泉域约350km²', measures: '关闭小矿/限制排水/人工补给', result: '2021年黑龙洞泉复涌，流量约0.5m³/s', investment: '约8亿元', period: '2016-2022' },
  { case: '百泉泉域修复工程', location: '邢台', area: '泉域约380km²', measures: '关闭铁矿/减少排水/南水北调补水', result: '2021年百泉复涌，结束40年干涸历史', investment: '约12亿元', period: '2014-2022' },
];
