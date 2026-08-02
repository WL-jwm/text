/**
 * batchExporter — 批量导出引擎 (D-02)
 *
 * 三种导出模式：
 *   1. Excel — 多 Sheet 合并为单个 .xlsx 文件（xlsx 库）
 *   2. Word — 多章节合并为单个 .docx 文件（docx 库 + reportGenerator）
 *   3. JSON — 全量数据打包为单个 .json 文件
 *
 * 数据来源：reportCacheStore 中预采集的缓存数据
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Packer, Paragraph, Table } from 'docx';
import { loadReportGenerator } from '../services/reportGeneratorLoader';
import {
  createReport, buildTable, buildParagraph,
  getReportConfig,
  type ReportSection,
} from '../services/reportGenerator';
import { useReportCacheStore, buildCacheKey } from '../stores/reportCacheStore';
import type { ExportSource, ExportFormat } from '../store/exportCenterStore';

// ============================================================
// 类型
// ============================================================

export interface ExportTask {
  source: ExportSource;
  data: Record<string, unknown> | null;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  fileSize: number;
  errorMsg?: string;
}

// ============================================================
// 数据采集
// ============================================================

/** 从 reportCacheStore 读取缓存数据 */
function getCachedData(sourceId: string): Record<string, unknown> | null {
  const store = useReportCacheStore.getState();
  const key = buildCacheKey(sourceId);
  return store.getCache<Record<string, unknown>>(key);
}

/** 构建导出任务列表 */
export function buildExportTasks(sources: ExportSource[]): ExportTask[] {
  return sources.map(s => ({
    source: s,
    data: getCachedData(s.id),
  }));
}

// ============================================================
// Excel 多 Sheet 导出
// ============================================================

export function exportMultiSheetExcel(
  tasks: ExportTask[],
  filename: string,
  onProgress?: (pct: number) => void,
): ExportResult {
  try {
    const wb = XLSX.utils.book_new();
    let addedCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      const { source, data } = tasks[i];
      if (!data) continue;

      const rows = flattenData(data);
      if (rows.length === 0) continue;

      const ws = XLSX.utils.json_to_sheet(rows);
      const sheetName = source.label.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      addedCount++;

      onProgress?.(Math.round(((i + 1) / tasks.length) * 80));
    }

    if (addedCount === 0) {
      const ws = XLSX.utils.aoa_to_sheet([['无可用数据，请先进入对应模块执行计算']]);
      XLSX.utils.book_append_sheet(wb, ws, '说明');
    }

    onProgress?.(90);
    XLSX.writeFile(wb, filename);
    onProgress?.(100);

    const fileSize = wb.SheetNames.length * 1024 * 50;
    return { success: true, filename, fileSize };
  } catch (err) {
    return {
      success: false, filename, fileSize: 0,
      errorMsg: err instanceof Error ? err.message : 'Excel 导出失败',
    };
  }
}

// ============================================================
// Word 多章节合并导出
// ============================================================

