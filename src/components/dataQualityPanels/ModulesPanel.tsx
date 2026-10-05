/**
 * 数据质量仪表盘 — 面板: ModulesPanel（拆分自 DataQualityDashboard.tsx）
 */

import { Database, Search } from 'lucide-react';
import { getModuleScanResult } from '../../data/dataValidation';
import { statusIcon, levelIcon, levelColor, levelBg } from './dqUtils';
import type { Dispatch, SetStateAction } from 'react';

interface ModulesPanelProps {
  searchText: string;
  filteredScan: ReturnType<typeof getModuleScanResult>;
  setSearchText: Dispatch<SetStateAction<string>>;
}

export function ModulesPanel({ searchText, filteredScan, setSearchText }: ModulesPanelProps) {
  return (
    <>
          {/* 搜索 */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gw-surface/50 border border-gw-border/20 rounded-lg w-64">
            <Search size={12} className="text-gw-muted" />
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索模块..."
              className="bg-transparent text-xs text-gw-text outline-none placeholder:text-gw-muted/50"
            />
          </div>

          {/* 模块列表 */}
          <div className="space-y-1.5">
            {filteredScan.map((r) => (
              <div
                key={r.module + r.label}
                className={`rounded-lg border transition-all ${
                  r.status === 'ok' ? 'bg-gw-surface/30 border-gw-border/20'
                    : r.status === 'warning' ? 'bg-amber-500/3 border-amber-500/10'
                      : 'bg-red-500/3 border-red-500/10'
                }`}
              >
                {/* 模块头部 */}
                <div className="flex items-center gap-3 p-3">
                  {statusIcon(r.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gw-text font-medium">{r.label}</p>
                      <span className="px-1.5 py-0.5 text-[9px] bg-gw-surface/50 text-gw-muted rounded">{r.category}</span>
                    </div>
                    <p className="text-[10px] text-gw-muted">
                      模块: {r.module} · {r.totalRecords}条记录
                      {r.emptyFields.length > 0 && ` · ${r.emptyFields.length}个空字段`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.issues.length > 0 && (
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                        r.status === 'error' ? 'bg-red-500/15 text-red-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {r.issues.length}问题
                      </span>
                    )}
                    {r.issues.length === 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/15 text-emerald-400">
                        正常
                      </span>
                    )}
                  </div>
                </div>

                {/* 展开详情 */}
                {r.issues.length > 0 && (
                  <div className="px-3 pb-2 border-t border-gw-border/10">
                    <div className="pt-1.5 space-y-1">
                      {r.issues.map((issue, j) => (
                        <div
                          key={j}
                          className={`flex items-center gap-2 p-1.5 rounded border ${levelBg(issue.level)}`}
                        >
                          {levelIcon(issue.level)}
                          <p className="flex-1 text-[10px] text-gw-text">{issue.message}</p>
                          <span className={`text-[9px] font-mono ${levelColor(issue.level)}`}>
                            {issue.level.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredScan.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gw-muted/50">
              <Database size={32} className="mb-2" />
              <p className="text-xs">无匹配的数据模块</p>
            </div>
          )}
    </>
  );
}
