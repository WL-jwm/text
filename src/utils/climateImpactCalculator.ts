/**
 * B-37 气候变化对地下水影响评估器 — 计算引擎
 *
 * 核心算法：
 *  1. GCM降尺度 — Delta方法+统计降尺度，CMIP5/CMIP6情景
 *  2. 补给量预测 — 降水-补给经验公式(Bredenkamp/Chaturvedi)
 *  3. 干旱指数分析 — SPI/SPEI计算+干旱传导滞后
 *  4. 适应策略库 — 不同情景下的适应性管理建议
 */

// ── 类型定义 ──

export type ClimateScenario = 'historical' | 'rcp45' | 'rcp85' | 'ssp245' | 'ssp585';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ClimateData {
  year: number;
  annualPrecip: number;   // 年降水量 (mm)
  annualTemp: number;     // 年均气温 (℃)
  seasonalPrecip: Record<Season, number>;
  seasonalTemp: Record<Season, number>;
  pet: number;            // 潜在蒸散发 (mm)
}

export interface RechargeEstimate {
  year: number;
  precipitation: number;
  recharge: number;       // 补给量 (mm)
  rechargeRate: number;   // 补给系数 (补给/降水)
  method: string;
  aet: number;            // 实际蒸散发 (mm)
  waterSurplus: number;   // 水分盈余 (mm)
}

export interface DroughtIndex {
  year: number;
  spi: number;            // 标准降水指数
  spei: number;           // 标准降水蒸散指数
  droughtClass: 'none' | 'mild' | 'moderate' | 'severe' | 'extreme';
  droughtType: 'meteorological' | 'hydrological' | 'none';
}

export interface ClimateProjection {
  scenario: ClimateScenario;
  years: number[];
  precipitation: number[];
  temperature: number[];
  recharge: number[];
  pet: number[];
  deltaPrecip: number;    // 相对历史期变化 (%)
  deltaTemp: number;      // 相对历史期升温 (℃)
  deltaRecharge: number;  // 补给量变化 (%)
  description: string;
}

export interface AdaptationStrategy {
  id: string;
  category: 'supply' | 'demand' | 'ecology' | 'monitoring' | 'governance';
  name: string;
  description: string;
  applicableScenario: ClimateScenario[];
  priority: 'high' | 'medium' | 'low';
  implementationTime: 'short' | 'medium' | 'long';
  cost: 'low' | 'medium' | 'high';
  expectedBenefit: string;
}

export interface ComprehensiveClimateResult {
  historical: ClimateData[];
  projections: ClimateProjection[];
  rechargeHistory: RechargeEstimate[];
  droughtIndices: DroughtIndex[];
  strategies: AdaptationStrategy[];
  keyFindings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}

// ── 1. GCM降尺度（Delta方法）──

/**
 * Delta方法降尺度
 * 将GCM网格的气候变化信号(Delta)叠加到历史观测数据上
 *
 * 未来降水 = 历史降水 × (1 + ΔP%)
 * 未来气温 = 历史气温 + ΔT
 */
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

