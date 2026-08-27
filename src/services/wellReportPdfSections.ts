/**
 * 井信息报告 PDF — 页面区块构建
 *  封面 / 告警表 / 城市表 / 含水层表 / 实时表 / 页脚注释
 */

import type { jsPDF } from 'jspdf';
import type { CellHookData } from 'jspdf-autotable';
import type { WellReportData } from './wellReport';
import { SEVERITY_LABELS, formatGeneratedAt } from './wellReport';
import { COLORS, addSectionTitle } from './wellReportPdfBase';

export function addCoverPage(doc: jsPDF, data: WellReportData): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 顶部装饰色块
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');
  // 底部装饰色块
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  // 标题
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('地下水监测井网分析报告', pageWidth / 2, 42, { align: 'center' });

  // 装饰线
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, 50, pageWidth / 2 + 40, 50);

  // 报告信息
  const infoStartY = 100;
  doc.setFontSize(11);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);

  const infoLines = [
    { label: '报告编号', value: data.meta.reportId },
    { label: '生成时间', value: formatGeneratedAt(data.meta.generatedAt) },
    { label: '编制单位', value: data.meta.unit },
    { label: '评估日期', value: data.summary.assessmentDate },
  ];

  // 信息卡片
  const cardX = pageWidth / 2 - 60;
  const cardW = 120;
  doc.setFillColor(COLORS.bg[0], COLORS.bg[1], COLORS.bg[2]);
  doc.roundedRect(cardX, infoStartY - 10, cardW, infoLines.length * 14 + 10, 3, 3, 'F');

  for (let i = 0; i < infoLines.length; i++) {
    const line = infoLines[i];
    const iy = infoStartY + i * 14;
    doc.setFontSize(9);
    doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.text(line.label, cardX + 10, iy);
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(line.value, cardX + 45, iy);
  }

  // 摘要统计 - 底部
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`监测井 ${data.summary.totalWells} 口  ·  覆盖 ${data.summary.cities} 市  ·  含水层 ${data.summary.aquiferTypes} 种  ·  告警 ${data.summary.alertCount} 条`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  return 75; // 返回正文起始 y
}

// ============ 告警摘要表格 ============

