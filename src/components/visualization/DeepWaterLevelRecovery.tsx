/**
 * 多层含水层耦合可视化 — 深层承压水水位恢复响应
 */

import { useState } from 'react';
import { TrendingUp, Droplets } from 'lucide-react';
import { TechCard } from '../UI';
import { overExploitControl2024 } from '../../data/exploitation';
import { hydrogeologicalParams } from '../../data/groundwaterResources';

export function DeepWaterLevelRecovery() {
  const [hovered, setHovered] = useState<number | null>(null);

  const recovery = overExploitControl2024.waterLevelRecovery;
  const cities = [...recovery.cities].sort((a, b) => b.rise - a.rise);

  const SVG_W = 520;
  const SVG_H = 300;
  const M = { left: 60, right: 30, top: 30, bottom: 45 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_RISE = 4.0;

  const barH = PH / cities.length;

  function valToW(v: number): number {
    return (v / MAX_RISE) * PW;
  }

  // 漏斗消散时间线
  const milestones = overExploitControl2024.deepConeElimination;

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <TrendingUp size={14} className="text-cyan-400" />
        深层承压水水位恢复响应（2014-2024）
      </h3>

      {/* 漏斗消散状态 */}
      <div className="mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Droplets size={10} />
            深层承压水降落漏斗
          </span>
          <span className="text-gw-text">
            2014年: <span className="text-red-400 font-bold">{milestones.coneArea2014} km²</span>
            → 2024年: <span className="text-emerald-400 font-bold">{milestones.coneArea2024} km²</span>
            <span className="text-emerald-400 ml-1">({milestones.trend})</span>
          </span>
        </div>
        <div className="mt-1 text-[9px] text-gw-muted">
          {milestones.hengshuiClearing}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 1, 2, 3, 4].map(v => (
            <g key={v}>
              <line x1={M.left + valToW(v)} y1={M.top} x2={M.left + valToW(v)} y2={M.top + PH} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left + valToW(v)} y={M.top + PH + 14} fontSize="8" fill="#64748b" textAnchor="middle">+{v}m</text>
            </g>
          ))}

          {/* 水平条形 */}
          {cities.map((c, i) => {
            const y = M.top + i * barH + 2;
            const w = valToW(c.rise);
            const isHover = hovered === i;
            const color = c.rise > 2.5 ? '#22c55e' : c.rise > 1.5 ? '#3b82f6' : c.rise > 0.5 ? '#f59e0b' : '#94a3b8';
            return (
              <g key={c.city}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                <text x={M.left - 5} y={y + barH / 2 + 2} fontSize="8" fill={isHover ? '#06b6d4' : '#94a3b8'} textAnchor="end" fontWeight={isHover ? 'bold' : 'normal'}>
                  {c.city}
                </text>
                <rect x={M.left} y={y} width={w} height={barH - 4} fill={color} fillOpacity={isHover ? 0.85 : 0.55} rx="1" />
                <text x={M.left + w + 4} y={y + barH / 2 + 2} fontSize="8" fill={color} fontWeight="bold">
                  +{c.rise.toFixed(2)}m
                </text>
                {isHover && (
                  <text x={M.left + w + 50} y={y + barH / 2 + 2} fontSize="7" fill="#64748b">
                    {c.note}
                  </text>
                )}
              </g>
            );
          })}

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={M.left + PW / 2} y={SVG_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">水位回升幅度 (m)</text>
        </svg>
      </div>

      <div className="mt-2 p-2 rounded-lg bg-gw-surface/60 border border-gw-border/20 text-[10px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gw-muted">深层平均回升</span>
          <span className="text-cyan-400 font-bold">+{recovery.averageRise} m</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gw-muted">引江水累计替代</span>
          <span className="text-blue-400 font-bold">{overExploitControl2024.southNorthWaterTransfer.totalReceived} 亿m³</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gw-muted">开采量压减</span>
          <span className="text-amber-400 font-bold">{overExploitControl2024.volumeReduction.reduction} 亿m³ (-{overExploitControl2024.volumeReduction.reductionPercent}%)</span>
        </div>
        <div className="text-[9px] text-gw-muted/60 mt-1">
          释水系数: {hydrogeologicalParams.storageCoefficient} · 深层承压水以弹性释放为主，水位对开采量变化响应灵敏
        </div>
      </div>
    </TechCard>
  );
}

// ── 主组件 ──

