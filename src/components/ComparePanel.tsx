import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';

export interface CompareColumn {
  title: string;
  items: { label: string; value: string | number; unit?: string; highlight?: boolean }[];
}

interface ComparePanelProps {
  columns: CompareColumn[];
  title?: string;
  caption?: string;
}

/**
 * 数据对比面板 - 支持2~4列数据并排对比
 * 用于跨区域、跨类型、跨时段数据比较
 */
export function ComparePanel({ columns, title = '数据对比', caption }: ComparePanelProps) {
  const [expanded, setExpanded] = useState(true);

  // Determine max items across all columns
  const maxRows = useMemo(() => Math.max(...columns.map(c => c.items.length)), [columns]);

  return (
    <div className="card-glow bg-gw-card rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gw-surface/50 hover:bg-gw-surface/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ArrowLeftRight size={14} className="text-gw-cyan" />
          <span className="text-sm font-medium text-gw-text">{title}</span>
          {caption && <span className="text-[10px] text-gw-muted ml-2">{caption}</span>}
        </div>
        {expanded ? <ChevronUp size={14} className="text-gw-muted" /> : <ChevronDown size={14} className="text-gw-muted" />}
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-2 px-2 w-32 font-medium">指标</th>
                {columns.map((col, i) => (
                  <th key={i} className="text-center text-gw-text py-2 px-3 font-semibold whitespace-nowrap">
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }, (_, rowIdx) => {
                // Use label from first column that has this row
                const labelItem = columns.find(c => c.items[rowIdx])?.items[rowIdx];
                return (
                  <tr key={rowIdx} className="border-b border-gw-border/30 hover:bg-gw-surface/30">
                    <td className="py-1.5 px-2 text-gw-muted">{labelItem?.label || '-'}</td>
                    {columns.map((col, colIdx) => {
                      const item = col.items[rowIdx];
                      return (
                        <td key={colIdx} className={`py-1.5 px-3 text-center font-mono ${item?.highlight ? 'text-gw-cyan font-semibold' : 'text-gw-text'}`}>
                          {item ? `${item.value}${item.unit ? ` ${item.unit}` : ''}` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * 统计卡片行 - 紧凑型水平排列统计指标
 */
export function StatRow({ items }: { items: { label: string; value: string | number; unit?: string; accent?: string; icon?: React.ElementType }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
      {items.map((item, i) => (
        <div key={i} className={`p-3 rounded-lg border bg-gw-surface/50 border-gw-border/30`}>
          <p className="text-[10px] text-gw-muted">{item.label}</p>
          <p className="text-sm font-mono font-bold text-gw-text mt-0.5">
            {item.value}<span className="text-[10px] text-gw-muted ml-0.5">{item.unit || ''}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * 进度条指标 - 带目标值的进度展示
 */
export function ProgressMetric({ label, value, max, unit = '', color = 'cyan', targetLabel }: {
  label: string; value: number; max: number; unit?: string; color?: string;
  targetLabel?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colorMap: Record<string, { bar: string; text: string }> = {
    cyan: { bar: 'bg-gradient-to-r from-cyan-500 to-cyan-300', text: 'text-cyan-400' },
    blue: { bar: 'bg-gradient-to-r from-blue-500 to-blue-300', text: 'text-blue-400' },
    emerald: { bar: 'bg-gradient-to-r from-emerald-500 to-emerald-300', text: 'text-emerald-400' },
    amber: { bar: 'bg-gradient-to-r from-amber-500 to-amber-300', text: 'text-amber-400' },
    red: { bar: 'bg-gradient-to-r from-red-500 to-red-300', text: 'text-red-400' },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gw-muted">{label}</span>
        <span className={`font-mono ${c.text}`}>{value.toLocaleString()}{unit}</span>
      </div>
      <div className="h-2 bg-gw-surface rounded-full overflow-hidden">
        <div className={`h-full ${c.bar} rounded-full progress-bar`} style={{ width: `${pct}%` }} />
      </div>
      {targetLabel && <p className="text-[10px] text-gw-muted/60 mt-0.5">{targetLabel}</p>}
    </div>
  );
}
