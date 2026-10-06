/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 * 共享常量与类型（拆分自 IsotopeAgeTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const AGE_COLORS: Record<string, string> = {
  '现代水(<10a)': '#10b981',
  '次现代水(10~50a)': '#3b82f6',
  '老水(50~1000a)': '#f59e0b',
  '古水(>1000a)': '#ef4444',
  '现代碳': '#10b981',
  '百年级': '#3b82f6',
  '千年级': '#f59e0b',
  '万年级': '#ef4444',
  '现代水': '#10b981',
  '百年-千年': '#f59e0b',
  '千年-万年': '#ef4444',
  '万年以上': '#dc2626',
};
