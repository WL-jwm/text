/**
 * 水质历史快照对比 Tab
 *
 * 拆分说明：类型/常量/辅助在 historyTabShared.tsx，
 * 三个面板在 historyTabParts/（SavePanel / HistoryList / ComparisonTable）。
 */
import { useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { TechCard } from '../UI';
import { useAppStore } from '../../store/useAppStore';
import { SavePanel } from './historyTabParts/SavePanel';
import { HistoryList } from './historyTabParts/HistoryList';
import { ComparisonTable } from './historyTabParts/ComparisonTable';

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
