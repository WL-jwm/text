/**
 * B-21 裂隙水涌水量估算计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Kf估算 + Q = Kf×I×F
 *  3. 径流模数法 — 经验公式按岩性分区
 *  4. 预设岩性 — 6种岩性对比 + 干扰分析 + 参考表
 * 共享常量与类型（拆分自 FractureWaterCalculatorTab.tsx）
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
export const FRACTURE_COLORS: Record<string, string> = {
  '极弱': '#10b981',
  '弱': '#3b82f6',
  '中等': '#f59e0b',
  '强': '#ef4444',
  '极强': '#dc2626',
};
