/**
 * 拆分自 resources-hydrogeo.ts
 */

// 河北省水文地质分区（5区30亚区，数据来源：《河北省水文地质工程地质》）
export const hydrogeoZones = [
  { zoneId: 'I', zoneName: '河北平原水文地质区', subZones: [
    { subId: 'I-1', name: '山前冲洪积平原孔隙水亚区', waterType: '孔隙水' },
    { subId: 'I-2', name: '中部湖积冲积平原孔隙水亚区', waterType: '孔隙水' },
    { subId: 'I-3', name: '东部冲积平原孔隙水亚区', waterType: '孔隙水' },
    { subId: 'I-4', name: '滨海海积冲积平原孔隙水亚区', waterType: '孔隙水' },
  ]},
  { zoneId: 'II', zoneName: '太行山山地水文地质区', subZones: [
    { subId: 'II-1', name: '涉县盆地裂隙岩溶水亚区', waterType: '裂隙岩溶水' },
    { subId: 'II-2', name: '井陉盆地裂隙岩溶水亚区', waterType: '裂隙岩溶水' },
    { subId: 'II-3', name: '灵山盆地岩溶水亚区', waterType: '岩溶水' },
    { subId: 'II-4', name: '涞源盆地孔隙水亚区', waterType: '孔隙水' },
    { subId: 'II-5', name: '峰峰-邢台低山丘陵岩溶水亚区', waterType: '岩溶水' },
    { subId: 'II-6', name: '涞源北部中山裂隙岩溶水亚区', waterType: '裂隙岩溶水' },
    { subId: 'II-7', name: '赞皇-路罗中低山裂隙水亚区', waterType: '裂隙水' },
    { subId: 'II-8', name: '阜平-京西中低山裂隙水亚区', waterType: '裂隙水' },
  ]},
  { zoneId: 'III', zoneName: '燕山山地水文地质区', subZones: [
    { subId: 'III-1', name: '张北-围场高原裂隙水亚区', waterType: '裂隙水' },
    { subId: 'III-2', name: '张家口-宣化盆地孔隙水亚区', waterType: '孔隙水' },
    { subId: 'III-3', name: '蔚县-阳原盆地孔隙水亚区', waterType: '孔隙水' },
    { subId: 'III-4', name: '遵化-迁安山间盆地孔隙水亚区', waterType: '孔隙水' },
    { subId: 'III-5', name: '滦河冲洪积平原孔隙水亚区', waterType: '孔隙水' },
    { subId: 'III-6', name: '冀东山前冲洪积平原孔隙水亚区', waterType: '孔隙水' },
  ]},
  { zoneId: 'IV', zoneName: '冀西北山地水文地质区', subZones: [
    { subId: 'IV-1', name: '桑干河洋河河谷平原孔隙水亚区', waterType: '孔隙水' },
    { subId: 'IV-2', name: '冀西北中低山裂隙水亚区', waterType: '裂隙水' },
  ]},
  { zoneId: 'V', zoneName: '平原深层水水文地质区', subZones: [
    { subId: 'V-1', name: '沧州深层水亚区', waterType: '深层承压水' },
    { subId: 'V-2', name: '衡水深层水亚区', waterType: '深层承压水' },
    { subId: 'V-3', name: '邢台深层水亚区', waterType: '深层承压水' },
  ]},
];

