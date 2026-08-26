/**
 * 同位素测年 — 核心算法
 *  氚(3H) / 碳14(14C) / 氦4(4He) / 补给温度与高程
 */

import type { TritiumInput, TritiumResult, Carbon14Input, Carbon14Result, Helium4Input, Helium4Result, RechargeTempInput, RechargeTempResult } from './isotopeTypes';
import { LAMBDA_3H, LAMBDA_14C } from './isotopeConstants';

export function calcTritiumAge(input: TritiumInput): TritiumResult {
  const { measuredTU, initialTU, model } = input;

  let apparentAge: number;
  let modelLabel: string;
  let note: string = '';

  if (model === 'piston') {
    // 活塞流: t = -ln(C/C0) / λ
    const ratio = initialTU > 0 ? measuredTU / initialTU : 0;
    if (ratio <= 0 || ratio > 1) {
      apparentAge = 0;
      note = '³H浓度异常，可能存在现代水混合或测量误差';
    } else {
      apparentAge = -Math.log(ratio) / LAMBDA_3H;
    }
    modelLabel = '活塞流模型 (PFM)';
    note = note ?? `活塞流假设：水分子以活塞流方式运动，无混合。t = -ln(C/C₀)/λ`;
  } else {
    // 指数模型: 平均年龄 = τ
    apparentAge = input.turnoverTime ?? 0;
    modelLabel = '指数模型 (EMM)';
    const ratio = initialTU > 0 ? measuredTU / initialTU : 0;
    note = `指数模型假设完全混合，平均周转时间τ=${apparentAge}a。实测³H=${measuredTU}TU，初始³H=${initialTU}TU，C/C₀=${Math.round(ratio * 1000) / 1000}`;
  }

  const remainingFraction = initialTU > 0 ? (measuredTU / initialTU) * 100 : 0;

  let ageGrade: TritiumResult['ageGrade'];
  if (apparentAge < 10) ageGrade = '现代水(<10a)';
  else if (apparentAge < 50) ageGrade = '次现代水(10~50a)';
  else if (apparentAge < 1000) ageGrade = '老水(50~1000a)';
  else ageGrade = '古水(>1000a)';

  return {
    name: input.name,
    apparentAge: Math.round(apparentAge * 10) / 10,
    model: modelLabel,
    remainingFraction: Math.round(remainingFraction * 10) / 10,
    ageGrade,
    note,
  };
}

/**
 * ¹⁴C年龄校正
 *
 * 未校正: t = -ln(A/A0) / λ
 * δ¹³C校正: 校正初始A0
 * 稀释校正: 扣除碳酸盐稀释
 */

export function calcCarbon14Age(input: Carbon14Input): Carbon14Result {
  const { measuredPMC, initialPMC, delta13C, rechargeDelta13C, dilutionFactor } = input;

  // 未校正年龄
  const rawRatio = initialPMC > 0 ? measuredPMC / initialPMC : 0;
  const rawAge = rawRatio > 0 && rawRatio <= 1 ? -Math.log(rawRatio) / LAMBDA_14C : 0;

  // δ¹³C校正：调整初始A0
  // A0_corrected = A0 × (1 + δ¹³C_recharge) / (1 + δ¹³C_measured)
  // 简化的Pearson校正
  const d13CCorrection = (rechargeDelta13C - delta13C) * 0.5; // 校正因子
  const correctedInitialPMC = initialPMC * (1 + d13CCorrection / 1000);
  const correctedRatio = correctedInitialPMC > 0 ? measuredPMC / correctedInitialPMC : 0;
  const correctedAge = correctedRatio > 0 && correctedRatio <= 1 ? -Math.log(correctedRatio) / LAMBDA_14C : 0;

  // 稀释校正：扣除碳酸盐稀释效应
  // A_true = A_measured / (1 - dilutionFactor)
  const dilutionCorrectedPMC = dilutionFactor < 1 ? measuredPMC / (1 - dilutionFactor) : measuredPMC;
  const dilutionRatio = initialPMC > 0 ? dilutionCorrectedPMC / initialPMC : 0;
  const dilutionCorrectedAge = dilutionRatio > 0 && dilutionRatio <= 1 ? -Math.log(dilutionRatio) / LAMBDA_14C : 0;

  // 推荐年龄：取δ¹³C校正和稀释校正的平均
  const recommendedAge = (correctedAge + dilutionCorrectedAge) / 2;

  let ageGrade: Carbon14Result['ageGrade'];
  if (recommendedAge < 100) ageGrade = '现代碳';
  else if (recommendedAge < 1000) ageGrade = '百年级';
  else if (recommendedAge < 10000) ageGrade = '千年级';
  else ageGrade = '万年级';

  const note = `¹⁴C=${measuredPMC}pmc, A₀=${initialPMC}pmc, δ¹³C=${delta13C}‰。` +
    `δ¹³C校正量=${Math.round(d13CCorrection * 10) / 10}‰, 稀释系数=${Math.round(dilutionFactor * 100)}%。`;

  return {
    name: input.name,
    rawAge: Math.round(rawAge),
    correctedAge: Math.round(correctedAge),
    dilutionCorrectedAge: Math.round(dilutionCorrectedAge),
    recommendedAge: Math.round(recommendedAge),
    ageGrade,
    note,
  };
}

