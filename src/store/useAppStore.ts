import { create } from 'zustand';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { SampleResult, SukalovResult } from '../utils/waterQualityCalculator';

/* ── 类型定义 ────────────────────────────────────────── */
export interface CustomAnnotation {
  id: string;
  target: string;        // 关联的数据路径/页面标识
  category: 'note' | 'correction' | 'reference' | 'question';
  content: string;
  createdAt: string;     // ISO 8601
  updatedAt: string;
}

export interface ImportedDataset {
  id: string;
  name: string;
  description: string;
  source: 'csv' | 'json' | 'manual';
  sheetCount: number;
  totalRows: number;
  columns: string[];     // 各sheet的列名合并去重
  rawData: Record<string, unknown>[];  // 第一页数据预览（前100行）
  fullData?: Record<string, unknown>[];  // 完整数据（按需加载）
  importedAt: string;
  tags: string[];
}

export interface DataBookmark {
  id: string;
  title: string;
  path: string;          // 页面路由
  query?: string;        // 搜索关键词（如有）
  filters?: Record<string, string>;  // 筛选条件快照
  createdAt: string;
  group?: string;        // 分组名
}

export interface AppSettings {
  id?: string;
  theme: 'dark' | 'light' | 'system';
  language: 'zh-CN' | 'en';
  defaultPageSize: number;
  autoSaveInterval: number;  // 分钟
  chartAnimation: boolean;
  compactMode: boolean;
  lastUpdated: string;
}

export interface WaterQualitySnapshot {
  id: string;
  label: string;
  sampleName: string;
  savedAt: string;
  values: Record<string, string>;
  result: SampleResult;
  sukalovInput?: Record<string, string>;
  sukalovResult?: SukalovResult;
}

