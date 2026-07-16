/**
 * water quality report styled Excel export (ExcelJS)
 *
 * ExcelJS supports full cell styling (fill, font, border, alignment).
 * This replaces the SheetJS version for water quality exports only.
 * Other modules (DataQualityExcelExport) continue using SheetJS.
 */
import ExcelJS from 'exceljs';
import type { SampleResult, SukalovResult } from './waterQualityCalculator';
import { groundwaterQualityStandard } from '../data/waterQuality';

// ═══════════════════════════════════════════════════════
// Style constants
// ═══════════════════════════════════════════════════════

const HEADER_FILL: ExcelJS.FillPattern = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' },
};
const HEADER_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFFFFFFF' },
};
const HEADER_ALIGN: Partial<ExcelJS.Alignment> = {
  horizontal: 'center', vertical: 'middle', wrapText: true,
};

const EXCEEDED_FILL: ExcelJS.FillPattern = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE8E8' },
};
const EXCEEDED_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, color: { argb: 'FFC00000' },
};

const COMPLIANT_FILL: ExcelJS.FillPattern = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' },
};
const COMPLIANT_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, color: { argb: 'FF548235' },
};

const ND_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, italic: true, color: { argb: 'FF808080' },
};

const BODY_FONT: Partial<ExcelJS.Font> = {
  name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, color: { argb: 'FF333333' },
};
const NUM_ALIGN: Partial<ExcelJS.Alignment> = { horizontal: 'right', vertical: 'middle' };
const TEXT_ALIGN: Partial<ExcelJS.Alignment> = { horizontal: 'left', vertical: 'middle' };
const CENTER_ALIGN: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
  right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
};

