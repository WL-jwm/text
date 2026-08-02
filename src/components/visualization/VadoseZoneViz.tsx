/**
 * VadoseZoneViz — E-02 包气带水分运移可视化模块
 *
 * 融合入渗系数/给水度/渗透参数/降水补给数据，提供包气带水分运移多维度分析：
 *   1. 包气带剖面示意图（地表→毛细带→潜水面的岩性分层+水分分布）
 *   2. 降水入渗系数对比（不同岩性 × 平原/盆地/山区）
 *   3. 入渗系数-水位埋深关系曲线（最佳埋深区间标注）
 *   4. 山区流域入渗系数排行（按岩性/流域分组+降水量对照）
 *   5. 水均衡补给构成饼图（降水入渗占比）
 */

import { useState, useMemo } from 'react';
import { CloudRain, Layers, Droplets, TrendingDown, Mountain, Gauge } from 'lucide-react';
import { TechCard } from '../UI';
import {
  infiltrationCoeff,
  lithInfiltration,
  type InfiltrationParam,
} from '../../data/hydroParams';
import { plainWaterBalance, hydrogeologicalParams } from '../../data/groundwaterResources';

// ── 类型 ──

type LithCategory = 'all' | '碳酸盐岩' | '岩浆岩和变质岩' | '碎屑岩';

// ── 辅助：解析范围字符串 "8~15%" → {min: 8, max: 15} ──

function parseRange(str: string): { min: number; max: number } {
  const m = str.match(/([\d.]+)\s*[~～-]\s*([\d.]+)/);
  if (m) return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
  const single = str.match(/([\d.]+)/);
  if (single) return { min: parseFloat(single[1]), max: parseFloat(single[1]) };
  return { min: 0, max: 0 };
}

function avgRange(str: string): number {
  const { min, max } = parseRange(str);
  return (min + max) / 2;
}

// ── 子组件1：包气带剖面示意图 ──

function VadoseProfileDiagram() {
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

function InfiltrationCoeffChart() {
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

function InfiltrationDepthCurve() {
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

function MountainInfiltrationRanking() {
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

function RechargeComposition() {
  const [hovered, setHovered] = useState<number | null>(null);

  const rechargeData = plainWaterBalance.rechargeBreakdown;
  const total = rechargeData.reduce((s, r) => s + r.value, 0);

  // 饼图参数
  const CX = 130, CY = 140, R = 80;

  // 计算扇形
  const slices = useMemo(() => {
    let cumAngle = 0;
    return rechargeData.map((item, i) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const startAngle = cumAngle;
      const endAngle = cumAngle + angle;
      cumAngle = endAngle;

      const x1 = CX + R * Math.cos(startAngle - Math.PI / 2);
      const y1 = CY + R * Math.sin(startAngle - Math.PI / 2);
      const x2 = CX + R * Math.cos(endAngle - Math.PI / 2);
      const y2 = CY + R * Math.sin(endAngle - Math.PI / 2);
      const largeArc = angle > Math.PI ? 1 : 0;

      const colors = ['#3b82f6', '#06b6d4', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];
      const color = colors[i] ?? '#64748b';

      // 标签位置
      const midAngle = (startAngle + endAngle) / 2;
      const labelR = R * 0.65;
      const labelX = CX + labelR * Math.cos(midAngle - Math.PI / 2);
      const labelY = CY + labelR * Math.sin(midAngle - Math.PI / 2);

      return {
        ...item,
        path: `M ${CX} ${CY} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`,
        color,
        labelX,
        labelY,
        percent: (item.value / total) * 100,
        index: i,
      };
    });
  }, [total]);

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <Gauge size={14} className="text-cyan-400" />
        平原区补给构成（1991-2000均值）
      </h3>
      <div className="flex items-center gap-4">
        <svg width={260} height={280} className="flex-shrink-0">
          {/* 饼图 */}
          {slices.map((slice) => {
            const isHover = hovered === slice.index;
            return (
              <g key={slice.index}
                onMouseEnter={() => setHovered(slice.index)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                <path
                  d={slice.path}
                  fill={slice.color}
                  fillOpacity={isHover ? 0.9 : 0.65}
                  stroke="#0f1720"
                  strokeWidth="1"
                />
                {slice.percent > 5 && (
                  <text x={slice.labelX} y={slice.labelY} fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">
                    {slice.percent.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* 中心标注 */}
          <circle cx={CX} cy={CY} r="35" fill="#0f1720" stroke="#1e293b" strokeWidth="1" />
          <text x={CX} y={CY - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">总补给量</text>
          <text x={CX} y={CY + 6} fontSize="14" fill="#06b6d4" textAnchor="middle" fontWeight="bold">{total.toFixed(1)}</text>
          <text x={CX} y={CY + 20} fontSize="8" fill="#64748b" textAnchor="middle">亿m³/a</text>

          {/* Hover详情 */}
          {hovered !== null && (
            <g>
              {(() => {
                const s = slices[hovered];
                return (
                  <g>
                    <rect x={150} y={20} width="105" height="45" fill="#1e293b" stroke={s.color} strokeWidth="0.5" rx="4" opacity="0.95" />
                    <text x={158} y={35} fontSize="9" fill={s.color} fontWeight="bold">{s.item}</text>
                    <text x={158} y={48} fontSize="8" fill="#94a3b8">值: {s.value.toFixed(2)} 亿m³</text>
                    <text x={158} y={60} fontSize="8" fill="#94a3b8">占比: {s.percent.toFixed(1)}%</text>
                  </g>
                );
              })()}
            </g>
          )}
        </svg>

        {/* 图例列表 */}
        <div className="flex-1 space-y-1">
          {slices.map((s) => (
            <div
              key={s.index}
              onMouseEnter={() => setHovered(s.index)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-all ${
                hovered === s.index ? 'bg-gw-surface/60' : ''
              }`}
            >
              <div className="w-3 h-3 rounded-sm" style={{ background: s.color, opacity: 0.65 }} />
              <span className="text-[10px] text-gw-text flex-1">{s.item}</span>
              <span className="text-[9px] text-gw-muted font-mono">{s.value.toFixed(1)}</span>
              <span className="text-[9px] text-gw-muted/60">{s.percent.toFixed(1)}%</span>
            </div>
          ))}
          <div className="pt-1 mt-1 border-t border-gw-border/20 text-[9px] text-gw-muted space-y-0.5">
            <div className="flex items-center gap-1"><Droplets size={9} className="text-cyan-400" /> {hydrogeologicalParams.rainfallInfiltration}</div>
            <div className="flex items-center gap-1"><CloudRain size={9} className="text-blue-400" /> 降水入渗占总补给{rechargeData[0]?.percent.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 主组件 ──

export function VadoseZoneViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <CloudRain size={14} className="text-cyan-400" />
        <span>包气带水分运移可视化 — 入渗系数/岩性参数/补给构成多维度分析</span>
      </div>

      {/* 上排：包气带剖面 + 入渗系数对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VadoseProfileDiagram />
        <InfiltrationCoeffChart />
      </div>

      {/* 中排：入渗-埋深曲线 + 山区排行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfiltrationDepthCurve />
        <MountainInfiltrationRanking />
      </div>

      {/* 下排：补给构成饼图 */}
      <RechargeComposition />
    </div>
  );
}
