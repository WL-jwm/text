/**
 * water quality report styled Excel export (ExcelJS)
 *
 * ExcelJS supports full cell styling (fill, font, border, alignment).
 * This replaces the SheetJS version for water quality exports only.
 * Other modules (DataQualityExcelExport) continue using SheetJS.
 *
 * 样式常量与 Sheet 构建函数已拆分至 wqReportStyles.ts / wqReportSheets.ts。
 */
import ExcelJS from 'exceljs';
import type { SampleResult, SukalovResult } from './waterQualityCalculator';
import { downloadBlob, buildFilename } from './wqReportStyles';
import {
  buildOverviewSheet, buildDetailSheet, buildExceededSheet,
  buildSukalovSheet, buildStandardSheet,
} from './wqReportSheets';

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
