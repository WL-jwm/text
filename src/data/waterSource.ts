// C-水源地蓄水构造 (稳定可更新)
// 数据来源: 1999（基础文献）| 第七章 完整提取
// 版本: v2.0 | 更新频率: 新水源地勘查资料入库时追加

/** 蓄水构造类型概览 */
export const storageStructureSummary = [
  { type: '岩溶盆地型', count: 17, code: 'karst-basin', description: '碳酸盐岩裸露/浅覆盖区，溶隙溶洞发育，泉水排泄', totalArea: '~20000', representative: '黑龙洞/百泉/威州/涞源泉' },
  { type: '山间盆地型', count: 5, code: 'intermontane-basin', description: '第四系冲洪积物，潜水-微承压，砾石卵石为主', totalArea: '~8000', representative: '张家口/蔚县-阳原盆地' },
  { type: '冲洪积扇型', count: 7, code: 'alluvial-fan', description: '山前冲洪积扇，砾石卵石粗砂，富水性强', totalArea: '~15000', representative: '唐河-大沙河/滦河冲洪积扇' },
  { type: '平原古河道型', count: 9, code: 'paleochannel', description: '古河道带状淡水体，细粉砂中细砂', totalArea: '~50000', representative: '滹沱河/潴龙河古河道带' },
  { type: '冲积湖积型', count: 1, code: 'alluvial-lacustrine', description: '中部平原深部承压水，多层中细砂与粘性土交叠', totalArea: '~30000', representative: '沧州深层承压水' },
];

