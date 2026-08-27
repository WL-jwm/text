/**
 * 跨模块数据总线 (Pipeline Data Bus) — 类型定义
 *
 * 拆分自 usePipelineStore.ts：数据槽/模块/数据包/数据链路/模块元数据/状态
 */

import type { DBSchema, IDBPDatabase } from 'idb';

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


// ============================================================
// IndexedDB Schema
// ============================================================

export interface PipelineDBSchema extends DBSchema {
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


// ============================================================
// Pipeline 状态定义
// ============================================================

export interface PipelineState {
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
