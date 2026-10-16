/**
 * B-29 地下水空间统计分析器 Tab
 *
 * 4大面板：
 *  1. Moran's I — 全局空间自相关+LISA局部热点/冷点
 *  2. 半变异函数 — 实验+理论模型拟合(球状/指数/高斯)
 *  3. 交叉验证 — 克里金插值精度评估(留一法)
 *  4. 参考 — 空间统计方法与判据说明
 * 面板: CrossValidationPanel（拆分自 SpatialStatsCalculatorTab.tsx）
 */
import { PRESET_REGIONS, calcCrossValidation } from '../../../utils/spatialStatsCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartTooltip, StatCard, TechCard } from '../../UI';
import { Globe, BookOpen, Calculator, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, ScatterChart, BarChart, ReferenceLine, Bar, Scatter, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { TOOLTIP_STYLE } from './spatialStatsConstants';

export function CrossValidationPanel() {
  const [regionIdx, setRegionIdx] = useState(0);
  const region = PRESET_REGIONS[regionIdx];
  const result = useMemo(() => calcCrossValidation(region.points), [regionIdx]);

  const scatterData = result.points.map(p => ({
    name: p.name,
    actual: p.actual,
    predicted: p.predicted,
    error: p.error,
  }));

  const minVal = Math.min(...result.points.map(p => p.actual), ...result.points.map(p => p.predicted));
  const maxVal = Math.max(...result.points.map(p => p.actual), ...result.points.map(p => p.predicted));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_REGIONS.map((r, i) => (
          <button key={i} onClick={() => setRegionIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${regionIdx === i ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="ME(平均误差)" value={result.me} unit="" icon={Calculator} accent="blue" />
        <StatCard title="RMSE" value={result.rmse} unit="" icon={TrendingUp} accent="amber" />
        <StatCard title="MAE" value={result.mae} unit="" icon={Globe} accent="cyan" />
        <StatCard title="精度等级" value={result.accuracy} unit="" icon={BookOpen} accent={result.accuracy === '优' ? 'emerald' : result.accuracy === '良' ? 'cyan' : result.accuracy === '合格' ? 'amber' : 'red'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="实测 vs 预测散点图（1:1线）" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="actual" name="实测值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <YAxis type="number" dataKey="predicted" name="预测值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4" />
              <ReferenceLine segment={[{ x: minVal - 1, y: minVal - 1 }, { x: maxVal + 1, y: maxVal + 1 }]} stroke="#10b981" strokeDasharray="5 5" label={{ value: '1:1', fill: '#10b981', fontSize: 10 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各点误差分布" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: '误差', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="误差" />} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="error" name="误差" radius={[2, 2, 0, 0]}>
                {scatterData.map((d, i) => <Cell key={i} fill={d.error >= 0 ? '#06b6d4' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="交叉验证明细">
        <FilterableTechTable
          headers={['点名称', '实测值', '预测值', '误差', '标准化误差']}
          rows={result.points.map(p => [p.name, String(p.actual), String(p.predicted), String(p.error), String(p.stdError)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="精度评价" badge={result.accuracy} icon={BookOpen}>
        <p className="text-sm text-gw-text leading-relaxed">{result.note}</p>
      </TechCard>
    </div>
  );
}