export const ADAPTATION_STRATEGIES: AdaptationStrategy[] = [
  {
    id: 'AS01',
    category: 'supply',
    name: '多水源联合调配',
    description: '地表水-地下水-外调水-再生水联合调度，降低单一水源依赖',
    applicableScenario: ['rcp45', 'rcp85', 'ssp245', 'ssp585'],
    priority: 'high',
    implementationTime: 'medium',
    cost: 'high',
    expectedBenefit: '供水保障率提升15-25%，地下水开采量减少20%',
  },
  {
    id: 'AS02',
    category: 'supply',
    name: '人工补给( MAR)',
    description: '利用雨洪水和再生水进行地下水人工补给，恢复超采区水位',
    applicableScenario: ['rcp45', 'rcp85', 'ssp245', 'ssp585'],
    priority: 'high',
    implementationTime: 'medium',
    cost: 'medium',
    expectedBenefit: '年补给量增加500-2000万m³，水位回升0.5-2m/a',
  },
  {
    id: 'AS03',
    category: 'demand',
    name: '节水型社会建设',
    description: '农业高效节水灌溉+工业循环利用+生活节水器具推广',
    applicableScenario: ['rcp45', 'rcp85', 'ssp245', 'ssp585'],
    priority: 'high',
    implementationTime: 'short',
    cost: 'low',
    expectedBenefit: '用水总量降低15-30%，灌溉水利用系数提升至0.7+',
  },
  {
    id: 'AS04',
    category: 'demand',
    name: '种植结构调整',
    description: '推广耐旱作物品种，减少高耗水作物种植面积',
    applicableScenario: ['rcp85', 'ssp585'],
    priority: 'medium',
    implementationTime: 'short',
    cost: 'low',
    expectedBenefit: '农业用水减少10-20%，抗旱能力增强',
  },
  {
    id: 'AS05',
    category: 'ecology',
    name: '生态补水保障',
    description: '保障河流基流和湿地生态需水，维护地下水依赖生态系统',
    applicableScenario: ['rcp45', 'rcp85', 'ssp245', 'ssp585'],
    priority: 'high',
    implementationTime: 'medium',
    cost: 'medium',
    expectedBenefit: '生态基流保证率达90%，GDE面积稳定或恢复',
  },
  {
    id: 'AS06',
    category: 'ecology',
    name: '河岸带恢复',
    description: '恢复河岸带植被缓冲区，增强自然补给和净化功能',
    applicableScenario: ['rcp45', 'ssp245'],
    priority: 'medium',
    implementationTime: 'long',
    cost: 'medium',
    expectedBenefit: '河岸带补给量增加5-15%，水质净化能力提升',
  },
  {
    id: 'AS07',
    category: 'monitoring',
    name: '气候-地下水耦合监测网',
    description: '建设气候变化与地下水响应的长期监测预警网络',
    applicableScenario: ['rcp45', 'rcp85', 'ssp245', 'ssp585'],
    priority: 'high',
    implementationTime: 'short',
    cost: 'low',
    expectedBenefit: '预警提前量3-6个月，决策响应速度提升50%',
  },
  {
    id: 'AS08',
    category: 'monitoring',
    name: '干旱风险预警系统',
    description: '基于SPI/SPEI的干旱监测预警+地下水响应模型',
    applicableScenario: ['rcp85', 'ssp585'],
    priority: 'high',
    implementationTime: 'short',
    cost: 'low',
    expectedBenefit: '干旱响应时间缩短50%，应急供水效率提升',
  },
  {
    id: 'AS09',
    category: 'governance',
    name: '动态水权分配',
    description: '根据气候预测和水资源状况动态调整取水许可',
    applicableScenario: ['rcp45', 'rcp85', 'ssp245', 'ssp585'],
    priority: 'medium',
    implementationTime: 'medium',
    cost: 'low',
    expectedBenefit: '水资源配置效率提升20%，超采控制力度增强',
  },
  {
    id: 'AS10',
    category: 'governance',
    name: '地下水-地表水联合管理',
    description: '统一规划管理地表水和地下水资源，实施联合调度',
    applicableScenario: ['rcp45', 'rcp85', 'ssp245', 'ssp585'],
    priority: 'high',
    implementationTime: 'long',
    cost: 'medium',
    expectedBenefit: '水资源利用效率提升15-25%，系统抗风险能力增强',
  },
];

// ── 6. 综合评估 ──

export function calcComprehensiveClimate(
  historical: ClimateData[],
  projections: ClimateProjection[],
  droughtIndices: DroughtIndex[],
): ComprehensiveClimateResult {
  // 补给量历史序列
  const rechargeHistory = historical.map(d => ({
    year: d.year,
    precipitation: d.annualPrecip,
    recharge: calcRechargeBredenkamp(d.annualPrecip, d.pet),
    rechargeRate: d.annualPrecip > 0
      ? Number((calcRechargeBredenkamp(d.annualPrecip, d.pet) / d.annualPrecip).toFixed(4))
      : 0,
    method: 'Bredenkamp法',
    aet: Number((d.pet * 0.6).toFixed(1)),
    waterSurplus: Number((d.annualPrecip - d.pet * 0.6).toFixed(1)),
  }));

  // 关键发现
  const keyFindings: string[] = [];

  // 历史趋势
  const histPrecipTrend = (historical[historical.length - 1].annualPrecip - historical[0].annualPrecip) / historical.length;
  const histTempTrend = (historical[historical.length - 1].annualTemp - historical[0].annualTemp) / historical.length;
  keyFindings.push(`历史期(1961-2024)年均降水变化趋势: ${histPrecipTrend > 0 ? '+' : ''}${histPrecipTrend.toFixed(1)} mm/10a`);
  keyFindings.push(`历史期年均气温变化趋势: ${histTempTrend > 0 ? '+' : ''}${histTempTrend.toFixed(2)} ℃/10a`);

  // 未来变化
  for (const proj of projections) {
    if (proj.scenario === 'historical') continue;
    keyFindings.push(`${proj.description}: 降水变化${proj.deltaPrecip > 0 ? '+' : ''}${proj.deltaPrecip}%，升温${proj.deltaTemp}℃，补给量变化${proj.deltaRecharge > 0 ? '+' : ''}${proj.deltaRecharge}%`);
  }

  // 干旱分析
  const droughtYears = droughtIndices.filter(d => d.droughtClass !== 'none');
  const severeDroughts = droughtIndices.filter(d => d.droughtClass === 'severe' || d.droughtClass === 'extreme');
  keyFindings.push(`历史期共发生干旱${droughtYears.length}年，其中严重/极端干旱${severeDroughts.length}年`);

  // 风险等级
  const worstCase = projections.find(p => p.scenario === 'ssp585' || p.scenario === 'rcp85');
  let riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  if (worstCase) {
    const rechargeLoss = Math.abs(Math.min(0, worstCase.deltaRecharge));
    if (rechargeLoss > 30 || worstCase.deltaTemp > 4) riskLevel = 'very-high';
    else if (rechargeLoss > 15 || worstCase.deltaTemp > 2.5) riskLevel = 'high';
    else if (rechargeLoss > 5) riskLevel = 'medium';
    else riskLevel = 'low';
  } else {
    riskLevel = 'medium';
  }

  return {
    historical,
    projections,
    rechargeHistory,
    droughtIndices,
    strategies: ADAPTATION_STRATEGIES,
    keyFindings,
    riskLevel,
  };
}

