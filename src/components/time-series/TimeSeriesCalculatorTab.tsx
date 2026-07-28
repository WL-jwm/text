/**
 * B-26 地下水时间序列分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 自定义序列输入→趋势/统计/突变/预测/自相关
 *  2. 预设序列 — 6个河北典型监测点11年序列对比
 *  3. 方法说明 — Mann-Kendall/Pettitt/Sen斜率等统计方法
 *  4. 评价标准 — 趋势/波动/突变/模型校准标准
 */
import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend, ScatterChart, Scatter,
  Area, AreaChart,
} from 'recharts';
import { Calculator, MapPin, BookOpen, Gauge } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_SERIES,
  calcTimeSeriesAnalysis,
  calcAllPresetSeries,
  calcSeriesSummary,
  type TimeSeriesInput,
} from '../../utils/timeSeriesCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const TREND_COLORS: Record<string, string> = {
  '上升': '#ef4444',
  '下降': '#10b981',
  '无显著趋势': '#64748b',
};

const DEFAULT_DATA = '68.5, 69.8, 70.2, 71.5, 70.8, 69.2, 67.5, 65.8, 64.2, 63.5, 62.8';
const DEFAULT_YEARS = '2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024';

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  const [name, setName] = useState('自定义监测点');
  const [dataType, setDataType] = useState('水位埋深');
  const [unit, setUnit] = useState('m');
  const [dataText, setDataText] = useState(DEFAULT_DATA);
  const [yearsText, setYearsText] = useState(DEFAULT_YEARS);

  const input: TimeSeriesInput = useMemo(() => {
    const values = dataText.split(/[,，\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const years = yearsText.split(/[,，\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const data = values.map((v, i) => ({ year: years[i] ?? 2014 + i, value: v }));
    return { name, dataType, unit, data };
  }, [name, dataType, unit, dataText, yearsText]);

  const result = useMemo(() => calcTimeSeriesAnalysis(input), [input]);

  // 原始序列+趋势线+预测
  const chartData = useMemo(() => {
    const items: Array<{ year: string; 实测: number | null; 趋势线: number | null }> = input.data.map(d => ({
      year: String(d.year),
      实测: d.value as number | null,
      趋势线: input.data.length > 0
        ? Math.round((result.trend.slope * d.year + result.trend.intercept) * 100) / 100
        : null,
    }));
    // 添加预测
    result.forecast.forecast.forEach(f => {
      items.push({ year: String(f.year), 实测: null as number | null, 趋势线: f.value });
    });
    return items;
  }, [input, result]);

  // ACF图
  const acfData = result.autoCorrelation.acf.map(a => ({
    lag: `滞后${a.lag}`,
    acf: a.value,
  }));

  // 预测置信区间
  const forecastData = result.forecast.forecast.map(f => ({
    year: String(f.year),
    预测值: f.value,
    下界: f.lower,
    上界: f.upper,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入面板 */}
        <TechCard title="时间序列输入" badge={`${input.data.length}个数据点`} icon={Calculator}>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input value={name} onChange={e => setName(e.target.value)}
                className="px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text" placeholder="名称" />
              <select value={dataType} onChange={e => setDataType(e.target.value)}
                className="px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text">
                <option value="水位埋深">水位埋深</option>
                <option value="开采量">开采量</option>
                <option value="水质指数">水质指数</option>
                <option value="沉降速率">沉降速率</option>
              </select>
              <input value={unit} onChange={e => setUnit(e.target.value)}
                className="px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text" placeholder="单位" />
            </div>
            <div>
              <label className="text-[10px] text-gw-muted">年份序列（逗号分隔）</label>
              <textarea value={yearsText} onChange={e => setYearsText(e.target.value)} rows={2}
                className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-gw-muted">数据序列（逗号分隔，与年份一一对应）</label>
              <textarea value={dataText} onChange={e => setDataText(e.target.value)} rows={3}
                className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono resize-none" />
            </div>
          </div>
        </TechCard>

        {/* 趋势分析结果 */}
        <div className="space-y-3">
          <TechCard title="趋势分析" badge={result.trend.trend} icon={Gauge}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">线性斜率/年</div>
                <div className="text-base font-mono text-gw-highlight">{result.trend.slope}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">年变化率</div>
                <div className="text-base font-mono" style={{ color: TREND_COLORS[result.trend.trend] }}>{result.trend.annualChangeRate}%</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">R²</div>
                <div className="text-base font-mono text-gw-cyan">{result.trend.r2}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">MK-Z值</div>
                <div className="text-base font-mono text-gw-text">{result.trend.mkZ}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">MK-p值</div>
                <div className="text-base font-mono text-gw-text">{result.trend.mkP}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">Sen斜率</div>
                <div className="text-base font-mono text-amber-400">{result.trend.senSlope}</div>
              </div>
            </div>
            <p className="text-[10px] text-gw-muted mt-2">{result.trend.note}</p>
          </TechCard>

          <TechCard title="统计特征" badge={result.periodicity.fluctuation}>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">均值</div>
                <div className="text-sm font-mono text-gw-text">{result.periodicity.mean}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">标准差</div>
                <div className="text-sm font-mono text-gw-text">{result.periodicity.std}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">Cv</div>
                <div className="text-sm font-mono text-gw-cyan">{result.periodicity.cv}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">偏度</div>
                <div className="text-sm font-mono text-gw-text">{result.periodicity.skewness}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">峰度</div>
                <div className="text-sm font-mono text-gw-text">{result.periodicity.kurtosis}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">最大值</div>
                <div className="text-sm font-mono text-emerald-400">{result.periodicity.max}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">最小值</div>
                <div className="text-sm font-mono text-red-400">{result.periodicity.min}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">极差</div>
                <div className="text-sm font-mono text-gw-text">{result.periodicity.range}</div>
              </div>
            </div>
            <p className="text-[10px] text-gw-muted mt-2">{result.periodicity.note}</p>
          </TechCard>
        </div>
      </div>

      {/* 序列图表 */}
      <LazyChartCard title="时间序列+趋势线+预测" height={320}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title={dataType} unit={unit} />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line dataKey="实测" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
            <Line dataKey="趋势线" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </LazyChartCard>

      {/* 突变检测 + 预测置信区间 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="突变检测（Pettitt检验）" badge={result.changePoint.hasChangePoint ? '存在突变' : '无突变'}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">U统计量</div>
              <div className="text-base font-mono text-gw-text">{result.changePoint.pettittU}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">p值</div>
              <div className="text-base font-mono text-gw-text">{result.changePoint.pettittP}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">突变年</div>
              <div className="text-base font-mono text-amber-400">{result.changePoint.changeYear ?? '—'}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">突变前均值</div>
              <div className="text-sm font-mono text-gw-text">{result.changePoint.beforeMean}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">突变后均值</div>
              <div className="text-sm font-mono text-gw-text">{result.changePoint.afterMean}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">变化幅度</div>
              <div className={`text-sm font-mono ${result.changePoint.changeMagnitude > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{result.changePoint.changeMagnitude}%</div>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted">{result.changePoint.note}</p>
        </TechCard>

        <LazyChartCard title="预测值与95%置信区间" height={240}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: unit, angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="预测" unit={unit} />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area dataKey="上界" stroke="none" fill="#f59e0b" fillOpacity={0.15} name="95%上界" />
              <Area dataKey="下界" stroke="none" fill="#1e293b" fillOpacity={0.5} name="95%下界" />
              <Line dataKey="预测值" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="预测值" />
            </AreaChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 自相关 + 结论 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="自相关函数(ACF)" height={240}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={acfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="lag" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[-1, 1]} />
              <Tooltip content={<ChartTooltip title="ACF" />} />
              <ReferenceLine y={0} stroke="#64748b" />
              <ReferenceLine y={0.577} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '95%界', fill: '#f59e0b', fontSize: 9 }} />
              <ReferenceLine y={-0.577} stroke="#f59e0b" strokeDasharray="3 3" />
              <Bar dataKey="acf" name="ACF" radius={[2, 2, 0, 0]}>
                {acfData.map((d, i) => <Cell key={i} fill={Math.abs(d.acf) > 0.577 ? '#ef4444' : '#06b6d4'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="预测模型信息" badge={result.forecast.model} icon={BookOpen}>
          <div className="space-y-2">
            <div className="p-2 bg-gw-surface/50 rounded">
              <div className="text-[10px] text-gw-muted">模型参数</div>
              <div className="text-xs font-mono text-gw-highlight mt-0.5">{result.forecast.parameters}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <div className="text-[10px] text-gw-muted">模型R²</div>
              <div className="text-sm font-mono text-gw-cyan mt-0.5">{result.forecast.modelR2}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <div className="text-[10px] text-gw-muted">预测结果</div>
              <div className="text-xs text-gw-text mt-0.5">
                {result.forecast.forecast.map(f => `${f.year}年: ${f.value}${unit}(${f.lower}~${f.upper})`).join(' | ')}
              </div>
            </div>
            <p className="text-[10px] text-gw-muted">{result.forecast.note}</p>
          </div>
        </TechCard>
      </div>

      {/* 综合结论 */}
      <TechCard title="综合分析结论" icon={BookOpen}>
        <p className="text-sm text-gw-text leading-relaxed">{result.conclusion}</p>
        <p className="text-[10px] text-gw-muted mt-2">{result.autoCorrelation.note}</p>
      </TechCard>
    </div>
  );
}

// ── 面板2: 预设序列 ──

function PresetSeriesPanel() {
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

// ── 面板3: 方法说明 ──

function MethodPanel() {
  return (
    <div className="space-y-4">
      <TechCard title="趋势分析方法" badge="3种方法">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">线性回归（最小二乘法）</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">y = ax + b, a = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)</div>
            <div className="text-[10px] text-gw-muted mt-1">计算简单直观，给出斜率(年变化量)和R²(拟合优度)。适用于线性趋势明显的序列。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Mann-Kendall检验</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">S = Σsign(xj - xi), Z = (S±1)/√Var(S)</div>
            <div className="text-[10px] text-gw-muted mt-1">非参数检验，不要求数据正态分布，对异常值不敏感。Z&gt;1.96或Z&lt;-1.96表示α=0.05下趋势显著。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Sen斜率估计</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">β = median[(xj - xi) / (j - i)], ∀i &lt; j</div>
            <div className="text-[10px] text-gw-muted mt-1">非参数斜率估计，计算所有配对斜率的中位数。对异常值稳健，与Mann-Kendall检验配合使用。</div>
          </div>
        </div>
      </TechCard>

      <TechCard title="突变检测方法" badge="Pettitt检验">
        <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
          <div className="text-xs font-semibold text-gw-highlight">Pettitt检验</div>
          <div className="text-sm font-mono text-gw-cyan mt-1">Uk = ΣΣsign(xi - xj), p ≈ 2·exp(-6·U²/(n³+n²))</div>
          <div className="text-[10px] text-gw-muted mt-1">
            非参数突变检测方法，遍历所有可能的分割点，找到统计量|U|最大的位置作为潜在突变点。
            p&lt;0.05时认为突变显著。适用于检测序列中均值发生的阶跃变化。
          </div>
        </div>
      </TechCard>

      <TechCard title="预测模型" badge="2种模型">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">线性回归模型</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">y = a·x + b</div>
            <div className="text-[10px] text-gw-muted mt-1">最简单的预测模型，适用于线性趋势序列。置信区间基于残差标准差±1.96σ。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">指数回归模型</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">y = a·e^(b·x), 即 ln(y) = b·x + ln(a)</div>
            <div className="text-[10px] text-gw-muted mt-1">适用于指数增长/衰减序列（如衰减率、浓度变化）。对ln(y)做线性回归后反变换。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-[10px] text-gw-muted">模型选择：自动比较线性与指数模型的R²，选取拟合优度更高者。95%置信区间基于残差分布计算。</div>
          </div>
        </div>
      </TechCard>

      <TechCard title="自相关分析" badge="ACF">
        <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
          <div className="text-xs font-semibold text-gw-highlight">自相关函数 ACF</div>
          <div className="text-sm font-mono text-gw-cyan mt-1">ρk = Σ(xt-μ)(xt+k-μ) / Σ(xt-μ)²</div>
          <div className="text-[10px] text-gw-muted mt-1">
            衡量序列自身在不同滞后阶数上的相关性。95%置信界≈±1.96/√n。
            若ACF超出置信界，表明序列存在自相关（即当前值受历史值影响），预测时可利用此信息。
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="Mann-Kendall(1945) | Pettitt(1979) | Sen(1968) | 河北省地下水监测年报(2014-2024)" version="B-26" />
    </div>
  );
}

// ── 面板4: 评价标准 ──

function StandardPanel() {
  return (
    <div className="space-y-4">
      <TechCard title="趋势显著性评价" badge="Mann-Kendall">
        <FilterableTechTable
          headers={['|Z|值范围', '趋势方向', '显著性', '评价']}
          rows={[
            ['Z > 2.576', '上升', 'α=0.01极显著', '趋势极为明确'],
            ['1.96 < Z ≤ 2.576', '上升', 'α=0.05显著', '趋势明确'],
            ['1.645 < Z ≤ 1.96', '上升', 'α=0.10弱显著', '趋势较明确'],
            ['-1.645 ≤ Z ≤ 1.645', '无', '不显著', '无显著趋势'],
            ['-1.96 ≤ Z < -1.645', '下降', 'α=0.10弱显著', '趋势较明确'],
            ['-2.576 ≤ Z < -1.96', '下降', 'α=0.05显著', '趋势明确'],
            ['Z < -2.576', '下降', 'α=0.01极显著', '趋势极为明确'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="变差系数评价" badge="Cv分级">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { grade: '极稳定', range: 'Cv<0.1', color: '#10b981', desc: '年际变化极小' },
            { grade: '稳定', range: '0.1≤Cv<0.2', color: '#06b6d4', desc: '年际变化较小' },
            { grade: '中等波动', range: '0.2≤Cv<0.35', color: '#f59e0b', desc: '年际变化适中' },
            { grade: '波动较大', range: '0.35≤Cv<0.5', color: '#f97316', desc: '年际变化明显' },
            { grade: '波动剧烈', range: 'Cv≥0.5', color: '#ef4444', desc: '年际变化极大' },
          ].map(g => (
            <div key={g.grade} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.grade}</div>
              <div className="text-[10px] font-mono text-gw-text mt-0.5">{g.range}</div>
              <div className="text-[9px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="R²拟合优度评价" badge="回归模型">
        <FilterableTechTable
          headers={['R²范围', '评价', '适用性']}
          rows={[
            ['R²≥0.9', '优', '模型高度可靠，可放心用于预测'],
            ['0.7≤R²<0.9', '良', '模型较可靠，预测误差较小'],
            ['0.5≤R²<0.7', '合格', '模型基本可用，需注意不确定性'],
            ['0.3≤R²<0.5', '勉强', '模型精度低，预测仅供参考'],
            ['R²<0.3', '差', '模型不可用，需换用其他方法'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="统计特征参考" badge="偏度/峰度">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">偏度(Skewness)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              衡量分布对称性。|偏度|&lt;0.5为近正态(对称)；偏度&gt;0.5为右偏(长尾在高值侧)；偏度&lt;-0.5为左偏(长尾在低值侧)。
              水位埋深序列常呈右偏(少数极端深值拉长右尾)。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">峰度(Kurtosis, 超额峰度)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              衡量分布尖峭程度(相对正态分布)。峰度≈0为正态峰；峰度&gt;0为尖峰(数据集中于均值附近)；
              峰度&lt;0为平峰(数据分散)。开采量序列常呈尖峰(多数年份接近均值，少数年份偏离较大)。
            </div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="水文统计方法 | 时间序列分析教材 | 河北省地下水监测技术规范" version="B-26" />
    </div>
  );
}

// ── 主组件 ──

export function TimeSeriesCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'preset' | 'method' | 'standard'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'preset' as const, label: '预设序列', icon: MapPin },
    { key: 'method' as const, label: '方法说明', icon: BookOpen },
    { key: 'standard' as const, label: '评价标准', icon: Gauge },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activePanel === p.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 'calculator' && <CalculatorPanel />}
      {activePanel === 'preset' && <PresetSeriesPanel />}
      {activePanel === 'method' && <MethodPanel />}
      {activePanel === 'standard' && <StandardPanel />}
    </div>
  );
}
