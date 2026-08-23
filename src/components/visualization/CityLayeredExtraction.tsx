/**
 * 多层含水层耦合可视化 — 城市分层开采对比
 */

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { TechCard } from '../UI';
import { groundwaterExploitation2024 } from '../../data/exploitation';
import { cityGroundwaterExtraction2000 } from '../../data/groundwaterResources';

export function CityLayeredExtraction() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState<'2000' | '2024'>('2024');

  const SVG_W = 520;
  const SVG_H = 340;
  const M = { left: 50, right: 20, top: 30, bottom: 60 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;

  // 2024年数据（万m³ → 亿m³）
  const data2024 = groundwaterExploitation2024.map(d => ({
    city: d.city,
    shallow: d.shallow / 10000,
    deep: d.deep / 10000,
    total: d.total / 10000,
  }));

  // 2000年数据（亿m³）
  const data2000 = cityGroundwaterExtraction2000.map(d => ({
    city: d.city,
    shallow: d.shallow,
    deep: d.deep,
    brackish: d.brackish,
    total: d.total,
  }));

  const data = view === '2024' ? data2024 : data2000;
  const maxTotal = Math.max(...data.map(d => d.total));
  const barW = PW / data.length;

  function valToH(v: number): number {
    return (v / maxTotal) * PH * 0.9;
  }

  const hasBrackish = view === '2000';

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <BarChart3 size={14} className="text-cyan-400" />
          城市分层开采对比
        </h3>
        <div className="flex items-center gap-1">
          {(['2000', '2024'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                view === v ? 'bg-gw-blue/15 border-gw-blue/40 text-gw-blue' : 'border-gw-border/30 text-gw-muted'
              }`}
            >
              {v}年
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 5, 10, 15, 20, 25, 30, 35].map(v => (
            <g key={v}>
              <line x1={M.left} y1={M.top + PH - (v / maxTotal) * PH * 0.9} x2={M.left + PW} y2={M.top + PH - (v / maxTotal) * PH * 0.9} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left - 5} y={M.top + PH - (v / maxTotal) * PH * 0.9 + 3} fontSize="8" fill="#64748b" textAnchor="end">{v}</text>
            </g>
          ))}

          {/* 堆叠柱 */
          data.map((d, i) => {
            const x = M.left + i * barW + barW * 0.15;
            const w = barW * 0.7;
            const isHover = hovered === d.city;
            const shallowH = valToH(d.shallow);
            const deepH = valToH(d.deep);
            const brackishH = hasBrackish ? valToH((d as { brackish?: number }).brackish ?? 0) : 0;
            const baseY = M.top + PH;

            return (
              <g key={d.city}
                onMouseEnter={() => setHovered(d.city)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                {/* 浅层 */}
                <rect x={x} y={baseY - shallowH} width={w} height={shallowH} fill="#22c55e" fillOpacity={isHover ? 0.85 : 0.6} rx="1" />
                {/* 深层 */}
                <rect x={x} y={baseY - shallowH - deepH} width={w} height={deepH} fill="#f59e0b" fillOpacity={isHover ? 0.85 : 0.6} rx="1" />
                {/* 咸水（仅2000年） */}
                {hasBrackish && brackishH > 0 && (
                  <rect x={x} y={baseY - shallowH - deepH - brackishH} width={w} height={brackishH} fill="#ef4444" fillOpacity={isHover ? 0.7 : 0.4} rx="1" />
                )}

                {/* 城市名 */}
                <text x={x + w / 2} y={M.top + PH + 14} fontSize="7" fill={isHover ? '#06b6d4' : '#94a3b8'} textAnchor="middle" fontWeight={isHover ? 'bold' : 'normal'}>
                  {d.city}
                </text>

                {/* hover详情 */}
                {isHover && (
                  <g>
                    <rect x={x + w + 5} y={baseY - 60} width="105" height="52" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                    <text x={x + w + 13} y={baseY - 46} fontSize="9" fill="#06b6d4" fontWeight="bold">{d.city} ({view})</text>
                    <text x={x + w + 13} y={baseY - 34} fontSize="8" fill="#22c55e">浅层: {d.shallow.toFixed(2)}亿m³</text>
                    <text x={x + w + 13} y={baseY - 22} fontSize="8" fill="#f59e0b">深层: {d.deep.toFixed(2)}亿m³</text>
                    {hasBrackish && <text x={x + w + 13} y={baseY - 10} fontSize="8" fill="#ef4444">咸水: {((d as { brackish?: number }).brackish ?? 0).toFixed(2)}亿m³</text>}
                    <text x={x + w + 13} y={baseY + (hasBrackish ? 2 : -10)} fontSize="7" fill="#94a3b8">合计: {d.total.toFixed(2)}亿m³</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={10} y={M.top + PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 10 ${M.top + PH / 2})`}>开采量 (亿m³)</text>
        </svg>
      </div>

      <div className="mt-1 flex items-center gap-3 text-[9px]">
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-green-500/60 inline-block" /> 浅层水</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-amber-500/60 inline-block" /> 深层水</span>
        {hasBrackish && <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-red-500/40 inline-block" /> 咸水利用</span>}
        <span className="text-gw-muted/50 ml-auto">
          {view === '2024' ? '2024年深层大幅压采(较2014减39.1%)' : '2000年咸水利用量较大'}
        </span>
      </div>
    </TechCard>
  );
}

// ── 子组件5：深层水位恢复响应 ──

