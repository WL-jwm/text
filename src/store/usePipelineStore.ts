/**
 * 跨模块数据总线 (Pipeline Data Bus)
 *
 * 各计算模块通过 publish/subscribe 模式推送和接收数据，
 * 实现 40 个独立计算器之间的数据联动。
 */

import { create } from 'zustand';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================================
// 类型定义
// ============================================================

/** 数据槽标识：模块名.数据名 */
export type SlotId = string;

/** 模块标识 */
export type ModuleId =
  | 'waterQuality' | 'balance' | 'drastic' | 'aquiferParam'
  | 'hydrochem' | 'numericalSim' | 'riskAssessment'
  | 'compliance' | 'remediation' | 'ecosystemService'
  | 'climateImpact' | 'uncertainty' | 'gwSwInteraction'
  | 'monitoringNetwork' | 'spatialStats' | 'dataMining'
  | 'timeSeries' | 'subsidence' | 'protectionZone'
  | 'exploitableResource' | 'decisionSupport';

/** 数据包类型 */
export type DataType =
  | 'waterQualityFactors'   // 水质因子浓度数组
  | 'balanceResult'         // 均衡结果
  | 'drasticResult'         // DRASTIC脆弱性结果
  | 'aquiferParams'         // 含水层参数
  | 'ionConcentrations'     // 离子浓度
  | 'simulationConfig'      // 数值模拟配置
  | 'riskInput'             // 风险评估输入
  | 'complianceInput'       // 合规检查输入
  | 'remediationInput'      // 修复评估输入
  | 'generic';              // 通用数据

/** 数据包 */
export interface DataPackage {
  id: string;
  /** 来源模块 */
  sourceModule: ModuleId;
  /** 数据类型 */
  dataType: DataType;
  /** 人类可读标签 */
  label: string;
  /** 数据载荷 */
  payload: Record<string, unknown>;
  /** 创建时间 */
  createdAt: string;
  /** 来源模块的预设/场景名 */
  sourceContext?: string;
}

/** 数据链路定义 */
export interface DataLink {
  id: string;
  sourceModule: ModuleId;
  targetModule: ModuleId;
  dataType: DataType;
  /** 源数据槽 */
  sourceSlot: SlotId;
  /** 目标数据槽 */
  targetSlot: SlotId;
  /** 链路描述 */
  description: string;
  /** 是否激活 */
  active: boolean;
  /** 最后传输时间 */
  lastTransfer?: string;
}

/** 预定义链路 */
export interface PipelineDefinition {
  links: Omit<DataLink, 'id' | 'active' | 'lastTransfer'>[];
}

// ============================================================
// 预定义数据链路
// ============================================================

export const PREDEFINED_LINKS: Omit<DataLink, 'id' | 'active' | 'lastTransfer'>[] = [
  {
    sourceModule: 'waterQuality',
    targetModule: 'compliance',
    dataType: 'waterQualityFactors',
    sourceSlot: 'waterQuality.factors',
    targetSlot: 'compliance.waterQualityData',
    description: '水质评价因子浓度 → 合规检查水质数据输入',
  },
  {
    sourceModule: 'balance',
    targetModule: 'numericalSim',
    dataType: 'balanceResult',
    sourceSlot: 'balance.result',
    targetSlot: 'numericalSim.boundaryConditions',
    description: '均衡计算补排项 → 数值模拟边界条件',
  },
  {
    sourceModule: 'drastic',
    targetModule: 'riskAssessment',
    dataType: 'drasticResult',
    sourceSlot: 'drastic.result',
    targetSlot: 'riskAssessment.pollutionRisk',
    description: 'DRASTIC脆弱性指数 → 风险评估污染风险维度',
  },
  {
    sourceModule: 'aquiferParam',
    targetModule: 'remediation',
    dataType: 'aquiferParams',
    sourceSlot: 'aquiferParam.params',
    targetSlot: 'remediation.aquiferParams',
    description: '含水层参数(K/T/S) → 修复评估PRB/PAT设计参数',
  },
  {
    sourceModule: 'hydrochem',
    targetModule: 'waterQuality',
    dataType: 'ionConcentrations',
    sourceSlot: 'hydrochem.ions',
    targetSlot: 'waterQuality.factorInput',
    description: '水化学离子浓度 → 水质评价因子输入',
  },
  {
    sourceModule: 'aquiferParam',
    targetModule: 'numericalSim',
    dataType: 'aquiferParams',
    sourceSlot: 'aquiferParam.params',
    targetSlot: 'numericalSim.aquiferParams',
    description: '含水层参数(K/T/S) → 数值模拟含水层参数',
  },
  {
    sourceModule: 'aquiferParam',
    targetModule: 'protectionZone',
    dataType: 'aquiferParams',
    sourceSlot: 'aquiferParam.params',
    targetSlot: 'protectionZone.aquiferParams',
    description: '含水层参数 → 水源地保护区划分参数',
  },
  {
    sourceModule: 'waterQuality',
    targetModule: 'riskAssessment',
    dataType: 'waterQualityFactors',
    sourceSlot: 'waterQuality.factors',
    targetSlot: 'riskAssessment.waterQuality',
    description: '水质评价结果 → 风险评估水质维度',
  },
];

