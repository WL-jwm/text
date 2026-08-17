/**
 * Q-03 优化版 — Excel 报告生成
 * 同步 PDF 样式：专业摘要+含水层中文名+交替行+严重度着色+条件格式
 */
import { saveAs } from 'file-saver';
import type * as ExcelJS from 'exceljs';
import type { WellReportData } from './wellReport';
import { SEVERITY_LABELS, formatGeneratedAt } from './wellReport';

// ============================================================
// 配色方案（与 PDF/Word 统一）
// ============================================================
const STYLE = {
  headerBg: 'FF2C3E50',
  headerText: 'FFFFFFFF',
  rowAlt: 'FFF5F7FA',
  border: 'FFD0D0D8',
  critical: { bg: 'FFFADBD8', text: 'FFC0392B' },
  warning: { bg: 'FFFDEBD0', text: 'FFD68910' },
  normal: { text: 'FF1E8449' },
  primary: 'FF1A3A5C',
  accent: 'FF06B6D4',
};

// ============================================================
// 辅助函数
// ============================================================

const AQUIFER_LABELS: Record<string, string> = {
  shallowPorous: '浅层孔隙水',
  deepPorous: '深层孔隙水',
  karst: '岩溶水',
  fracture: '裂隙水',
};

const INDICATOR_LABELS: Record<string, string> = {
  waterLevel: '水位',
  waterQuality: '水质',
  subsidence: '沉降',
  extraction: '开采量',
};

function applyHeaderRow(ws: ExcelJS.Worksheet, headers: string[]): void {
  const row = ws.addRow(headers);
  row.font = { bold: true, color: { argb: STYLE.headerText }, size: 10 };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.headerBg } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
  row.height = 24;
}

function applyAltRow(ws: ExcelJS.Worksheet, row: ExcelJS.Row, index: number): void {
  if (index % 2 === 1) {
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.rowAlt } };
  }
  row.alignment = { vertical: 'middle' };
  row.height = 20;
}

