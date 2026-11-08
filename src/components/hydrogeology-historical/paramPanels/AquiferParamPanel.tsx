/**
 * 拆分自 HistoricalParamCalculatorTab.tsx — 参数反演面板
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, Droplets, Waves, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_AQUIFERS, calcAquiferParams, calcAllAquifers } from '../../../utils/historicalParamCalculator';


export function AquiferParamPanel() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const input = PRESET_AQUIFERS[selectedIdx];
  const result = useMemo(() => calcAquiferParams(input), [input]);
  const allResults = useMemo(() => calcAllAquifers(), []);

  const methodCompareData = [
    { method: 'Dupuit法', K: result.dupuit.K, T: result.dupuit.T },
    { method: 'Theis恢复法', K: result.theis.K, T: result.theis.T },
    { method: '经验法', K: result.empirical.K, T: result.empirical.T },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_AQUIFERS.map((a, i) => (
          <button key={i} onClick={() => setSelectedIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${selectedIdx === i ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {a.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="推荐K值" value={result.recommendedK} unit="m/d" icon={Calculator} accent="blue" />
        <StatCard title="推荐T值" value={result.recommendedT} unit="m²/d" icon={Waves} accent="cyan" />
        <StatCard title="Theis-S值" value={result.theis.S} unit="" icon={Droplets} accent="amber" />
        <StatCard title="出水率" value={result.empirical.yieldRate} unit="m³/(h·m)" icon={BookOpen} accent="emerald" />
      </div>

      <LazyChartCard title="三种方法K/T值对比" height={280}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={methodCompareData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="method" stroke="#64748b" fontSize={10} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} label={{ value: 'K(m/d)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} label={{ value: 'T(m²/d)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="参数对比" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="K" name="渗透系数K(m/d)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="T" name="导水系数T(m²/d)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {methodCompareData.map((m, i) => {
          const detail = [result.dupuit, result.theis, result.empirical][i];
          return (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="text-xs font-semibold text-gw-text">{m.method}</div>
              <div className="text-sm font-mono text-gw-highlight mt-1">K={m.K} m/d, T={m.T} m²/d</div>
              <div className="text-[10px] text-gw-muted mt-1">{detail.method}</div>
            </div>
          );
        })}
      </div>

      <TechCard title="综合评价" icon={BookOpen}>
        <p className="text-sm text-gw-text leading-relaxed">{result.note}</p>
      </TechCard>

      <TechCard title="各监测点参数汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={allResults.map(r => ({
            监测点: r.name,
            Dupuit_K: r.dupuit.K, Dupuit_T: r.dupuit.T,
            Theis_K: r.theis.K, Theis_T: r.theis.T, Theis_S: r.theis.S,
            经验_K: r.empirical.K, 经验_T: r.empirical.T, 出水率: r.empirical.yieldRate,
            推荐K: r.recommendedK, 推荐T: r.recommendedT,
          }))} filename="aquifer-params" sheetName="含水层参数" formats={['xlsx', 'csv', 'json']} label="导出参数表" />
        </div>
        <FilterableTechTable
          headers={['监测点', 'Dupuit-K', 'Theis-K', 'Theis-S', '经验-K', '出水率', '推荐K', '推荐T']}
          rows={allResults.map(r => [
            r.name, String(r.dupuit.K), String(r.theis.K), String(r.theis.S),
            String(r.empirical.K), String(r.empirical.yieldRate),
            String(r.recommendedK), String(r.recommendedT),
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
