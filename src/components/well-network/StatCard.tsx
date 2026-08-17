import type { ElementType } from 'react';

export function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: ElementType;
  color: string;
}) {
  return (
    <div className="px-2 py-2 rounded-lg bg-gw-surface/20 border border-gw-border/10 flex items-center gap-2">
      <Icon size={14} style={{ color }} />
      <div>
        <div className="text-[13px] font-bold font-mono" style={{ color }}>{value}</div>
        <div className="text-[8px] text-gw-muted/60">{label}</div>
      </div>
    </div>
  );
}

// ── 实时状态徽章 ──

