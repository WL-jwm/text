/**
 * 共享常量与类型（拆分自 EcosystemServiceTab.tsx）
 */
import { calculateEcosystemService } from '../../../utils/ecosystemServiceEvaluator';
import { Leaf, Wind, Mountain, Droplets, TrendingUp, BookOpen, TrendingDown } from 'lucide-react';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};
export const TABS = [
  { key: 'overview', label: '服务总览', icon: Leaf },
  { key: 'supply', label: '供给服务', icon: Droplets },
  { key: 'regulation', label: '调节服务', icon: Wind },
  { key: 'cultural', label: '文化服务', icon: Mountain },
  { key: 'demand', label: '生态需水', icon: TrendingDown },
  { key: 'transfer', label: '价值转移', icon: TrendingUp },
  { key: 'ref', label: '参考说明', icon: BookOpen },
] as const;
export type TabKey = typeof TABS[number]['key'];
export const CATEGORY_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
export type EcosystemServiceResult = ReturnType<typeof calculateEcosystemService>;
