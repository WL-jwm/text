/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 * 面板: SourceListPanel（拆分自 ExportCenterTab.tsx）
 */
import { getSourcesByCategory, useExportCenterStore } from '../../../store/exportCenterStore';
import { TechCard } from '../../UI';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { CATEGORY_ORDER } from './exportCenterConstants';
import { SourceRow } from './SourceRow';

export function SourceListPanel() {
  const { sources, selectedIds, toggleSelect, selectAll, selectNone, selectByCategory } = useExportCenterStore();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(CATEGORY_ORDER));

  const grouped = useMemo(() => getSourcesByCategory(sources), [sources]);

  const toggleCat = (cat: string) => {
    const next = new Set(expandedCats);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCats(next);
  };

  return (
    <div className="space-y-3">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 text-xs">
        <button onClick={selectAll} className="px-3 py-1 rounded bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          全选
        </button>
        <button onClick={selectNone} className="px-3 py-1 rounded bg-gw-surface text-gw-muted border border-gw-border/30 hover:bg-gw-border/30 transition-all">
          取消全选
        </button>
        <span className="text-gw-muted ml-2">
          已选 {selectedIds.size} / {sources.length} 个
        </span>
      </div>

      {/* 分类列表 */}
      {CATEGORY_ORDER.map(cat => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const expanded = expandedCats.has(cat);
        const selectedInCat = items.filter(s => selectedIds.has(s.id)).length;

        return (
          <TechCard key={cat}>
            <button
              onClick={() => toggleCat(cat)}
              className="w-full flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                {expanded ? <ChevronDown size={14} className="text-gw-muted" /> : <ChevronRight size={14} className="text-gw-muted" />}
                <span className="text-sm font-semibold text-gw-text">{cat}</span>
                <span className="text-[10px] text-gw-muted">({items.length}个模块)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] ${selectedInCat > 0 ? 'text-gw-highlight' : 'text-gw-muted/50'}`}>
                  已选 {selectedInCat}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); selectByCategory(cat); }}
                  className="text-[10px] px-2 py-0.5 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all"
                >
                  {selectedInCat === items.length ? '取消' : '选'}
                </button>
              </div>
            </button>

            {expanded && (
              <div className="space-y-1">
                {items.map(s => (
                  <SourceRow
                    key={s.id}
                    source={s}
                    selected={selectedIds.has(s.id)}
                    onToggle={() => toggleSelect(s.id)}
                  />
                ))}
              </div>
            )}
          </TechCard>
        );
      })}
    </div>
  );
}
