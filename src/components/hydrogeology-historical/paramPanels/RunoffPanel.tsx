/**
 * 拆分自 HistoricalParamCalculatorTab.tsx — 径流还原面板
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, Droplets, Waves, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_RUNOFF, calcRunoffRestoration } from '../../../utils/historicalParamCalculator';


export function RunoffPanel() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const input = PRESET_RUNOFF[selectedIdx];
  const result = useMemo(() => calcRunoffRestoration(input), [input]);

  const chartData = result.naturalRunoff.map(d => ({
    year: String(d.year),
    实测径流: d.measured,
    天然径流: d.natural,
    削减量: d.reduction,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_RUNOFF.map((r, i) => (
          <button key={i} onClick={() => setSelectedIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${selectedIdx === i ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="多年平均实测" value={result.avgMeasured} unit="亿m³" icon={Waves} accent="blue" />
        <StatCard title="多年平均天然" value={result.avgNatural} unit="亿m³" icon={Droplets} accent="emerald" />
        <StatCard title="年均削减量" value={result.avgReduction} unit="亿m³" icon={Calculator} accent="amber" />
        <StatCard title="削减率" value={result.reductionRate} unit="%" icon={BookOpen} accent="red" />
      </div>

      <LazyChartCard title="实测径流 vs 天然径流对比" height={300}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="径流对比" unit="亿m³" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="天然径流" name="天然径流" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="实测径流" name="实测径流" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar dataKey="削减量" name="削减量" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="逐年还原明细">
        <FilterableTechTable
          headers={['年份', '实测径流(亿m³)', '天然径流(亿m³)', '削减量(亿m³)']}
          rows={result.naturalRunoff.map(d => [String(d.year), String(d.measured), String(d.natural), String(d.reduction)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="人类活动影响评价" badge={result.impactLevel}>
        <p className="text-sm text-gw-text leading-relaxed">{result.note}</p>
      </TechCard>
    </div>
  );
}
