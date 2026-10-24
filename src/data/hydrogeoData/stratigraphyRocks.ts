/**
 * 拆分自 resources-hydrogeo.ts
 */

// 河北省主要地层岩性（数据来源：《河北省水文地质工程地质》）
export const stratigraphyLayers = [
  { era: '新生界', system: '第四系', series: '全新统-更新统', code: 'Q', thickness: '', desc: '冲洪积/冲积/海积/坡积砂砾石、粉砂、粘土、黄土' },
  { era: '新生界', system: '上第三系', series: '上新统', code: 'N₂', thickness: '', desc: '砾岩、砂岩、泥岩、玄武岩夹层' },
  { era: '新生界', system: '下第三系', series: '始新-渐新统', code: 'E', thickness: '', desc: '砂岩、泥岩、石膏、褐煤，含水层以砂岩为主' },
  { era: '中生界', system: '白垩系', series: '上统', code: 'K', thickness: '', desc: '火山熔岩、凝灰质砂岩' },
  { era: '中生界', system: '侏罗系', series: '中统', code: 'J₂', thickness: '1100~2260', desc: '安山岩、凝灰岩、砂岩、砾岩，含煤层' },
  { era: '中生界', system: '三迭系', series: '中下统', code: 'T', thickness: '440~650', desc: '长石砂岩、页岩' },
  { era: '上古生界', system: '二迭系', series: '上统', code: 'P₂', thickness: '654', desc: '杂色砂岩、页岩、泥岩' },
  { era: '上古生界', system: '二迭系', series: '下统', code: 'P₁', thickness: '110', desc: '杂色页岩、砂岩，底部为灰质角砾岩' },
  { era: '上古生界', system: '石炭系', series: '中统', code: 'C₂', thickness: '130~190', desc: '铝土页岩、砂岩、灰岩夹煤层' },
  { era: '上古生界', system: '奥陶系', series: '中统', code: 'O₂', thickness: '600~700', desc: '厚层灰岩，主要岩溶含水层' },
  { era: '上古生界', system: '奥陶系', series: '下统', code: 'O₁', thickness: '124~210', desc: '白云岩、灰岩、竹叶状灰岩' },
  { era: '上古生界', system: '寒武系', series: '中统', code: '∈₂', thickness: '259~361', desc: '鲕状灰岩、紫红色页岩，底部肾状铁矿' },
  { era: '上古生界', system: '寒武系', series: '下统', code: '∈₁', thickness: '116~281', desc: '粗砂岩、砾岩、页岩、泥灰岩、灰岩' },
  { era: '上元古界', system: '震旦亚界', series: '中统', code: 'Z₂', thickness: '最厚层位', desc: '雾迷山组白云岩、白云质灰岩，主要含水层' },
  { era: '上元古界', system: '震旦亚界', series: '下统', code: 'Z₁', thickness: '', desc: '高于庄组/大红峪组白云岩、石英砂岩' },
  { era: '下元古界', system: '', series: '', code: 'Pt₁', thickness: '366~3000', desc: '甘陶河群：砂岩、板岩、安山岩、白云岩、角砾岩' },
  { era: '太古界', system: '', series: '', code: 'Ar', thickness: '', desc: '阜平群：各种片岩、片麻岩，夹大理岩' },
];

// 岩石工程地质分组（数据来源：《河北省水文地质工程地质》）
export const rockEngineeringGroups = [
  { category: '坚硬岩石类', strength: '>1000 kg/cm²', desc: '坚固、致密、完整、不可压缩，裂隙节理不发育' },
  { category: '坚硬-岩浆岩组', strength: '>1000', rocks: '花岗岩、闪长岩、辉长岩、正长岩、橄榄岩、玄武岩' },
  { category: '坚硬-沉积岩组', strength: '>1000', rocks: '砂质灰岩、石英砂岩、砾岩、结晶灰岩、结晶白云岩' },
  { category: '坚硬-变质岩组', strength: '>1000', rocks: '板岩、片岩、片麻岩、石英岩、大理岩、千枚岩' },
  { category: '半坚硬岩石类', strength: '500-1000 kg/cm²', desc: '较坚硬、密实，稍具压缩性，节理裂隙较发育' },
  { category: '半坚硬-粘土岩组', strength: '500-1000', rocks: '粘土岩、泥岩、泥灰岩、砂岩、页岩、铝土页岩及煤系地层' },
  { category: '半坚硬-碎屑岩组', strength: '500-1000', rocks: '粉砂岩、砂砾岩、角砾岩、集块岩' },
  { category: '松散岩石类', strength: '<100 kg/cm²', desc: '松软粘性土、砂砾石，具可塑性，压缩性随颗粒和密实度而异' },
  { category: '松散-粘质土岩组', strength: '<10', rocks: '亚砂土、亚粘土、粘土、泥砾' },
  { category: '松散-砂质土岩组', strength: '<100', rocks: '碎石层、砾卵石层、砂层、风成砂丘' },
  { category: '特殊岩石类', strength: '极低', desc: '高压缩性或湿陷性的软弱土层，需特殊处理' },
  { category: '特殊-黄土类岩组', strength: '极低', rocks: '黄土、黄土状土、次生黄土，具大孔隙、垂直节理、湿陷性' },
  { category: '特殊-淤泥类岩组', strength: '极低', rocks: '淤泥、淤泥质土、流砂层，高压缩性、承载力低' },
];

