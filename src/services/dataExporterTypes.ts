/**
 * 数据导出器 — 类型定义
 */

import type { Well } from './wellNetwork';
import type { WellAlert } from './wellAlerts';
import type { WaterBalanceResult, CityBalanceResult } from './waterBalance';
import type { WaterQualityAssessment, WaterQualitySummary, CityWaterQualityStats } from './waterQuality';
import type { IntegratedAnalysis } from './waterQualityBalance';

export type ExportFormat = 'xlsx' | 'csv' | 'json';

/** 导出数据源配置 */
export interface ExportDataSources {
  wells: Well[];
  alerts: WellAlert[];
  balanceResult: WaterBalanceResult | null;
  cityBalances: CityBalanceResult[];
  qualityAssessments: WaterQualityAssessment[];
  qualitySummary: WaterQualitySummary | null;
  qualityCityStats: CityWaterQualityStats[];
  integratedAnalysis: IntegratedAnalysis | null;
}

/** 导出选项 */
export interface ExportOptions {
  /** 文件名（不含扩展名） */
  fileName: string;
  /** 导出格式 */
  format: ExportFormat;
  /** 包含的标签页 */
  sheets?: ExportSheet[];
  /** 数据源 */
  data: ExportDataSources;
}

/** 可导出的标签页 */
export type ExportSheet =
  | 'wells'        // 井网基本信息
  | 'readings'     // 实时读数
  | 'alerts'       // 告警记录
  | 'balance'      // 水均衡
  | 'quality'      // 水质评价
  | 'integrated';  // 联动分析

/** 标签页元数据 */

export const SHEET_META: Record<ExportSheet, { label: string; order: number }> = {
  wells: { label: '井网基本信息', order: 1 },
  readings: { label: '实时读数', order: 2 },
  alerts: { label: '告警记录', order: 3 },
  balance: { label: '水均衡分析', order: 4 },
  quality: { label: '水质评价', order: 5 },
  integrated: { label: '联动分析', order: 6 },
};

// ============ 下载工具 ============

/**
 * 触发浏览器下载
 */