// ── 预设数据 ──

/** 生成河北省1961-2024年气候数据 */
export function generateHistoricalClimate(): ClimateData[] {
  const data: ClimateData[] = [];
  const basePrecip = 500;
  const baseTemp = 12.5;
  const precipTrend = -0.5; // mm/a 降水略减
  const tempTrend = 0.025;  // ℃/a 升温

  for (let year = 1961; year <= 2024; year++) {
    const idx = year - 1961;
    // 自然变率（多频率叠加）
    const var1 = Math.sin(idx * 0.15) * 60;  // ~42年周期
    const var2 = Math.sin(idx * 0.5) * 40;   // ~12年周期
    const var3 = Math.sin(idx * 2.3 + 1.5) * 25; // ~3年周期
    const noise = (Math.sin(idx * 7.7) + Math.cos(idx * 3.3)) * 15;

    const annualPrecip = Math.max(200, basePrecip + precipTrend * idx + var1 + var2 + var3 + noise);
    const annualTemp = baseTemp + tempTrend * idx + Math.sin(idx * 0.3) * 0.3 + Math.sin(idx * 5.1) * 0.2;

    const pet = calcPET(annualTemp, annualPrecip);

    // 季节分配
    const seasonalPrecip: Record<Season, number> = {
      spring: annualPrecip * 0.12 + Math.sin(idx * 2) * 10,
      summer: annualPrecip * 0.65 + Math.sin(idx * 1.5) * 30,
      autumn: annualPrecip * 0.17 + Math.sin(idx * 3) * 8,
      winter: annualPrecip * 0.06 + Math.sin(idx * 4) * 3,
    };
    const seasonalTemp: Record<Season, number> = {
      spring: annualTemp + 8,
      summer: annualTemp + 15,
      autumn: annualTemp + 3,
      winter: annualTemp - 12,
    };

    data.push({
      year,
      annualPrecip: Number(annualPrecip.toFixed(1)),
      annualTemp: Number(annualTemp.toFixed(2)),
      seasonalPrecip: {
        spring: Number(seasonalPrecip.spring.toFixed(1)),
        summer: Number(seasonalPrecip.summer.toFixed(1)),
        autumn: Number(seasonalPrecip.autumn.toFixed(1)),
        winter: Number(seasonalPrecip.winter.toFixed(1)),
      },
      seasonalTemp: {
        spring: Number(seasonalTemp.spring.toFixed(2)),
        summer: Number(seasonalTemp.summer.toFixed(2)),
        autumn: Number(seasonalTemp.autumn.toFixed(2)),
        winter: Number(seasonalTemp.winter.toFixed(2)),
      },
      pet: Number(pet.toFixed(1)),
    });
  }

  return data;
}

export const SCENARIO_PARAMS: Record<ClimateScenario, { deltaTemp: number; deltaPrecip: number; label: string; color: string }> = {
  historical: { deltaTemp: 0, deltaPrecip: 0, label: '历史基准', color: '#64748b' },
  rcp45: { deltaTemp: 2.0, deltaPrecip: 5, label: 'RCP4.5', color: '#06b6d4' },
  rcp85: { deltaTemp: 4.0, deltaPrecip: -10, label: 'RCP8.5', color: '#ef4444' },
  ssp245: { deltaTemp: 2.5, deltaPrecip: 3, label: 'SSP2-4.5', color: '#f59e0b' },
  ssp585: { deltaTemp: 4.5, deltaPrecip: -15, label: 'SSP5-8.5', color: '#dc2626' },
};

export const DROUGHT_CLASS_LABELS: Record<DroughtIndex['droughtClass'], string> = {
  none: '无干旱',
  mild: '轻微干旱',
  moderate: '中等干旱',
  severe: '严重干旱',
  extreme: '极端干旱',
};

export const DROUGHT_CLASS_COLORS: Record<DroughtIndex['droughtClass'], string> = {
  none: '#10b981',
  mild: '#fbbf24',
  moderate: '#f59e0b',
  severe: '#ea580c',
  extreme: '#dc2626',
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  'low': '低风险',
  'medium': '中等风险',
  'high': '高风险',
  'very-high': '极高风险',
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  'low': '#10b981',
  'medium': '#f59e0b',
  'high': '#ea580c',
  'very-high': '#dc2626',
};

export const CATEGORY_LABELS: Record<AdaptationStrategy['category'], string> = {
  supply: '供给侧',
  demand: '需求侧',
  ecology: '生态环境',
  monitoring: '监测预警',
  governance: '管理治理',
};
