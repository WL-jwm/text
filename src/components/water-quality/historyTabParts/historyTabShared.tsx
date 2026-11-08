/**
 * 拆分自 WaterQualityHistoryTab.tsx — 类型、常量与共享辅助组件
 */
import { TrendingDown, Minus, TrendingUp } from 'lucide-react';

export interface FactorTrend {
  factor: string;
  classes: number[];       // Pi mapped to class number per snapshot
  trend: 'improved' | 'stable' | 'worsened' | null;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

export const CLASS_LABELS: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

export const CLASS_BG: Record<number, string> = {
  1: 'bg-emerald-500/15 text-emerald-400',
  2: 'bg-blue-500/15 text-blue-400',
  3: 'bg-cyan-500/15 text-cyan-400',
  4: 'bg-amber-500/15 text-amber-400',
  5: 'bg-red-500/15 text-red-400',
};

export const TREND_CONFIG = {
  improved: { icon: TrendingDown, label: '改善', color: 'text-emerald-400' },
  stable: { icon: Minus, label: '稳定', color: 'text-blue-400' },
  worsened: { icon: TrendingUp, label: '恶化', color: 'text-red-400' },
} as const;

export function piToClass(pi: number): number {
  if (pi <= 1) return 1;
  if (pi <= 2) return 2;
  if (pi <= 3) return 3;
  if (pi <= 5) return 4;
  return 5;
}

// ═══════════════════════════════════════════════════════
// Helper: trend icon
// ═══════════════════════════════════════════════════════

export function TrendBadge({ trend }: { trend: 'improved' | 'stable' | 'worsened' | null }) {
  if (!trend) return <span className="text-gw-muted/50 text-[10px]">--</span>;
  const cfg = TREND_CONFIG[trend];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}
