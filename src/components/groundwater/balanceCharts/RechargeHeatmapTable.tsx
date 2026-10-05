/*
 * 组件：RechargeHeatmapTable（拆分自 balanceCharts.tsx）
 */

import { useMemo } from 'react';
import { TechCard } from '../../UI';
import { calcBalance } from '../../../utils/balanceCalculator';
import { RECHARGE_ITEM_NAMES } from '../balanceConstants';

export function RechargeHeatmapTable({ results }: {
  results: ReturnType<typeof calcBalance>[];
}) {
  const validResults = results.filter(r => r.city);

  // 计算每个城市每项补给占比
  const rows = useMemo(() =>
    validResults.map(r => {
      const row: Record<string, string | number> = { city: r.city, total: r.totalRecharge };
      RECHARGE_ITEM_NAMES.forEach(name => {
        const item = r.rechargeItems.find(i => i.name === name);
        row[name] = item ? item.value : 0;
      });
      return row;
    }),
    [validResults],
  );

  // 颜色插值
  const getColor = (value: number, maxVal: number): string => {
    if (maxVal === 0 || value === 0) return 'rgba(59,130,246,0.05)';
    const ratio = Math.min(1, value / maxVal);
    const alpha = 0.15 + ratio * 0.65;
    return `rgba(59,130,246,${alpha.toFixed(2)})`;
  };

  const maxValues = useMemo(() => {
    const maxes: Record<string, number> = {};
    RECHARGE_ITEM_NAMES.forEach(name => {
      maxes[name] = Math.max(...validResults.map(r => {
        const item = r.rechargeItems.find(i => i.name === name);
        return item ? item.value : 0;
      }));
    });
    return maxes;
  }, [validResults]);

  return (
    <TechCard title="补给结构热力表（城市\u00d7补给项）" badge={`${validResults.length}市`}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gw-border">
              <th className="text-left p-1.5 text-gw-muted sticky left-0 bg-gw-card z-10">城市</th>
              {RECHARGE_ITEM_NAMES.map(name => (
                <th key={name} className="p-1.5 text-center text-gw-muted whitespace-nowrap">{name}</th>
              ))}
              <th className="p-1.5 text-center text-blue-400 font-medium">合计</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.city as string} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                <td className="p-1.5 text-gw-text font-medium sticky left-0 bg-gw-card z-10 whitespace-nowrap">{row.city as string}</td>
                {RECHARGE_ITEM_NAMES.map(name => {
                  const val = row[name] as number;
                  return (
                    <td key={name} className="p-1.5 text-center" style={{ backgroundColor: getColor(val, maxValues[name]) }}>
                      <span className="font-mono text-gw-text">{val > 0 ? val.toFixed(2) : '-'}</span>
                    </td>
                  );
                })}
                <td className="p-1.5 text-center font-mono font-semibold text-blue-400">{(row.total as number).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-gw-muted">
        <span>色阶：</span>
        <div className="flex gap-0.5">
          {[0.15, 0.35, 0.55, 0.75, 0.80].map(a => (
            <span key={a} className="w-6 h-3 rounded-sm inline-block" style={{ backgroundColor: `rgba(59,130,246,${a.toFixed(2)})` }} />
          ))}
        </div>
        <span>低 → 高</span>
      </div>
    </TechCard>
  );
}