export async function exportCombinedWord(
  tasks: ExportTask[],
  filename: string,
  onProgress?: (pct: number) => void,
): Promise<ExportResult> {
  try {
    const sections: ReportSection[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const { source, data } = tasks[i];

      if (!data) {
        sections.push({
          title: source.label,
          level: 1,
          content: [buildParagraph('（数据未采集，请先进入对应模块执行计算）')],
        });
        continue;
      }

      // 动态加载报告生成器
      try {
        await loadReportGenerator(source.reportType);
        const config = getReportConfig(source.reportType, data);
        if (config?.sections && config.sections.length > 0) {
          sections.push(...config.sections);
        } else {
          sections.push(buildSimpleSection(source, data));
        }
      } catch {
        sections.push(buildSimpleSection(source, data));
      }

      onProgress?.(Math.round(((i + 1) / tasks.length) * 70));
    }

    onProgress?.(80);

    const doc = createReport({
      title: '河北省地下水环境信息综合报告',
      subtitle: `共 ${tasks.length} 个模块 · ${new Date().toLocaleDateString('zh-CN')}`,
      sections,
      showDate: true,
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([new Uint8Array(buffer)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    saveAs(blob, filename);

    onProgress?.(100);
    return { success: true, filename, fileSize: blob.size };
  } catch (err) {
    return {
      success: false, filename, fileSize: 0,
      errorMsg: err instanceof Error ? err.message : 'Word 导出失败',
    };
  }
}

/** 构建简易章节（无报告生成器时的回退） */
function buildSimpleSection(source: ExportSource, data: Record<string, unknown>): ReportSection {
  const content: (Paragraph | Table)[] = [
    buildParagraph(`模块：${source.label}（${source.code}）`),
    buildParagraph(`描述：${source.description}`),
  ];

  const dataKeys = Object.keys(data);
  if (dataKeys.length > 0) {
    const firstKey = dataKeys[0];
    const firstVal = data[firstKey];

    if (Array.isArray(firstVal) && firstVal.length > 0 && typeof firstVal[0] === 'object') {
      const cols = Object.keys(firstVal[0] as object).slice(0, 8);
      const rows: string[][] = [];
      for (const item of firstVal.slice(0, 20)) {
        const obj = item as Record<string, unknown>;
        rows.push(cols.map(c => String(obj[c] ?? '')));
      }
      content.push(...buildTable(
        cols.map(c => ({ header: c })),
        rows,
      ));
    } else {
      for (const key of dataKeys.slice(0, 15)) {
        const val = data[key];
        const valStr = typeof val === 'object' ? JSON.stringify(val).substring(0, 200) : String(val);
        content.push(buildParagraph(`${key}: ${valStr}`));
      }
    }
  }

  return { title: source.label, level: 1, content };
}

// ============================================================
// JSON 全量导出
// ============================================================

export function exportJSON(
  tasks: ExportTask[],
  filename: string,
  onProgress?: (pct: number) => void,
): ExportResult {
  try {
    const exportData: Record<string, unknown> = {
      _meta: {
        exportTime: new Date().toISOString(),
        moduleCount: tasks.length,
        platform: '河北省地下水环境信息平台',
        version: 'D-02',
      },
    };

    for (let i = 0; i < tasks.length; i++) {
      const { source, data } = tasks[i];
      exportData[source.id] = {
        _label: source.label,
        _code: source.code,
        _description: source.description,
        data: data ?? { _note: '数据未采集' },
      };
      onProgress?.(Math.round(((i + 1) / tasks.length) * 90));
    }

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    saveAs(blob, filename);

    onProgress?.(100);
    return { success: true, filename, fileSize: blob.size };
  } catch (err) {
    return {
      success: false, filename, fileSize: 0,
      errorMsg: err instanceof Error ? err.message : 'JSON 导出失败',
    };
  }
}

// ============================================================
// 统一导出入口
// ============================================================

export async function executeExport(
  tasks: ExportTask[],
  format: ExportFormat,
  filename: string,
  onProgress?: (pct: number) => void,
): Promise<ExportResult> {
  switch (format) {
    case 'excel':
      return exportMultiSheetExcel(tasks, filename, onProgress);
    case 'word':
      return await exportCombinedWord(tasks, filename, onProgress);
    case 'json':
      return exportJSON(tasks, filename, onProgress);
    default:
      return { success: false, filename, fileSize: 0, errorMsg: `不支持的格式: ${format}` };
  }
}

// ============================================================
// 辅助函数
// ============================================================

/** 将嵌套数据对象展平为行数组 */
function flattenData(data: Record<string, unknown>): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          rows.push({ _section: key, ...(item as Record<string, unknown>) });
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      rows.push({ _section: key, ...(value as Record<string, unknown>) });
    } else {
      rows.push({ _section: key, _value: value });
    }
  }

  return rows;
}
