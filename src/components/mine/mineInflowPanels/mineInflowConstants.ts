/**
 * B-18 矿坑涌水量预测计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 稳定流涌水量计算（潜水/承压/承压转无压）
 *  2. 疏干排水 — 非稳定流Theis修正 + 时间-涌水量曲线
 *  3. 影响半径 — Kusakin/Sichardt/修正公式
 *  4. 预设矿区 — 6个河北典型矿区对比 + 涌水量分级
 * 共享常量与类型（拆分自 MineInflowTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const GRADE_COLORS: Record<string, string> = {
  '极小': '#10b981',
  '小': '#3b82f6',
  '中等': '#f59e0b',
  '大': '#ef4444',
  '极大': '#dc2626',
};
