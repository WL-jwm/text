/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 */

import { useState, useMemo } from 'react';
import { Hourglass, Atom, Waves, Filter, Info, Clock, Mountain } from 'lucide-react';
import { TechCard } from '../UI';
import {
  isotopeSamples,
  carbon14AgeDepth,
  delta18OPathway,
  gmwl,
  lmwl,
} from '../../data/hydrochemistry';

// ── 类型 ──

type SampleType = 'all' | 'shallow' | 'mid' | 'deep' | 'karst';

interface SampleTypeMeta {
  key: SampleType;
  label: string;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}

const SAMPLE_TYPES: SampleTypeMeta[] = [
  { key: 'shallow', label: '潜水(浅层)', color: '#22c55e', shape: 'circle' },
  { key: 'mid', label: '中层承压', color: '#3b82f6', shape: 'square' },
  { key: 'deep', label: '深层承压', color: '#f59e0b', shape: 'triangle' },
  { key: 'karst', label: '岩溶水', color: '#8b5cf6', shape: 'diamond' },
];

// ── SVG参数 ──

// 14C年龄-深度图
const AD_W = 420, AD_H = 360;
const AD_M = { left: 70, right: 30, top: 30, bottom: 50 };
const AD_PW = AD_W - AD_M.left - AD_M.right;
const AD_PH = AD_H - AD_M.top - AD_M.bottom;
const AD_MAX_DEPTH = 500;
const AD_MAX_AGE = 35000; // 对数刻度上限

// δD-δ18O散点图
const ISO_W = 440, ISO_H = 380;
const ISO_M = { left: 55, right: 30, top: 30, bottom: 50 };
const ISO_PW = ISO_W - ISO_M.left - ISO_M.right;
const ISO_PH = ISO_H - ISO_M.top - ISO_M.bottom;
const D18O_MIN = -12, D18O_MAX = -2;
const DD_MIN = -85, DD_MAX = -25;

// 氚衰减曲线
const TR_W = 440, TR_H = 300;
const TR_M = { left: 55, right: 30, top: 30, bottom: 50 };
const TR_PW = TR_W - TR_M.left - TR_M.right;
const TR_PH = TR_H - TR_M.top - TR_M.bottom;
const TR_MAX_DIST = 200;
const TR_MAX_TRITIUM = 25;

// ── 坐标转换函数 ──

function depthToY(depth: number): number {
  return AD_M.top + (depth / AD_MAX_DEPTH) * AD_PH;
}

function ageToX(age: number): number {
  // 对数刻度
  const logAge = age <= 1 ? 0 : Math.log10(age);
  const logMax = Math.log10(AD_MAX_AGE);
  return AD_M.left + (logAge / logMax) * AD_PW;
}

function d18OToX(v: number): number {
  return ISO_M.left + ((v - D18O_MIN) / (D18O_MAX - D18O_MIN)) * ISO_PW;
}

function dDToY(v: number): number {
  return ISO_M.top + ((DD_MAX - v) / (DD_MAX - DD_MIN)) * ISO_PH;
}

function distToX_T(dist: number): number {
  return TR_M.left + (dist / TR_MAX_DIST) * TR_PW;
}

function tritiumToY(t: number): number {
  return TR_M.top + (1 - t / TR_MAX_TRITIUM) * TR_PH;
}

// ── 样式符号 ──

