/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 十九、离子迁移率 (表314, 18°C)
// ───────────────────────────────────────────────────────

export interface IonMobility {
  ion: string;
  mobility: string;  // ×10⁻⁶ cm²/(s·V)
  ionType: string;
}

export const ionMobility: IonMobility[] = [
  { ion: 'H⁺', mobility: '324.2', ionType: '阳离子' },
  { ion: 'K⁺', mobility: '66.5', ionType: '阳离子' },
  { ion: 'Na⁺', mobility: '45.6', ionType: '阳离子' },
  { ion: 'Ca²⁺', mobility: '53.4', ionType: '阳离子' },
  { ion: 'Mg²⁺', mobility: '46.6', ionType: '阳离子' },
  { ion: 'OH⁻', mobility: '180.2', ionType: '阴离子' },
  { ion: 'Cl⁻', mobility: '67.6', ionType: '阴离子' },
  { ion: 'SO₄²⁻', mobility: '70.4', ionType: '阴离子' },
  { ion: 'HCO₃⁻', mobility: '39.4', ionType: '阴离子' },
];

// ───────────────────────────────────────────────────────
// 二十、承德地区水化学特征 (表18)
// ───────────────────────────────────────────────────────

export interface ChengdeHydrochemZone {
  component: string;
  strongErosion: string;   // 强烈侵蚀区(浅部)
  erosionDepositShallow: string; // 侵蚀-堆积区(浅部)
  erosionDepositDeep: string;   // 侵蚀-堆积区(深部)
  unit: string;
}

export const chengdeHydrochemistry: ChengdeHydrochemZone[] = [
  { component: 'Ca²⁺', strongErosion: '24~62', erosionDepositShallow: '24~1000', erosionDepositDeep: '62~17735', unit: 'mg/L' },
  { component: 'Mg²⁺', strongErosion: '4.6~15.67', erosionDepositShallow: '4.3~32', erosionDepositDeep: '27.6~5168', unit: 'mg/L' },
  { component: 'Na⁺', strongErosion: '1.24', erosionDepositShallow: '17.6', erosionDepositDeep: '21.6', unit: 'mg/L' },
  { component: 'SO₄²⁻', strongErosion: '7.5~16.86', erosionDepositShallow: '18~31.26', erosionDepositDeep: '36.5', unit: 'mg/L' },
  { component: '矿化度', strongErosion: '<0.3', erosionDepositShallow: '0.3~0.64', erosionDepositDeep: '0.627~0.869', unit: 'g/L' },
  { component: 'pH', strongErosion: '6~6.5', erosionDepositShallow: '6~7.88', erosionDepositDeep: '7.95', unit: '' },
  { component: '总硬度(德度)', strongErosion: '4.4~9.4', erosionDepositShallow: '10.4~25.38', erosionDepositDeep: '24.77~36.67', unit: '' },
];

