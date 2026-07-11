import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ExternalLink, CornerDownLeft } from 'lucide-react';
import type { SearchResult } from '../../data/searchIndex';

export function GlobalSearch({ placeholder = '搜索...', onSelect, onSearch }: { placeholder?: string; onSelect?: () => void; onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const doSearch = useCallback(async (q: string) => {
    setQuery(q);
    setActiveIndex(-1);
    if (onSearch) onSearch(q);
    if (q.length < 1) { setResults([]); return; }
    try {
      const mod = await import('../../data/searchIndex');
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
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => Math.min(prev + 1, results.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => Math.max(prev - 1, -1)); return; }
    if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      const r = results[activeIndex];
      setOpen(false); setQuery('');
      if (onSelect) onSelect();
      navigate(r.path);
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
