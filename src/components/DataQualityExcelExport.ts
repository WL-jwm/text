/**
 * 数据质量Excel导出工具
 * 使用SheetJS库生成多Sheet xlsx文件
 */
import * as XLSX from 'xlsx';
import {
  getValidationResult,
  getModuleScanResult,
} from '../data/dataValidation';
import { dataSourceRegistry } from '../data/dataSourceRegistry';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDataQualityExcel() {
  const validation = getValidationResult();
  const scanResults = getModuleScanResult();

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: 模块扫描结果 ──
  const scanRows = scanResults.map(r => ({
    '模块标识': r.module,
    '模块标签': r.label,
    '数据类别': r.category,
    '记录数': r.totalRecords,
    '状态': r.status === 'ok' ? '正常' : r.status === 'warning' ? '警告' : '异常',
    '问题数': r.issues.length,
    '空字段': r.emptyFields.join(', '),
  }));
  const ws1 = XLSX.utils.json_to_sheet(scanRows);
  // 列宽
  ws1['!cols'] = [
    { wch: 20 }, { wch: 25 }, { wch: 14 },
    { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '模块扫描');

  // ── Sheet 2: 校验问题 ──
  const issueRows = validation.issues.map((issue, i) => ({
    '序号': i + 1,
    '级别': issue.level,
    '类别': issue.category,
    '问题标题': issue.title,
    '详细说明': issue.message,
    '涉及模块': issue.affectedModules.join(', '),
    '是否阻塞': issue.blocking ? '是' : '否',
  }));
  const ws2 = XLSX.utils.json_to_sheet(issueRows);
  ws2['!cols'] = [
    { wch: 6 }, { wch: 8 }, { wch: 14 },
    { wch: 30 }, { wch: 50 }, { wch: 20 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, '校验问题');

  // ── Sheet 3: 数据源注册 ──
  const registryRows = dataSourceRegistry.map(s => ({
    '模块': s.module,
    '类别': s.category,
    '数据来源': s.source,
    '数据年份': s.dataYears,
    '更新频率': s.updateFrequency,
    '可靠度': s.reliability,
  }));
  const ws3 = XLSX.utils.json_to_sheet(registryRows);
  ws3['!cols'] = [
    { wch: 20 }, { wch: 14 }, { wch: 40 },
    { wch: 12 }, { wch: 10 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, '数据源注册');

  // ── Sheet 4: 统计摘要 ──
  const okCount = scanResults.filter(r => r.status === 'ok').length;
  const warnCount = scanResults.filter(r => r.status === 'warning').length;
  const errCount = scanResults.filter(r => r.status === 'error').length;
  const totalRecords = scanResults.reduce((s, r) => s + r.totalRecords, 0);
  const score = scanResults.length > 0
    ? Math.max(0, Math.round((okCount / scanResults.length) * 100 - validation.summary.error * 3))
    : 0;

  const summaryRows = [
    { '指标': '数据模块总数', '数值': scanResults.length, '说明': '涵盖A-T共20个数据类别' },
    { '指标': '数据记录总数', '数值': totalRecords, '说明': '所有模块的数组数据记录合计' },
    { '指标': '正常模块', '数值': okCount, '说明': `占比${scanResults.length > 0 ? ((okCount / scanResults.length) * 100).toFixed(1) : 0}%` },
    { '指标': '警告模块', '数值': warnCount, '说明': `占比${scanResults.length > 0 ? ((warnCount / scanResults.length) * 100).toFixed(1) : 0}%` },
    { '指标': '异常模块', '数值': errCount, '说明': `占比${scanResults.length > 0 ? ((errCount / scanResults.length) * 100).toFixed(1) : 0}%` },
    { '指标': '校验问题总数', '数值': validation.summary.total, '说明': `错误${validation.summary.error}/警告${validation.summary.warning}/信息${validation.summary.info}` },
    { '指标': '阻塞问题', '数值': validation.summary.blocking, '说明': '建议在发布前修复' },
    { '指标': '综合评分', '数值': score, '说明': score >= 90 ? '数据质量优良' : score >= 70 ? '数据质量一般' : '需要修复' },
  ];
  const ws4 = XLSX.utils.json_to_sheet(summaryRows);
  ws4['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws4, '统计摘要');

  // 生成并下载
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  downloadBlob(blob, `数据质量报告_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
