/**
 * 共享常量与类型（拆分自 MineHydrogeology.tsx）
 */
import { Mountain, Droplets, AlertTriangle, Layers, HardHat, Leaf, BarChart3, BookOpen, Calculator } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'mines', label: '矿区特征', icon: Mountain },
  { key: 'statistics', label: '排水统计', icon: BarChart3 },
  { key: 'inrush', label: '突水事故', icon: AlertTriangle },
  { key: 'classification', label: '分类标准', icon: Layers },
  { key: 'impact', label: '排水影响', icon: AlertTriangle },
  { key: 'utilization', label: '矿坑水利用', icon: Droplets },
  { key: 'restoration', label: '生态修复', icon: Leaf },
  { key: 'complexity', label: '复杂度分级', icon: HardHat },
  { key: 'classic', label: '坝基工程', icon: BookOpen },
  { key: 'inflow_calc', label: '涌水量预测', icon: Calculator },
] as const;

export type TabKey = typeof TABS[number]['key'];

export const UTILIZATION_COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];
