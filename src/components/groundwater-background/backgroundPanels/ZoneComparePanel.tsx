/**
 * B-27 地下水背景值统计分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 单因子背景值确定（3种方法对比）
 *  2. 分区对比 — 3个分区6项因子背景值差异分析
 *  3. 超标统计 — 各因子超标率/超标倍数/污染指数
 *  4. 趋势检测 — 多年背景值变化趋势+偏移判断
 * 面板: ZoneComparePanel（拆分自 BackgroundValueCalculatorTab.tsx）
 */
import { PRESET_ZONES, calcAllZoneCompare } from '../../../utils/backgroundValueCalculator';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, ChartTooltip, StatCard } from '../../UI';
import { TrendingDown, AlertTriangle, Calculator, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { YAxis, XAxis, CartesianGrid, Legend, Bar, Tooltip, ResponsiveContainer, BarChart } from 'recharts';
import { ZONE_COLORS } from './backgroundConstants';

export function ZoneComparePanel() {
  const results = useMemo(() => calcAllZoneCompare(), []);

  const compareBarData = useMemo(() => {
    return results.map(r => {
      const item: Record<string, number | string> = { factor: r.factor };
      r.zones.forEach(z => { item[z.name] = z.mean; });
      return item;
    });
  }, [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="对比因子" value={results.length} unit="项" icon={MapPin} accent="blue" />
        <StatCard title="对比分区" value={PRESET_ZONES.length} unit="个" icon={Calculator} accent="cyan" />
        <StatCard title="显著差异因子" value={results.filter(r => r.significantDiff).length} unit={`/${results.length}`} icon={AlertTriangle} accent="amber" />
        <StatCard title="最大差异倍数" value={Math.max(...results.map(r => r.maxRatio))} unit="倍" icon={TrendingDown} accent="red" />
      </div>

      <LazyChartCard title="各分区因子背景值对比" height={320}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={compareBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="factor" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip content={<ChartTooltip title="背景值" unit="mg/L" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {PRESET_ZONES.map(z => (
              <Bar key={z} dataKey={z} name={z} fill={ZONE_COLORS[z]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="分区差异分析汇总">
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gw-text">{r.factor}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.significantDiff ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                  {r.significantDiff ? '差异显著' : '差异不显著'}
                </span>
              </div>
              <div className="flex gap-3 text-[10px] text-gw-muted">
                <span>最大差异: {r.maxRatio}倍</span>
                <span>区间内Cv: {r.avgCv}</span>
                <span>区间间Cv: {r.betweenZoneCv}</span>
              </div>
              <div className="text-[10px] text-gw-muted mt-1">{r.evaluation}</div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
