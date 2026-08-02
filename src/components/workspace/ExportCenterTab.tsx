/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Download, FileSpreadsheet, FileText, FileJson, CheckCircle2, Circle,
  Loader2, Trash2, Package, History, ListChecks, Layers,
  ChevronDown, ChevronRight, AlertCircle,
} from 'lucide-react';

import { TechCard, StatCard, DataSourceNote } from '../UI';
import { useToast } from '../Toast';
import {
  useExportCenterStore, getSourcesByCategory, generateFilename,
  type ExportSource, type ExportCategory, type ExportFormat,
} from '../../store/exportCenterStore';
import { usePipelineStore } from '../../store/usePipelineStore';
import { buildExportTasks, executeExport, type ExportResult } from '../../utils/batchExporter';

type PanelKey = 'sources' | 'export' | 'history' | 'pipeline';

const PANELS: { key: PanelKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'sources', label: '数据源', icon: ListChecks, desc: '27个模块数据源总览与采集状态' },
  { key: 'export', label: '批量导出', icon: Download, desc: '选择模块 → 选择格式 → 一键导出' },
  { key: 'history', label: '导出历史', icon: History, desc: '历史导出记录与重新导出' },
  { key: 'pipeline', label: 'Pipeline数据包', icon: Package, desc: '数据总线已发布数据包导出' },
];

const FORMAT_CONFIG: Record<ExportFormat, { label: string; icon: React.ElementType; desc: string; color: string }> = {
  excel: { label: 'Excel', icon: FileSpreadsheet, desc: '多Sheet合并为单个.xlsx文件', color: 'text-emerald-400' },
  word: { label: 'Word', icon: FileText, desc: '多章节合并为单个.docx报告', color: 'text-blue-400' },
  json: { label: 'JSON', icon: FileJson, desc: '全量数据打包为.json文件', color: 'text-amber-400' },
};

const CATEGORY_ORDER: ExportCategory[] = [
  '区域概况', '水质评价', '水量与均衡', '环境地质',
  '专题评价', '数值模拟', '环评与保护区', '数据管理',
  '风险评估', '合规检查', '修复评估',
];

export function ExportCenterTab() {
  const [panel, setPanel] = useState<PanelKey>('sources');
  const store = useExportCenterStore();
  const { init } = store;

  useEffect(() => { init(); }, [init]);

  const readyCount = store.sources.filter(s => s.isReady).length;
  const selectedCount = store.selectedIds.size;

  return (
    <div className="space-y-4">
      {/* 标题卡 */}
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gw-text flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            统一导出中心
          </h2>
          <span className="text-xs text-gw-muted">D-02</span>
        </div>
        <p className="text-xs text-gw-muted">
          27 个模块数据源统一管理，支持 Excel 多 Sheet / Word 多章节 / JSON 全量三种批量导出格式。
          数据来源于各模块预采集缓存，导出前请先在对应模块执行计算。
        </p>
      </TechCard>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="数据源总数" value={store.sources.length} unit="个" accent="cyan" />
        <StatCard title="已就绪" value={readyCount} unit="个" accent="green" />
        <StatCard title="已选中" value={selectedCount} unit="个" accent="amber" />
        <StatCard title="导出记录" value={store.history.length} unit="条" accent="purple" />
      </div>

      {/* 面板切换 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {PANELS.map(p => {
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => setPanel(p.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all border ${
                panel === p.key
                  ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
                  : 'text-gw-muted border-gw-border/20 hover:border-gw-border hover:text-gw-text'
              }`}
            >
              <Icon size={14} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* 面板内容 */}
      <div>
        {panel === 'sources' && <SourceListPanel />}
        {panel === 'export' && <ExportConfigPanel />}
        {panel === 'history' && <HistoryPanel />}
        {panel === 'pipeline' && <PipelineExportPanel />}
      </div>

      <DataSourceNote source="基于各模块预采集缓存数据，复用reportGenerator报告生成引擎" version="D-02" />
    </div>
  );
}

// ============================================================
// 面板1: 数据源总览
// ============================================================