/** 一、岩溶盆地型蓄水构造 */
export const karstBasinStructures = [
  { id: 1, name: '黑龙洞蓄水构造', area: '2074.5', exposedArea: 1207, coveredArea: 753.5, boundary: '北:砂页岩+洺河水分水岭；西:长亭-涉县断层+闪长岩体；东:阻水断层+深埋灰岩；南:断层+水分水岭', lithology: '奥陶系中统灰岩，岩溶发育', depth: '50~300', aquiferRock: '奥陶系灰岩', discharge: '黑龙洞泉群(10.4m³/s)' },
  { id: 2, name: '东风湖蓄水构造', area: '691', exposedArea: 584, coveredArea: 90, boundary: '北:符山岩体+水分水岭；东:长亭-涉县断层；南:水分水岭；西:断层+页岩', lithology: '奥陶系中统灰岩，溶隙溶孔发育', depth: '约200', aquiferRock: '奥陶系灰岩', discharge: '东风湖泉(2.5m³/s)' },
  { id: 3, name: '邢台百泉蓄水构造', area: '3843', exposedArea: 338.6, coveredArea: 1575, boundary: '北:水分水岭；东:内丘-邢台断层+埋深1000m线；南:水分水岭+岩性隔水；西:水分水岭', lithology: '奥陶系+寒武系灰岩，溶隙溶洞发育', depth: '200~300', aquiferRock: '奥陶系+寒武系灰岩', discharge: '百泉(6.5m³/s)' },
  { id: 4, name: '威州泉蓄水构造', area: '2702.8', exposedArea: 1656.4, coveredArea: 112.5, boundary: '北:页岩(东西段)+水分水岭(中段)；东:水分水岭；西:奥陶系下统顶界面+水分水岭', lithology: '奥陶系+寒武系灰岩，溶隙溶洞发育', depth: '200~250', aquiferRock: '奥陶系+寒武系灰岩', discharge: '威州泉(9.48m³/s)' },
  { id: 5, name: '十股泉蓄水构造', area: '1237.5', exposedArea: 45.5, coveredArea: 452.2, boundary: '北/南/西:水分水岭；东:深大断裂阻水', lithology: '奥陶系中统灰岩，溶隙溶洞较发育', depth: '150~200', aquiferRock: '奥陶系灰岩', discharge: '十股泉' },
  { id: 6, name: '曲阳水磨槽蓄水构造', area: '919.6', exposedArea: 710.5, coveredArea: 154.8, boundary: '周边均以水分水岭为界', lithology: '奥陶系+寒武系灰岩+中上元古界白云岩，溶隙溶洞较发育', depth: '100~150', aquiferRock: '奥陶系/寒武系/白云岩', discharge: '水磨槽泉群(515L/s)' },
  { id: 7, name: '涞源泉蓄水构造', area: '1149.2', exposedArea: 813.7, coveredArea: 291.7, boundary: '北/南:水分水岭；东:王安镇岩体阻水；西:水分水岭', lithology: '奥陶系+寒武系灰岩+中上元古界白云岩，溶隙溶洞较发育', depth: '100~150', aquiferRock: '奥陶系/寒武系/白云岩', discharge: '涞源泉(3.2m³/s)' },
  { id: 8, name: '蔚县南山北泉蓄水构造', area: '2914.0', exposedArea: 1045.0, coveredArea: 327.6, boundary: '北:岩性弱透水边界；其余:水分水岭', lithology: '奥陶系+寒武系灰岩+中上元古界白云岩，溶隙溶洞较发育', depth: '100', aquiferRock: '奥陶系/寒武系/白云岩', discharge: '北泉' },
  { id: 9, name: '蔚县壶流河盆地蓄水构造', area: '1500', exposedArea: 279, coveredArea: 227.6, boundary: '以阻水断层构成周围边界', lithology: '奥陶系+寒武系灰岩，岩溶较发育', depth: '-', aquiferRock: '奥陶系/寒武系灰岩', discharge: '-' },
  { id: 10, name: '柳江盆地蓄水构造', area: '200', exposedArea: 100, coveredArea: 67, boundary: '花岗岩体+水分水岭隔水边界', lithology: '奥陶系中统灰岩，岩溶发育', depth: '-', aquiferRock: '奥陶系灰岩', discharge: '-' },
  { id: 11, name: '开平向斜蓄水构造', area: '1150', exposedArea: 38, coveredArea: 1112, boundary: '北:大八里庄断裂；东:雷庄断层；南:宁河-昌黎断裂；西北:卑子院背斜', lithology: '奥陶系中统灰岩，岩溶发育', depth: '200~300', aquiferRock: '奥陶系灰岩', discharge: '-' },
  { id: 12, name: '赤城龙潭泉蓄水构造', area: '600', exposedArea: 600, coveredArea: 0, boundary: '西/北:片麻岩+侏罗系砂泥页岩；东:页岩；南:水分水岭', lithology: '中上元古界白云岩，岩溶较发育', depth: '-', aquiferRock: '中上元古界白云岩', discharge: '龙潭泉' },
  { id: 13, name: '玉田-林南仓向斜蓄水构造', area: '630', exposedArea: 0, coveredArea: 630, boundary: '中上元古界隔水边界，向斜构造', lithology: '奥陶系中统灰岩，岩溶较发育', depth: '200~300', aquiferRock: '奥陶系灰岩', discharge: '-' },
  { id: 14, name: '三河向斜蓄水构造', area: '210', exposedArea: 8, coveredArea: 202, boundary: '南:寒武系弱透水；北:石炭二叠系隔水；东:夏垫断层阻水；西:透水边界', lithology: '奥陶系中统灰岩，岩溶发育', depth: '150~200', aquiferRock: '奥陶系灰岩', discharge: '齐心庄水源地' },
  { id: 15, name: '石家庄蓄水构造(白鹿泉)', area: '203', exposedArea: 7, coveredArea: 196, boundary: '隔水岩石为边界', lithology: '奥陶系+寒武系灰岩', depth: '50~100', aquiferRock: '奥陶系/寒武系灰岩', discharge: '白鹿泉' },
  { id: 16, name: '元氏蓄水构造(南焦泉)', area: '314', exposedArea: 0, coveredArea: 314, boundary: '-', lithology: '-', depth: '-', aquiferRock: '奥陶系/寒武系灰岩', discharge: '南焦泉' },
];

