/**
 * B-26 地下水时间序列分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 自定义序列输入→趋势/统计/突变/预测/自相关
 *  2. 预设序列 — 6个河北典型监测点11年序列对比
 *  3. 方法说明 — Mann-Kendall/Pettitt/Sen斜率等统计方法
 *  4. 评价标准 — 趋势/波动/突变/模型校准标准
 * 共享常量（拆分自 TimeSeriesCalculatorTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const TREND_COLORS: Record<string, string> = {
  '上升': '#ef4444',
  '下降': '#10b981',
  '无显著趋势': '#64748b',
};
export const DEFAULT_DATA = '68.5, 69.8, 70.2, 71.5, 70.8, 69.2, 67.5, 65.8, 64.2, 63.5, 62.8';
export const DEFAULT_YEARS = '2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024';
