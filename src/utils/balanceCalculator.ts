/**
 * B-07 Groundwater Balance Calculator
 * 地下水均衡计算器 - 补给量/排泄量/均衡差/开采系数/可开采系数
 *
 * 核心公式:
 *   均衡差 ΔW = Σ补给 - Σ排泄
 *   开采系数 α = Q开采 / Q总补给
 *   开采模数 M = Q开采 / F (万m³/km²·a)
 *   补给模数 Mr = Q总补给 / F (万m³/km²·a)
 */

// ── 接口定义 ──

/** 均衡计算输入（单个城市/区域） */
export interface BalanceInput {
  city: string;
  area: number;             // 计算面积 km²
  // 补给项
  precipitationInfiltration: number;   // 降水入渗补给 亿m³/a
  lateralRecharge: number;           // 侧向径流补给 亿m³/a
  riverLeakage: number;              // 河道渗漏补给 亿m³/a
  canalLeakage: number;              // 渠系渗漏补给 亿m³/a
  irrigationRecharge: number;        // 田间灌溉入渗 亿m³/a
  crossFlowRecharge: number;         // 越流补给 亿m³/a
  otherRecharge: number;             // 其他补给 亿m³/a
  // 排泄项
  extraction: number;                // 人工开采 亿m³/a
  evaporation: number;               // 潜水蒸发 亿m³/a
  crossFlowDischarge: number;        // 越流排泄 亿m³/a
  lateralDischarge: number;         // 侧向径流排泄 亿m³/a
  springDischarge: number;           // 泉排泄 亿m³/a
  // 参考值（可选）
  allowableExtraction?: number;     // 允许开采量 亿m³/a
}

/** 均衡计算单项结果 */
export interface BalanceItemResult {
  name: string;           // 项名称
  value: number;          // 数值
  unit: string;           // 单位
  percent: number;        // 占总量百分比
}

/** 均衡计算输出（单个城市） */
export interface BalanceResult {
  city: string;
  area: number;
  // 补给合计
  totalRecharge: number;
  rechargeItems: BalanceItemResult[];
  // 排泄合计
  totalDischarge: number;
  dischargeItems: BalanceItemResult[];
  // 均衡
  balance: number;              // 均衡差 = 补给 - 排泄
  balanceRate: number;          // 均衡差占补给百分比
  balanceStatus: 'surplus' | 'balanced' | 'deficit' | 'severe';
  // 开采指标
  exploitationCoefficient: number;   // 开采系数 α
  exploitationModulus: number;        // 开采模数 万m³/km²·a
  rechargeModulus: number;           // 补给模数 万m³/km²·a
  // 安全评价
  overdraftStatus: 'safe' | 'warning' | 'over' | 'critical';
  overdraftAmount: number;            // 超采量（负值为超采）
}

/** 汇总统计 */
export interface BalanceSummary {
  totalArea: number;
  totalRecharge: number;
  totalDischarge: number;
  totalBalance: number;
  avgExploitationCoeff: number;
  totalOverdraftCities: number;
  totalBalancedCities: number;
  totalSurplusCities: number;
  rechargeBreakdown: BalanceItemResult[];
  dischargeBreakdown: BalanceItemResult[];
}

// ── 常量 ──

/** 均衡差占补给比阈值 */
const BALANCE_THRESHOLDS = {
  surplus: 0.05,    // >5% 为盈余
  balanced: -0.05,   // -5%~5% 为均衡
  deficit: -0.20,   // -5%~-20% 为亏损
  // < -20% 为严重亏损
} as const;

/** 开采系数安全阈值 */
const EXPLOIT_COEFF_THRESHOLDS = {
  safe: 0.6,
  warning: 0.8,
  over: 1.0,
  // >1.0 为严重超采
} as const;

// ── 核心计算 ──