/** 二、山间盆地型蓄水构造 */
export const intermontaneBasinStructures = [
  { id: 1, name: '张家口盆地蓄水构造', catchmentArea: 2079, storageArea: 1490, boundary: '西:洋河河谷进水口补给；东:响水铺出口排泄；北/南:山地弱透水', lithology: '第四系潜水-微承压，砾石卵石为主', depth: '30~100', aquiferRock: '第四系冲洪积', waterSource: '腰站堡/样台/沙岭子水源地' },
  { id: 2, name: '蔚县-阳原盆地蓄水构造', catchmentArea: 2973, storageArea: '1584+1389', boundary: '西南:壶流河/桑干河进口补给；东北:桑干河石匣里出口排泄', lithology: '第四系潜水-微承压，砾石粗砂为主', depth: '20~50', aquiferRock: '第四系冲洪积', waterSource: '-' },
  { id: 3, name: '遵化盆地蓄水构造', catchmentArea: 540, storageArea: '-', boundary: '东北:沟口河进口补给；周围:弱透水-隔水；西南:出口排泄', lithology: '第四系潜水-微承压，砾石卵石', depth: '30~50', aquiferRock: '第四系冲洪积', waterSource: '-' },
  { id: 4, name: '迁安盆地蓄水构造', catchmentArea: 870, storageArea: '-', boundary: '西北:滦河进口补给；南:出口排泄；周围:基岩隔水', lithology: '第四系潜水-微承压，河漫滩/一级阶地砾石卵石', depth: '20~40', aquiferRock: '第四系冲洪积', waterSource: '-' },
];

/** 三、冲洪积扇型蓄水构造 */
export const alluvialFanStructures = [
  { id: 1, name: '滦河冲洪积扇型', area: '700', boundary: '顶点:雷庄/滦县补给；西:陡河/东:饮马河/南:海域', lithology: '第二+第一含水层组，砾石卵石', depth: '70~100', aquiferRock: '第四系冲洪积', waterSource: '靖安水源地' },
  { id: 2, name: '还乡河(古滦河)冲洪积扇型', area: '1830', boundary: '顶点:丰润补给；西:还乡河/东:陡河断层/南:丰南', lithology: '第二+第三含水层组，砾石卵石', depth: '40~80', aquiferRock: '第四系冲洪积', waterSource: '丰润水源地' },
  { id: 3, name: '拒马河冲洪积扇型', area: '2737', boundary: '顶点:南拒马河出山口补给；涞水-定兴/涿州/新城扇形边界', lithology: '第二含水层组，砾石卵石', depth: '40~60', aquiferRock: '第四系冲洪积', waterSource: '-' },
  { id: 4, name: '唐河-大沙河冲洪积扇型', area: '6100', boundary: '顶点:唐河/大沙河出山口补给；望都/安国扇形边界', lithology: '第一+第二+第三含水层组，砾石卵石粗砂', depth: '80~160', aquiferRock: '第四系冲洪积', waterSource: '定州水源地' },
  { id: 5, name: '沙河-洺河冲洪积扇型', area: '1500', boundary: '顶点:沙河/洺河出山口补给；任县/永年/鸡泽扇形边界', lithology: '第二含水层组，砾石粗砂', depth: '40~70', aquiferRock: '第四系冲洪积', waterSource: '-' },
  { id: 6, name: '漳河冲洪积扇型', area: '1321', boundary: '顶点:岳城补给；磁县-成安/魏县/河南洪河屯扇形边界', lithology: '第二含水层组，砾石中粗砂', depth: '50~80', aquiferRock: '第四系冲洪积', waterSource: '-' },
];

