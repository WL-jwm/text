/**
 * B-16 地下水脆弱性评价（DRASTIC模型）Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入7参数 → DRASTIC指数/脆弱性等级/参数分解
 *  2. 分区评价 — 8预设分区对比 + 面积统计
 *  3. 污染风险 — 污染源叠加风险分析
 *  4. 参数参考 — 7参数评分表查表
 * 共享常量与类型（拆分自 DrasticVulnerabilityTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const VULN_COLORS: Record<string, string> = {
  '低': '#10b981',
  '中等': '#3b82f6',
  '高': '#f59e0b',
  '极高': '#ef4444',
};
export const RISK_COLORS: Record<string, string> = {
  '低风险': '#10b981',
  '中等风险': '#3b82f6',
  '高风险': '#f59e0b',
  '极高风险': '#ef4444',
};
