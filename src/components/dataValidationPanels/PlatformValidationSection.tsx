/**
 * 平台数据校验面板（拆分自 DataValidationPanel.tsx）
 */
import { type ModuleScanResult, type ValidationIssue, getModuleScanResult, clearValidationCache, getValidationResult } from '../../data/dataValidation';
import { useToast } from '../Toast';
import { ChevronUp, Layers, RefreshCw, ChevronDown, AlertTriangle, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PlatformValidationSection() {
  const { info } = useToast();
  const [validationResult, setValidationResult] = useState<ReturnType<typeof getValidationResult> | null>(null);
  const [scanResults, setScanResults] = useState<ModuleScanResult[]>([]);
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'issues' | 'modules'>('issues');

  const runPlatformValidation = () => {
    clearValidationCache();
    const result = getValidationResult();
    const scan = getModuleScanResult();
    setValidationResult(result);
    setScanResults(scan);
    info(`平台校验完成: ${result.summary.total}条规则, ${result.summary.error}错误, ${result.summary.warning}警告`);
  };

  useEffect(() => {
    runPlatformValidation();
  }, []);

  const toggleIssue = (idx: number) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleModule = (name: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  if (!validationResult) return null;

  const { issues, summary } = validationResult;

  // 按类别分组
  const categoryLabels: Record<string, string> = {
    consistency: '一致性', completeness: '完整性', range: '范围', freshness: '时效性',
    statistical: '统计', business: '业务',
  };
  const grouped = issues.reduce<Record<string, ValidationIssue[]>>((acc, issue) => {
    const cat = issue.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(issue);
    return acc;
  }, {});

  const levelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle size={14} className="text-red-400" />;
      case 'warning': return <AlertTriangle size={14} className="text-amber-400" />;
      case 'info': return <CheckCircle size={14} className="text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gw-muted">
          共 <span className="text-gw-text font-medium">{summary.total}</span> 条校验规则
        </p>
        <button
          onClick={runPlatformValidation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gw-blue/20 text-gw-highlight border border-gw-blue/30 rounded-lg text-xs hover:bg-gw-blue/30 transition-all"
        >
          <RefreshCw size={12} />
          重新校验
        </button>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-5 gap-2">
        <div className="p-2 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-center">
          <p className="text-lg font-bold text-gw-text">{summary.total}</p>
          <p className="text-[10px] text-gw-muted">总计</p>
        </div>
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          <p className="text-lg font-bold text-red-400">{summary.error}</p>
          <p className="text-[10px] text-red-400/70">错误</p>
        </div>
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
          <p className="text-lg font-bold text-amber-400">{summary.warning}</p>
          <p className="text-[10px] text-amber-400/70">警告</p>
        </div>
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
          <p className="text-lg font-bold text-blue-400">{summary.info}</p>
          <p className="text-[10px] text-blue-400/70">提示</p>
        </div>
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          <p className="text-lg font-bold text-red-400">{summary.blocking}</p>
          <p className="text-[10px] text-red-400/70">阻塞</p>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-1 border-b border-gw-border/20">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 ${activeTab === 'issues' ? 'text-gw-highlight border-gw-blue' : 'text-gw-muted border-transparent hover:text-gw-text'}`}
        >
          校验结果 ({issues.length})
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors border-b-2 ${activeTab === 'modules' ? 'text-gw-highlight border-gw-blue' : 'text-gw-muted border-transparent hover:text-gw-text'}`}
        >
          模块扫描 ({scanResults.length})
        </button>
      </div>

      {/* 校验结果列表 */}
      {activeTab === 'issues' && (
        <div className="space-y-1">
          {Object.entries(grouped).map(([cat, catIssues]) => (
            <div key={cat} className="space-y-1">
              <p className="text-[10px] font-medium text-gw-muted uppercase tracking-wider px-1 pt-2 pb-1">
                {categoryLabels[cat] || cat} ({catIssues.length})
              </p>
              {catIssues.map((issue,_idx) => {
                const globalIdx = issues.indexOf(issue);
                const isExpanded = expandedIssues.has(globalIdx);
                const levelColors = {
                  error: 'border-red-500/20 bg-red-500/5',
                  warning: 'border-amber-500/20 bg-amber-500/5',
                  info: 'border-blue-500/20 bg-blue-500/10',
                }[issue.level];

                return (
                  <div
                    key={globalIdx}
                    className={`rounded-lg border ${levelColors} overflow-hidden transition-all`}
                  >
                    <button
                      onClick={() => toggleIssue(globalIdx)}
                      className="w-full flex items-start gap-2 p-2 text-left"
                    >
                      {levelIcon(issue.level)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gw-text font-medium">{issue.title}</p>
                        <p className="text-[10px] text-gw-muted mt-0.5">{issue.message}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {issue.blocking && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">阻塞</span>
                        )}
                        {issue.canAutoFix && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">可修复</span>
                        )}
                        {isExpanded ? <ChevronUp size={12} className="text-gw-muted" /> : <ChevronDown size={12} className="text-gw-muted" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-2 pb-2 space-y-1.5 border-t border-gw-border/10 pt-1.5">
                        {issue.fixSuggestion && (
                          <div className="flex items-start gap-1.5">
                            <Wrench size={10} className="text-gw-muted mt-0.5 shrink-0" />
                            <p className="text-[10px] text-gw-muted leading-relaxed">
                              <span className="text-gw-text font-medium">修复建议：</span>
                              {issue.fixSuggestion}
                            </p>
                          </div>
                        )}
                        <div className="flex items-start gap-1.5">
                          <Layers size={10} className="text-gw-muted mt-0.5 shrink-0" />
                          <p className="text-[10px] text-gw-muted">
                            <span className="text-gw-text font-medium">影响模块：</span>
                            {issue.affectedModules.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* 模块扫描结果 */}
      {activeTab === 'modules' && (
        <div className="space-y-1.5">
          {scanResults.map((mod, idx) => {
            const isExpanded = expandedModules.has(mod.module);
            const statusColors = {
              ok: 'border-emerald-500/20 bg-emerald-500/5',
              warning: 'border-amber-500/20 bg-amber-500/5',
              error: 'border-red-500/20 bg-red-500/5',
            }[mod.status];
            const statusIcons = {
              ok: <CheckCircle size={12} className="text-emerald-400" />,
              warning: <AlertTriangle size={12} className="text-amber-400" />,
              error: <XCircle size={12} className="text-red-400" />,
            }[mod.status];

            return (
              <div key={idx} className={`rounded-lg border ${statusColors} overflow-hidden`}>
                <button
                  onClick={() => toggleModule(mod.module)}
                  className="w-full flex items-center gap-2 p-2 text-left"
                >
                  {statusIcons}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gw-text font-medium">{mod.label}</p>
                    <p className="text-[10px] text-gw-muted">{mod.totalRecords}条记录</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {mod.issues.length > 0 && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">{mod.issues.length}个问题</span>
                    )}
                    {isExpanded ? <ChevronUp size={12} className="text-gw-muted" /> : <ChevronDown size={12} className="text-gw-muted" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-2 pb-2 space-y-1 border-t border-gw-border/10 pt-1.5">
                    {mod.emptyFields.length > 0 && (
                      <p className="text-[10px] text-gw-muted">
                        <span className="text-amber-400 font-medium">空字段：</span>
                        {mod.emptyFields.join(', ')}
                      </p>
                    )}
                    {mod.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        {levelIcon(issue.level)}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gw-text">{issue.title}</p>
                          <p className="text-[9px] text-gw-muted">{issue.message}</p>
                        </div>
                      </div>
                    ))}
                    {mod.issues.length === 0 && mod.emptyFields.length === 0 && (
                      <p className="text-[10px] text-emerald-400/70">数据完整，无异常</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