export function calcBalance(input: BalanceInput): BalanceResult {
  const {
    city, area,
    precipitationInfiltration, lateralRecharge, riverLeakage,
    canalLeakage, irrigationRecharge, crossFlowRecharge, otherRecharge,
    extraction, evaporation, crossFlowDischarge, lateralDischarge,
    springDischarge,
  } = input;

  // 补给项汇总
  const rechargeItems: BalanceItemResult[] = [
    { name: '降水入渗', value: precipitationInfiltration, unit: '亿m³/a', percent: 0 },
    { name: '侧向径流', value: lateralRecharge, unit: '亿m³/a', percent: 0 },
    { name: '河道渗漏', value: riverLeakage, unit: '亿m³/a', percent: 0 },
    { name: '渠系渗漏', value: canalLeakage, unit: '亿m³/a', percent: 0 },
    { name: '灌溉入渗', value: irrigationRecharge, unit: '亿m³/a', percent: 0 },
    { name: '越流补给', value: crossFlowRecharge, unit: '亿m³/a', percent: 0 },
    { name: '其他补给', value: otherRecharge, unit: '亿m³/a', percent: 0 },
  ];
  const totalRecharge = rechargeItems.reduce((s, r) => s + r.value, 0);

  // 排泄项汇总
  const dischargeItems: BalanceItemResult[] = [
    { name: '人工开采', value: extraction, unit: '亿m³/a', percent: 0 },
    { name: '潜水蒸发', value: evaporation, unit: '亿m³/a', percent: 0 },
    { name: '越流排泄', value: crossFlowDischarge, unit: '亿m³/a', percent: 0 },
    { name: '侧向排泄', value: lateralDischarge, unit: '亿m³/a', percent: 0 },
    { name: '泉排泄', value: springDischarge, unit: '亿m³/a', percent: 0 },
  ];
  const totalDischarge = dischargeItems.reduce((s, r) => s + r.value, 0);

  // 计算百分比
  if (totalRecharge > 0) {
    rechargeItems.forEach(r => { r.percent = (r.value / totalRecharge) * 100; });
  }
  if (totalDischarge > 0) {
    dischargeItems.forEach(r => { r.percent = (r.value / totalDischarge) * 100; });
  }

  // 均衡差
  const balance = totalRecharge - totalDischarge;
  const balanceRate = totalRecharge > 0 ? balance / totalRecharge : 0;

  // 均衡状态
  let balanceStatus: BalanceResult['balanceStatus'];
  if (balanceRate > BALANCE_THRESHOLDS.surplus) {
    balanceStatus = 'surplus';
  } else if (balanceRate >= BALANCE_THRESHOLDS.balanced) {
    balanceStatus = 'balanced';
  } else if (balanceRate >= BALANCE_THRESHOLDS.deficit) {
    balanceStatus = 'deficit';
  } else {
    balanceStatus = 'severe';
  }

  // 开采系数 α = Q开采 / Q总补给
  const exploitationCoefficient = totalRecharge > 0 ? extraction / totalRecharge : 0;

  // 开采模数 M = Q开采 / F (亿m³/a → 万m³/km²·a)
  // 1亿m³ = 10000万m³
  const exploitationModulus = area > 0 ? (extraction * 10000) / area : 0;

  // 补给模数
  const rechargeModulus = area > 0 ? (totalRecharge * 10000) / area : 0;

  // 安全评价（基于开采系数）
  let overdraftStatus: BalanceResult['overdraftStatus'];
  if (exploitationCoefficient <= EXPLOIT_COEFF_THRESHOLDS.safe) {
    overdraftStatus = 'safe';
  } else if (exploitationCoefficient <= EXPLOIT_COEFF_THRESHOLDS.warning) {
    overdraftStatus = 'warning';
  } else if (exploitationCoefficient <= EXPLOIT_COEFF_THRESHOLDS.over) {
    overdraftStatus = 'over';
  } else {
    overdraftStatus = 'critical';
  }

  // 超采量（相对允许开采量）
  const overdraftAmount = input.allowableExtraction != null
    ? extraction - input.allowableExtraction
    : (balance < 0 ? balance : 0);

  return {
    city, area,
    totalRecharge, rechargeItems,
    totalDischarge, dischargeItems,
    balance, balanceRate, balanceStatus,
    exploitationCoefficient, exploitationModulus, rechargeModulus,
    overdraftStatus, overdraftAmount,
  };
}