/**
 * ⁴He累积年龄
 * t = (He_measured - He_atmospheric) / accumRate
 */

export function calcHelium4Age(input: Helium4Input): Helium4Result {
  const excessHe4 = input.measuredHe4 - input.atmosphericHe4;
  const estimatedAge = input.accumRate > 0 ? excessHe4 / input.accumRate : 0;

  let ageGrade: Helium4Result['ageGrade'];
  if (estimatedAge < 100) ageGrade = '现代水';
  else if (estimatedAge < 1000) ageGrade = '百年-千年';
  else if (estimatedAge < 10000) ageGrade = '千年-万年';
  else ageGrade = '万年以上';

  const note = `⁴He过量=${excessHe4.toExponential(3)} cm³STP/kg, 累积速率=${input.accumRate.toExponential(3)} cm³STP/(kg·a)。` +
    `⁴He随含水层中U/Th衰变持续累积，是估算老水年龄的有效指标。`;

  return {
    name: input.name,
    excessHe4: excessHe4,
    estimatedAge: Math.round(estimatedAge),
    ageGrade,
    note,
  };
}

/**
 * 补给温度/高程估算
 * 利用δ¹⁸O与温度、高程的经验关系
 */

export function calcRechargeTemp(input: RechargeTempInput): RechargeTempResult {
  const { delta18O, deltaD, lmwlSlope, lmwlIntercept, d18OTempSlope, elevationGradient, referenceElevation, referenceDelta18O } = input;

  // 氘盈余
  const dExcess = deltaD - 8 * delta18O;

  // 补给温度估算（基于δ¹⁸O-温度关系）
  // 假设参考温度对应的δ¹⁸O为参考值
  // ΔT = (δ¹⁸O_measured - δ¹⁸O_ref) / slope
  const delta18ODiff = delta18O - referenceDelta18O;
  const tempDiff = d18OTempSlope !== 0 ? delta18ODiff / d18OTempSlope : 0;
  // 参考温度假设为当地年均温12°C
  const referenceTemp = 12;
  const rechargeTemp = referenceTemp + tempDiff;

  // 补给高程估算
  // Δh = (δ¹⁸O_measured - δ¹⁸O_ref) / gradient × 100
  const elevationDiff = elevationGradient !== 0 ? (delta18ODiff / elevationGradient) * 100 : 0;
  const rechargeElevation = referenceElevation + elevationDiff;

  // 蒸发影响判断
  let evaporationEffect: string;
  if (dExcess > 12) {
    evaporationEffect = '低蒸发（d-excess>12‰），快速入渗补给';
  } else if (dExcess > 8) {
    evaporationEffect = '中等蒸发（8~12‰），经历一定蒸发';
  } else {
    evaporationEffect = '高蒸发（d-excess<8‰），受蒸发影响显著';
  }

  // 水岩交换判断
  let waterRockInteraction: string;
  if (delta18O > -6) {
    waterRockInteraction = 'δ¹⁸O偏正，可能存在水岩交换（高温地热水或长期滞留）';
  } else if (delta18O < -11) {
    waterRockInteraction = 'δ¹⁸O偏负，高海拔或寒冷气候补给';
  } else {
    waterRockInteraction = 'δ¹⁸O正常范围，以大气降水补给为主';
  }

  // LMWL偏离
  const lmwlPredictedD = lmwlSlope * delta18O + lmwlIntercept;
  const lmwlDeviation = deltaD - lmwlPredictedD;
  const note = `δ¹⁸O=${delta18O}‰, δ²H=${deltaD}‰, d-excess=${Math.round(dExcess * 10) / 10}‰。` +
    `LMWL偏离=${Math.round(lmwlDeviation * 10) / 10}‰。` +
    `${evaporationEffect}。`;

  return {
    name: input.name,
    rechargeTemp: Math.round(rechargeTemp * 10) / 10,
    rechargeElevation: Math.round(rechargeElevation),
    dExcess: Math.round(dExcess * 10) / 10,
    evaporationEffect,
    waterRockInteraction,
    note,
  };
}

/**
 * 批量计算预设监测点
 */
