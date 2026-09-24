/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 * 面板组件：TritiumDecayChart（拆分自 GroundwaterAgeViz.tsx）
 */

import { useState } from 'react';
import { Waves } from 'lucide-react';
import { TechCard } from '../../UI';
import { delta18OPathway } from '../../../data/hydrochemistry';
import { TR_W, TR_H, TR_M, TR_PW, TR_PH } from './ageVizConstants';
import { distToX_T, tritiumToY } from './ageVizUtils';

// ── 子组件：氚含量沿径流路径衰减 ──
export function TritiumDecayChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  // 检出限参考线
  const detectionLimit = 0.5;

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <Waves size={14} className="text-cyan-400" />
        氚含量沿径流路径变化
      </h3>
      <div className="overflow-x-auto">
        <svg width={TR_W} height={TR_H} className="max-w-none">
          {/* 网格 */}
          {[0, 50, 100, 150, 200].map(d => (
            <g key={d}>
              <line x1={distToX_T(d)} y1={TR_M.top} x2={distToX_T(d)} y2={TR_M.top + TR_PH} stroke="#1e293b" strokeWidth="0.3" />
              <text x={distToX_T(d)} y={TR_H - TR_M.bottom + 14} fontSize="8" fill="#64748b" textAnchor="middle">{d}km</text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25].map(t => (
            <g key={t}>
              <line x1={TR_M.left} y1={tritiumToY(t)} x2={TR_M.left + TR_PW} y2={tritiumToY(t)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={TR_M.left - 5} y={tritiumToY(t) + 3} fontSize="8" fill="#64748b" textAnchor="end">{t} TU</text>
            </g>
          ))}

          {/* 检出限参考线 */}
          <line x1={TR_M.left} y1={tritiumToY(detectionLimit)} x2={TR_M.left + TR_PW} y2={tritiumToY(detectionLimit)} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
          <text x={TR_M.left + TR_PW - 5} y={tritiumToY(detectionLimit) - 3} fontSize="7" fill="#ef4444" textAnchor="end" opacity="0.6">检出限 0.5 TU</text>

          {/* 轴 */}
          <line x1={TR_M.left} y1={TR_M.top} x2={TR_M.left} y2={TR_M.top + TR_PH} stroke="#334155" strokeWidth="1" />
          <line x1={TR_M.left} y1={TR_M.top + TR_PH} x2={TR_M.left + TR_PW} y2={TR_M.top + TR_PH} stroke="#334155" strokeWidth="1" />

          {/* 轴标签 */}
          <text x={TR_M.left + TR_PW / 2} y={TR_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">距山前距离 (km)</text>
          <text x={15} y={TR_M.top + TR_PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 15 ${TR_M.top + TR_PH / 2})`}>氚浓度 (TU)</text>

          {/* 浅层水曲线 */}
          {(() => {
            const pts = delta18OPathway.map((d, i) => ({
              x: distToX_T(d.distance),
              y: tritiumToY(d.tritium_shallow),
              data: d,
              index: i,
            }));
            const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            const areaPath = `${path} L ${pts[pts.length - 1].x} ${TR_M.top + TR_PH} L ${pts[0].x} ${TR_M.top + TR_PH} Z`;
            return (
              <>
                <path d={areaPath} fill="#22c55e" fillOpacity="0.08" />
                <path d={path} fill="none" stroke="#22c55e" strokeWidth="2" />
                {pts.map((p) => (
                  <g key={`s-${p.index}`}
                    onMouseEnter={() => setHovered(p.index)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={p.x} cy={p.y} r={hovered === p.index ? 5 : 3} fill="#22c55e" stroke="#fff" strokeWidth="1" />
                  </g>
                ))}
              </>
            );
          })()}

          {/* 深层水曲线 */}
          {(() => {
            const pts = delta18OPathway.map((d, i) => ({
              x: distToX_T(d.distance),
              y: tritiumToY(d.tritium_deep),
              index: i,
            }));
            const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            return (
              <>
                <path d={path} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                {pts.map((p) => (
                  <g key={`d-${p.index}`}
                    onMouseEnter={() => setHovered(p.index)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={p.x} cy={p.y} r={hovered === p.index ? 5 : 3} fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                  </g>
                ))}
              </>
            );
          })()}

          {/* Hover详情 */}
          {hovered !== null && (
            <g>
              {(() => {
                const d = delta18OPathway[hovered];
                const x = distToX_T(d.distance);
                return (
                  <>
                    <line x1={x} y1={TR_M.top} x2={x} y2={TR_M.top + TR_PH} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 2" />
                    <rect x={x + 8} y={TR_M.top + 5} width="160" height="60" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                    <text x={x + 16} y={TR_M.top + 20} fontSize="9" fill="#06b6d4" fontWeight="bold">{d.zone}</text>
                    <text x={x + 16} y={TR_M.top + 33} fontSize="8" fill="#22c55e">浅层氚: {d.tritium_shallow} TU</text>
                    <text x={x + 16} y={TR_M.top + 45} fontSize="8" fill="#f59e0b">深层氚: {d.tritium_deep} TU</text>
                    <text x={x + 16} y={TR_M.top + 57} fontSize="7" fill="#64748b">距山前: {d.distance}km</text>
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      <div className="mt-2 flex items-center gap-4 text-[9px]">
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-green-500 inline-block" /> 浅层潜水
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" /> 深层承压水
        </span>
        <span className="text-gw-muted/50 ml-auto">3H半衰期12.43年，氚含量反映现代水补给比例</span>
      </div>
    </TechCard>
  );
}
