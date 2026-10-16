/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 * 面板: PipelineExportPanel（拆分自 ExportCenterTab.tsx）
 */
import { usePipelineStore } from '../../../store/usePipelineStore';
import { useToast } from '../../Toast';
import { TechCard } from '../../UI';
import { Download, Package, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PipelineExportPanel() {
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
