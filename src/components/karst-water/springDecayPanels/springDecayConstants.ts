/**
 * B-19 岩溶泉流量衰减分析 Tab
 *
 * 4大面板：
 *  1. 衰减分析 — Maillet指数衰减模型 + 衰减曲线
 *  2. 滞后相关 — 降水-泉流量滞后相关分析
 *  3. 调蓄评价 — 系统调蓄功能评价
 *  4. 预设泉域 — 6个河北岩溶大泉对比 + 衰减系数参考表
 * 共享常量与类型（拆分自 SpringDecayTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const REGULATION_COLORS: Record<string, string> = {
  '极强': '#10b981',
  '强': '#3b82f6',
  '中等': '#f59e0b',
  '弱': '#ef4444',
};
export const AMPLITUDE_COLORS: Record<string, string> = {
  '稳定': '#10b981',
  '较稳定': '#3b82f6',
  '变幅较大': '#f59e0b',
  '极不稳定': '#ef4444',
};
