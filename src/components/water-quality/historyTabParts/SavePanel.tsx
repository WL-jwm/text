/**
 * 拆分自 WaterQualityHistoryTab.tsx — 快照保存面板
 */
import { useState, useCallback } from 'react';
import { Save, Tag } from 'lucide-react';

// Component: SavePanel
// ═══════════════════════════════════════════════════════

interface SavePanelProps {
  onSave: (label: string) => Promise<void>;
  saving: boolean;
}

export function SavePanel({ onSave, saving }: SavePanelProps) {
  const [label, setLabel] = useState('');
  const handleSave = useCallback(async () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    await onSave(trimmed);
    setLabel('');
  }, [label, onSave]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gw-text font-medium">
        <Save size={16} className="text-emerald-400" />
        <span>保存当前评价结果</span>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted/60" />
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="输入时段标签，如 2024\u5e74\u4e30\u6c34\u671f"
            className="w-full pl-8 pr-3 py-2 rounded-md bg-gw-surface border border-gw-border/50 text-sm text-gw-text placeholder:text-gw-muted/50 focus:outline-none focus:border-gw-blue/50"
            disabled={saving}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!label.trim() || saving}
          className="px-3 py-2 rounded-md bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Save size={14} />
          {saving ? '...' : '\u4fdd\u5b58'}
        </button>
      </div>
      <p className="text-[10px] text-gw-muted/60">
        \u5c06\u5f53\u524d\u8ba1\u7b97\u5668\u4e2d\u7684\u6240\u6709\u6c34\u6837\u8bc4\u4ef7\u7ed3\u679c\u4fdd\u5b58\u4e3a\u5feb\u7167\uff0c\u65b9\u4fbf\u672a\u6765\u5bf9\u6bd4\u5206\u6790
      </p>
    </div>
  );
}
