/**
 * 井信息报告 PDF — 主流程（buildWellReportPdf）
 */

import { saveAs } from 'file-saver';
import type { WellReportData } from './wellReport';
import { addCoverPage, addAlertTable, addCityTable, addAquiferTable, addRealtimeTable, addFooterNotes } from './wellReportPdfSections';
import { addHeader, addFooter, addPageHeader, addSectionTitle, COLORS } from './wellReportPdfBase';

export async function buildWellReportPdf(data: WellReportData): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  let pageNum = 0;

  // ============ 封面页 ============
  pageNum++;
  addCoverPage(doc, data);
  addPageHeader(doc, data.meta.reportId, pageNum);

  // 正文从第二页开始
  doc.addPage();
  pageNum++;
  addPageHeader(doc, data.meta.reportId, pageNum);

  // ============ 报告摘要 ============
  let y = 20;
  y = addSectionTitle(doc, '报告摘要', y);
  y += 4;

  doc.setFontSize(9);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

  const summaryItems = [
    { label: '监测井总数', value: `${data.summary.totalWells} 口`, color: '#0ea5e9' },
    { label: '活跃井数', value: `${data.summary.activeWells} 口`, color: '#10b981' },
    { label: '覆盖城市', value: `${data.summary.cities} 个`, color: '#8b5cf6' },
    { label: '含水层类型', value: `${data.summary.aquiferTypes} 种`, color: '#f59e0b' },
    { label: '告警总数', value: `${data.summary.alertCount} 条`, color: '#ef4444' },
    { label: '严重告警', value: `${data.summary.criticalAlerts} 条`, color: '#dc2626' },
    { label: '评估日期', value: data.summary.assessmentDate, color: '#6b7280' },
  ];

  // 两列布局的摘要卡片
  const cardW = (pageWidth - 15 * 2 - 6) / 2;
  for (let i = 0; i < summaryItems.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 15 + col * (cardW + 6);
    const cy = y + row * 18;

    // 卡片背景
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(cx, cy, cardW, 14, 2, 2, 'F');

    // 标签
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.text(summaryItems[i].label, cx + 5, cy + 5);

    // 值
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(summaryItems[i].value, cx + 5, cy + 12);
  }

  y = y + Math.ceil(summaryItems.length / 2) * 18 + 6;

  // ============ 告警摘要 ============
  y = addAlertTable(doc, data, y);

  // ============ 城市统计 ============
  y = addCityTable(doc, data, y);

  // ============ 含水层分布 ============
  y = addAquiferTable(doc, data, y);

  // ============ 实时读数 ============
  y = addRealtimeTable(doc, data, y);

  // ============ 页脚说明 ============
  addFooterNotes(doc, data, y);

  // 为所有页面添加页眉页脚（封面后的页面）
  // getNumberOfPages 为 jsPDF 内部 API，类型未公开，局部断言避免污染全局类型
  const internalApi = doc.internal as unknown as { getNumberOfPages(): number };
  const totalPages = internalApi.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addHeader(doc, data.meta.reportId);
    addFooter(doc, i - 1);
  }

  return doc.output('blob');
}

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
