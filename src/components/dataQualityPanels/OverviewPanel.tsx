/**
 * 数据质量仪表盘 — 面板: OverviewPanel（拆分自 DataQualityDashboard.tsx）
 */

import { BarChart3, Layers, FileWarning } from 'lucide-react';
import { TechCard } from '../UI';
import { getValidationResult, getModuleScanResult } from '../../data/dataValidation';
import { statusIcon, levelIcon } from './dqUtils';

interface OverviewPanelProps {
  validationResult: ReturnType<typeof getValidationResult>;
  scanResults: ReturnType<typeof getModuleScanResult>;
  moduleStats: { ok: number; warn: number; err: number; total: number; totalRecords: number };
  categoryStats: { name: string; count: number; issues: number }[];
}

export function OverviewPanel({ validationResult, scanResults, moduleStats, categoryStats }: OverviewPanelProps) {
  return (
    <>
          {/* 分类统计 */}
          <TechCard title="数据类别统计" icon={Layers}>
            <div className="space-y-2">
              {categoryStats.map(cat => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-xs text-gw-muted w-24 truncate">{cat.name}</span>
                  <div className="flex-1 h-2 bg-gw-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gw-blue/60 rounded-full"
                      style={{ width: `${(cat.count / moduleStats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gw-muted w-8 text-right">{cat.count}</span>
                  {cat.issues > 0 && (
                    <span className="text-[10px] text-amber-400">{cat.issues}issues</span>
                  )}
                </div>
              ))}
            </div>
          </TechCard>

          {/* 问题摘要 */}
          {validationResult.summary.total > 0 && (
            <TechCard title="问题摘要" icon={FileWarning} badge={`${validationResult.summary.total}项`}>
              <div className="space-y-1.5">
                {/* ERROR 列表 */}
                {validationResult.issues.filter(i => i.level === 'error').slice(0, 5).map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                    {levelIcon(issue.level)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gw-text">{issue.title}</p>
                      <p className="text-[10px] text-gw-muted truncate">{issue.message}</p>
                    </div>
                    {issue.blocking && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded">阻塞</span>
                    )}
                  </div>
                ))}
                {/* WARNING 列表 */}
                {validationResult.issues.filter(i => i.level === 'warning').slice(0, 5).map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                    {levelIcon(issue.level)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gw-text">{issue.title}</p>
                      <p className="text-[10px] text-gw-muted truncate">{issue.message}</p>
                    </div>
                  </div>
                ))}
                {validationResult.summary.total > 10 && (
                  <p className="text-[10px] text-gw-muted text-center py-1">
                    切换到"交叉校验"标签查看全部 {validationResult.summary.total} 项问题
                  </p>
                )}
              </div>
            </TechCard>
          )}

          {/* 模块健康度网格 */}
          <TechCard title="模块健康度" icon={BarChart3}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {scanResults.map(r => (
                <div
                  key={r.module + r.label}
                  className={`p-2 rounded-lg border text-center ${
                    r.status === 'ok' ? 'bg-emerald-500/5 border-emerald-500/10'
                      : r.status === 'warning' ? 'bg-amber-500/5 border-amber-500/10'
                        : 'bg-red-500/5 border-red-500/10'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {statusIcon(r.status)}
                    <span className="text-xs text-gw-text truncate max-w-[120px]">{r.label}</span>
                  </div>
                  <p className="text-[10px] text-gw-muted">
                    {r.totalRecords}条{r.issues.length > 0 ? ` · ${r.issues.length}问题` : ''}
                  </p>
                </div>
              ))}
            </div>
          </TechCard>
    </>
  );
}
