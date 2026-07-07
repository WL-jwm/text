// ── 矿山水文地质类型定义 ──

/** 矿坑水利用数据项 */
export interface MineWaterUtilizationItem {
  mine: string;
  annualDrainage: string;
  utilizationRate: string;
  utilization: string;
  utilizationAmount: string;
  treatmentMethod: string;
}

/** 咸水分布数据项 */
export interface SalineDistributionItem {
  region: string;
  totalArea: number;
  salineArea: number;
  freshRatio: string;
  freshArea: number;
  shallowSaline: number;
  deepSaline: number;
}
