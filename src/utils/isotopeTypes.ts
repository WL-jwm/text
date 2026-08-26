/**
 * 同位素测年 — 类型定义
 */

export interface TritiumInput {
  /** 监测点名称 */
  name: string;
  /** 实测³H浓度 (TU) */
  measuredTU: number;
  /** 补给时初始³H浓度 (TU) */
  initialTU: number;
  /** 模型类型 */
  model: 'piston' | 'exponential';
  /** 指数模型平均周转时间 τ (a) — 仅指数模型使用 */
  turnoverTime?: number;
}


export interface TritiumResult {
  name: string;
  /** 表观年龄 */
  apparentAge: number;
  /** 模型类型 */
  model: string;
  /** 剩余³H比例 (%) */
  remainingFraction: number;
  /** 年龄分级 */
  ageGrade: '现代水(<10a)' | '次现代水(10~50a)' | '老水(50~1000a)' | '古水(>1000a)';
  /** 说明 */
  note: string;
}


export interface Carbon14Input {
  /** 监测点名称 */
  name: string;
  /** 实测¹⁴C含量 (pmc — percent modern carbon) */
  measuredPMC: number;
  /** 初始¹⁴C含量 A0 (pmc) */
  initialPMC: number;
  /** δ¹³C校正值 (‰) */
  delta13C: number;
  /** 补给区δ¹³C (‰) */
  rechargeDelta13C: number;
  /** 碳酸盐稀释比例 (0~1) */
  dilutionFactor: number;
}


export interface Carbon14Result {
  name: string;
  /** 未校正年龄 (a BP) */
  rawAge: number;
  /** δ¹³C校正后年龄 (a BP) */
  correctedAge: number;
  /** 稀释校正后年龄 (a BP) */
  dilutionCorrectedAge: number;
  /** 推荐年龄 (a BP) */
  recommendedAge: number;
  /** 年龄分级 */
  ageGrade: '现代碳' | '百年级' | '千年级' | '万年级';
  /** 说明 */
  note: string;
}


export interface Helium4Input {
  /** 监测点名称 */
  name: string;
  /** 实测⁴He浓度 (cm³STP/kg) */
  measuredHe4: number;
  /** 大气平衡⁴He背景值 (cm³STP/kg) */
  atmosphericHe4: number;
  /** 累积速率 (cm³STP/kg·a) */
  accumRate: number;
}


export interface Helium4Result {
  name: string;
  /** 过量⁴He (cm³STP/kg) */
  excessHe4: number;
  /** 估算年龄 */
  estimatedAge: number;
  /** 年龄分级 */
  ageGrade: '现代水' | '百年-千年' | '千年-万年' | '万年以上';
  /** 说明 */
  note: string;
}


export interface RechargeTempInput {
  /** 监测点名称 */
  name: string;
  /** 实测δ¹⁸O (‰ VSMOW) */
  delta18O: number;
  /** 实测δ²H (‰ VSMOW) */
  deltaD: number;
  /** 当地大气降水线 LMWL: δ²H = a×δ¹⁸O + b */
  lmwlSlope: number;
  lmwlIntercept: number;
  /** 氧同位素-温度关系斜率 (‰/°C) */
  d18OTempSlope: number;
  /** 高程效应梯度 (‰/100m) */
  elevationGradient: number;
  /** 参考站高程 */
  referenceElevation: number;
  /** 参考站δ¹⁸O */
  referenceDelta18O: number;
}


export interface RechargeTempResult {
  name: string;
  /** 补给温度估算 (°C) */
  rechargeTemp: number;
  /** 补给高程估算 */
  rechargeElevation: number;
  /** 氘盈余 d-excess = δ²H - 8×δ¹⁸O (‰) */
  dExcess: number;
  /** 蒸发影响判断 */
  evaporationEffect: string;
  /** 水岩交换判断 */
  waterRockInteraction: string;
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 预设监测点数据（河北平原8组）
// ═══════════════════════════════════════════════════════


export interface IsotopePreset {
  name: string;
  location: string;
  aquiferType: string;
  tritium: number;
  c14: number;
  delta13C: number;
  he4: number;
  delta18O: number;
  deltaD: number;
  depth: number;
  note: string;
}

