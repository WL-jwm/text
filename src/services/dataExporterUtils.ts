/**
 * 数据导出器 — 通用工具
 *  告警消息 / Blob下载 / CSV转换
 */

import { saveAs } from 'file-saver';
import type { WellAlert } from './wellAlerts';

export function alertMessage(a: WellAlert): string {
  if (a.severity === 'stale') return '数据过期，无最新读数';
  const t = a.threshold;
  if (t.direction === 'above') {
    return `当前 ${a.value.toFixed(1)}${a.unit}（预警≥${t.warning}，超标≥${t.critical}）`;
  }
  return `当前 ${a.value.toFixed(1)}${a.unit}（预警≤${t.warning}，超标≤${t.critical}）`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  saveAs(blob, fileName);
}

// ============ CSV 导出 ============

/**
 * 将二维数组转换为 CSV 字符串
 */
export function arrayToCSV(rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  return rows.map(row => row.map(escape).join(',')).join('\n');
}

/**
 * 导出 CSV
 */
