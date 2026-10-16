/**
 * B-29 地下水空间统计分析器 Tab
 *
 * 4大面板：
 *  1. Moran's I — 全局空间自相关+LISA局部热点/冷点
 *  2. 半变异函数 — 实验+理论模型拟合(球状/指数/高斯)
 *  3. 交叉验证 — 克里金插值精度评估(留一法)
 *  4. 参考 — 空间统计方法与判据说明
 * 共享常量与类型（拆分自 SpatialStatsCalculatorTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const PATTERN_COLORS: Record<string, string> = {
  '聚集': '#ef4444', '随机': '#64748b', '离散': '#06b6d4',
};
export const QUADRANT_COLORS: Record<string, string> = {
  'HH（高-高聚集）': '#ef4444',
  'LL（低-低聚集）': '#06b6d4',
  'HL（高-低异常）': '#f59e0b',
  'LH（低-高异常）': '#8b5cf6',
};
