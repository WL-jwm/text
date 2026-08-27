/**
 * 井信息报告 PDF — 基础样式与页眉页脚
 */

import type { jsPDF } from 'jspdf';

export const COLORS = {
  primary: [30, 60, 114] as const,     // 深蓝
  secondary: [44, 62, 80] as const,    // 深灰蓝
  accent: [6, 182, 212] as const,       // 青色
  text: [55, 65, 81] as const,          // 正文
  muted: [100, 116, 139] as const,      // 辅助
  light: [148, 163, 184] as const,      // 轻量
  bg: [245, 247, 250] as const,         // 背景
  white: [255, 255, 255] as const,
  red: [239, 68, 68] as const,
  amber: [245, 158, 11] as const,
  green: [16, 185, 129] as const,
};

// ============ 页眉页脚 ============

export function addHeader(doc: jsPDF, reportId: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  // 顶部色条
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 4, 'F');
  // 报告编号
  doc.setFontSize(7);
  doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.text(`地下水监测报告 | ${reportId}`, 15, 8, { align: 'left' });
}

export function addFooter(doc: jsPDF, pageNum: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // 底部线条
  doc.setDrawColor(220, 220, 230);
  doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);
  // 页码
  doc.setFontSize(7);
  doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.text(`第 ${pageNum} 页`, pageWidth - 15, pageHeight - 7, { align: 'right' });
  doc.text('河北省地下水环境信息平台', 15, pageHeight - 7, { align: 'left' });
}

export function addPageHeader(doc: jsPDF, reportId: string, pageNum: number): void {
  addHeader(doc, reportId);
  addFooter(doc, pageNum);
}

// ============ 章节标题 ============

export function addSectionTitle(doc: jsPDF, title: string, y: number, pageMargin: number = 15): number {
  // 左侧色条
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(pageMargin, y - 5, 3, 12, 'F');
  // 标题文字
  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(title, pageMargin + 8, y + 2);
  return y + 12;
}

// ============ 封面页 ============

