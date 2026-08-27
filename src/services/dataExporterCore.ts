/**
 * 数据导出器 — 核心导出流程
 *  CSV / JSON / XLSX + 条件格式 + sheet 调度 + JSON数据构建 + 默认选项
 */

import type * as ExcelJS from 'exceljs';
import type { ExportDataSources, ExportSheet, ExportFormat, ExportOptions } from './dataExporterTypes';
import { SHEET_META } from './dataExporterTypes';
import { buildWellsSheet, buildReadingsSheet, buildAlertsSheet, buildBalanceSheet, buildQualitySheet, buildIntegratedSheet } from './dataExporterSheets';
import { arrayToCSV, downloadBlob } from './dataExporterUtils';

export function exportCSV(data: ExportDataSources, sheets: ExportSheet[]): Blob {
  const parts: string[] = [];

  for (const sheet of sheets) {
    const rows = buildSheetData(sheet, data);
    const csv = arrayToCSV(rows);
    parts.push(`--- ${SHEET_META[sheet].label} ---`);
    parts.push(csv);
    parts.push('');
  }

  return new Blob([parts.join('\n')], { type: 'text/csv;charset=utf-8' });
}

/**
 * 导出 JSON
 */
export function exportJSON(data: ExportDataSources, sheets: ExportSheet[]): Blob {
  const jsonData: Record<string, unknown> = {};

  for (const sheet of sheets) {
    jsonData[SHEET_META[sheet].label] = buildJSONData(sheet, data);
  }

  const jsonStr = JSON.stringify(jsonData, null, 2);
  return new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
}

// ============ Excel 导出（核心） ============

/**
 * 导出 Excel 多标签页（条件格式）
 */
export async function exportXLSX(data: ExportDataSources, sheets: ExportSheet[]): Promise<Blob> {
  // 动态导入 exceljs（避免打包时全量包含）
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '河北地下水环境信息平台';
  workbook.created = new Date();

  for (const sheet of sheets) {
    const rows = buildSheetData(sheet, data);
    if (rows.length < 2) continue; // 跳过空表

    const ws = workbook.addWorksheet(SHEET_META[sheet].label, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // 写入数据
    for (let i = 0; i < rows.length; i++) {
      const row = ws.addRow(rows[i]);

      // 表头样式
      if (i === 0) {
        row.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
        row.alignment = { vertical: 'middle', horizontal: 'center' };
        row.height = 22;
      } else {
        row.alignment = { vertical: 'middle' };
        row.height = 18;
      }
    }

    // 列宽自适应
    if (rows.length > 0) {
      const colCount = rows[0].length;
      for (let c = 1; c <= colCount; c++) {
        const maxLen = rows.reduce((max, row) => Math.max(max, String(row[c - 1] ?? '').length), 0);
        ws.getColumn(c).width = Math.min(Math.max(maxLen + 3, 8), 40);
      }
    }

    // 应用条件格式
    applyConditionalFormatting(ws, sheet, rows);
  }

  // 写入 ArrayBuffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * 条件格式：盈余绿色/缺口红色
 */
function applyConditionalFormatting(
  ws: ExcelJS.Worksheet,
  sheet: ExportSheet,
  rows: string[][],
): void {
  if (rows.length < 2) return;

  const lastRow = rows.length;
  const colCount = rows[0].length;

  // 查找包含关键字"均衡差""balance""盈余""超采"的列
  const headerRow = rows[0];
  const balanceCols: number[] = [];

  for (let c = 0; c < colCount; c++) {
    const h = headerRow[c]?.toLowerCase() ?? '';
    if (/均衡差|balance|盈余|超采|亏损|均衡|overdraft|isOverdrafted/.test(h)) {
      balanceCols.push(c + 1); // exceljs 列号从1开始
    }
  }

  // 对数值列应用条件格式
  for (const col of balanceCols) {
    try {
      // 绿色（正数/盈余）: 值 > 0 或 包含"否"
      ws.addConditionalFormatting({
        ref: `${String.fromCharCode(64 + col)}2:${String.fromCharCode(64 + col)}${lastRow}`,
        rules: [
          {
            type: 'cellIs',
            operator: 'greaterThan',
            formulae: [0],
            priority: 1,
            style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } }, font: { color: { argb: 'FF1E8449' } } },
          },
          {
            type: 'cellIs',
            operator: 'lessThan',
            formulae: [0],
            priority: 2,
            style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } }, font: { color: { argb: 'FFC0392B' } } },
          },
        ],
      });
    } catch {
      // 条件格式出错时跳过
    }
  }
}

// ============ 数据构建 ============

/**
 * 构建指定标签页的二维数组数据
 * 纯函数，可测试
 */
export function buildSheetData(sheet: ExportSheet, data: ExportDataSources): string[][] {
  switch (sheet) {
    case 'wells': return buildWellsSheet(data.wells);
    case 'readings': return buildReadingsSheet(data);
    case 'alerts': return buildAlertsSheet(data.alerts);
    case 'balance': return buildBalanceSheet(data);
    case 'quality': return buildQualitySheet(data);
    case 'integrated': return buildIntegratedSheet(data);
    default: return [];
  }
}


export function buildJSONData(sheet: ExportSheet, data: ExportDataSources): unknown {
  switch (sheet) {
    case 'wells': return data.wells;
    case 'alerts': return data.alerts;
    case 'balance': return { summary: data.balanceResult, cities: data.cityBalances };
    case 'quality': return { summary: data.qualitySummary, cities: data.qualityCityStats, assessments: data.qualityAssessments };
    case 'integrated': return data.integratedAnalysis;
    default: return null;
  }
}

// ============ 统一导出函数 ============

/**
 * 统一导出入口
 * 根据格式生成对应 Blob 并触发下载
 */
export async function exportData(options: ExportOptions): Promise<void> {
  const { fileName, format, sheets, data } = options;
  const activeSheets = sheets ?? Object.keys(SHEET_META) as ExportSheet[];

  let blob: Blob;
  let ext: string;

  switch (format) {
    case 'xlsx': {
      blob = await exportXLSX(data, activeSheets);
      ext = '.xlsx';
      break;
    }
    case 'csv': {
      blob = exportCSV(data, activeSheets);
      ext = '.csv';
      break;
    }
    case 'json': {
      blob = exportJSON(data, activeSheets);
      ext = '.json';
      break;
    }
  }

  downloadBlob(blob, `${fileName}${ext}`);
}

/**
 * 获取默认导出选项（全部标签页）
 */
export function getDefaultExportOptions(
  data: ExportDataSources,
  format: ExportFormat = 'xlsx',
  fileName?: string,
): ExportOptions {
  const defaultName = `河北地下水_${new Date().toISOString().split('T')[0]}`;
  return {
    fileName: fileName ?? defaultName,
    format,
    data,
    sheets: Object.keys(SHEET_META) as ExportSheet[],
  };
}
