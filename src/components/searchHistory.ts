/**
 * 全局搜索 — 本地搜索历史存取
 */

const HISTORY_KEY = 'gw-search-history';
const MAX_HISTORY = 20;

export function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* ignore */ }
  return [];
}

export function saveHistory(history: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

export function addToHistory(keyword: string): void {
  const trimmed = keyword.trim();
  if (!trimmed || trimmed.length < 2) return;
  const history = loadHistory();
  const idx = history.indexOf(trimmed);
  if (idx >= 0) history.splice(idx, 1);
  history.unshift(trimmed);
  if (history.length > MAX_HISTORY) history.pop();
  saveHistory(history);
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ═══════════════════════════════════════════════════════════
// 搜索结果缓存
// ═══════════════════════════════════════════════════════════

