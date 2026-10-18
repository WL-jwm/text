/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 十二、水库工程地质数据
// ───────────────────────────────────────────────────────

export interface ReservoirGeology {
  name: string;
  location: string;
  damType: string;
  foundationRock: string;
}

export const reservoirGeology: ReservoirGeology[] = [
  { name: '岗南水库', location: '平山/滹沱河', damType: '土坝', foundationRock: '片麻岩' },
  { name: '黄壁庄水库', location: '平山/滹沱河', damType: '土坝', foundationRock: '千枚岩' },
  { name: '王快水库', location: '曲阳/沙河', damType: '土坝', foundationRock: '片麻岩/千枚岩' },
  { name: '岳城水库', location: '磁县/漳河', damType: '土坝', foundationRock: '粉细砂' },
  { name: '潘家口水库', location: '迁西/滦河', damType: '混凝土坝', foundationRock: '片麻岩' },
  { name: '大黑汀水库', location: '迁西/滦河', damType: '-', foundationRock: '片麻岩' },
];

// ───────────────────────────────────────────────────────
// 十三、岩石力学参数 (抗压强度, kg/cm²)
// ───────────────────────────────────────────────────────

export interface RockMechanics {
  location: string;
  rockName: string;
  compressiveDry: string;     // 干燥抗压
  compressiveSaturated: string; // 饱和抗压
}

export const rockMechanics: RockMechanics[] = [
  { location: '岗南水库', rockName: '均质花岗片麻岩', compressiveDry: '1589', compressiveSaturated: '-' },
  { location: '岗南水库', rockName: '含铁花岗片麻岩', compressiveDry: '1747', compressiveSaturated: '-' },
  { location: '岗南水库', rockName: '角闪石片麻岩', compressiveDry: '1795', compressiveSaturated: '1256' },
  { location: '岗南水库', rockName: '大理岩', compressiveDry: '832', compressiveSaturated: '792' },
  { location: '岗南水库', rockName: '中性岩脉', compressiveDry: '2304', compressiveSaturated: '1233' },
  { location: '王快水库', rockName: '伟晶岩', compressiveDry: '1207', compressiveSaturated: '1113' },
  { location: '子桥水库', rockName: '花岗岩', compressiveDry: '1165', compressiveSaturated: '1045' },
  { location: '黄壁庄水库', rockName: '新鲜千枚岩', compressiveDry: '1177~1914', compressiveSaturated: '1040' },
];

