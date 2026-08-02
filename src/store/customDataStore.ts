/**
 * 自定义数据接入 Store (D-04)
 *
 * 用户可导入自己的监测井 Excel/CSV 数据，映射为标准格式，
 * 各计算模块通过 useCustomData hook 读取用户数据替代内置预设。
 *
 * 数据流: 文件上传 → 列名映射 → 标准化验证 → IDB持久化 → 各模块消费
 */

import { create } from 'zustand';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================================
// 类型定义
// ============================================================

/** 支持的数据模板类型 */
export type DataTemplateType =
  | 'waterQuality'      // 水质监测数据
  | 'hydrochemistry'    // 水化学离子数据
  | 'balance'           // 均衡计算数据
  | 'monitoringWell'    // 监测井基本信息
  | 'generic';          // 通用表格

/** 列映射规则 */
export interface ColumnMapping {
  /** 原始列名 */
  sourceColumn: string;
  /** 标准字段名 */
  targetField: string;
  /** 数据类型 */
  type: 'string' | 'number' | 'date';
}

/** 标准化后的数据集 */
export interface CustomDataset {
  id: string;
  /** 数据集名称 */
  name: string;
  /** 数据模板类型 */
  templateType: DataTemplateType;
  /** 原始文件名 */
  sourceFile: string;
  /** 导入时间 ISO */
  importedAt: string;
  /** 原始列名 */
  originalColumns: string[];
  /** 列映射规则 */
  mappings: ColumnMapping[];
  /** 标准化后的数据行 */
  rows: Record<string, unknown>[];
  /** 行数 */
  rowCount: number;
  /** 验证结果 */
  validation: ValidationResult;
  /** 是否激活（同一类型只能激活一个） */
  active: boolean;
  /** 备注 */
  note?: string;
}

/** 验证结果 */
export interface ValidationResult {
  /** 是否通过 */
  passed: boolean;
  /** 错误列表 */
  errors: string[];
  /** 警告列表 */
  warnings: string[];
  /** 缺失的必填字段 */
  missingFields: string[];
  /** 数据行数 */
  rowCount: number;
  /** 有效行数 */
  validRowCount: number;
}

interface CustomDataState {
  /** 所有自定义数据集 */
  datasets: CustomDataset[];
  /** IDB 实例 */
  db: IDBPDatabase<CustomDataDBSchema> | null;
  /** 是否已初始化 */
  initialized: boolean;

  /** 初始化 */
  init: () => Promise<void>;
  /** 添加数据集 */
  addDataset: (dataset: CustomDataset) => Promise<void>;
  /** 删除数据集 */
  deleteDataset: (id: string) => Promise<void>;
  /** 激活数据集（同类型互斥） */
  activateDataset: (id: string) => Promise<void>;
  /** 更新数据集 */
  updateDataset: (id: string, partial: Partial<CustomDataset>) => Promise<void>;
  /** 获取当前激活的指定类型数据集 */
  getActiveDataset: (type: DataTemplateType) => CustomDataset | undefined;
  /** 获取指定类型的所有数据集 */
  getDatasetsByType: (type: DataTemplateType) => CustomDataset[];
}

// ============================================================
// IndexedDB Schema
// ============================================================

interface CustomDataDBSchema extends DBSchema {
  datasets: {
    key: string;
    value: CustomDataset;
    indexes: { 'by-type': string };
  };
}

const DB_NAME = 'hebei-gw-custom-data';
const DB_VERSION = 1;

// ============================================================
// 标准模板定义
// ============================================================

export interface TemplateField {
  /** 标准字段名 */
  name: string;
  /** 显示名 */
  label: string;
  /** 单位 */
  unit?: string;
  /** 是否必填 */
  required: boolean;
  /** 数据类型 */
  type: 'string' | 'number' | 'date';
  /** 匹配关键词（用于自动映射） */
  matchKeywords: string[];
  /** 取值范围（数值型） */
  range?: { min: number; max: number };
  /** 默认值 */
  defaultValue?: unknown;
}

export interface DataTemplate {
  type: DataTemplateType;
  name: string;
  description: string;
  icon: string;
  fields: TemplateField[];
}