// 岩石风化带厚度（数据来源：《河北省水文地质工程地质》）
export const weatheringThickness = [
  { lithology: '花岗岩(一般)', full: '1~5', half: '15~25', note: '一般风化带厚1-5m' },
  { lithology: '花岗岩(岗南水库)', full: '1~8', half: '15~25' },
  { lithology: '花岗岩(洋河水库)', full: '1~8', half: '15~25' },
  { lithology: '花岗岩(二龙山)', full: '8~15', half: '15~25' },
  { lithology: '花岗岩(冀东山前)', full: '44', half: '', note: '构造裂隙影响，最厚44m' },
  { lithology: '闪长斑岩(楼里水库)', full: '3~5', half: '8~20' },
  { lithology: '煌斑岩(王快水库)', full: '5~10', half: '>20' },
  { lithology: '辉绿岩(西大洋水库)', full: '8~15', half: '>7' },
  { lithology: '玄武岩(一般)', full: '<20', half: '', note: '一般风化带厚度小于20m' },
];

// 岩石抗压强度（表249，数据来源：《河北省水文地质工程地质》）
export const rockCompressiveStrength = [
  { reservoir: '岗南', location: '库区及坝址', rock: '均质花岗片麻岩', dry: 1589, saturated: 1303 },
  { reservoir: '岗南', location: '库区及坝址', rock: '含铁花岗片麻岩', dry: 1747, saturated: 1225 },
  { reservoir: '岗南', location: '库区及坝址', rock: '角闪石片麻岩', dry: 1795, saturated: 1256 },
  { reservoir: '岗南', location: '库区及坝址', rock: '云母花岗片麻岩', dry: 912, saturated: 524 },
  { reservoir: '岗南', location: '库区及坝址', rock: '大理岩', dry: 832, saturated: 792 },
  { reservoir: '岗南', location: '库区及坝址', rock: '中性岩脉', dry: 2304, saturated: 1233 },
  { reservoir: '岗南', location: '南隧洞', rock: '钙质片麻岩', dry: 761, saturated: 708 },
  { reservoir: '横山岭', location: '输水洞', rock: '古花岗岩', dry: 1900, saturated: 1700 },
  { reservoir: '横山岭', location: '输水洞', rock: '新鲜黑云母花岗片麻岩', dry: 800, saturated: 500 },
  { reservoir: '横山岭', location: '输水洞', rock: '辉绿岩脉', dry: 400, saturated: 300 },
  { reservoir: '王快', location: '', rock: '混合片麻岩', dry: 1639, saturated: 1063 },
  { reservoir: '王快', location: '', rock: '煌斑岩', dry: 1319, saturated: 1254 },
  { reservoir: '王快', location: '', rock: '闪长岩', dry: 1341, saturated: 692 },
  { reservoir: '王快', location: '', rock: '伟晶岩', dry: 1207, saturated: 1113 },
  { reservoir: '临城', location: '', rock: '花岗岩', dry: 1544, saturated: 1285 },
  { reservoir: '黄壁庄', location: '', rock: '半风化千枚岩', dry: 367, saturated: 418 },
  { reservoir: '黄壁庄', location: '', rock: '砂质灰岩', dry: 1914, saturated: 1040 },
  { reservoir: '西大洋', location: '', rock: '花岗片麻岩', dry: 1775, saturated: 950 },
  { reservoir: '西大洋', location: '', rock: '黑云母片麻岩', dry: 746, saturated: 80 },
  { reservoir: '大青沟', location: '', rock: '橄榄玄武岩', dry: 100, saturated: 0 },
  { reservoir: '潘家口', location: '', rock: '角闪石片麻岩', dry: 1257, saturated: null },
  { reservoir: '潘家口', location: '', rock: '角闪斜长片麻岩', dry: 1347.5, saturated: null },
  { reservoir: '洋河', location: '', rock: '微风化花岗岩', dry: 400, saturated: null },
  { reservoir: '朱庄', location: '', rock: '石英砂岩', dry: 1000, saturated: 2000 },
  { reservoir: '朱庄', location: '城下', rock: '新鲜泥质灰岩', dry: 872, saturated: null },
  { reservoir: '朱庄', location: '城下', rock: '新鲜砂质灰岩', dry: 1000, saturated: null },
  { reservoir: '朱庄', location: '右坝肩', rock: '新鲜泥质页岩', dry: 568, saturated: 938 },
  { reservoir: '二龙山', location: '右坝头', rock: '花岗岩及花岗闪长岩', dry: 1000, saturated: 1200 },
  { reservoir: '二龙山', location: '左坝头', rock: '安山岩、安山斑岩', dry: 1200, saturated: 1500 },
  { reservoir: '二龙山', location: '', rock: '完整石英岩', dry: 2220, saturated: 3620 },
];