function SourceListPanel() {
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

function SourceRow({ source, selected, onToggle }: {
  source: ExportSource;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${
        selected ? 'bg-gw-blue/10 border border-gw-blue/20' : 'hover:bg-gw-surface/50 border border-transparent'
      }`}
    >
      {selected ? <CheckCircle2 size={16} className="text-gw-highlight" /> : <Circle size={16} className="text-gw-muted/40" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gw-text">{source.label}</span>
          <span className="text-[10px] text-gw-muted/60 px-1 py-0.5 rounded bg-gw-surface/60">{source.code}</span>
        </div>
        <p className="text-[10px] text-gw-muted truncate">{source.description}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        {source.isReady ? (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
            <CheckCircle2 size={10} /> 就绪
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-gw-muted/50">
            <Circle size={10} /> 未采集
          </span>
        )}
        {source.lastCollected && (
          <span className="text-[9px] text-gw-muted/40">
            {new Date(source.lastCollected).toLocaleDateString('zh-CN')}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 面板2: 批量导出
// ============================================================

function ExportConfigPanel() {
  const { sources, selectedIds, format, setFormat, isExporting, progress, setExporting, addRecord, markReady } = useExportCenterStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const [filename, setFilename] = useState(() => generateFilename(format, selectedIds.size));

  const selectedSources = useMemo(
    () => sources.filter(s => selectedIds.has(s.id)),
    [sources, selectedIds],
  );

  // 同步文件名
  useEffect(() => {
    setFilename(generateFilename(format, selectedIds.size));
  }, [format, selectedIds.size]);

  const handleExport = useCallback(async () => {
    if (selectedSources.length === 0) {
      toastError('请先选择至少一个数据源');
      return;
    }

    setExporting(true, { current: 0, total: selectedSources.length });

    const tasks = buildExportTasks(selectedSources);
    const result: ExportResult = await executeExport(tasks, format, filename, (pct) => {
      setExporting(true, { current: Math.round((pct / 100) * selectedSources.length), total: selectedSources.length });
    });

    // 记录历史
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      sources: selectedSources.map(s => ({ id: s.id, label: s.label })),
      format,
      filename: result.filename,
      status: result.success ? 'success' as const : 'failed' as const,
      errorMsg: result.errorMsg,
      fileSize: result.fileSize,
    };
    await addRecord(record);

    // 标记就绪
    tasks.forEach(t => {
      if (t.data) markReady(t.source.id, `${Object.keys(t.data).length}个数据段`);
    });

    setExporting(false);
    if (result.success) {
      toastSuccess(`${format.toUpperCase()} 导出成功：${filename}`);
    } else {
      toastError(`导出失败：${result.errorMsg}`);
    }
  }, [selectedSources, format, filename, setExporting, addRecord, markReady, toastSuccess, toastError]);

  if (selectedSources.length === 0) {
    return (
      <TechCard>
        <div className="flex flex-col items-center py-8 text-center">
          <AlertCircle size={32} className="text-gw-muted/30 mb-2" />
          <p className="text-xs text-gw-muted">未选择任何数据源</p>
          <p className="text-[10px] text-gw-muted/60 mt-1">请到「数据源」面板勾选要导出的模块</p>
        </div>
      </TechCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* 已选模块列表 */}
      <TechCard title={`已选 ${selectedSources.length} 个模块`} icon={Layers}>
        <div className="flex flex-wrap gap-2">
          {selectedSources.map(s => (
            <span key={s.id} className="text-[10px] px-2 py-1 rounded bg-gw-blue/10 text-gw-highlight border border-gw-blue/20">
              {s.label}
            </span>
          ))}
        </div>
      </TechCard>

      {/* 格式选择 */}
      <TechCard title="导出格式" icon={FileSpreadsheet}>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(FORMAT_CONFIG) as ExportFormat[]).map(f => {
            const cfg = FORMAT_CONFIG[f];
            const Icon = cfg.icon;
            const active = format === f;
            return (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  active ? 'bg-gw-blue/10 border-gw-blue/30' : 'bg-gw-surface/30 border-gw-border/20 hover:border-gw-border'
                }`}
              >
                <Icon size={18} className={active ? cfg.color : 'text-gw-muted'} />
                <p className={`text-xs font-medium mt-1 ${active ? 'text-gw-text' : 'text-gw-muted'}`}>{cfg.label}</p>
                <p className="text-[9px] text-gw-muted/70 mt-0.5">{cfg.desc}</p>
              </button>
            );
          })}
        </div>
      </TechCard>

      {/* 文件名 */}
      <TechCard title="文件名" icon={FileText}>
        <input
          type="text"
          value={filename}
          onChange={e => setFilename(e.target.value)}
          className="w-full bg-transparent border border-gw-border/30 rounded px-3 py-1.5 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
        />
      </TechCard>

      {/* 导出按钮 + 进度 */}
      <TechCard>
        {isExporting ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gw-muted">
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-gw-highlight" />
                正在导出...
              </span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full h-2 bg-gw-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gw-blue rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={handleExport}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} />
            导出 {selectedSources.length} 个模块为 {FORMAT_CONFIG[format].label}
          </button>
        )}
      </TechCard>
    </div>
  );
}

