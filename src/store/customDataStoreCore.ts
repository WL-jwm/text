/**
 * 自定义数据接入 Store (D-04) — Store 核心
 *
 * 拆分自 customDataStore.ts：IndexedDB 持久化与状态管理
 */

import { create } from 'zustand';
import { openDB } from 'idb';
import type {
  CustomDataDBSchema,
  CustomDataState,
  DataTemplateType,
} from './customDataTypes';

// ============================================================
// IndexedDB 常量
// ============================================================

const DB_NAME = 'hebei-gw-custom-data';
const DB_VERSION = 1;


// ============================================================
// Store
// ============================================================

export const useCustomDataStore = create<CustomDataState>((set, get) => ({
  datasets: [],
  db: null,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    try {
      const db = await openDB<CustomDataDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(database) {
          if (!database.objectStoreNames.contains('datasets')) {
            const store = database.createObjectStore('datasets', { keyPath: 'id' });
            store.createIndex('by-type', 'templateType');
          }
        },
      });
      const all = await db.getAll('datasets');
      all.sort((a, b) => b.importedAt.localeCompare(a.importedAt));
      set({ db, datasets: all, initialized: true });
    } catch (err) {
      console.error('[customDataStore] IDB init failed:', err);
      set({ initialized: true });
    }
  },

  addDataset: async (dataset) => {
    const { db } = get();
    if (db) {
      try { await db.put('datasets', dataset); } catch (e) { console.error(e); }
    }
    set(state => ({ datasets: [dataset, ...state.datasets] }));
  },

  deleteDataset: async (id) => {
    const { db } = get();
    if (db) {
      try { await db.delete('datasets', id); } catch (e) { console.error(e); }
    }
    set(state => ({ datasets: state.datasets.filter(d => d.id !== id) }));
  },

  activateDataset: async (id) => {
    const { db, datasets } = get();
    const target = datasets.find(d => d.id === id);
    if (!target) return;

    // 同类型互斥激活
    const updated = datasets.map(d => {
      if (d.templateType === target.templateType) {
        return { ...d, active: d.id === id };
      }
      return d;
    });

    if (db) {
      for (const d of updated) {
        if (d.templateType === target.templateType) {
          try { await db.put('datasets', d); } catch (e) { console.error(e); }
        }
      }
    }
    set({ datasets: updated });
  },

  updateDataset: async (id, partial) => {
    const { db, datasets } = get();
    const updated = datasets.map(d => d.id === id ? { ...d, ...partial } : d);
    if (db) {
      const target = updated.find(d => d.id === id);
      if (target) {
        try { await db.put('datasets', target); } catch (e) { console.error(e); }
      }
    }
    set({ datasets: updated });
  },

  getActiveDataset: (type) => {
    return get().datasets.find(d => d.templateType === type && d.active);
  },

  getDatasetsByType: (type) => {
    return get().datasets.filter(d => d.templateType === type);
  },
}));

// ============================================================
// Hook: 各模块消费自定义数据
// ============================================================

/** 获取指定类型的激活数据集 */
export function useCustomData(type: DataTemplateType) {
  const dataset = useCustomDataStore(s => s.datasets.find(d => d.templateType === type && d.active));
  return dataset ?? null;
}
