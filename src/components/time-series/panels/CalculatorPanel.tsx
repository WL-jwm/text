/**
 * B-26 地下水时间序列分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 自定义序列输入→趋势/统计/突变/预测/自相关
 *  2. 预设序列 — 6个河北典型监测点11年序列对比
 *  3. 方法说明 — Mann-Kendall/Pettitt/Sen斜率等统计方法
 *  4. 评价标准 — 趋势/波动/突变/模型校准标准
 * 面板组件：CalculatorPanel（拆分自 TimeSeriesCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend, Area, AreaChart } from 'recharts';
import { Calculator, BookOpen, Gauge } from 'lucide-react';
import { TechCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { calcTimeSeriesAnalysis, type TimeSeriesInput } from '../../../utils/timeSeriesCalculator';
import { TREND_COLORS, DEFAULT_DATA, DEFAULT_YEARS } from './timeSeriesConstants';

// ── 面板1: 计算器 ──
export function CalculatorPanel() {
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
