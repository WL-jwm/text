/**
 * 包气带入渗可视化 — 包气带剖面结构示意
 */

import { useState } from 'react';
import { Layers } from 'lucide-react';
import { TechCard } from '../UI';

export function VadoseProfileDiagram() {
  const [selectedLith, setSelectedLith] = useState(0);

  // 包气带岩性分层（简化模型：基于河北省典型山前平原剖面）
  const profileLayers = [
    { name: '表土耕作层', topDepth: 0, bottomDepth: 0.5, lithology: '亚砂土', color: '#8b6f47', moisture: 25, note: '根系带/蒸发活跃' },
    { name: '亚砂土层', topDepth: 0.5, bottomDepth: 3, lithology: '亚砂土', color: '#a68b5a', moisture: 30, note: '主要入渗通道' },
    { name: '亚粘土层', topDepth: 3, bottomDepth: 6, lithology: '亚粘土', color: '#9c8366', moisture: 35, note: '毛细上升带' },
    { name: '粉砂层', topDepth: 6, bottomDepth: 10, lithology: '粉砂', color: '#c4a878', moisture: 45, note: '毛细饱和过渡' },
    { name: '潜水面', topDepth: 10, bottomDepth: 10.5, lithology: '潜水', color: '#3b82f6', moisture: 100, note: '地下水位' },
  ];

  const SVG_W = 460;
  const SVG_H = 380;
  const M = { left: 100, right: 80, top: 30, bottom: 40 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_DEPTH = 12;

  function depthToY(d: number): number {
    return M.top + (d / MAX_DEPTH) * PH;
  }

  // 水分含量渐变色
  function moistureColor(m: number): string {
    const t = m / 100;
    const r = Math.round(139 + (59 - 139) * t);
    const g = Math.round(111 + (130 - 111) * t);
    const b = Math.round(71 + (246 - 71) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Layers size={14} className="text-cyan-400" />
          包气带剖面与水分分布
        </h3>
        <span className="text-[9px] text-gw-muted">典型山前平原剖面</span>
      </div>

      <div className="flex gap-2">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 岩性分层 */}
          {profileLayers.map((layer, i) => {
            const y1 = depthToY(layer.topDepth);
            const y2 = depthToY(layer.bottomDepth);
            const isSelected = selectedLith === i;
            return (
              <g key={i}
                onClick={() => setSelectedLith(i)}
                className="cursor-pointer"
              >
                <rect
                  x={M.left} y={y1}
                  width={PW} height={y2 - y1}
                  fill={moistureColor(layer.moisture)}
                  fillOpacity={isSelected ? 0.45 : 0.25}
                  stroke={isSelected ? '#06b6d4' : layer.color}
                  strokeWidth={isSelected ? 2 : 0.5}
                />
                {/* 岩性图案 */}
                {layer.lithology === '亚砂土' && i === 1 && (
                  <g opacity="0.3">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <circle key={j} cx={M.left + 30 + j * 40} cy={y1 + (y2 - y1) / 2} r="1.5" fill={layer.color} />
                    ))}
                  </g>
                )}
                {layer.lithology === '亚粘土' && (
                  <g opacity="0.3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <line key={j} x1={M.left + 20 + j * 50} y1={y1 + 5} x2={M.left + 40 + j * 50} y2={y2 - 5} stroke={layer.color} strokeWidth="0.5" />
                    ))}
                  </g>
                )}

                {/* 层标签 */}
                <text x={M.left - 5} y={(y1 + y2) / 2 + 3} fontSize="8" fill="#94a3b8" textAnchor="end">
                  {layer.name}
                </text>
                <text x={M.left - 5} y={(y1 + y2) / 2 + 13} fontSize="7" fill="#64748b" textAnchor="end">
                  {layer.bottomDepth}m
                </text>

                {/* 水分含量标注 */}
                <text x={M.left + PW + 5} y={(y1 + y2) / 2 + 3} fontSize="8" fill={moistureColor(layer.moisture)} textAnchor="start">
                  {layer.moisture}%
                </text>
              </g>
            );
          })}

          {/* 水分含量色阶条 */}
          <defs>
            <linearGradient id="moisture-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={moistureColor(20)} />
              <stop offset="50%" stopColor={moistureColor(50)} />
              <stop offset="100%" stopColor={moistureColor(100)} />
            </linearGradient>
          </defs>
          <rect x={M.left + PW + 25} y={M.top} width="10" height={PH} fill="url(#moisture-gradient)" rx="2" />
          <text x={M.left + PW + 40} y={M.top + 8} fontSize="7" fill="#64748b">100%</text>
          <text x={M.left + PW + 40} y={M.top + PH / 2} fontSize="7" fill="#64748b">50%</text>
          <text x={M.left + PW + 40} y={M.top + PH} fontSize="7" fill="#64748b">20%</text>

          {/* 深度轴 */}
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          {[0, 2, 4, 6, 8, 10, 12].map(d => (
            <g key={d}>
              <line x1={M.left - 3} y1={depthToY(d)} x2={M.left} y2={depthToY(d)} stroke="#334155" strokeWidth="0.5" />
              <text x={M.left - 8} y={depthToY(d) + 3} fontSize="7" fill="#64748b" textAnchor="end">{d}m</text>
            </g>
          ))}

          {/* 降水箭头 */}
          <g opacity="0.6">
            {[0, 60, 120, 180, 240].map((x, i) => (
              <g key={i}>
                <line x1={M.left + x + 20} y1={M.top - 15} x2={M.left + x + 18} y2={M.top - 5} stroke="#3b82f6" strokeWidth="1" />
                <polygon points={`${M.left + x + 18},${M.top - 3} ${M.left + x + 16},${M.top - 7} ${M.left + x + 20},${M.top - 7}`} fill="#3b82f6" />
              </g>
            ))}
            <text x={M.left + PW / 2} y={M.top - 18} fontSize="8" fill="#3b82f6" textAnchor="middle">降水入渗</text>
          </g>

          {/* 蒸发箭头 */}
          <g opacity="0.4">
            <path d={`M ${M.left + 10} ${M.top + 5} Q ${M.left + 15} ${M.top - 5} ${M.left + 20} ${M.top + 2}`} fill="none" stroke="#f59e0b" strokeWidth="1" />
            <path d={`M ${M.left + 40} ${M.top + 8} Q ${M.left + 45} ${M.top - 2} ${M.left + 50} ${M.top + 5}`} fill="none" stroke="#f59e0b" strokeWidth="1" />
            <text x={M.left + 30} y={M.top + 20} fontSize="7" fill="#f59e0b">蒸发</text>
          </g>

          {/* 毛细上升带标注 */}
          <line x1={M.left} y1={depthToY(6)} x2={M.left + PW} y2={depthToY(6)} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.5" />
          <text x={M.left + 5} y={depthToY(6) - 3} fontSize="7" fill="#06b6d4" opacity="0.6">毛细上升带顶面</text>

          {/* 潜水面标注 */}
          <line x1={M.left} y1={depthToY(10)} x2={M.left + PW} y2={depthToY(10)} stroke="#3b82f6" strokeWidth="1.5" />
          <text x={M.left + 5} y={depthToY(10) - 3} fontSize="8" fill="#3b82f6" fontWeight="bold">潜水面</text>
        </svg>
      </div>

      {/* 选中层详情 */}
      <div className="mt-2 p-2 rounded-lg bg-gw-surface/60 border border-gw-border/30 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gw-text font-medium">{profileLayers[selectedLith].name}</span>
          <span className="text-gw-muted">{profileLayers[selectedLith].lithology} | {profileLayers[selectedLith].topDepth}~{profileLayers[selectedLith].bottomDepth}m</span>
        </div>
        <div className="text-gw-muted mt-1 flex items-center gap-3">
          <span>体积含水率: {profileLayers[selectedLith].moisture}%</span>
          <span>·</span>
          <span>{profileLayers[selectedLith].note}</span>
        </div>
      </div>
    </TechCard>
  );
}

// ── 子组件2：降水入渗系数对比柱状图 ──

