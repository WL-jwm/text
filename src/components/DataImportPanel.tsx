import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Trash2, Eye, CheckCircle, AlertCircle, Table, X, ChevronDown, Download } from 'lucide-react';
import { TechCard } from './UI';
import { useAppStore, ImportedDataset } from '../store/useAppStore';
import { useToast } from './Toast';

/* ── CSV解析（纯前端） ── */
function parseCSV(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
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
function parseJSON(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(arr[0]);
  return { headers, rows: arr };
}

type FileParser = 'csv' | 'json' | 'auto';

interface ImportResult {
  headers: string[];
  rows: Record<string, unknown>[];
  preview: Record<string, unknown>[];
  errors: string[];
  warnings: string[];
}

export function DataImportPanel() {
  const {success, error} = useToast();
  const { addDataset, datasets, deleteDataset } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [parser, setParser] = useState<FileParser>('auto');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [datasetTags, setDatasetTags] = useState('');
  const [, ] = useState(false);
  const [viewingDataset, setViewingDataset] = useState<string>('');
  const [_viewPage, setViewPage] = useState(0);
  const _PAGE_SIZE = 50;

  // 已导入数据集
  const importedSets = datasets;

  // ── 文件处理 ──
  const handleFile = useCallback(async (file: File) => {
    setImporting(true);
    setResult(null);
    setFileName(file.name);
    setDatasetName(file.name.replace(/\.[^.]+$/, ''));

    try {
      const text = await file.text();
      let headers: string[] = [];
      let rows: Record<string, unknown>[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      const ext = file.name.split('.').pop()?.toLowerCase();
      const detectedType = parser === 'auto'
        ? (ext === 'json' ? 'json' : 'csv')
        : parser;

      if (detectedType === 'json') {
        try {
          const parsed = parseJSON(text);
          headers = parsed.headers;
          rows = parsed.rows;
        } catch {
          errors.push('JSON解析失败，请检查文件格式');
        }
      } else {
        const parsed = parseCSV(text);
        headers = parsed.headers;
        rows = parsed.rows;
        if (headers.length === 0) {
          errors.push('CSV文件为空或格式异常');
        }
        // 检查列数不一致
        if (rows.length > 0) {
          const rowLengths = rows.map(r => Object.keys(r).length);
          const uniqueLengths = [...new Set(rowLengths)];
          if (uniqueLengths.length > 1) {
            warnings.push(`${uniqueLengths.length}种不同列数 detected，部分行可能缺失数据`);
          }
        }
      }

      // 数据量警告
      if (rows.length > 10000) {
        warnings.push(`数据量较大(${rows.length}行)，预览仅显示前100行`);
      }

      const preview = rows.slice(0, 100);
      setResult({ headers, rows, preview, errors, warnings });
    } catch (err) {
      error('文件读取失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setImporting(false);
    }
  }, [parser, error]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── 确认导入 ──
  const confirmImport = async () => {
    if (!result || result.errors.length > 0) return;
    try {
      const tags = datasetTags.split(/[,，\s]+/).filter(Boolean);
      await addDataset({
        name: datasetName || fileName,
        description: `通过${parser === 'json' ? 'JSON' : 'CSV'}导入`,
        source: parser === 'json' ? 'json' : 'csv',
        sheetCount: 1,
        totalRows: result.rows.length,
        columns: result.headers,
        rawData: result.preview,
        fullData: result.rows,
        tags,
      });
      success(`已导入: ${datasetName} (${result.rows.length}行, ${result.headers.length}列)`);
      setResult(null);
      setFileName('');
      setDatasetName('');
      setDatasetTags('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      error('导入失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  // ── 删除已导入数据集 ──
  const handleDelete = async (id: string, name: string) => {
    await deleteDataset(id);
    if (viewingDataset === id) setViewingDataset('');
    success(`已删除: ${name}`);
  };

  // ── 导出数据集为CSV ──
  const handleExportCSV = (ds: ImportedDataset) => {
    const data = ds.fullData || ds.rawData;
    if (!data || data.length === 0) return;
    const headers = ds.columns;
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      csvRows.push(headers.map(h => {
        const val = String(row[h] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','));
    });
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ds.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success(`已导出: ${ds.name}.csv (${data.length}行)`);
  };

  // 当前查看的数据集
  const viewingDs = importedSets.find(d => d.id === viewingDataset);
  const _viewingData = viewingDs ? (viewingDs.fullData || viewingDs.rawData || []) : [];

  return (
    <div className="space-y-4">
      {/* ── 上传区域 ── */}
      <TechCard title="数据导入" icon={Upload} badge={importedSets.length > 0 ? `${importedSets.length}个数据集` : undefined}>
        {/* 格式选择 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gw-muted">解析格式:</span>
          {(['auto', 'csv', 'json'] as const).map(t => (
            <button key={t} onClick={() => setParser(t)}
              className={`px-3 py-1 rounded text-xs border transition-all ${
                parser === t
                  ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
                  : 'text-gw-muted border-gw-border/30 hover:border-gw-border'
              }`}>
              {t === 'auto' ? '自动检测' : t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 拖拽区域 */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            importing
              ? 'border-gw-blue/40 bg-gw-blue/5'
              : 'border-gw-border/40 hover:border-gw-blue/40 hover:bg-gw-blue/5'
          }`}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.json,.txt"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {importing ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-2 border-gw-blue/40 border-t-gw-blue rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gw-muted">解析中...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={24} className="mx-auto text-gw-muted/60" />
              <p className="text-sm text-gw-text">拖拽文件至此 或 点击选择</p>
              <p className="text-xs text-gw-muted">支持 CSV / TSV / JSON / TXT</p>
            </div>
          )}
        </div>

        {/* 解析结果 */}
        {result && (
          <div className="mt-4 space-y-3">
            {/* 文件信息 */}
            <div className="flex items-center justify-between p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gw-cyan" />
                <div>
                  <p className="text-sm text-gw-text font-medium">{fileName}</p>
                  <p className="text-xs text-gw-muted">{result.rows.length} 行 x {result.headers.length} 列</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.errors.length === 0 ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={12} /> 可导入</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> 有错误</span>
                )}
                <button onClick={() => setResult(null)} className="p-1 text-gw-muted hover:text-gw-text rounded"><X size={14} /></button>
              </div>
            </div>

            {/* 错误和警告 */}
            {result.errors.length > 0 && (
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-400">{e}</p>
                ))}
              </div>
            )}
            {result.warnings.length > 0 && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-1">
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-400">{w}</p>
                ))}
              </div>
            )}

            {/* 导入选项 */}
            {result.errors.length === 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gw-muted block mb-1">数据集名称</label>
                    <input
                      value={datasetName}
                      onChange={e => setDatasetName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-sm text-gw-text focus:outline-none focus:border-gw-blue/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gw-muted block mb-1">标签(逗号分隔)</label>
                    <input
                      value={datasetTags}
                      onChange={e => setDatasetTags(e.target.value)}
                      placeholder="监测, 2024, 石家庄"
                      className="w-full px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-sm text-gw-text focus:outline-none focus:border-gw-blue/40"
                    />
                  </div>
                </div>

                {/* 列预览 */}
                <div className="p-2 bg-gw-surface/30 rounded-lg">
                  <p className="text-xs text-gw-muted mb-1">列: {result.headers.slice(0, 15).join(', ')}{result.headers.length > 15 ? ` ...共${result.headers.length}列` : ''}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={confirmImport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gw-blue/20 text-gw-highlight border border-gw-blue/30 rounded-lg text-sm hover:bg-gw-blue/30 transition-all"
                  >
                    <CheckCircle size={14} />
                    确认导入
                  </button>
                  <button
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="flex items-center gap-1 px-3 py-2 text-gw-muted border border-gw-border/30 rounded-lg text-sm hover:border-gw-border transition-all"
                  >
                    <Eye size={14} />
                    预览
                    <ChevronDown size={12} className={`transition-transform ${previewOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* 数据预览表格 */}
                {previewOpen && (
                  <div className="border border-gw-border/30 rounded-lg overflow-auto max-h-64 scrollbar-thin">
                    <table className="w-full text-xs">
                      <thead className="bg-gw-surface/60 sticky top-0">
                        <tr>
                          {result.headers.map(h => (
                            <th key={h} className="px-3 py-2 text-left text-gw-muted font-medium border-b border-gw-border/20 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.preview.slice(0, 20).map((row, i) => (
                          <tr key={i} className="border-b border-gw-border/10 hover:bg-gw-surface/30">
                            {result.headers.map(h => (
                              <td key={h} className="px-3 py-1.5 text-gw-text whitespace-nowrap max-w-[200px] truncate">
                                {String(row[h] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.rows.length > 20 && (
                      <p className="text-xs text-gw-muted text-center py-2">... 共{result.rows.length}行</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </TechCard>

      {/* ── 已导入数据集列表 ── */}
      {importedSets.length > 0 && (
        <TechCard title="已导入数据集" icon={Table} badge={`${importedSets.length}个`}>
          <div className="space-y-2">
            {importedSets.map(ds => (
              <div key={ds.id} className="flex items-center justify-between p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 group hover:border-gw-blue/20 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gw-text font-medium truncate">{ds.name}</p>
                    <span className="px-1.5 py-0.5 text-[10px] bg-gw-blue/10 text-gw-highlight rounded">{ds.source.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-gw-muted mt-0.5">
                    {ds.totalRows}行 x {ds.columns.length}列
                    {ds.tags.length > 0 && (
                      <span className="ml-2">
                        {ds.tags.map(t => (
                          <span key={t} className="inline-block px-1 py-0.5 mr-1 text-[10px] bg-gw-surface rounded border border-gw-border/20">{t}</span>
                        ))}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gw-muted/50 mt-0.5">导入于 {new Date(ds.importedAt).toLocaleString('zh-CN')}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => { setViewingDataset(ds.id); setViewPage(0); }}
                    className="p-1.5 text-gw-muted/40 hover:text-gw-blue rounded"
                    title="查看"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleExportCSV(ds)}
                    className="p-1.5 text-gw-muted/40 hover:text-emerald-400 rounded"
                    title="导出CSV"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(ds.id, ds.name)}
                    className="p-1.5 text-gw-muted/40 hover:text-red-400 rounded"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      )}

      {/* ── 使用说明 ── */}
      <TechCard title="使用说明" icon={FileText}>
        <div className="space-y-2 text-xs text-gw-muted">
          <p><strong className="text-gw-text">CSV格式</strong>: 支持逗号、制表符、分号分隔，首行为表头</p>
          <p><strong className="text-gw-text">JSON格式</strong>: 数组或单对象，自动提取字段名</p>
          <p><strong className="text-gw-text">大文件</strong>: 超过10000行时预览仅显示前100行，完整数据保存在本地</p>
          <p><strong className="text-gw-text">数据存储</strong>: 使用浏览器IndexedDB，清除浏览器数据会丢失导入数据</p>
        </div>
      </TechCard>
    </div>
  );
}
