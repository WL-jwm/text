/**
 * 地热资源计算 (G-17) — 算法核心
 * 拆分自 geothermalCalculator.ts：储层/井产能/地温梯度/可开采/汇总
 */

import {
  COAL_HEAT_VALUE,
  C_WATER,
  KJ_TO_KWH,
  PRESET_FIELDS,
  RHO_WATER,
  ROCK_PROPERTIES,
} from './geothermalConstants';
import type {
  ExploitableInput,
  ExploitableResult,
  GradientInput,
  GradientResult,
  ReservoirInput,
  ReservoirResult,
  WellProductivityInput,
  WellProductivityResult,
} from './geothermalTypes';
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
