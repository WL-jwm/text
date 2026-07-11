import React from 'react';

export function ProgressBadge({
  value,
  max = 100,
  label,
  size = 'sm',
  color,
}: {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barHeight = size === 'lg' ? 'h-3' : size === 'md' ? 'h-2' : 'h-1.5';
  const textSize = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-[10px]';
  const barColor = color || (pct >= 80 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#10b981');

  return (
    <div className="flex items-center gap-2">
      {label && <span className={`${textSize} text-gw-text/70 whitespace-nowrap`}>{label}</span>}
      <div className={`flex-1 ${barHeight} bg-gw-border/30 rounded-full overflow-hidden min-w-[60px]`}>
        <div
          className={`${barHeight} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className={`${textSize} font-mono text-gw-text/80 min-w-[36px] text-right`}>{pct.toFixed(0)}%</span>
    </div>
  );
}