function setColWidths(ws: ExcelJS.Worksheet, widths: number[]): void {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

// ============================================================
// 主生成函数
// ============================================================

export async function buildWellReportExcel(data: WellReportData): Promise<Blob> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '河北地下水环境信息平台';
  workbook.created = new Date();

  // ============ Sheet 1: 报告摘要 ============
  const ws1 = workbook.addWorksheet('报告摘要', { views: [{ state: 'frozen', ySplit: 1 }] });

  // 标题行
  ws1.mergeCells('A1:F1');
  const titleRow = ws1.getRow(1);
  titleRow.getCell(1).value = '地下水监测井网分析报告';
  titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: STYLE.primary } };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 32;

  // 分隔行
  ws1.mergeCells('A2:F2');
  const sepRow = ws1.getRow(2);
  sepRow.getCell(1).value = '──────────────────';
  sepRow.getCell(1).font = { color: { argb: STYLE.accent }, size: 10 };
  sepRow.getCell(1).alignment = { horizontal: 'center' };
  sepRow.height = 16;

  // 报告信息
  const infoData = [
    ['报告编号', data.meta.reportId],
    ['生成时间', formatGeneratedAt(data.meta.generatedAt)],
    ['编制单位', data.meta.unit],
    ['评估日期', data.summary.assessmentDate],
  ];
  infoData.forEach(([label, value], _i) => {
    const row = ws1.addRow([label, value]);
    row.getCell(1).font = { color: { argb: 'FF94A3B8' }, size: 10 };
    row.getCell(2).font = { bold: true, color: { argb: 'FF333333' }, size: 10 };
    row.height = 20;
  });

  // 空行
  ws1.addRow([]).height = 8;

  // 关键指标表头
  const keyHeaders = ['监测井总数', '覆盖城市', '运行井数', '含水层类型', '告警总数', '严重告警'];
  applyHeaderRow(ws1, keyHeaders);

  // 关键指标值
  const keyValues = [
    String(data.summary.totalWells),
    String(data.summary.cities),
    String(data.summary.activeWells),
    String(data.summary.aquiferTypes),
    String(data.summary.alertCount),
    String(data.summary.criticalAlerts),
  ];
  const kvRow = ws1.addRow(keyValues);
  kvRow.font = { bold: true, size: 12, color: { argb: STYLE.primary } };
  kvRow.alignment = { horizontal: 'center', vertical: 'middle' };
  kvRow.height = 28;
  // 给每个单元格加浅色背景
  [1, 2, 3, 4, 5, 6].forEach(c => {
    kvRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
    kvRow.getCell(c).border = {
      top: { style: 'thin', color: { argb: 'FFD0D0D8' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D8' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D8' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D8' } },
    };
  });

  setColWidths(ws1, [16, 14, 14, 14, 14, 14]);

  // ============ Sheet 2: 告警列表 ============
  const ws2 = workbook.addWorksheet('告警列表', { views: [{ state: 'frozen', ySplit: 1 }] });
  applyHeaderRow(ws2, ['井号', '类型', '严重度', '消息', '时间']);

  data.alerts.forEach((a, i) => {
    const row = ws2.addRow([a.wellId, a.type, SEVERITY_LABELS[a.severity] ?? a.severity, a.message, a.createdAt.slice(0, 10)]);
    if (a.severity === 'critical') {
      row.font = { color: { argb: STYLE.critical.text }, bold: true };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.critical.bg } };
    } else if (a.severity === 'warning') {
      row.font = { color: { argb: STYLE.warning.text }, bold: true };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.warning.bg } };
    } else {
      applyAltRow(ws2, row, i);
    }
  });

  setColWidths(ws2, [14, 12, 10, 45, 14]);

  // ============ Sheet 3: 城市统计 ============
  const ws3 = workbook.addWorksheet('城市统计', { views: [{ state: 'frozen', ySplit: 1 }] });
  applyHeaderRow(ws3, ['城市', '井数', '含水层类型', '监测指标']);

  data.cities.forEach((c, i) => {
    const row = ws3.addRow([
      c.city,
      String(c.wellCount),
      c.aquifers.map(a => AQUIFER_LABELS[a] ?? a).join('、'),
      c.indicators.map(ind => INDICATOR_LABELS[ind] ?? ind).join('、'),
    ]);
    applyAltRow(ws3, row, i);
  });

  setColWidths(ws3, [12, 8, 35, 35]);

  // ============ Sheet 4: 含水层分布 ============
  if (data.aquifers.length > 0) {
    const ws4 = workbook.addWorksheet('含水层分布', { views: [{ state: 'frozen', ySplit: 1 }] });
    applyHeaderRow(ws4, ['含水层类型', '井数', '平均深度(m)', '分布城市']);

    data.aquifers.forEach((aq, i) => {
      const row = ws4.addRow([
        AQUIFER_LABELS[aq.type] ?? aq.type,
        String(aq.count),
        aq.avgDepth > 0 ? String(aq.avgDepth.toFixed(0)) : '—',
        aq.cities.join('、'),
      ]);
      applyAltRow(ws4, row, i);
    });

    setColWidths(ws4, [18, 8, 14, 35]);
  }

  // ============ Sheet 5: 实时读数 ============
  if (data.realtime.length > 0) {
    const ws5 = workbook.addWorksheet('实时读数', { views: [{ state: 'frozen', ySplit: 1 }] });
    applyHeaderRow(ws5, ['井号', '井名', '水位(m)', '水质(分)', '沉降(mm)', '开采量(万m³)', '状态']);

    data.realtime.forEach((r, i) => {
      const statusText = r.status === 'critical' ? '严重' : r.status === 'warning' ? '预警' : r.status === 'stale' ? '过期' : '正常';
      const row = ws5.addRow([
        r.stationId,
        r.stationName,
        r.waterLevel !== undefined ? r.waterLevel.toFixed(2) : '—',
        r.waterQuality !== undefined ? r.waterQuality.toFixed(0) : '—',
        r.subsidence !== undefined ? r.subsidence.toFixed(1) : '—',
        r.extraction !== undefined ? r.extraction.toFixed(1) : '—',
        statusText,
      ]);
      // 状态着色
      if (r.status === 'critical') {
        row.font = { color: { argb: STYLE.critical.text }, bold: true };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.critical.bg } };
      } else if (r.status === 'warning') {
        row.font = { color: { argb: STYLE.warning.text }, bold: true };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.warning.bg } };
      } else {
        applyAltRow(ws5, row, i);
      }
    });

    setColWidths(ws5, [14, 16, 12, 12, 12, 14, 10]);
  }

  // ============ 全表条件格式 ============
  for (const ws of workbook.worksheets) {
    try {
      ws.addConditionalFormatting({
        ref: `A1:Z${ws.rowCount}`,
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
    } catch { /* 跳过条件格式错误 */ }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function downloadWellReportExcel(data: WellReportData): Promise<{ ok: boolean; message: string }> {
  try {
    const blob = await buildWellReportExcel(data);
    const fileName = `地下水监测报告_${data.meta.reportId.slice(0, 8)}.xlsx`;
    saveAs(blob, fileName);
    return { ok: true, message: `Excel 报告已下载: ${fileName}` };
  } catch (err) {
    return { ok: false, message: `Excel 报告生成失败: ${err instanceof Error ? err.message : '未知错误'}` };
  }
}