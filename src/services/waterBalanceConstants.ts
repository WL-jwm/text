/**
 * 水量均衡计算服务 (G-12) — 标准常量
 * 拆分自 waterBalance.ts：补给/排泄元数据、默认分区参数、默认时段数据
 */

import type {
  BalancePeriodConfig,
  BalanceZoneConfig,
  DischargeCategory,
  RechargeCategory,
} from './waterBalanceTypes';
export const RECHARGE_META: Record<RechargeCategory, { label: string; shortLabel: string; order: number }> = {
  precipitation: { label: '降水入渗补给', shortLabel: '降水入渗', order: 1 },
  lateralInflow: { label: '侧向径流补给', shortLabel: '侧向径流', order: 2 },
  riverLeakage: { label: '河道渗漏补给', shortLabel: '河道渗漏', order: 3 },
  canalLeakage: { label: '渠系渗漏补给', shortLabel: '渠系渗漏', order: 4 },
  irrigationReturn: { label: '田间灌溉入渗', shortLabel: '灌溉入渗', order: 5 },
  leakageRecharge: { label: '越流补给', shortLabel: '越流补给', order: 6 },
  otherRecharge: { label: '其他补给', shortLabel: '其他', order: 7 },
};

/** 排泄项元数据 */
export const DISCHARGE_META: Record<DischargeCategory, { label: string; shortLabel: string; order: number }> = {
  extraction: { label: '人工开采', shortLabel: '人工开采', order: 1 },
  phreaticEvaporation: { label: '潜水蒸发', shortLabel: '潜水蒸发', order: 2 },
  leakageDischarge: { label: '越流排泄(浅→深)', shortLabel: '越流排泄', order: 3 },
  lateralOutflow: { label: '侧向径流排泄', shortLabel: '侧向流出', order: 4 },
  otherDischarge: { label: '其他排泄', shortLabel: '其他', order: 5 },
};

/** 河北平原典型水文地质参数（按城市） */
export const DEFAULT_ZONE_PARAMS: Record<string, Partial<BalanceZoneConfig>> = {
  '秦皇岛': { area: 1919.5, precipCoeff: 0.22, annualPrecipitation: 650, lateralInflowModulus: 3.5, extractionModulus: 8.0, evaporationDepth: 4.0, irrigationReturnRate: 0.15 },
  '唐山': { area: 6604.4, precipCoeff: 0.24, annualPrecipitation: 620, lateralInflowModulus: 4.2, extractionModulus: 9.5, evaporationDepth: 3.5, irrigationReturnRate: 0.18 },
  '廊坊': { area: 6398.0, precipCoeff: 0.20, annualPrecipitation: 550, lateralInflowModulus: 3.0, extractionModulus: 7.5, evaporationDepth: 4.5, irrigationReturnRate: 0.12 },
  '保定': { area: 10994.6, precipCoeff: 0.22, annualPrecipitation: 580, lateralInflowModulus: 4.5, extractionModulus: 10.0, evaporationDepth: 4.0, irrigationReturnRate: 0.16 },
  '石家庄': { area: 6673.0, precipCoeff: 0.25, annualPrecipitation: 550, lateralInflowModulus: 5.0, extractionModulus: 12.0, evaporationDepth: 3.5, irrigationReturnRate: 0.20 },
  '沧州': { area: 12121.0, precipCoeff: 0.18, annualPrecipitation: 520, lateralInflowModulus: 2.0, extractionModulus: 6.5, evaporationDepth: 5.0, irrigationReturnRate: 0.10 },
  '衡水': { area: 8433.0, precipCoeff: 0.19, annualPrecipitation: 510, lateralInflowModulus: 2.5, extractionModulus: 7.0, evaporationDepth: 5.0, irrigationReturnRate: 0.11 },
  '邢台': { area: 8686.9, precipCoeff: 0.21, annualPrecipitation: 530, lateralInflowModulus: 3.0, extractionModulus: 8.5, evaporationDepth: 4.5, irrigationReturnRate: 0.14 },
  '邯郸': { area: 7514.6, precipCoeff: 0.22, annualPrecipitation: 540, lateralInflowModulus: 3.5, extractionModulus: 9.0, evaporationDepth: 4.0, irrigationReturnRate: 0.15 },
  '张家口': { area: 15796.0, precipCoeff: 0.15, annualPrecipitation: 410, lateralInflowModulus: 1.5, extractionModulus: 4.0, evaporationDepth: 6.0, irrigationReturnRate: 0.08 },
  '承德': { area: 19748.0, precipCoeff: 0.16, annualPrecipitation: 510, lateralInflowModulus: 2.0, extractionModulus: 3.5, evaporationDepth: 5.5, irrigationReturnRate: 0.10 },
  '雄安新区': { area: 1770.0, precipCoeff: 0.19, annualPrecipitation: 530, lateralInflowModulus: 2.5, extractionModulus: 6.0, evaporationDepth: 5.0, irrigationReturnRate: 0.10 },
  '定州': { area: 1274.0, precipCoeff: 0.23, annualPrecipitation: 560, lateralInflowModulus: 4.0, extractionModulus: 8.0, evaporationDepth: 4.0, irrigationReturnRate: 0.16 },
  '辛集': { area: 951.0, precipCoeff: 0.24, annualPrecipitation: 540, lateralInflowModulus: 4.0, extractionModulus: 8.5, evaporationDepth: 4.0, irrigationReturnRate: 0.18 },
};