// 含水层水文地质参数（数据来源：《河北省水文地质工程地质》）
export const aquiferParameters = [
  { id: 1, area: '怀来盆地-冲洪积扇顶部', lithology: '漂砾、卵石', thickness: '>100', unitYield: '32~98', k: '', source: '怀来盆地' },
  { id: 2, area: '怀来盆地-冲洪积扇中部', lithology: '砂、卵石', thickness: '33', unitYield: '17', k: '', source: '怀来盆地' },
  { id: 3, area: '怀来盆地-冲洪积扇前缘', lithology: '粉砂、砂砾石', thickness: '0~18', unitYield: '3~10', k: '', source: '怀来盆地' },
  { id: 4, area: '怀来盆地-河流冲积平原', lithology: '粉细砂', thickness: '16', unitYield: '<1', k: '', source: '怀来盆地' },
  { id: 5, area: '邯邢-白龙洞径流段', lithology: '中奥陶系灰岩', thickness: '', unitYield: '116.7~217.6', k: '', source: '抽水资料' },
  { id: 6, area: '邯邢-黑龙洞北洛河径流带', lithology: '中奥陶系灰岩', thickness: '', unitYield: '3124.8', k: '', source: '注水试验' },
  { id: 7, area: '邯邢-黑龙洞漳河径流带', lithology: '中奥陶系灰岩', thickness: '', unitYield: '23.2~318.9', k: '', source: '抽水资料' },
  { id: 8, area: '邯邢-康二城径流带', lithology: '中奥陶系灰岩', thickness: '', unitYield: '18.4~19.6', k: '', source: '抽水资料' },
  { id: 9, area: '邢台-白马河百泉径流带', lithology: '寒武-奥陶系灰岩', thickness: '', unitYield: '13.9~6006', k: '', source: '抽水资料' },
  { id: 10, area: '邢台-七里河百泉径流带', lithology: '寒武-奥陶系灰岩', thickness: '', unitYield: '8.1~330', k: '', source: '抽水资料' },
  { id: 11, area: '邢台-沙河百泉径流带', lithology: '寒武-奥陶系灰岩', thickness: '', unitYield: '8.4~67.7', k: '', source: '抽水资料' },
  { id: 12, area: '邢台-北洺河百泉径流带', lithology: '寒武-奥陶系灰岩', thickness: '', unitYield: '5.9~330', k: '', source: '抽水资料' },
  { id: 13, area: '赞皇-路罗片麻岩区', lithology: '片麻岩', thickness: '', unitYield: '0.4~20.8', k: '', source: '钻孔抽水' },
  { id: 14, area: '阜平-京西片麻岩区', lithology: '片麻岩/花岗岩', thickness: '', unitYield: '<1', k: '', source: '钻孔抽水' },
  { id: 15, area: '曲阳-易县雾迷山白云岩', lithology: '震旦亚界白云质灰岩', thickness: '', unitYield: '~9.1(最大)', k: '', source: '钻孔抽水' },
  { id: 16, area: '曲阳-易县寒武系', lithology: '寒武系灰岩', thickness: '', unitYield: '1.6~450', k: '', source: '钻孔抽水' },
  { id: 17, area: '曲阳-易县奥陶系', lithology: '奥陶系灰岩', thickness: '', unitYield: '1.6~40', k: '', source: '钻孔抽水' },
  { id: 18, area: '遵化山间盆地', lithology: '粗砂/砾石', thickness: '20~100', unitYield: '10~50', k: '', depth: '2~5', source: '钻孔抽水' },
  { id: 19, area: '滦县-迁西震旦亚界', lithology: '震旦亚界白云岩', thickness: '', unitYield: '0.1~20.9(最大)', k: '', source: '钻孔抽水' },
  { id: 20, area: '迁安-卢龙宽谷', lithology: '冲洪积砂砾石', thickness: '10~100', unitYield: '8~10', k: '', source: '钻孔抽水' },
  { id: 21, area: '山海关-马兰峪', lithology: '砂砾石/粗砂', thickness: '', unitYield: '10~20', k: '', source: '钻孔抽水' },
  { id: 22, area: '兴隆-平泉震旦亚界', lithology: '震旦亚界雾迷山白云岩', thickness: '', unitYield: '0.1~1.7', k: '', source: '钻孔抽水' },
  { id: 23, area: '张家口-宣化盆地', lithology: '砂砾石', thickness: '20~100', unitYield: '10~50', k: '', depth: '30~2', source: '钻孔抽水' },
  { id: 24, area: '张家口-宣化盆地中部', lithology: '砂砾石', thickness: '40~80', unitYield: '30~100', k: '', depth: '2~5', source: '钻孔抽水' },
  { id: 25, area: '怀来-延庆盆地冲积层', lithology: '砾石/砂', thickness: '25~100', unitYield: '30~100', k: '', depth: '<5', source: '钻孔抽水' },
  { id: 26, area: '怀来-延庆盆地山前', lithology: '冲洪积砂砾石', thickness: '25~100', unitYield: '30~150', k: '', depth: '5~6', source: '钻孔抽水' },
];

// 深层水参数（数据来源：《河北省水文地质工程地质》）
export const deepWaterParameters = [
  { region: '沧州', storageCoeff: '0.364×10⁻²', leakageFactor: '0.177×10⁻⁴', leakMax: 2660, leakMin: 152 },
  { region: '衡水', storageCoeff: '0.428×10⁻²', leakageFactor: '0.189×10⁻⁴', leakMax: 1716, leakMin: 171 },
  { region: '邢台', storageCoeff: '0.277×10⁻²', leakageFactor: '0.134×10⁻⁴', leakMax: 2660, leakMin: 158 },
];
