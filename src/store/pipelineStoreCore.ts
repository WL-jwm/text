/**
 * 跨模块数据总线 (Pipeline Data Bus) — Store 核心
 *
 * 拆分自 usePipelineStore.ts：IDB 持久化、发布/订阅与数据联动逻辑
 */

import { create } from 'zustand';
import { openDB, type IDBPDatabase } from 'idb';
import { PREDEFINED_LINKS } from './pipelinePresets';
import type {
  DataPackage,
  PipelineDBSchema,
  PipelineState,
} from './pipelineTypes';

// ============================================================
// IndexedDB 常量
// ============================================================

const PIPELINE_DB_NAME = 'hebei-gw-pipeline';
const PIPELINE_DB_VERSION = 1;


// ============================================================
// Store
// ============================================================

function uid(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

async function getDB(): Promise<IDBPDatabase<PipelineDBSchema>> {
  return openDB<PipelineDBSchema>(PIPELINE_DB_NAME, PIPELINE_DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('packages')) {
        const pkgStore = db.createObjectStore('packages', { keyPath: 'id' });
        pkgStore.createIndex('by-source', 'sourceModule');
        pkgStore.createIndex('by-type', 'dataType');
      }
      if (!db.objectStoreNames.contains('links')) {
        db.createObjectStore('links', { keyPath: 'id' });
      }
    },
  });
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  db: null,
  initialized: false,
  packages: [],
  links: [],
  notifications: [],

  init: async () => {
    if (get().initialized) return;
    try {
      const db = await getDB();
      set({ db });

      // Load existing packages
      const packages = await db.getAll('packages');
      packages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      // Load or init links
      let links = await db.getAll('links');
      if (links.length === 0) {
        // Initialize predefined links
        links = PREDEFINED_LINKS.map((l, i) => ({
          ...l,
          id: `link-${i + 1}`,
          active: false,
        }));
        for (const link of links) {
          await db.put('links', link);
        }
      }

      set({ packages, links, initialized: true });
    } catch (e) {
      console.error('[Pipeline] init error:', e);
      set({ initialized: true });
    }
  },

  publish: async (pkg) => {
    const db = get().db;
    if (!db) return '';
    const record: DataPackage = { ...pkg, id: uid(), createdAt: new Date().toISOString() };
    await db.put('packages', record);
    const packages = await db.getAll('packages');
    packages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    set({ packages });
    return record.id;
  },

  getLatest: (sourceModule, dataType) => {
    return get().packages.find(p => p.sourceModule === sourceModule && p.dataType === dataType);
  },

  getByType: (dataType) => {
    return get().packages.filter(p => p.dataType === dataType);
  },

  removePackage: async (id) => {
    const db = get().db;
    if (!db) return;
    await db.delete('packages', id);
    set({ packages: get().packages.filter(p => p.id !== id) });
  },

  clearModule: async (module) => {
    const db = get().db;
    if (!db) return;
    const modulePkgs = get().packages.filter(p => p.sourceModule === module);
    for (const p of modulePkgs) {
      await db.delete('packages', p.id);
    }
    set({ packages: get().packages.filter(p => p.sourceModule !== module) });
  },

  toggleLink: async (id) => {
    const db = get().db;
    if (!db) return;
    const link = get().links.find(l => l.id === id);
    if (!link) return;
    const updated = { ...link, active: !link.active };
    await db.put('links', updated);
    set({ links: get().links.map(l => l.id === id ? updated : l) });
  },

  transfer: async (linkId) => {
    const db = get().db;
    if (!db) return undefined;
    const link = get().links.find(l => l.id === linkId);
    if (!link || !link.active) return undefined;

    const pkg = get().getLatest(link.sourceModule, link.dataType);
    if (!pkg) return undefined;

    // Update link transfer time
    const updatedLink = { ...link, lastTransfer: new Date().toISOString() };
    await db.put('links', updatedLink);
    set({ links: get().links.map(l => l.id === linkId ? updatedLink : l) });

    get().notify(`${link.sourceModule} → ${link.targetModule}: ${link.description}`, 'success');
    return pkg;
  },

  transferAllFrom: async (sourceModule) => {
    const activeLinks = get().links.filter(l => l.sourceModule === sourceModule && l.active);
    let count = 0;
    for (const link of activeLinks) {
      const result = await get().transfer(link.id);
      if (result) count++;
    }
    if (count > 0) {
      get().notify(`已从 ${sourceModule} 推送 ${count} 条数据`, 'success');
    }
    return count;
  },

  initLinks: async () => {
    const db = get().db;
    if (!db) return;
    const existing = await db.getAll('links');
    if (existing.length === 0) {
      const links = PREDEFINED_LINKS.map((l, i) => ({ ...l, id: `link-${i + 1}`, active: false }));
      for (const link of links) {
        await db.put('links', link);
      }
      set({ links });
    }
  },

  notify: (message, type = 'info') => {
    const notification = { id: uid(), message, timestamp: new Date().toISOString(), type };
    set({ notifications: [notification, ...get().notifications].slice(0, 20) });
  },

  clearNotifications: () => set({ notifications: [] }),
}));
