/**
 * 报告合成器 — 类型定义
 */

import type { ReportChapter, ReportMeta, ReportTemplate } from '../store/reportGeneratorStore';

export interface ComposeResult {
  success: boolean;
  filename: string;
  fileSize: number;
  errorMsg?: string;
  /** 生成的章节摘要（用于预览/日志） */
  chapterSummary: Array<{ title: string; sectionCount: number; hasData: boolean }>;
}

export interface ComposeContext {
  meta: ReportMeta;
  template: ReportTemplate;
  chapters: ReportChapter[];
  filename: string;
}

// ============================================================
// 数据采集
// ============================================================

