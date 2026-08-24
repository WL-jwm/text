/**
 * 气候变化影响评估 — 核心算法
 *  降尺度 / 补给估算(3法) / PET / SPI / SPEI
 */

import type { ClimateData, RechargeEstimate, DroughtIndex, ClimateScenario, ClimateProjection } from './climateTypes';

export function downscaleDelta(
  historical: ClimateData[],
  deltaTemp: number,      // 升温幅度 (℃)
  deltaPrecipPercent: number, // 降水变化百分比 (%)
  startYear: number,
  endYear: number,
  scenario: ClimateScenario,
): ClimateProjection {
  const years: number[] = [];
  const precipitation: number[] = [];
  const temperature: number[] = [];
  const pet: number[] = [];
  const recharge: number[] = [];

  // 历史基准期均值
  const histPrecip = historical.reduce((s, d) => s + d.annualPrecip, 0) / historical.length;
  const histTemp = historical.reduce((s, d) => s + d.annualTemp, 0) / historical.length;
  const histPet = historical.reduce((s, d) => s + d.pet, 0) / historical.length;

  // 线性插值升温路径（从0到deltaTemp）
  const totalYears = endYear - startYear + 1;

  for (let i = 0; i < totalYears; i++) {
    const year = startYear + i;
    const fraction = i / Math.max(1, totalYears - 1);

    // 渐变到目标变化量
    const tempAnomaly = deltaTemp * fraction;
    const precipFactor = 1 + (deltaPrecipPercent / 100) * fraction;

    // 添加自然变率（基于历史数据的波动模式）
    const histIdx = i % historical.length;
    const naturalVarP = (historical[histIdx].annualPrecip / histPrecip - 1);
    const naturalVarT = (historical[histIdx].annualTemp - histTemp);

    const projPrecip = histPrecip * precipFactor * (1 + naturalVarP * 0.5);
    const projTemp = histTemp + tempAnomaly + naturalVarT * 0.3;
    const projPet = calcPET(projTemp, projPrecip);

    // 补给量估算
    const rechargeVal = calcRechargeBredenkamp(projPrecip, projPet);

    years.push(year);
    precipitation.push(Number(projPrecip.toFixed(1)));
    temperature.push(Number(projTemp.toFixed(2)));
    pet.push(Number(projPet.toFixed(1)));
    recharge.push(Number(rechargeVal.toFixed(1)));
  }

  // 末期变化量
  const finalPrecip = precipitation[precipitation.length - 1];
  const finalTemp = temperature[temperature.length - 1];
  const finalRecharge = recharge[recharge.length - 1];
  const histRecharge = calcRechargeBredenkamp(histPrecip, histPet);

  const scenarioDescriptions: Record<ClimateScenario, string> = {
    historical: '历史基准期',
    rcp45: 'RCP4.5中等排放（升温约2℃）',
    rcp85: 'RCP8.5高排放（升温约4℃）',
    ssp245: 'SSP2-4.5中等路径（升温约2.5℃）',
    ssp585: 'SSP5-8.5高排放路径（升温约4.5℃）',
  };

  return {
    scenario,
    years,
    precipitation,
    temperature,
    recharge,
    pet,
    deltaPrecip: Number(((finalPrecip / histPrecip - 1) * 100).toFixed(1)),
    deltaTemp: Number((finalTemp - histTemp).toFixed(2)),
    deltaRecharge: Number(((finalRecharge / histRecharge - 1) * 100).toFixed(1)),
    description: scenarioDescriptions[scenario],
  };
}

// ── 2. 补给量预测 ──

/**
 * Bredenkamp补给估算方法
 * R = α × (P - β × PET)
 * 当 P < β × PET 时，R = 0
 *
 * 参数α和β根据含水层类型确定：
 * - 松散岩类: α=0.25, β=0.5
 * - 碳酸盐岩: α=0.15, β=0.4
 * - 结晶岩: α=0.10, β=0.6
 */

export function calcRechargeBredenkamp(precip: number, pet: number, aquiferType: 'loose' | 'carbonate' | 'crystalline' = 'loose'): number {
  const params = {
    loose: { alpha: 0.25, beta: 0.5 },
    carbonate: { alpha: 0.15, beta: 0.4 },
    crystalline: { alpha: 0.10, beta: 0.6 },
  };
  const { alpha, beta } = params[aquiferType];

  const effectivePrecip = precip - beta * pet;
  if (effectivePrecip <= 0) return 0;
  return alpha * effectivePrecip;
}

/**
 * Chaturvedi补给公式（印度经验公式，适用于半干旱区）
 * R = 1.35 × (P - 14)⁰·⁵  (P > 14时)
 */

export function calcRechargeChaturvedi(precip: number): number {
  return precip > 14 ? 1.35 * Math.pow(precip - 14, 0.5) : 0;
}

/**
 * 水分平衡法补给估算
 * R = P - AET ± ΔS
 * AET = PET × (1 + P/PET - (1 + (P/PET)ⁿ)^(1/n))  (Budyko框架)
 */

