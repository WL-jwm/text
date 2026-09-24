/**
 * B-17 地热资源量评价计算器 Tab
 *
 * 4大面板：
 *  1. 热储储量 — 热储法 Q=ρ·c·V·ΔT 计算 + 预设地热田对比
 *  2. 井产能评价 — 热功率/年产热量/产能等级
 *  3. 地温梯度 — 梯度/热流值/不同深度温度预测
 *  4. 可开采量 — 开采系数法/回灌率/服务年限
 * 共享常量与类型（拆分自 GeothermalCalculatorTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const GRADE_COLORS: Record<string, string> = {
  '低产': '#6b7280',
  '中产': '#3b82f6',
  '高产': '#f59e0b',
  '特高产': '#ef4444',
};
export const GRADIENT_COLORS: Record<string, string> = {
  '正常': '#10b981',
  '偏高': '#3b82f6',
  '高地温': '#f59e0b',
  '异常': '#ef4444',
};
