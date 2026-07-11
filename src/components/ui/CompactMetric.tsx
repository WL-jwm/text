import React from 'react';

export function CompactMetric({
  label,
  value,
  unit,
  trend,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: React.ReactNode;
}) {
  const trendColor = trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-gw-muted';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gw-surface/40 rounded-lg border border-gw-border/20">
      {icon && <div className="text-gw-accent/70">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-gw-muted truncate">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gw-text font-mono">{value}</span>
          {unit && <span className="text-[10px] text-gw-muted">{unit}</span>}
        </div>
      </div>
      {trend && <span className={`${trendColor} text-sm font-mono`}>{trendIcon}</span>}
    </div>
  );
}
