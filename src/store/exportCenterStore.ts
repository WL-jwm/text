/**
 * 统一导出中心 Store (D-02)
 *
 * 管理 27 个数据源的注册表、导出任务队列、导出历史记录。
 * 历史记录持久化到 IndexedDB，跨刷新保留。
 */

import { create } from 'zustand';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================================
// 类型定义
// ============================================================

export type ExportCategory =
  | '区域概况' | '水质评价' | '水量与均衡' | '环境地质'
  | '专题评价' | '数值模拟' | '环评与保护区' | '数据管理'
  | '风险评估' | '合规检查' | '修复评估';

export type ExportFormat = 'excel' | 'word' | 'json';

export interface ExportSource {
  /** 唯一标识，与 reportType 一致 */
  id: string;
  /** 显示名称 */
  label: string;
  /** 分类 */
  category: ExportCategory;
  /** 一句话描述 */
  description: string;
  /** 关联的 reportGenerator 类型 */
  reportType: string;
  /** 模块编号 */
  code: string;
  /** 数据是否已采集（运行时状态） */
  isReady: boolean;
  /** 最后采集时间 ISO */
  lastCollected?: string;
  /** 数据摘要（行数/关键指标） */
  dataPreview?: string;
}

export interface ExportRecord {
  id: string;
  /** 导出时间 ISO */
  timestamp: string;
  /** 导出的模块列表 */
  sources: Array<{ id: string; label: string }>;
  /** 导出格式 */
  format: ExportFormat;
  /** 文件名 */
  filename: string;
  /** 状态 */
  status: 'success' | 'failed';
  /** 失败原因 */
  errorMsg?: string;
  /** 文件大小（字节） */
  fileSize?: number;
}

interface ExportCenterState {
  /** 数据源注册表 */
  sources: ExportSource[];
  /** 当前选中的数据源 ID */
  selectedIds: Set<string>;
  /** 导出格式 */
  format: ExportFormat;
  /** 导出中状态 */
  isExporting: boolean;
  /** 导出进度 */
  progress: { current: number; total: number };
  /** 导出历史 */
  history: ExportRecord[];
  /** IDB 实例 */
  db: IDBPDatabase<ExportDBSchema> | null;
  /** 是否已初始化 */
  initialized: boolean;

  /** 初始化（加载历史记录） */
  init: () => Promise<void>;
  /** 切换选中 */
  toggleSelect: (id: string) => void;
  /** 全选/取消全选 */
  selectAll: () => void;
  selectNone: () => void;
  /** 按类别选择 */
  selectByCategory: (cat: ExportCategory) => void;
  /** 设置导出格式 */
  setFormat: (f: ExportFormat) => void;
  /** 标记数据源就绪 */
  markReady: (id: string, preview?: string) => void;
  /** 添加导出记录 */
  addRecord: (record: ExportRecord) => Promise<void>;
  /** 删除导出记录 */
  deleteRecord: (id: string) => Promise<void>;
  /** 设置导出状态 */
  setExporting: (exporting: boolean, progress?: { current: number; total: number }) => void;
}

// ============================================================
// IndexedDB Schema
// ============================================================

interface ExportDBSchema extends DBSchema {
  history: {
    key: string;
    value: ExportRecord;
    indexes: { 'by-time': string };
  };
}

const DB_NAME = 'hebei-gw-export';
const DB_VERSION = 1;

// ============================================================
// 数据源注册表（27 个模块）
// ============================================================

