/**
 * 水量均衡计算服务 (G-12) — 均衡算法
 * 拆分自 waterBalance.ts：均衡计算 / 分区补给估算 / 分区排泄估算
 */

import type {
  BalanceItem,
  BalancePeriodConfig,
  BalanceZoneConfig,
} from './waterBalanceTypes';
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
