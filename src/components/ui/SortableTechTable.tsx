import React from 'react';

export function SortableTechTable({
  headers,
  rows,
  sortColumn,
  sortDirection,
  onSort,
  highlightColumn,
  className = '',
}: {
  headers: string[];
  rows: (string | number | null | undefined)[][];
  sortColumn?: number | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (col: number) => void;
  highlightColumn?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto scrollbar-none ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gw-border/40">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-3 py-2 text-left text-xs font-semibold text-gw-muted whitespace-nowrap ${
                  onSort ? 'cursor-pointer hover:text-gw-accent transition-colors select-none' : ''
                } ${highlightColumn === i ? 'text-gw-accent' : ''}`}
                onClick={() => onSort?.(i)}
              >
                <span className="inline-flex items-center gap-1">
                  {h}
                  {sortColumn === i && (
                    <span className="text-gw-accent text-[10px]">
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                  {onSort && sortColumn !== i && (
                    <span className="text-gw-muted/40 text-[10px]">⇅</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-gw-border/20 data-row-enter hover:bg-gw-accent/5 transition-colors">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-2 whitespace-nowrap ${
                    highlightColumn === ci
                      ? 'text-gw-accent font-medium'
                      : ci === 0
                        ? 'font-medium text-gw-text'
                        : 'text-gw-text/80'
                  }`}
                >
                  {cell ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
