/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 * 共享常量与类型（拆分自 ProtectionZoneTab.tsx）
 */
import { type SourceType, MEDIUM_POROSITY } from '../../../utils/protectionZoneCalculator';
import { Calculator, Layers, BookOpen, MapPin } from 'lucide-react';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const SOURCE_TYPES: SourceType[] = ['孔隙水-潜水', '孔隙水-承压', '岩溶水', '裂隙水'];
export const SCALES = ['小型', '中型', '大型', '特大型'] as const;
export const MEDIUM_NAMES = Object.keys(MEDIUM_POROSITY);
export const SUB_TABS = [
  { key: 'calc', label: '保护区计算器', icon: Calculator },
  { key: 'preset', label: '预设水源地', icon: MapPin },
  { key: 'empirical', label: '经验值参考', icon: BookOpen },
  { key: 'medium', label: '介质参数', icon: Layers },
] as const;
export type SubTabKey = typeof SUB_TABS[number]['key'];
