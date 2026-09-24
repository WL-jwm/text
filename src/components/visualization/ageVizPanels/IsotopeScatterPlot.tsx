/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 * 面板组件：IsotopeScatterPlot（拆分自 GroundwaterAgeViz.tsx）
 */

import { useState, useMemo } from 'react';
import { Atom, Filter } from 'lucide-react';
import { TechCard } from '../../UI';
import { isotopeSamples, gmwl, lmwl } from '../../../data/hydrochemistry';
import { SampleType, SAMPLE_TYPES, ISO_W, ISO_H, ISO_M, ISO_PW, ISO_PH, D18O_MIN, D18O_MAX } from './ageVizConstants';
import { d18OToX, dDToY, sampleShape } from './ageVizUtils';

// ── 子组件：δD-δ18O同位素散点图 ──
export function IsotopeScatterPlot() {
  const [typeFilter, setTypeFilter] = useState<SampleType>('all');
  const [hovered, setHovered] = useState<number | null>(null);

  const filteredSamples = useMemo(() => {
    return isotopeSamples
      .filter(s => typeFilter === 'all' || s.type === typeFilter)
      .map((s, i) => ({ ...s, originalIndex: i }));
  }, [typeFilter]);

  // 大气降水线
  const gmwlPath = (() => {
    const x1 = D18O_MIN, y1 = gmwl.slope * x1 + gmwl.intercept;
    const x2 = D18O_MAX, y2 = gmwl.slope * x2 + gmwl.intercept;
    return `M ${d18OToX(x1)} ${dDToY(y1)} L ${d18OToX(x2)} ${dDToY(y2)}`;
  })();

  const lmwlPath = (() => {
    const x1 = D18O_MIN, y1 = lmwl.slope * x1 + lmwl.intercept;
    const x2 = D18O_MAX, y2 = lmwl.slope * x2 + lmwl.intercept;
    return `M ${d18OToX(x1)} ${dDToY(y1)} L ${d18OToX(x2)} ${dDToY(y2)}`;
  })();

  // 蒸发线（从山前样品群到滨海样品群的大致趋势）
  const evapPath = (() => {
    const x1 = -10, y1 = -72;
    const x2 = -4.5, y2 = -33;
    return `M ${d18OToX(x1)} ${dDToY(y1)} L ${d18OToX(x2)} ${dDToY(y2)}`;
  })();

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Atom size={14} className="text-cyan-400" />
          δD - δ18O 同位素散点图
        </h3>
        <div className="flex items-center gap-1">
          <Filter size={10} className="text-gw-muted" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as SampleType)}
            className="px-2 py-0.5 rounded bg-gw-surface border border-gw-border/30 text-gw-text text-[10px]"
          >
            <option value="all">全部水样</option>
            {SAMPLE_TYPES.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={ISO_W} height={ISO_H} className="max-w-none">
          {/* 网格 */}
          {[-10, -8, -6, -4].map(v => (
            <g key={v}>
              <line x1={d18OToX(v)} y1={ISO_M.top} x2={d18OToX(v)} y2={ISO_M.top + ISO_PH} stroke="#1e293b" strokeWidth="0.3" />
              <text x={d18OToX(v)} y={ISO_H - ISO_M.bottom + 14} fontSize="8" fill="#64748b" textAnchor="middle">{v}‰</text>
            </g>
          ))}
          {[-80, -70, -60, -50, -40, -30].map(v => (
            <g key={v}>
              <line x1={ISO_M.left} y1={dDToY(v)} x2={ISO_M.left + ISO_PW} y2={dDToY(v)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={ISO_M.left - 5} y={dDToY(v) + 3} fontSize="8" fill="#64748b" textAnchor="end">{v}‰</text>
            </g>
          ))}

          {/* 大气降水线 */}
          <path d={gmwlPath} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 2" />
          <text x={d18OToX(-4.5)} y={dDToY(gmwl.slope * -4.5 + gmwl.intercept) - 4} fontSize="8" fill="#64748b" textAnchor="start">GMWL</text>

          {/* 河北地区降水线 */}
          <path d={lmwlPath} fill="none" stroke="#06b6d4" strokeWidth="1.5" />
          <text x={d18OToX(-5.5)} y={dDToY(lmwl.slope * -5.5 + lmwl.intercept) - 4} fontSize="8" fill="#06b6d4" textAnchor="start">LMWL</text>

          {/* 蒸发线 */}
          <path d={evapPath} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <text x={d18OToX(-6)} y={dDToY(-50) + 12} fontSize="7" fill="#f59e0b" textAnchor="middle" opacity="0.7">蒸发趋势线</text>

          {/* 轴 */}
          <line x1={ISO_M.left} y1={ISO_M.top} x2={ISO_M.left} y2={ISO_M.top + ISO_PH} stroke="#334155" strokeWidth="1" />
          <line x1={ISO_M.left} y1={ISO_M.top + ISO_PH} x2={ISO_M.left + ISO_PW} y2={ISO_M.top + ISO_PH} stroke="#334155" strokeWidth="1" />

          {/* 轴标签 */}
          <text x={ISO_M.left + ISO_PW / 2} y={ISO_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">δ¹⁸O (‰, VSMOW)</text>
          <text x={15} y={ISO_M.top + ISO_PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 15 ${ISO_M.top + ISO_PH / 2})`}>δD (‰, VSMOW)</text>

          {/* 数据点 */}
          {filteredSamples.map((s) => {
            const typeMeta = SAMPLE_TYPES.find(t => t.key === s.type);
            if (!typeMeta) return null;
            const cx = d18OToX(s.delta18O);
            const cy = dDToY(s.deltaD);
            const isHover = hovered === s.originalIndex;
            return (
              <g key={s.id}
                onMouseEnter={() => setHovered(s.originalIndex)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                {sampleShape(typeMeta.shape, cx, cy, typeMeta.color, isHover ? 7 : 5)}
                {isHover && (
                  <g>
                    <rect x={cx + 12} y={cy - 50} width="155" height="72" fill="#1e293b" stroke={typeMeta.color} strokeWidth="0.5" rx="4" opacity="0.95" />
                    <text x={cx + 20} y={cy - 36} fontSize="9" fill={typeMeta.color} fontWeight="bold">{s.id} · {s.location}</text>
                    <text x={cx + 20} y={cy - 24} fontSize="8" fill="#94a3b8">深度: {s.depth}m | 类型: {typeMeta.label}</text>
                    <text x={cx + 20} y={cy - 12} fontSize="8" fill="#94a3b8">δ¹⁸O: {s.delta18O}‰ | δD: {s.deltaD}‰</text>
                    <text x={cx + 20} y={cy} fontSize="8" fill="#94a3b8">氚: {s.tritium} TU | 年龄: {s.age}</text>
                    <text x={cx + 20} y={cy + 12} fontSize="7" fill="#64748b">补给: {s.recharge}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 图例 */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {SAMPLE_TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(typeFilter === t.key ? 'all' : t.key)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-all ${
              typeFilter === t.key ? 'border-gw-blue/40 bg-gw-blue/10' : 'border-gw-border/20'
            }`}
          >
            <svg width="12" height="12">
              {sampleShape(t.shape, 6, 6, t.color, 4)}
            </svg>
            <span className="text-[9px] text-gw-muted">{t.label}</span>
          </button>
        ))}
      </div>
    </TechCard>
  );
}
