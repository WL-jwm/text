/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 十七、地层柱状简表
// ───────────────────────────────────────────────────────

export interface StratigraphyUnit {
  era: string;
  system: string;
  series: string;
  group: string;
  thickness: string;   // m
  mainLithology: string;
  aquiferNote: string;
}

export const historicalStratigraphy: StratigraphyUnit[] = [
  { era: '新生界', system: '第四系', series: '', group: '', thickness: '数十~数百', mainLithology: '砂砾石、砂、粘性土', aquiferNote: '主要孔隙含水层' },
  { era: '新生界', system: '第三系', series: '上新统', group: '', thickness: '', mainLithology: '玄武岩、砂砾岩', aquiferNote: '深层孔隙水' },
  { era: '中生界', system: '侏罗系', series: '上统', group: '九龙山组', thickness: '89~1382', mainLithology: '杂色页岩、砂岩、砾岩', aquiferNote: '裂隙水,水量小' },
  { era: '中生界', system: '侏罗系', series: '下统', group: '门头沟组', thickness: '194~716', mainLithology: '砾岩、砂岩、页岩夹煤层', aquiferNote: '裂隙水' },
  { era: '上古生界', system: '二叠系', series: '上统', group: '上石盒子组', thickness: '', mainLithology: '红色砂岩、杂色粘土页岩', aquiferNote: '裂隙水,弱含水' },
  { era: '上古生界', system: '二叠系', series: '下统', group: '山西组', thickness: '40', mainLithology: '黑色页岩夹煤层', aquiferNote: '裂隙水,弱含水' },
  { era: '上古生界', system: '石炭系', series: '上统', group: '太原群', thickness: '120~130', mainLithology: '砂岩、页岩夹煤层', aquiferNote: '裂隙水,弱含水' },
  { era: '上古生界', system: '石炭系', series: '下统', group: '本溪群', thickness: '20~85', mainLithology: '页岩、灰岩夹煤层', aquiferNote: '裂隙水' },
  { era: '上古生界', system: '奥陶系', series: '中统', group: '马家沟组', thickness: '354~654', mainLithology: '深灰色石灰岩', aquiferNote: '主要岩溶含水层' },
  { era: '上古生界', system: '奥陶系', series: '下统', group: '冶里组', thickness: '65~154', mainLithology: '白云岩和粘土质白云岩', aquiferNote: '岩溶裂隙含水' },
  { era: '上古生界', system: '寒武系', series: '中统', group: '张夏组', thickness: '160~223', mainLithology: '鲕状灰岩、灰岩', aquiferNote: '岩溶含水层' },
  { era: '上古生界', system: '寒武系', series: '下统', group: '馒头组', thickness: '40~56', mainLithology: '粗砂岩、砾岩、页岩', aquiferNote: '弱含水' },
  { era: '上元古界', system: '震旦亚界', series: '中统', group: '雾迷山组', thickness: '最厚', mainLithology: '白云岩', aquiferNote: '主要含水层' },
  { era: '上元古界', system: '震旦亚界', series: '下统', group: '高于庄组', thickness: '', mainLithology: '白云质灰岩', aquiferNote: '岩溶裂隙含水' },
  { era: '上元古界', system: '震旦亚界', series: '下统', group: '大红峪组', thickness: '', mainLithology: '石英砂岩', aquiferNote: '裂隙含水' },
  { era: '下元古界', system: '', series: '', group: '甘陶河群', thickness: '366~3000', mainLithology: '砂岩、板岩、安山岩', aquiferNote: '裂隙水' },
  { era: '太古界', system: '', series: '', group: '阜平群', thickness: '', mainLithology: '片岩、片麻岩夹大理岩', aquiferNote: '风化裂隙水' },
];

