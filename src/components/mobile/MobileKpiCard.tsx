/**
 * MobileKpiCard — 移动端紧凑KPI卡片
 *
 * 在小屏设备上以紧凑竖向布局展示关键指标：
 *   - 图标 + 标题 + 数值 + 趋势
 *   - 迷你Sparkline（8点）
 *   - 点击展开详情
 *   - 2列网格自适应
 */

import { useState, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

interface MobileKpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: string;
  trend?: number;
  trendLabel?: string;
  sparkline?: number[];
  children?: ReactNode;
}

export function MobileKpiCard({
  label,
  value,
  unit = '',
  icon,
  color = '#06b6d4',
  trend,
  trendLabel,
  sparkline,
  children,
}: MobileKpiCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = children !== undefined;

  return (
    <div
      className={`p-2.5 rounded-lg bg-gw-card border border-gw-border/30 transition-all ${
        expanded ? 'col-span-2' : ''
      }`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && <span style={{ color }}>{icon}</span>}
          <span className="text-[10px] text-gw-muted truncate">{label}</span>
        </div>
        {hasDetail && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gw-muted/50"
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* 数值 */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl font-bold text-gw-text">{value}</span>
        {unit && <span className="text-[10px] text-gw-muted">{unit}</span>}
      </div>

      {/* 趋势 */}
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-[9px]">
          {trend > 0 ? (
            <TrendingUp size={10} className={trend > 0 ? 'text-red-400' : 'text-emerald-400'} />
          ) : (
            <TrendingDown size={10} className="text-emerald-400" />
          )}
          <span className={trend > 0 ? 'text-red-400' : 'text-emerald-400'}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && <span className="text-gw-muted">{trendLabel}</span>}
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <svg width="100%" height="20" className="mt-1.5">
          {(() => {
            const min = Math.min(...sparkline);
            const max = Math.max(...sparkline);
            const range = max - min || 1;
            const w = 100;
            const h = 20;
            const points = sparkline.map((v, i) => ({
              x: (i / (sparkline.length - 1)) * w,
              y: h - ((v - min) / range) * h,
            }));
            const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;
            return (
              <>
                <path d={areaPath} fill={color} fillOpacity="0.1" />
                <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
              </>
            );
          })()}
        </svg>
      )}

      {/* 展开详情 */}
      {expanded && hasDetail && (
        <div className="mt-2 pt-2 border-t border-gw-border/20 text-[10px] text-gw-muted">
          {children}
        </div>
      )}
    </div>
  );
}

// ── 移动端KPI网格 ──

export function MobileKpiGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:hidden">
      {children}
    </div>
  );
}
