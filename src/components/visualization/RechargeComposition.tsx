/**
 * 包气带入渗可视化 — 地下水补给组成分析
 */

import { useState, useMemo } from 'react';
import { Gauge, Droplets, CloudRain } from 'lucide-react';
import { TechCard } from '../UI';
import { plainWaterBalance, hydrogeologicalParams } from '../../data/groundwaterResources';

export function RechargeComposition() {
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

