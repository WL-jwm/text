/**
 * B-13 咸水入侵风险评价 Tab
 *
 * 4大面板：
 *  1. 风险计算器 — Cl⁻输入+界面参数→综合评分
 *  2. 监测井预警 — 预设8个监测井风险排名
 *  3. 预测趋势 — Cl⁻浓度线性外推预测
 *  4. 防治参考 — 风险等级对应措施
 * 共享常量与类型（拆分自 IntrusionRiskTab.tsx）
 */
import { MapPin, BookOpen, Shield, TrendingUp } from 'lucide-react';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const SUB_TABS = [
  { key: 'calc', label: '风险计算器', icon: Shield },
  { key: 'wells', label: '监测井预警', icon: MapPin },
  { key: 'predict', label: '趋势预测', icon: TrendingUp },
  { key: 'ref', label: '防治参考', icon: BookOpen },
] as const;
export type SubTabKey = typeof SUB_TABS[number]['key'];
