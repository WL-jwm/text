/**
 * 气候变化影响评估 — 类型定义
 */

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
