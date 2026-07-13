import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { dataSourceRegistry } from '../../data/dataSourceRegistry';
import type { DataSourceEntry } from '../../data/dataSourceRegistry';

interface DataSourceTagProps {
  /** 数据模块名称，对应 dataSourceRegistry 中的 module 字段 */
  module: string;
  /** 可选：覆盖自动查找的数据源描述 */
  source?: string;
}

/**
 * DataSourceTag — 数据来源追溯标签
 *
 * 在图表卡片右上角显示一个小标签，鼠标悬浮展开完整的数据来源信息。
 * module 对应 dataSourceRegistry 中的注册条目，自动查找 category/source/dataYears/reliability。
 *
 * Usage:
 *   <DataSourceTag module="resources" />
 *   // 悬浮显示: [F-水资源] 河北省水资源公报(2024) | 2022-2024 | 年度 | 可靠度:高
 */
export function DataSourceTag({ module, source }: DataSourceTagProps) {
  const [expanded, setExpanded] = useState(false);

  const entry = React.useMemo<DataSourceEntry | undefined>(
    () => dataSourceRegistry.find(r => r.module === module),
    [module]
  );

  const reliabilityColor = entry?.reliability === '高'
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : entry?.reliability === '中'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-gw-muted bg-gw-surface border-gw-border/20';

  if (!entry && !source) return null;

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-gw-muted/50 border border-gw-border/20 bg-gw-surface/30 hover:border-gw-cyan/30 hover:text-gw-cyan/70 transition-all"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        type="button"
      >
        <Database size={9} />
        <span>{entry?.category?.split('-')[0] ?? ''}</span>
      </button>

      {expanded && entry && (
        <div className="absolute z-50 top-full right-0 mt-1 w-72 p-3 rounded-lg bg-gw-bg border border-gw-border/30 shadow-xl text-[10px] space-y-1.5 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gw-text">{entry.module}</span>
            <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono ${reliabilityColor}`}>
              {entry.reliability}
            </span>
          </div>
          <div className="space-y-1 text-gw-muted">
            <div className="flex gap-1">
              <span className="text-gw-muted/60 flex-shrink-0">类别:</span>
              <span className="text-gw-text/80">{entry.category}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-gw-muted/60 flex-shrink-0">来源:</span>
              <span className="text-gw-text/80">{source || entry.source}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-gw-muted/60 flex-shrink-0">年份:</span>
              <span className="font-mono text-gw-text/80">{entry.dataYears}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-gw-muted/60 flex-shrink-0">频次:</span>
              <span className="text-gw-text/80">{entry.updateFrequency}</span>
            </div>
            {entry.primaryDoc && (
              <div className="flex gap-1">
                <span className="text-gw-muted/60 flex-shrink-0">文献:</span>
                <span className="text-gw-text/60">{entry.primaryDoc}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
