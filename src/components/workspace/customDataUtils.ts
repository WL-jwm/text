/** 解析工具 — CSV/JSON 解析（自 CustomDataTab.tsx 拆分） */
import { Beaker, FlaskConical, Scale, MapPin, Table } from 'lucide-react';
import type { ElementType } from 'react';

/** 模板图标映射（自 CustomDataTab.tsx 拆分） */
export const TEMPLATE_ICONS: Record<string, ElementType> = {
  waterQuality: Beaker,
  hydrochemistry: FlaskConical,
  balance: Scale,
  monitoringWell: MapPin,
  generic: Table,
};

export function parseCSV(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < headers.length * 0.5) continue;
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return { headers, rows };
}

export function parseJSON(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(arr[0]);
  return { headers, rows: arr };
}
