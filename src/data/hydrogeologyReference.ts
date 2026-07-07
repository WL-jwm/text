// 经典水文地质参数参考数据
// 数据来源：《河北省水文地质工程地质》（682页，1980年代前数据）
// 整理日期：2026-05-21
// 说明：本文件为历史经典参考值，不反映当前地下水状态

import { springDatabase, hydrogeoZones, aquiferParameters, deepWaterParameters,
  permeabilityKValues, aquiferYieldRates, specificYieldInfiltration,
  stratigraphyLayers, rockEngineeringGroups, weatheringThickness,
  hotSpringData, riverLeakageData, runoffModulus,
  reservoirEngineeringData, citySupplyHydrogeology,
  rockCompressiveStrength, irrigationData, resistivityMineralization
} from './resources';

// Re-export for direct import
export {
  springDatabase, hydrogeoZones, aquiferParameters, deepWaterParameters,
  permeabilityKValues, aquiferYieldRates, specificYieldInfiltration,
  stratigraphyLayers, rockEngineeringGroups, weatheringThickness,
  hotSpringData, riverLeakageData, runoffModulus,
  reservoirEngineeringData, citySupplyHydrogeology,
  rockCompressiveStrength, irrigationData, resistivityMineralization,
};

// ========== 统计汇总 ==========

/** 泉水按地区统计 */
export const springStatsByRegion = [
  { region: '保定', count: 34 },
  { region: '唐山', count: 27 },
  { region: '承德', count: 21 },
  { region: '石家庄', count: 17 },
  { region: '邯邢', count: 14 },
  { region: '张家口', count: 12 },
];

/** 泉水按出露地层统计 (函数形式避免模块级IIFE导致TDZ) */
export function getSpringStatsByGeology(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const sp of springDatabase) {
    const geo = sp.geology.split('、')[0].split('，')[0].trim();
    if (!geo || geo.length < 3) continue;
    result[geo] = (result[geo] || 0) + 1;
  }
  return result;
}

/** 水文地质分区汇总 */
export function getHydrogeoSummary() {
  return {
    totalZones: hydrogeoZones.length,
    totalSubZones: hydrogeoZones.reduce((sum, z) => sum + z.subZones.length, 0),
    zoneNames: hydrogeoZones.map(z => z.zoneName),
  };
}

/** 含水层参数按地区/类型统计 */
export function getAquiferParamSummary() {
  return {
    total: aquiferParameters.length,
  byRegion: Array.from(new Set(aquiferParameters.map(a => {
    const area = a.area.split('-')[0].split('(')[0];
    return area.length > 6 ? area.slice(0, 6) : area;
  }))),
};
}

/** 水库工程统计 */
export function getReservoirSummary() {
  return {
    total: reservoirEngineeringData.length,
    totalCapacity: reservoirEngineeringData.reduce((sum, r) => sum + r.capacity, 0),
    totalCatchArea: reservoirEngineeringData.reduce((sum, r) => sum + r.catchArea, 0),
  };
}

/** 数据来源说明 */
export function getDataSource() {
  return {
    book: '《河北省水文地质工程地质》',
    pages: 682,
    era: '1980年代前',
    note: '本数据为经典水文地质参考值，反映历史基准条件，地下水位、漏斗等动态数据未纳入',
  };
}
