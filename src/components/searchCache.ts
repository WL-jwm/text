/**
 * 全局搜索 — 内存结果缓存（LRU 上限 CACHE_MAX）
 */

import type { SearchResult } from '../data/searchIndex';

const CACHE_MAX = 50;
const searchCache = new Map<string, SearchResult[]>();

export function getFromCache(query: string): SearchResult[] | undefined {
  return searchCache.get(query.toLowerCase());
}

export function putToCache(query: string, results: SearchResult[]): void {
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

