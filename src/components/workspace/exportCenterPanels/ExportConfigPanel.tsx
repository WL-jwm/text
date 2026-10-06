/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 * 面板: ExportConfigPanel（拆分自 ExportCenterTab.tsx）
 */
import { type ExportFormat, generateFilename, useExportCenterStore } from '../../../store/exportCenterStore';
import { type ExportResult, executeExport, buildExportTasks } from '../../../utils/batchExporter';
import { useToast } from '../../Toast';
import { TechCard } from '../../UI';
import { Download, Layers, Loader2, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { FORMAT_CONFIG } from './exportCenterConstants';

export function ExportConfigPanel() {
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
