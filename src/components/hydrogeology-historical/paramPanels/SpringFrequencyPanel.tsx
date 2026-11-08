/**
 * 拆分自 HistoricalParamCalculatorTab.tsx — 泉水频率分析面板
 */

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, Droplets, Waves, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_SPRINGS, calcSpringFrequency } from '../../../utils/historicalParamCalculator';


export function SpringFrequencyPanel() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const input = PRESET_SPRINGS[selectedIdx];
  const result = useMemo(() => calcSpringFrequency(input), [input]);

  const chartData = result.empirical.map(e => ({
    frequency: e.frequency,
    flow: e.flow,
    year: e.year,
  }));

  // P-III曲线数据
  const curveData: Array<{ frequency: number; curve: number }> = [];
  for (let p = 1; p <= 99; p += 1) {
    const sorted = [...input.data].sort((a, b) => b.flow - a.flow);
    const m = sorted.reduce((sum, d) => sum + d.flow, 0) / sorted.length;
    // 简化P-III曲线插值
    const sortedFlows = sorted.map(d => d.flow);
    const rank = (p / 100) * (sorted.length + 1);
    const lower = Math.floor(rank) - 1;
    const upper = Math.ceil(rank) - 1;
    const frac = rank - Math.floor(rank);
    let flow: number;
    if (lower < 0) flow = sortedFlows[0] ?? m;
    else if (upper >= sortedFlows.length) flow = sortedFlows[sortedFlows.length - 1] ?? m;
    else flow = sortedFlows[lower] + (sortedFlows[upper] - sortedFlows[lower]) * frac;
    curveData.push({ frequency: p, curve: Math.round(flow * 1000) / 1000 });
  }

  // 合并图表数据
  const combinedData = chartData.map(d => {
    const c = curveData.find(c => Math.abs(c.frequency - d.frequency) < 0.5);
    return { ...d, curve: c?.curve ?? null };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_SPRINGS.map((s, i) => (
          <button key={i} onClick={() => setSelectedIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${selectedIdx === i ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="样本数" value={result.n} unit="年" icon={Droplets} accent="blue" />
        <StatCard title="均值" value={result.mean} unit="m³/s" icon={Calculator} accent="cyan" />
        <StatCard title="变差系数Cv" value={result.cv} unit="" icon={Waves} accent="amber" />
        <StatCard title="偏态系数Cs" value={result.cs} unit="" icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="经验频率+P-III型曲线" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="frequency" stroke="#64748b" fontSize={10} label={{ value: '频率(%)', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: '流量(m³/s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="频率分析" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line dataKey="flow" name="实测值" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              <Line dataKey="curve" name="P-III曲线" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="各保证率设计流量" badge="P-III型">
          <div className="grid grid-cols-5 gap-2">
            {result.designFlows.map((d, i) => (
              <div key={i} className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">P={d.probability}%</div>
                <div className="text-sm font-mono text-gw-highlight">{d.flow}</div>
                <div className="text-[9px] text-gw-muted">m³/s</div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-gw-surface/50 rounded">
            <div className="text-[10px] text-gw-muted">Cs/Cv比值</div>
            <div className="text-sm font-mono text-gw-cyan">{result.csCvRatio}</div>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">{result.note}</p>
        </TechCard>
      </div>

      <TechCard title="经验频率排列表">
        <FilterableTechTable
          headers={['序号', '年份', '流量(m³/s)', '经验频率(%)']}
          rows={result.empirical.map(e => [String(e.rank), String(e.year), String(e.flow), String(e.frequency)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
