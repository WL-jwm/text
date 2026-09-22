/**
 * 自定义数据接入 — 数据验证步骤（自 CustomDataTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { TechCard } from '../../UI';
import { useToast } from '../../Toast';
import { useCustomDataStore, applyMapping, validateData } from '../../../store/customDataStore';
import type { ColumnMapping, CustomDataset, DataTemplate } from '../../../store/customDataStore';

export function ValidationStep({ rawData, mappings, template, datasetName, fileName, onComplete, onBack }: {
  rawData: { headers: string[]; rows: Record<string, unknown>[] };
  mappings: ColumnMapping[];
  template: DataTemplate;
  datasetName: string;
  fileName: string;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { addDataset, activateDataset } = useCustomDataStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const [importing, setImporting] = useState(false);

  const standardized = useMemo(() => applyMapping(rawData.rows, mappings, template), [rawData, mappings, template]);
  const validation = useMemo(() => validateData(standardized, template), [standardized, template]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const dataset: CustomDataset = {
        id: `cd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: datasetName,
        templateType: template.type,
        sourceFile: fileName,
        importedAt: new Date().toISOString(),
        originalColumns: rawData.headers,
        mappings,
        rows: standardized,
        rowCount: standardized.length,
        validation,
        active: true,
      };

      await addDataset(dataset);
      await activateDataset(dataset.id);
      toastSuccess(`数据集「${datasetName}」导入成功，已激活`);
      onComplete();
    } catch {
      toastError('导入失败');
    } finally {
      setImporting(false);
    }
  };

  return (
    <TechCard title="数据验证" icon={CheckCircle2}>
      <div className="space-y-3">
        {/* 验证结果摘要 */}
        <div className={`p-3 rounded-lg border ${
          validation.passed
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {validation.passed ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="text-amber-400" />
            )}
            <span className={`text-xs font-medium ${validation.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {validation.passed ? '验证通过' : '验证警告'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="text-gw-muted">总行数: <span className="text-gw-text">{validation.rowCount}</span></div>
            <div className="text-gw-muted">有效行: <span className="text-emerald-400">{validation.validRowCount}</span></div>
            {validation.missingFields.length > 0 && (
              <div className="col-span-2 text-amber-400">缺失字段: {validation.missingFields.join(', ')}</div>
            )}
          </div>
        </div>

        {/* 错误列表 */}
        {validation.errors.length > 0 && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-[10px] text-red-400 font-medium mb-1">错误</p>
            {validation.errors.map((e, i) => (
              <p key={i} className="text-[10px] text-red-400/70">{e}</p>
            ))}
          </div>
        )}

        {/* 警告列表 */}
        {validation.warnings.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] text-amber-400 font-medium mb-1">
              警告 ({validation.warnings.length})
            </p>
            <div className="max-h-32 overflow-y-auto">
              {validation.warnings.slice(0, 20).map((w, i) => (
                <p key={i} className="text-[10px] text-amber-400/70">{w}</p>
              ))}
              {validation.warnings.length > 20 && (
                <p className="text-[10px] text-amber-400/50">...还有 {validation.warnings.length - 20} 条</p>
              )}
            </div>
          </div>
        )}

        {/* 标准化数据预览 */}
        <div>
          <p className="text-[10px] text-gw-muted mb-1">标准化数据预览（前5行）</p>
          <div className="overflow-x-auto max-h-48 border border-gw-border/20 rounded">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-gw-card">
                <tr>
                  {Object.keys(standardized[0] ?? {}).map(k => (
                    <th key={k} className="px-2 py-1 text-gw-muted font-medium text-left whitespace-nowrap">
                      {template.fields.find(f => f.name === k)?.label ?? k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standardized.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-gw-border/10">
                    {Object.keys(standardized[0] ?? {}).map(k => (
                      <td key={k} className="px-2 py-1 text-gw-muted/70 whitespace-nowrap">
                        {String(row[k] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-between">
          <button onClick={onBack} className="px-3 py-1.5 rounded text-xs bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all">
            返回修改
          </button>
          <button
            onClick={handleImport}
            disabled={importing || validation.validRowCount === 0}
            className="px-4 py-1.5 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            {importing ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            确认导入并激活
          </button>
        </div>
      </div>
    </TechCard>
  );
}
