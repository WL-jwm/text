import React from 'react';

export const DataSummaryCard = React.memo(function DataSummaryCard({
  title,
  icon,
  metrics,
  footer,
  accent = 'cyan',
}: {
  title: string;
  icon?: React.ReactNode;
  metrics: { label: string; value: string | number; unit?: string; highlight?: boolean }[];
  footer?: string;
  accent?: string;
}) {
  const accentColors: Record<string, string> = {
    cyan: 'border-cyan-500/30 bg-cyan-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    amber: 'border-amber-500/30 bg-amber-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
  };
  const cls = accentColors[accent] || accentColors.cyan;

  return (
    <div className={`rounded-lg border p-4 ${cls}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-gw-accent">{icon}</span>}
        <h4 className="text-sm font-semibold text-gw-text">{title}</h4>
      </div>
      <div className="space-y-2">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-gw-muted">{m.label}</span>
            <span className={`text-sm font-mono ${m.highlight ? 'text-gw-accent font-bold' : 'text-gw-text'}`}>
              {m.value}{m.unit && <span className="text-[10px] text-gw-muted ml-0.5">{m.unit}</span>}
            </span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-2 pt-2 border-t border-gw-border/20 text-[10px] text-gw-muted">{footer}</div>}
    </div>
  );
});
