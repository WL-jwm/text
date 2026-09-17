/**
 * 水量均衡计算服务 (G-12) — 类型定义
 * 拆分自 waterBalance.ts：补给/排泄类别、均衡项、分区/时段配置、结果
 */

export type RechargeCategory =
  | 'precipitation'       // 降水入渗补给
  | 'lateralInflow'       // 侧向径流补给
  | 'riverLeakage'        // 河道渗漏补给
  | 'canalLeakage'        // 渠系渗漏补给
  | 'irrigationReturn'    // 田间灌溉入渗
  | 'leakageRecharge'     // 越流补给
  | 'otherRecharge';       // 其他补给

/** 水均衡排泄项分类 */
export type DischargeCategory =
  | 'extraction'          // 人工开采
  | 'phreaticEvaporation' // 潜水蒸发
  | 'leakageDischarge'    // 越流排泄
  | 'lateralOutflow'      // 侧向径流排泄
  | 'otherDischarge';      // 其他排泄

/** 时段标识 */
export type PeriodId = '1991-2000' | '2001-2010' | '2011-2020' | '2021-2030' | string;

/** 均衡项 */
export interface BalanceItem {
  /** 项标识 */
  id: string;
  /** 显示名称 */
  label: string;
  /** 数值（亿m³/a） */
  value: number;
  /** 占比（%） */
  percent: number;
}

/** 均衡计算分区配置 */
export interface BalanceZoneConfig {
  /** 分区名称 */
  name: string;
  /** 面积（km²） */
  area: number;
  /** 降水入渗补给系数 */
  precipCoeff: number;
  /** 年均降水量（mm） */
  annualPrecipitation: number;
  /** 侧向径流补给模数（万m³/a·km²） */
  lateralInflowModulus: number;
  /** 人工开采模数（万m³/a·km²） */
  extractionModulus: number;
  /** 潜水蒸发临界埋深（m） */
  evaporationDepth: number;
  /** 灌溉回归系数 */
  irrigationReturnRate: number;
}

/** 水均衡时段配置 */
export interface BalancePeriodConfig {
  /** 时段标识 */
  periodId: PeriodId;
  /** 时段名称 */
  periodLabel: string;
  /** 补给项列表 */
  rechargeItems: BalanceItem[];
  /** 排泄项列表 */
  dischargeItems: BalanceItem[];
  /** 总补给量（亿m³/a） */
  totalRecharge: number;
  /** 总排泄量（亿m³/a） */
  totalDischarge: number;
  /** 均衡差（+盈余/-亏损，亿m³/a） */
  balance: number;
  /** 储量变化（亿m³/a） */
  storageChange: number;
  /** 备注 */
  note?: string;
}

/** 水均衡计算结果（完整） */
export interface WaterBalanceResult {
  /** 时段 */
  period: BalancePeriodConfig;
  /** 参与计算的城市列表 */
  cities: string[];
  /** 参与计算的井数 */
  wellCount: number;
  /** 是否超采（balance < 0） */
  isOverdrafted: boolean;
  /** 超采强度（万m³/a·km²） */
  overdraftIntensity: number;
  /** 总计算面积（km²） */
  totalArea: number;
  /** 补给项(按占比排序) */
  sortedRecharge: BalanceItem[];
  /** 排泄项(按占比排序) */
  sortedDischarge: BalanceItem[];
}

/** 按城市均衡分析结果 */
export interface CityBalanceResult {
  city: string;
  area: number;
  wellCount: number;
  recharge: number;
  discharge: number;
  balance: number;
  isOverdrafted: boolean;
  overdraftIntensity: number;
  /** 主要超采因素说明 */
  factor?: string;
}

/** 多时段对比结果 */
export interface BalanceComparison {
  periods: BalancePeriodConfig[];
  rechargeTrend: { periodId: PeriodId; label: string; value: number }[];
  dischargeTrend: { periodId: PeriodId; label: string; value: number }[];
  balanceTrend: { periodId: PeriodId; label: string; value: number }[];
  /** 典型时段默认显示 */
  defaultPeriodId: PeriodId;
}

// ============ 预设常量 ============

/** 补给项元数据 */
