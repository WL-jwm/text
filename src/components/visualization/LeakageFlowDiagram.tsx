/**
 * 多层含水层耦合可视化 — 越流补给示意流图
 */

import { useState, useMemo } from 'react';
import { GitBranch, ArrowDownUp, Droplets } from 'lucide-react';
import { TechCard } from '../UI';

export function LeakageFlowDiagram() {
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

