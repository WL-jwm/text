/**
 * H-04 水均衡计算引擎
 * 支持河北平原地下水均衡计算、多时段对比、按井网城市关联分析
 */

// ============ 数据模型 ============

/** 水均衡补给项分类 */
export type RechargeCategory =
  | 'precipitation'       // 降水入渗补给
  | 'lateralInflow'       // 侧向径流补给
  | 'riverLeakage'        // 河道渗漏补给
  | 'canalLeakage'        // 渠系渗漏补给
  | 'irrigationReturn'    // 田间灌溉入渗
  | 'leakageRecharge'     // 越流补给
  | 'otherRecharge';       // 其他补给

/** 水均衡排泄项分类 */
export type DischargeCategory =
  | 'extraction'          // 人工开采
  | 'phreaticEvaporation' // 潜水蒸发
  | 'leakageDischarge'    // 越流排泄
  | 'lateralOutflow'      // 侧向径流排泄
  | 'otherDischarge';      // 其他排泄

/** 时段标识 */
export type PeriodId = '1991-2000' | '2001-2010' | '2011-2020' | '2021-2030' | string;

/** 均衡项 */
export interface BalanceItem {
  /** 项标识 */
  id: string;
  /** 显示名称 */
  label: string;
  /** 数值（亿m³/a） */
  value: number;
  /** 占比（%） */
  percent: number;
}

/** 均衡计算分区配置 */
export interface BalanceZoneConfig {
  /** 分区名称 */
  name: string;
  /** 面积（km²） */
  area: number;
  /** 降水入渗补给系数 */
  precipCoeff: number;
  /** 年均降水量（mm） */
  annualPrecipitation: number;
  /** 侧向径流补给模数（万m³/a·km²） */
  lateralInflowModulus: number;
  /** 人工开采模数（万m³/a·km²） */
  extractionModulus: number;
  /** 潜水蒸发临界埋深（m） */
  evaporationDepth: number;
  /** 灌溉回归系数 */
  irrigationReturnRate: number;
}

/** 水均衡时段配置 */
export interface BalancePeriodConfig {
  /** 时段标识 */
  periodId: PeriodId;
  /** 时段名称 */
  periodLabel: string;
  /** 补给项列表 */
  rechargeItems: BalanceItem[];
  /** 排泄项列表 */
  dischargeItems: BalanceItem[];
  /** 总补给量（亿m³/a） */
  totalRecharge: number;
  /** 总排泄量（亿m³/a） */
  totalDischarge: number;
  /** 均衡差（+盈余/-亏损，亿m³/a） */
  balance: number;
  /** 储量变化（亿m³/a） */
  storageChange: number;
  /** 备注 */
  note?: string;
}

/** 水均衡计算结果（完整） */
export interface WaterBalanceResult {
  /** 时段 */
  period: BalancePeriodConfig;
  /** 参与计算的城市列表 */
  cities: string[];
  /** 参与计算的井数 */
  wellCount: number;
  /** 是否超采（balance < 0） */
  isOverdrafted: boolean;
  /** 超采强度（万m³/a·km²） */
  overdraftIntensity: number;
  /** 总计算面积（km²） */
  totalArea: number;
  /** 补给项(按占比排序) */
  sortedRecharge: BalanceItem[];
  /** 排泄项(按占比排序) */
  sortedDischarge: BalanceItem[];
}

/** 按城市均衡分析结果 */
export interface CityBalanceResult {
  city: string;
  area: number;
  wellCount: number;
  recharge: number;
  discharge: number;
  balance: number;
  isOverdrafted: boolean;
  overdraftIntensity: number;
  /** 主要超采因素说明 */
  factor?: string;
}

/** 多时段对比结果 */
export interface BalanceComparison {
  periods: BalancePeriodConfig[];
  rechargeTrend: { periodId: PeriodId; label: string; value: number }[];
  dischargeTrend: { periodId: PeriodId; label: string; value: number }[];
  balanceTrend: { periodId: PeriodId; label: string; value: number }[];
  /** 典型时段默认显示 */
  defaultPeriodId: PeriodId;
}

