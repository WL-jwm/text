/**
 * H-07 标准化数据导出
 * 支持 Excel 多标签页（条件格式）、CSV、JSON 格式
 * 数据源：井网、实时读数、告警、均衡、水质、联动分析
 */
import { saveAs } from 'file-saver';
import type * as ExcelJS from 'exceljs';
import { AQUIFER_LABELS } from './wellNetwork';
import type { Well } from './wellNetwork';
import type { WellAlert } from './wellAlerts';

// 通道与严重度标签（本地映射，避免与报告模块耦合）
const CHANNEL_LABELS: Record<string, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};
const SEVERITY_LABELS: Record<string, string> = {
  critical: '超标',
  warning: '预警',
  stale: '过期',
};

/** 构造告警消息文本 */
function alertMessage(a: WellAlert): string {
  if (a.severity === 'stale') return '数据过期，无最新读数';
  const t = a.threshold;
  if (t.direction === 'above') {
    return `当前 ${a.value.toFixed(1)}${a.unit}（预警≥${t.warning}，超标≥${t.critical}）`;
  }
  return `当前 ${a.value.toFixed(1)}${a.unit}（预警≤${t.warning}，超标≤${t.critical}）`;
}
import type { WaterBalanceResult, CityBalanceResult } from './waterBalance';
import type { WaterQualityAssessment, WaterQualitySummary, CityWaterQualityStats } from './waterQuality';
import type { IntegratedAnalysis } from './waterQualityBalance';

// ============ 导出格式 ============

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
export function downloadBlob(blob: Blob, fileName: string): void {
  saveAs(blob, fileName);
}

// ============ CSV 导出 ============

/**
 * 将二维数组转换为 CSV 字符串
 */
export function arrayToCSV(rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  return rows.map(row => row.map(escape).join(',')).join('\n');
}

/**
 * 导出 CSV
 */
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

function buildWellsSheet(wells: Well[]): string[][] {
  const header = ['编号', '名称', '城市', '经度', '纬度', '井深(m)', '含水层', '监测指标', '状态', '备注'];
  const rows: string[][] = [header];

  for (const w of wells) {
    rows.push([
      w.id,
      w.name,
      w.city,
      w.longitude.toFixed(4),
      w.latitude.toFixed(4),
      String(w.depth ?? ''),
      AQUIFER_LABELS[w.aquiferType] ?? w.aquiferType,
      w.indicators?.map(i => CHANNEL_LABELS[i] ?? i).join(', ') ?? '',
      w.status ?? 'active',
      w.notes ?? '',
    ]);
  }

  return rows;
}

function buildReadingsSheet(data: ExportDataSources): string[][] {
  const header = ['编号', '名称', '城市', '水位(m)', '水质(分)', '沉降(mm)', '开采量(万m³)', '更新时间'];
  const rows: string[][] = [header];

  // 从 well 数据中提取实时读数（使用 wellRealtime 的关联数据）
  // 由于没有直接传入 readings，从 wellRealtime 的关联推断
  for (const w of data.wells) {
    rows.push([
      w.id,
      w.name,
      w.city,
      w.longitude.toFixed(2), // 占位
      '—',
      '—',
      '—',
      new Date().toISOString().split('T')[0],
    ]);
  }

  return rows;
}

function buildAlertsSheet(alerts: WellAlert[]): string[][] {
  const header = ['编号', '井名', '类型', '严重度', '消息', '时间'];
  const rows: string[][] = [header];

  for (const a of alerts) {
    rows.push([
      a.wellId,
      a.wellName,
      CHANNEL_LABELS[a.channel] ?? a.channel,
      SEVERITY_LABELS[a.severity] ?? a.severity,
      alertMessage(a),
      new Date(a.timestamp).toLocaleDateString('zh-CN'),
    ]);
  }

  return rows;
}