/** 水质监测数据模板 */
const WATER_QUALITY_TEMPLATE: DataTemplate = {
  type: 'waterQuality',
  name: '水质监测数据',
  description: '监测点水质因子浓度数据，用于水质评价、合规检查、风险评估',
  icon: 'beaker',
  fields: [
    { name: 'siteName', label: '监测点名称', required: true, type: 'string', matchKeywords: ['名称', '点位', '监测点', 'site', 'name', 'well'] },
    { name: 'pH', label: 'pH值', required: true, type: 'number', matchKeywords: ['pH', '酸碱'], range: { min: 0, max: 14 } },
    { name: 'totalHardness', label: '总硬度', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['硬度', 'hardness', 'TH'] },
    { name: 'TDS', label: '溶解性总固体', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['TDS', '矿化度', '溶解性', 'total', 'dissolved'] },
    { name: 'sulfate', label: '硫酸盐', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['硫酸', 'sulfate', 'SO4'] },
    { name: 'chloride', label: '氯化物', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['氯化', 'chloride', 'Cl'] },
    { name: 'iron', label: '铁', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['铁', 'iron', 'Fe'] },
    { name: 'manganese', label: '锰', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['锰', 'manganese', 'Mn'] },
    { name: 'fluoride', label: '氟化物', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['氟', 'fluoride', 'F'] },
    { name: 'nitrate', label: '硝酸盐', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['硝酸', 'nitrate', 'NO3'] },
    { name: 'ammonia', label: '氨氮', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['氨氮', 'ammonia', 'NH4', 'NH3'] },
    { name: 'city', label: '所在市县', required: false, type: 'string', matchKeywords: ['市', '县', '区域', 'city', 'region'] },
  ],
};

/** 水化学离子数据模板 */
const HYDROCHEMISTRY_TEMPLATE: DataTemplate = {
  type: 'hydrochemistry',
  name: '水化学离子数据',
  description: '6大离子浓度数据，用于Piper三线图、苏卡列夫分类、水化学分析',
  icon: 'flask',
  fields: [
    { name: 'siteName', label: '监测点名称', required: true, type: 'string', matchKeywords: ['名称', '点位', 'site', 'name', 'well'] },
    { name: 'Ca', label: '钙离子 Ca²⁺', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['钙', 'Ca', 'calcium'] },
    { name: 'Mg', label: '镁离子 Mg²⁺', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['镁', 'Mg', 'magnesium'] },
    { name: 'NaK', label: '钠钾离子 Na⁺+K⁺', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['钠', '钾', 'Na', 'K', 'sodium', 'potassium'] },
    { name: 'HCO3', label: '重碳酸根 HCO₃⁻', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['碳酸', 'HCO3', 'bicarbonate'] },
    { name: 'SO4', label: '硫酸根 SO₄²⁻', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['硫酸', 'SO4', 'sulfate'] },
    { name: 'Cl', label: '氯离子 Cl⁻', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['氯', 'Cl', 'chloride'] },
    { name: 'pH', label: 'pH值', required: false, type: 'number', matchKeywords: ['pH'], range: { min: 0, max: 14 } },
    { name: 'TDS', label: '溶解性总固体', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['TDS', '矿化度', 'dissolved'] },
  ],
};

/** 均衡计算数据模板 */
const BALANCE_TEMPLATE: DataTemplate = {
  type: 'balance',
  name: '均衡计算数据',
  description: '补给排泄项数据，用于地下水均衡计算',
  icon: 'scale',
  fields: [
    { name: 'city', label: '区域名称', required: true, type: 'string', matchKeywords: ['市', '县', '区域', 'city', 'area', 'name'] },
    { name: 'area', label: '计算面积', unit: 'km²', required: true, type: 'number', matchKeywords: ['面积', 'area'] },
    { name: 'precipitationInfiltration', label: '降水入渗补给', unit: '亿m³/a', required: true, type: 'number', matchKeywords: ['降水', '入渗', 'precipitation'] },
    { name: 'lateralRecharge', label: '侧向径流补给', unit: '亿m³/a', required: true, type: 'number', matchKeywords: ['侧向', '径流', 'lateral', 'recharge'] },
    { name: 'riverLeakage', label: '河道渗漏补给', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['河道', '渗漏', 'river'], defaultValue: 0 },
    { name: 'canalLeakage', label: '渠系渗漏补给', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['渠系', 'canal'], defaultValue: 0 },
    { name: 'irrigationRecharge', label: '田间灌溉入渗', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['灌溉', 'irrigation'], defaultValue: 0 },
    { name: 'extraction', label: '人工开采', unit: '亿m³/a', required: true, type: 'number', matchKeywords: ['开采', 'extraction', 'pumping'] },
    { name: 'evaporation', label: '潜水蒸发', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['蒸发', 'evaporation'], defaultValue: 0 },
  ],
};

