// ── 统一导出入口 ──
// 数据按域拆分到3个文件，通过此文件统一导出，已有导入路径无需修改

// 域1: 核心水资源数据
export {
  waterResourceSummary2024,
  historicalComparison,
  cityGroundwater2024,
  cityWaterSupply2024,
  groundwaterDynamic2024,
  resourceTimeSeries,
} from './resources-core';

// 域2: 公报详细数据
export {
  cityBulletin2024,
  cityBulletin2022,
  cityGroundwaterDynamic2024,
  soilWaterConservation2024,
  overExploitControl2024,
} from './resources-bulletin';

// 域3: 水文地质数据
export {
  springDatabase,
  hydrogeoZones,
  aquiferParameters,
  deepWaterParameters,
  permeabilityKValues,
  aquiferYieldRates,
  specificYieldInfiltration,
  stratigraphyLayers,
  rockEngineeringGroups,
  weatheringThickness,
  hotSpringData,
  riverLeakageData,
  runoffModulus,
  reservoirEngineeringData,
  citySupplyHydrogeology,
  rockCompressiveStrength,
  irrigationData,
  resistivityMineralization,
} from './resources-hydrogeo';