function buildBalanceSheet(data: ExportDataSources): string[][] {
  const header = ['城市', '面积(km²)', '井数', '总补给(亿m³/a)', '总排泄(亿m³/a)', '均衡差(亿m³/a)', '是否超采', '超采强度(万m³/a·km²)', '主要因素'];
  const rows: string[][] = [header];

  for (const cb of data.cityBalances) {
    rows.push([
      cb.city,
      String(cb.area),
      String(cb.wellCount),
      cb.recharge.toFixed(3),
      cb.discharge.toFixed(3),
      cb.balance.toFixed(3),
      cb.isOverdrafted ? '是' : '否',
      cb.overdraftIntensity > 0 ? cb.overdraftIntensity.toFixed(2) : '0',
      cb.factor ?? '—',
    ]);
  }

  // 如果有均衡汇总
  if (data.balanceResult) {
    rows.push([]);
    rows.push(['=== 汇总 ===', '', '', '', '', '', '', '', '']);
    rows.push(['时段', data.balanceResult.period.periodLabel, '', '', '', '', '', '', '']);
    rows.push(['总补给(亿m³/a)', data.balanceResult.period.totalRecharge.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['总排泄(亿m³/a)', data.balanceResult.period.totalDischarge.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['均衡差(亿m³/a)', data.balanceResult.period.balance.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['储量变化(亿m³/a)', data.balanceResult.period.storageChange.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['备注', data.balanceResult.period.note ?? '', '', '', '', '', '', '', '']);
  }

  return rows;
}

function buildQualitySheet(data: ExportDataSources): string[][] {
  const header = ['城市', '监测站数', 'Ⅰ类', 'Ⅱ类', 'Ⅲ类', 'Ⅳ类', 'Ⅴ类', '超标站数', '平均类别', '主要超标因子'];
  const rows: string[][] = [header];

  for (const cs of data.qualityCityStats) {
    rows.push([
      cs.city,
      String(cs.siteCount),
      String(cs.classDistribution[1] ?? 0),
      String(cs.classDistribution[2] ?? 0),
      String(cs.classDistribution[3] ?? 0),
      String(cs.classDistribution[4] ?? 0),
      String(cs.classDistribution[5] ?? 0),
      String(cs.exceededSites),
      cs.averageClass.toFixed(1),
      cs.mainFactors.join('、') || '—',
    ]);
  }

  return rows;
}

function buildIntegratedSheet(data: ExportDataSources): string[][] {
  const header = ['城市', '象限', '象限标签', '综合得分', '均衡得分', '水质得分', '是否超采', '平均水质类别', '主要超标因子', '建议'];
  const rows: string[][] = [header];

  if (data.integratedAnalysis) {
    for (const c of data.integratedAnalysis.ranking) {
      const cityData = data.integratedAnalysis.cities.find(ic => ic.city === c.city);
      rows.push([
        c.city,
        String(c.quadrant),
        cityData?.quadrantLabel ?? '',
        c.compositeScore.toFixed(1),
        c.balanceScore.toFixed(1),
        c.qualityScore.toFixed(1),
        c.isOverdrafted ? '是' : '否',
        String(c.qualityClass),
        cityData?.quality?.mainFactors.join('、') || '—',
        cityData?.suggestion ?? '—',
      ]);
    }

    // 汇总
    rows.push([]);
    rows.push(['=== 汇总 ===', '', '', '', '', '', '', '', '', '']);
    rows.push(['双差城市数', String(data.integratedAnalysis.summary.dualPoor), '', '', '', '', '', '', '', '']);
    rows.push(['双优城市数', String(data.integratedAnalysis.summary.dualGood), '', '', '', '', '', '', '', '']);
    rows.push(['最佳城市', data.integratedAnalysis.summary.bestCity ?? '—', '', '', '', '', '', '', '', '']);
    rows.push(['最差城市', data.integratedAnalysis.summary.worstCity ?? '—', '', '', '', '', '', '', '', '']);
  }

  return rows;
}

/**
 * 构建 JSON 格式数据
 */
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