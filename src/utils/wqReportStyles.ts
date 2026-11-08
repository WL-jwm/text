/**
 * 拆分自 waterQualityReportStyled.ts — ExcelJS 样式常量与样式工具
 */
import ExcelJS from 'exceljs';

export const HEADER_FILL: ExcelJS.FillPattern = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' },
};
export const HEADER_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFFFFFFF' },
};
export const HEADER_ALIGN: Partial<ExcelJS.Alignment> = {
  horizontal: 'center', vertical: 'middle', wrapText: true,
};

export const EXCEEDED_FILL: ExcelJS.FillPattern = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE8E8' },
};
export const EXCEEDED_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, color: { argb: 'FFC00000' },
};

export const COMPLIANT_FILL: ExcelJS.FillPattern = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' },
};
export const COMPLIANT_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, color: { argb: 'FF548235' },
};

export const ND_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, italic: true, color: { argb: 'FF808080' },
};

export const BODY_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, color: { argb: 'FF333333' },
};
export const NUM_ALIGN: Partial<ExcelJS.Alignment> = { horizontal: 'right', vertical: 'middle' };
export const TEXT_ALIGN: Partial<ExcelJS.Alignment> = { horizontal: 'left', vertical: 'middle' };
export const CENTER_ALIGN: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };

export const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
};

export const CLASS_FILLS: Record<string, ExcelJS.FillPattern> = {
  I:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } },
  II: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } },
  III:{ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } },
  IV: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } },
  V:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE8E8' } },
};
export const CLASS_FONTS: Record<string, Partial<ExcelJS.Font>> = {
  I:  { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FF548235' } },
  II: { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FF2F5496' } },
  III:{ name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFBF8F00' } },
  IV: { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFC55A11' } },
  V:  { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFC00000' } },
};

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parsePiToNumber(pi: string): number | null {
  if (!pi) return null;
  const num = parseFloat(pi);
  return isNaN(num) ? null : num;
}

export function buildFilename(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.xlsx`;
}

export function applyHeaderStyle(cell: ExcelJS.Cell) {
  cell.fill = HEADER_FILL;
  cell.font = HEADER_FONT;
  cell.alignment = HEADER_ALIGN;
  cell.border = THIN_BORDER;
}

export function applyBodyStyle(cell: ExcelJS.Cell, align: 'left' | 'center' | 'right' = 'left') {
  cell.font = BODY_FONT;
  cell.alignment = align === 'right' ? NUM_ALIGN : align === 'center' ? CENTER_ALIGN : TEXT_ALIGN;
  cell.border = THIN_BORDER;
}

export function applyClassStyle(cell: ExcelJS.Cell, className: string) {
  if (CLASS_FILLS[className]) cell.fill = CLASS_FILLS[className];
  if (CLASS_FONTS[className]) cell.font = CLASS_FONTS[className];
  cell.alignment = CENTER_ALIGN;
  cell.border = THIN_BORDER;
}

export function applyExceededRowStyle(cell: ExcelJS.Cell, align: 'left' | 'center' | 'right' = 'left') {
  cell.fill = EXCEEDED_FILL;
  cell.font = EXCEEDED_FONT;
  cell.alignment = align === 'right' ? NUM_ALIGN : align === 'center' ? CENTER_ALIGN : TEXT_ALIGN;
  cell.border = THIN_BORDER;
}

export function applyCompliantRowStyle(cell: ExcelJS.Cell, align: 'left' | 'center' | 'right' = 'left') {
  cell.fill = COMPLIANT_FILL;
  cell.font = COMPLIANT_FONT;
  cell.alignment = align === 'right' ? NUM_ALIGN : align === 'center' ? CENTER_ALIGN : TEXT_ALIGN;
  cell.border = THIN_BORDER;
}

export function applyNdStyle(cell: ExcelJS.Cell) {
  cell.font = ND_FONT;
  cell.alignment = TEXT_ALIGN;
  cell.border = THIN_BORDER;
}
