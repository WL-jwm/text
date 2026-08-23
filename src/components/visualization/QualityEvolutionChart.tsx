/**
 * 实时监测可视化 — 地下水水质演变
 */

import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { TechCard } from '../UI';
import { cityQualityYearly, qualityYearlySummary, TS_FULL_YEARS } from '../../data/historicalTimeSeries';

export function QualityEvolutionChart() {
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