// ============ 预设常量 ============

/** 补给项元数据 */
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
export function calculateBalance(
  rechargeItems: Omit<BalanceItem, 'percent'>[],
  dischargeItems: Omit<BalanceItem, 'percent'>[],
  _area?: number,
): Pick<BalancePeriodConfig, 'rechargeItems' | 'dischargeItems' | 'totalRecharge' | 'totalDischarge' | 'balance'> {
  const totalRecharge = rechargeItems.reduce((sum, item) => sum + item.value, 0);
  const totalDischarge = dischargeItems.reduce((sum, item) => sum + item.value, 0);
  const balance = totalRecharge - totalDischarge;

  const rechargeWithPercent = rechargeItems.map(item => ({
    id: item.id,
    label: item.label,
    value: item.value,
    percent: totalRecharge > 0 ? parseFloat(((item.value / totalRecharge) * 100).toFixed(2)) : 0,
  }));

  const dischargeWithPercent = dischargeItems.map(item => ({
    id: item.id,
    label: item.label,
    value: item.value,
    percent: totalDischarge > 0 ? parseFloat(((item.value / totalDischarge) * 100).toFixed(2)) : 0,
  }));

  return {
    rechargeItems: rechargeWithPercent,
    dischargeItems: dischargeWithPercent,
    totalRecharge: parseFloat(totalRecharge.toFixed(3)),
    totalDischarge: parseFloat(totalDischarge.toFixed(3)),
    balance: parseFloat(balance.toFixed(3)),
  };
}

/**
 * 根据分区参数估算补给量
 * 纯函数，可测试
 */
export function estimateRechargeByZone(
  zone: BalanceZoneConfig,
  precipitation?: number,
): Omit<BalanceItem, 'percent'>[] {
  const precip = precipitation ?? zone.annualPrecipitation;
  const areaKm2 = zone.area;
  // 降水入渗：P * α * A / 100（亿m³）
  const precipRecharge = (precip / 1000) * zone.precipCoeff * areaKm2 / 100;
  // 侧向径流补给：模数 * A / 100
  const lateralInflow = zone.lateralInflowModulus * areaKm2 / 10000;
  // 灌溉回归（以开采量的40%估算）
  const extraction = zone.extractionModulus * areaKm2 / 10000;
  const irrigationReturn = extraction * zone.irrigationReturnRate;

  return [
    { id: 'precipitation', label: '降水入渗补给', value: parseFloat(precipRecharge.toFixed(3)) },
    { id: 'lateralInflow', label: '侧向径流补给', value: parseFloat(lateralInflow.toFixed(3)) },
    { id: 'irrigationReturn', label: '田间灌溉入渗', value: parseFloat(irrigationReturn.toFixed(3)) },
    { id: 'otherRecharge', label: '其他补给', value: 0 },
  ];
}

/**
 * 根据分区参数估算排泄量
 * 纯函数，可测试
 */
export function estimateDischargeByZone(
  zone: BalanceZoneConfig,
): Omit<BalanceItem, 'percent'>[] {
  const areaKm2 = zone.area;
  // 人工开采
  const extraction = zone.extractionModulus * areaKm2 / 10000;
  // 潜水蒸发（简化估算）
  const evaporation = zone.evaporationDepth > 4.0 ? 0 : areaKm2 * 0.5 / 10000;

  return [
    { id: 'extraction', label: '人工开采', value: parseFloat(extraction.toFixed(3)) },
    { id: 'phreaticEvaporation', label: '潜水蒸发', value: parseFloat(evaporation.toFixed(3)) },
    { id: 'otherDischarge', label: '其他排泄', value: 0 },
  ];
}

/**
 * 构建完整 WaterBalanceResult
 * 纯函数，可测试
 */