/**
 * 河北平原1991-2000年均值均衡数据（基于河北省水资源公报）
 * 与 src/data/groundwaterResources.ts 中的 plainWaterBalance 一致
 */
export const DEFAULT_PERIOD_1991_2000: BalancePeriodConfig = {
  periodId: '1991-2000',
  periodLabel: '1991-2000年',
  totalRecharge: 112.367,
  totalDischarge: 129.318,
  balance: -16.951,
  storageChange: -16.455,
  note: '年均超采16.95亿m³，以深层承压水开采为主',
  rechargeItems: [
    { id: 'precipitation', label: '降水入渗补给', value: 73.55, percent: 65.45 },
    { id: 'lateralInflow', label: '侧向径流补给', value: 11.46, percent: 10.20 },
    { id: 'riverLeakage', label: '河道渗漏补给', value: 8.44, percent: 7.51 },
    { id: 'canalLeakage', label: '渠系渗漏补给', value: 6.21, percent: 5.53 },
    { id: 'irrigationReturn', label: '田间灌溉入渗', value: 5.12, percent: 4.56 },
    { id: 'leakageRecharge', label: '越流补给', value: 4.36, percent: 3.88 },
    { id: 'otherRecharge', label: '其他补给', value: 3.23, percent: 2.87 },
  ],
  dischargeItems: [
    { id: 'extraction', label: '人工开采', value: 103.40, percent: 79.96 },
    { id: 'phreaticEvaporation', label: '潜水蒸发', value: 12.04, percent: 9.31 },
    { id: 'leakageDischarge', label: '越流排泄(浅→深)', value: 12.36, percent: 9.56 },
    { id: 'lateralOutflow', label: '侧向径流排泄', value: 1.52, percent: 1.17 },
  ],
};

/**
 * 河北平原2001-2010年均衡数据（南水北调通水前）
 * 基于河北省水资源公报趋势估算
 */
export const DEFAULT_PERIOD_2001_2010: BalancePeriodConfig = {
  periodId: '2001-2010',
  periodLabel: '2001-2010年',
  totalRecharge: 106.822,
  totalDischarge: 124.180,
  balance: -17.358,
  storageChange: -16.889,
  note: '超采加剧，年均超采17.36亿m³，深层水开采持续增加',
  rechargeItems: [
    { id: 'precipitation', label: '降水入渗补给', value: 68.20, percent: 63.85 },
    { id: 'lateralInflow', label: '侧向径流补给', value: 10.85, percent: 10.16 },
    { id: 'riverLeakage', label: '河道渗漏补给', value: 7.92, percent: 7.42 },
    { id: 'canalLeakage', label: '渠系渗漏补给', value: 6.85, percent: 6.41 },
    { id: 'irrigationReturn', label: '田间灌溉入渗', value: 4.78, percent: 4.47 },
    { id: 'leakageRecharge', label: '越流补给', value: 5.02, percent: 4.70 },
    { id: 'otherRecharge', label: '其他补给', value: 3.20, percent: 2.99 },
  ],
  dischargeItems: [
    { id: 'extraction', label: '人工开采', value: 100.50, percent: 80.93 },
    { id: 'phreaticEvaporation', label: '潜水蒸发', value: 10.80, percent: 8.70 },
    { id: 'leakageDischarge', label: '越流排泄(浅→深)', value: 10.65, percent: 8.58 },
    { id: 'lateralOutflow', label: '侧向径流排泄', value: 2.23, percent: 1.79 },
  ],
};

/**
 * 河北平原2011-2020年均衡数据（南水北调通水后）
 * 基于河北省水资源公报趋势估算
 */
export const DEFAULT_PERIOD_2011_2020: BalancePeriodConfig = {
  periodId: '2011-2020',
  periodLabel: '2011-2020年',
  totalRecharge: 118.456,
  totalDischarge: 124.750,
  balance: -6.294,
  storageChange: -5.887,
  note: '南水北调通水后超采缓解，年均超采降至6.29亿m³',
  rechargeItems: [
    { id: 'precipitation', label: '降水入渗补给', value: 74.80, percent: 63.15 },
    { id: 'lateralInflow', label: '侧向径流补给', value: 11.20, percent: 9.46 },
    { id: 'riverLeakage', label: '河道渗漏补给', value: 9.05, percent: 7.64 },
    { id: 'canalLeakage', label: '渠系渗漏补给', value: 8.32, percent: 7.02 },
    { id: 'irrigationReturn', label: '田间灌溉入渗', value: 4.85, percent: 4.09 },
    { id: 'leakageRecharge', label: '越流补给', value: 5.62, percent: 4.74 },
    { id: 'otherRecharge', label: '其他补给', value: 4.62, percent: 3.90 },
  ],
  dischargeItems: [
    { id: 'extraction', label: '人工开采', value: 96.80, percent: 77.60 },
    { id: 'phreaticEvaporation', label: '潜水蒸发', value: 11.50, percent: 9.22 },
    { id: 'leakageDischarge', label: '越流排泄(浅→深)', value: 13.20, percent: 10.58 },
    { id: 'lateralOutflow', label: '侧向径流排泄', value: 3.25, percent: 2.60 },
  ],
};

/** 预设时段列表 */
export const DEFAULT_PERIODS: BalancePeriodConfig[] = [
  DEFAULT_PERIOD_1991_2000,
  DEFAULT_PERIOD_2001_2010,
  DEFAULT_PERIOD_2011_2020,
];

// ============ 计算引擎 ============

/**
 * 根据补给/排泄项计算总量、占比、均衡差
 * 纯函数，可测试
 */
