/**
 * 拆分自 DecisionSupportTab.tsx — 通用 UI 小组件
 */

import { WARNING_COLORS } from './decisionSupportConstants';

export function InputCell({
  label, value, onChange, unit, step,
}: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gw-muted mb-0.5">{label}{unit ? ` (${unit})` : ''}</label>
      <input
        type="number" step={step ?? 1} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
      />
    </div>
  );
}
export function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
export function WarningBadge({ level }: { level: string }) {
  const color = WARNING_COLORS[level] ?? '#64748b';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{ background: `${color}25`, color, border: `1px solid ${color}60`, boxShadow: `0 0 12px ${color}30` }}
    >
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {level}预警
    </span>
  );
}
export function RankBadge({ rank }: { rank: number }) {
  const colors = ['#f59e0b', '#94a3b8', '#b45309', '#64748b'];
  const bg = rank <= 3 ? colors[rank - 1] : colors[3];
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white"
      style={{ background: `${bg}` }}
    >
      {rank}
    </span>
  );
}
