import { useMemo } from 'react';
import type { WellWithData } from '../../services/wellRealtime';
import { AQUIFER_LABELS } from '../../services/wellNetwork';
import { WELL_REALTIME_STATUS_CONFIG } from '../../services/wellRealtime';
import { AQUIFER_COLORS, AQUIFER_TYPES, RT_STATUSES } from './constants';

export function WellMap({ wells, selectedId, onSelect }: {
  wells: WellWithData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const bounds = useMemo(() => {
    if (wells.length === 0) return null;
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    for (const w of wells) {
      if (w.latitude < minLat) minLat = w.latitude;
      if (w.latitude > maxLat) maxLat = w.latitude;
      if (w.longitude < minLon) minLon = w.longitude;
      if (w.longitude > maxLon) maxLon = w.longitude;
    }
    return { minLat, maxLat, minLon, maxLon };
  }, [wells]);

  if (!bounds || wells.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-[10px] text-gw-muted/50">
        暂无井点数据
      </div>
    );
  }

  const pad = 0.5;
  const latRange = (bounds.maxLat - bounds.minLat) || 1;
  const lonRange = (bounds.maxLon - bounds.minLon) || 1;
  const w = 200, h = 140;

  const project = (lat: number, lon: number) => {
    const x = ((lon - bounds.minLon + pad) / (lonRange + 2 * pad)) * w;
    const y = h - ((lat - bounds.minLat + pad) / (latRange + 2 * pad)) * h;
    return { x, y };
  };

  return (
    <div className="relative h-36 bg-gw-surface/10 border border-gw-border/20 rounded overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="absolute inset-0">
        <defs>
          <pattern id="well-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gw-border/20" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#well-grid)" />
        {wells.map(well => {
          const { x, y } = project(well.latitude, well.longitude);
          const color = AQUIFER_COLORS[well.aquiferType];
          const selected = well.id === selectedId;
          // 实时状态描边
          const rtConfig = WELL_REALTIME_STATUS_CONFIG[well.realtime.status];
          const rtColor = well.realtime.status === 'normal' ? undefined : rtConfig.color;
          return (
            <g key={well.id} transform={`translate(${x},${y})`}>
              {/* 实时状态光环 */}
              {rtColor && (
                <circle r={selected ? 10 : 8} fill={rtColor} fillOpacity={0.15} />
              )}
              <circle
                r={selected ? 6 : 4.5}
                fill={color}
                fillOpacity={selected ? 0.9 : 0.5}
                stroke={rtColor ?? '#fff'}
                strokeWidth={selected ? 1.5 : (rtColor ? 1.2 : 0.8)}
                onClick={() => onSelect(well.id)}
                className="cursor-pointer hover:fill-opacity-80"
              />
              {selected && (
                <text x={0} y={-9} textAnchor="middle" fill={color} fontSize="6" fontWeight="bold">
                  {well.name.slice(0, 6)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-1 left-1 flex items-center gap-1.5 text-[8px] text-gw-muted/70 bg-gw-surface/80 rounded px-1.5 py-0.5">
        {AQUIFER_TYPES.map(type => (
          <span key={type} className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AQUIFER_COLORS[type] }} />
            {AQUIFER_LABELS[type]}
          </span>
        ))}
      </div>
      {/* 状态图例 */}
      <div className="absolute bottom-1 right-1 flex items-center gap-1.5 text-[8px] text-gw-muted/70 bg-gw-surface/80 rounded px-1.5 py-0.5">
        {RT_STATUSES.map(s => (
          <span key={s} className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WELL_REALTIME_STATUS_CONFIG[s].color }} />
            {WELL_REALTIME_STATUS_CONFIG[s].label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 统计卡片 ──

