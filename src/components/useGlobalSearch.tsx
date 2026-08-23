/**
 * 全局搜索 — 搜索逻辑 hook
 * 承载全部状态、副作用、搜索/导航/键盘/历史/缓存逻辑
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../data/searchIndex';
import { addToHistory, clearHistory, loadHistory } from './searchHistory';
import { getFromCache, putToCache } from './searchCache';
import { getSearchFromHash, setSearchToHash, clearSearchHash } from './searchHash';
import type { GlobalSearchEnhancedProps } from './searchTypes';

export function useGlobalSearch({ onSelect, onSearch }: GlobalSearchEnhancedProps) {
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
  return {
    query, setQuery, results, setResults, open, setOpen, activeIndex, setActiveIndex,
    activeCategory, setActiveCategory, loading, searchHistory, setSearchHistory,
    showHistory, setShowHistory, cacheHit, searchCount, mobileSearchOpen, setMobileSearchOpen,
    inputRef, containerRef, resultsRef,
    categoryCounts, groupedResults, totalDisplayed,
    doSearch, navigateTo, handleKeyDown, highlightText, getFlatResults,
    handleFocus, handleClear, handleHistoryClick, handleClearHistory,
  };
}
