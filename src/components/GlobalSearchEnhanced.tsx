/**
 * 升级版全局搜索组件 v2.0
 * v2.0 新增：
 *   - 搜索历史记录（localStorage持久化，最多20条）
 *   - 搜索结果缓存（避免重复查询）
 *   - 跨页面上下文保持（URL hash传递搜索词）
 *   - 搜索建议/热词提示
 *   - 搜索统计面板
 */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Search, CornerDownLeft, ExternalLink, X, Filter,
  BookOpen, MapPin, Droplets, AlertTriangle, Database,
  Layers, Wrench, Thermometer, Gem, Mountain, Waves,
  FlaskConical,  BarChart3, Briefcase,
  Clock, TrendingUp, RotateCcw, Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../data/searchIndex';

// ── 分类图标映射 ──
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '导航': <MapPin size={12} />,
  '概览数据': <Database size={12} />,
  '地下水资源': <Droplets size={12} />,
  '水质评价': <FlaskConical size={12} />,
  '水化学': <FlaskConical size={12} />,
  '背景值': <FlaskConical size={12} />,
  '水质标准': <BookOpen size={12} />,
  '系统分区': <Layers size={12} />,
  '基础地质': <Mountain size={12} />,
  '水源地': <MapPin size={12} />,
  '岩溶水': <Waves size={12} />,
  '裂隙水': <Waves size={12} />,
  '开采管理': <Wrench size={12} />,
  '超采治理': <AlertTriangle size={12} />,
  '地下水功能': <AlertTriangle size={12} />,
  '地下水漏斗': <AlertTriangle size={12} />,
  '地热': <Thermometer size={12} />,
  '地热田': <Thermometer size={12} />,
  '矿泉水': <Gem size={12} />,
  '咸水分布': <Droplets size={12} />,
  '咸水': <Droplets size={12} />,
  '盐碱地': <Layers size={12} />,
  '矿区水文': <Briefcase size={12} />,
  '矿床水文地质': <Briefcase size={12} />,
  '矿山水文地质': <Briefcase size={12} />,
  '环境地质': <AlertTriangle size={12} />,
  '地面沉降': <AlertTriangle size={12} />,
  '数据洞察': <BarChart3 size={12} />,
  '县级对比': <BarChart3 size={12} />,
  '工作台': <Briefcase size={12} />,
  '术语': <BookOpen size={12} />,
  '标准': <BookOpen size={12} />,
  '同位素': <FlaskConical size={12} />,
  '地图': <MapPin size={12} />,
  '空间地图': <MapPin size={12} />,
  '数据质量': <BarChart3 size={12} />,
  '历史参数': <BookOpen size={12} />,
  '地下水均衡': <Droplets size={12} />,
};

// ── 分类颜色映射 ──
const CATEGORY_COLORS: Record<string, string> = {
  '导航': '#3b82f6',
  '概览数据': '#06b6d4',
  '地下水资源': '#3b82f6',
  '水质评价': '#10b981',
  '水化学': '#10b981',
  '背景值': '#8b5cf6',
  '水质标准': '#8b5cf6',
  '系统分区': '#f59e0b',
  '基础地质': '#f97316',
  '水源地': '#3b82f6',
  '岩溶水': '#06b6d4',
  '裂隙水': '#06b6d4',
  '开采管理': '#f59e0b',
  '超采治理': '#ef4444',
  '地下水功能': '#ef4444',
  '地下水漏斗': '#ef4444',
  '地热': '#ec4899',
  '地热田': '#ec4899',
  '矿泉水': '#8b5cf6',
  '咸水分布': '#14b8a6',
  '咸水': '#14b8a6',
  '盐碱地': '#a855f7',
  '矿区水文': '#f97316',
  '矿床水文地质': '#f97316',
  '矿山水文地质': '#f97316',
  '环境地质': '#ef4444',
  '地面沉降': '#ef4444',
  '数据洞察': '#3b82f6',
  '县级对比': '#3b82f6',
  '工作台': '#64748b',
  '术语': '#64748b',
  '标准': '#64748b',
  '同位素': '#8b5cf6',
  '地图': '#06b6d4',
  '空间地图': '#06b6d4',
  '数据质量': '#10b981',
  '历史参数': '#f59e0b',
  '地下水均衡': '#3b82f6',
};