const SOURCES: ExportSource[] = [
  { id: 'overview', label: '区域地下水概况', category: '区域概况', description: '河北省地下水基本概况、水文地质分区',
    reportType: 'overview', code: 'B-01', isReady: false },
  { id: 'resources', label: '地下水资源评价', category: '区域概况', description: '水资源量、可开采量、资源分区',
    reportType: 'resources', code: 'B-02', isReady: false },
  { id: 'water-quality', label: '水质评价计算器', category: '水质评价', description: '水质因子浓度、评价等级、超标统计',
    reportType: 'water-quality', code: 'B-06', isReady: false },
  { id: 'groundwater-balance', label: '地下水均衡计算', category: '水量与均衡', description: '补给排泄均衡、开采系数、超采分析',
    reportType: 'groundwater-balance', code: 'B-07', isReady: false },
  { id: 'exploitation', label: '地下水开采分析', category: '水量与均衡', description: '开采量统计、趋势分析、区域对比',
    reportType: 'exploitation', code: 'B-03', isReady: false },
  { id: 'environment', label: '环境地质问题', category: '环境地质', description: '地面沉降、海水入侵、土壤盐碱化',
    reportType: 'environment', code: 'B-15', isReady: false },
  { id: 'hydrochemistry', label: '水化学分析', category: '专题评价', description: 'Piper三线图、苏卡列夫分类、离子平衡',
    reportType: 'hydrochemistry', code: 'B-11', isReady: false },
  { id: 'geology', label: '水文地质背景', category: '区域概况', description: '地质构造、含水层结构、岩性特征',
    reportType: 'geology', code: 'B-04', isReady: false },
  { id: 'hydro-params', label: '水文地质参数', category: '水量与均衡', description: '渗透系数、给水度、分区参数',
    reportType: 'hydro-params', code: 'B-08', isReady: false },
  { id: 'water-source', label: '水源地保护区划分', category: '环评与保护区', description: '一级/二级/准保护区划分',
    reportType: 'water-source', code: 'B-10', isReady: false },
  { id: 'geothermal', label: '地热资源评价', category: '专题评价', description: '地温梯度、热储特征、资源潜力',
    reportType: 'geothermal', code: 'B-12', isReady: false },
  { id: 'mineral-water', label: '矿泉水评价', category: '专题评价', description: '矿泉水类型、特征组分、达标评价',
    reportType: 'mineral-water', code: 'B-13', isReady: false },
  { id: 'saline-water', label: '咸水入侵评价', category: '环境地质', description: '入侵风险、Cl⁻趋势、水力梯度',
    reportType: 'saline-water', code: 'B-14', isReady: false },
  { id: 'saline-soil', label: '土壤盐碱化评价', category: '环境地质', description: '盐渍化程度、分区、改良方向',
    reportType: 'saline-soil', code: 'B-17', isReady: false },
  { id: 'mine-hydrogeology', label: '矿坑水文地质', category: '专题评价', description: '矿坑涌水量、充水条件、防治措施',
    reportType: 'mine-hydrogeology', code: 'B-18', isReady: false },
  { id: 'karst-water', label: '岩溶水系统', category: '专题评价', description: '岩溶发育、泉流量衰减、系统边界',
    reportType: 'karst-water', code: 'B-19', isReady: false },
  { id: 'fracture-water', label: '裂隙水计算', category: '专题评价', description: '裂隙含水层参数、水量评价',
    reportType: 'fracture-water', code: 'B-20', isReady: false },
  { id: 'system-zoning', label: '水文地质分区', category: '区域概况', description: '系统分区、亚区划分、特征对比',
    reportType: 'system-zoning', code: 'B-05', isReady: false },
  { id: 'map-view', label: '空间分布视图', category: '数据管理', description: '监测点分布、等值线、专题图',
    reportType: 'map-view', code: 'B-21', isReady: false },
  { id: 'data-insight', label: '数据洞察分析', category: '数据管理', description: '多维度统计、关联分析、异常检测',
    reportType: 'data-insight', code: 'B-22', isReady: false },
  { id: 'dataQuality', label: '数据质量评估', category: '数据管理', description: '完整性、一致性、准确性评分',
    reportType: 'dataQuality', code: 'B-23', isReady: false },
  { id: 'county-water-compare', label: '县域横向对比', category: '数据管理', description: '县域水质/水量/开采对比',
    reportType: 'county-water-compare', code: 'B-24', isReady: false },
  { id: 'groundwater-function', label: '地下水功能分区', category: '环评与保护区', description: '功能区划、保护优先级',
    reportType: 'groundwater-function', code: 'B-09', isReady: false },
  { id: 'hydrogeology-historical', label: '历史水文地质', category: '区域概况', description: '历史监测数据、参数演变',
    reportType: 'hydrogeology-historical', code: 'B-25', isReady: false },
  { id: 'groundwater-background', label: '背景值统计', category: '水质评价', description: '天然背景值、异常值识别',
    reportType: 'groundwater-background', code: 'B-26', isReady: false },
  { id: 'spatial-analysis', label: '空间统计分析', category: '数据管理', description: '空间自相关、变异函数、插值',
    reportType: 'spatial-analysis', code: 'B-29', isReady: false },
  { id: 'time-series', label: '时序趋势分析', category: '数据管理', description: '趋势检验、周期分析、预测',
    reportType: 'time-series', code: 'B-30', isReady: false },
];

