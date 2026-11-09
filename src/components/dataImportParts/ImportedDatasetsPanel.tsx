/**
 * 拆分自 DataImportPanel.tsx — 已导入数据集列表面板
 * （自持查看/删除/CSV导出逻辑）
 */

import { useState } from 'react';
import { Table, Eye, Download, Trash2 } from 'lucide-react';
import { TechCard } from '../UI';
import { useToast } from '../Toast';
import { useAppStore, type ImportedDataset } from '../../store/useAppStore';

export function ImportedDatasetsPanel({ importedSets }: { importedSets: ImportedDataset[] }) {
  const { success } = useToast();
  const { deleteDataset } = useAppStore();
  const [viewingDataset, setViewingDataset] = useState<string>('');
  const [_viewPage, setViewPage] = useState(0);

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

  if (importedSets.length === 0) return null;

  return (
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
  );
}
