/**
 * 多层含水层耦合可视化 — 含水层系统耦合剖面
 */

import { useState } from 'react';
import { Layers3, Info } from 'lucide-react';
import { TechCard } from '../UI';
import { AQUIFER_LAYERS } from './aquiferTypes';

export function AquiferSystemDiagram() {
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

