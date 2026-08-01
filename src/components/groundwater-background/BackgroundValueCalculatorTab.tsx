/**
 * B-27 地下水背景值统计分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 单因子背景值确定（3种方法对比）
 *  2. 分区对比 — 3个分区6项因子背景值差异分析
 *  3. 超标统计 — 各因子超标率/超标倍数/污染指数
 *  4. 趋势检测 — 多年背景值变化趋势+偏移判断
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
  LineChart, Line, ScatterChart, Scatter,
} from 'recharts';
import { Calculator, MapPin, AlertTriangle, TrendingDown } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_FACTORS, PRESET_ZONES, PRESET_BACKGROUND_DATA,
  STANDARD_LIMITS,
  calcBackgroundValue,
  calcAllZoneCompare, calcAllExceedance, calcAllTrends,
  type BackgroundValueInput,
} from '../../utils/backgroundValueCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const EXCEED_COLORS: Record<string, string> = {
  '无超标': '#10b981', '轻微超标': '#06b6d4', '轻度超标': '#f59e0b',
  '中度超标': '#f97316', '重度超标': '#ef4444',
};

const ZONE_COLORS: Record<string, string> = {
  '山前平原': '#06b6d4', '中部平原': '#f59e0b', '滨海平原': '#ef4444',
};

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  const [zone, setZone] = useState<string>('山前平原');
  const [factor, setFactor] = useState<string>('TDS');
  const [customSamples, setCustomSamples] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const input: BackgroundValueInput = useMemo(() => {
    const { standard, unit } = STANDARD_LIMITS[factor];
    const samples = useCustom && customSamples.trim()
      ? customSamples.split(/[,，\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
      : PRESET_BACKGROUND_DATA[zone][factor] ?? [];
    return { name: zone, factor, unit, samples, standard };
  }, [zone, factor, customSamples, useCustom]);

  const result = useMemo(() => calcBackgroundValue(input), [input]);

  // 三种方法对比柱状图
  const methodCompareData = [
    { method: '均值±2σ', 下限: result.mean2SigmaRange[0], 上限: result.mean2SigmaRange[1], 剔除数: 0 },
    { method: '格鲁布斯', 下限: result.grubbsRange[0], 上限: result.grubbsRange[1], 剔除数: result.grubbsRemoved },
    { method: '迭代2σ', 下限: result.iterative2SigmaRange[0], 上限: result.iterative2SigmaRange[1], 剔除数: result.iterativeRemoved },
  ];

  // 样本分布散点图
  const sampleScatter = input.samples.map((v, i) => ({ idx: i + 1, value: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入面板 */}
        <TechCard title="参数设置" badge={`${input.samples.length}个样本`} icon={Calculator}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select value={zone} onChange={e => { setZone(e.target.value); setUseCustom(false); }}
                className="flex-1 px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text">
                {PRESET_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <select value={factor} onChange={e => setFactor(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text">
                {PRESET_FACTORS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-1.5 text-[10px] text-gw-muted cursor-pointer">
              <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} className="accent-gw-blue" />
              使用自定义数据（否则使用预设分区数据）
            </label>
            {useCustom && (
              <textarea value={customSamples} onChange={e => setCustomSamples(e.target.value)} rows={3}
                placeholder="输入样本数据，逗号分隔，如: 320, 350, 380, 410..."
                className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono resize-none" />
            )}
            <div className="text-[10px] text-gw-muted">
              标准限值(GB/T 14848-2017 Ⅲ类): {input.standard} {input.unit}
            </div>
          </div>
        </TechCard>

        {/* 统计结果 */}
        <TechCard title="描述性统计" badge={`${result.n}个样本`}>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">均值</div>
              <div className="text-sm font-mono text-gw-highlight">{result.mean}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">标准差</div>
              <div className="text-sm font-mono text-gw-text">{result.std}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">Cv</div>
              <div className="text-sm font-mono text-gw-cyan">{result.cv}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">中位数</div>
              <div className="text-sm font-mono text-gw-text">{result.median}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">最小值</div>
              <div className="text-sm font-mono text-emerald-400">{result.min}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">最大值</div>
              <div className="text-sm font-mono text-red-400">{result.max}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">偏度</div>
              <div className="text-sm font-mono text-gw-text">{result.skewness}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">峰度</div>
              <div className="text-sm font-mono text-gw-text">{result.kurtosis}</div>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">{result.distributionNote}</p>
        </TechCard>
      </div>

      {/* 三种方法对比 */}
      <TechCard title="背景值确定方法对比" badge={result.recommendedMethod.split('（')[0]}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          {methodCompareData.map((m, i) => (
            <div key={i} className={`p-3 bg-gw-surface/50 rounded-lg border ${m.method === result.recommendedMethod.split('（')[0] ? 'border-gw-blue/40 bg-gw-blue/5' : 'border-gw-border/30'}`}>
              <div className="text-xs font-semibold text-gw-text">{m.method}</div>
              <div className="text-sm font-mono text-gw-highlight mt-1">[{m.下限}, {m.上限}]</div>
              <div className="text-[10px] text-gw-muted mt-0.5">剔除异常值: {m.剔除数}个</div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
          <div className="text-xs font-semibold text-gw-highlight">推荐背景值范围</div>
          <div className="text-lg font-mono text-gw-cyan mt-1">[{result.recommendedRange[0]}, {result.recommendedRange[1]}] {input.unit}</div>
          <div className="text-[10px] text-gw-muted mt-1">{result.recommendedMethod}</div>
        </div>
      </TechCard>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="三种方法背景值范围对比" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={methodCompareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="method" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip content={<ChartTooltip title="背景值范围" unit={input.unit} />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="下限" name="下限" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="上限" name="上限" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <ReferenceLine y={input.standard} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '标准', fill: '#ef4444', fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="样本分布散点图" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="idx" name="序号" stroke="#64748b" fontSize={10} />
              <YAxis type="number" dataKey="value" name="值" unit={input.unit} stroke="#64748b" fontSize={10} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={sampleScatter} fill="#06b6d4" />
              <ReferenceLine y={result.mean} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '均值', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={input.standard} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '标准', fill: '#ef4444', fontSize: 10 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 评价结论 */}
      <TechCard title="综合评价结论" icon={AlertTriangle}>
        <p className="text-sm text-gw-text leading-relaxed">{result.note}</p>
      </TechCard>
    </div>
  );
}

// ── 面板2: 分区对比 ──

function ZoneComparePanel() {
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

// ── 面板3: 超标统计 ──

function ExceedancePanel() {
  const results = useMemo(() => calcAllExceedance(), []);

  const exceedBarData = results.map(r => ({
    factor: r.factor,
    exceedRate: r.exceedRate,
    maxMultiple: r.maxExceedMultiple,
    PI: r.pollutionIndex,
    color: EXCEED_COLORS[r.grade] ?? '#64748b',
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="评价因子" value={results.length} unit="项" icon={AlertTriangle} accent="red" />
        <StatCard title="超标因子" value={results.filter(r => r.exceedCount > 0).length} unit={`/${results.length}`} icon={AlertTriangle} accent="amber" />
        <StatCard title="最大超标率" value={Math.max(...results.map(r => r.exceedRate))} unit="%" icon={TrendingDown} accent="orange" />
        <StatCard title="最大超标倍数" value={Math.max(...results.map(r => r.maxExceedMultiple))} unit="倍" icon={AlertTriangle} accent="red" />
      </div>

      <LazyChartCard title="各因子超标率与污染指数" height={300}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={exceedBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="factor" stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} unit="%" />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
            <Tooltip content={<ChartTooltip title="超标统计" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="exceedRate" name="超标率(%)" fill="#ef4444" radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="PI" name="污染指数PI" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各因子超标评价详情">
        <FilterableTechTable
          headers={['因子', '标准(mg/L)', '样本数', '超标数', '超标率(%)', '平均超标倍数', '最大超标倍数', '最大值', 'PI', '等级']}
          rows={results.map(r => [
            r.factor, String(r.standard), String(r.n), String(r.exceedCount),
            String(r.exceedRate), String(r.avgExceedMultiple), String(r.maxExceedMultiple),
            String(r.maxValue), String(r.pollutionIndex), r.grade,
          ])}
          filterPlaceholder="搜索因子..."
        />
      </TechCard>

      <TechCard title="超标评价说明">
        <div className="space-y-2">
          {results.filter(r => r.exceedCount > 0).map((r, i) => (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gw-text">{r.factor}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: (EXCEED_COLORS[r.grade] ?? '#64748b') + '20', color: EXCEED_COLORS[r.grade] ?? '#64748b' }}>{r.grade}</span>
              </div>
              <p className="text-[10px] text-gw-muted mt-1">{r.note}</p>
            </div>
          ))}
          {results.filter(r => r.exceedCount > 0).length === 0 && (
            <div className="text-xs text-gw-muted text-center py-4">所有因子均无超标</div>
          )}
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板4: 趋势检测 ──

function TrendPanel() {
  const results = useMemo(() => calcAllTrends(), []);

  const _trendLineData = useMemo(() => {
    // 合并所有因子的年份数据
    if (results.length === 0) return [];
    const years = results[0].years;
    return years.map((y, i) => {
      const item: Record<string, number | string> = { year: String(y) };
      results.forEach(r => {
        if (r.yearlyMeans[i] !== undefined) {
          item[r.factor] = r.yearlyMeans[i];
        }
      });
      return item;
    });
  }, [results]);

  const [selectedFactor, setSelectedFactor] = useState(results[0]?.factor ?? 'TDS');
  const selectedResult = results.find(r => r.factor === selectedFactor) ?? results[0];

  const selectedLineData = useMemo(() => {
    if (!selectedResult) return [];
    return selectedResult.years.map((y, i) => ({
      year: String(y),
      实测值: selectedResult.yearlyMeans[i],
      趋势线: selectedResult.slope * y + (selectedResult.yearlyMeans.reduce((a, b) => a + b, 0) / selectedResult.yearlyMeans.length - selectedResult.slope * selectedResult.years.reduce((a, b) => a + b, 0) / selectedResult.years.length),
    }));
  }, [selectedResult]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="趋势因子" value={results.length} unit="项" icon={TrendingDown} accent="blue" />
        <StatCard title="显著变化" value={results.filter(r => r.backgroundShift).length} unit={`/${results.length}`} icon={TrendingDown} accent="amber" />
        <StatCard title="上升因子" value={results.filter(r => r.trend === '上升').length} unit="个" icon={TrendingDown} accent="red" />
        <StatCard title="下降因子" value={results.filter(r => r.trend === '下降').length} unit="个" icon={TrendingDown} accent="emerald" />
      </div>

      {/* 因子选择器 */}
      <TechCard title="趋势分析详情" badge={selectedFactor}>
        <div className="flex flex-wrap gap-1 mb-3">
          {results.map(r => (
            <button key={r.factor} onClick={() => setSelectedFactor(r.factor)}
              className={`px-2 py-1 rounded text-[10px] transition-all ${selectedFactor === r.factor ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
              {r.factor}
            </button>
          ))}
        </div>

        {selectedResult && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">斜率/年</div>
                <div className="text-base font-mono text-gw-highlight">{selectedResult.slope}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">年变化率</div>
                <div className="text-base font-mono" style={{ color: selectedResult.trend === '上升' ? '#ef4444' : selectedResult.trend === '下降' ? '#10b981' : '#64748b' }}>{selectedResult.annualChangeRate}%</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">R²</div>
                <div className="text-base font-mono text-gw-cyan">{selectedResult.r2}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">趋势</div>
                <div className="text-base" style={{ color: selectedResult.trend === '上升' ? '#ef4444' : selectedResult.trend === '下降' ? '#10b981' : '#64748b' }}>{selectedResult.trend}</div>
              </div>
            </div>
            <div className={`p-2 rounded text-[10px] mb-3 ${selectedResult.backgroundShift ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {selectedResult.note}
            </div>

            <LazyChartCard title={`${selectedFactor}背景值多年变化趋势`} height={280}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={selectedLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<ChartTooltip title={selectedFactor} />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line dataKey="实测值" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line dataKey="趋势线" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </>
        )}
      </TechCard>

      <TechCard title="各因子趋势汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            因子: r.factor,
            斜率: r.slope,
            年变化率: r.annualChangeRate,
            R2: r.r2,
            趋势: r.trend,
            背景值偏移: r.backgroundShift ? '是' : '否',
          }))} filename="background-trend" sheetName="背景值趋势" formats={['xlsx', 'csv', 'json']} label="导出趋势分析" />
        </div>
        <FilterableTechTable
          headers={['因子', '斜率/年', '年变化率(%)', 'R²', '趋势', '背景值偏移', '说明']}
          rows={results.map(r => [
            r.factor, String(r.slope), String(r.annualChangeRate),
            String(r.r2), r.trend,
            r.backgroundShift ? '是' : '否',
            r.note.substring(0, 30) + '...',
          ])}
          filterPlaceholder="搜索因子..."
        />
      </TechCard>

      <DataSourceNote source="GB/T 14848-2017《地下水质量标准》| 生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023) | 河北省地质环境监测院" version="B-27" />
    </div>
  );
}

// ── 主组件 ──

export function BackgroundValueCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'compare' | 'exceedance' | 'trend'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'compare' as const, label: '分区对比', icon: MapPin },
    { key: 'exceedance' as const, label: '超标统计', icon: AlertTriangle },
    { key: 'trend' as const, label: '趋势检测', icon: TrendingDown },
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
      {activePanel === 'compare' && <ZoneComparePanel />}
      {activePanel === 'exceedance' && <ExceedancePanel />}
      {activePanel === 'trend' && <TrendPanel />}
    </div>
  );
}
