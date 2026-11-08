/**
 * 拆分自 WaterQualityHistoryTab.tsx — 多时段对比表
 */
import { useMemo } from 'react';
import type { WaterQualitySnapshot } from '../../../store/useAppStore';
import { CLASS_LABELS, CLASS_BG, piToClass, TrendBadge, type FactorTrend } from './historyTabShared';

interface ComparisonTableProps {
  snapshots: WaterQualitySnapshot[];
}

export function ComparisonTable({ snapshots }: ComparisonTableProps) {
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
