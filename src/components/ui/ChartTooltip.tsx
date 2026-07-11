import React from 'react';

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Record<string, unknown>[];
  label?: string;
  unit?: string;
  percentDigits?: number;
  title?: string;
  footer?: string;
  labelMap?: Record<string, string>;
}

export function ChartTooltip({ active, payload, label, unit, percentDigits, title, footer, labelMap }: ChartTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="bg-gw-card/95 backdrop-blur-md border border-gw-border rounded-lg p-3 shadow-xl min-w-[140px]">
      {(title || label) && <div className="text-xs text-gw-muted mb-1.5 font-medium">{title || label}</div>}
      {payload.map((entry: Record<string, unknown>, i: number) => {
        const e = entry as { value: unknown; dataKey: string; name: string; color: string };
        const raw = e.value;
        const displayLabel = labelMap ? (labelMap[e.dataKey] || e.name) : e.name;
        let displayValue: string;
        if (typeof raw !== 'number') {
          displayValue = String(raw ?? '—');
        } else if (percentDigits !== undefined) {
          displayValue = raw.toFixed(percentDigits) + '%';
        } else if (unit) {
          displayValue = raw.toLocaleString(undefined, { maximumFractionDigits: 2 }) + unit;
        } else {
          displayValue = raw.toLocaleString(undefined, { maximumFractionDigits: 2 })
        }
        return (
          <div key={i} className="flex items-center gap-2 text-xs py-0.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
            <span className="text-gw-muted">{displayLabel}:</span>
            <span className="text-gw-text font-medium ml-auto">{displayValue}</span>
          </div>
        );
      })}
      {footer && <div className="text-[10px] text-gw-muted/60 mt-1.5 pt-1.5 border-t border-gw-border/50">{footer}</div>}
    </div>
  );
}
