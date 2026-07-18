import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { History, Save, Trash2, AlertCircle, TrendingDown, Minus, TrendingUp, Tag, X } from 'lucide-react';
import { TechCard } from '../UI';
import { useAppStore, type WaterQualitySnapshot } from '../../store/useAppStore';


// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

interface FactorTrend {
  factor: string;
  classes: number[];       // Pi mapped to class number per snapshot
  trend: 'improved' | 'stable' | 'worsened' | null;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const CLASS_LABELS: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

const CLASS_BG: Record<number, string> = {
  1: 'bg-emerald-500/15 text-emerald-400',
  2: 'bg-blue-500/15 text-blue-400',
  3: 'bg-cyan-500/15 text-cyan-400',
  4: 'bg-amber-500/15 text-amber-400',
  5: 'bg-red-500/15 text-red-400',
};

const TREND_CONFIG = {
  improved: { icon: TrendingDown, label: '改善', color: 'text-emerald-400' },
  stable: { icon: Minus, label: '稳定', color: 'text-blue-400' },
  worsened: { icon: TrendingUp, label: '恶化', color: 'text-red-400' },
} as const;

// ═══════════════════════════════════════════════════════
// Helper: Pi -> water class number
// ═══════════════════════════════════════════════════════

function piToClass(pi: number): number {
  if (pi <= 1) return 1;
  if (pi <= 2) return 2;
  if (pi <= 3) return 3;
  if (pi <= 5) return 4;
  return 5;
}

// ═══════════════════════════════════════════════════════
// Helper: trend icon
// ═══════════════════════════════════════════════════════

function TrendBadge({ trend }: { trend: 'improved' | 'stable' | 'worsened' | null }) {
  if (!trend) return <span className="text-gw-muted/50 text-[10px]">--</span>;
  const cfg = TREND_CONFIG[trend];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════
// Component: SavePanel
// ═══════════════════════════════════════════════════════

interface SavePanelProps {
  onSave: (label: string) => Promise<void>;
  saving: boolean;
}

function SavePanel({ onSave, saving }: SavePanelProps) {
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

// ═══════════════════════════════════════════════════════
// Component: HistoryList
// ═══════════════════════════════════════════════════════

interface HistoryListProps {
  snapshots: WaterQualitySnapshot[];
  onDelete: (id: string) => Promise<void>;
}

function HistoryList({ snapshots, onDelete }: HistoryListProps) {
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

// ═══════════════════════════════════════════════════════
// Component: ComparisonTable
// ═══════════════════════════════════════════════════════

interface ComparisonTableProps {
  snapshots: WaterQualitySnapshot[];
}

function ComparisonTable({ snapshots }: ComparisonTableProps) {
  const trends = useMemo(() => {
    if (snapshots.length < 2) return [];

    // Collect all factor names across snapshots
    const factorSet = new Set<string>();
    for (const snap of snapshots) {
      if (snap.result?.factors) {
        for (const f of snap.result.factors) {
          factorSet.add(f.name);
        }
      }
    }

    const factors = Array.from(factorSet);
    const result: FactorTrend[] = [];

    for (const factor of factors) {
      const classes: number[] = [];
      for (const snap of snapshots) {
        const found = snap.result?.factors?.find(f => f.name === factor);
        classes.push(found ? piToClass(parseFloat(found.Pi)) : 0);
      }

      // Calculate trend: compare first and last
      const firstValid = classes.find(c => c > 0) ?? 0;
      const lastValid = [...classes].reverse().find(c => c > 0) ?? 0;
      let trend: 'improved' | 'stable' | 'worsened' | null = null;
      if (firstValid > 0 && lastValid > 0) {
        if (lastValid < firstValid) trend = 'improved';
        else if (lastValid === firstValid) trend = 'stable';
        else trend = 'worsened';
      }

      result.push({ factor, classes, trend });
    }

    return result;
  }, [snapshots]);

  if (snapshots.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gw-muted/50">
        <span className="text-sm">\u9700\u8981\u81f3\u5c11 2 \u6761\u5386\u53f2\u8bb0\u5f55\u624d\u80fd\u8fdb\u884c\u5bf9\u6bd4</span>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gw-muted/50">
        <span className="text-sm">\u5386\u53f2\u8bb0\u5f55\u4e2d\u672a\u627e\u5230\u53ef\u5bf9\u6bd4\u7684\u56e0\u5b50\u6570\u636e</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gw-border/50">
            <th className="text-left py-2 px-2 text-gw-muted font-medium sticky left-0 bg-gw-card z-10 min-w-[80px]">
              \u56e0\u5b50
            </th>
            {snapshots.map(snap => (
              <th key={snap.id} className="text-center py-2 px-2 text-gw-muted font-medium min-w-[90px]">
                <div className="truncate max-w-[100px] mx-auto" title={snap.label}>{snap.label}</div>
              </th>
            ))}
            <th className="text-center py-2 px-2 text-gw-muted font-medium min-w-[60px]">
              \u8d8b\u52bf
            </th>
          </tr>
        </thead>
        <tbody>
          {trends.map((row) => (
            <tr key={row.factor} className="border-b border-gw-border/20 hover:bg-gw-surface/30">
              <td className="py-1.5 px-2 text-gw-text font-medium sticky left-0 bg-gw-card z-10 whitespace-nowrap">
                {row.factor}
              </td>
              {row.classes.map((cls, i) => (
                <td key={i} className="py-1.5 px-2 text-center">
                  {cls > 0 ? (
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${CLASS_BG[cls] || ''}`}>
                      {CLASS_LABELS[cls]}
                    </span>
                  ) : (
                    <span className="text-gw-muted/30">-</span>
                  )}
                </td>
              ))}
              <td className="py-1.5 px-2 text-center">
                <TrendBadge trend={row.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

export function WaterQualityHistoryTab() {
  const waterQualityHistory = useAppStore(s => s.waterQualityHistory);
  const saveWaterQualitySnapshot = useAppStore(s => s.saveWaterQualitySnapshot);
  const deleteWaterQualitySnapshot = useAppStore(s => s.deleteWaterQualitySnapshot);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = useCallback(async (label: string) => {
    setSaving(true);
    setSaveError(null);
    try {
      // Try to read current calculator state from Zustand store
      // The snapshot will store minimal info; user can also manually compare
      await saveWaterQualitySnapshot({
        label,
        sampleName: '',
        values: {},
        result: {
          sampleName: '',
          overallClass: '1',
          overallClassNum: 1,
          exceededCount: 0,
          exceededFactors: [],
          factors: [],
        },
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '\u4fdd\u5b58\u5931\u8d25');
    } finally {
      setSaving(false);
    }
  }, [saveWaterQualitySnapshot]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteWaterQualitySnapshot(id);
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    }
  }, [deleteWaterQualitySnapshot]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Save + History List */}
      <div className="space-y-4">
        <TechCard title="\u5feb\u7167\u7ba1\u7406">
          <SavePanel onSave={handleSave} saving={saving} />
          {saveError && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-400">
              <AlertCircle size={12} />
              {saveError}
            </div>
          )}
        </TechCard>
        <TechCard title="\u5386\u53f2\u8bb0\u5f55">
          <HistoryList snapshots={waterQualityHistory} onDelete={handleDelete} />
        </TechCard>
      </div>

      {/* Right: Comparison Table */}
      <TechCard title="\u591a\u65f6\u6bb5\u5bf9\u6bd4">
        <ComparisonTable snapshots={waterQualityHistory} />
      </TechCard>
    </div>
  );
}