/** 热门搜索词 */
const HOT_SEARCHES = [
  '石家庄', '邯郸', '保定', '邢台', '唐山',
  '地下水资源量', '超采区', '岩溶水', '地热', '矿泉水',
  '水质评价', '含水层', '渗透系数', '给水度',
  '黑龙洞泉', '百泉', '滹沱河',
];

// ═══════════════════════════════════════════════════════════
// 搜索历史管理（localStorage）
// ═══════════════════════════════════════════════════════════

const HISTORY_KEY = 'gw-search-history';
const MAX_HISTORY = 20;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* ignore */ }
  return [];
}

function saveHistory(history: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

function addToHistory(keyword: string): void {
  const trimmed = keyword.trim();
  if (!trimmed || trimmed.length < 2) return;
  const history = loadHistory();
  const idx = history.indexOf(trimmed);
  if (idx >= 0) history.splice(idx, 1);
  history.unshift(trimmed);
  if (history.length > MAX_HISTORY) history.pop();
  saveHistory(history);
}

function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ═══════════════════════════════════════════════════════════
// 搜索结果缓存
// ═══════════════════════════════════════════════════════════

const CACHE_MAX = 50;
const searchCache = new Map<string, SearchResult[]>();

function getFromCache(query: string): SearchResult[] | undefined {
  return searchCache.get(query.toLowerCase());
}

function putToCache(query: string, results: SearchResult[]): void {
  const key = query.toLowerCase();
  if (searchCache.size >= CACHE_MAX) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }
  searchCache.set(key, results);
}

// ═══════════════════════════════════════════════════════════
// 跨页面上下文：URL hash传递搜索词
// ═══════════════════════════════════════════════════════════

const SEARCH_HASH_PREFIX = 'search=';

function getSearchFromHash(): string {
  const hash = window.location.hash;
  if (hash.startsWith('#' + SEARCH_HASH_PREFIX)) {
    return decodeURIComponent(hash.slice(SEARCH_HASH_PREFIX.length + 1));
  }
  return '';
}

function setSearchToHash(query: string): void {
  if (query.trim()) {
    window.location.hash = SEARCH_HASH_PREFIX + encodeURIComponent(query.trim());
  }
}

function clearSearchHash(): void {
  if (window.location.hash.startsWith('#' + SEARCH_HASH_PREFIX)) {
    window.location.hash = '';
  }
}

// ═══════════════════════════════════════════════════════════

interface GlobalSearchEnhancedProps {
  placeholder?: string;
  onSelect?: () => void;
  onSearch?: (query: string) => void;
}

