/**
 * 地热资源计算 (G-17) — 类型定义
 * 拆分自 geothermalCalculator.ts：储层/井产能/地温梯度/可开采量/岩性/预设
 */

export interface ReservoirInput {
  /** 地热田名称 */
  name: string;
  /** 热储面积 (km²) */
  area: number;
  /** 热储厚度 — 有效厚度 */
  reservoirThickness: number;
  /** 热储温度 (°C) */
  reservoirTemp: number;
  /** 基准温度/回灌温度 (°C) */
  referenceTemp: number;
  /** 热储孔隙度 (小数) */
  porosity: number;
  /** 岩石类型 */
  rockType: RockType;
}

export type RockType = 'sandstone' | 'limestone' | 'basalt' | 'granite' | 'conglomerate';

export interface ReservoirResult {
  name: string;
  /** 热储体积 (m³) */
  volume: number;
  /** 储存在水中的热量 (kJ) */
  heatInWater: number;
  /** 储存在岩石中的热量 (kJ) */
  heatInRock: number;
  /** 总热储量 (kJ) */
  totalHeatReserve: number;
  /** 总热储量 (×10¹² kJ) */
  totalHeatReservePJ: number;
  /** 折合标煤 (万t) */
  coalEquivalent: number;
  /** 可开采热能（开采系数法，×10¹² kJ） */
  recoverableHeat: number;
  /** 可开采热能折合标煤 (万t) */
  recoverableCoal: number;
  /** 热储体积比热容 (kJ/(m³·°C)) */
  volumetricHeatCapacity: number;
}

export interface WellProductivityInput {
  /** 井名 */
  name: string;
  /** 产量 (m³/d) */
  yield: number;
  /** 井口温度 (°C) */
  wellheadTemp: number;
  /** 回灌温度 (°C) */
  reinjectionTemp: number;
  /** 井深 */
  depth: number;
  /** 井径 */
  wellDiameter: number;
}

export interface WellProductivityResult {
  name: string;
  /** 热功率 */
  thermalPower: number;
  /** 年产热量 (×10⁶ kWh) */
  annualHeat: number;
  /** 年产热量折合标煤 */
  annualCoal: number;
  /** 单位深度热功率 */
  powerPerDepth: number;
  /** 水的焓值 (kJ/m³) */
  enthalpy: number;
  /** 产能等级 */
  productivityGrade: '低产' | '中产' | '高产' | '特高产';
}

export interface GradientInput {
  /** 区域名称 */
  name: string;
  /** 恒温带温度 (°C) */
  constantTempZone: number;
  /** 恒温带深度 */
  constantTempDepth: number;
  /** 测温点1深度 */
  depth1: number;
  /** 测温点1温度 (°C) */
  temp1: number;
  /** 测温点2深度 */
  depth2: number;
  /** 测温点2温度 (°C) */
  temp2: number;
  /** 岩石热导率 (W/(m·K)) */
  thermalConductivity: number;
}

export interface GradientResult {
  name: string;
  /** 地温梯度 (°C/100m) */
  gradient: number;
  /** 大地热流值 (mW/m²) */
  heatFlow: number;
  /** 1000m温度 (°C) */
  tempAt1000m: number;
  /** 2000m温度 (°C) */
  tempAt2000m: number;
  /** 3000m温度 (°C) */
  tempAt3000m: number;
  /** 地温梯度等级 */
  gradientGrade: '正常' | '偏高' | '高地温' | '异常';
}

export interface ExploitableInput {
  /** 地热田名称 */
  name: string;
  /** 总热储量 (×10¹² kJ) */
  totalHeatReserve: number;
  /** 开采系数 (0~1) */
  recoveryFactor: number;
  /** 开采年限 */
  years: number;
  /** 回灌率 (0~1) */
  reinjectionRate: number;
}

export interface ExploitableResult {
  name: string;
  /** 可开采热能 (×10¹² kJ) */
  recoverableHeat: number;
  /** 年可开采热能 (×10¹² kJ/a) */
  annualRecoverable: number;
  /** 年可开采水量（考虑回灌）(万m³/a) */
  annualWater: number;
  /** 年可开采热量折合标煤 (万t/a) */
  annualCoal: number;
  /** 服务年限评价 */
  serviceLife: '短期' | '中期' | '长期';
}

// ============================================================
// 岩性物性与预设字段
// ============================================================
export interface RockProperty {
  type: string;
  density: number;
  specificHeat: number;
  thermalConductivity: number;
  typicalSetting: string;
}

export interface GeothermalFieldPreset {
  name: string;
  location: string;
  area: number;
  reservoirThickness: number;
  reservoirTemp: number;
  referenceTemp: number;
  porosity: number;
  rockType: RockType;
  yield: number;
  wellheadTemp: number;
  gradient: number;
  status: string;
}

// ============================================================
// 回收率参考
// ============================================================
export interface RecoveryFactorRef {
  reservoirType: string;
  range: string;
  recommended: number;
  condition: string;
}