export function addAlertTable(doc: jsPDF, data: WellReportData, startY: number): number {
  let y = startY;
  y = addSectionTitle(doc, '告警摘要', y);
  y += 4;

  if (data.alerts.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text('无告警记录', 17, y);
    return y + 10;
  }

  const alertRows = data.alerts.slice(0, 20).map(a => {
    const severityLabel = SEVERITY_LABELS[a.severity] ?? a.severity;
    return [a.wellId, a.type, severityLabel, a.message, a.createdAt.slice(0, 10)];
  });

  doc.autoTable({
    startY: y,
    head: [['井号', '类型', '严重度', '消息', '时间']],
    body: alertRows,
    margin: { left: 15, right: 15 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [210, 210, 220], lineWidth: 0.1 },
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 16 },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 20, halign: 'center' },
    },
    didParseCell: (data: CellHookData) => {
      // 严重度着色
      if (data.column.index === 2) {
        const severity = data.cell.raw;
        if (severity === '严重') {
          data.cell.styles.fillColor = [254, 226, 226];
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else if (severity === '预警') {
          data.cell.styles.fillColor = [254, 243, 199];
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

// ============ 城市统计表格 ============

export function addCityTable(doc: jsPDF, data: WellReportData, startY: number): number {
  let y = startY;

  // 检查是否需要换页
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  y = addSectionTitle(doc, '城市统计', y);
  y += 4;

  if (data.cities.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text('无城市数据', 17, y);
    return y + 10;
  }

  const cityRows = data.cities.map(c => [
    c.city,
    String(c.wellCount),
    c.aquifers.join('、'),
    c.indicators.map(i => {
      const labels: Record<string, string> = { waterLevel: '水位', waterQuality: '水质', subsidence: '沉降', extraction: '开采' };
      return labels[i] ?? i;
    }).join('、'),
  ]);

  doc.autoTable({
    startY: y,
    head: [['城市', '井数', '含水层类型', '监测指标']],
    body: cityRows,
    margin: { left: 15, right: 15 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [210, 210, 220], lineWidth: 0.1 },
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 50 },
      3: { cellWidth: 'auto' },
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

// ============ 含水层分布 ============

export function addAquiferTable(doc: jsPDF, data: WellReportData, startY: number): number {
  let y = startY;

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  y = addSectionTitle(doc, '含水层分布', y);
  y += 4;

  if (data.aquifers.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text('无含水层数据', 17, y);
    return y + 10;
  }

  const aqRows = data.aquifers.map(aq => {
    const typeLabels: Record<string, string> = { shallowPorous: '浅层孔隙水', deepPorous: '深层孔隙水', karst: '岩溶水', fracture: '裂隙水' };
    return [typeLabels[aq.type] ?? aq.type, String(aq.count), aq.avgDepth > 0 ? `${aq.avgDepth.toFixed(0)}m` : '—', aq.cities.join('、')];
  });

  doc.autoTable({
    startY: y,
    head: [['含水层类型', '井数', '平均深度', '分布城市']],
    body: aqRows,
    margin: { left: 15, right: 15 },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [210, 210, 220], lineWidth: 0.1 },
    headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 'auto' },
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

// ============ 实时读数 ============

export function addRealtimeTable(doc: jsPDF, data: WellReportData, startY: number): number {
  let y = startY;

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  y = addSectionTitle(doc, '实时读数', y);
  y += 4;

  if (data.realtime.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text('无实时数据', 17, y);
    return y + 10;
  }

  const rtRows = data.realtime.slice(0, 25).map(r => [
    r.stationId,
    r.stationName,
    r.waterLevel !== undefined ? r.waterLevel.toFixed(2) : '—',
    r.waterQuality !== undefined ? `${r.waterQuality.toFixed(0)}` : '—',
    r.subsidence !== undefined ? r.subsidence.toFixed(1) : '—',
    r.extraction !== undefined ? r.extraction.toFixed(1) : '—',
    r.status === 'critical' ? '严重' : r.status === 'warning' ? '预警' : r.status === 'stale' ? '过期' : '正常',
  ]);

  doc.autoTable({
    startY: y,
    head: [['井号', '井名', '水位(m)', '水质(分)', '沉降(mm)', '开采量', '状态']],
    body: rtRows,
    margin: { left: 15, right: 15 },
    styles: { fontSize: 7.5, cellPadding: 1.5, lineColor: [210, 210, 220], lineWidth: 0.1 },
    headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 16 },
      1: { cellWidth: 20 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 14, halign: 'center' },
    },
    didParseCell: (data: CellHookData) => {
      if (data.column.index === 6) {
        const status = data.cell.raw;
        if (status === '严重') {
          data.cell.styles.fillColor = [254, 226, 226];
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === '预警') {
          data.cell.styles.fillColor = [254, 243, 199];
          data.cell.styles.textColor = [180, 83, 9];
        } else if (status === '过期') {
          data.cell.styles.fillColor = [240, 240, 245];
          data.cell.styles.textColor = [100, 100, 120];
        }
      }
    },
  });

  return doc.lastAutoTable.finalY + 8;
}

// ============ 页脚说明 ============

export function addFooterNotes(doc: jsPDF, data: WellReportData, startY: number): void {
  let y = startY;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // 分隔线
  doc.setDrawColor(200, 200, 210);
  doc.setLineWidth(0.3);
  doc.line(15, y, 195, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);

  const notes = [
    '阈值说明: 水位 >30m 预警, >40m 严重; 水质 <80分 预警, <70分 严重; 沉降 >10mm 预警, >20mm 严重',
    `数据来源: 河北省地下水环境信息平台 · 报告编号: ${data.meta.reportId} · 共 ${data.summary.totalWells} 口监测井`,
    '免责声明: 本报告仅供参考，不构成专业法律意见。数据如有疑问请联系编制单位。',
  ];

  for (const note of notes) {
    doc.text(note, 15, y);
    y += 5;
  }
}

// ============ 主生成函数 ============

