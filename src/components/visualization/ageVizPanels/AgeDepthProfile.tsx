/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 * 面板组件：AgeDepthProfile（拆分自 GroundwaterAgeViz.tsx）
 */

import { useState } from 'react';
import { Info, Clock } from 'lucide-react';
import { TechCard } from '../../UI';
import { carbon14AgeDepth } from '../../../data/hydrochemistry';
import { AD_W, AD_H, AD_M, AD_PW, AD_PH } from './ageVizConstants';
import { depthToY, ageToX } from './ageVizUtils';

// ── 子组件：14C年龄-深度剖面 ──
export function AgeDepthProfile() {
  const [hovered, setHovered] = useState<number | null>(null);

  // 含水层组背景区域
  const aquiferBands = [
    { y1: 0, y2: 50, color: '#22c55e', label: '第I组' },
    { y1: 50, y2: 150, color: '#3b82f6', label: '第II组' },
    { y1: 150, y2: 350, color: '#8b5cf6', label: '第III组' },
    { y1: 350, y2: 550, color: '#f59e0b', label: '第IV组' },
  ];

  // 年龄刻度（对数）
  const ageTicks = [1, 10, 100, 1000, 10000, 30000];

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <Clock size={14} className="text-cyan-400" />
        14C年龄-深度剖面
      </h3>
      <div className="overflow-x-auto">
        <svg width={AD_W} height={AD_H} className="max-w-none">
          {/* 含水层组背景 */}
          {aquiferBands.map((band, i) => (
            <g key={i}>
              <rect
                x={AD_M.left} y={depthToY(band.y1)}
                width={AD_PW} height={depthToY(band.y2) - depthToY(band.y1)}
                fill={band.color} fillOpacity={0.05}
              />
              <text
                x={AD_M.left + AD_PW - 5}
                y={(depthToY(band.y1) + depthToY(band.y2)) / 2}
                fontSize="8" fill={band.color} textAnchor="end" opacity="0.5"
              >
                {band.label}
              </text>
            </g>
          ))}

          {/* 网格线 */}
          {ageTicks.map(age => {
            const x = ageToX(age);
            return (
              <g key={age}>
                <line x1={x} y1={AD_M.top} x2={x} y2={AD_M.top + AD_PH} stroke="#1e293b" strokeWidth="0.3" />
                <text x={x} y={AD_H - AD_M.bottom + 15} fontSize="8" fill="#64748b" textAnchor="middle">
                  {age >= 1000 ? `${(age / 1000).toFixed(0)}k` : age}年
                </text>
              </g>
            );
          })}

          {/* 深度刻度 */}
          {[0, 50, 100, 200, 300, 400, 500].map(d => (
            <g key={d}>
              <line x1={AD_M.left} y1={depthToY(d)} x2={AD_M.left + AD_PW} y2={depthToY(d)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={AD_M.left - 5} y={depthToY(d) + 3} fontSize="8" fill="#64748b" textAnchor="end">{d}m</text>
            </g>
          ))}

          {/* 轴 */}
          <line x1={AD_M.left} y1={AD_M.top} x2={AD_M.left} y2={AD_M.top + AD_PH} stroke="#334155" strokeWidth="1" />
          <line x1={AD_M.left} y1={AD_M.top + AD_PH} x2={AD_M.left + AD_PW} y2={AD_M.top + AD_PH} stroke="#334155" strokeWidth="1" />

          {/* 轴标签 */}
          <text x={AD_M.left + AD_PW / 2} y={AD_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">14C表观年龄 (年, 对数刻度)</text>
          <text x={15} y={AD_M.top + AD_PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 15 ${AD_M.top + AD_PH / 2})`}>深度 (m)</text>

          {/* 年龄-深度曲线 */}
          {(() => {
            const pts = carbon14AgeDepth.map(d => ({ x: ageToX(d.age), y: depthToY(d.depth), data: d }));
            const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            return (
              <>
                <path d={path} fill="none" stroke="#06b6d4" strokeWidth="2" />
                {pts.map((p, i) => (
                  <g key={i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 4} fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                    {hovered === i && (
                      <g>
                        <rect x={p.x + 12} y={p.y - 35} width="140" height="55" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                        <text x={p.x + 20} y={p.y - 20} fontSize="9" fill="#06b6d4" fontWeight="bold">{p.data.type}</text>
                        <text x={p.x + 20} y={p.y - 8} fontSize="8" fill="#94a3b8">深度: {p.data.depth}m</text>
                        <text x={p.x + 20} y={p.y + 4} fontSize="8" fill="#94a3b8">年龄: {p.data.age >= 1000 ? `${(p.data.age / 1000).toFixed(1)}k年` : `${p.data.age}年`}</text>
                        <text x={p.x + 20} y={p.y + 16} fontSize="7" fill="#64748b">{p.data.note}</text>
                      </g>
                    )}
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </div>
      <div className="mt-2 text-[9px] text-gw-muted flex items-center gap-2">
        <Info size={9} />
        14C半衰期5730年，适用于测定深层承压水年龄(数千~数万年)
      </div>
    </TechCard>
  );
}
