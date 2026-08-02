/**
 * RealtimeMonitoringViz — E-04 实时监测数据可视化模块
 *
 * 基于监测网/水位时序/沉降时序/水质时序数据，模拟实时监测中心：
 *   1. 监测站网总览（4级站网 + 4含水层分布 + 自动化率仪表盘）
 *   2. 多城市水位动态时序（2014-2024折线 + 播放动画 + 城市筛选）
 *   3. 地面沉降速率热力图（城市×年份矩阵 + 严重度色阶）
 *   4. 水质达标率演变趋势（面积图 + 达标/未达标分界线）
 *   5. 监测预警面板（阈值越限告警 + 漏斗状态 + 关键指标卡片）
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { Activity, Radio, AlertTriangle, Gauge, Waves, TrendingDown, MapPin, Bell, Play, Pause } from 'lucide-react';
import { TechCard } from '../UI';
import { monitoringNetwork } from '../../data/exploitation';
import {
  cityWaterLevelYearly,
  waterLevelYearlySummary,
  citySubsidenceYearly,
  subsidenceYearlySummary,
  cityQualityYearly,
  qualityYearlySummary,
  TS_FULL_YEARS,
} from '../../data/historicalTimeSeries';

// ── 子组件1：监测站网总览 ──

function MonitoringNetworkOverview() {
  const { totalStations, byType, byAquifer, automation } = monitoringNetwork;
  const autoPct = automation.automatedPercent;

  // 仪表盘参数
  const GAUGE_W = 160, GAUGE_H = 100;
  const CX = 80, CY = 80, R = 60;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 2.2;
  const angleRange = endAngle - startAngle;
  const needleAngle = startAngle + (autoPct / 100) * angleRange;

  // 仪表盘弧
  const arcPath = (from: number, to: number, color: string) => {
    const x1 = CX + R * Math.cos(from);
    const y1 = CY + R * Math.sin(from);
    const x2 = CX + R * Math.cos(to);
    const y2 = CY + R * Math.sin(to);
    return { path: `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`, color };
  };

  const bgArc = arcPath(startAngle, endAngle, '#1e293b');
  const fillArc = arcPath(startAngle, needleAngle, '#06b6d4');
  const needleX = CX + (R - 8) * Math.cos(needleAngle);
  const needleY = CY + (R - 8) * Math.sin(needleAngle);

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-3">
        <Radio size={14} className="text-cyan-400" />
        监测站网总览
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧：站网数量 + 仪表盘 */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <div className="text-3xl font-bold text-cyan-400">{totalStations}</div>
            <div className="text-[10px] text-gw-muted">监测站总数</div>
          </div>
          <svg width={GAUGE_W} height={GAUGE_H}>
            <path d={bgArc.path} fill="none" stroke={bgArc.color} strokeWidth="8" strokeLinecap="round" />
            <path d={fillArc.path} fill="none" stroke={fillArc.color} strokeWidth="8" strokeLinecap="round" />
            <line x1={CX} y1={CY} x2={needleX} y2={needleY} stroke="#06b6d4" strokeWidth="2" />
            <circle cx={CX} cy={CY} r="4" fill="#06b6d4" />
            <text x={CX} y={CY - 15} fontSize="16" fill="#06b6d4" textAnchor="middle" fontWeight="bold">{autoPct}%</text>
            <text x={CX} y={CY - 3} fontSize="7" fill="#64748b" textAnchor="middle">自动化率</text>
          </svg>
          <div className="text-[9px] text-gw-muted text-center mt-1">
            <div>自动传输: {automation.automatedCount}站</div>
            <div>{automation.realtimeTransmission}</div>
            <div>频率: {automation.monitoringFrequency}</div>
          </div>
        </div>

        {/* 中间：按行政级别 */}
        <div>
          <div className="text-[10px] text-gw-muted mb-1">按行政级别</div>
          <div className="space-y-1.5">
            {byType.map((t, i) => {
              const pct = (t.count / totalStations) * 100;
              const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#64748b'];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="text-gw-text">{t.type}</span>
                    <span className="text-gw-muted">{t.count}个 ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                  </div>
                  <div className="text-[8px] text-gw-muted/50">{t.note}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：按含水层 */}
        <div>
          <div className="text-[10px] text-gw-muted mb-1">按含水层</div>
          <div className="space-y-1.5">
            {byAquifer.map((a, i) => {
              const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b'];
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: colors[i], opacity: 0.6 }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gw-text">{a.aquifer}</span>
                      <span className="text-gw-muted">{a.count}个</span>
                    </div>
                    <div className="h-1 rounded-full bg-gw-surface/60 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${a.percent}%`, background: colors[i] }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-gw-muted w-8 text-right">{a.percent}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-[8px] text-gw-muted/50">
            平台: {monitoringNetwork.realTimePlatform}
          </div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 子组件2：多城市水位动态时序 ──

function WaterLevelTimeline() {
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

function SubsidenceHeatmap() {
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

function QualityEvolutionChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const SVG_W = 520;
  const SVG_H = 300;
  const M = { left: 50, right: 20, top: 30, bottom: 45 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_RATE = 100;

  function yearToX(i: number): number {
    return M.left + (i / (TS_FULL_YEARS.length - 1)) * PW;
  }
  function rateToY(r: number): number {
    return M.top + PH - (r / MAX_RATE) * PH;
  }

  const summary = qualityYearlySummary;
  const threshold = 60; // 达标线

  // 全省均值面积
  const avgPoints = summary.map((s, i) => ({ x: yearToX(i), y: rateToY(s.avgRate) }));
  const avgPath = avgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const avgFill = `${avgPath} L ${yearToX(summary.length - 1)} ${M.top + PH} L ${yearToX(0)} ${M.top + PH} Z`;

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <Gauge size={14} className="text-cyan-400" />
        水质达标率演变趋势（III类以上占比%）
      </h3>
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 20, 40, 60, 80, 100].map(v => (
            <g key={v}>
              <line x1={M.left} y1={rateToY(v)} x2={M.left + PW} y2={rateToY(v)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left - 5} y={rateToY(v) + 3} fontSize="8" fill="#64748b" textAnchor="end">{v}%</text>
            </g>
          ))}

          {/* 达标线 */}
          <line x1={M.left} y1={rateToY(threshold)} x2={M.left + PW} y2={rateToY(threshold)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
          <text x={M.left + PW - 5} y={rateToY(threshold) - 4} fontSize="8" fill="#ef4444" textAnchor="end" opacity="0.6">目标线 60%</text>

          {/* 全省均值面积 */}
          <path d={avgFill} fill="#06b6d4" fillOpacity="0.1" />
          <path d={avgPath} fill="none" stroke="#06b6d4" strokeWidth="2" />

          {/* 各市曲线（半透明） */}
          {Object.entries(cityQualityYearly).map(([city, data]) => {
            const points = TS_FULL_YEARS.map((year, i) => ({
              x: yearToX(i),
              y: rateToY(data[year] ?? 0),
            }));
            const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            const isBest = city === '承德';
            const isWorst = city === '沧州';
            return (
              <path
                key={city}
                d={path}
                fill="none"
                stroke={isBest ? '#14b8a6' : isWorst ? '#ef4444' : '#475569'}
                strokeWidth={isBest || isWorst ? 1.5 : 0.8}
                opacity={isBest || isWorst ? 0.8 : 0.25}
              />
            );
          })}

          {/* 数据点 + hover */}
          {avgPoints.map((p, i) => (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {hovered === i && (
                <line x1={p.x} y1={M.top} x2={p.x} y2={M.top + PH} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 2" />
              )}
              <circle cx={p.x} cy={p.y} r={hovered === i ? 4 : 3} fill="#06b6d4" stroke="#fff" strokeWidth="0.5" />
              <text x={p.x} y={M.top + PH + 14} fontSize="8" fill={hovered === i ? '#06b6d4' : '#64748b'} textAnchor="middle" fontWeight={hovered === i ? 'bold' : 'normal'}>{summary[i].year}</text>

              {hovered === i && (
                <g>
                  <rect x={p.x + 8} y={p.y - 40} width="140" height="55" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                  <text x={p.x + 16} y={p.y - 26} fontSize="9" fill="#06b6d4" fontWeight="bold">{summary[i].year}年</text>
                  <text x={p.x + 16} y={p.y - 14} fontSize="8" fill="#94a3b8">全省均值: {summary[i].avgRate}%</text>
                  <text x={p.x + 16} y={p.y - 2} fontSize="8" fill="#14b8a6">最优: {summary[i].bestCity} {summary[i].bestRate}%</text>
                  <text x={p.x + 16} y={p.y + 10} fontSize="8" fill="#ef4444">最低: {summary[i].worstCity} {summary[i].worstRate}%</text>
                </g>
              )}
            </g>
          ))}

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={M.left + PW / 2} y={SVG_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">年份</text>
          <text x={12} y={M.top + PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 12 ${M.top + PH / 2})`}>达标率 (%)</text>
        </svg>
      </div>

      <div className="mt-1 flex items-center gap-3 text-[9px]">
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-cyan-400 inline-block" /> 全省均值</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-teal-500 inline-block" /> 承德(最优)</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-500 inline-block" /> 沧州(最低)</span>
        <span className="text-gw-muted/50 ml-auto">2014→2024达标率提升{((summary[10].avgRate - summary[0].avgRate)).toFixed(1)}个百分点</span>
      </div>
    </TechCard>
  );
}

// ── 子组件5：监测预警面板 ──

function MonitoringAlertPanel() {
  // 基于最新年份数据生成预警
  const latestYear = TS_FULL_YEARS[TS_FULL_YEARS.length - 1];
  const prevYear = TS_FULL_YEARS[TS_FULL_YEARS.length - 2];

  const alerts = useMemo(() => {
    const list: { city: string; type: 'waterLevel' | 'subsidence' | 'quality'; level: 'warning' | 'critical' | 'info'; message: string; value: string }[] = [];

    // 水位预警
    Object.entries(cityWaterLevelYearly).forEach(([city, data]) => {
      const latest = data[latestYear];
      const prev = data[prevYear];
      if (latest !== undefined && prev !== undefined) {
        if (latest > 35) {
          list.push({ city, type: 'waterLevel', level: 'warning', message: '水位埋深超过35m', value: `${latest}m` });
        }
        if (latest < prev) {
          list.push({ city, type: 'waterLevel', level: 'info', message: '水位回升中', value: `+${(prev - latest).toFixed(1)}m` });
        }
      }
    });

    // 沉降预警
    Object.entries(citySubsidenceYearly).forEach(([city, data]) => {
      const latest = data[latestYear];
      if (latest !== undefined && latest > 10) {
        list.push({ city, type: 'subsidence', level: latest > 15 ? 'critical' : 'warning', message: `沉降速率${latest}mm/a`, value: `${latest}mm/a` });
      }
    });

    // 水质预警
    Object.entries(cityQualityYearly).forEach(([city, data]) => {
      const latest = data[latestYear];
      if (latest !== undefined && latest < 60) {
        list.push({ city, type: 'quality', level: latest < 55 ? 'warning' : 'info', message: `达标率${latest}%`, value: `${latest}%` });
      }
    });

    return list.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.level] - order[b.level];
    });
  }, [latestYear, prevYear]);

  const levelConfig = {
    critical: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle, label: '严重' },
    warning: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Bell, label: '预警' },
    info: { color: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Activity, label: '正常' },
  };

  const typeLabels: Record<string, string> = {
    waterLevel: '水位',
    subsidence: '沉降',
    quality: '水质',
  };

  const stats = {
    critical: alerts.filter(a => a.level === 'critical').length,
    warning: alerts.filter(a => a.level === 'warning').length,
    info: alerts.filter(a => a.level === 'info').length,
  };

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Bell size={14} className="text-cyan-400" />
          监测预警面板
        </h3>
        <span className="text-[9px] text-gw-muted">数据年份: {latestYear}</span>
      </div>

      {/* 预警统计 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className={`p-2 rounded-lg ${levelConfig.critical.bg} border ${levelConfig.critical.border} text-center`}>
          <div className="text-lg font-bold" style={{ color: levelConfig.critical.color }}>{stats.critical}</div>
          <div className="text-[9px]" style={{ color: levelConfig.critical.color }}>严重</div>
        </div>
        <div className={`p-2 rounded-lg ${levelConfig.warning.bg} border ${levelConfig.warning.border} text-center`}>
          <div className="text-lg font-bold" style={{ color: levelConfig.warning.color }}>{stats.warning}</div>
          <div className="text-[9px]" style={{ color: levelConfig.warning.color }}>预警</div>
        </div>
        <div className={`p-2 rounded-lg ${levelConfig.info.bg} border ${levelConfig.info.border} text-center`}>
          <div className="text-lg font-bold" style={{ color: levelConfig.info.color }}>{stats.info}</div>
          <div className="text-[9px]" style={{ color: levelConfig.info.color }}>正常</div>
        </div>
      </div>

      {/* 预警列表 */}
      <div className="space-y-1 max-h-[280px] overflow-y-auto">
        {alerts.map((alert, i) => {
          const cfg = levelConfig[alert.level];
          const Icon = cfg.icon;
          return (
            <div key={i} className={`flex items-center gap-2 p-1.5 rounded border ${cfg.border} ${cfg.bg}`}>
              <Icon size={12} style={{ color: cfg.color }} />
              <span className="text-[10px] text-gw-text font-medium w-12">{alert.city}</span>
              <span className="text-[8px] text-gw-muted px-1 py-0.5 rounded bg-gw-surface/60">{typeLabels[alert.type]}</span>
              <span className="text-[9px] text-gw-muted flex-1">{alert.message}</span>
              <span className="text-[9px] font-mono" style={{ color: cfg.color }}>{alert.value}</span>
              <span className="text-[8px] px-1 rounded" style={{ color: cfg.color, background: `${cfg.color}20` }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* 关键指标卡片 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-gw-surface/60 border border-gw-border/20">
          <div className="flex items-center gap-1 text-[9px] text-gw-muted mb-1">
            <MapPin size={9} /> 全省水位均值
          </div>
          <div className="text-cyan-400 font-bold text-sm">
            {waterLevelYearlySummary[waterLevelYearlySummary.length - 1].avgDepth}m
            <span className="text-[9px] text-emerald-400 ml-1">
              ↓{(waterLevelYearlySummary[waterLevelYearlySummary.length - 1].avgDepth - waterLevelYearlySummary[0].avgDepth).toFixed(1)}m
            </span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-gw-surface/60 border border-gw-border/20">
          <div className="flex items-center gap-1 text-[9px] text-gw-muted mb-1">
            <Activity size={9} /> 全省沉降均值
          </div>
          <div className="text-amber-400 font-bold text-sm">
            {subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate}mm/a
            <span className="text-[9px] text-emerald-400 ml-1">
              ↓{((subsidenceYearlySummary[0].avgRate - subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate) / subsidenceYearlySummary[0].avgRate * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 主组件 ──

export function RealtimeMonitoringViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <Activity size={14} className="text-cyan-400" />
        <span>实时监测数据可视化 — 监测站网/水位动态/沉降热力/水质演变/预警面板</span>
      </div>

      {/* 监测站网总览 */}
      <MonitoringNetworkOverview />

      {/* 水位时序 + 预警面板 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WaterLevelTimeline />
        <MonitoringAlertPanel />
      </div>

      {/* 沉降热力图 + 水质演变 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SubsidenceHeatmap />
        <QualityEvolutionChart />
      </div>
    </div>
  );
}
