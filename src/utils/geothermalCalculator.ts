/**
 * B-17 地热资源量评价计算引擎
 *
 * 功能：
 *  1. 热储法储量计算 Q = ρ·c·V·ΔT
 *  2. 可开采量估算（开采年限法/回灌率法）
 *  3. 地热井产能评价（产量/温度/热功率/焓值）
 *  4. 地温梯度与热流值计算
 *  5. 预设地热田数据（河北平原8个主要地热田）
 */

// ═══════════════════════════════════════════════════════
// 物理常数
// ═══════════════════════════════════════════════════════

/** 水的密度 (kg/m³) */
const RHO_WATER = 1000;
/** 水的比热容 (kJ/(kg·°C)) */
const C_WATER = 4.18;
/** 热功换算系数 1 kWh = 3600 kJ */
const KJ_TO_KWH = 1 / 3600;
/** 标煤热值 (kJ/kg) */
const COAL_HEAT_VALUE = 29307;

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════
// 岩石物性参数表
// ═══════════════════════════════════════════════════════

export interface RockProperty {
  type: string;
  density: number;
  specificHeat: number;
  thermalConductivity: number;
  typicalSetting: string;
}

export const ROCK_PROPERTIES: Record<RockType, RockProperty> = {
  sandstone: { type: '砂岩', density: 2650, specificHeat: 0.92, thermalConductivity: 2.5, typicalSetting: '孔隙型热储，华北平原馆陶组/明化镇组' },
  limestone: { type: '灰岩', density: 2700, specificHeat: 0.84, thermalConductivity: 2.8, typicalSetting: '岩溶裂隙型热储，蓟县系雾迷山组' },
  basalt: { type: '玄武岩', density: 2900, specificHeat: 0.88, thermalConductivity: 2.0, typicalSetting: '裂隙型热储，新生代火山岩' },
  granite: { type: '花岗岩', density: 2650, specificHeat: 0.79, thermalConductivity: 3.2, typicalSetting: '裂隙型热储，基底岩体' },
  conglomerate: { type: '砾岩', density: 2600, specificHeat: 0.90, thermalConductivity: 2.3, typicalSetting: '孔隙型热储，冲积扇相' },
};

// ═══════════════════════════════════════════════════════
// 预设地热田数据（河北平原主要地热田）
// ═══════════════════════════════════════════════════════

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

export const PRESET_FIELDS: GeothermalFieldPreset[] = [
  { name: '雄县地热田', location: '保定雄县', area: 320, reservoirThickness: 350, reservoirTemp: 82, referenceTemp: 25, porosity: 0.05, rockType: 'limestone', yield: 2400, wellheadTemp: 78, gradient: 3.8, status: '规模化开发' },
  { name: '牛驼镇地热田', location: '廊坊固安', area: 280, reservoirThickness: 280, reservoirTemp: 75, referenceTemp: 25, porosity: 0.04, rockType: 'limestone', yield: 1800, wellheadTemp: 72, gradient: 3.5, status: '开发利用' },
  { name: '容城地热田', location: '保定容城', area: 195, reservoirThickness: 300, reservoirTemp: 78, referenceTemp: 25, porosity: 0.05, rockType: 'limestone', yield: 2000, wellheadTemp: 75, gradient: 3.6, status: '规模化开发' },
  { name: '河间地热田', location: '沧州河间', area: 350, reservoirThickness: 200, reservoirTemp: 65, referenceTemp: 25, porosity: 0.08, rockType: 'sandstone', yield: 1500, wellheadTemp: 62, gradient: 3.2, status: '开发利用' },
  { name: '辛集地热田', location: '石家庄辛集', area: 220, reservoirThickness: 220, reservoirTemp: 60, referenceTemp: 25, porosity: 0.10, rockType: 'sandstone', yield: 1200, wellheadTemp: 58, gradient: 3.0, status: '勘查阶段' },
  { name: '深州地热田', location: '衡水深州', area: 280, reservoirThickness: 250, reservoirTemp: 68, referenceTemp: 25, porosity: 0.07, rockType: 'sandstone', yield: 1600, wellheadTemp: 65, gradient: 3.3, status: '开发利用' },
  { name: '武清地热田', location: '天津武清(冀域)', area: 180, reservoirThickness: 320, reservoirTemp: 85, referenceTemp: 25, porosity: 0.06, rockType: 'limestone', yield: 2200, wellheadTemp: 80, gradient: 4.0, status: '规模化开发' },
  { name: '冀东地热田', location: '唐山曹妃甸', area: 250, reservoirThickness: 260, reservoirTemp: 72, referenceTemp: 25, porosity: 0.08, rockType: 'sandstone', yield: 1700, wellheadTemp: 68, gradient: 3.4, status: '开发利用' },
];

