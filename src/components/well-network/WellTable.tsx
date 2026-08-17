import { AQUIFER_LABELS } from '../../services/wellNetwork';
import { WELL_REALTIME_STATUS_CONFIG } from '../../services/wellRealtime';
import type { WellWithData } from '../../services/wellRealtime';
import { Trash2 } from 'lucide-react';
import { CHANNEL_LABELS, AQUIFER_COLORS } from './constants';
import { RealtimeStatusBadge } from './RealtimeStatusBadge';

export function WellTable({ wells, selectedId, onSelect, onDelete }: {
  wells: WellWithData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[10px]">
        <thead>
          <tr className="text-gw-muted/60 border-b border-gw-border/20">
            <th className="py-1 pr-2 font-medium">井名</th>
            <th className="py-1 pr-2 font-medium">城市</th>
            <th className="py-1 pr-2 font-medium">含水层</th>
            <th className="py-1 pr-2 font-medium">实时值</th>
            <th className="py-1 pr-2 font-medium">状态</th>
            <th className="py-1 pr-2 font-medium">指标</th>
            <th className="py-1 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {wells.map(well => {
            const selected = well.id === selectedId;
            const rt = well.realtime;
            return (
              <tr
                key={well.id}
                onClick={() => onSelect(well.id)}
                className={`border-b border-gw-border/10 cursor-pointer transition-colors ${
                  selected ? 'bg-gw-cyan/10' : 'hover:bg-gw-surface/20'
                }`}
              >
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: AQUIFER_COLORS[well.aquiferType] }} />
                    <span className="font-medium text-gw-text">{well.name}</span>
                  </div>
                  <span className="text-[8px] text-gw-muted/40 font-mono">{well.id}</span>
                </td>
                <td className="py-1.5 pr-2 text-gw-muted">{well.city}</td>
                <td className="py-1.5 pr-2 text-gw-muted">{AQUIFER_LABELS[well.aquiferType]}</td>
                <td className="py-1.5 pr-2">
                  {rt.value !== null ? (
                    <span className="font-mono font-medium" style={{ color: rt.status === 'normal' ? undefined : WELL_REALTIME_STATUS_CONFIG[rt.status].color }}>
                      {rt.value.toFixed(1)}{rt.unit}
                    </span>
                  ) : (
                    <span className="text-gw-muted/40">—</span>
                  )}
                </td>
                <td className="py-1.5 pr-2">
                  <RealtimeStatusBadge status={rt.status} />
                </td>
                <td className="py-1.5 pr-2">
                  <div className="flex flex-wrap gap-0.5 max-w-24">
                    {well.indicators.map(ind => (
                      <span key={ind} className="text-[7px] px-1 py-px rounded bg-gw-surface/40 text-gw-muted/70">
                        {CHANNEL_LABELS[ind]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-1.5">
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(well.id); }}
                    className="text-gw-muted/40 hover:text-red-400 transition-colors"
                    title="删除井"
                  >
                    <Trash2 size={11} />
                  </button>
                </td>
              </tr>
            );
          })}
          {wells.length === 0 && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-[10px] text-gw-muted/50">暂无符合条件的井</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── 实时趋势迷你图 ──

