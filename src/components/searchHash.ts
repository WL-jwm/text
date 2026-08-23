/**
 * 全局搜索 — URL hash 同步（跨页面保持搜索词）
 */

const SEARCH_HASH_PREFIX = 'search=';

export function getSearchFromHash(): string {
  const hash = window.location.hash;
  if (hash.startsWith('#' + SEARCH_HASH_PREFIX)) {
    return decodeURIComponent(hash.slice(SEARCH_HASH_PREFIX.length + 1));
  }
  return '';
}

export function setSearchToHash(query: string): void {
  if (query.trim()) {
    window.location.hash = SEARCH_HASH_PREFIX + encodeURIComponent(query.trim());
  }
}

export function clearSearchHash(): void {
  if (window.location.hash.startsWith('#' + SEARCH_HASH_PREFIX)) {
    window.location.hash = '';
  }
}

// ═══════════════════════════════════════════════════════════
