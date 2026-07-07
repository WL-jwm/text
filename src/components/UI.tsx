import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ExternalLink, ChevronDown, Copy, Check, AlertTriangle, CornerDownLeft, Database } from 'lucide-react';
import type { SearchResult } from '../data/searchIndex';

// ── 页面标题 ──
export function SectionTitle({ children, icon: Icon, badge }: { children: React.ReactNode; icon?: React.ElementType; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={18} className="text-gw-cyan" />}
      <h2 className="text-lg font-bold text-gw-text">{children}</h2>
      {badge && <span className="px-2 py-0.5 rounded text-[10px] bg-gw-blue/15 text-gw-cyan border border-gw-blue/20">{badge}</span>}
    </div>
  );
}

// ── 科技卡片 ──
export function TechCard({ title, children, badge, className = '', icon: CardIcon, glow }: { title?: string; children: React.ReactNode; badge?: string; className?: string; icon?: React.ElementType; glow?: boolean }) {
  return (
    <div className={`rounded-xl bg-gw-card/80 backdrop-blur-sm border border-gw-border/60 p-4 md:p-5 space-y-3 ${glow ? 'card-glow' : ''} ${className}`}>
      {(title || badge || CardIcon) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {CardIcon && <CardIcon size={16} className="text-gw-cyan flex-shrink-0" />}
            {title && <h3 className="text-sm font-medium text-gw-text">{title}</h3>}
          </div>
          {badge && <span className="px-2 py-0.5 rounded text-[10px] bg-gw-blue/15 text-gw-cyan border border-gw-blue/20">{badge}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── 统计卡片 ──
export function StatCard({ title, value, unit, accent = 'blue', subtitle, icon: CardIcon }: { title: string; value: string | number; unit?: string; accent?: string; subtitle?: string; icon?: React.ElementType }) {
  const accentMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    red: 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20',
    green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
  };
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

// ── 全局搜索 ──
export function GlobalSearch({ placeholder = '搜索...', onSelect, onSearch }: { placeholder?: string; onSelect?: () => void; onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    setQuery(q);
    setActiveIndex(-1);
    if (onSearch) onSearch(q);
    if (q.length < 1) { setResults([]); return; }
    try {
      const mod = await import('../data/searchIndex');
      const idx = mod.searchIndex;
      const matched = idx.filter((item: SearchResult) =>
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.keywords.toLowerCase().includes(q.toLowerCase()) ||
        item.category.toLowerCase().includes(q.toLowerCase())
      );
      setResults(matched.slice(0, 10));
      setOpen(true);
    } catch { /* ignore */ }
  }, [onSearch]);

  // Ctrl+K / Cmd+K to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
      return;
    }
    if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      const r = results[activeIndex];
      setOpen(false);
      setQuery('');
      if (onSelect) onSelect();
      // Navigate
      const nav = (window as unknown as Record<string, unknown>).__navigate as ((path: string) => void) | undefined;
      if (nav) nav(r.path);
      else window.location.hash = r.path;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gw-surface/60 border border-gw-border/50 focus-within:border-gw-blue/40 transition-colors">
        <Search size={14} className="text-gw-muted/50 flex-shrink-0" />
        <input ref={inputRef} value={query} onChange={e => doSearch(e.target.value)}
          onKeyDown={handleKeyDown} onFocus={() => { if (query.length > 0 && results.length > 0) setOpen(true); }}
          placeholder={placeholder}
          className="bg-transparent text-xs text-gw-text placeholder:text-gw-muted/40 outline-none w-full" />
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] text-gw-muted/30 border border-gw-border/30 bg-gw-surface/40 font-mono">
          Ctrl+K
        </kbd>
      </div>
      {open && results.length > 0 && (
        <div role="listbox" aria-label="搜索结果" className="absolute top-full mt-1 left-0 right-0 bg-gw-card border border-gw-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-1.5 border-b border-gw-border/40 flex items-center justify-between">
            <span className="text-[9px] text-gw-muted/40">{results.length} 个结果</span>
            <div className="flex items-center gap-2 text-[9px] text-gw-muted/30">
              <span className="flex items-center gap-0.5"><CornerDownLeft size={9} /> 选择</span>
              <span>↑↓ 导航</span>
              <span>Esc 关闭</span>
            </div>
          </div>
          {results.map((r, i) => (
            <button role="option" aria-selected={i === activeIndex} key={r.id} onClick={() => { setOpen(false); setQuery(''); if (onSelect) onSelect(); }}
              className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors text-left ${
                i === activeIndex ? 'bg-gw-blue/10 border-l-2 border-gw-blue' : 'hover:bg-gw-surface/60 border-l-2 border-transparent'
              }`}>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono ${i === activeIndex ? 'text-gw-cyan' : 'text-gw-muted/30'}`}>{i + 1}</span>
                <div>
                  <div className="text-xs text-gw-text">{r.title}</div>
                  <div className="text-[10px] text-gw-muted/60">{r.category}{r.keywords ? ` — ${r.keywords}` : ''}</div>
                </div>
              </div>
              <ExternalLink size={12} className="text-gw-muted/30 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 导出按钮 ──
export function ExportButton({ onClick, label = '导出' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-xs bg-gw-surface/60 text-gw-muted hover:text-gw-cyan border border-gw-border/50 hover:border-gw-cyan/30 transition-all">
      {label}
    </button>
  );
}

// ── 表格 ──
export function TechTable({ headers, rows, highlightOnHover = true, pageSize = 0, showRowNumbers = false, title }: {
  headers: string[]; rows: (string | number | null | undefined)[][]; highlightOnHover?: boolean;
  pageSize?: number; showRowNumbers?: boolean; title?: string;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const effectivePageSize = pageSize > 0 ? pageSize : rows.length;
  const totalPages = Math.max(1, Math.ceil(rows.length / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRows = pageSize > 0 ? rows.slice((safeCurrentPage - 1) * effectivePageSize, safeCurrentPage * effectivePageSize) : rows;
  const startIdx = (safeCurrentPage - 1) * effectivePageSize;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gw-muted/50">
        <Database size={32} strokeWidth={1} className="mb-3 opacity-30" />
        <p className="text-xs">{title ? `${title} — ` : ''}暂无数据</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-gw-muted">{title}</h4>
          <span className="text-[10px] text-gw-muted/40 font-mono">{rows.length} 条记录</span>
        </div>
      )}
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-sm min-w-[600px]"><caption className="sr-only">{title || '数据表格'}</caption>
          <thead>
            <tr className="border-b border-gw-border/80">
              {showRowNumbers && <th scope="col" className="text-center text-gw-muted/40 py-2.5 px-2 text-[10px] font-mono w-10">#</th>}
              {headers.map((h, i) => (
                <th key={i} scope="col" className="text-left text-gw-muted py-2.5 px-3 text-xs font-medium whitespace-nowrap uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, ri) => (
              <tr key={ri} className={`border-b border-gw-border/30 transition-colors ${highlightOnHover ? 'hover:bg-gw-surface/40' : ''}`}>
                {showRowNumbers && <td className="text-center text-gw-muted/30 py-2 px-2 text-[10px] font-mono">{startIdx + ri + 1}</td>}
                {row.map((cell, ci) => (
                  <td key={ci} className={`py-2 px-3 whitespace-nowrap ${ci === 0 ? 'text-gw-text font-medium' : ci >= 1 && ci <= 2 ? 'font-mono text-xs text-gw-cyan' : 'text-gw-muted'}`}>
                    {cell ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-gw-muted/40 font-mono">
            {startIdx + 1}-{Math.min(startIdx + effectivePageSize, rows.length)} / {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-2 py-0.5 rounded text-[10px] text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${p === safeCurrentPage ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50'}`}>
                  {p}
                </button>
              ))
            ) : (
              <>
                <button onClick={() => setCurrentPage(1)} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${safeCurrentPage === 1 ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text'}`}>1</button>
                {safeCurrentPage > 3 && <span className="text-[10px] text-gw-muted/30">...</span>}
                {Array.from({ length: 5 }, (_, i) => safeCurrentPage - 2 + i).filter(p => p > 1 && p < totalPages).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${p === safeCurrentPage ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50'}`}>
                    {p}
                  </button>
                ))}
                {safeCurrentPage < totalPages - 2 && <span className="text-[10px] text-gw-muted/30">...</span>}
                <button onClick={() => setCurrentPage(totalPages)} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${safeCurrentPage === totalPages ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text'}`}>{totalPages}</button>
              </>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="px-2 py-0.5 rounded text-[10px] text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export function CollapsiblePanel({ title, children, defaultOpen = false, icon, badge, className = '' }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
  icon?: React.ElementType; badge?: string; className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const IconComp = icon;
  return (
    <div className={`rounded-xl bg-gw-card/80 backdrop-blur-sm border border-gw-border/60 overflow-hidden ${className}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm text-gw-text hover:bg-gw-surface/40 transition-colors group">
        <span className="flex items-center gap-2 font-medium">
          {IconComp && <IconComp size={15} className="text-gw-cyan/70" />}
          {title}
          {badge && <span className="px-1.5 py-0.5 rounded text-[10px] bg-gw-blue/15 text-gw-highlight border border-gw-blue/20">{badge}</span>}
        </span>
        <ChevronDown size={16} className={`text-gw-muted fold-toggle ${open ? '' : 'fold-closed'}`} />
      </button>
      <div className={`collapse-content ${open ? 'collapse-open' : 'collapse-closed'}`}>
        <div className="px-4 pb-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

// ── 标签筛选 ──
export function TagFilter({ tags, activeTag, onTagChange }: { tags: string[]; activeTag: string; onTagChange: (tag: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.map(tag => (
        <button key={tag} onClick={() => onTagChange(tag)}
          className={`px-2.5 py-1 rounded-md text-xs transition-all border ${
            activeTag === tag
              ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
              : 'text-gw-muted border-transparent hover:text-gw-text hover:bg-gw-surface/50'
          }`}>
          {tag}
        </button>
      ))}
    </div>
  );
}

// ── 图表提示 ──
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Record<string, unknown>[];
  label?: string;
  /** 显示单位（追加在数值后） */
  unit?: string;
  /** 百分比精度（设为数字则显示%） */
  percentDigits?: number;
  /** 自定义标签标题 */
  title?: string;
  /** 额外底部信息行 */
  footer?: string;
  /** 数据字段映射：{ dataKey: displayName } */
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

// ── 复制按钮 ──
export function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-gw-muted hover:text-gw-cyan transition-colors">
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? '已复制' : label}
    </button>
  );
}

// ── 空状态 ──
export function EmptyState({ message = '暂无数据' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gw-muted/40">
      <AlertTriangle size={32} className="mb-2" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

// ── 数据来源标注 ──
export function DataSourceNote({ source, version }: { source: string; version?: string }) {
  return (
    <div className="text-[10px] text-gw-muted/30 flex items-center gap-2 mt-4">
      <span>数据来源: {source}</span>
      {version && <span className="px-1.5 py-0.5 rounded bg-gw-surface/40 text-gw-muted/40 font-mono">{version}</span>}
    </div>
  );
}

// ── 分割线 ──
export function Divider() {
  return <div className="border-t border-gw-border/40 my-2" />;
}

// ── 图表配色 ──
export const CHART_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

// ── 可排序表格 SortableTechTable ──
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

// ── 可展开行 ExpandableRow ──
export function ExpandableRow({
  label,
  summary,
  detail,
  defaultExpanded = false,
}: {
  label: string;
  summary: string;
  detail: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div className="border border-gw-border/30 rounded-lg mb-2 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gw-surface/50 hover:bg-gw-accent/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`text-gw-accent transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className="font-medium text-gw-text">{label}</span>
          <span className="text-xs text-gw-muted">{summary}</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 py-3 border-t border-gw-border/20 bg-gw-surface/30 animate-fadeIn">
          {detail}
        </div>
      )}
    </div>
  );
}

// ── 进度标签 ProgressBadge ──
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

// ── 统计指标卡 CompactMetric ──
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

// ── 数据摘要卡片 DataSummaryCard ──
export function DataSummaryCard({
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
}

// ── 对比高亮数字 DiffNumber ──
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

// ── 键值对展示 InfoGrid ──
export function InfoGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: React.ReactNode; highlight?: boolean }[];
  columns?: 2 | 3 | 4;
}) {
  const gridCols = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div className={`grid ${gridCols} gap-x-6 gap-y-2`}>
      {items.map((item, i) => (
        <div key={i}>
          <div className="text-[10px] text-gw-muted">{item.label}</div>
          <div className={`text-sm ${item.highlight ? 'text-gw-accent font-medium' : 'text-gw-text'}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

