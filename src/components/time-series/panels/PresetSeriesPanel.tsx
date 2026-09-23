/**
 * B-26 地下水时间序列分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 自定义序列输入→趋势/统计/突变/预测/自相关
 *  2. 预设序列 — 6个河北典型监测点11年序列对比
 *  3. 方法说明 — Mann-Kendall/Pettitt/Sen斜率等统计方法
 *  4. 评价标准 — 趋势/波动/突变/模型校准标准
 * 面板组件：PresetSeriesPanel（拆分自 TimeSeriesCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend, ScatterChart, Scatter } from 'recharts';
import { Calculator, MapPin, BookOpen, Gauge } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_SERIES, calcAllPresetSeries, calcSeriesSummary } from '../../../utils/timeSeriesCalculator';
import { TOOLTIP_STYLE, TREND_COLORS } from './timeSeriesConstants';

// ── 面板2: 预设序列 ──
export function PresetSeriesPanel() {
  const results = useMemo(() => calcAllPresetSeries(), []);
  const summary = useMemo(() => calcSeriesSummary(), []);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selected = PRESET_SERIES[selectedIdx];
  const selectedResult = results[selectedIdx];

  const trendBarData = results.map(r => ({
    name: r.name.length > 8 ? r.name.substring(0, 8) + '...' : r.name,
    slope: r.trend.slope,
    r2: r.trend.r2,
    color: TREND_COLORS[r.trend.trend] ?? '#64748b',
  }));

  const cvScatterData = results.map(r => ({
    name: r.name.length > 6 ? r.name.substring(0, 6) + '...' : r.name,
    cv: r.periodicity.cv,
    r2: r.trend.r2,
    color: TREND_COLORS[r.trend.trend] ?? '#64748b',
  }));

  const seriesChart = selected.data.map(d => ({
    year: String(d.year),
    value: d.value,
    trend: selectedResult ? Math.round((selectedResult.trend.slope * d.year + selectedResult.trend.intercept) * 100) / 100 : 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="预设序列" value={summary.seriesCount} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="显著趋势" value={summary.trendCounts['上升'] + summary.trendCounts['下降']} unit={`/${summary.seriesCount}`} icon={Gauge} accent="cyan" />
        <StatCard title="突变点" value={summary.changeCount} unit="个" icon={Calculator} accent="amber" />
        <StatCard title="平均R²" value={summary.avgR2} unit="" icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各序列趋势斜率对比" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip content={<ChartTooltip title="趋势斜率" />} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="slope" name="斜率/年" radius={[2, 2, 0, 0]}>
                {trendBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="变差系数Cv vs 拟合R²" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="cv" name="Cv" stroke="#64748b" fontSize={10} domain={[0, 'auto']} />
              <YAxis type="number" dataKey="r2" name="R²" stroke="#64748b" fontSize={10} domain={[0, 1]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={cvScatterData} fill="#06b6d4">
                {cvScatterData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 序列选择器 */}
      <TechCard title="预设序列详情" badge={selected.name}>
        <div className="flex flex-wrap gap-1 mb-3">
          {PRESET_SERIES.map((s, i) => (
            <button key={i} onClick={() => setSelectedIdx(i)}
              className={`px-2 py-1 rounded text-[10px] transition-all ${selectedIdx === i ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
              {s.name}
            </button>
          ))}
        </div>
        <LazyChartCard title={`${selected.name} (${selected.unit})`} height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={seriesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: selected.unit, angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title={selected.dataType} unit={selected.unit} />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line dataKey="value" name="实测值" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              <Line dataKey="trend" name="趋势线" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </TechCard>

      <TechCard title="各序列分析汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            序列: r.name,
            数据类型: r.dataType,
            单位: r.unit,
            样本数: r.n,
            趋势: r.trend.trend,
            显著性: r.trend.significant ? '显著' : '不显著',
            斜率: r.trend.slope,
            年变化率: r.trend.annualChangeRate,
            R2: r.trend.r2,
            MK_Z: r.trend.mkZ,
            MK_p: r.trend.mkP,
            Sen斜率: r.trend.senSlope,
            均值: r.periodicity.mean,
            标准差: r.periodicity.std,
            Cv: r.periodicity.cv,
            波动评价: r.periodicity.fluctuation,
            突变年: r.changePoint.changeYear ?? '无',
            变化幅度: r.changePoint.changeMagnitude,
            预测模型: r.forecast.model,
            模型R2: r.forecast.modelR2,
          }))} filename="timeseries-analysis" sheetName="时间序列分析" formats={['xlsx', 'csv', 'json']} label="导出分析结果" />
        </div>
        <FilterableTechTable
          headers={['序列', '类型', '趋势', '斜率/年', '年变化率(%)', 'R²', 'MK-p', 'Cv', '波动', '突变年', '预测模型']}
          rows={results.map(r => [
            r.name, r.dataType, r.trend.trend,
            String(r.trend.slope), String(r.trend.annualChangeRate),
            String(r.trend.r2), String(r.trend.mkP),
            String(r.periodicity.cv), r.periodicity.fluctuation,
            r.changePoint.changeYear ? String(r.changePoint.changeYear) : '无',
            r.forecast.model,
          ])}
          filterPlaceholder="搜索序列..."
        />
      </TechCard>
    </div>
  );
}
