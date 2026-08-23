/**
 * 包气带入渗可视化 — 各含水层入渗系数分区对比
 */

import { useState } from 'react';
import { CloudRain } from 'lucide-react';
import { TechCard } from '../UI';
import { infiltrationCoeff, type InfiltrationParam } from '../../data/hydroParams';
import { avgRange } from './vadoseTypes';

export function InfiltrationCoeffChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const SVG_W = 460;
  const SVG_H = 320;
  const M = { left: 45, right: 20, top: 30, bottom: 60 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_VAL = 55; // 百分比上限

  const barWidth = PW / (infiltrationCoeff.length * 4); // 3 region + gap

  function valToH(v: number): number {
    return (v / MAX_VAL) * PH;
  }

  const regions: { key: keyof InfiltrationParam; label: string; color: string }[] = [
    { key: 'plain', label: '平原', color: '#22c55e' },
    { key: 'basin', label: '盆地', color: '#3b82f6' },
    { key: 'mountain', label: '山区', color: '#f59e0b' },
  ];

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <CloudRain size={14} className="text-cyan-400" />
        降水入渗系数对比（按岩性 × 地貌）
      </h3>
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* Y轴网格 */}
          {[0, 10, 20, 30, 40, 50].map(v => (
            <g key={v}>
              <line x1={M.left} y1={M.top + PH - valToH(v)} x2={M.left + PW} y2={M.top + PH - valToH(v)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left - 5} y={M.top + PH - valToH(v) + 3} fontSize="8" fill="#64748b" textAnchor="end">{v}%</text>
            </g>
          ))}

          {/* 柱子 */}
          {infiltrationCoeff.map((item, i) => {
            const groupX = M.left + i * (PW / infiltrationCoeff.length) + 5;
            const isHover = hovered === i;
            return (
              <g key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                {regions.map((region, ri) => {
                  const val = avgRange(item[region.key] as string);
                  const h = valToH(val);
                  const x = groupX + ri * barWidth;
                  const y = M.top + PH - h;
                  return (
                    <g key={region.key}>
                      <rect
                        x={x} y={y}
                        width={barWidth - 2} height={h}
                        fill={region.color}
                        fillOpacity={isHover ? 0.9 : 0.65}
                        rx="1"
                      />
                      {isHover && (
                        <text x={x + barWidth / 2} y={y - 3} fontSize="7" fill={region.color} textAnchor="middle">
                          {val.toFixed(0)}%
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* 岩性标签 */}
                <text x={groupX + barWidth * 1.5} y={M.top + PH + 14} fontSize="8" fill={isHover ? '#06b6d4' : '#94a3b8'} textAnchor="middle">
                  {item.lithology}
                </text>
                <text x={groupX + barWidth * 1.5} y={M.top + PH + 26} fontSize="7" fill="#475569" textAnchor="middle">
                  最佳埋深{item.optDepth}m
                </text>
              </g>
            );
          })}

          {/* X/Y轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={10} y={M.top + PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 10 ${M.top + PH / 2})`}>入渗系数 (%)</text>
        </svg>
      </div>

      {/* 图例 */}
      <div className="mt-1 flex items-center gap-3 text-[9px]">
        {regions.map(r => (
          <span key={r.key} className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ background: r.color, opacity: 0.65 }} />
            <span className="text-gw-muted">{r.label}</span>
          </span>
        ))}
        <span className="text-gw-muted/50 ml-auto">柱高=范围均值 · hover查看精确值</span>
      </div>
    </TechCard>
  );
}

// ── 子组件3：入渗系数-水位埋深关系曲线 ──

