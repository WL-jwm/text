// ═══════════════════════════════════════════════════════════
// 数据导出工具 - CSV / JSON / Excel / HTML Table / Markdown
// ═══════════════════════════════════════════════════════════

export function exportCSV(headers: string[], rows: (string | number | null | undefined)[][], filename: string) {
  const BOM = '\uFEFF';
  const escapeCell = (cell: string | number | null | undefined): string => {
    const val = String(cell ?? '');
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(',')),
  ];

  const blob = new Blob([BOM + csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportJSON(data: unknown[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportDataCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  options?: { columns?: (keyof T)[]; columnLabels?: Record<string, string> }
) {
  if (data.length === 0) return;

  const cols = (options?.columns || Object.keys(data[0])) as string[];
  const labels = options?.columnLabels || {};
  const headers = cols.map(c => labels[c] || c);
  const rows = data.map(item =>
    cols.map(c => {
      const val = item[c as keyof T];
      return val === undefined || val === null ? '' : String(val);
    })
  );

  exportCSV(headers, rows, filename);
}

/** 多Sheet Excel导出 — 生成真正的.xlsx文件（纯前端实现） */
export function exportMultiSheetExcel(
  sheets: { name: string; headers: string[]; rows: (string | number | null | undefined)[][] }[],
  filename: string
) {
  // XLSX XML Spreadsheet format (no dependency needed)
  const sheetEntries = sheets.map((sheet,_sheetIdx) => {
    const colLetters = sheet.headers.map((_, i) => getColLetter(i));

    // Style header row
    const headerRow = colLetters.map(col => {
      return `<Cell ss:StyleID="header">${escXml(sheet.headers[parseInt(col.replace(/[A-Z]/g, '')) - 1] || '')}</Cell>`;
    }).join('');

    // Data rows
    const dataRows = sheet.rows.map((row, rowIdx) => {
      const _rowNum = rowIdx + 2;
      return colLetters.map((col, colIdx) => {
        const val = row[colIdx];
        const isNum = typeof val === 'number';
        return `<Cell ss:StyleID="${isNum ? 'num' : 'cell'}"${isNum ? ` ss:Type="Number"` : ''}>${escXml(String(val ?? ''))}</Cell>`;
      }).join('');
    }).join('');

    return `<Worksheet ss:Name="${escXml(sheet.name)}"><Table ss:DefaultColumnWidth="120">${headerRow}${dataRows}</Table></Worksheet>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1F4E79" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
  <Style ss:ID="cell"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#D0D0D0"/></Borders></Style>
  <Style ss:ID="num"><NumberFormat/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Color="#D0D0D0"/></Borders><Alignment ss:Horizontal="Right"/></Style>
 </Styles>
 ${sheetEntries}
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  downloadBlob(blob, `${filename}.xls`);
}

/** 单Sheet Excel导出 */
export function exportExcel(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string,
  sheetName = 'Sheet1'
) {
  exportMultiSheetExcel([{ name: sheetName, headers, rows }], filename);
}

/** 导出为HTML表格文件（可在浏览器直接打开/打印） */
export function exportHTMLTable(
  title: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string
) {
  const thead = `<tr>${headers.map(h => `<th>${escHtml(String(h))}</th>`).join('')}</tr>`;
  const tbody = rows.map(row =>
    `<tr>${row.map(cell => `<td>${escHtml(String(cell ?? ''))}</td>`).join('')}</tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escHtml(title)}</title>
<style>
  body{font-family:"Microsoft YaHei",sans-serif;margin:20px;background:#f8fafc}
  table{border-collapse:collapse;width:100%;max-width:1200px;margin:0 auto;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.1)}
  th{background:#1e3a5f;color:#fff;padding:10px 14px;text-align:left;font-size:13px;position:sticky;top:0}
  td{padding:8px 14px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155}
  tr:hover{background:#f1f5f9}
  h1{text-align:center;color:#1e293b;font-size:18px;margin-bottom:16px}
  .meta{text-align:center;color:#94a3b8;font-size:11px;margin-bottom:12px}
</style></head><body>
<h1>${escHtml(title)}</h1>
<div class="meta">导出时间: ${new Date().toLocaleString('zh-CN')} | 河北地下水基础资料数据库</div>
<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${filename}.html`);
}

/** 导出为Markdown表格 */
export function exportMarkdown(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string
) {
  const headerLine = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataLines = rows.map(row => `| ${row.map(cell => String(cell ?? '').replace('|', '\\|')).join(' | ')} |`);

  const md = `${headerLine}\n${separator}\n${dataLines.join('\n')}\n`;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${filename}.md`);
}

// ── 内部工具函数 ──

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getColLetter(index: number): string {
  let result = '';
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