export function calcRechargeWaterBalance(precip: number, pet: number): RechargeEstimate {
  // Budyko框架计算AET
  const n = 2.0; // Budyko参数
  const ratio = pet > 0 ? precip / pet : 0;
  const aetRatio = ratio > 0
    ? 1 + ratio - Math.pow(1 + Math.pow(ratio, n), 1 / n)
    : 0;
  const aet = Math.min(precip, pet * aetRatio);

  // 假设土壤水分变化ΔS≈0（长期均值）
  const waterSurplus = precip - aet;
  const recharge = Math.max(0, waterSurplus * 0.3); // 30%的水分盈余转化为补给

  return {
    year: 0,
    precipitation: Number(precip.toFixed(1)),
    recharge: Number(recharge.toFixed(1)),
    rechargeRate: precip > 0 ? Number((recharge / precip).toFixed(4)) : 0,
    method: 'Budyko水分平衡法',
    aet: Number(aet.toFixed(1)),
    waterSurplus: Number(waterSurplus.toFixed(1)),
  };
}

// ── 3. 潜在蒸散发计算 ──

/**
 * Thornthwaite法计算PET
 * 基于气温和纬度的经验公式
 */

export function calcPET(temp: number, precip: number): number {
  // 简化的Thornthwaite法
  // PET = 16 × (L/12) × (N/30) × (10T/I)^a
  // 其中I为热指数，a为经验常数

  if (temp <= 0) return Math.max(0, precip * 0.3); // 寒冷地区简化处理

  const I = Math.pow(temp, 1.514);
  const a = 0.4923 + 0.01792 * I - 0.0000771 * I * I + 0.000000675 * I * I * I;

  // 月PET转年PET (简化为年均衡值)
  const monthlyPET = 16 * Math.pow(10 * temp / I, a);
  const annualPET = monthlyPET * 12 * 0.6; // 校正系数

  return Math.max(0, Math.min(annualPET, precip * 2));
}

// ── 4. 干旱指数（SPI/SPEI）──

/**
 * 标准降水指数SPI
 * 将降水序列拟合Gamma分布，再转换为标准正态变量
 *
 * 简化实现：使用经验分位数法
 */

export function calcSPI(precipSeries: number[]): DroughtIndex[] {
  const n = precipSeries.length;
  if (n < 10) return [];

  const mean = precipSeries.reduce((s, v) => s + v, 0) / n;
  const stdDev = Math.sqrt(precipSeries.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1));

  return precipSeries.map((p, idx) => {
    // 简化SPI：标准化降水距平
    const spi = stdDev > 0 ? (p - mean) / stdDev : 0;

    // 偏态校正（Gamma分布偏度修正）
    const skewness = 2 / stdDev * (p - mean) / Math.max(1, stdDev);
    const correctedSpi = spi * (1 + skewness * spi / 6); // Cornish-Fisher展开

    const droughtClass = getDroughtClass(correctedSpi);

    return {
      year: 1961 + idx,
      spi: Number(correctedSpi.toFixed(3)),
      spei: Number(correctedSpi.toFixed(3)), // 简化：SPEI≈SPI（无蒸散数据时）
      droughtClass,
      droughtType: correctedSpi < -1 ? 'meteorological' : 'none',
    };
  });
}

/**
 * 标准降水蒸散指数SPEI
 * SPI的基础上引入蒸散发（水分平衡: P - PET）
 */

export function calcSPEI(
  precipSeries: number[],
  petSeries: number[],
): DroughtIndex[] {
  const n = precipSeries.length;
  if (n < 10) return [];

  // 水分平衡 D = P - PET
  const dSeries = precipSeries.map((p, i) => p - petSeries[i]);
  const mean = dSeries.reduce((s, v) => s + v, 0) / n;
  const stdDev = Math.sqrt(dSeries.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1));

  return dSeries.map((d, idx) => {
    const spei = stdDev > 0 ? (d - mean) / stdDev : 0;

    // 滞后效应：水文干旱滞后气象干旱3-6个月
    const lagFactor = idx > 3
      ? (dSeries.slice(Math.max(0, idx - 3), idx).reduce((s, v) => s + v, 0) / 3 - mean) / stdDev * 0.3
      : 0;
    const adjustedSpei = spei * 0.7 + lagFactor;

    const droughtClass = getDroughtClass(adjustedSpei);

    return {
      year: 1961 + idx,
      spi: Number(spei.toFixed(3)),
      spei: Number(adjustedSpei.toFixed(3)),
      droughtClass,
      droughtType: adjustedSpei < -1.5 ? 'hydrological' : adjustedSpei < -1 ? 'meteorological' : 'none',
    };
  });
}


function getDroughtClass(value: number): DroughtIndex['droughtClass'] {
  if (value >= -0.5) return 'none';
  if (value >= -1.0) return 'mild';
  if (value >= -1.5) return 'moderate';
  if (value >= -2.0) return 'severe';
  return 'extreme';
}

// ── 5. 适应策略库 ──

