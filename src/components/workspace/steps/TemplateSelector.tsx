/**
 * 自定义数据接入 — 模板选择器（自 CustomDataTab.tsx 拆分）
 */
import { FileSpreadsheet, Table } from 'lucide-react';
import { TechCard } from '../../UI';
import { DATA_TEMPLATES } from '../../../store/customDataStore';
import type { DataTemplateType } from '../../../store/customDataStore';
import { TEMPLATE_ICONS } from '../customDataUtils';

export function TemplateSelector({ onSelect }: { onSelect: (type: DataTemplateType) => void }) {
  return (
    <TechCard title="选择数据模板" icon={FileSpreadsheet}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DATA_TEMPLATES.filter(t => t.type !== 'generic').map(t => {
          const Icon = TEMPLATE_ICONS[t.type] ?? Table;
          return (
            <button
              key={t.type}
              onClick={() => onSelect(t.type)}
              className="p-4 rounded-lg border border-gw-border/20 hover:border-gw-blue/30 bg-gw-surface/30 hover:bg-gw-surface/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gw-blue/10 flex items-center justify-center group-hover:bg-gw-blue/20 transition-colors">
                  <Icon size={18} className="text-gw-highlight" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gw-text">{t.name}</p>
                  <p className="text-[10px] text-gw-muted">{t.fields.length} 个字段 ({t.fields.filter(f => f.required).length} 必填)</p>
                </div>
              </div>
              <p className="text-[10px] text-gw-muted leading-relaxed">{t.description}</p>
            </button>
          );
        })}
      </div>
    </TechCard>
  );
}