/** 汇总多个城市的均衡结果 */
export function calcBalanceSummary(results: BalanceResult[]): BalanceSummary {
  const validResults = results.filter(r => r.city !== '');
  if (validResults.length === 0) {
    return {
      totalArea: 0, totalRecharge: 0, totalDischarge: 0, totalBalance: 0,
      avgExploitationCoeff: 0, totalOverdraftCities: 0,
      totalBalancedCities: 0, totalSurplusCities: 0,
      rechargeBreakdown: [], dischargeBreakdown: [],
    };
  }

  const totalArea = validResults.reduce((s, r) => s + r.area, 0);
  const totalRecharge = validResults.reduce((s, r) => s + r.totalRecharge, 0);
  const totalDischarge = validResults.reduce((s, r) => s + r.totalDischarge, 0);
  const totalBalance = totalRecharge - totalDischarge;
  const avgExploitationCoeff = validResults.reduce((s, r) => s + r.exploitationCoefficient, 0) / validResults.length;

  let totalOverdraftCities = 0;
  let totalBalancedCities = 0;
  let totalSurplusCities = 0;
  for (const r of validResults) {
    if (r.balanceStatus === 'surplus') totalSurplusCities++;
    else if (r.balanceStatus === 'balanced') totalBalancedCities++;
    else totalOverdraftCities++;
  }

  // 汇总各项补给
  const rechargeNames = ['降水入渗', '侧向径流', '河道渗漏', '渠系渗漏', '灌溉入渗', '越流补给', '其他补给'];
  const rechargeBreakdown = rechargeNames.map(name => {
    const value = validResults.reduce((s, r) => {
      const item = r.rechargeItems.find(i => i.name === name);
      return s + (item ? item.value : 0);
    }, 0);
    return { name, value, unit: '亿m³/a', percent: totalRecharge > 0 ? (value / totalRecharge) * 100 : 0 };
  });

  const dischargeNames = ['人工开采', '潜水蒸发', '越流排泄', '侧向排泄', '泉排泄'];
  const dischargeBreakdown = dischargeNames.map(name => {
    const value = validResults.reduce((s, r) => {
      const item = r.dischargeItems.find(i => i.name === name);
      return s + (item ? item.value : 0);
    }, 0);
    return { name, value, unit: '亿m³/a', percent: totalDischarge > 0 ? (value / totalDischarge) * 100 : 0 };
  });

  return {
    totalArea, totalRecharge, totalDischarge, totalBalance,
    avgExploitationCoeff, totalOverdraftCities,
    totalBalancedCities, totalSurplusCities,
    rechargeBreakdown, dischargeBreakdown,
  };
}

