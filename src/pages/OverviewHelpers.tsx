import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * 数字动画计数Hook
 * @param target 目标数值
 * @param duration 动画时长(ms)
 * @param decimals 小数位数
 */
export function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, decimals]);

  return value;
}

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  sub?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
  accent: string;
  sparkline?: number[];
  sparkColor?: string;
  /** 点击卡片跳转的路由路径 */
  href?: string;
}

/**
 * KPI指标卡 - 用于总览页面的关键指标展示
 */
export function KPICard({ title, value, unit, sub, change, changeType, icon: Icon, accent, sparkline, sparkColor, href }: KPICardProps) {
  const changeColor = changeType === 'up' ? 'text-emerald-400' : changeType === 'down' ? 'text-amber-400' : 'text-gw-muted';
  const accentMap: Record<string, string> = {
    blue: 'from-blue-500/15 to-blue-600/5 border-blue-500/25',
    cyan: 'from-cyan-500/15 to-cyan-600/5 border-cyan-500/25',
    green: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/25',
    emerald: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/25',
    amber: 'from-amber-500/15 to-amber-600/5 border-amber-500/25',
    red: 'from-red-500/15 to-red-600/5 border-red-500/25',
    purple: 'from-purple-500/15 to-purple-600/5 border-purple-500/25',
  };
  const cls = accentMap[accent] || accentMap.blue;
  const IconComponent = Icon;

  return (
    <a href={href} className={`rounded-xl bg-gradient-to-br ${cls} border p-4 block transition-all duration-200 ${href ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-gw-cyan/5' : ''}`} onClick={href ? (e: React.MouseEvent) => { e.preventDefault(); window.location.hash = href ?? ''; } : undefined}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-gw-muted flex items-center gap-1.5">
          {IconComponent && <IconComponent size={12} className="flex-shrink-0 opacity-70" />}
          {title}
        </div>
        {change && (
          <div className={`flex items-center gap-0.5 text-[10px] ${changeColor}`}>
            {changeType === 'up' && <TrendingUp size={10} />}{changeType === 'down' && <TrendingDown size={10} />}
            {change}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-xs text-gw-muted">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-gw-muted mt-1">{sub}</div>}
      {sparkline && sparkline.length > 0 && (() => {
        const min = Math.min(...sparkline);
        const max = Math.max(...sparkline);
        const range = max - min || 1;
        const normalized = sparkline.map(v => ((v - min) / range) * 80 + 10);
        const w = sparkline.length - 1;
        return (
          <div className="mt-2 h-8">
            <svg width="100%" height="100%" viewBox={`0 0 ${w} 100`} preserveAspectRatio="none">
              <polyline
                points={normalized.map((v, i) => `${i},${100 - v}`).join(' ')}
                fill="none"
                stroke={sparkColor || '#3b82f6'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })()}
    </a>
  );
}

interface GaugeCardProps {
  label: string;
  value: string | number;
  unit: string;
  color: string;
  sub?: string;
}

/**
 * 仪表盘卡 - 展示百分比/比例类指标
 */
export function GaugeCard({ label, value, unit, color, sub }: GaugeCardProps) {
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/15' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`text-center p-3 ${c.bg} rounded-lg border ${c.border}`}>
      <p className="text-[11px] text-gw-muted mb-1">{label}</p>
      <p className={`text-2xl font-mono font-bold ${c.text}`}>
        {value}<span className="text-xs text-gw-muted ml-1">{unit}</span>
      </p>
      {sub && <p className="text-[10px] text-gw-muted font-mono">{sub}</p>}
    </div>
  );
}
