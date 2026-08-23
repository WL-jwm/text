/**
 * 包气带入渗可视化 — 山区岩性入渗系数排序
 */

import { useState, useMemo } from 'react';
import { Mountain } from 'lucide-react';
import { TechCard } from '../UI';
import { lithInfiltration } from '../../data/hydroParams';
import type { LithCategory } from './vadoseTypes';

export function MountainInfiltrationRanking() {
  const [lithFilter, setLithFilter] = useState<LithCategory>('all');

  const filtered = useMemo(() => {
    const data = lithFilter === 'all'
      ? lithInfiltration
      : lithInfiltration.filter(d => d.lithology === lithFilter);
    return [...data].sort((a, b) => parseFloat(b.alpha) - parseFloat(a.alpha));
  }, [lithFilter]);

  const SVG_W = 460;
  const SVG_H = 340;
  const M = { left: 100, right: 50, top: 25, bottom: 45 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_ALPHA = 50;

  const rowH = PH / Math.max(filtered.length, 1);

  const lithColors: Record<string, string> = {
    '碳酸盐岩': '#06b6d4',
    '岩浆岩和变质岩': '#f59e0b',
    '碎屑岩': '#8b5cf6',
  };

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Mountain size={14} className="text-cyan-400" />
          山区流域入渗系数排行
        </h3>
        <select
          value={lithFilter}
          onChange={e => setLithFilter(e.target.value as LithCategory)}
          className="px-2 py-0.5 rounded bg-gw-surface border border-gw-border/30 text-gw-text text-[10px]"
        >
          <option value="all">全部岩性</option>
          <option value="碳酸盐岩">碳酸盐岩</option>
          <option value="岩浆岩和变质岩">岩浆岩和变质岩</option>
          <option value="碎屑岩">碎屑岩</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 10, 20, 30, 40, 50].map(v => (
            <g key={v}>
              <line x1={M.left + (v / MAX_ALPHA) * PW} y1={M.top} x2={M.left + (v / MAX_ALPHA) * PW} y2={M.top + PH} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left + (v / MAX_ALPHA) * PW} y={M.top + PH + 14} fontSize="8" fill="#64748b" textAnchor="middle">{v}%</text>
            </g>
          ))}

          {/* 条形 */}
          {filtered.slice(0, 15).map((item, i) => {
            const alpha = parseFloat(item.alpha);
            const barW = (alpha / MAX_ALPHA) * PW;
            const y = M.top + i * rowH + 2;
            const color = lithColors[item.lithology] ?? '#64748b';
            return (
              <g key={i}>
                <text x={M.left - 5} y={y + rowH / 2 + 2} fontSize="7" fill="#94a3b8" textAnchor="end">
                  {item.lithology.length > 4 ? item.lithology.slice(0, 4) : item.lithology}·{item.basin}
                </text>
                <rect x={M.left} y={y} width={barW} height={rowH - 4} fill={color} fillOpacity="0.5" rx="1" />
                <text x={M.left + barW + 4} y={y + rowH / 2 + 2} fontSize="8" fill={color} fontWeight="bold">
                  {alpha.toFixed(1)}%
                </text>
                {/* 降水量对照 */}
                <text x={M.left + PW + 5} y={y + rowH / 2 + 2} fontSize="7" fill="#64748b">
                  P={item.P}mm
                </text>
              </g>
            );
          })}

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={M.left + PW / 2} y={SVG_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">入渗系数 α (%)</text>
        </svg>
      </div>

      <div className="mt-1 flex items-center gap-3 text-[9px]">
        {Object.entries(lithColors).map(([lith, color]) => (
          <span key={lith} className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ background: color, opacity: 0.5 }} />
            <span className="text-gw-muted">{lith}</span>
          </span>
        ))}
        <span className="text-gw-muted/50 ml-auto">右侧P=年均降水量</span>
      </div>
    </TechCard>
  );
}

// ── 子组件5：水均衡补给构成 ──

