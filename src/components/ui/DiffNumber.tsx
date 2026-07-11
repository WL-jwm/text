import React from 'react';

export function DiffNumber({
  value,
  baseline,
  suffix,
  inverseColor = false,
}: {
  value: number;
  baseline: number;
  suffix?: string;
  inverseColor?: boolean;
}) {
  const diff = value - baseline;
  const pct = baseline !== 0 ? ((diff / Math.abs(baseline)) * 100) : 0;
  const isPositive = diff > 0;
  const isNegative = diff < 0;

  const colorClass = inverseColor
    ? (isPositive ? 'text-red-400' : isNegative ? 'text-green-400' : 'text-gw-muted')
    : (isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gw-muted');

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono font-bold text-gw-text">{value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}</span>
      {suffix && <span className="text-xs text-gw-muted">{suffix}</span>}
      {diff !== 0 && (
        <span className={`text-[10px] font-mono ${colorClass}`}>
          ({isPositive ? '+' : ''}{pct.toFixed(1)}%)
        </span>
      )}
    </span>
  );
}
