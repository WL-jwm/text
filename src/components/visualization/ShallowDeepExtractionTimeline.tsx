/**
 * 多层含水层耦合可视化 — 深层-浅层开采量时序对比
 */

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { TechCard } from '../UI';
import { exploitationTimeSeries } from '../../data/exploitation';

export function ShallowDeepExtractionTimeline() {
  const [hovered, setHovered] = useState<number | null>(null);

  const SVG_W = 520;
  const SVG_H = 300;
  const M = { left: 50, right: 50, top: 30, bottom: 45 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_VAL = 120; // 亿m³

  const years = exploitationTimeSeries;
  function xToX(i: number): number {
    return M.left + (i / (years.length - 1)) * PW;
  }
  function valToY(v: number): number {
    return M.top + PH - (v / MAX_VAL) * PH;
  }

  // 浅层区域路径
  const shallowArea = years.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xToX(i)} ${valToY(d.shallow)}`).join(' ');
  const shallowFill = `${shallowArea} L ${xToX(years.length - 1)} ${M.top + PH} L ${xToX(0)} ${M.top + PH} Z`;

  // 深层区域路径
  const deepArea = years.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xToX(i)} ${valToY(d.deep)}`).join(' ');
  const deepFill = `${deepArea} L ${xToX(years.length - 1)} ${M.top + PH} L ${xToX(0)} ${M.top + PH} Z`;

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <BarChart3 size={14} className="text-cyan-400" />
        深层-浅层开采量时序对比（2014-2024）
      </h3>
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 20, 40, 60, 80, 100, 120].map(v => (
            <g key={v}>
              <line x1={M.left} y1={valToY(v)} x2={M.left + PW} y2={valToY(v)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left - 5} y={valToY(v) + 3} fontSize="8" fill="#64748b" textAnchor="end">{v}</text>
            </g>
          ))}

          {/* 浅层区域 */}
          <path d={shallowFill} fill="#22c55e" fillOpacity="0.12" />
          <path d={shallowArea} fill="none" stroke="#22c55e" strokeWidth="2" />

          {/* 深层区域 */}
          <path d={deepFill} fill="#f59e0b" fillOpacity="0.12" />
          <path d={deepArea} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />

          {/* 数据点 + hover */}
          {years.map((d, i) => (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* 悬停竖线 */}
              {hovered === i && (
                <line x1={xToX(i)} y1={M.top} x2={xToX(i)} y2={M.top + PH} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 2" />
              )}
              <circle cx={xToX(i)} cy={valToY(d.shallow)} r={hovered === i ? 4 : 3} fill="#22c55e" stroke="#fff" strokeWidth="0.5" />
              <circle cx={xToX(i)} cy={valToY(d.deep)} r={hovered === i ? 4 : 3} fill="#f59e0b" stroke="#fff" strokeWidth="0.5" />
              <text x={xToX(i)} y={M.top + PH + 14} fontSize="8" fill={hovered === i ? '#06b6d4' : '#64748b'} textAnchor="middle">{d.year}</text>

              {/* Hover详情 */}
              {hovered === i && (
                <g>
                  <rect x={xToX(i) + 8} y={M.top + 5} width="135" height="62" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                  <text x={xToX(i) + 16} y={M.top + 20} fontSize="9" fill="#06b6d4" fontWeight="bold">{d.year}年</text>
                  <text x={xToX(i) + 16} y={M.top + 33} fontSize="8" fill="#22c55e">浅层: {d.shallow} 亿m³</text>
                  <text x={xToX(i) + 16} y={M.top + 45} fontSize="8" fill="#f59e0b">深层: {d.deep} 亿m³</text>
                  <text x={xToX(i) + 16} y={M.top + 57} fontSize="8" fill="#94a3b8">合计: {d.total} 亿m³</text>
                  <text x={xToX(i) + 16} y={M.top + 69} fontSize="7" fill="#64748b">{d.note}</text>
                </g>
              )}
            </g>
          ))}

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={M.left + PW / 2} y={SVG_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">年份</text>
          <text x={12} y={M.top + PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 12 ${M.top + PH / 2})`}>开采量 (亿m³)</text>
        </svg>
      </div>

      {/* 压采率 */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">浅层压采</div>
          <div className="text-green-400 font-bold">
            {(((years[0].shallow - years[years.length - 1].shallow) / years[0].shallow) * 100).toFixed(1)}%
          </div>
          <div className="text-gw-muted/50">{years[0].shallow}→{years[years.length - 1].shallow}亿m³</div>
        </div>
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">深层压采</div>
          <div className="text-amber-400 font-bold">
            {(((years[0].deep - years[years.length - 1].deep) / years[0].deep) * 100).toFixed(1)}%
          </div>
          <div className="text-gw-muted/50">{years[0].deep}→{years[years.length - 1].deep}亿m³</div>
        </div>
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">总压采</div>
          <div className="text-cyan-400 font-bold">
            {(((years[0].total - years[years.length - 1].total) / years[0].total) * 100).toFixed(1)}%
          </div>
          <div className="text-gw-muted/50">{years[0].total}→{years[years.length - 1].total}亿m³</div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 子组件3：层间越流补给关系桑基流图 ──

