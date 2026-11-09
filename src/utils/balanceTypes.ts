/**
 * 拆分自 balanceCalculator.ts — 地下水均衡类型与阈值常量
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
export const BALANCE_THRESHOLDS = {
  surplus: 0.05,    // >5% 为盈余
  balanced: -0.05,   // -5%~5% 为均衡
  deficit: -0.20,   // -5%~-20% 为亏损
  // < -20% 为严重亏损
} as const;

/** 开采系数安全阈值 */
export const EXPLOIT_COEFF_THRESHOLDS = {
  safe: 0.6,
  warning: 0.8,
  over: 1.0,
  // >1.0 为严重超采
} as const;