// ============================================================
// 面板3: 导出历史
// ============================================================

function HistoryPanel() {
  const { history, deleteRecord } = useExportCenterStore();

  if (history.length === 0) {
    return (
      <TechCard>
        <div className="flex flex-col items-center py-8 text-center">
          <History size={32} className="text-gw-muted/30 mb-2" />
          <p className="text-xs text-gw-muted">暂无导出记录</p>
          <p className="text-[10px] text-gw-muted/60 mt-1">完成首次导出后，记录将自动保存到此处</p>
        </div>
      </TechCard>
    );
  }

  return (
    <div className="space-y-2">
      {history.map(r => (
        <TechCard key={r.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {r.status === 'success' ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={14} className="text-red-400" />
                )}
                <span className="text-xs font-medium text-gw-text truncate">{r.filename}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gw-muted">
                <span>{new Date(r.timestamp).toLocaleString('zh-CN')}</span>
                <span className="px-1 py-0.5 rounded bg-gw-surface/60 uppercase">{r.format}</span>
                <span>{r.sources.length}个模块</span>
                {r.fileSize != null && r.fileSize > 0 && (
                  <span>{r.fileSize > 1024 * 1024 ? `${(r.fileSize / 1024 / 1024).toFixed(1)}MB` : `${Math.round(r.fileSize / 1024)}KB`}</span>
                )}
              </div>
              {r.errorMsg && (
                <p className="text-[10px] text-red-400 mt-1">{r.errorMsg}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {r.sources.slice(0, 5).map(s => (
                  <span key={s.id} className="text-[9px] px-1.5 py-0.5 rounded bg-gw-surface/40 text-gw-muted">
                    {s.label}
                  </span>
                ))}
                {r.sources.length > 5 && (
                  <span className="text-[9px] text-gw-muted/60">+{r.sources.length - 5}个</span>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteRecord(r.id)}
              className="text-gw-muted/40 hover:text-red-400 transition-colors p-1"
              title="删除记录"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </TechCard>
      ))}
    </div>
  );
}

// ============================================================
// 面板4: Pipeline 数据包导出
// ============================================================

function PipelineExportPanel() {
  const { packages, init } = usePipelineStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const [exporting, setExporting] = useState(false);

  useEffect(() => { init(); }, [init]);

  const exportSingle = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    try {
      const json = JSON.stringify(pkg, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipeline-${pkg.dataType}-${pkg.id.substring(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess('数据包导出成功');
    } catch {
      toastError('导出失败');
    }
  };

  const exportAll = () => {
    if (packages.length === 0) {
      toastError('无数据包可导出');
      return;
    }
    setExporting(true);
    try {
      const json = JSON.stringify({ exportTime: new Date().toISOString(), count: packages.length, packages }, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipeline-all-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess(`已导出 ${packages.length} 个数据包`);
    } catch {
      toastError('批量导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <TechCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gw-muted">
              Pipeline 数据总线中已发布的数据包，可单独或批量导出为 JSON 文件。
            </p>
          </div>
          <button
            onClick={exportAll}
            disabled={exporting || packages.length === 0}
            className="px-3 py-1.5 rounded text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            全部导出
          </button>
        </div>
      </TechCard>

      {packages.length === 0 ? (
        <TechCard>
          <div className="flex flex-col items-center py-8 text-center">
            <Package size={32} className="text-gw-muted/30 mb-2" />
            <p className="text-xs text-gw-muted">暂无数据包</p>
            <p className="text-[10px] text-gw-muted/60 mt-1">在各模块中通过 PipelinePanel 推送数据后，数据包将显示在此处</p>
          </div>
        </TechCard>
      ) : (
        <div className="space-y-2">
          {packages.map(pkg => (
            <TechCard key={pkg.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Package size={12} className="text-cyan-400" />
                    <span className="text-xs font-medium text-gw-text">{pkg.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gw-muted">
                    <span>来源: {pkg.sourceModule}</span>
                    <span className="px-1 py-0.5 rounded bg-gw-surface/60">{pkg.dataType}</span>
                    <span>{new Date(pkg.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
                <button
                  onClick={() => exportSingle(pkg.id)}
                  className="px-2 py-1 rounded text-[10px] bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all flex items-center gap-1"
                >
                  <Download size={10} />
                  导出
                </button>
              </div>
            </TechCard>
          ))}
        </div>
      )}
    </div>
  );
}
