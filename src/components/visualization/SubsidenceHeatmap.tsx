/**
 * 实时监测可视化 — 地面沉降热力图
 */

import { useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { TechCard } from '../UI';
import { citySubsidenceYearly, TS_FULL_YEARS } from '../../data/historicalTimeSeries';

export function SubsidenceHeatmap() {
  const [hovered, setHovered] = useState<{ city: string; year: number } | null>(null);

  const cities = Object.keys(citySubsidenceYearly);
  const SVG_W = 520;
  const SVG_H = 340;
  const M = { left: 55, right: 20, top: 30, bottom: 40 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const cellW = PW / TS_FULL_YEARS.length;
  const cellH = PH / cities.length;

  function rateToColor(rate: number): string {
    if (rate >= 50) return '#ef4444';
    if (rate >= 30) return '#f59e0b';
    if (rate >= 15) return '#eab308';
    if (rate >= 5) return '#84cc16';
    if (rate >= 2) return '#22c55e';
    return '#1e3a2e';
  }

  function rateToOpacity(rate: number): number {
    return Math.min(0.95, 0.2 + (rate / 65) * 0.75);
  }

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <TrendingDown size={14} className="text-cyan-400" />
        地面沉降速率热力图（mm/a）
      </h3>
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 热力图格子 */}
          {cities.map((city, ci) => {
            const data = citySubsidenceYearly[city];
            if (!data) return null;
            return TS_FULL_YEARS.map((year, yi) => {
              const rate = data[year] ?? 0;
              const x = M.left + yi * cellW;
              const y = M.top + ci * cellH;
              const isHover = hovered?.city === city && hovered?.year === year;
              return (
                <g key={`${city}-${year}`}>
                  <rect
                    x={x} y={y}
                    width={cellW - 1} height={cellH - 1}
                    fill={rateToColor(rate)}
                    fillOpacity={rateToOpacity(rate)}
                    stroke={isHover ? '#06b6d4' : 'none'}
                    strokeWidth={isHover ? 2 : 0}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered({ city, year })}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {isHover && (
                    <g>
                      <rect x={x + cellW / 2 - 35} y={y - 28} width="80" height="22" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                      <text x={x + cellW / 2 + 5} y={y - 13} fontSize="9" fill="#06b6d4" textAnchor="middle" fontWeight="bold">{rate} mm/a</text>
                    </g>
                  )}
                </g>
              );
            });
          })}

          {/* Y轴标签 */}
          {cities.map((city, ci) => (
            <text
              key={city}
              x={M.left - 5}
              y={M.top + ci * cellH + cellH / 2 + 2}
              fontSize="8"
              fill={hovered?.city === city ? '#06b6d4' : '#94a3b8'}
              textAnchor="end"
              fontWeight={hovered?.city === city ? 'bold' : 'normal'}
            >
              {city}
            </text>
          ))}

          {/* X轴标签 */}
          {TS_FULL_YEARS.map((year, yi) => (
            <text
              key={year}
              x={M.left + yi * cellW + cellW / 2}
              y={M.top + PH + 14}
              fontSize="8"
              fill={hovered?.year === year ? '#06b6d4' : '#64748b'}
              textAnchor="middle"
              fontWeight={hovered?.year === year ? 'bold' : 'normal'}
            >
              {year}
            </text>
          ))}

          {/* 轴线 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="0.5" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="0.5" />
        </svg>
      </div>

      {/* 色阶图例 */}
      <div className="mt-2 flex items-center gap-2 text-[9px]">
        <span className="text-gw-muted">速率:</span>
        {[
          { label: '<2', color: '#1e3a2e' },
          { label: '2-5', color: '#22c55e' },
          { label: '5-15', color: '#84cc16' },
          { label: '15-30', color: '#eab308' },
          { label: '30-50', color: '#f59e0b' },
          { label: '>50', color: '#ef4444' },
        ].map(s => (
          <span key={s.label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ background: s.color, opacity: 0.8 }} />
            <span className="text-gw-muted">{s.label}</span>
          </span>
        ))}
        <span className="text-gw-muted/50 ml-auto">单位: mm/a</span>
      </div>

      {/* 趋势摘要 */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">2014年最高</div>
          <div className="text-red-400 font-bold">沧州 65.0</div>
        </div>
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">2024年最高</div>
          <div className="text-amber-400 font-bold">沧州 14.5</div>
        </div>
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">改善幅度</div>
          <div className="text-emerald-400 font-bold">-77.7%</div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 子组件4：水质达标率演变趋势 ──

