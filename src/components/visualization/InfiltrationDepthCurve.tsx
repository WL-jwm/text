/**
 * 包气带入渗可视化 — 入渗系数随水位埋深变化曲线
 */

import { useState, useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { TechCard } from '../UI';

export function InfiltrationDepthCurve() {
  // 基于经验关系：入渗系数随水位埋深变化（先增后减）
  // 最佳埋深区间：2~5m（取决于岩性）
  const SVG_W = 440;
  const SVG_H = 280;
  const M = { left: 45, right: 20, top: 25, bottom: 45 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_DEPTH = 15;
  const MAX_ALPHA = 50;

  function depthToX(d: number): number {
    return M.left + (d / MAX_DEPTH) * PW;
  }
  function alphaToY(a: number): number {
    return M.top + PH - (a / MAX_ALPHA) * PH;
  }

  // 不同岩性的入渗系数-埋深曲线
  const curves = useMemo(() => {
    const lithTypes = [
      { label: '砂砾石', peakAlpha: 45, optimalDepth: 4, color: '#22c55e', peakWidth: 5 },
      { label: '亚砂土', peakAlpha: 30, optimalDepth: 3, color: '#3b82f6', peakWidth: 3 },
      { label: '亚粘土', peakAlpha: 20, optimalDepth: 3, color: '#f59e0b', peakWidth: 3 },
      { label: '粘土', peakAlpha: 12, optimalDepth: 3, color: '#ef4444', peakWidth: 2 },
    ];

    return lithTypes.map(lt => {
      const points: { x: number; y: number; depth: number; alpha: number }[] = [];
      for (let d = 0; d <= MAX_DEPTH; d += 0.5) {
        // 钟形曲线：最佳埋深处入渗系数最大，过深过浅均降低
        const dist = Math.abs(d - lt.optimalDepth);
        const alpha = lt.peakAlpha * Math.exp(-(dist * dist) / (2 * lt.peakWidth * lt.peakWidth));
        // 埋深<1m时蒸发强，入渗降低
        const evapFactor = d < 1 ? d : 1;
        // 埋深>8m时包气带厚，入渗降低
        const thickFactor = d > 8 ? Math.exp(-(d - 8) / 3) : 1;
        const finalAlpha = alpha * evapFactor * thickFactor;
        points.push({ x: depthToX(d), y: alphaToY(finalAlpha), depth: d, alpha: finalAlpha });
      }
      return { ...lt, points };
    });
  }, []);

  const [hoveredLith, setHoveredLith] = useState<number | null>(null);

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <TrendingDown size={14} className="text-cyan-400" />
        入渗系数 - 水位埋深关系
      </h3>
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 2, 4, 6, 8, 10, 12, 14].map(d => (
            <g key={d}>
              <line x1={depthToX(d)} y1={M.top} x2={depthToX(d)} y2={M.top + PH} stroke="#1e293b" strokeWidth="0.3" />
              <text x={depthToX(d)} y={M.top + PH + 14} fontSize="8" fill="#64748b" textAnchor="middle">{d}m</text>
            </g>
          ))}
          {[0, 10, 20, 30, 40, 50].map(a => (
            <g key={a}>
              <line x1={M.left} y1={alphaToY(a)} x2={M.left + PW} y2={alphaToY(a)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left - 5} y={alphaToY(a) + 3} fontSize="8" fill="#64748b" textAnchor="end">{a}%</text>
            </g>
          ))}

          {/* 最佳埋深区间 */}
          <rect x={depthToX(2)} y={M.top} width={depthToX(5) - depthToX(2)} height={PH} fill="#06b6d4" fillOpacity="0.05" />
          <text x={depthToX(3.5)} y={M.top + 12} fontSize="8" fill="#06b6d4" textAnchor="middle" opacity="0.5">最佳埋深区间</text>

          {/* 蒸发极限深度标注 */}
          <line x1={depthToX(5)} y1={M.top} x2={depthToX(5)} y2={M.top + PH} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <text x={depthToX(5) + 3} y={M.top + 10} fontSize="7" fill="#ef4444" opacity="0.5">蒸发极限~5m</text>

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={M.left + PW / 2} y={SVG_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">水位埋深 (m)</text>
          <text x={10} y={M.top + PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 10 ${M.top + PH / 2})`}>入渗系数 (%)</text>

          {/* 曲线 */}
          {curves.map((curve, ci) => {
            const path = curve.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            const isHover = hoveredLith === ci;
            return (
              <g key={ci}
                onMouseEnter={() => setHoveredLith(ci)}
                onMouseLeave={() => setHoveredLith(null)}
                className="cursor-pointer"
              >
                <path d={path} fill="none" stroke={curve.color} strokeWidth={isHover ? 2.5 : 1.5} opacity={isHover ? 1 : 0.7} />
                {isHover && curve.points.filter((_, i) => i % 4 === 0).map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3" fill={curve.color} stroke="#fff" strokeWidth="0.5" />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 图例 */}
      <div className="mt-1 flex items-center gap-3 text-[9px]">
        {curves.map((c, i) => (
          <button
            key={i}
            onClick={() => setHoveredLith(hoveredLith === i ? null : i)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
              hoveredLith === i ? 'bg-gw-blue/10' : ''
            }`}
          >
            <span className="w-4 h-0.5 inline-block" style={{ background: c.color }} />
            <span className="text-gw-muted">{c.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-1 text-[8px] text-gw-muted/50">
        钟形模型：最佳埋深2~5m入渗最大 · &lt;1m蒸发强 · &gt;8m包气带厚入渗降低
      </div>
    </TechCard>
  );
}

// ── 子组件4：山区流域入渗系数排行 ──

