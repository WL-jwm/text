/**
 * B-25 地下水数值模拟参数估算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 水力参数转换+网格估算+稳定性判断+时间步长
 *  2. 模型校准 — 观测/模拟数据对比+NSE/RMSE/R²等指标
 *  3. 预设分区 — 6个河北典型数值模拟区参数对比
 *  4. 参考方法 — 数值方法+稳定性准则+校准标准
 * 共享常量（拆分自 NumericalModelCalculatorTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const GRADE_COLORS: Record<string, string> = {
  '优秀': '#10b981', '良好': '#06b6d4', '合格': '#f59e0b',
  '勉强': '#f97316', '不合格': '#ef4444', '数据不足': '#64748b',
};
