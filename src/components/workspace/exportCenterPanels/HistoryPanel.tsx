/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 * 面板: HistoryPanel（拆分自 ExportCenterTab.tsx）
 */
import { useExportCenterStore } from '../../../store/exportCenterStore';
import { TechCard } from '../../UI';
import { Trash2, CheckCircle2, AlertCircle, History } from 'lucide-react';

export function HistoryPanel() {
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
