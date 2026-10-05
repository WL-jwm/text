/**
 * 全平台数据质量仪表盘 (v2.0)
 * 显示全平台数据模块扫描结果 + 跨模块一致性校验结果
 * 嵌入Workspace的validation tab中
 * 面板已拆分至 dataQualityPanels/ 子目录
 */

import { useState, useMemo } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, BarChart3, Activity, FileWarning } from 'lucide-react';
import { TechCard, StatCard } from './UI';
import { getValidationResult, getModuleScanResult, clearValidationCache, type ValidationIssue } from '../data/dataValidation';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from './ExportProgressDialog';
import { exportDataQualityExcel } from './DataQualityExcelExport';
import { type SeverityFilter, type CategoryFilter } from './dataQualityPanels/dataQualityConstants';
import { OverviewPanel } from './dataQualityPanels/OverviewPanel';
import { ValidationPanel } from './dataQualityPanels/ValidationPanel';
import { ModulesPanel } from './dataQualityPanels/ModulesPanel';

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
        <OverviewPanel validationResult={validationResult} scanResults={scanResults} moduleStats={moduleStats} categoryStats={categoryStats} />
      )}

      {activeSubTab === 'validation' && (
        <ValidationPanel severityFilter={severityFilter} categoryFilter={categoryFilter} searchText={searchText} validationResult={validationResult} filteredIssues={filteredIssues} groupedIssues={groupedIssues} setSeverityFilter={setSeverityFilter} setCategoryFilter={setCategoryFilter} setSearchText={setSearchText} />
      )}

      {activeSubTab === 'modules' && (
        <ModulesPanel searchText={searchText} filteredScan={filteredScan} setSearchText={setSearchText} />
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
