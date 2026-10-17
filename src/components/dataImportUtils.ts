/**
 * 导入解析工具（拆分自 DataImportPanel.tsx）
 */
export type FileParser = 'csv' | 'json' | 'auto';

export interface ImportResult {
  headers: string[];
  rows: Record<string, unknown>[];
  preview: Record<string, unknown>[];
  errors: string[];
  warnings: string[];
}

export function parseCSV(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  // 自动检测分隔符
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < headers.length * 0.5) continue; // 跳过不完整行
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

/* ── JSON解析 ── */

export function parseJSON(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(arr[0]);
  return { headers, rows: arr };
}

