import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, EyeOff, ChevronDown } from 'lucide-react';

/**
 * TechTableFilterable - 带搜索过滤和列可见性切换的增强表格
 * 包装 TechTable，不修改原组件
 */
interface TechTableFilterableProps {
  headers: string[];
  rows: (string | number | null | undefined)[][];
  pageSize?: number;
  title?: string;
  showRowNumbers?: boolean;
  searchable?: boolean;          // 是否启用搜索
  filterable?: boolean;           // 是否启用列筛选
  defaultVisibleCols?: number;    // 默认显示列数(从左开始)
}

export function TechTableFilterable({
  headers,
  rows,
  pageSize = 10,
  title: _title,
  showRowNumbers = false,
  searchable = true,
  filterable = true,
  defaultVisibleCols,
}: TechTableFilterableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [visibleCols, setVisibleCols] = useState<boolean[]>(
    () => {
      if (defaultVisibleCols) {
        return headers.map((_, i) => i < defaultVisibleCols);
      }
      return headers.map(() => true);
    }
  );

  // 切换列可见性
  const toggleCol = (idx: number) => {
    setVisibleCols(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      // 至少保留1列
      if (next.every(v => !v)) next[0] = true;
      return next;
    });
  };

  // 全选/全不选
  const toggleAll = () => {
    const allVisible = visibleCols.every(v => v);
    setVisibleCols(headers.map(() => !allVisible));
  };

  // 过滤行(搜索)
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(row =>
      row.some(cell => String(cell ?? '').toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  // 过滤列
  const filteredHeaders = useMemo(() =>
    headers.filter((_, i) => visibleCols[i]),
    [headers, visibleCols]
  );

  const filteredRowsCols = useMemo(() =>
    filteredRows.map(row =>
      row.filter((_, i) => visibleCols[i])
    ),
    [filteredRows, visibleCols]
  );

  const visibleCount = visibleCols.filter(v => v).length;

  return (
    <div className="space-y-2">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* 搜索框 */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gw-muted" />
              <input
                type="text"
                placeholder="搜索表格..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-gw-surface/50 border border-gw-border/40 rounded-lg text-gw-text placeholder-gw-muted/50 focus:outline-none focus:border-gw-blue/50 focus:ring-1 focus:ring-gw-blue/20 w-48 transition-all"
              />
              {searchQuery && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gw-muted bg-gw-surface px-1.5 py-0.5 rounded">
                  {filteredRows.length}/{rows.length}
                </span>
              )}
            </div>
          )}

          {/* 列筛选按钮 */}
          {filterable && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                showFilterPanel
                  ? 'bg-gw-blue/10 border-gw-blue/30 text-gw-cyan'
                  : 'border-gw-border/40 text-gw-muted hover:text-gw-text hover:border-gw-border'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              列 ({visibleCount}/{headers.length})
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {searchQuery && filteredRows.length === 0 && (
          <span className="text-xs text-gw-muted">无匹配结果</span>
        )}
      </div>

      {/* 列筛选面板 */}
      {showFilterPanel && (
        <div className="p-3 bg-gw-surface/50 border border-gw-border/30 rounded-lg animate-[slideDown_0.15s_ease-out]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gw-muted">显示/隐藏列</span>
            <button
              onClick={toggleAll}
              className="text-[10px] text-gw-cyan hover:text-gw-highlight transition-colors"
            >
              {visibleCount === headers.length ? '全不选' : '全选'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {headers.map((h, i) => (
              <button
                key={i}
                onClick={() => toggleCol(i)}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded border transition-all ${
                  visibleCols[i]
                    ? 'bg-gw-blue/10 border-gw-blue/30 text-gw-text'
                    : 'bg-gw-surface border-gw-border/20 text-gw-muted line-through opacity-50'
                }`}
              >
                {visibleCols[i] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 表格 - 使用简单的内联表格而非TechTable，因为行数据已过滤 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gw-border">
              {showRowNumbers && <th className="text-left text-gw-muted py-2 px-3 w-8">#</th>}
              {filteredHeaders.map((h, i) => (
                <th key={i} className="text-left text-gw-muted py-2 px-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRowsCols.slice(0, pageSize).map((row, ri) => (
              <tr key={ri} className="border-b border-gw-border/30 hover:bg-gw-surface/30 transition-colors data-row">
                {showRowNumbers && <td className="py-2 px-3 text-gw-muted font-mono">{ri + 1}</td>}
                {row.map((cell, ci) => (
                  <td key={ci} className="py-2 px-3 text-gw-text whitespace-nowrap">{cell ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRowsCols.length > pageSize && (
          <div className="flex items-center justify-between py-2 px-3 text-[10px] text-gw-muted">
            <span>显示 {pageSize} / {filteredRowsCols.length} 行{searchQuery ? ' (已过滤)' : ''}</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(Math.ceil(filteredRowsCols.length / pageSize), 5) }).map((_, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 flex items-center justify-center rounded ${
                    i === 0 ? 'bg-gw-blue/20 text-gw-cyan' : 'text-gw-muted hover:text-gw-text cursor-pointer'
                  }`}
                >
                  {i + 1}
                </span>
              ))}
              {Math.ceil(filteredRowsCols.length / pageSize) > 5 && <span className="text-gw-muted">...</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
