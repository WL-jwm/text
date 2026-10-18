/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 十四、电性层与矿化度对应关系 (表305)
// ───────────────────────────────────────────────────────

export interface ResistivitySalinity {
  resistivityRange: string;  // 欧姆·m
  salinityRange: string;     // g/L
  waterType: string;
}

export const resistivitySalinityRelation: ResistivitySalinity[] = [
  { resistivityRange: '>20', salinityRange: '<1.2', waterType: '淡水' },
  { resistivityRange: '14~20', salinityRange: '1.2~2', waterType: '微咸水' },
  { resistivityRange: '11~14', salinityRange: '2~3', waterType: '半咸水' },
  { resistivityRange: '8~11', salinityRange: '3~5', waterType: '咸水' },
  { resistivityRange: '<8', salinityRange: '>5', waterType: '高矿化咸水' },
];

// ───────────────────────────────────────────────────────
// 十五、岩性电阻率参数 (表308, 钓鱼台水库)
// ───────────────────────────────────────────────────────

export interface LithologyResistivity {
  lithology: string;
  resistivity: string;  // 欧姆·m
  note: string;
}

export const lithologyResistivity: LithologyResistivity[] = [
  { lithology: '粉砂', resistivity: '100~300', note: '' },
  { lithology: '亚砂土', resistivity: '60~100', note: '' },
  { lithology: '亚粘土', resistivity: '30~40', note: '' },
  { lithology: '粘土', resistivity: '10~20', note: '' },
  { lithology: '风化花岗岩', resistivity: '60~80', note: '' },
  { lithology: '新鲜花岗岩', resistivity: '500~2000', note: '' },
  { lithology: '风化花岗片麻岩', resistivity: '55~150', note: '' },
  { lithology: '新鲜花岗片麻岩', resistivity: '400~600', note: '' },
];

// ───────────────────────────────────────────────────────
// 十六、河北平原油性电阻率分区 (表313)
// ───────────────────────────────────────────────────────

export interface PlainResistivityZone {
  hydroZone: string;
  sand: string;      // 砂层 欧姆·m
  siltySand: string;  // 亚砂土
  siltyClay: string;  // 亚粘土
  clay: string;       // 粘土
}

export const plainResistivityZones: PlainResistivityZone[] = [
  { hydroZone: '山前平原', sand: '10~120', siltySand: '6~30', siltyClay: '8~24', clay: '2.5~16' },
  { hydroZone: '中部平原', sand: '17~60', siltySand: '9~28', siltyClay: '5~18', clay: '4~12' },
  { hydroZone: '滨海平原', sand: '7~30', siltySand: '5~16', siltyClay: '4~12', clay: '8~10' },
];