// ============================================================
// 模块元数据
// ============================================================

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  code: string;
  category: string;
  /** 该模块可发布的数据类型 */
  publishes: DataType[];
  /** 该模块可接收的数据类型 */
  subscribes: DataType[];
}

export const MODULE_REGISTRY: ModuleMeta[] = [
  { id: 'waterQuality', name: '水质评价计算器', code: 'B-06', category: '水质评价',
    publishes: ['waterQualityFactors'], subscribes: ['ionConcentrations'] },
  { id: 'balance', name: '地下水均衡计算器', code: 'B-07', category: '水量与均衡',
    publishes: ['balanceResult'], subscribes: [] },
  { id: 'drastic', name: 'DRASTIC脆弱性评价', code: 'B-16', category: '环评与保护区',
    publishes: ['drasticResult'], subscribes: ['aquiferParams'] },
  { id: 'aquiferParam', name: '含水层参数速算器', code: 'B-08', category: '水量与均衡',
    publishes: ['aquiferParams'], subscribes: [] },
  { id: 'hydrochem', name: '水化学分析计算器', code: 'B-11', category: '专题评价',
    publishes: ['ionConcentrations'], subscribes: [] },
  { id: 'numericalSim', name: '数值模拟与校准器', code: 'B-35', category: '数值模拟',
    publishes: ['simulationConfig'], subscribes: ['balanceResult', 'aquiferParams'] },
  { id: 'riskAssessment', name: '风险评估计算器', code: 'B-31', category: '风险评估',
    publishes: ['riskInput'], subscribes: ['drasticResult', 'waterQualityFactors'] },
  { id: 'compliance', name: '法规标准合规检查器', code: 'B-40', category: '合规检查',
    publishes: [], subscribes: ['waterQualityFactors'] },
  { id: 'remediation', name: '修复方案评估器', code: 'B-38', category: '修复评估',
    publishes: [], subscribes: ['aquiferParams'] },
  { id: 'protectionZone', name: '水源地保护区划分', code: 'B-10', category: '环评与保护区',
    publishes: [], subscribes: ['aquiferParams'] },
];

// ============================================================
// IndexedDB Schema
// ============================================================

interface PipelineDBSchema extends DBSchema {
  packages: {
    key: string;
    value: DataPackage;
    indexes: { 'by-source': string; 'by-type': string };
  };
  links: {
    key: string;
    value: DataLink;
  };
}

const PIPELINE_DB_NAME = 'hebei-gw-pipeline';
const PIPELINE_DB_VERSION = 1;

// ============================================================
// Store
// ============================================================

interface PipelineState {
  db: IDBPDatabase<PipelineDBSchema> | null;
  initialized: boolean;

  /** 所有已发布的数据包 */
  packages: DataPackage[];
  /** 数据链路 */
  links: DataLink[];
  /** 通知队列（最近的数据传输通知） */
  notifications: { id: string; message: string; timestamp: string; type: 'success' | 'info' }[];

  // Actions
  init: () => Promise<void>;

  /** 发布数据包 */
  publish: (pkg: Omit<DataPackage, 'id' | 'createdAt'>) => Promise<string>;

  /** 获取指定模块+类型的最新数据包 */
  getLatest: (sourceModule: ModuleId, dataType: DataType) => DataPackage | undefined;

  /** 获取指定数据类型的所有数据包 */
  getByType: (dataType: DataType) => DataPackage[];

  /** 删除数据包 */
  removePackage: (id: string) => Promise<void>;

  /** 清空某模块的数据包 */
  clearModule: (module: ModuleId) => Promise<void>;

  /** 激活/停用链路 */
  toggleLink: (id: string) => Promise<void>;

  /** 执行数据传输：从源模块最新数据包推送到目标模块 */
  transfer: (linkId: string) => Promise<DataPackage | undefined>;

  /** 执行某源模块的所有激活链路 */
  transferAllFrom: (sourceModule: ModuleId) => Promise<number>;

  /** 初始化预定义链路 */
  initLinks: () => Promise<void>;

  /** 推送通知 */
  notify: (message: string, type?: 'success' | 'info') => void;

  /** 清除通知 */
  clearNotifications: () => void;
}

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