// ============================================================
// Store
// ============================================================

export const useExportCenterStore = create<ExportCenterState>((set, get) => ({
  sources: SOURCES.map(s => ({ ...s })),
  selectedIds: new Set<string>(),
  format: 'excel',
  isExporting: false,
  progress: { current: 0, total: 0 },
  history: [],
  db: null,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    try {
      const db = await openDB<ExportDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(database) {
          if (!database.objectStoreNames.contains('history')) {
            const store = database.createObjectStore('history', { keyPath: 'id' });
            store.createIndex('by-time', 'timestamp');
          }
        },
      });
      const allHistory = await db.getAll('history');
      allHistory.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      set({ db, history: allHistory, initialized: true });
    } catch (err) {
      console.error('[exportCenterStore] IDB init failed:', err);
      set({ initialized: true });
    }
  },

  toggleSelect: (id) => {
    const next = new Set(get().selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedIds: next });
  },

  selectAll: () => {
    set({ selectedIds: new Set(get().sources.map(s => s.id)) });
  },

  selectNone: () => {
    set({ selectedIds: new Set() });
  },

  selectByCategory: (cat) => {
    const ids = get().sources.filter(s => s.category === cat).map(s => s.id);
    const next = new Set(get().selectedIds);
    const allSelected = ids.every(id => next.has(id));
    if (allSelected) {
      ids.forEach(id => next.delete(id));
    } else {
      ids.forEach(id => next.add(id));
    }
    set({ selectedIds: next });
  },

  setFormat: (f) => set({ format: f }),

  markReady: (id, preview) => {
    set(state => ({
      sources: state.sources.map(s =>
        s.id === id ? { ...s, isReady: true, lastCollected: new Date().toISOString(), dataPreview: preview } : s
      ),
    }));
  },

  addRecord: async (record) => {
    const { db } = get();
    if (db) {
      try { await db.put('history', record); } catch (e) { console.error(e); }
    }
    set(state => ({ history: [record, ...state.history] }));
  },

  deleteRecord: async (id) => {
    const { db } = get();
    if (db) {
      try { await db.delete('history', id); } catch (e) { console.error(e); }
    }
    set(state => ({ history: state.history.filter(r => r.id !== id) }));
  },

  setExporting: (exporting, progress) => {
    set({ isExporting: exporting, progress: progress ?? { current: 0, total: 0 } });
  },
}));

// ============================================================
// 辅助函数
// ============================================================

/** 获取按分类分组的数据源 */
export function getSourcesByCategory(sources: ExportSource[]): Record<string, ExportSource[]> {
  const groups: Record<string, ExportSource[]> = {};
  for (const s of sources) {
    if (!groups[s.category]) groups[s.category] = [];
    groups[s.category].push(s);
  }
  return groups;
}

/** 生成默认文件名 */
export function generateFilename(format: ExportFormat, count: number): string {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const ext = format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : 'json';
  return `河北地下水_${count}模块_${stamp}.${ext}`;
}
