/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 * 共享常量与类型（拆分自 HydrochemCalculatorTab.tsx）
 */
import { MapPin, BookOpen, Calculator } from 'lucide-react';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const SUB_TABS = [
  { key: 'calc', label: '水化学计算器', icon: Calculator },
  { key: 'preset', label: '预设水样', icon: MapPin },
  { key: 'ref', label: '换算参考', icon: BookOpen },
] as const;
export type SubTabKey = typeof SUB_TABS[number]['key'];