/** 四、平原古河道型蓄水构造 */
export const paleochannelStructures = [
  { id: 1, name: '潴龙河古河道带', lithology: '细粉砂+中细砂', depth: '10~20', aquiferRock: '第四系冲积', width: '3~8' },
  { id: 2, name: '子牙河古河道带', lithology: '细粉砂+中细砂', depth: '10~20', aquiferRock: '第四系冲积', width: '3~10' },
  { id: 3, name: '漳卫河古河道带', lithology: '细粉砂+中细砂', depth: '10~20', aquiferRock: '第四系冲积', width: '3~8' },
  { id: 4, name: '南运河古河道带', lithology: '细粉砂+中细砂', depth: '10~20', aquiferRock: '第四系冲积', width: '3~6' },
  { id: 5, name: '滹沱河古河道带', lithology: '中砂+细砂', depth: '10~20', aquiferRock: '第四系冲积', width: '5~12' },
  { id: 6, name: '大清河古河道带', lithology: '中细砂', depth: '10~20', aquiferRock: '第四系冲积', width: '3~8' },
  { id: 7, name: '古黄河古河道带', lithology: '细砂+粉砂', depth: '10~20', aquiferRock: '第四系冲积', width: '5~15' },
  { id: 8, name: '冀东沿海古河道带', lithology: '中细砂', depth: '10~20', aquiferRock: '第四系冲积', width: '2~5' },
];

/** 水源地分类标准 (HJ/T338-2007) */
export const waterSourceClassification = [
  { code: 'I₁', name: '潜水-傍河型', model: '河流岸边，定水头补给边界', medium: '第四系砾石卵石砂孔隙', stabilityType: '稳定型/调节型', representative: '宣钢/承德滦河镇水源地' },
  { code: 'I₂', name: '潜水-山间河谷型', model: '宽1~3km带状冲积层，厚15~30m', medium: '第四系砾卵石含砾粗砂', stabilityType: '稳定型', representative: '承德秋窝水源地' },
  { code: 'I₃', name: '潜水-山间盆地型', model: '冲洪积扇群+河流冲积层交汇富水段，厚50~80m', medium: '第四系砾石卵石夹弱透水层', stabilityType: '稳定型', representative: '张家口腰站堡/宣化样台/沙岭子水源地' },
  { code: 'I₄', name: '潜水-山前冲洪积扇型', model: '扇体上部/轴部富水段，多层二元结构', medium: '第四系砾石卵石粗砂', stabilityType: '稳定型/消耗型', representative: '石家庄/定州/丰润/靖安水源地' },
  { code: 'I₅', name: '潜水-平原古河道型', model: '古河道带状淡水体，宽3~10km', medium: '第四系细粉砂中细砂', stabilityType: '稳定型', representative: '沧州/泊头低氟淡水水源地' },
  { code: 'I₆', name: '潜水-裸露/浅埋岩溶型', model: '碳酸盐岩裸露或浅覆盖区，岩溶发育', medium: '碳酸盐岩岩溶裂隙', stabilityType: '稳定型/调节型', representative: '上安电厂/羊角铺/石门寨水源地' },
  { code: 'II₁', name: '承压水-松散岩类单层', model: '深部承压含水层，弱透水越流补给', medium: '第四系中细砂', stabilityType: '消耗型', representative: '沧州/衡水/廊坊水源地' },
  { code: 'II₂', name: '承压水-松散岩类多层', model: '多层承压含水层组，层间越流', medium: '第四系中细砂多层', stabilityType: '消耗型', representative: '沧州/廊坊水源地' },
  { code: 'II₃', name: '承压水-碳酸盐岩单层岩溶', model: '隐伏岩溶承压水', medium: '碳酸盐岩岩溶', stabilityType: '稳定型/消耗型', representative: '邢台/三河齐心庄水源地' },
  { code: 'III₂', name: '叠置-松散潜水+岩溶承压', model: '上部第四系潜水+下部碳酸盐岩岩溶承压', medium: '第四系+碳酸盐岩', stabilityType: '混合型', representative: '三河/唐山市区水源地' },
  { code: 'III₃', name: '叠置-多层松散+岩溶', model: '多层松散含水层+碳酸盐岩岩溶承压叠置', medium: '第四系多层+碳酸盐岩', stabilityType: '混合型', representative: '唐山荆各庄水源地' },
];

