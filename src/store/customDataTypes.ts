/**
 * 自定义数据接入 Store (D-04) — 类型定义
 *
 * 拆分自 customDataStore.ts：模板类型 / 列映射 / 数据集 / 验证结果 / 状态 / IDB Schema
 */

import type { DBSchema, IDBPDatabase } from 'idb';

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

export interface CustomDataState {
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

export interface CustomDataDBSchema extends DBSchema {
  datasets: {
    key: string;
    value: CustomDataset;
    indexes: { 'by-type': string };
  };
}


// ============================================================
// 模板字段与数据结构定义
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
