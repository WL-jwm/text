/**
 * 拆分自 WellNetworkPanel.tsx
 */

import { Radio, TriangleAlert, Clock, CircleDot } from 'lucide-react';
import { WELL_REALTIME_STATUS_CONFIG } from '../../../services/wellRealtime';
import { RT_STATUSES } from '../constants';
import type { WellRealtimeStatus, WellRealtimeStats } from '../../../services/wellRealtime';

export function RealtimeStatusBar({ rtStats, rtFilter, onFilterChange, isConnected, lastUpdateText }: { rtStats: WellRealtimeStats; rtFilter: WellRealtimeStatus | 'all'; onFilterChange: (f: WellRealtimeStatus | 'all') => void; isConnected: boolean; lastUpdateText: string }) {
  const abnormalCount = rtStats.warning + rtStats.critical + rtStats.stale;
  return (
    <>
    {/* 实时状态统计条 */}
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-1">
        <Radio size={11} className={isConnected ? 'text-emerald-400' : 'text-gray-400'} />
        <span className={`text-[9px] ${isConnected ? 'text-emerald-400' : 'text-gw-muted/60'}`}>
          {isConnected ? `实时 · 更新 ${lastUpdateText}` : '实时数据未连接'}
        </span>
      </div>
      <div className="flex items-center gap-1 ml-1">
        {RT_STATUSES.map(s => {
          const count = s === 'normal' ? rtStats.normal : s === 'warning' ? rtStats.warning : s === 'critical' ? rtStats.critical : rtStats.stale;
          const config = WELL_REALTIME_STATUS_CONFIG[s];
          const active = rtFilter === s;
          return (
            <button
              key={s}
              onClick={() => onFilterChange(active ? 'all' : s)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
                active ? 'ring-1 ring-inset' : ''
              }`}
              style={{
                backgroundColor: `${config.color}15`,
                color: config.color,
                ...(active ? { boxShadow: `inset 0 0 0 1px ${config.color}` } : {}),
              }}
            >
              {s === 'critical' || s === 'warning' ? <TriangleAlert size={8} /> : s === 'stale' ? <Clock size={8} /> : <CircleDot size={8} />}
              {config.label}{count}
            </button>
          );
        })}
        {rtFilter !== 'all' && (
          <button onClick={() => onFilterChange('all')} className="text-[8px] text-gw-muted/50 hover:text-gw-text">
            全部
          </button>
        )}
        {abnormalCount > 0 && (
          <span className="text-[8px] text-gw-muted/50 ml-1">共 {abnormalCount} 口异常井</span>
        )}
      </div>
    </div>
    </>
  );
}
