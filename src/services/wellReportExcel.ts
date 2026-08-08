/**
 * Q-03 报告多格式扩展 - Excel 报告生成
 * 使用 exceljs 生成多标签页 Excel 报告，含条件格式
 */
import { saveAs } from 'file-saver';
import type { WellReportData } from './wellReport';
import { SEVERITY_LABELS, formatGeneratedAt } from './wellReport';

/**
 * 生成 Excel 报告 Blob
 */
export async function buildWellReportExcel(data: WellReportData): Promise<Blob> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '河北地下水环境信息平台';
  workbook.created = new Date();

  // ============ Sheet 1: 报告摘要 ============
  const ws1 = workbook.addWorksheet('报告摘要', { views: [{ state: 'frozen', ySplit: 1 }] });

  const summaryRows = [
    ['报告编号', data.meta.reportId],
    ['生成时间', formatGeneratedAt(data.meta.generatedAt)],
    ['编制单位', data.meta.unit],
    ['', ''],
    ['监测井总数', String(data.summary.totalWells)],
    ['活跃井数', String(data.summary.activeWells)],
    ['覆盖城市', String(data.summary.cities)],
    ['含水层类型', String(data.summary.aquiferTypes)],
    ['告警总数', String(data.summary.alertCount)],
    ['严重告警', String(data.summary.criticalAlerts)],
    ['评估日期', data.summary.assessmentDate],
  ];

  for (let i = 0; i < summaryRows.length; i++) {
    const row = ws1.addRow(summaryRows[i]);
    if (i === 0) {
      row.font = { bold: true, size: 12, color: { argb: 'FF1E3A5F' } };
    } else if (summaryRows[i][0] === '') {
      row.height = 6;
    } else {
      row.font = { size: 10 };
    }
  }

  ws1.getColumn(1).width = 15;
  ws1.getColumn(2).width = 40;

  // ============ Sheet 2: 告警列表 ============
  const ws2 = workbook.addWorksheet('告警列表', { views: [{ state: 'frozen', ySplit: 1 }] });
  const alertHeader = ['井号', '类型', '严重度', '消息', '时间'];
  ws2.addRow(alertHeader).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

  for (const a of data.alerts) {
    const row = ws2.addRow([a.wellId, a.type, SEVERITY_LABELS[a.severity] ?? a.severity, a.message, a.createdAt.slice(0, 10)]);
    // 严重度条件格式
    if (a.severity === 'critical') {
      row.font = { color: { argb: 'FFC0392B' } };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } };
    } else if (a.severity === 'warning') {
      row.font = { color: { argb: 'FFD68910' } };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDEBD0' } };
    }
  }

  ws2.getColumn(1).width = 12;
  ws2.getColumn(2).width = 14;
  ws2.getColumn(3).width = 10;
  ws2.getColumn(4).width = 40;
  ws2.getColumn(5).width = 14;

  // ============ Sheet 3: 城市统计 ============
  const ws3 = workbook.addWorksheet('城市统计', { views: [{ state: 'frozen', ySplit: 1 }] });
  const cityHeader = ['城市', '井数', '含水层', '监测指标'];
  ws3.addRow(cityHeader).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

  for (const c of data.cities) {
    ws3.addRow([c.city, String(c.wellCount), c.aquifers.join(', '), c.indicators.join(', ')]);
  }

  ws3.getColumn(1).width = 12;
  ws3.getColumn(2).width = 8;
  ws3.getColumn(3).width = 30;
  ws3.getColumn(4).width = 30;

  // ============ Sheet 4: 含水层分布 ============
  if (data.aquifers.length > 0) {
    const ws4 = workbook.addWorksheet('含水层分布', { views: [{ state: 'frozen', ySplit: 1 }] });
    const aqHeader = ['含水层类型', '井数', '平均深度(m)', '城市'];
    ws4.addRow(aqHeader).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

    for (const aq of data.aquifers) {
      ws4.addRow([aq.type, String(aq.count), aq.avgDepth > 0 ? String(aq.avgDepth) : '—', aq.cities.join(', ')]);
    }

    ws4.getColumn(1).width = 16;
    ws4.getColumn(2).width = 8;
    ws4.getColumn(3).width = 14;
    ws4.getColumn(4).width = 30;
  }

  // ============ Sheet 5: 实时读数 ============
  if (data.realtime.length > 0) {
    const ws5 = workbook.addWorksheet('实时读数', { views: [{ state: 'frozen', ySplit: 1 }] });
    const rtHeader = ['井号', '井名', '水位(m)', '水质(分)', '沉降(mm)', '开采量(万m³)', '状态'];
    ws5.addRow(rtHeader).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws5.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

    for (const r of data.realtime) {
      const row = ws5.addRow([
        r.stationId,
        r.stationName,
        r.waterLevel !== undefined ? r.waterLevel.toFixed(2) : '—',
        r.waterQuality !== undefined ? r.waterQuality.toFixed(0) : '—',
        r.subsidence !== undefined ? r.subsidence.toFixed(1) : '—',
        r.extraction !== undefined ? r.extraction.toFixed(1) : '—',
        r.status,
      ]);
      // 状态条件格式
      if (r.status === 'critical') {
        row.font = { color: { argb: 'FFC0392B' } };
      } else if (r.status === 'warning') {
        row.font = { color: { argb: 'FFD68910' } };
      }
    }

    ws5.getColumn(1).width = 12;
    ws5.getColumn(2).width = 14;
    for (let c = 3; c <= 6; c++) ws5.getColumn(c).width = 12;
    ws5.getColumn(7).width = 10;
  }

  // ============ 列宽 + 条件格式 ============
  for (const ws of workbook.worksheets) {
    if (ws.conditionalFormatting) continue;
    // 对数值列应用条件格式（绿色正数/红色负数）
    try {
      ws.addConditionalFormatting({
        ref: `B2:Z${ws.rowCount}`,
        rules: [
          {
            type: 'cellIs',
            operator: 'greaterThan',
            formulae: [0],
            style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } }, font: { color: { argb: 'FF1E8449' } } },
          },
          {
            type: 'cellIs',
            operator: 'lessThan',
            formulae: [0],
            style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFADBD8' } }, font: { color: { argb: 'FFC0392B' } } },
          },
        ],
      });
    } catch { /* 条件格式出错时跳过 */ }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * 下载 Excel 报告
 */
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