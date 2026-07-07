/**
 * 全平台数据质量仪表盘 (v2.0)
 * 显示全平台数据模块扫描结果 + 跨模块一致性校验结果
 * 嵌入Workspace的validation tab中
 */
import React, { useState, useMemo } from 'react';
import {
  Shield, CheckCircle, AlertTriangle, XCircle, Info,
  RefreshCw, Database, BarChart3,
  Layers, Activity, FileWarning, Filter, Search,
} from 'lucide-react';
import { TechCard, StatCard } from './UI';
import {
  getValidationResult,
  getModuleScanResult,
  clearValidationCache,

  ValidationIssue,
} from '../data/dataValidation';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from './ExportProgressDialog';
import { exportDataQualityExcel } from './DataQualityExcelExport';

type SeverityFilter = 'all' | 'error' | 'warning' | 'info';
type CategoryFilter = 'all' | 'consistency' | 'completeness' | 'range' | 'freshness';

export function DataQualityDashboard() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchText, setSearchText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'validation' | 'modules'>('overview');
  const [exportOpen, setExportOpen] = useState(false);

  const validationResult = useMemo(() => getValidationResult(), []);
  const scanResults = useMemo(() => getModuleScanResult(), []);

  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'dataQuality',
    collector: async () => ({
      validationResult: getValidationResult(),
      scanResults: getModuleScanResult(),
    }),
    autoCollect: true,
  });

  const handleRefresh = () => {
    clearValidationCache();
    window.location.reload();
  };

  // 统计数据
  const moduleStats = useMemo(() => {
    const ok = scanResults.filter(r => r.status === 'ok').length;
    const warn = scanResults.filter(r => r.status === 'warning').length;
    const err = scanResults.filter(r => r.status === 'error').length;
    const totalRecords = scanResults.reduce((s, r) => s + r.totalRecords, 0);
    return { ok, warn, err, total: scanResults.length, totalRecords };
  }, [scanResults]);

  // 分类统计
  const categoryStats = useMemo(() => {
    const cats = new Set(scanResults.map(r => r.category));
    return [...cats].map(cat => ({
      name: cat,
      count: scanResults.filter(r => r.category === cat).length,
      issues: scanResults.filter(r => r.category === cat).reduce((s, r) => s + r.issues.length, 0),
    })).sort((a, b) => b.count - a.count);
  }, [scanResults]);

  // 筛选校验问题
  const filteredIssues = useMemo(() => {
    let issues = validationResult.issues;

    if (severityFilter !== 'all') {
      issues = issues.filter(i => i.level === severityFilter);
    }
    if (categoryFilter !== 'all') {
      issues = issues.filter(i => i.category === categoryFilter);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      issues = issues.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        i.affectedModules.some(m => m.toLowerCase().includes(q))
      );
    }

    return issues;
  }, [validationResult, severityFilter, categoryFilter, searchText]);

  // 筛选模块扫描结果
  const filteredScan = useMemo(() => {
    if (!searchText.trim()) return scanResults;
    const q = searchText.toLowerCase();
    return scanResults.filter(r =>
      r.module.toLowerCase().includes(q) ||
      r.label.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }, [scanResults, searchText]);

  // 按类别分组的校验问题
  const groupedIssues = useMemo(() => {
    const groups: Record<string, ValidationIssue[]> = {};
    for (const issue of filteredIssues) {
      const catLabel = {
        consistency: '一致性',
        completeness: '完整性',
        range: '范围',
        freshness: '新鲜度',
      }[issue.category] || issue.category;
      if (!groups[catLabel]) groups[catLabel] = [];
      groups[catLabel].push(issue);
    }
    return groups;
  }, [filteredIssues]);

  const statusIcon = (status: string) => {
    if (status === 'ok') return <CheckCircle size={14} className="text-emerald-400" />;
    if (status === 'warning') return <AlertTriangle size={14} className="text-amber-400" />;
    return <XCircle size={14} className="text-red-400" />;
  };

  const levelIcon = (level: string) => {
    if (level === 'error') return <XCircle size={14} className="text-red-400" />;
    if (level === 'warning') return <AlertTriangle size={14} className="text-amber-400" />;
    return <Info size={14} className="text-blue-400" />;
  };

  const levelColor = (level: string) => {
    if (level === 'error') return 'text-red-400';
    if (level === 'warning') return 'text-amber-400';
    return 'text-blue-400';
  };

  const levelBg = (level: string) => {
    if (level === 'error') return 'bg-red-500/5 border-red-500/10';
    if (level === 'warning') return 'bg-amber-500/5 border-amber-500/10';
    return 'bg-blue-500/5 border-blue-500/10';
  };

  return (
    <div className="space-y-4">
      {/* ── 头部 ── */}
      <TechCard title="全平台数据质量" icon={Shield}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gw-muted">
            扫描 {moduleStats.total} 个数据模块，共 {moduleStats.totalRecords.toLocaleString()} 条记录
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-xs text-gw-muted hover:text-gw-text hover:border-gw-blue/30 transition-all"
          >
            <RefreshCw size={12} />
            刷新
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={exportDataQualityExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs hover:bg-emerald-500/25 transition-all"
            >
              导出Excel
            </button>
            <button
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 rounded-lg text-xs hover:bg-gw-blue/25 transition-all"
            >
              导出Word报告
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard
            title="模块正常"
            value={moduleStats.ok}
            unit={`/${moduleStats.total}`}
            icon={CheckCircle}
            accent="green"
          />
          <StatCard
            title="模块警告"
            value={moduleStats.warn}
            unit="个"
            icon={AlertTriangle}
            accent="amber"
          />
          <StatCard
            title="模块异常"
            value={moduleStats.err}
            unit="个"
            icon={XCircle}
            accent="red"
          />
          <StatCard
            title="校验问题"
            value={validationResult.summary.total}
            unit={`(E${validationResult.summary.error}/W${validationResult.summary.warning})`}
            icon={FileWarning}
            accent={validationResult.summary.blocking > 0 ? 'red' : 'blue'}
          />
        </div>

        {/* 质量评分 */}
        <div className="mt-3 p-3 bg-gw-surface/30 rounded-lg border border-gw-border/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gw-text font-medium">数据质量综合评分</span>
            <span className={`text-sm font-bold ${
              moduleStats.total > 0 && moduleStats.ok === moduleStats.total && validationResult.summary.error === 0
                ? 'text-emerald-400'
                : validationResult.summary.error > 3 ? 'text-red-400' : 'text-amber-400'
            }`}>
              {moduleStats.total > 0
                ? Math.round((moduleStats.ok / moduleStats.total) * 100 - validationResult.summary.error * 3)
                : 0}
              分
            </span>
          </div>
          <div className="w-full h-2 bg-gw-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                moduleStats.total > 0 && moduleStats.ok === moduleStats.total && validationResult.summary.error === 0
                  ? 'bg-emerald-500'
                  : validationResult.summary.error > 3 ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100,
                  (moduleStats.ok / Math.max(moduleStats.total, 1)) * 100 - validationResult.summary.error * 3
                ))}%`
              }}
            />
          </div>
          {validationResult.summary.blocking > 0 && (
            <p className="mt-1.5 text-[10px] text-red-400/70">
              存在 {validationResult.summary.blocking} 个阻塞问题，建议在发布前修复
            </p>
          )}
        </div>
      </TechCard>

      {/* ── 子Tab切换 ── */}
      <div className="flex gap-2">
        {([
          { key: 'overview' as const, label: '总览', icon: BarChart3 },
          { key: 'validation' as const, label: '交叉校验', icon: Activity },
          { key: 'modules' as const, label: '模块扫描', icon: Database },
        ]).map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeSubTab === tab.key
                  ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
                  : 'text-gw-muted border-gw-border/20 hover:border-gw-border hover:text-gw-text'
              }`}
            >
              <Icon size={13} />
              {tab.label}
              {tab.key === 'validation' && validationResult.summary.total > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gw-surface">{validationResult.summary.total}</span>
              )}
              {tab.key === 'modules' && scanResults.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gw-surface">{scanResults.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 总览 ── */}
      {activeSubTab === 'overview' && (
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
      )}

      {/* ── 交叉校验 ── */}
      {activeSubTab === 'validation' && (
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
      )}

      {/* ── 模块扫描 ── */}
      {activeSubTab === 'modules' && (
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
      )}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="dataQuality"
        reportLabel="数据质量报告"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}
