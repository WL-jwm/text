/**
 * 拆分自 WaterQualityHistoryTab.tsx — 历史记录列表
 */
import { useState, useEffect, useRef } from 'react';
import { History, Trash2, X } from 'lucide-react';
import type { WaterQualitySnapshot } from '../../../store/useAppStore';

// ═══════════════════════════════════════════════════════
// Component: HistoryList
// ═══════════════════════════════════════════════════════

interface HistoryListProps {
  snapshots: WaterQualitySnapshot[];
  onDelete: (id: string) => Promise<void>;
}

export function HistoryList({ snapshots, onDelete }: HistoryListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  // Click outside to dismiss confirm
  useEffect(() => {
    if (!confirmId) return;
    const handler = (e: MouseEvent) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setConfirmId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [confirmId]);

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gw-muted/50">
        <History size={32} className="mb-2" />
        <span className="text-sm">\u6682\u65e0\u5386\u53f2\u8bb0\u5f55</span>
        <span className="text-[10px] mt-1">\u4fdd\u5b58\u5f53\u524d\u8bc4\u4ef7\u7ed3\u679c\u540e\u53ef\u8fdb\u884c\u5386\u53f2\u5bf9\u6bd4</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {snapshots.map(snap => {
        const date = new Date(snap.savedAt);
        const dateStr = date.toLocaleString('zh-CN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        });
        return (
          <div key={snap.id} className="flex items-center gap-3 p-2.5 rounded-md bg-gw-surface/50 border border-gw-border/30 hover:border-gw-blue/30 transition-colors group">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gw-text font-medium truncate">{snap.label}</div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gw-muted/60">
                <span>{dateStr}</span>
                <span className="text-gw-border">|</span>
                <span>\u6c34\u6837: {snap.sampleName || '\u672a\u547d\u540d'}</span>
                {snap.sukalovResult && (
                  <>
                    <span className="text-gw-border">|</span>
                    <span>\u82cf\u5361\u5217\u592b: {snap.sukalovResult.type}</span>
                  </>
                )}
              </div>
            </div>
            {confirmId === snap.id ? (
              <div ref={confirmRef} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(snap.id); setConfirmId(null); }}
                  className="px-2 py-1 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors"
                >
                  \u786e\u8ba4\u5220\u9664
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                  className="p-1 rounded text-gw-muted/40 hover:text-gw-text transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmId(snap.id); }}
                className="p-1.5 rounded text-gw-muted/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="\u5220\u9664\u6b64\u8bb0\u5f55"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
