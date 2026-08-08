/**
 * Q-03 报告多格式扩展 - PDF 报告生成
 * 使用 jspdf + jspdf-autotable 生成可下载的 PDF 报告
 */
import { saveAs } from 'file-saver';
import type { WellReportData } from './wellReport';
import { SEVERITY_LABELS, formatGeneratedAt } from './wellReport';

/**
 * 生成 PDF 报告 Blob
 */
export async function buildWellReportPdf(data: WellReportData): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ============ 封面标题 ============
  doc.setFontSize(20);
  doc.setTextColor(30, 60, 114);
  doc.text('地下水监测井网分析报告', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`报告编号: ${data.meta.reportId}`, pageWidth / 2, 42, { align: 'center' });
  doc.text(`生成时间: ${formatGeneratedAt(data.meta.generatedAt)}`, pageWidth / 2, 50, { align: 'center' });
  doc.text(`编制单位: ${data.meta.unit}`, pageWidth / 2, 58, { align: 'center' });

  // 分隔线
  doc.setDrawColor(200, 200, 210);
  doc.line(margin, 65, pageWidth - margin, 65);

  // ============ 摘要 ============
  let y = 75;
  doc.setFontSize(14);
  doc.setTextColor(30, 60, 114);
  doc.text('报告摘要', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  const summaryLines = [
    `监测井总数: ${data.summary.totalWells} 口（活跃 ${data.summary.activeWells} 口）`,
    `覆盖城市: ${data.summary.cities} 个`,
    `含水层类型: ${data.summary.aquiferTypes} 种`,
    `告警数量: ${data.summary.alertCount} 条（严重 ${data.summary.criticalAlerts} 条）`,
    `评估日期: ${data.summary.assessmentDate}`,
  ];
  for (const line of summaryLines) {
    doc.text(`• ${line}`, margin + 2, y);
    y += 6;
  }

  // ============ 告警摘要 ============
  y += 4;
  doc.setFontSize(14);
  doc.setTextColor(30, 60, 114);
  doc.text('告警摘要', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  if (data.alerts.length > 0) {
    const alertRows = data.alerts.slice(0, 20).map(a => [
      a.wellId,
      a.type,
      SEVERITY_LABELS[a.severity] ?? a.severity,
      a.message,
      a.createdAt.slice(0, 10),
    ]);
    (doc as any).autoTable({
      startY: y,
      head: [['井号', '类型', '严重度', '消息', '时间']],
      body: alertRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.text('无告警记录', margin + 2, y);
    y += 8;
  }

  // ============ 城市统计 ============
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(14);
  doc.setTextColor(30, 60, 114);
  doc.text('城市统计', margin, y);
  y += 8;

  if (data.cities.length > 0) {
    const cityRows = data.cities.map(c => [
      c.city,
      String(c.wellCount),
      c.aquifers.join(', '),
      c.indicators.join(', '),
    ]);
    (doc as any).autoTable({
      startY: y,
      head: [['城市', '井数', '含水层', '监测指标']],
      body: cityRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ============ 超标说明 ============
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('阈值说明: 水位 >30m 为预警, >40m 为严重; 水质 <80分 为预警, <70分 为严重', margin, y);
  y += 5;
  doc.text('数据来源: 河北省地下水环境信息平台', margin, y);

  return doc.output('blob');
}

/**
 * 下载 PDF 报告
 */
export async function downloadWellReportPdf(data: WellReportData): Promise<{ ok: boolean; message: string }> {
  try {
    const blob = await buildWellReportPdf(data);
    const fileName = `地下水监测报告_${data.meta.reportId.slice(0, 8)}.pdf`;
    saveAs(blob, fileName);
    return { ok: true, message: `PDF 报告已下载: ${fileName}` };
  } catch (err) {
    return { ok: false, message: `PDF 报告生成失败: ${err instanceof Error ? err.message : '未知错误'}` };
  }
}