/** 水源地规模分类标准 */
export const waterSourceScaleStandard = [
  { scale: '小型水源地', threshold: '<1', unit: '万m³/d', description: '乡镇及农村供水' },
  { scale: '中型水源地', threshold: '1~5', unit: '万m³/d', description: '县城及工业园区供水' },
  { scale: '大型水源地', threshold: '≥5', unit: '万m³/d', description: '设区市主要供水水源' },
  { scale: '特大型水源地', threshold: '≥15', unit: '万m³/d', description: '省会或区域中心城市供水' },
];

/** 重要水源地一览（v2.0新增） */
export const importantWaterSources = [
  { name: '石家庄水源地', type: 'I₄冲洪积扇型', supply: '120', unit: '万m³/d', status: '南水北调水源替代', aquifer: '滹沱河冲洪积扇卵砾石', protection: '一级保护区3.5km²' },
  { name: '保定水源地', type: 'I₄冲洪积扇型', supply: '85', unit: '万m³/d', status: '限采+外调水替代', aquifer: '唐河-大沙河冲洪积扇', protection: '一级保护区5.2km²' },
  { name: '唐山水源地', type: 'III₂叠置型', supply: '95', unit: '万m³/d', status: '部分替代', aquifer: '开平向斜+冲洪积扇', protection: '一级保护区4.8km²' },
  { name: '邯郸水源地', type: 'I₆岩溶型', supply: '55', unit: '万m³/d', status: '南水北调水源替代', aquifer: '黑龙洞泉域奥陶系灰岩', protection: '一级保护区12.6km²' },
  { name: '邢台水源地', type: 'I₆岩溶型', supply: '42', unit: '万m³/d', status: '南水北调水源替代', aquifer: '百泉泉域奥陶系灰岩', protection: '一级保护区8.3km²' },
  { name: '张家口水源地', type: 'I₃山间盆地型', supply: '28', unit: '万m³/d', status: '正常开采', aquifer: '张家口盆地第四系', protection: '一级保护区6.1km²' },
  { name: '承德水源地', type: 'I₂河谷型', supply: '18', unit: '万m³/d', status: '正常开采', aquifer: '武烈河冲积层', protection: '一级保护区3.8km²' },
  { name: '沧州水源地', type: 'II₁承压型', supply: '15', unit: '万m³/d', status: '深层承压水禁采+南水北调', aquifer: '第四系深层中细砂', protection: '一级保护区4.2km²' },
];

/** 山前富水带特征（v2.0新增） */
export const mountainFrontRichZones = [
  { zone: '太行山北段-涞水-涿州', K: '50~200', mu: '0.15~0.25', lithology: '卵砾石', thickness: '30~80', yield: '5~15', width: '5~15', gradient: '3~5‰' },
  { zone: '太行山中段-石家庄-定州', K: '80~300', mu: '0.18~0.28', lithology: '卵砾石粗砂', thickness: '50~120', yield: '10~30', width: '8~20', gradient: '2~4‰' },
  { zone: '太行山南段-邢台-邯郸', K: '50~200', mu: '0.15~0.25', lithology: '卵砾石中砂', thickness: '40~100', yield: '8~25', width: '5~15', gradient: '2~5‰' },
  { zone: '燕山南麓-唐山-遵化', K: '30~150', mu: '0.12~0.22', lithology: '卵砾石砂', thickness: '30~80', yield: '5~20', width: '5~12', gradient: '3~6‰' },
  { zone: '燕山西段-承德-平泉', K: '10~50', mu: '0.08~0.15', lithology: '砂砾石', thickness: '10~40', yield: '2~8', width: '2~5', gradient: '5~10‰' },
];
