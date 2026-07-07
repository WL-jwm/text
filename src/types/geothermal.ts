// ── 地热资源相关类型定义 ──

/** 地热田数据项 */
export interface GeothermalField {
  id: number;
  name: string;
  location: string;
  type: string;
  reservoir: string;
  temperature: string;
  depth: string;
  area: string;
  provenReserves: string;
  utilization: string;
  annualUtilization: string;
  status: string;
}

/** 地热类型分区 */
export interface GeothermalType {
  type: string;
  count: number;
  proportion: string;
  reservoirTemp: string;
  features: string;
  representative: string;
}

/** 地热开发利用 */
export interface GeothermalUtilization {
  use: string;
  scale: string;
  proportion: string;
  description: string;
  efficiency: string;
}

/** 地温梯度 */
export interface GeothermalGradient {
  region: string;
  gradient: string;
  unit: string;
  depth1000m: string;
  depth2000m: string;
  depth3000m: string;
  category: string;
}

/** 地热图表数据项 - 温度柱状图 */
export interface TempBarItem {
  name: string;
  minT: number;
  maxT: number;
}

/** 地热图表数据项 - 面积柱状图 */
export interface AreaBarItem {
  name: string;
  area: number;
  status: string;
}

/** 地热图表数据项 - 梯度深度 */
export interface GradientDepthItem {
  name: string;
  d1000: number;
  d2000: number;
  d3000: number;
}

/** 饼图数据项 */
export interface PieItem {
  name: string;
  value: number;
  color: string;
}

/** 柱状图数据项 */
export interface BarItem {
  name: string;
  value: number;
  color: string;
}

/** 地热回灌数据项 */
export interface GeothermalReinjectionField {
  reinjectionRate: string;
  totalWells: number;
  productionWells: number;
  reinjectionWells: number;
  annualExtraction: string;
  annualReinjection: string;
  pressureRecovery: string;
}