// ═══════════════════════════════════════════════════════
// 开采系数参考表
// ═══════════════════════════════════════════════════════

export interface RecoveryFactorRef {
  reservoirType: string;
  range: string;
  recommended: number;
  condition: string;
}

export const RECOVERY_FACTOR_TABLE: RecoveryFactorRef[] = [
  { reservoirType: '孔隙型（砂岩）', range: '0.10~0.20', recommended: 0.15, condition: '孔隙发育，渗透性中等' },
  { reservoirType: '裂隙型（灰岩）', range: '0.15~0.25', recommended: 0.20, condition: '裂隙发育，连通性好' },
  { reservoirType: '岩溶型', range: '0.20~0.30', recommended: 0.25, condition: '岩溶发育，储水性强' },
  { reservoirType: '低孔低渗型', range: '0.05~0.10', recommended: 0.08, condition: '致密层，连通性差' },
  { reservoirType: '高回灌率型', range: '0.25~0.40', recommended: 0.30, condition: '回灌率>80%，可持续开发' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 热储法储量计算
 * V = F × M (面积×厚度)
 * Q = [ρw·cw·φ + ρr·cr·(1-φ)] × V × (T - T0)
 * 其中φ为孔隙度，w为水，r为岩石
 */
export function calcReservoirReserve(input: ReservoirInput): ReservoirResult {
  const rock = ROCK_PROPERTIES[input.rockType];
  const volume = input.area * 1e6 * input.reservoirThickness; // km²→m²
  const deltaT = input.reservoirTemp - input.referenceTemp;

  // 体积加权比热容: ρw·cw·φ + ρr·cr·(1-φ)
  const volHeatCap = RHO_WATER * C_WATER * input.porosity +
    rock.density * rock.specificHeat * (1 - input.porosity);

  const heatInWater = RHO_WATER * C_WATER * input.porosity * volume * deltaT;
  const heatInRock = rock.density * rock.specificHeat * (1 - input.porosity) * volume * deltaT;
  const totalHeatReserve = heatInWater + heatInRock;

  // 可开采量（按开采系数0.15保守估计）
  const recoverableHeat = totalHeatReserve * 0.15;

  return {
    name: input.name,
    volume: Math.round(volume),
    heatInWater: Math.round(heatInWater),
    heatInRock: Math.round(heatInRock),
    totalHeatReserve: Math.round(totalHeatReserve),
    totalHeatReservePJ: Math.round(totalHeatReserve / 1e12 * 100) / 100,
    coalEquivalent: Math.round(totalHeatReserve / COAL_HEAT_VALUE / 1e4 * 100) / 100,
    recoverableHeat: Math.round(recoverableHeat / 1e12 * 100) / 100,
    recoverableCoal: Math.round(recoverableHeat / COAL_HEAT_VALUE / 1e4 * 100) / 100,
    volumetricHeatCapacity: Math.round(volHeatCap * 100) / 100,
  };
}

/**
 * 地热井产能评价
 * 热功率 P = Q × ρw × cw × (Tin - Tout) / 86400 (kW)
 * 年产热量 = P × 8760h
 */
export function calcWellProductivity(input: WellProductivityInput): WellProductivityResult {
  const deltaT = input.wellheadTemp - input.reinjectionTemp;
  // P = Q(m³/d) × 1000(kg/m³) × 4.18(kJ/kg·°C) × ΔT / 86400(s/d) → kW
  const thermalPower = input.yield * RHO_WATER * C_WATER * deltaT / 86400;
  const annualHeat = thermalPower * 8760 * KJ_TO_KWH / 1000; // ×10⁶ kWh
  const annualCoal = annualHeat * 3600 / COAL_HEAT_VALUE / 1e4; // 万t
  const powerPerDepth = input.depth > 0 ? thermalPower / input.depth : 0;
  const enthalpy = RHO_WATER * C_WATER * deltaT; // kJ/m³

  let grade: WellProductivityResult['productivityGrade'];
  if (thermalPower < 2000) grade = '低产';
  else if (thermalPower < 5000) grade = '中产';
  else if (thermalPower < 10000) grade = '高产';
  else grade = '特高产';

  return {
    name: input.name,
    thermalPower: Math.round(thermalPower),
    annualHeat: Math.round(annualHeat * 100) / 100,
    annualCoal: Math.round(annualCoal * 100) / 100,
    powerPerDepth: Math.round(powerPerDepth * 100) / 100,
    enthalpy: Math.round(enthalpy),
    productivityGrade: grade,
  };
}

/**
 * 地温梯度与热流值计算
 * 梯度 G = (T2 - T1) / (Z2 - Z1) × 100  (°C/100m)
 * 热流 q = G/100 × λ  (mW/m²)
 */
export function calcGradient(input: GradientInput): GradientResult {
  const deltaT = input.temp2 - input.temp1;
  const deltaZ = input.depth2 - input.depth1;
  const gradient = (deltaT / deltaZ) * 100; // °C/100m
  const heatFlow = (gradient / 100) * input.thermalConductivity * 1000; // mW/m²

  const tempAt1000m = input.constantTempZone + gradient * (1000 - input.constantTempDepth) / 100;
  const tempAt2000m = input.constantTempZone + gradient * (2000 - input.constantTempDepth) / 100;
  const tempAt3000m = input.constantTempZone + gradient * (3000 - input.constantTempDepth) / 100;

  let grade: GradientResult['gradientGrade'];
  if (gradient < 3.0) grade = '正常';
  else if (gradient < 3.5) grade = '偏高';
  else if (gradient < 4.5) grade = '高地温';
  else grade = '异常';

  return {
    name: input.name,
    gradient: Math.round(gradient * 100) / 100,
    heatFlow: Math.round(heatFlow * 10) / 10,
    tempAt1000m: Math.round(tempAt1000m * 10) / 10,
    tempAt2000m: Math.round(tempAt2000m * 10) / 10,
    tempAt3000m: Math.round(tempAt3000m * 10) / 10,
    gradientGrade: grade,
  };
}

/**
 * 可开采量评价
 */
export function calcExploitable(input: ExploitableInput): ExploitableResult {
  const recoverableHeat = input.totalHeatReserve * input.recoveryFactor;
  const annualRecoverable = recoverableHeat / input.years;
  // 考虑回灌，实际可开采水量增加
  const annualWater = annualRecoverable * 1e12 / (RHO_WATER * C_WATER * 50) / 1e4 * (1 + input.reinjectionRate);
  const annualCoal = annualRecoverable * 1e12 / COAL_HEAT_VALUE / 1e4;

  let serviceLife: ExploitableResult['serviceLife'];
  if (input.years < 30) serviceLife = '短期';
  else if (input.years < 100) serviceLife = '中期';
  else serviceLife = '长期';

  return {
    name: input.name,
    recoverableHeat: Math.round(recoverableHeat * 100) / 100,
    annualRecoverable: Math.round(annualRecoverable * 100) / 100,
    annualWater: Math.round(annualWater * 100) / 100,
    annualCoal: Math.round(annualCoal * 100) / 100,
    serviceLife,
  };
}

/**
 * 批量计算预设地热田储量
 */
export function calcAllPresetFields(): ReservoirResult[] {
  return PRESET_FIELDS.map(f => calcReservoirReserve({
    name: f.name,
    area: f.area,
    reservoirThickness: f.reservoirThickness,
    reservoirTemp: f.reservoirTemp,
    referenceTemp: f.referenceTemp,
    porosity: f.porosity,
    rockType: f.rockType,
  }));
}

/**
 * 批量计算预设地热井产能
 */
export function calcAllPresetWells(): WellProductivityResult[] {
  return PRESET_FIELDS.map(f => calcWellProductivity({
    name: f.name,
    yield: f.yield,
    wellheadTemp: f.wellheadTemp,
    reinjectionTemp: 25,
    depth: f.reservoirThickness * 10,
    wellDiameter: 0.2,
  }));
}

/**
 * 汇总统计
 */
export function calcGeothermalSummary() {
  const reserves = calcAllPresetFields();
  const wells = calcAllPresetWells();

  const totalHeat = reserves.reduce((s, r) => s + r.totalHeatReservePJ, 0);
  const totalCoal = reserves.reduce((s, r) => s + r.coalEquivalent, 0);
  const totalRecoverable = reserves.reduce((s, r) => s + r.recoverableHeat, 0);
  const totalPower = wells.reduce((s, w) => s + w.thermalPower, 0);
  const avgTemp = PRESET_FIELDS.reduce((s, f) => s + f.reservoirTemp, 0) / PRESET_FIELDS.length;
  const maxTemp = Math.max(...PRESET_FIELDS.map(f => f.reservoirTemp));

  return {
    fieldCount: PRESET_FIELDS.length,
    totalArea: PRESET_FIELDS.reduce((s, f) => s + f.area, 0),
    totalHeat: Math.round(totalHeat * 100) / 100,
    totalCoal: Math.round(totalCoal * 100) / 100,
    totalRecoverable: Math.round(totalRecoverable * 100) / 100,
    totalPower: Math.round(totalPower),
    avgTemp: Math.round(avgTemp * 10) / 10,
    maxTemp,
  };
}
