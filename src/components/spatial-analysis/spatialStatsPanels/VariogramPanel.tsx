/**
 * B-29 地下水空间统计分析器 Tab
 *
 * 4大面板：
 *  1. Moran's I — 全局空间自相关+LISA局部热点/冷点
 *  2. 半变异函数 — 实验+理论模型拟合(球状/指数/高斯)
 *  3. 交叉验证 — 克里金插值精度评估(留一法)
 *  4. 参考 — 空间统计方法与判据说明
 * 面板: VariogramPanel（拆分自 SpatialStatsCalculatorTab.tsx）
 */
import { calcVariogram, PRESET_REGIONS } from '../../../utils/spatialStatsCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartTooltip, StatCard, TechCard } from '../../UI';
import { Globe, TrendingUp, BookOpen, Calculator } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LineChart, CartesianGrid, Legend, Line, ReferenceLine, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function VariogramPanel() {
  const [regionIdx, setRegionIdx] = useState(0);
  const [model, setModel] = useState<'spherical' | 'exponential' | 'gaussian'>('spherical');
  const [lagCount, setLagCount] = useState(8);

  const region = PRESET_REGIONS[regionIdx];
  const result = useMemo(() => calcVariogram({ points: region.points, model, lagCount }), [regionIdx, model, lagCount]);

  const chartData = result.experimental.map(e => ({
    lag: e.lag,
    实验值: e.gamma,
    pairs: e.pairs,
  }));

  const theoreticalData = result.theoretical.map(t => ({
    lag: t.lag,
    理论值: t.gamma,
  }));

  // 合并图表数据
  const combinedData = [...chartData.map(d => ({ lag: d.lag, 实验值: d.实验值, 理论值: null as number | null })),
    ...theoreticalData.map(d => ({ lag: d.lag, 实验值: null as number | null, 理论值: d.理论值 }))]
    .sort((a, b) => a.lag - b.lag);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 items-center">
        {PRESET_REGIONS.map((r, i) => (
          <button key={i} onClick={() => setRegionIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${regionIdx === i ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name}
          </button>
        ))}
        <select value={model} onChange={e => setModel(e.target.value as 'spherical' | 'exponential' | 'gaussian')}
          className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text ml-2">
          <option value="spherical">球状模型</option>
          <option value="exponential">指数模型</option>
          <option value="gaussian">高斯模型</option>
        </select>
        <input type="number" value={lagCount} onChange={e => setLagCount(parseInt(e.target.value) || 8)} min={4} max={15}
          className="w-16 px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text font-mono" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="块金值C0" value={result.nugget} unit="" icon={Calculator} accent="amber" />
        <StatCard title="基台值" value={result.sill} unit="" icon={TrendingUp} accent="blue" />
        <StatCard title="变程a" value={result.range} unit="km" icon={Globe} accent="cyan" />
        <StatCard title="块金比" value={result.nuggetRatio} unit="" icon={BookOpen} accent={result.nuggetRatio < 0.25 ? 'emerald' : result.nuggetRatio < 0.5 ? 'amber' : 'red'} />
      </div>

      <LazyChartCard title={`半变异函数拟合（${result.model}）`} height={320}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="lag" stroke="#64748b" fontSize={10} label={{ value: '滞后距离(km)', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'γ(h)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="半变异函数" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line dataKey="实验值" name="实验半变异" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
            <Line dataKey="理论值" name="理论模型" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls />
            <ReferenceLine y={result.sill} stroke="#10b981" strokeDasharray="3 3" label={{ value: '基台', fill: '#10b981', fontSize: 10 }} />
          </LineChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="模型参数" badge={result.model}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">块金C0: </span>
              <span className="font-mono text-gw-highlight">{result.nugget}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">结构方差C: </span>
              <span className="font-mono text-gw-text">{result.structureVariance}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">基台C0+C: </span>
              <span className="font-mono text-gw-text">{result.sill}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">变程a: </span>
              <span className="font-mono text-gw-cyan">{result.range} km</span>
            </div>
          </div>
          <div className="mt-2 p-2 bg-gw-surface/50 rounded">
            <span className="text-[10px] text-gw-muted">空间自相关强度: </span>
            <span className="text-xs font-semibold text-gw-highlight">{result.spatialCorrelation}</span>
          </div>
        </TechCard>

        <TechCard title="评价说明" icon={BookOpen}>
          <p className="text-[10px] text-gw-muted leading-relaxed">{result.note}</p>
        </TechCard>
      </div>

      <TechCard title="实验半变异函数数据">
        <FilterableTechTable
          headers={['滞后距离(km)', 'γ(h)', '点对数']}
          rows={result.experimental.map(e => [String(e.lag), String(e.gamma), String(e.pairs)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
