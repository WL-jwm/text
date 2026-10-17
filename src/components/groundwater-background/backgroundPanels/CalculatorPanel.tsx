/**
 * B-27 地下水背景值统计分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 单因子背景值确定（3种方法对比）
 *  2. 分区对比 — 3个分区6项因子背景值差异分析
 *  3. 超标统计 — 各因子超标率/超标倍数/污染指数
 *  4. 趋势检测 — 多年背景值变化趋势+偏移判断
 * 面板: CalculatorPanel（拆分自 BackgroundValueCalculatorTab.tsx）
 */
import { type BackgroundValueInput, PRESET_BACKGROUND_DATA, STANDARD_LIMITS, PRESET_ZONES, calcBackgroundValue, PRESET_FACTORS } from '../../../utils/backgroundValueCalculator';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, ChartTooltip } from '../../UI';
import { AlertTriangle, Calculator } from 'lucide-react';
import { useState, useMemo } from 'react';
import { YAxis, XAxis, CartesianGrid, Legend, Bar, Scatter, Tooltip, ScatterChart, ResponsiveContainer, BarChart, ReferenceLine } from 'recharts';
import { TOOLTIP_STYLE } from './backgroundConstants';

export function CalculatorPanel() {
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