/* ── IndexedDB Schema ───────────────────────────────── */
interface AppDBSchema extends DBSchema {
  annotations: {
    key: string;
    value: CustomAnnotation;
    indexes: { 'by-target': string; 'by-category': string };
  };
  datasets: {
    key: string;
    value: ImportedDataset;
    indexes: { 'by-name': string; 'by-source': string };
  };
  bookmarks: {
    key: string;
    value: DataBookmark;
    indexes: { 'by-group': string; 'by-path': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  waterQualityHistory: {
    key: string;
    value: WaterQualitySnapshot;
    indexes: { 'by-savedAt': string };
  };
}

const DB_NAME = 'hebei-groundwater-db';
const DB_VERSION = 2;

/* ── Zustand Store ──────────────────────────────────── */
export interface AppState {
  db: IDBPDatabase<AppDBSchema> | null;
  initialized: boolean;

  // Annotations
  annotations: CustomAnnotation[];
  loadAnnotations: () => Promise<void>;
  addAnnotation: (a: Omit<CustomAnnotation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAnnotation: (id: string, patch: Partial<CustomAnnotation>) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;

  // Datasets
  datasets: ImportedDataset[];
  loadDatasets: () => Promise<void>;
  addDataset: (d: Omit<ImportedDataset, 'id' | 'importedAt'>) => Promise<string>;
  updateDataset: (id: string, patch: Partial<ImportedDataset>) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;

  // Bookmarks
  bookmarks: DataBookmark[];
  loadBookmarks: () => Promise<void>;
  addBookmark: (b: Omit<DataBookmark, 'id' | 'createdAt'>) => Promise<string>;
  deleteBookmark: (id: string) => Promise<void>;

  // Settings
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;

  // Water Quality History
  waterQualityHistory: WaterQualitySnapshot[];
  loadWaterQualityHistory: () => Promise<void>;
  saveWaterQualitySnapshot: (snapshot: Omit<WaterQualitySnapshot, 'id' | 'savedAt'>) => Promise<string>;
  deleteWaterQualitySnapshot: (id: string) => Promise<void>;

  // Init
  init: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'zh-CN',
  defaultPageSize: 20,
  autoSaveInterval: 5,
  chartAnimation: true,
  compactMode: false,
  lastUpdated: new Date().toISOString(),
};

function uid(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

export const useAppStore = create<AppState>((set, get) => ({
  db: null,
  initialized: false,

  // ── Annotations ──
  annotations: [],

  loadAnnotations: async () => {
    const db = get().db;
    if (!db) return;
    const all = await db.getAll('annotations');
    set({ annotations: all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  },

  addAnnotation: async (a) => {
    const db = get().db;
    if (!db) throw new Error('DB not initialized');
    const now = new Date().toISOString();
    const record: CustomAnnotation = { ...a, id: uid(), createdAt: now, updatedAt: now };
    await db.put('annotations', record);
    await get().loadAnnotations();
    return record.id;
  },

  updateAnnotation: async (id, patch) => {
    const db = get().db;
    if (!db) throw new Error('DB not initialized');
    const existing = await db.get('annotations', id);
    if (!existing) return;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    await db.put('annotations', updated);
    await get().loadAnnotations();
  },

  deleteAnnotation: async (id) => {
    const db = get().db;
    if (!db) return;
    await db.delete('annotations', id);
    await get().loadAnnotations();
  },

  // ── Datasets ──
  datasets: [],

  loadDatasets: async () => {
    const db = get().db;
    if (!db) return;
    const all = await db.getAll('datasets');
    set({ datasets: all.sort((a, b) => b.importedAt.localeCompare(a.importedAt)) });
  },

  addDataset: async (d) => {
    const db = get().db;
    if (!db) throw new Error('DB not initialized');
    const record: ImportedDataset = { ...d, id: uid(), importedAt: new Date().toISOString() };
    await db.put('datasets', record);
    await get().loadDatasets();
    return record.id;
  },

  updateDataset: async (id, patch) => {
    const db = get().db;
    if (!db) return;
    const existing = await db.get('datasets', id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await db.put('datasets', updated);
    await get().loadDatasets();
  },

  deleteDataset: async (id) => {
    const db = get().db;
    if (!db) return;
    await db.delete('datasets', id);
    await get().loadDatasets();
  },

  // ── Bookmarks ──
  bookmarks: [],

  loadBookmarks: async () => {
    const db = get().db;
    if (!db) return;
    const all = await db.getAll('bookmarks');
    set({ bookmarks: all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  },

  addBookmark: async (b) => {
    const db = get().db;
    if (!db) throw new Error('DB not initialized');
    const record: DataBookmark = { ...b, id: uid(), createdAt: new Date().toISOString() };
    await db.put('bookmarks', record);
    await get().loadBookmarks();
    return record.id;
  },

  deleteBookmark: async (id) => {
    const db = get().db;
    if (!db) return;
    await db.delete('bookmarks', id);
    await get().loadBookmarks();
  },

  // ── Settings ──
  settings: DEFAULT_SETTINGS,

  loadSettings: async () => {
    const db = get().db;
    if (!db) return;
    const all = await db.getAll('settings');
    if (all.length > 0) {
      set({ settings: all[0] });
    } else {
      // 写入默认设置
      const defaults = { ...DEFAULT_SETTINGS, id: 'app-settings' };
      await db.put('settings', defaults);
      set({ settings: defaults });
    }
  },

  updateSettings: async (patch) => {
    const db = get().db;
    if (!db) return;
    const current = get().settings;
    const updated = { ...current, ...patch, lastUpdated: new Date().toISOString() };
    await db.put('settings', { ...updated, id: 'app-settings' });
    set({ settings: updated });
  },

  // ── Water Quality History ──
  waterQualityHistory: [],

  loadWaterQualityHistory: async () => {
    const db = get().db;
    if (!db) return;
    const all = await db.getAll('waterQualityHistory');
    set({ waterQualityHistory: all.sort((a, b) => b.savedAt.localeCompare(a.savedAt)) });
  },

  saveWaterQualitySnapshot: async (snapshot) => {
    const db = get().db;
    if (!db) throw new Error('DB not initialized');
    const record: WaterQualitySnapshot = { ...snapshot, id: uid(), savedAt: new Date().toISOString() };
    await db.put('waterQualityHistory', record);
    await get().loadWaterQualityHistory();
    return record.id;
  },

  deleteWaterQualitySnapshot: async (id) => {
    const db = get().db;
    if (!db) return;
    await db.delete('waterQualityHistory', id);
    await get().loadWaterQualityHistory();
  },

  // ── Init ──
  init: async () => {
    if (get().initialized) return;
    try {
      const db = await openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // annotations store
          if (!db.objectStoreNames.contains('annotations')) {
            const as = db.createObjectStore('annotations', { keyPath: 'id' });
            as.createIndex('by-target', 'target');
            as.createIndex('by-category', 'category');
          }
          // datasets store
          if (!db.objectStoreNames.contains('datasets')) {
            const ds = db.createObjectStore('datasets', { keyPath: 'id' });
            ds.createIndex('by-name', 'name');
            ds.createIndex('by-source', 'source');
          }
          // bookmarks store
          if (!db.objectStoreNames.contains('bookmarks')) {
            const bm = db.createObjectStore('bookmarks', { keyPath: 'id' });
            bm.createIndex('by-group', 'group');
            bm.createIndex('by-path', 'path');
          }
          // settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
          }
          // waterQualityHistory store
          if (!db.objectStoreNames.contains('waterQualityHistory')) {
            const wh = db.createObjectStore('waterQualityHistory', { keyPath: 'id' });
            wh.createIndex('by-savedAt', 'savedAt');
          }
        },
      });
      set({ db: db, initialized: true });
      // 加载所有数据
      await Promise.all([
        get().loadAnnotations(),
        get().loadDatasets(),
        get().loadBookmarks(),
        get().loadSettings(),
        get().loadWaterQualityHistory(),
      ]);
      console.log('[AppStore] IndexedDB initialized, data loaded');
    } catch (err) {
      console.error('[AppStore] Init failed:', err);
    }
  },
}));