const CLASS_FILLS: Record<string, ExcelJS.FillPattern> = {
  I:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } },
  II: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } },
  III:{ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } },
  IV: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } },
  V:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE8E8' } },
};
const CLASS_FONTS: Record<string, Partial<ExcelJS.Font>> = {
  I:  { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FF548235' } },
  II: { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FF2F5496' } },
  III:{ name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFBF8F00' } },
  IV: { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFC55A11' } },
  V:  { name: '\u5fae\u8f6f\u96c5\u9ed1', bold: true, size: 10, color: { argb: 'FFC00000' } },
};

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parsePiToNumber(pi: string): number | null {
  if (!pi) return null;
  const num = parseFloat(pi);
  return isNaN(num) ? null : num;
}

function buildFilename(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.xlsx`;
}

function applyHeaderStyle(cell: ExcelJS.Cell) {
  cell.fill = HEADER_FILL;
  cell.font = HEADER_FONT;
  cell.alignment = HEADER_ALIGN;
  cell.border = THIN_BORDER;
}

function applyBodyStyle(cell: ExcelJS.Cell, align: 'left' | 'center' | 'right' = 'left') {
  cell.font = BODY_FONT;
  cell.alignment = align === 'right' ? NUM_ALIGN : align === 'center' ? CENTER_ALIGN : TEXT_ALIGN;
  cell.border = THIN_BORDER;
}

function applyClassStyle(cell: ExcelJS.Cell, className: string) {
  if (CLASS_FILLS[className]) cell.fill = CLASS_FILLS[className];
  if (CLASS_FONTS[className]) cell.font = CLASS_FONTS[className];
  cell.alignment = CENTER_ALIGN;
  cell.border = THIN_BORDER;
}

function applyExceededRowStyle(cell: ExcelJS.Cell, align: 'left' | 'center' | 'right' = 'left') {
  cell.fill = EXCEEDED_FILL;
  cell.font = EXCEEDED_FONT;
  cell.alignment = align === 'right' ? NUM_ALIGN : align === 'center' ? CENTER_ALIGN : TEXT_ALIGN;
  cell.border = THIN_BORDER;
}

function applyCompliantRowStyle(cell: ExcelJS.Cell, align: 'left' | 'center' | 'right' = 'left') {
  cell.fill = COMPLIANT_FILL;
  cell.font = COMPLIANT_FONT;
  cell.alignment = align === 'right' ? NUM_ALIGN : align === 'center' ? CENTER_ALIGN : TEXT_ALIGN;
  cell.border = THIN_BORDER;
}

function applyNdStyle(cell: ExcelJS.Cell) {
  cell.font = ND_FONT;
  cell.alignment = TEXT_ALIGN;
  cell.border = THIN_BORDER;
}

// ═══════════════════════════════════════════════════════
// Sheet builders (ExcelJS)
// ═══════════════════════════════════════════════════════

function buildOverviewSheet(wb: ExcelJS.Workbook, samples: SampleResult[]): ExcelJS.Worksheet {
  const ws = wb.addWorksheet('\u8bc4\u4ef7\u6982\u89c8');
  const headers = [
    '\u6c34\u6837\u540d\u79f0', '\u7efc\u5408\u8bc4\u5b9a\u7c7b\u522b', '\u7c7b\u522b\u6570\u5b57',
    '\u53c2\u8bc4\u56e0\u5b50\u6570', '\u8d85\u6807\u56e0\u5b50\u6570', '\u8d85\u6807\u56e0\u5b50\u540d\u79f0',
    '\u6700\u5927Pi\u503c', '\u8bc4\u4ef7\u7ed3\u8bba',
  ];
  const widths = [14, 12, 8, 10, 10, 36, 12, 10];
  const colTypes: ('left' | 'center' | 'right')[] = ['left', 'center', 'center', 'center', 'center', 'left', 'right', 'center'];

  // Header row
  const headerRow = ws.addRow(headers);
  headerRow.height = 22;
  headerRow.eachCell((cell) => applyHeaderStyle(cell));

  // Column widths
  ws.columns = widths.map(w => ({ width: w }));

  // Data rows
  for (const s of samples) {
    let maxPi = '-';
    let maxPiNum = -1;
    for (const f of s.factors) {
      const num = parsePiToNumber(f.Pi);
      if (num !== null && num > maxPiNum) { maxPiNum = num; maxPi = f.Pi; }
    }
    const rowValues = [
      s.sampleName,
      s.overallClassNum > 0 ? `${s.overallClass}\u7c7b` : '-',
      s.overallClassNum,
      s.factors.length,
      s.exceededCount,
      s.exceededCount > 0 ? s.exceededFactors.join('\u3001') : '\u5168\u90e8\u8fbe\u6807',
      maxPi,
      s.overallClassNum <= 3 ? '\u8fbe\u6807' : '\u8d85\u6807',
    ];
    const row = ws.addRow(rowValues);

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const isExceeded = s.overallClassNum > 3;
      if (isExceeded) {
        applyExceededRowStyle(cell, colTypes[colNumber - 1]);
      } else {
        applyCompliantRowStyle(cell, colTypes[colNumber - 1]);
      }
    });

    // Class tag cell (col 2)
    const classCell = row.getCell(2);
    applyClassStyle(classCell, s.overallClass);
  }

  return ws;
}

function buildDetailSheet(wb: ExcelJS.Workbook, samples: SampleResult[]): ExcelJS.Worksheet {
  const ws = wb.addWorksheet('\u6807\u51c6\u6307\u6570\u660e\u7ec6');
  const headers = [
    '\u6c34\u6837\u540d\u79f0', '\u8bc4\u4ef7\u56e0\u5b50', '\u5355\u4f4d',
    '\u76d1\u6d4b\u503c(\u539f\u59cb)', '\u76d1\u6d4b\u503c(\u6570\u503c)', 'S(III\u7c7b)',
    'Pi', '\u662f\u5426\u8d85\u6807', '\u8bc4\u5b9a\u7c7b\u522b',
    '\u7c7b\u522b\u6570\u5b57', '\u672a\u68c0\u51fa', '\u68c0\u51fa\u9650',
  ];
  const widths = [14, 18, 8, 18, 12, 10, 16, 8, 10, 8, 8, 10];
  ws.columns = widths.map(w => ({ width: w }));

  const headerRow = ws.addRow(headers);
  headerRow.height = 22;
  headerRow.eachCell((cell) => applyHeaderStyle(cell));

  for (let i = 0; i < samples.length; i++) {
    if (i > 0) ws.addRow([]); // empty row separator

    const s = samples[i];
    for (const f of s.factors) {
      const rowValues = [
        s.sampleName,
        f.name,
        f.unit,
        f.isND && f.detectionLimit ? `\u672a\u68c0\u51fa <${f.detectionLimit}` : f.value,
        f.numericValue,
        f.standardIII,
        f.Pi,
        f.isExceeded ? '\u662f' : '\u5426',
        f.classNum > 0 ? `${f.className}\u7c7b` : '-',
        f.classNum,
        f.isND ? '\u662f' : '\u5426',
        f.detectionLimit,
      ];
      const row = ws.addRow(rowValues);

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (f.isExceeded) {
          applyExceededRowStyle(cell, colNumber <= 3 ? 'left' : colNumber === 12 ? 'right' : 'center');
        } else {
          applyBodyStyle(cell, colNumber <= 3 ? 'left' : colNumber === 12 ? 'right' : 'center');
        }
      });

      // Not-detected style
      if (f.isND) {
        applyNdStyle(row.getCell(4));
        applyNdStyle(row.getCell(11));
      }

      // Class tag cell (col 9)
      applyClassStyle(row.getCell(9), f.className);
    }
  }

  return ws;
}

function buildExceededSheet(wb: ExcelJS.Workbook, samples: SampleResult[]): ExcelJS.Worksheet {
  const ws = wb.addWorksheet('\u8d85\u6807\u6c47\u603b');
  const headers = [
    '\u6c34\u6837\u540d\u79f0', '\u8bc4\u4ef7\u56e0\u5b50', '\u5355\u4f4d',
    '\u76d1\u6d4b\u503c', 'S(III\u7c7b)', 'Pi', '\u8bc4\u5b9a\u7c7b\u522b', '\u8d85\u6807\u500d\u6570',
  ];
  const widths = [14, 18, 8, 18, 10, 16, 10, 12];
  ws.columns = widths.map(w => ({ width: w }));

  const headerRow = ws.addRow(headers);
  headerRow.height = 22;
  headerRow.eachCell((cell) => applyHeaderStyle(cell));

  let hasExceeded = false;
  for (const s of samples) {
    for (const f of s.factors) {
      if (!f.isExceeded) continue;
      hasExceeded = true;

      const piNum = parsePiToNumber(f.Pi);
      const multiple = piNum !== null && piNum > 1 ? `${(piNum - 1).toFixed(2)}\u500d` : '-';

      const rowValues = [
        s.sampleName, f.name, f.unit, f.value,
        f.standardIII, f.Pi,
        f.classNum > 0 ? `${f.className}\u7c7b` : '-',
        multiple,
      ];
      const row = ws.addRow(rowValues);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        applyExceededRowStyle(cell, colNumber <= 4 ? 'left' : colNumber === 8 ? 'right' : 'center');
      });
      applyClassStyle(row.getCell(7), f.className);
    }
  }

  if (!hasExceeded) {
    const noteRow = ws.addRow(['\u5168\u90e8\u8fbe\u6807\uff0c\u65e0\u8d85\u6807\u56e0\u5b50']);
    noteRow.eachCell((cell) => {
      cell.font = { name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, italic: true, color: { argb: 'FF548235' } };
      cell.alignment = TEXT_ALIGN;
    });
  }

  return ws;
}

function buildSukalovSheet(wb: ExcelJS.Workbook, sukalovList?: { name: string; result: SukalovResult }[]): ExcelJS.Worksheet {
  const ws = wb.addWorksheet('\u82cf\u5361\u5217\u592b\u5206\u7c7b');
  const ionLabels = ['HCO\u2083\u207b %ep', 'SO\u2084\u00b2\u207b %ep', 'Cl\u207b %ep', 'Ca\u00b2\u207a %ep', 'Mg\u00b2\u207a %ep', 'Na\u207a %ep'];
  const headers = [
    '\u6c34\u6837\u540d\u79f0', '\u6c34\u5316\u5b66\u7c7b\u578b', '\u5206\u533a\u53f7',
    ...ionLabels, '\u9634\u79bb\u5b50\u4f18\u52bf', '\u9633\u79bb\u5b50\u4f18\u52bf',
  ];
  const widths = [14, 22, 8, 12, 12, 12, 12, 12, 12, 16, 16];
  ws.columns = widths.map(w => ({ width: w }));

  const headerRow = ws.addRow(headers);
  headerRow.height = 22;
  headerRow.eachCell((cell) => applyHeaderStyle(cell));

  if (sukalovList && sukalovList.length > 0) {
    for (const item of sukalovList) {
      const ionLabelMap: Record<string, string> = {
        HCO3: 'HCO\u2083\u207b', SO4: 'SO\u2084\u00b2\u207b', Cl: 'Cl\u207b',
        Ca: 'Ca\u00b2\u207a', Mg: 'Mg\u00b2\u207a', Na: 'Na\u207a',
      };
      const rowValues = [
        item.name,
        item.result.type,
        item.result.zone > 0 ? item.result.zone : '\u672a\u5206\u7c7b',
        item.result.anionPercentages.HCO3.toFixed(1) + '%',
        item.result.anionPercentages.SO4.toFixed(1) + '%',
        item.result.anionPercentages.Cl.toFixed(1) + '%',
        item.result.cationPercentages.Ca.toFixed(1) + '%',
        item.result.cationPercentages.Mg.toFixed(1) + '%',
        item.result.cationPercentages.Na.toFixed(1) + '%',
        item.result.anions.map(a => ionLabelMap[a] ?? a).join('\u00b7') || '\u65e0',
        item.result.cations.map(c => ionLabelMap[c] ?? c).join('\u00b7') || '\u65e0',
      ];
      const row = ws.addRow(rowValues);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const align = colNumber >= 4 && colNumber <= 9 ? 'right' : colNumber <= 3 ? 'left' : 'center';
        applyBodyStyle(cell, align);
      });
    }
  } else {
    const noteRow = ws.addRow(['\u672a\u6267\u884c\u82cf\u5361\u5217\u592b\u5206\u7c7b']);
    noteRow.eachCell((cell) => {
      cell.font = { name: '\u5fae\u8f6f\u96c5\u9ed1', size: 10, italic: true, color: { argb: 'FF808080' } };
      cell.alignment = TEXT_ALIGN;
    });
  }

  return ws;
}

function buildStandardSheet(wb: ExcelJS.Workbook): ExcelJS.Worksheet {
  const ws = wb.addWorksheet('\u8bc4\u4ef7\u6807\u51c6');
  const headers = ['\u8bc4\u4ef7\u56e0\u5b50', '\u5355\u4f4d', 'I\u7c7b', 'II\u7c7b', 'III\u7c7b', 'IV\u7c7b', 'V\u7c7b'];
  const widths = [18, 8, 14, 14, 14, 14, 14];
  ws.columns = widths.map(w => ({ width: w }));

  const headerRow = ws.addRow(headers);
  headerRow.height = 22;
  headerRow.eachCell((cell) => applyHeaderStyle(cell));

  const factors = groundwaterQualityStandard.evaluationFactors as {
    name: string; unit: string; I: string; II: string; III: string; IV: string; V: string;
  }[];

  for (const f of factors) {
    const row = ws.addRow([f.name, f.unit, f.I, f.II, f.III, f.IV, f.V]);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      applyBodyStyle(cell, colNumber <= 2 ? 'left' : 'center');
    });
  }

  return ws;
}

// ═══════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════

export async function exportStyledWaterQualityReport(
  samples: SampleResult[],
  sukalovList?: { name: string; result: SukalovResult }[],
  filename?: string,
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = '\u6cb3\u5317\u7701\u5730\u4e0b\u6c34\u73af\u5883\u4fe1\u606f\u5e73\u53f0';

  buildOverviewSheet(wb, samples);
  buildDetailSheet(wb, samples);
  buildExceededSheet(wb, samples);
  buildSukalovSheet(wb, sukalovList);
  buildStandardSheet(wb);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, buildFilename(filename ?? '\u6c34\u8d28\u8bc4\u4ef7\u62a5\u544a'));
}