function sampleShape(shape: SampleTypeMeta['shape'], cx: number, cy: number, color: string, r = 5): React.ReactNode {
  switch (shape) {
    case 'square':
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
    case 'triangle':
      return <polygon points={`${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
    case 'diamond':
      return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
    default:
      return <circle cx={cx} cy={cy} r={r} fill={color} stroke="#fff" strokeWidth="1" opacity="0.85" />;
  }
}

// ── 子组件：14C年龄-深度剖面 ──

function AgeDepthProfile() {
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

// ── 子组件：δD-δ18O同位素散点图 ──

function IsotopeScatterPlot() {
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

// ── 子组件：氚含量沿径流路径衰减 ──

function TritiumDecayChart() {
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

// ── 子组件：年龄分级统计面板 ──

function AgeClassificationPanel() {
  const stats = useMemo(() => {
    const groups = [
      { label: '现代水', range: '< 50年', color: '#22c55e', samples: isotopeSamples.filter(s => s.tritium > 10), desc: '含大量核试验后氚，活跃补给' },
      { label: '次现代水', range: '50~500年', color: '#3b82f6', samples: isotopeSamples.filter(s => s.tritium > 3 && s.tritium <= 10), desc: '少量氚检出，混合补给' },
      { label: '古水(全新世)', range: '500~10000年', color: '#f59e0b', samples: isotopeSamples.filter(s => s.tritium > 0.5 && s.tritium <= 3), desc: '氚接近检出限，缓慢循环' },
      { label: '古水(晚更新世)', range: '> 10000年', color: '#ef4444', samples: isotopeSamples.filter(s => s.tritium <= 0.5), desc: '无氚，末次冰期入渗' },
    ];
    return groups.map(g => ({
      ...g,
      count: g.samples.length,
      pct: (g.samples.length / isotopeSamples.length) * 100,
      locations: g.samples.map(s => s.location).slice(0, 4),
    }));
  }, []);

  const totalAgeRange = useMemo(() => {
    const deepSamples = isotopeSamples.filter(s => s.type === 'deep');
    const maxAge = Math.max(...deepSamples.map(s => {
      const m = s.age.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }));
    return maxAge;
  }, []);

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-3">
        <Hourglass size={14} className="text-cyan-400" />
        地下水年龄分级
      </h3>
      <div className="space-y-2">
        {stats.map((s, i) => (
          <div key={i} className="p-2 rounded-lg border border-gw-border/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: s.color, opacity: 0.6 }} />
                <span className="text-[11px] text-gw-text font-medium">{s.label}</span>
                <span className="text-[9px] text-gw-muted">{s.range}</span>
              </div>
              <span className="text-[10px] text-gw-text font-mono">{s.count}个 ({s.pct.toFixed(0)}%)</span>
            </div>
            <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[9px] text-gw-muted">{s.desc}</span>
              <span className="text-[8px] text-gw-muted/60">{s.locations.join('、')}{s.count > 4 ? '...' : ''}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 rounded-lg bg-gw-surface/60 border border-gw-border/20">
        <div className="text-[10px] text-gw-text font-medium mb-1 flex items-center gap-1">
          <Mountain size={10} className="text-cyan-400" />
          测年方法适用范围
        </div>
        <div className="grid grid-cols-3 gap-2 text-[9px]">
          <div className="text-center p-1.5 rounded bg-gw-card/60">
            <div className="text-green-400 font-bold">³H</div>
            <div className="text-gw-muted">氚法</div>
            <div className="text-gw-muted/50">1950s以来</div>
          </div>
          <div className="text-center p-1.5 rounded bg-gw-card/60">
            <div className="text-blue-400 font-bold">³H/³He</div>
            <div className="text-gw-muted">氚-氦法</div>
            <div className="text-gw-muted/50">~50年</div>
          </div>
          <div className="text-center p-1.5 rounded bg-gw-card/60">
            <div className="text-amber-400 font-bold">¹⁴C</div>
            <div className="text-gw-muted">碳-14法</div>
            <div className="text-gw-muted/50">500~50k年</div>
          </div>
        </div>
        <div className="mt-2 text-center text-[9px] text-gw-muted">
          河北平原深层承压水最大14C表观年龄: <span className="text-amber-400 font-bold">~{totalAgeRange}年</span>
        </div>
      </div>
    </TechCard>
  );
}

// ── 主组件 ──

export function GroundwaterAgeViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <Hourglass size={14} className="text-cyan-400" />
        <span>地下水年龄与同位素测年可视化 — 基于³H/¹⁴C/δD-δ18O多示踪剂数据</span>
      </div>

      {/* 上排：年龄-深度剖面 + 同位素散点图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AgeDepthProfile />
        <IsotopeScatterPlot />
      </div>

      {/* 下排：氚衰减曲线 + 年龄分级统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TritiumDecayChart />
        <AgeClassificationPanel />
      </div>
    </div>
  );
}
