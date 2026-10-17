/**
 * B-22 饮用天然矿泉水水质评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入水质参数 → 界限指标/限量指标/类型判定/综合等级
 *  2. 预设水源地 — 14个产地对比评价
 *  3. 标准对比 — GB 8537 vs GB/T 14848
 *  4. 类型统计 — 矿泉水类型分布分析
 * 共享常量与类型（拆分自 MineralWaterCalculatorTab.tsx）
 */
import type { MineralWaterInput } from '../../../utils/mineralWaterCalculator';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const GRADE_COLORS: Record<string, string> = {
  '合格': '#10b981',
  '界限达标': '#f59e0b',
  '不合格': '#ef4444',
};
export const FIELD_DEFS: Array<{ key: keyof MineralWaterInput; label: string; step?: string }> = [
  { key: 'sio2', label: '偏硅酸 SiO₂ (mg/L)' },
  { key: 'strontium', label: '锶 Sr (mg/L)', step: '0.01' },
  { key: 'lithium', label: '锂 Li (mg/L)', step: '0.01' },
  { key: 'selenium', label: '硒 Se (mg/L)', step: '0.001' },
  { key: 'zinc', label: '锌 Zn (mg/L)', step: '0.01' },
  { key: 'freeCO2', label: '游离CO₂ (mg/L)' },
  { key: 'mineralization', label: '矿化度 (mg/L)' },
  { key: 'temperature', label: '水温 (°C)' },
  { key: 'ph', label: 'pH', step: '0.1' },
  { key: 'arsenic', label: '砷 As (mg/L)', step: '0.001' },
  { key: 'cadmium', label: '镉 Cd (mg/L)', step: '0.0001' },
  { key: 'chromium', label: '铬 Cr⁶⁺ (mg/L)', step: '0.001' },
  { key: 'lead', label: '铅 Pb (mg/L)', step: '0.001' },
  { key: 'mercury', label: '汞 Hg (mg/L)', step: '0.0001' },
  { key: 'fluoride', label: '氟化物 F⁻ (mg/L)', step: '0.1' },
  { key: 'nitrate', label: '硝酸盐 NO₃⁻ (mg/L)' },
  { key: 'cyanide', label: '氰化物 (mg/L)', step: '0.001' },
];
