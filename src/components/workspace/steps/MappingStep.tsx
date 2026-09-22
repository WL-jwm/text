/**
 * 自定义数据接入 — 列名映射步骤（自 CustomDataTab.tsx 拆分）
 */
import { useState } from 'react';
import { ChevronRight, ChevronDown, ArrowRight, RefreshCw } from 'lucide-react';
import { TechCard } from '../../UI';
import { autoMapColumns } from '../../../store/customDataStore';
import type { ColumnMapping, DataTemplate } from '../../../store/customDataStore';

export function MappingStep({ headers, mappings, onMappingChange, template, onNext, onBack }: {
  headers: string[];
  mappings: ColumnMapping[];
  onMappingChange: (m: ColumnMapping[]) => void;
  template: DataTemplate;
  onNext: () => void;
  onBack: () => void;
}) {
  const [expandedPreview, setExpandedPreview] = useState(false);

  const updateMapping = (idx: number, targetField: string) => {
    const field = template.fields.find(f => f.name === targetField);
    const next = [...mappings];
    next[idx] = {
      ...next[idx],
      targetField,
      type: field?.type ?? 'string',
    };
    onMappingChange(next);
  };

  const autoMap = () => {
    onMappingChange(autoMapColumns(headers, template));
  };

  const mappedCount = mappings.filter(m => m.targetField).length;
  const requiredMapped = template.fields.filter(f => f.required && mappings.some(m => m.targetField === f.name)).length;
  const requiredTotal = template.fields.filter(f => f.required).length;

  return (
    <TechCard title="列名映射" icon={ArrowRight}>
      <div className="space-y-3">
        {/* 映射统计 */}
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-gw-muted">
            已映射: <span className="text-gw-highlight">{mappedCount}</span> / {headers.length}
          </span>
          <span className={requiredMapped === requiredTotal ? 'text-emerald-400' : 'text-amber-400'}>
            必填: {requiredMapped} / {requiredTotal}
          </span>
          <button onClick={autoMap} className="px-2 py-0.5 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all flex items-center gap-1">
            <RefreshCw size={10} />
            重新自动映射
          </button>
        </div>

        {/* 映射表 */}
        <div className="space-y-1.5">
          {mappings.map((m, idx) => {
            const field = template.fields.find(f => f.name === m.targetField);
            return (
              <div key={idx} className="flex items-center gap-2 p-2 rounded bg-gw-surface/30 border border-gw-border/15">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gw-text">{m.sourceColumn}</span>
                  {field?.required && m.targetField && (
                    <span className="text-[9px] text-gw-blue/60 ml-1">必填</span>
                  )}
                </div>
                <ArrowRight size={12} className="text-gw-muted/40" />
                <select
                  value={m.targetField}
                  onChange={e => updateMapping(idx, e.target.value)}
                  className="flex-1 bg-gw-surface border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
                >
                  <option value="">— 不映射 —</option>
                  {template.fields.map(f => (
                    <option key={f.name} value={f.name}>
                      {f.label}{f.required ? ' *' : ''}{f.unit ? ` (${f.unit})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* 预览 */}
        <button
          onClick={() => setExpandedPreview(!expandedPreview)}
          className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
        >
          {expandedPreview ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          数据预览
        </button>
        {expandedPreview && (
          <div className="overflow-x-auto max-h-48 border border-gw-border/20 rounded">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-gw-card">
                <tr>
                  {headers.map(h => (
                    <th key={h} className="px-2 py-1 text-gw-muted font-medium text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(5, headers.length > 0 ? 3 : 0) }).map((_, i) => (
                  <tr key={i} className="border-t border-gw-border/10">
                    {headers.map(h => (
                      <td key={h} className="px-2 py-1 text-gw-muted/70 whitespace-nowrap">—</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-between">
          <button onClick={onBack} className="px-3 py-1.5 rounded text-xs bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all">
            返回
          </button>
          <button
            onClick={onNext}
            disabled={requiredMapped < requiredTotal}
            className="px-4 py-1.5 rounded text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            下一步: 验证
          </button>
        </div>
      </div>
    </TechCard>
  );
}