/** 监测井基本信息模板 */
const MONITORING_WELL_TEMPLATE: DataTemplate = {
  type: 'monitoringWell',
  name: '监测井基本信息',
  description: '监测井坐标、类型、频率等基本信息',
  icon: 'map-pin',
  fields: [
    { name: 'wellId', label: '监测井编号', required: true, type: 'string', matchKeywords: ['编号', 'ID', 'well', 'code'] },
    { name: 'wellName', label: '监测井名称', required: true, type: 'string', matchKeywords: ['名称', 'name', 'well'] },
    { name: 'x', label: 'X坐标', required: true, type: 'number', matchKeywords: ['X', '经度', 'longitude', 'lng'] },
    { name: 'y', label: 'Y坐标', required: true, type: 'number', matchKeywords: ['Y', '纬度', 'latitude', 'lat'] },
    { name: 'aquiferType', label: '含水层类型', required: false, type: 'string', matchKeywords: ['含水层', 'aquifer', '类型'], defaultValue: 'shallow' },
    { name: 'depth', label: '井深', unit: 'm', required: false, type: 'number', matchKeywords: ['深度', '井深', 'depth'] },
    { name: 'city', label: '所在市县', required: false, type: 'string', matchKeywords: ['市', '县', 'city', 'region'] },
  ],
};

/** 通用表格模板 */
const GENERIC_TEMPLATE: DataTemplate = {
  type: 'generic',
  name: '通用表格',
  description: '不绑定特定模块，自由导入任意表格数据',
  icon: 'table',
  fields: [],
};

export const DATA_TEMPLATES: DataTemplate[] = [
  WATER_QUALITY_TEMPLATE,
  HYDROCHEMISTRY_TEMPLATE,
  BALANCE_TEMPLATE,
  MONITORING_WELL_TEMPLATE,
  GENERIC_TEMPLATE,
];

export function getTemplate(type: DataTemplateType): DataTemplate | undefined {
  return DATA_TEMPLATES.find(t => t.type === type);
}

// ============================================================
// 列名自动映射
// ============================================================

/** 根据原始列名自动推断标准字段 */
export function autoMapColumns(
  originalColumns: string[],
  template: DataTemplate,
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const usedFields = new Set<string>();

  for (const col of originalColumns) {
    const colLower = col.toLowerCase().trim();
    let bestField: string | null = null;

    for (const field of template.fields) {
      if (usedFields.has(field.name)) continue;
      const matched = field.matchKeywords.some(kw =>
        colLower.includes(kw.toLowerCase()) || col.includes(kw)
      );
      if (matched) {
        bestField = field.name;
        break;
      }
    }

    mappings.push({
      sourceColumn: col,
      targetField: bestField ?? '',
      type: template.fields.find(f => f.name === bestField)?.type ?? 'string',
    });

    if (bestField) usedFields.add(bestField);
  }

  return mappings;
}

// ============================================================
// 数据标准化与验证
// ============================================================

/** 应用列映射，生成标准化数据 */
export function applyMapping(
  rawData: Record<string, unknown>[],
  mappings: ColumnMapping[],
  template: DataTemplate,
): Record<string, unknown>[] {
  return rawData.map(row => {
    const standardized: Record<string, unknown> = {};

    // 应用映射
    for (const mapping of mappings) {
      if (!mapping.targetField) continue;
      const rawValue = row[mapping.sourceColumn];
      if (rawValue === undefined || rawValue === '') continue;

      if (mapping.type === 'number') {
        const num = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue).replace(/[^\d.-]/g, ''));
        standardized[mapping.targetField] = isNaN(num) ? null : num;
      } else {
        standardized[mapping.targetField] = String(rawValue);
      }
    }

    // 填充默认值
    for (const field of template.fields) {
      if (!(field.name in standardized) && field.defaultValue !== undefined) {
        standardized[field.name] = field.defaultValue;
      }
    }

    return standardized;
  });
}

/** 验证标准化后的数据 */
export function validateData(
  rows: Record<string, unknown>[],
  template: DataTemplate,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  let validRowCount = 0;

  // 检查必填字段
  const requiredFields = template.fields.filter(f => f.required);
  if (requiredFields.length > 0 && rows.length > 0) {
    const firstRow = rows[0];
    for (const field of requiredFields) {
      if (!(field.name in firstRow) || firstRow[field.name] === null || firstRow[field.name] === undefined) {
        missingFields.push(field.label);
      }
    }
  }

  // 逐行验证
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let rowValid = true;

    for (const field of template.fields) {
      if (!field.required) continue;
      const val = row[field.name];
      if (val === null || val === undefined || val === '') {
        rowValid = false;
        break;
      }
      // 数值范围检查
      if (field.type === 'number' && field.range && typeof val === 'number') {
        if (val < field.range.min || val > field.range.max) {
          warnings.push(`第${i + 2}行: ${field.label}=${val} 超出范围[${field.range.min}, ${field.range.max}]`);
        }
      }
    }

    if (rowValid) validRowCount++;
  }

  if (missingFields.length > 0) {
    errors.push(`必填字段缺失: ${missingFields.join(', ')}`);
  }
  if (rows.length > 0 && validRowCount === 0) {
    errors.push('无有效数据行');
  }

  return {
    passed: errors.length === 0 && validRowCount > 0,
    errors,
    warnings,
    missingFields,
    rowCount: rows.length,
    validRowCount,
  };
}

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
