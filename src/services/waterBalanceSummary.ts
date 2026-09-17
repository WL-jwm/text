/**
 * 水量均衡计算服务 (G-12) — 汇总与对比
 * 拆分自 waterBalance.ts：结果构建 / 城市均衡分析 / 时段对比 / 默认结果
 */

import { DEFAULT_PERIODS, DEFAULT_ZONE_PARAMS } from './waterBalanceConstants';
import type {
  BalanceComparison,
  BalancePeriodConfig,
  BalanceZoneConfig,
  CityBalanceResult,
  PeriodId,
  WaterBalanceResult,
} from './waterBalanceTypes';
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
