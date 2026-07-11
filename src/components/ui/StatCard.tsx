import React from 'react';

const accentMap: Record<string, string> = {
  blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
  cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
  emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
  red: 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20',
  green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20',
  purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
};

export function StatCard({ title, value, unit, accent = 'blue', subtitle, icon: CardIcon }: { title: string; value: string | number; unit?: string; accent?: string; subtitle?: string; icon?: React.ElementType }) {
  const cls = accentMap[accent] || accentMap.blue;
  return (
    <div className={`rounded-xl bg-gradient-to-br ${cls} border p-3 md:p-4`}>
      <div className="text-[10px] md:text-xs text-gw-muted flex items-center gap-1.5">
        {CardIcon && <CardIcon size={12} className="flex-shrink-0 opacity-60" />}
        {title}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-base md:text-xl font-bold">{value}</span>
        {unit && <span className="text-xs text-gw-muted">{unit}</span>}
      </div>
      {subtitle && <div className="text-[10px] text-gw-muted mt-1">{subtitle}</div>}
    </div>
  );
}
