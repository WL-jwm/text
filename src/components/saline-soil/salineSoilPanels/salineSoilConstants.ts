/**
 * B-23 土壤盐渍化评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入土壤参数 → 盐分分级/类型判定/淋洗需水量/改良预测/临界深度
 *  2. 预设分区 — 8个河北平原盐渍化分区对比评价
 *  3. 盐分分级标准 — 5级分级标准参考
 *  4. 质地参数 — 不同质地毛细参数与改良建议
 * 共享常量与类型（拆分自 SoilSalinizationCalculatorTab.tsx）
 */

import type { SalinizationInput } from '../../../utils/soilSalinizationCalculator';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const GRADE_COLORS: Record<string, string> = {
  '无盐渍化': '#10b981',
  '轻度盐渍化': '#06b6d4',
  '中度盐渍化': '#f59e0b',
  '重度盐渍化': '#f97316',
  '极重度盐渍化': '#ef4444',
  '非碱化': '#10b981',
  '轻度碱化': '#f59e0b',
  '中度碱化': '#f97316',
  '重度碱化': '#ef4444',
};
export const ACCENT_MAP: Record<string, string> = {
  'emerald': 'emerald', 'cyan': 'cyan', 'amber': 'amber',
  'orange': 'orange', 'red': 'red', 'blue': 'blue',
};
export const FIELD_DEFS: Array<{ key: keyof SalinizationInput; label: string; step?: string }> = [
  { key: 'totalSalt', label: '全盐量 (g/kg)', step: '0.1' },
  { key: 'ecE', label: '电导率 EC_e (dS/m)', step: '0.1' },
  { key: 'ph', label: 'pH', step: '0.1' },
  { key: 'chloride', label: 'Cl⁻ (cmol/kg)', step: '0.1' },
  { key: 'sulfate', label: 'SO₄²⁻ (cmol/kg)', step: '0.1' },
  { key: 'bicarbonate', label: 'HCO₃⁻ (cmol/kg)', step: '0.1' },
  { key: 'carbonate', label: 'CO₃²⁻ (cmol/kg)', step: '0.1' },
  { key: 'sodium', label: 'Na⁺ (cmol/kg)', step: '0.1' },
  { key: 'calcium', label: 'Ca²⁺ (cmol/kg)', step: '0.1' },
  { key: 'magnesium', label: 'Mg²⁺ (cmol/kg)', step: '0.1' },
  { key: 'gwMineralization', label: '地下水矿化度 (g/L)', step: '0.1' },
  { key: 'gwDepth', label: '地下水埋深 (m)', step: '0.1' },
  { key: 'irrigationEC', label: '灌溉水EC_dw (dS/m)', step: '0.1' },
  { key: 'cropThreshold', label: '作物耐盐阈值 EC_t (dS/m)', step: '0.1' },
];
export const TEXTURE_OPTIONS = ['砂土', '砂壤', '轻壤', '中壤', '重壤', '黏土'];