export function buildWaterBalanceResult(
  period: BalancePeriodConfig,
  cities: string[],
  wellCount: number,
  totalArea: number,
): WaterBalanceResult {
  const isOverdrafted = period.balance < 0;
  const overdraftIntensity = isOverdrafted && totalArea > 0
    ? parseFloat((Math.abs(period.balance) * 10000 / totalArea).toFixed(2))
    : 0;

  return {
    period,
    cities,
    wellCount,
    isOverdrafted,
    overdraftIntensity,
    totalArea,
    sortedRecharge: [...period.rechargeItems].sort((a, b) => b.percent - a.percent),
    sortedDischarge: [...period.dischargeItems].sort((a, b) => b.percent - a.percent),
  };
}

/**
 * 按城市分析均衡（关联 wellNetwork 的城市分布）
 * 纯函数，可测试
 */
export function analyzeCityBalance(
  cityWells: Record<string, number>,
  period: BalancePeriodConfig,
  zoneParams: Record<string, Partial<BalanceZoneConfig>> = DEFAULT_ZONE_PARAMS,
): CityBalanceResult[] {
  const results: CityBalanceResult[] = [];
  const totalRecharge = period.totalRecharge;
  const totalDischarge = period.totalDischarge;
  const totalWells = Object.values(cityWells).reduce((s, n) => s + n, 0);

  // 按井数占比分摊均衡
  for (const [city, wellCount] of Object.entries(cityWells)) {
    const params = zoneParams[city];
    const area = params?.area ?? 0;
    const wellRatio = totalWells > 0 ? wellCount / totalWells : 0;
    const recharge = parseFloat((totalRecharge * wellRatio).toFixed(3));
    const discharge = parseFloat((totalDischarge * wellRatio).toFixed(3));
    const balance = parseFloat((recharge - discharge).toFixed(3));
    const isOverdrafted = balance < 0;
    const overdraftIntensity = isOverdrafted && area > 0
      ? parseFloat((Math.abs(balance) * 10000 / area).toFixed(2))
      : 0;

    // 判断主要超采因素
    let factor: string | undefined;
    if (isOverdrafted) {
      if (params?.extractionModulus && params.extractionModulus > 8) {
        factor = '开采强度高';
      } else if (area > 10000) {
        factor = '补给条件差';
      } else {
        factor = '均衡亏损';
      }
    }

    results.push({
      city,
      area,
      wellCount,
      recharge,
      discharge,
      balance,
      isOverdrafted,
      overdraftIntensity,
      factor,
    });
  }

  return results.sort((a, b) => a.balance - b.balance);
}

/**
 * 构建多时段对比
 * 纯函数，可测试
 */
export function buildBalanceComparison(
  periods: BalancePeriodConfig[],
  defaultPeriodId: PeriodId = '2011-2020',
): BalanceComparison {
  return {
    periods,
    rechargeTrend: periods.map(p => ({ periodId: p.periodId, label: p.periodLabel, value: p.totalRecharge })),
    dischargeTrend: periods.map(p => ({ periodId: p.periodId, label: p.periodLabel, value: p.totalDischarge })),
    balanceTrend: periods.map(p => ({ periodId: p.periodId, label: p.periodLabel, value: p.balance })),
    defaultPeriodId: periods.some(p => p.periodId === defaultPeriodId) ? defaultPeriodId : periods[0]?.periodId ?? '1991-2000',
  };
}

/**
 * 根据井网城市列表获取默认均衡结果
 * 纯函数，可测试
 */
export function getDefaultBalanceResult(
  cityWells: Record<string, number>,
  periodId: PeriodId = '2011-2020',
): WaterBalanceResult {
  const period = DEFAULT_PERIODS.find(p => p.periodId === periodId)
    ?? DEFAULT_PERIODS[DEFAULT_PERIODS.length - 1];
  const cities = Object.keys(cityWells).sort();
  const wellCount = Object.values(cityWells).reduce((s, n) => s + n, 0);
  const totalArea = cities.reduce((sum, city) => {
    const params = DEFAULT_ZONE_PARAMS[city];
    return sum + (params?.area ?? 0);
  }, 0);
  return buildWaterBalanceResult(period, cities, wellCount, totalArea);
}