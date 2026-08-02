/**
 * MultiLayerCouplingViz — E-03 多层含水层耦合可视化模块
 *
 * 融合4组含水层数据/分层开采量/越流补给/水位恢复时序，提供多层耦合分析：
 *   1. 多层含水层系统立体剖面（4层结构 + 越流箭头 + 开采井 + 补给方向）
 *   2. 深层-浅层开采量时序对比（2014-2024双区域图 + 压采率）
 *   3. 层间越流补给关系图（桑基流图：补给源→各层→排泄）
 *   4. 城市分层开采对比（2000 vs 2024 浅层/深层/咸水三栏对比）
 *   5. 深层水位恢复响应（各市回升幅度 + 漏斗消散进程）
 */

import { useState, useMemo } from 'react';
import { Layers3, ArrowDownUp, GitBranch, BarChart3, TrendingUp, Droplets, Info } from 'lucide-react';
import { TechCard } from '../UI';
import {
  exploitationTimeSeries,
  groundwaterExploitation2024,
  overExploitControl2024,
} from '../../data/exploitation';
import { cityGroundwaterExtraction2000 } from '../../data/groundwaterResources';
import { hydrogeologicalParams } from '../../data/groundwaterResources';

// ── 类型 ──

interface AquiferLayer {
  group: string;
  depthRange: string;
  topDepth: number;
  bottomDepth: number;
  age: string;
  lithology: string;
  K: string;
  Kavg: number; // 渗透系数均值 m/d
  yield: string;
  yieldAvg: number; // 单井涌水量均值 m³/d
  waterType: string;
  quality: string;
  rechargeSource: string;
  color: string;
  leakRate: number; // 越流补给比例 %
}

// ── 含水层耦合参数 ──

