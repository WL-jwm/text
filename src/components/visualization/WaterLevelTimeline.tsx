/**
 * 实时监测可视化 — 地下水水位动态时序（含自动播放）
 */

import { useState, useEffect, useRef } from 'react';
import { Waves, Play, Pause } from 'lucide-react';
import { TechCard } from '../UI';
import { cityWaterLevelYearly, TS_FULL_YEARS } from '../../data/historicalTimeSeries';

export function WaterLevelTimeline() {
  const [selectedCities, setSelectedCities] = useState<string[]>(['石家庄', '衡水', '沧州', '承德']);
  const [playing, setPlaying] = useState(false);
  const [yearIdx, setYearIdx] = useState(TS_FULL_YEARS.length - 1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setYearIdx(prev => {
          if (prev >= TS_FULL_YEARS.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  const SVG_W = 520;
  const SVG_H = 300;
  const M = { left: 50, right: 20, top: 30, bottom: 45 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_DEPTH = 55;

  function yearToX(i: number): number {
    return M.left + (i / (TS_FULL_YEARS.length - 1)) * PW;
  }
  function depthToY(d: number): number {
    return M.top + PH - (d / MAX_DEPTH) * PH;
  }

  const cityColors: Record<string, string> = {
    '石家庄': '#22c55e', '保定': '#3b82f6', '邯郸': '#f59e0b',
    '邢台': '#8b5cf6', '衡水': '#ef4444', '廊坊': '#06b6d4',
    '沧州': '#ec4899', '唐山': '#84cc16', '秦皇岛': '#f97316',
    '张家口': '#a78bfa', '承德': '#14b8a6',
  };

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city].slice(-6)
    );
  };

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Waves size={14} className="text-cyan-400" />
          水位埋深动态时序（2014-2024）
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setYearIdx(0); setPlaying(true); }}
            className="px-2 py-1 rounded text-[10px] border border-gw-blue/40 bg-gw-blue/10 text-gw-blue hover:bg-gw-blue/20 transition-all"
          >
            {playing ? <Pause size={10} className="inline" /> : <Play size={10} className="inline" />}
            {playing ? '暂停' : '播放'}
          </button>
          <span className="text-[10px] text-gw-muted font-mono">{TS_FULL_YEARS[yearIdx]}年</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 10, 20, 30, 40, 50].map(v => (
            <g key={v}>
              <line x1={M.left} y1={depthToY(v)} x2={M.left + PW} y2={depthToY(v)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left - 5} y={depthToY(v) + 3} fontSize="8" fill="#64748b" textAnchor="end">{v}m</text>
            </g>
          ))}
          {TS_FULL_YEARS.map((y, i) => (
            <g key={y}>
              <line x1={yearToX(i)} y1={M.top} x2={yearToX(i)} y2={M.top + PH} stroke="#1e293b" strokeWidth="0.3" />
              <text x={yearToX(i)} y={M.top + PH + 14} fontSize="8" fill={i === yearIdx ? '#06b6d4' : '#64748b'} textAnchor="middle" fontWeight={i === yearIdx ? 'bold' : 'normal'}>{y}</text>
            </g>
          ))}

          {/* 播放进度线 */}
          <line x1={yearToX(yearIdx)} y1={M.top} x2={yearToX(yearIdx)} y2={M.top + PH} stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 2" />

          {/* 各城市曲线 */}
          {selectedCities.map(city => {
            const data = cityWaterLevelYearly[city];
            if (!data) return null;
            const color = cityColors[city] ?? '#94a3b8';
            const points = TS_FULL_YEARS.map((year, i) => ({
              x: yearToX(i),
              y: depthToY(data[year] ?? 0),
              year,
              depth: data[year] ?? 0,
            }));
            const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            const currentPoint = points[yearIdx];
            return (
              <g key={city}>
                <path d={path} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={i === yearIdx ? 4 : 2} fill={color} stroke="#fff" strokeWidth="0.5" opacity={i <= yearIdx ? 1 : 0.3} />
                ))}
                {currentPoint && (
                  <text x={currentPoint.x + 6} y={currentPoint.y - 4} fontSize="8" fill={color} fontWeight="bold">
                    {city} {currentPoint.depth}m
                  </text>
                )}
              </g>
            );
          })}

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={M.left + PW / 2} y={SVG_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">年份</text>
          <text x={12} y={M.top + PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 12 ${M.top + PH / 2})`}>水位埋深 (m)</text>
        </svg>
      </div>

      {/* 时间轴滑块 */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={TS_FULL_YEARS.length - 1}
          value={yearIdx}
          onChange={e => { setYearIdx(Number(e.target.value)); setPlaying(false); }}
          className="flex-1"
        />
      </div>

      {/* 城市选择 */}
      <div className="mt-2 flex flex-wrap gap-1">
        {Object.keys(cityWaterLevelYearly).map(city => (
          <button
            key={city}
            onClick={() => toggleCity(city)}
            className={`px-2 py-0.5 rounded text-[9px] border transition-all ${
              selectedCities.includes(city) ? 'border-gw-blue/40 bg-gw-blue/10' : 'border-gw-border/20'
            }`}
            style={{ color: selectedCities.includes(city) ? (cityColors[city] ?? '#06b6d4') : '#94a3b8' }}
          >
            {city}
          </button>
        ))}
      </div>
    </TechCard>
  );
}

// ── 子组件3：地面沉降速率热力图 ──

