/**
 * 井健康报告服务 (G-14) — 工具函数
 * 拆分自 wellReport.ts：时段格式化 / 生成时间 / 阈值备注
 */

import { ALERT_THRESHOLDS } from './realtimeDataService';
import type { DataChannel } from './realtimeDataService';
import { CHANNEL_LABELS } from './wellReportConstants';
export function formatPeriod(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 格式化生成时间为本地字符串
 */
export function formatGeneratedAt(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 获取通道阈值文本（用于报告附注）
 */
export function getThresholdNote(): string {
  const lines: string[] = [];
  for (const ch of ['waterLevel', 'waterQuality', 'subsidence', 'extraction'] as DataChannel[]) {
    const t = ALERT_THRESHOLDS[ch];
    if (!t) continue;
    const label = CHANNEL_LABELS[ch];
    if (t.direction === 'above') {
      lines.push(`${label}：正常<${t.warning}，预警${t.warning}~${t.critical}，超标≥${t.critical}`);
    } else {
      lines.push(`${label}：正常>${t.warning}，预警${t.critical}~${t.warning}，超标≤${t.critical}`);
    }
  }
  return lines.join('\n');
}
