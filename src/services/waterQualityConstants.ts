/**
 * 水质评价服务 (G-11) — 标准常量
 * 拆分自 waterQuality.ts：指标元数据 / GB/T 14848-2017 限值 / 类别标签 / 离子转换系数
 */

import type { WaterQualityIndicator, WaterQualityClass } from './waterQualityTypes';
export const INDICATOR_META: Record<WaterQualityIndicator, { label: string; unit: string; order: number }> = {
  pH: { label: 'pH', unit: '', order: 1 },
  TDS: { label: '溶解性总固体', unit: 'mg/L', order: 2 },
  totalHardness: { label: '总硬度(CaCO₃)', unit: 'mg/L', order: 3 },
  Cl: { label: '氯化物', unit: 'mg/L', order: 4 },
  SO4: { label: '硫酸盐', unit: 'mg/L', order: 5 },
  NO3: { label: '硝酸盐(以N计)', unit: 'mg/L', order: 6 },
  NO2: { label: '亚硝酸盐(以N计)', unit: 'mg/L', order: 7 },
  NH4: { label: '氨氮', unit: 'mg/L', order: 8 },
  F: { label: '氟化物', unit: 'mg/L', order: 9 },
  Fe: { label: '铁', unit: 'mg/L', order: 10 },
  Mn: { label: '锰', unit: 'mg/L', order: 11 },
  As: { label: '砷', unit: 'mg/L', order: 12 },
  Cr6: { label: '六价铬', unit: 'mg/L', order: 13 },
  Pb: { label: '铅', unit: 'mg/L', order: 14 },
  Cd: { label: '镉', unit: 'mg/L', order: 15 },
  Hg: { label: '汞', unit: 'mg/L', order: 16 },
  COD: { label: '耗氧量(CODₘₙ)', unit: 'mg/L', order: 17 },
  DO: { label: '溶解氧', unit: 'mg/L', order: 18 },
  totalBacteria: { label: '总大肠菌群', unit: 'CFU/100mL', order: 19 },
};

/**
 * GB/T 14848-2017 各项指标分类限值
 * 每项为 [Ⅰ类, Ⅱ类, Ⅲ类, Ⅳ类, Ⅴ类] 上限值
 * 特别说明: pH 为范围型，其他为上限型
 * 对于上限型：≤ 该值即为该类别
 * 对于范围型：在范围内即为该类别
 */
export const GB_T14848_2017_LIMITS: Record<WaterQualityIndicator, [number, number, number, number, number]> = {
  pH: [8.5, 8.5, 8.5, 9.0, 14.0],           // pH 用下限 6.5/6.5/6.5/5.5/— 单独处理
  TDS: [300, 500, 1000, 2000, 99999],
  totalHardness: [150, 300, 450, 650, 99999],
  Cl: [50, 150, 250, 350, 99999],
  SO4: [50, 150, 250, 350, 99999],
  NO3: [2.0, 5.0, 20.0, 30.0, 99999],
  NO2: [0.01, 0.10, 1.00, 4.80, 99999],
  NH4: [0.02, 0.10, 0.50, 1.50, 99999],
  F: [0.5, 1.0, 1.0, 2.0, 99999],
  Fe: [0.1, 0.2, 0.3, 2.0, 99999],
  Mn: [0.05, 0.05, 0.10, 1.50, 99999],
  As: [0.001, 0.001, 0.01, 0.05, 99999],
  Cr6: [0.005, 0.01, 0.05, 0.10, 99999],
  Pb: [0.005, 0.005, 0.01, 0.10, 99999],
  Cd: [0.0001, 0.001, 0.005, 0.01, 99999],
  Hg: [0.00005, 0.0001, 0.001, 0.002, 99999],
  COD: [1.0, 2.0, 3.0, 10.0, 99999],
  DO: [7.5, 6.0, 4.0, 3.0, 0],              // DO 为下限型，≥ 该值
  totalBacteria: [50, 100, 100, 1000, 99999],
};

/** 水质类别描述 */
export const WATER_CLASS_LABELS: Record<WaterQualityClass, { label: string; description: string; color: string }> = {
  1: { label: 'Ⅰ类', description: '优良', color: '#06b6d4' },
  2: { label: 'Ⅱ类', description: '良好', color: '#10b981' },
  3: { label: 'Ⅲ类', description: '较好', color: '#f59e0b' },
  4: { label: 'Ⅳ类', description: '较差', color: '#f97316' },
  5: { label: 'Ⅴ类', description: '极差', color: '#ef4444' },
};

// ============ 核心评价引擎 ============

/**
 * 单项指标评价（GB/T 14848-2017）
 * 纯函数，可测试
 */

// ============================================================
// 离子转换系数
// ============================================================
export const ION_CONVERSION: Record<string, { valency: number; molarMass: number }> = {
  HCO3: { valency: 1, molarMass: 61.02 },
  SO4: { valency: 2, molarMass: 96.06 },
  Cl: { valency: 1, molarMass: 35.45 },
  Ca: { valency: 2, molarMass: 40.08 },
  Mg: { valency: 2, molarMass: 24.31 },
  Na: { valency: 1, molarMass: 22.99 },
  K: { valency: 1, molarMass: 39.10 },
};

/**
 * 苏卡列夫分类（基于主要阴/阳离子当量比例）
 * 某离子当量占比 > 25% 即参与命名
 * 纯函数，可测试
 */
