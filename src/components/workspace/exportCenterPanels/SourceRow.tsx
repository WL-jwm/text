/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 * 面板: SourceRow（拆分自 ExportCenterTab.tsx）
 */
import type { ExportSource } from '../../../store/exportCenterStore';
import { Circle, CheckCircle2 } from 'lucide-react';

export function SourceRow({ source, selected, onToggle }: { source: ExportSource; selected: boolean; onToggle: () => void;}) {
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
