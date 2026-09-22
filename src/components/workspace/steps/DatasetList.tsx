/**
 * 自定义数据接入 — 数据集列表（自 CustomDataTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import { Trash2, Table, ChevronRight, ChevronDown, Database, Power } from 'lucide-react';
import { TechCard } from '../../UI';
import { useCustomDataStore, getTemplate } from '../../../store/customDataStore';
import type { DataTemplateType, CustomDataset } from '../../../store/customDataStore';
import { TEMPLATE_ICONS } from '../customDataUtils';

export function DatasetList() {
  const { datasets, deleteDataset, activateDataset } = useCustomDataStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  // 按类型分组
  const grouped = useMemo(() => {
    const g: Record<string, CustomDataset[]> = {};
    for (const d of datasets) {
      if (!g[d.templateType]) g[d.templateType] = [];
      g[d.templateType].push(d);
    }
    return g;
  }, [datasets]);

  if (datasets.length === 0) {
    return (
      <TechCard>
        <div className="flex flex-col items-center py-6 text-center">
          <Database size={28} className="text-gw-muted/30 mb-2" />
          <p className="text-xs text-gw-muted">暂无已导入数据集</p>
          <p className="text-[10px] text-gw-muted/60 mt-1">选择上方模板开始导入数据</p>
        </div>
      </TechCard>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <p className="text-xs text-gw-muted">已导入数据集（按类型分组）</p>
      {Object.entries(grouped).map(([type, items]) => {
        const template = getTemplate(type as DataTemplateType);
        const Icon = TEMPLATE_ICONS[type] ?? Table;
        return (
          <TechCard key={type}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-gw-highlight" />
              <span className="text-xs font-medium text-gw-text">{template?.name ?? type}</span>
              <span className="text-[10px] text-gw-muted">({items.length}个)</span>
            </div>
            <div className="space-y-1.5">
              {items.map(d => (
                <div key={d.id}>
                  <div className={`flex items-center gap-2 p-2 rounded border transition-all ${
                    d.active ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-gw-surface/20 border-gw-border/15'
                  }`}>
                    <button
                      onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                      className="p-0.5 text-gw-muted/40 hover:text-gw-text transition-colors"
                    >
                      {expanded === d.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gw-text truncate">{d.name}</span>
                        {d.active && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400 flex items-center gap-0.5">
                            <Power size={8} /> 激活
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-gw-muted">
                        {d.rowCount}行 · {new Date(d.importedAt).toLocaleDateString('zh-CN')}
                        {d.validation.warnings.length > 0 && ` · ${d.validation.warnings.length}个警告`}
                      </div>
                    </div>
                    {!d.active && (
                      <button
                        onClick={() => activateDataset(d.id)}
                        className="text-[9px] px-2 py-0.5 rounded bg-gw-surface text-gw-muted hover:text-emerald-400 border border-gw-border/30 transition-all"
                      >
                        激活
                      </button>
                    )}
                    <button
                      onClick={() => deleteDataset(d.id)}
                      className="p-0.5 text-gw-muted/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {expanded === d.id && (
                    <div className="p-2 ml-6 mt-1 rounded bg-gw-surface/20 border border-gw-border/10">
                      <div className="text-[9px] text-gw-muted space-y-0.5">
                        <p>来源文件: {d.sourceFile}</p>
                        <p>字段映射: {d.mappings.filter(m => m.targetField).length} / {d.originalColumns.length} 列已映射</p>
                        <p>验证: {d.validation.passed ? '通过' : '有警告'} · 有效{d.validation.validRowCount}行</p>
                        <p>字段: {d.mappings.filter(m => m.targetField).map(m => m.targetField).join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TechCard>
        );
      })}
    </div>
  );
}