export function GlobalSearchEnhanced({ placeholder = '搜索参数、区域、指标... (Ctrl+K)', onSelect, onSearch }: GlobalSearchEnhancedProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cacheHit, setCacheHit] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const indexLoadedRef = useRef(false);

  // ── 监听移动端搜索打开事件 ──
  useEffect(() => {
    const handler = () => {
      setMobileSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    };
    window.addEventListener('open-mobile-search', handler);
    return () => window.removeEventListener('open-mobile-search', handler);
  }, []);

  // ── 初始化：从hash恢复搜索词 + 加载历史 ──
  useEffect(() => {
    setSearchHistory(loadHistory());
    const hashQuery = getSearchFromHash();
    if (hashQuery) {
      doSearch(hashQuery);
    }
  }, []);

  // ── 监听hash变化（浏览器前进/后退） ──
  useEffect(() => {
    const handler = () => {
      const hashQuery = getSearchFromHash();
      if (hashQuery && hashQuery !== query) {
        doSearch(hashQuery);
      }
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, [query]);

  // ── 分类统计 ──
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [results]);

  // ── 按分类分组的结果 ──
  const groupedResults = useMemo(() => {
    const filtered = activeCategory
      ? results.filter(r => r.category === activeCategory)
      : results;
    const groups: Record<string, SearchResult[]> = {};
    filtered.forEach(r => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [results, activeCategory]);

  // ── 当前显示的总结果数 ──
  const totalDisplayed = useMemo(() => {
    return Object.values(groupedResults).reduce((s, arr) => s + arr.length, 0);
  }, [groupedResults]);

  // ── 搜索执行（带缓存） ──
  const doSearch = useCallback(async (q: string) => {
    setQuery(q);
    setActiveIndex(-1);
    setActiveCategory(null);
    setShowHistory(false);
    if (onSearch) onSearch(q);

    if (q.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    // 检查缓存
    const cached = getFromCache(q);
    if (cached) {
      setResults(cached);
      setOpen(true);
      setCacheHit(true);
      return;
    }

    setLoading(true);
    setCacheHit(false);

    try {
      // 动态导入搜索索引（仅首次）
      if (!indexLoadedRef.current) {
        await import('../data/searchIndex');
        indexLoadedRef.current = true;
      }
      const mod = await import('../data/searchIndex');
      const idx = mod.searchIndex as SearchResult[];
      const kw = q.toLowerCase();
      const matched = idx.filter((item: SearchResult) =>
        item.title.toLowerCase().includes(kw) ||
        item.keywords.toLowerCase().includes(kw) ||
        item.category.toLowerCase().includes(kw)
      );
      const sliced = matched.slice(0, 30);
      setResults(sliced);
      putToCache(q, sliced);
      setOpen(true);
      setSearchCount(prev => prev + 1);

      // 写入搜索历史
      addToHistory(q);
      setSearchHistory(loadHistory());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  // ── Ctrl+K / Cmd+K ──
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

  // ── 点击外部关闭 ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── 滚动到激活项 ──
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('[data-result-index]');
      const target = items[activeIndex] as HTMLElement | undefined;
      if (target) {
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // ── 导航 ──
  const navigateTo = (r: SearchResult) => {
    setOpen(false);
    // 保存搜索词到hash（跨页面上下文保持）
    if (query.trim()) {
      setSearchToHash(query);
    }
    if (onSelect) onSelect();
    navigate(r.path);
  };

  // ── 键盘事件 ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (activeCategory) { setActiveCategory(null); return; }
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, totalDisplayed - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
      return;
    }
    if (e.key === 'Enter') {
      // 从历史点击
      if (showHistory && activeIndex >= 0 && activeIndex < searchHistory.length) {
        doSearch(searchHistory[activeIndex]);
        return;
      }
      // 搜索结果导航
      if (activeIndex >= 0) {
        const flatResults = Object.values(groupedResults).flat();
        const r = flatResults[activeIndex];
        if (r) navigateTo(r);
      } else if (results.length > 0) {
        const flatResults = Object.values(groupedResults).flat();
        if (flatResults[0]) navigateTo(flatResults[0]);
      }
    }
  };

  // ── 关键词高亮 ──
  const highlightText = useCallback((text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const kw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp('(' + kw + ')', 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === kw.toLowerCase()
        ? <mark key={i} className="bg-amber-400/25 text-gw-text rounded-sm px-0.5">{part}</mark>
        : part
    );
  }, []);

  // ── 计算全局索引 ──
  const getFlatResults = useCallback(() => Object.values(groupedResults).flat(), [groupedResults]);

  // ── 聚焦时显示历史 ──
  const handleFocus = () => {
    if (results.length > 0) {
      setOpen(true);
    } else if (query.trim().length === 0 && searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  // ── 清空搜索 ──
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    setShowHistory(false);
    clearSearchHash();
    inputRef.current?.focus();
  };

  // ── 点击历史条目 ──
  const handleHistoryClick = (keyword: string) => {
    doSearch(keyword);
  };

  // ── 清空历史 ──
  const handleClearHistory = () => {
    clearHistory();
    setSearchHistory([]);
    setShowHistory(false);
  };

  return (
    <>
    {/* 移动端全屏搜索覆盖层 - 复用桌面搜索面板 */}
    {mobileSearchOpen && (
      <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-label="搜索">
        <div className="absolute inset-0 bg-gw-deep/95 backdrop-blur-md" onClick={() => setMobileSearchOpen(false)} />
        <div className="relative z-10 p-4 pt-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gw-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => doSearch(e.target.value)}
                placeholder="搜索参数、区域、指标..."
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-gw-surface border border-gw-border text-sm text-gw-text placeholder:text-gw-muted/50 outline-none focus:border-gw-blue/50 transition-colors"
                autoFocus
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gw-muted hover:text-gw-text">
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={() => { setMobileSearchOpen(false); setQuery(''); setResults([]); }} className="px-3 py-2 text-xs text-gw-muted hover:text-gw-text whitespace-nowrap">
              取消
            </button>
          </div>
          {/* 搜索结果面板 - 复用桌面端逻辑 */}
          {showHistory && !open && searchHistory.length > 0 && (
            <div className="bg-gw-card border border-gw-border rounded-lg shadow-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-gw-border/30 flex items-center justify-between">
                <span className="text-[9px] text-gw-muted/50 flex items-center gap-1">
                  <Clock size={10} /> 搜索历史 ({searchHistory.length})
                </span>
                <button onClick={() => { clearHistory(); setSearchHistory([]); setShowHistory(false); }} className="text-[9px] text-gw-muted/30 hover:text-red-400 flex items-center gap-0.5 transition-colors">
                  <Trash2 size={9} /> 清空
                </button>
              </div>
              {searchHistory.map((kw, i) => (
                <button key={i} onClick={() => { doSearch(kw); }} className="w-full px-3 py-1.5 text-left text-xs text-gw-muted hover:bg-gw-surface/50 flex items-center gap-2 transition-colors">
                  <RotateCcw size={10} className="text-gw-muted/30" />
                  {kw}
                </button>
              ))}
            </div>
          )}
          {!query && !showHistory && (
            <div className="bg-gw-card border border-gw-border rounded-lg shadow-xl overflow-hidden p-3">
              <p className="text-[9px] text-gw-muted/50 mb-2">热门搜索</p>
              <div className="flex flex-wrap gap-1.5">
                {HOT_SEARCHES.slice(0, 12).map(kw => (
                  <button key={kw} onClick={() => doSearch(kw)} className="px-2 py-1 rounded-md text-[10px] bg-gw-surface/50 text-gw-muted hover:text-gw-text hover:bg-gw-surface transition-colors">
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
          {open && results.length > 0 && (
            <div className="bg-gw-card border border-gw-border rounded-lg shadow-xl overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gw-border/30 flex items-center justify-between">
                <span className="text-[9px] text-gw-muted/50">{results.length} 个结果</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {results.slice(0, 20).map((r, i) => (
                  <button key={r.id} onClick={() => navigateTo(r)} className={`w-full px-3 py-2 text-left flex items-start gap-2 transition-colors ${i === activeIndex ? 'bg-gw-blue/10' : 'hover:bg-gw-surface/50'}`}>
                    <span className="mt-0.5 flex-shrink-0 opacity-50">{CATEGORY_ICONS[r.category] || <Database size={12} />}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gw-text truncate">{highlightText(r.title, query)}</p>
                      <p className="text-[9px] text-gw-muted/50 truncate mt-0.5">{r.category} · {r.keywords?.split(',').slice(0, 2).join(', ')}</p>
                    </div>
                    <span className="text-[8px] text-gw-muted/30 flex-shrink-0 mt-0.5">
                      <ExternalLink size={10} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {open && results.length === 0 && query && (
            <div className="bg-gw-card border border-gw-border rounded-lg shadow-xl overflow-hidden p-6 text-center">
              <p className="text-xs text-gw-muted">未找到 "{query}" 的相关结果</p>
              <p className="text-[9px] text-gw-muted/50 mt-1">试试其他关键词</p>
            </div>
          )}
        </div>
      </div>
    )}
    <div className="relative" ref={containerRef}>
      {/* 搜索输入框 */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gw-surface/60 border border-gw-border/50 focus-within:border-gw-blue/40 transition-colors">
        <Search size={14} className="text-gw-muted/50 flex-shrink-0" />
        <input ref={inputRef} value={query} onChange={e => doSearch(e.target.value)}
          onKeyDown={handleKeyDown} onFocus={handleFocus}
          placeholder={placeholder}
          className="bg-transparent text-xs text-gw-text placeholder:text-gw-muted/40 outline-none w-full" />
        {loading && <div className="w-3 h-3 border-2 border-gw-blue/40 border-t-transparent rounded-full animate-spin" />}
        {cacheHit && !loading && <span className="text-[8px] text-emerald-400/50 flex-shrink-0">缓存</span>}
        {query && !loading && (
          <button onClick={handleClear}
            className="text-gw-muted/30 hover:text-gw-muted transition-colors">
            <X size={14} />
          </button>
        )}
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] text-gw-muted/30 border border-gw-border/30 bg-gw-surface/40 font-mono">
          Ctrl+K
        </kbd>
      </div>

      {/* ═══════ 搜索历史面板 ═══════ */}
      {showHistory && !open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gw-card border border-gw-border rounded-lg shadow-xl z-50 overflow-hidden">
          {/* 历史条目 */}
          <div className="px-3 py-2 border-b border-gw-border/30 flex items-center justify-between">
            <span className="text-[9px] text-gw-muted/50 flex items-center gap-1">
              <Clock size={10} /> 搜索历史 ({searchHistory.length})
            </span>
            {searchHistory.length > 0 && (
              <button onClick={handleClearHistory}
                className="text-[9px] text-gw-muted/30 hover:text-red-400 flex items-center gap-0.5 transition-colors">
                <Trash2 size={9} /> 清空
              </button>
            )}
          </div>

          {searchHistory.length > 0 ? (
            <div className="max-h-48 overflow-y-auto scrollbar-thin">
              {searchHistory.map((kw, idx) => (
                <button key={kw}
                  data-result-index={idx}
                  onClick={() => handleHistoryClick(kw)}
                  className={'w-full px-3 py-1.5 flex items-center gap-2 text-left transition-colors border-b border-gw-border/10 last:border-0 ' +
                    (idx === activeIndex ? 'bg-gw-blue/10 border-l-2 border-gw-blue' : 'hover:bg-gw-surface/60 border-l-2 border-transparent')
                  }>
                  <Clock size={10} className="text-gw-muted/30 flex-shrink-0" />
                  <span className="text-xs text-gw-text flex-1 truncate">{kw}</span>
                  <span className="text-[8px] text-gw-muted/20">搜索</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <Clock size={16} className="mx-auto mb-1 text-gw-muted/20" />
              <p className="text-[10px] text-gw-muted/40">暂无搜索历史</p>
            </div>
          )}

          {/* 热门搜索 */}
          <div className="border-t border-gw-border/20 px-3 py-2">
            <p className="text-[9px] text-gw-muted/50 flex items-center gap-1 mb-1.5">
              <TrendingUp size={10} /> 热门搜索
            </p>
            <div className="flex flex-wrap gap-1">
              {HOT_SEARCHES.slice(0, 12).map(kw => (
                <button key={kw}
                  onClick={() => handleHistoryClick(kw)}
                  className="px-1.5 py-0.5 rounded text-[9px] text-gw-muted/60 bg-gw-surface/40 border border-gw-border/20 hover:text-gw-text hover:border-gw-border/40 transition-colors">
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 搜索结果面板 ═══════ */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gw-card border border-gw-border rounded-lg shadow-xl z-50 overflow-hidden max-h-[70vh] flex flex-col">
          {/* 顶部栏：结果计数 + 分类过滤 + 搜索信息 */}
          <div className="px-3 py-1.5 border-b border-gw-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gw-muted/40">
                {results.length} 个结果
                {activeCategory && <span className="text-gw-cyan"> · 筛选: {activeCategory}</span>}
              </span>
              {cacheHit && (
                <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20">缓存命中</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[9px] text-gw-muted/30">
              <span className="flex items-center gap-0.5"><CornerDownLeft size={9} /> 选择</span>
              <span>↑↓ 导航</span>
              <span>Esc 关闭</span>
            </div>
          </div>

          {/* 分类标签 */}
          {Object.keys(categoryCounts).length > 1 && (
            <div className="px-2 py-1.5 border-b border-gw-border/20 flex flex-wrap gap-1">
              <button onClick={() => setActiveCategory(null)}
                className={'px-2 py-0.5 rounded text-[9px] transition-all ' +
                  (!activeCategory ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text border border-transparent')
                }>
                全部
              </button>
              {Object.entries(categoryCounts).map(function(entry) {
                const cat = entry[0], count = entry[1];
                return (
                  <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={'px-2 py-0.5 rounded text-[9px] transition-all flex items-center gap-1 ' +
                      (activeCategory === cat
                        ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                        : 'text-gw-muted hover:text-gw-text border border-transparent')
                    }>
                    {CATEGORY_ICONS[cat] || <Filter size={10} />}
                    {cat}
                    <span className="text-[8px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 结果列表 */}
          <div ref={resultsRef} className="overflow-y-auto flex-1 scrollbar-thin">
            {Object.entries(groupedResults).map(function(entry) {
              const category = entry[0], items = entry[1];
              return (
                <div key={category}>
                  {/* 分类标题（仅非筛选模式） */}
                  {!activeCategory && (
                    <div className="px-3 py-1 bg-gw-surface/40 flex items-center gap-1.5 border-b border-gw-border/10">
                      {CATEGORY_ICONS[category] || <Filter size={10} />}
                      <span className="text-[9px] font-semibold text-gw-muted/60">{category}</span>
                      <span className="text-[8px] text-gw-muted/30">({items.length})</span>
                    </div>
                  )}
                  {items.map(function(r) {
                    const flatResults = getFlatResults();
                    const globalIdx = flatResults.indexOf(r);
                    return (
                      <button key={r.id} data-result-index={globalIdx}
                        role="option" aria-selected={globalIdx === activeIndex}
                        onClick={() => navigateTo(r)}
                        className={'w-full px-3 py-2 flex items-center gap-3 transition-colors text-left border-b border-gw-border/10 last:border-0 ' +
                          (globalIdx === activeIndex ? 'bg-gw-blue/10 border-l-2 border-gw-blue' : 'hover:bg-gw-surface/60 border-l-2 border-transparent')
                        }>
                        {/* 分类色标 */}
                        <span className="w-1 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[r.category] || '#64748b' }} />
                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gw-text truncate">{highlightText(r.title, query)}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] px-1 py-0.5 rounded"
                              style={{
                                backgroundColor: (CATEGORY_COLORS[r.category] || '#64748b') + '15',
                                color: CATEGORY_COLORS[r.category] || '#64748b',
                              }}>
                              {highlightText(r.category, query)}
                            </span>
                            {r.keywords && (
                              <span className="text-[9px] text-gw-muted/50 truncate">{highlightText(r.keywords, query)}</span>
                            )}
                          </div>
                        </div>
                        <ExternalLink size={12} className="text-gw-muted/20 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* 底部统计栏 */}
          <div className="px-3 py-1.5 border-t border-gw-border/20 flex items-center justify-between bg-gw-surface/30">
            <span className="text-[8px] text-gw-muted/30">
              共 {results.length} 条 · {Object.keys(categoryCounts).length} 个分类
            </span>
            <span className="text-[8px] text-gw-muted/20">
              本次会话搜索 {searchCount} 次
            </span>
          </div>
        </div>
      )}

      {/* 无结果提示 */}
      {open && query.length > 0 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gw-card border border-gw-border rounded-lg shadow-xl z-50 p-6 text-center">
          <Search size={24} className="mx-auto mb-2 text-gw-muted/20" />
          <p className="text-xs text-gw-muted/50">
            未找到与 &quot;<span className="text-gw-muted">{query}</span>&quot; 相关的结果
          </p>
          <p className="text-[10px] text-gw-muted/30 mt-1">试试其他关键词，或浏览热门搜索</p>
          {/* 热门搜索快速入口 */}
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {HOT_SEARCHES.slice(0, 6).map(kw => (
              <button key={kw}
                onClick={() => doSearch(kw)}
                className="px-2 py-0.5 rounded text-[9px] text-gw-muted/50 bg-gw-surface/40 border border-gw-border/20 hover:text-gw-text hover:border-gw-border/40 transition-colors">
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
