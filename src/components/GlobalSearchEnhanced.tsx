/**
 * 升级版全局搜索组件 v2.0（容器）
 * 搜索逻辑见 useGlobalSearch，常量见 searchConstants，工具见 searchHistory/searchCache/searchHash
 * v2.0 能力：
 *   - 搜索历史记录（localStorage持久化，最多20条）
 *   - 搜索结果缓存（避免重复查询）
 *   - 跨页面上下文保持（URL hash传递搜索词）
 *   - 搜索建议/热词提示
 *   - 搜索统计面板
 */

import React from 'react';
import {
  Search, CornerDownLeft, ExternalLink, X, Filter,
  Clock, TrendingUp, RotateCcw, Trash2, Database,
} from 'lucide-react';
import { useGlobalSearch } from './useGlobalSearch';
import { clearHistory } from './searchHistory';
import { CATEGORY_ICONS, CATEGORY_COLORS, HOT_SEARCHES } from './searchConstants';
import type { GlobalSearchEnhancedProps } from './searchTypes';

export function GlobalSearchEnhanced({ placeholder = '搜索参数、区域、指标... (Ctrl+K)', onSelect, onSearch }: GlobalSearchEnhancedProps) {
  const search = useGlobalSearch({ onSelect, onSearch });

  const {
    query, setQuery, results, setResults, open, activeIndex, activeCategory, setActiveCategory,
    loading, searchHistory, setSearchHistory, showHistory, setShowHistory, cacheHit, searchCount,
    mobileSearchOpen, setMobileSearchOpen, inputRef, containerRef, resultsRef,
    categoryCounts, groupedResults,
    doSearch, navigateTo, handleKeyDown, highlightText, getFlatResults,
    handleFocus, handleClear, handleHistoryClick, handleClearHistory,
  } = search;

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
