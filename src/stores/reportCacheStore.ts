/**
 * 报告缓存 Store
 * 
 * 增量缓存：数据采集一次，后续复用，数据变化时自动失效。
 * 用于"一键导出 Word 报告"功能的数据预采集。
 */
import { create } from 'zustand';

// ============================================================
// 类型定义
// ============================================================

interface CacheEntry {
  /** 缓存的数据 */
  data: unknown;
  /** 缓存时间戳 */
  timestamp: number;
  /** 数据指纹，用于判断数据是否变化 */
  hash: string;
}

interface ReportCacheState {
  /** 缓存池 */
  cache: Record<string, CacheEntry>;

  /** 设置缓存 */
  setCache: (key: string, data: unknown, hash?: string) => void;

  /** 获取缓存，过期返回 null */
  getCache: <T>(key: string, maxAgeMs?: number) => T | null;

  /** 获取缓存 hash */
  getHash: (key: string) => string | null;

  /** 使某页面的所有缓存失效 */
  invalidate: (pageName: string) => void;

  /** 使所有缓存失效 */
  clearAll: () => void;

  /** 获取缓存统计信息 */
  getStats: () => { keys: number; entries: Array<{ key: string; age: number }> };
}

const DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5 分钟

export const useReportCacheStore = create<ReportCacheState>((set, get) => ({
  cache: {},

  setCache: (key, data, hash) => {
    set(state => ({
      cache: {
        ...state.cache,
        [key]: {
          data,
          timestamp: Date.now(),
          hash: hash ?? String(Date.now()),
        },
      },
    }));
  },

  getCache: (key, maxAgeMs = DEFAULT_MAX_AGE) => {
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > maxAgeMs) return null;
    return entry.data as never;
  },

  getHash: (key) => {
    return get().cache[key]?.hash ?? null;
  },

  invalidate: (pageName) => {
    set(state => {
      const next: Record<string, CacheEntry> = {};
      const prefix = `${pageName}:`;
      for (const [k, v] of Object.entries(state.cache)) {
        if (!k.startsWith(prefix)) {
          next[k] = v;
        }
      }
      return { cache: next };
    });
  },

  clearAll: () => set({ cache: {} }),

  getStats: () => {
    const cache = get().cache;
    const now = Date.now();
    return {
      keys: Object.keys(cache).length,
      entries: Object.entries(cache).map(([key, entry]) => ({
        key,
        age: Math.round((now - entry.timestamp) / 1000),
      })),
    };
  },
}));

// ============================================================
// 工具函数
// ============================================================

/**
 * 简易字符串 hash，用于生成数据指纹
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * 构建缓存 key
 */
export function buildCacheKey(pageName: string, section?: string, filters?: Record<string, unknown>): string {
  let key = pageName;
  if (section) key += `:${section}`;
  if (filters) key += `:${simpleHash(JSON.stringify(filters))}`;
  return key;
}