/** 获取预设数据（河北平原1991-2000年均值） */
export function getPresetBalanceData(): BalanceInput[] {
  return [
    { city: '石家庄', area: 6673, precipitationInfiltration: 18.28, lateralRecharge: 1.89, riverLeakage: 1.05, canalLeakage: 0.62, irrigationRecharge: 0.48, crossFlowRecharge: 0.38, otherRecharge: 0.24, extraction: 22.82, evaporation: 2.04, crossFlowDischarge: 0.92, lateralDischarge: 0.11, springDischarge: 0, allowableExtraction: 19.31 },
    { city: '唐山', area: 6604, precipitationInfiltration: 14.93, lateralRecharge: 0.98, riverLeakage: 1.12, canalLeakage: 0.54, irrigationRecharge: 0.38, crossFlowRecharge: 0.32, otherRecharge: 0.18, extraction: 16.20, evaporation: 1.85, crossFlowDischarge: 0.76, lateralDischarge: 0.09, springDischarge: 0, allowableExtraction: 10.63 },
    { city: '保定', area: 10995, precipitationInfiltration: 20.19, lateralRecharge: 2.05, riverLeakage: 1.42, canalLeakage: 0.88, irrigationRecharge: 0.72, crossFlowRecharge: 0.52, otherRecharge: 0.35, extraction: 25.67, evaporation: 3.15, crossFlowDischarge: 1.08, lateralDischarge: 0.14, springDischarge: 0, allowableExtraction: 20.33 },
    { city: '廊坊', area: 6398, precipitationInfiltration: 6.94, lateralRecharge: 0.45, riverLeakage: 0.52, canalLeakage: 0.28, irrigationRecharge: 0.18, crossFlowRecharge: 0.15, otherRecharge: 0.08, extraction: 8.31, evaporation: 1.12, crossFlowDischarge: 0.65, lateralDischarge: 0.06, springDischarge: 0, allowableExtraction: 5.40 },
    { city: '沧州', area: 12121, precipitationInfiltration: 13.19, lateralRecharge: 0.62, riverLeakage: 0.85, canalLeakage: 0.42, irrigationRecharge: 0.32, crossFlowRecharge: 0.28, otherRecharge: 0.15, extraction: 13.60, evaporation: 1.68, crossFlowDischarge: 0.85, lateralDischarge: 0.08, springDischarge: 0, allowableExtraction: 4.58 },
    { city: '衡水', area: 8433, precipitationInfiltration: 8.28, lateralRecharge: 0.52, riverLeakage: 0.68, canalLeakage: 0.35, irrigationRecharge: 0.25, crossFlowRecharge: 0.22, otherRecharge: 0.12, extraction: 10.13, evaporation: 1.35, crossFlowDischarge: 0.72, lateralDischarge: 0.07, springDischarge: 0, allowableExtraction: 2.81 },
    { city: '邢台', area: 8687, precipitationInfiltration: 12.33, lateralRecharge: 0.85, riverLeakage: 0.95, canalLeakage: 0.48, irrigationRecharge: 0.35, crossFlowRecharge: 0.28, otherRecharge: 0.16, extraction: 13.94, evaporation: 1.82, crossFlowDischarge: 0.78, lateralDischarge: 0.08, springDischarge: 0, allowableExtraction: 10.31 },
    { city: '邯郸', area: 7515, precipitationInfiltration: 10.92, lateralRecharge: 0.78, riverLeakage: 0.82, canalLeakage: 0.45, irrigationRecharge: 0.32, crossFlowRecharge: 0.25, otherRecharge: 0.14, extraction: 12.75, evaporation: 1.58, crossFlowDischarge: 0.72, lateralDischarge: 0.08, springDischarge: 0, allowableExtraction: 9.20 },
    { city: '张家口', area: 15796, precipitationInfiltration: 10.50, lateralRecharge: 2.10, riverLeakage: 1.85, canalLeakage: 0.62, irrigationRecharge: 0.45, crossFlowRecharge: 0.18, otherRecharge: 0.35, extraction: 11.20, evaporation: 0.85, crossFlowDischarge: 0.12, lateralDischarge: 0.52, springDischarge: 0, allowableExtraction: 10.50 },
    { city: '承德', area: 19748, precipitationInfiltration: 18.60, lateralRecharge: 2.85, riverLeakage: 2.42, canalLeakage: 0.72, irrigationRecharge: 0.55, crossFlowRecharge: 0.22, otherRecharge: 0.42, extraction: 19.10, evaporation: 1.12, crossFlowDischarge: 0.15, lateralDischarge: 0.68, springDischarge: 0, allowableExtraction: 18.60 },
    { city: '秦皇岛', area: 1919, precipitationInfiltration: 5.10, lateralRecharge: 0.35, riverLeakage: 0.48, canalLeakage: 0.22, irrigationRecharge: 0.15, crossFlowRecharge: 0.08, otherRecharge: 0.05, extraction: 5.36, evaporation: 0.62, crossFlowDischarge: 0.08, lateralDischarge: 0.03, springDischarge: 0, allowableExtraction: 4.33 },
  ];
}

/** 格式化数值 */
export function fmt(val: number, digits = 2): string {
  if (val === 0) return '0';
  if (Math.abs(val) < 0.005) return val > 0 ? '< 0.01' : '> -0.01';
  return val.toFixed(digits);
}

/** 均衡状态中文 */
export function getBalanceStatusLabel(status: BalanceResult['balanceStatus']): string {
  const map: Record<BalanceResult['balanceStatus'], string> = {
    surplus: '盈余',
    balanced: '均衡',
    deficit: '亏损',
    severe: '严重亏损',
  };
  return map[status];
}

/** 超采状态中文 */
export function getOverdraftStatusLabel(status: BalanceResult['overdraftStatus']): string {
  const map: Record<BalanceResult['overdraftStatus'], string> = {
    safe: '安全',
    warning: '警戒',
    over: '超采',
    critical: '严重超采',
  };
  return map[status];
}
