import React, { useState, useMemo, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, FileText, Wrench, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { TechCard } from './UI';
import { useAppStore } from '../store/useAppStore';
import { useToast } from './Toast';
import { getValidationResult, getModuleScanResult, clearValidationCache, type ValidationIssue, type ModuleScanResult } from '../data/dataValidation';

interface ValidationRule {
  field: string;
  type: 'required' | 'numeric' | 'range' | 'enum' | 'unique' | 'pattern';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
  label: string;
}

interface ValidationResult {
  rule: ValidationRule;
  status: 'pass' | 'warn' | 'fail';
  details: string;
  affectedRows: number;
}

/* ── 校验引擎 ── */
function validateDataset(
  data: Record<string, unknown>[],
  rules: ValidationRule[]
): ValidationResult[] {
  if (data.length === 0) return [];

  return rules.map(rule => {
    const { field, type, params = {}, label: _label } = rule;

    switch (type) {
      case 'required': {
        const missing = data.filter(r => !r[field] || String(r[field]).trim() === '');
        const rate = missing.length / data.length;
        return {
          rule, status: rate === 0 ? 'pass' : rate > 0.5 ? 'fail' : 'warn',
          details: `缺失${missing.length}行(${(rate * 100).toFixed(1)}%)`,
          affectedRows: missing.length,
        };
      }
      case 'numeric': {
        const nonNumeric = data.filter(r => r[field] !== undefined && r[field] !== '' && isNaN(Number(r[field])));
        return {
          rule, status: nonNumeric.length === 0 ? 'pass' : nonNumeric.length > data.length * 0.3 ? 'fail' : 'warn',
          details: `非数值${nonNumeric.length}行`,
          affectedRows: nonNumeric.length,
        };
      }
      case 'range': {
        const { min, max } = params;
        const outOfRange = data.filter(r => {
          const v = Number(r[field]);
          return !isNaN(v) && ((min !== undefined && v < min) || (max !== undefined && v > max));
        });
        return {
          rule, status: outOfRange.length === 0 ? 'pass' : outOfRange.length > data.length * 0.2 ? 'fail' : 'warn',
          details: `超出范围[${min ?? '-∞'}, ${max ?? '+∞'}] ${outOfRange.length}行`,
          affectedRows: outOfRange.length,
        };
      }
      case 'enum': {
        const allowed = new Set(params.values as string[]);
        const invalid = data.filter(r => r[field] && !allowed.has(String(r[field])));
        return {
          rule, status: invalid.length === 0 ? 'pass' : invalid.length > data.length * 0.2 ? 'fail' : 'warn',
          details: `非法值${invalid.length}行, 允许: [${Array.from(allowed).join(', ')}]`,
          affectedRows: invalid.length,
        };
      }
      case 'unique': {
        const vals = data.map(r => String(r[field] ?? ''));
        const unique = new Set(vals);
        const dupes = vals.length - unique.size;
        return {
          rule, status: dupes === 0 ? 'pass' : dupes > data.length * 0.1 ? 'fail' : 'warn',
          details: `重复${dupes}行, 唯一值${unique.size}个`,
          affectedRows: dupes,
        };
      }
      case 'pattern': {
        const regex = new RegExp(params.pattern as string);
        const noMatch = data.filter(r => r[field] && !regex.test(String(r[field])));
        return {
          rule, status: noMatch.length === 0 ? 'pass' : noMatch.length > data.length * 0.3 ? 'fail' : 'warn',
          details: `不匹配${noMatch.length}行`,
          affectedRows: noMatch.length,
        };
      }
      default:
        return { rule, status: 'pass', details: '未实现', affectedRows: 0 };
    }
  });
}

/* ── 内置规则模板 ── */
const BUILTIN_TEMPLATES: Record<string, { label: string; rules: ValidationRule[] }> = {
  '监测数据': {
    label: '地下水监测数据',
    rules: [
      { field: '监测井编号', type: 'required', label: '监测井编号' },
      { field: '监测井编号', type: 'pattern', params: { pattern: '^[A-Z]?\\d{4,}$' }, label: '编号格式' },
      { field: '水位', type: 'numeric', label: '水位数值' },
      { field: '水位', type: 'range', params: { min: -200, max: 200 }, label: '水位范围' },
      { field: '监测日期', type: 'required', label: '监测日期' },
    ],
  },
  '水质数据': {
    label: '水质检测数据',
    rules: [
      { field: '站点', type: 'required', label: '站点名称' },
      { field: 'pH', type: 'range', params: { min: 0, max: 14 }, label: 'pH范围' },
      { field: '总硬度', type: 'numeric', label: '总硬度' },
      { field: '溶解性总固体', type: 'numeric', label: 'TDS' },
      { field: '水质类别', type: 'enum', params: { values: ['I', 'II', 'III', 'IV', 'V', '劣V'] }, label: '水质类别' },
    ],
  },
  '开采量': {
    label: '地下水开采量',
    rules: [
      { field: '地区', type: 'required', label: '地区名称' },
      { field: '年份', type: 'numeric', label: '年份' },
      { field: '年份', type: 'range', params: { min: 1990, max: 2030 }, label: '年份范围' },
      { field: '开采量', type: 'numeric', label: '开采量' },
      { field: '开采量', type: 'range', params: { min: 0 }, label: '开采量非负' },
    ],
  },
};

/* ── 平台校验子组件 ── */
function PlatformValidationSection() {
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

/* ── 主面板 ── */
export function DataValidationPanel() {
  const { datasets } = useAppStore();
  const { info, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'dataset' | 'platform'>('platform');
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [results, setResults] = useState<ValidationResult[]>([]);

  const currentDataset = datasets.find(d => d.id === selectedDataset);

  const runValidation = () => {
    if (!currentDataset) {
      warning('请先选择数据集');
      return;
    }

    let rules: ValidationRule[] = [];
    if (selectedTemplate && BUILTIN_TEMPLATES[selectedTemplate]) {
      rules = BUILTIN_TEMPLATES[selectedTemplate].rules;
    } else {
      rules = currentDataset.columns.slice(0, 10).map(col => ({
        field: col,
        type: 'required' as const,
        label: col,
      }));
    }

    const existingCols = new Set(currentDataset.columns);
    const applicableRules = rules.filter(r => existingCols.has(r.field));

    const data = currentDataset.fullData || currentDataset.rawData;
    const validationResults = validateDataset(data, applicableRules);
    setResults(validationResults);
    info(`校验完成: ${validationResults.filter(r => r.status === 'pass').length}通过, ${validationResults.filter(r => r.status === 'warn').length}警告, ${validationResults.filter(r => r.status === 'fail').length}失败`);
  };

  const stats = useMemo(() => ({
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    warn: results.filter(r => r.status === 'warn').length,
    fail: results.filter(r => r.status === 'fail').length,
  }), [results]);

  return (
    <div className="space-y-4">
      {/* ── Tab切换 ── */}
      <div className="flex gap-1 border-b border-gw-border/20">
        <button
          onClick={() => setActiveTab('platform')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${activeTab === 'platform' ? 'text-gw-highlight border-gw-blue' : 'text-gw-muted border-transparent hover:text-gw-text'}`}
        >
          <Database size={14} />
          平台数据校验 (30条规则)
        </button>
        <button
          onClick={() => setActiveTab('dataset')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${activeTab === 'dataset' ? 'text-gw-highlight border-gw-blue' : 'text-gw-muted border-transparent hover:text-gw-text'}`}
        >
          <FileText size={14} />
          数据集校验
        </button>
      </div>

      {/* ── 平台校验 ── */}
      {activeTab === 'platform' && (
        <TechCard title="平台数据校验" icon={Shield} badge="v2.2">
          <PlatformValidationSection />
        </TechCard>
      )}

      {/* ── 数据集校验 ── */}
      {activeTab === 'dataset' && (
        <>
          <TechCard title="数据集校验" icon={Shield}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gw-muted block mb-1">选择数据集</label>
                  <select
                    value={selectedDataset}
                    onChange={e => { setSelectedDataset(e.target.value); setResults([]); }}
                    className="w-full px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-xs text-gw-text focus:outline-none focus:border-gw-blue/40"
                  >
                    <option value="">-- 请选择 --</option>
                    {datasets.map(ds => (
                      <option key={ds.id} value={ds.id}>{ds.name} ({ds.totalRows}行)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gw-muted block mb-1">校验模板</label>
                  <select
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-xs text-gw-text focus:outline-none focus:border-gw-blue/40"
                  >
                    <option value="">-- 自动检测 --</option>
                    {Object.entries(BUILTIN_TEMPLATES).map(([key, tmpl]) => (
                      <option key={key} value={key}>{tmpl.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {currentDataset && (
                <p className="text-xs text-gw-muted">
                  列: {currentDataset.columns.slice(0, 12).join(', ')}{currentDataset.columns.length > 12 ? ` ...共${currentDataset.columns.length}列` : ''}
                </p>
              )}

              <button
                onClick={runValidation}
                disabled={!currentDataset}
                className="flex items-center gap-2 px-4 py-2 bg-gw-blue/20 text-gw-highlight border border-gw-blue/30 rounded-lg text-xs hover:bg-gw-blue/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} />
                运行校验
              </button>
            </div>
          </TechCard>

          {results.length > 0 && (
            <TechCard title="校验结果" icon={Shield} badge={`${stats.pass}/${stats.total}通过`}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-lg font-bold text-emerald-400">{stats.pass}</p>
                  <p className="text-[10px] text-emerald-400/70">通过</p>
                </div>
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                  <p className="text-lg font-bold text-amber-400">{stats.warn}</p>
                  <p className="text-[10px] text-amber-400/70">警告</p>
                </div>
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <p className="text-lg font-bold text-red-400">{stats.fail}</p>
                  <p className="text-[10px] text-red-400/70">失败</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {results.map((r, i) => {
                  const statusConfig = {
                    pass: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                    warn: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
                    fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/10' },
                  }[r.status];
                  const Icon = statusConfig.icon;

                  return (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}>
                      <Icon size={14} className={statusConfig.color} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gw-text font-medium">{r.rule.label}</p>
                        <p className="text-[10px] text-gw-muted">{r.details}</p>
                      </div>
                      <span className={`text-[10px] font-mono ${statusConfig.color}`}>
                        {r.status === 'pass' ? 'PASS' : r.status === 'warn' ? 'WARN' : 'FAIL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </TechCard>
          )}
        </>
      )}
    </div>
  );
}