const AQUIFER_LAYERS: AquiferLayer[] = [
  { group: '第I含水组', depthRange: '0~50m', topDepth: 0, bottomDepth: 50, age: '全新统(Q₄)', lithology: '砂砾石/中细砂', K: '10~50 m/d', Kavg: 30, yield: '50~150', yieldAvg: 100, waterType: '潜水-微承压', quality: 'HCO₃-Ca·Mg', rechargeSource: '大气降水/地表水入渗/灌溉回渗', color: '#22c55e', leakRate: 0 },
  { group: '第II含水组', depthRange: '50~150m', topDepth: 50, bottomDepth: 150, age: '上更新统(Q₃)', lithology: '中细砂/粉细砂', K: '5~20 m/d', Kavg: 12.5, yield: '20~50', yieldAvg: 35, waterType: '承压水', quality: 'HCO₃-Ca·Na', rechargeSource: '越流补给/侧向径流', color: '#3b82f6', leakRate: 35 },
  { group: '第III含水组', depthRange: '150~350m', topDepth: 150, bottomDepth: 350, age: '中更新统(Q₂)', lithology: '细砂/粉砂', K: '2~8 m/d', Kavg: 5, yield: '10~30', yieldAvg: 20, waterType: '承压水', quality: 'HCO₃·SO₄-Na·Ca', rechargeSource: '侧向径流/越流(弱)', color: '#8b5cf6', leakRate: 15 },
  { group: '第IV含水组', depthRange: '350~550m', topDepth: 350, bottomDepth: 550, age: '下更新统(Q₁)', lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', Kavg: 1.75, yield: '5~15', yieldAvg: 10, waterType: '深层承压水', quality: 'HCO₃-Na(高氟)', rechargeSource: '侧向径流(极弱)', color: '#f59e0b', leakRate: 5 },
];

// ── 子组件1：多层含水层系统立体剖面 ──

function AquiferSystemDiagram() {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [hoveredFlow, setHoveredFlow] = useState<string | null>(null);

  const SVG_W = 520;
  const SVG_H = 420;
  const M = { left: 80, right: 80, top: 40, bottom: 50 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_DEPTH = 600;

  function depthToY(d: number): number {
    return M.top + (d / MAX_DEPTH) * PH;
  }

  // 越流箭头位置（层间界面）
  const leakFlows = [
    { id: 'leak-1-2', x1: M.left + PW * 0.3, y1: depthToY(50), y2: depthToY(50), label: '越流 35%', color: '#3b82f6', desc: 'I→II 主要越流通道' },
    { id: 'leak-2-3', x1: M.left + PW * 0.5, y1: depthToY(150), y2: depthToY(150), label: '越流 15%', color: '#8b5cf6', desc: 'II→III 弱越流' },
    { id: 'leak-3-4', x1: M.left + PW * 0.7, y1: depthToY(350), y2: depthToY(350), label: '越流 5%', color: '#f59e0b', desc: 'III→IV 极弱越流' },
  ];

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Layers3 size={14} className="text-cyan-400" />
          多层含水层系统耦合剖面
        </h3>
        <span className="text-[9px] text-gw-muted">河北平原第四系含水系统</span>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          <defs>
            {AQUIFER_LAYERS.map((l, i) => (
              <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={l.color} stopOpacity="0.15" />
                <stop offset="50%" stopColor={l.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={l.color} stopOpacity="0.1" />
              </linearGradient>
            ))}
            <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" />
            </marker>
            <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
            </marker>
            <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#06b6d4" />
            </marker>
          </defs>

          {/* 含水层区域 */}
          {AQUIFER_LAYERS.map((layer, i) => {
            const y1 = depthToY(layer.topDepth);
            const y2 = depthToY(layer.bottomDepth);
            const isSelected = selectedLayer === i;
            const isDimmed = selectedLayer !== null && selectedLayer !== i;
            return (
              <g key={i}
                opacity={isDimmed ? 0.2 : 1}
                onClick={() => setSelectedLayer(selectedLayer === i ? null : i)}
                className="cursor-pointer"
              >
                <rect x={M.left} y={y1} width={PW} height={y2 - y1} fill={`url(#grad-${i})`} stroke={layer.color} strokeWidth={isSelected ? 2 : 0.5} strokeOpacity="0.4" />
                {/* 岩性点阵 */}
                {Array.from({ length: 12 }).map((_, j) => (
                  <circle key={j} cx={M.left + 20 + j * 35} cy={(y1 + y2) / 2} r="1" fill={layer.color} opacity="0.3" />
                ))}
                {/* 层标签 */}
                <text x={M.left - 5} y={(y1 + y2) / 2 - 4} fontSize="9" fill={layer.color} textAnchor="end" fontWeight="bold">{layer.group}</text>
                <text x={M.left - 5} y={(y1 + y2) / 2 + 8} fontSize="7" fill="#64748b" textAnchor="end">{layer.depthRange}</text>
                {/* 右侧参数 */}
                <text x={M.left + PW + 5} y={(y1 + y2) / 2 - 6} fontSize="8" fill={layer.color} textAnchor="start" fontWeight="bold">K={layer.K}</text>
                <text x={M.left + PW + 5} y={(y1 + y2) / 2 + 5} fontSize="7" fill="#64748b" textAnchor="start">涌水{layer.yield}m³/d</text>
                <text x={M.left + PW + 5} y={(y1 + y2) / 2 + 15} fontSize="7" fill="#64748b" textAnchor="start">{layer.waterType}</text>
              </g>
            );
          })}

          {/* 越流箭头 */}
          {leakFlows.map(flow => (
            <g key={flow.id}
              onMouseEnter={() => setHoveredFlow(flow.id)}
              onMouseLeave={() => setHoveredFlow(null)}
              className="cursor-pointer"
            >
              <line x1={flow.x1} y1={flow.y1 - 18} x2={flow.x1} y2={flow.y2 + 18} stroke={flow.color} strokeWidth="2" markerEnd="url(#arrow-blue)" opacity={hoveredFlow === flow.id ? 1 : 0.6} />
              <text x={flow.x1 + 5} y={flow.y1 + 2} fontSize="7" fill={flow.color} opacity={hoveredFlow === flow.id ? 1 : 0.7}>{flow.label}</text>
              {hoveredFlow === flow.id && (
                <g>
                  <rect x={flow.x1 + 15} y={flow.y1 - 10} width="140" height="32" fill="#1e293b" stroke={flow.color} strokeWidth="0.5" rx="4" opacity="0.95" />
                  <text x={flow.x1 + 23} y={flow.y1 + 2} fontSize="8" fill={flow.color}>{flow.desc}</text>
                  <text x={flow.x1 + 23} y={flow.y1 + 14} fontSize="7" fill="#94a3b8">越流系数: {flow.id.includes('1-2') ? '~10⁻⁴' : flow.id.includes('2-3') ? '~10⁻⁵' : '~10⁻⁶'}</text>
                </g>
              )}
            </g>
          ))}

          {/* 降水补给箭头 */}
          <g opacity="0.5">
            {[0, 80, 160, 240, 320].map((x, i) => (
              <g key={i}>
                <line x1={M.left + x + 15} y1={M.top - 12} x2={M.left + x + 13} y2={M.top - 2} stroke="#22c55e" strokeWidth="1" markerEnd="url(#arrow-green)" />
              </g>
            ))}
            <text x={M.left + PW / 2} y={M.top - 16} fontSize="8" fill="#22c55e" textAnchor="middle">降水入渗补给</text>
          </g>

          {/* 侧向径流箭头 */}
          <g opacity="0.4">
            <path d={`M ${M.left} ${depthToY(100)} L ${M.left + 30} ${depthToY(100)}`} fill="none" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arrow-cyan)" />
            <text x={M.left - 3} y={depthToY(100) - 5} fontSize="7" fill="#06b6d4" textAnchor="end">侧向径流→</text>
          </g>

          {/* 开采井 */}
          {[
            { x: M.left + PW * 0.2, top: depthToY(0), bottom: depthToY(120), label: '浅层井', color: '#22c55e' },
            { x: M.left + PW * 0.55, top: depthToY(0), bottom: depthToY(200), label: '混合井', color: '#3b82f6' },
            { x: M.left + PW * 0.8, top: depthToY(0), bottom: depthToY(420), label: '深层井', color: '#f59e0b' },
          ].map((well, i) => (
            <g key={i}>
              <line x1={well.x} y1={well.top - 5} x2={well.x} y2={well.bottom} stroke={well.color} strokeWidth="2" strokeDasharray="2 1" />
              <rect x={well.x - 4} y={well.top - 8} width="8" height="4" fill={well.color} />
              <circle cx={well.x} cy={well.bottom} r="2" fill={well.color} />
              <text x={well.x} y={well.top - 12} fontSize="7" fill={well.color} textAnchor="middle">{well.label}</text>
            </g>
          ))}

          {/* 深度刻度 */}
          {[0, 50, 150, 350, 550].map(d => (
            <g key={d}>
              <line x1={M.left - 2} y1={depthToY(d)} x2={M.left} y2={depthToY(d)} stroke="#334155" strokeWidth="0.5" />
            </g>
          ))}

          {/* 隔水层标注 */}
          <line x1={M.left} y1={depthToY(50)} x2={M.left + PW} y2={depthToY(50)} stroke="#475569" strokeWidth="0.5" strokeDasharray="4 3" />
          <line x1={M.left} y1={depthToY(150)} x2={M.left + PW} y2={depthToY(150)} stroke="#475569" strokeWidth="0.5" strokeDasharray="4 3" />
          <line x1={M.left} y1={depthToY(350)} x2={M.left + PW} y2={depthToY(350)} stroke="#475569" strokeWidth="0.5" strokeDasharray="4 3" />

          {/* 基岩 */}
          <rect x={M.left} y={depthToY(550)} width={PW} height={depthToY(600) - depthToY(550)} fill="#2a1f15" fillOpacity="0.3" />
          <text x={M.left + PW / 2} y={depthToY(575)} fontSize="9" fill="#64748b" textAnchor="middle">基岩（前第四系）</text>
        </svg>
      </div>

      {/* 选中层详情 */}
      {selectedLayer !== null && (
        <div className="mt-2 p-2.5 rounded-lg bg-gw-surface/60 border border-gw-border/30 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gw-text font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ background: AQUIFER_LAYERS[selectedLayer].color, opacity: 0.5 }} />
              {AQUIFER_LAYERS[selectedLayer].group} ({AQUIFER_LAYERS[selectedLayer].age})
            </span>
            <span className="text-gw-muted">{AQUIFER_LAYERS[selectedLayer].lithology}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div><span className="text-gw-muted">渗透系数:</span> <span className="text-gw-text">{AQUIFER_LAYERS[selectedLayer].K}</span></div>
            <div><span className="text-gw-muted">单井涌水:</span> <span className="text-gw-text">{AQUIFER_LAYERS[selectedLayer].yield} m³/d</span></div>
            <div><span className="text-gw-muted">水质类型:</span> <span className="text-gw-text">{AQUIFER_LAYERS[selectedLayer].quality}</span></div>
            <div><span className="text-gw-muted">越流比例:</span> <span className="text-gw-text">{AQUIFER_LAYERS[selectedLayer].leakRate}%</span></div>
          </div>
          <div className="text-[10px] text-gw-muted">
            <Info size={9} className="inline mr-1" />
            补给来源: {AQUIFER_LAYERS[selectedLayer].rechargeSource}
          </div>
        </div>
      )}
    </TechCard>
  );
}

// ── 子组件2：深层-浅层开采量时序对比 ──

function ShallowDeepExtractionTimeline() {
  const [hovered, setHovered] = useState<number | null>(null);

  const SVG_W = 520;
  const SVG_H = 300;
  const M = { left: 50, right: 50, top: 30, bottom: 45 };
  const PW = SVG_W - M.left - M.right;
  const PH = SVG_H - M.top - M.bottom;
  const MAX_VAL = 120; // 亿m³

  const years = exploitationTimeSeries;
  function xToX(i: number): number {
    return M.left + (i / (years.length - 1)) * PW;
  }
  function valToY(v: number): number {
    return M.top + PH - (v / MAX_VAL) * PH;
  }

  // 浅层区域路径
  const shallowArea = years.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xToX(i)} ${valToY(d.shallow)}`).join(' ');
  const shallowFill = `${shallowArea} L ${xToX(years.length - 1)} ${M.top + PH} L ${xToX(0)} ${M.top + PH} Z`;

  // 深层区域路径
  const deepArea = years.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xToX(i)} ${valToY(d.deep)}`).join(' ');
  const deepFill = `${deepArea} L ${xToX(years.length - 1)} ${M.top + PH} L ${xToX(0)} ${M.top + PH} Z`;

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <BarChart3 size={14} className="text-cyan-400" />
        深层-浅层开采量时序对比（2014-2024）
      </h3>
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 网格 */}
          {[0, 20, 40, 60, 80, 100, 120].map(v => (
            <g key={v}>
              <line x1={M.left} y1={valToY(v)} x2={M.left + PW} y2={valToY(v)} stroke="#1e293b" strokeWidth="0.3" />
              <text x={M.left - 5} y={valToY(v) + 3} fontSize="8" fill="#64748b" textAnchor="end">{v}</text>
            </g>
          ))}

          {/* 浅层区域 */}
          <path d={shallowFill} fill="#22c55e" fillOpacity="0.12" />
          <path d={shallowArea} fill="none" stroke="#22c55e" strokeWidth="2" />

          {/* 深层区域 */}
          <path d={deepFill} fill="#f59e0b" fillOpacity="0.12" />
          <path d={deepArea} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />

          {/* 数据点 + hover */}
          {years.map((d, i) => (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* 悬停竖线 */}
              {hovered === i && (
                <line x1={xToX(i)} y1={M.top} x2={xToX(i)} y2={M.top + PH} stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 2" />
              )}
              <circle cx={xToX(i)} cy={valToY(d.shallow)} r={hovered === i ? 4 : 3} fill="#22c55e" stroke="#fff" strokeWidth="0.5" />
              <circle cx={xToX(i)} cy={valToY(d.deep)} r={hovered === i ? 4 : 3} fill="#f59e0b" stroke="#fff" strokeWidth="0.5" />
              <text x={xToX(i)} y={M.top + PH + 14} fontSize="8" fill={hovered === i ? '#06b6d4' : '#64748b'} textAnchor="middle">{d.year}</text>

              {/* Hover详情 */}
              {hovered === i && (
                <g>
                  <rect x={xToX(i) + 8} y={M.top + 5} width="135" height="62" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                  <text x={xToX(i) + 16} y={M.top + 20} fontSize="9" fill="#06b6d4" fontWeight="bold">{d.year}年</text>
                  <text x={xToX(i) + 16} y={M.top + 33} fontSize="8" fill="#22c55e">浅层: {d.shallow} 亿m³</text>
                  <text x={xToX(i) + 16} y={M.top + 45} fontSize="8" fill="#f59e0b">深层: {d.deep} 亿m³</text>
                  <text x={xToX(i) + 16} y={M.top + 57} fontSize="8" fill="#94a3b8">合计: {d.total} 亿m³</text>
                  <text x={xToX(i) + 16} y={M.top + 69} fontSize="7" fill="#64748b">{d.note}</text>
                </g>
              )}
            </g>
          ))}

          {/* 轴 */}
          <line x1={M.left} y1={M.top + PH} x2={M.left + PW} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + PH} stroke="#334155" strokeWidth="1" />
          <text x={M.left + PW / 2} y={SVG_H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">年份</text>
          <text x={12} y={M.top + PH / 2} fontSize="9" fill="#94a3b8" textAnchor="middle" transform={`rotate(-90 12 ${M.top + PH / 2})`}>开采量 (亿m³)</text>
        </svg>
      </div>

      {/* 压采率 */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">浅层压采</div>
          <div className="text-green-400 font-bold">
            {(((years[0].shallow - years[years.length - 1].shallow) / years[0].shallow) * 100).toFixed(1)}%
          </div>
          <div className="text-gw-muted/50">{years[0].shallow}→{years[years.length - 1].shallow}亿m³</div>
        </div>
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">深层压采</div>
          <div className="text-amber-400 font-bold">
            {(((years[0].deep - years[years.length - 1].deep) / years[0].deep) * 100).toFixed(1)}%
          </div>
          <div className="text-gw-muted/50">{years[0].deep}→{years[years.length - 1].deep}亿m³</div>
        </div>
        <div className="p-1.5 rounded bg-gw-surface/60 border border-gw-border/20 text-center">
          <div className="text-gw-muted">总压采</div>
          <div className="text-cyan-400 font-bold">
            {(((years[0].total - years[years.length - 1].total) / years[0].total) * 100).toFixed(1)}%
          </div>
          <div className="text-gw-muted/50">{years[0].total}→{years[years.length - 1].total}亿m³</div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 子组件3：层间越流补给关系桑基流图 ──

function LeakageFlowDiagram() {
  // 补给源 → 含水层 → 排泄的流量关系
  const flows = useMemo(() => {
    return [
      { source: '降水入渗', target: '第I含水组', value: 65.4, color: '#22c55e' },
      { source: '地表水入渗', target: '第I含水组', value: 12.8, color: '#06b6d4' },
      { source: '灌溉回渗', target: '第I含水组', value: 8.5, color: '#3b82f6' },
      { source: '第I含水组', target: '第II含水组', value: 18.2, color: '#22c55e' },
      { source: '侧向径流', target: '第II含水组', value: 8.6, color: '#8b5cf6' },
      { source: '第II含水组', target: '第III含水组', value: 6.5, color: '#3b82f6' },
      { source: '侧向径流(深)', target: '第III含水组', value: 3.2, color: '#8b5cf6' },
      { source: '第III含水组', target: '第IV含水组', value: 1.8, color: '#8b5cf6' },
      { source: '侧向径流(极深)', target: '第IV含水组', value: 0.8, color: '#f59e0b' },
    ];
  }, []);

  const SVG_W = 520;
  const SVG_H = 340;
  const M = { left: 100, right: 100, top: 25, bottom: 40 };
  const PW = SVG_W - M.left - M.right;
  // 节点位置（3列：补给源 | 含水层 | 排泄/越流）
  const colX = [M.left, M.left + PW * 0.4, M.left + PW * 0.7, M.left + PW];
  const nodes = [
    // 补给源
    { id: '降水入渗', col: 0, y: M.top + 20, color: '#22c55e', value: 65.4 },
    { id: '地表水入渗', col: 0, y: M.top + 80, color: '#06b6d4', value: 12.8 },
    { id: '灌溉回渗', col: 0, y: M.top + 120, color: '#3b82f6', value: 8.5 },
    { id: '侧向径流', col: 0, y: M.top + 160, color: '#8b5cf6', value: 8.6 },
    { id: '侧向径流(深)', col: 0, y: M.top + 200, color: '#8b5cf6', value: 3.2 },
    { id: '侧向径流(极深)', col: 0, y: M.top + 230, color: '#f59e0b', value: 0.8 },
    // 含水层
    { id: '第I含水组', col: 1, y: M.top + 30, color: '#22c55e', value: 86.7 },
    { id: '第II含水组', col: 1, y: M.top + 130, color: '#3b82f6', value: 35.3 },
    { id: '第III含水组', col: 2, y: M.top + 100, color: '#8b5cf6', value: 11.5 },
    { id: '第IV含水组', col: 3, y: M.top + 150, color: '#f59e0b', value: 2.6 },
  ];

  function nodeY(id: string): number {
    return nodes.find(n => n.id === id)?.y ?? M.top;
  }
  function nodeX(id: string): number {
    const n = nodes.find(n => n.id === id);
    return n ? colX[n.col] : M.left;
  }
  function nodeWidth(v: number): number {
    return Math.max(4, Math.min(20, v * 0.25));
  }

  const [hoveredFlow, setHoveredFlow] = useState<number | null>(null);

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
        <GitBranch size={14} className="text-cyan-400" />
        层间越流补给关系流图
      </h3>
      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          {/* 流线 */}
          {flows.map((flow, i) => {
            const sx = nodeX(flow.source) + nodeWidth(flows.filter(f => f.source === flow.source).reduce((s, f) => s + f.value, 0));
            const sy = nodeY(flow.source);
            const tx = nodeX(flow.target);
            const ty = nodeY(flow.target);
            const isHover = hoveredFlow === i;
            const midX = (sx + tx) / 2;
            const path = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
            return (
              <g key={i}
                onMouseEnter={() => setHoveredFlow(i)}
                onMouseLeave={() => setHoveredFlow(null)}
                className="cursor-pointer"
              >
                <path d={path} fill="none" stroke={flow.color} strokeWidth={isHover ? 4 : Math.max(1, flow.value * 0.15)} opacity={isHover ? 0.8 : 0.35} />
                {isHover && (
                  <g>
                    <rect x={midX - 40} y={(sy + ty) / 2 - 22} width="110" height="36" fill="#1e293b" stroke={flow.color} strokeWidth="0.5" rx="4" opacity="0.95" />
                    <text x={midX + 15} y={(sy + ty) / 2 - 8} fontSize="8" fill={flow.color} textAnchor="middle" fontWeight="bold">{flow.value} 亿m³</text>
                    <text x={midX + 15} y={(sy + ty) / 2 + 4} fontSize="7" fill="#94a3b8" textAnchor="middle">{flow.source}→{flow.target}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 节点 */}
          {nodes.map((node) => {
            const totalOut = flows.filter(f => f.source === node.id).reduce((s, f) => s + f.value, 0);
            const w = nodeWidth(totalOut || node.value);
            return (
              <g key={node.id}>
                <rect x={nodeX(node.id)} y={node.y - 8} width={w} height="16" fill={node.color} fillOpacity="0.6" rx="2" />
                <text
                  x={node.col === 0 ? nodeX(node.id) - 5 : nodeX(node.id) + w + 5}
                  y={node.y + 3}
                  fontSize="8"
                  fill={node.color}
                  textAnchor={node.col === 0 ? 'end' : 'start'}
                  fontWeight="bold"
                >
                  {node.id}
                </text>
                <text
                  x={node.col === 0 ? nodeX(node.id) - 5 : nodeX(node.id) + w + 5}
                  y={node.y + 13}
                  fontSize="7"
                  fill="#64748b"
                  textAnchor={node.col === 0 ? 'end' : 'start'}
                >
                  {node.value}亿m³
                </text>
              </g>
            );
          })}

          {/* 列标题 */}
          <text x={colX[0]} y={M.top - 8} fontSize="9" fill="#94a3b8" textAnchor="start">补给源</text>
          <text x={colX[1]} y={M.top - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">含水层</text>
          <text x={colX[3]} y={M.top - 8} fontSize="9" fill="#94a3b8" textAnchor="end">深层排泄</text>
        </svg>
      </div>

      <div className="mt-2 text-[9px] text-gw-muted flex items-center gap-3">
        <span className="flex items-center gap-1"><Droplets size={9} className="text-green-400" /> 浅层补给(86.7亿m³)</span>
        <span className="flex items-center gap-1"><ArrowDownUp size={9} className="text-blue-400" /> 越流补给</span>
        <span className="text-gw-muted/50 ml-auto">流线宽度=流量比例 · 单位: 亿m³/a</span>
      </div>
    </TechCard>
  );
}

// ── 子组件4：城市分层开采对比（2000 vs 2024） ──

function CityLayeredExtraction() {
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

function DeepWaterLevelRecovery() {
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

export function MultiLayerCouplingViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <Layers3 size={14} className="text-cyan-400" />
        <span>多层含水层耦合可视化 — 4组含水层结构/越流补给/分层开采/水位恢复响应</span>
      </div>

      {/* 上排：系统剖面 + 开采时序 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AquiferSystemDiagram />
        <ShallowDeepExtractionTimeline />
      </div>

      {/* 中排：越流流图 + 城市分层对比 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <LeakageFlowDiagram />
        <CityLayeredExtraction />
      </div>

      {/* 下排：水位恢复 */}
      <DeepWaterLevelRecovery />
    </div>
  );
}
