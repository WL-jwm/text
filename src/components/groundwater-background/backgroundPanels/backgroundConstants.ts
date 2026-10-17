/**
 * B-27 地下水背景值统计分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 单因子背景值确定（3种方法对比）
 *  2. 分区对比 — 3个分区6项因子背景值差异分析
 *  3. 超标统计 — 各因子超标率/超标倍数/污染指数
 *  4. 趋势检测 — 多年背景值变化趋势+偏移判断
 * 共享常量与类型（拆分自 BackgroundValueCalculatorTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const EXCEED_COLORS: Record<string, string> = {
  '无超标': '#10b981', '轻微超标': '#06b6d4', '轻度超标': '#f59e0b',
  '中度超标': '#f97316', '重度超标': '#ef4444',
};
export const ZONE_COLORS: Record<string, string> = {
  '山前平原': '#06b6d4', '中部平原': '#f59e0b', '滨海平原': '#ef4444',
};
