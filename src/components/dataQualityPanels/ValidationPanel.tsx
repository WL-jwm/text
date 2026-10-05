/**
 * 数据质量仪表盘 — 面板: ValidationPanel（拆分自 DataQualityDashboard.tsx）
 */

import { CheckCircle, Filter, Search } from 'lucide-react';
import { TechCard } from '../UI';
import { getValidationResult, ValidationIssue } from '../../data/dataValidation';
import { levelIcon, levelColor, levelBg } from './dqUtils';
import type { SeverityFilter, CategoryFilter } from './dataQualityConstants';
import type { Dispatch, SetStateAction } from 'react';

interface ValidationPanelProps {
  severityFilter: SeverityFilter;
  categoryFilter: CategoryFilter;
  searchText: string;
  validationResult: ReturnType<typeof getValidationResult>;
  filteredIssues: ValidationIssue[];
  groupedIssues: Record<string, ValidationIssue[]>;
  setSeverityFilter: Dispatch<SetStateAction<SeverityFilter>>;
  setCategoryFilter: Dispatch<SetStateAction<CategoryFilter>>;
  setSearchText: Dispatch<SetStateAction<string>>;
}

export function ValidationPanel({ severityFilter, categoryFilter, searchText, validationResult, filteredIssues, groupedIssues, setSeverityFilter, setCategoryFilter, setSearchText }: ValidationPanelProps) {
  return (
    <>
          {/* 筛选栏 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-gw-surface/50 border border-gw-border/20 rounded-lg">
              <Search size={12} className="text-gw-muted" />
              <input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="搜索问题..."
                className="bg-transparent text-xs text-gw-text outline-none w-32 placeholder:text-gw-muted/50"
              />
            </div>
            <div className="flex gap-1">
              {([
                { key: 'all' as SeverityFilter, label: '全部' },
                { key: 'error' as SeverityFilter, label: '错误' },
                { key: 'warning' as SeverityFilter, label: '警告' },
                { key: 'info' as SeverityFilter, label: '信息' },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setSeverityFilter(f.key)}
                  className={`px-2 py-1 rounded text-[10px] transition-all ${
                    severityFilter === f.key
                      ? 'bg-gw-blue/20 text-gw-highlight'
                      : 'text-gw-muted hover:text-gw-text'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {([
                { key: 'all' as CategoryFilter, label: '所有类别' },
                { key: 'consistency' as CategoryFilter, label: '一致性' },
                { key: 'completeness' as CategoryFilter, label: '完整性' },
                { key: 'range' as CategoryFilter, label: '范围' },
                { key: 'freshness' as CategoryFilter, label: '新鲜度' },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setCategoryFilter(f.key)}
                  className={`px-2 py-1 rounded text-[10px] transition-all ${
                    categoryFilter === f.key
                      ? 'bg-gw-blue/20 text-gw-highlight'
                      : 'text-gw-muted hover:text-gw-text'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-gw-muted ml-auto">
              显示 {filteredIssues.length}/{validationResult.summary.total} 项
            </span>
          </div>

          {/* 分组显示 */}
          {Object.entries(groupedIssues).map(([catLabel, issues]) => (
            <TechCard
              key={catLabel}
              title={catLabel}
              icon={Filter}
              badge={`${issues.length}项`}
            >
              <div className="space-y-1.5">
                {issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded-lg border ${levelBg(issue.level)}`}
                  >
                    {levelIcon(issue.level)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gw-text font-medium">{issue.title}</p>
                      <p className="text-[10px] text-gw-muted">{issue.message}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {issue.affectedModules.map(m => (
                          <span
                            key={m}
                            className="px-1.5 py-0.5 text-[9px] bg-gw-surface/50 text-gw-muted rounded border border-gw-border/20"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-mono ${levelColor(issue.level)}`}>
                        {issue.level.toUpperCase()}
                      </span>
                      {issue.blocking && (
                        <span className="px-1 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded">阻塞</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TechCard>
          ))}

          {filteredIssues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gw-muted/50">
              <CheckCircle size={32} className="mb-2" />
              <p className="text-xs">
                {searchText || severityFilter !== 'all' || categoryFilter !== 'all'
                  ? '无匹配的校验问题'
                  : '全部校验通过，数据质量良好'}
              </p>
            </div>
          )}
    </>
  );
}
