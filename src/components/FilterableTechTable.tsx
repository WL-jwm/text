import React, { useState, useMemo, useDeferredValue, useTransition } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TechTable } from './UI';

/**
 * FilterableTechTable - 带搜索过滤的TechTable
 * 在表格上方添加搜索框，实时过滤表格数据
 * 
 * Usage:
 *   <FilterableTechTable
 *     headers={['名称', '位置', '值']}
 *     rows={data.map(d => [d.name, d.location, d.value])}
 *     filterPlaceholder="搜索名称..."
 *   />
 */
export function FilterableTechTable({
  headers,
  rows,
  pageSize = 10,
  filterPlaceholder = '搜索...',
  className = '',
}: {
  headers: string[];
  rows: (string | number | null | undefined)[][];
  pageSize?: number;
  filterPlaceholder?: string;
  className?: string;
}) {
  const [filterText, setFilterText] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredFilter = useDeferredValue(filterText);

  const filteredRows = useMemo(() => {
    if (!deferredFilter.trim()) return rows;
    const lowerFilter = deferredFilter.toLowerCase();
    return rows.filter(row =>
      row.some(cell =>
        cell !== null && cell !== undefined && String(cell).toLowerCase().includes(lowerFilter)
      )
    );
  }, [rows, deferredFilter]);

  return (
    <div className={className}>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted/40" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => startTransition(() => setFilterText(e.target.value))}
            placeholder={filterPlaceholder}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-xs text-gw-text placeholder:text-gw-muted/40 focus:outline-none focus:border-gw-blue/40 focus:ring-1 focus:ring-gw-blue/20 transition-all"
            aria-label={filterPlaceholder}
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gw-muted/40 hover:text-gw-muted transition-colors"
              title="清除搜索"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {filterText && (
          <span className="text-[10px] text-gw-muted/50 whitespace-nowrap">
            {filteredRows.length}/{rows.length} 条
          </span>
        )}
        <Filter size={13} className="text-gw-muted/30 flex-shrink-0" />
      </div>

      {/* Table */}
      <TechTable headers={headers} rows={filteredRows} pageSize={pageSize} />
    </div>
  );
}
