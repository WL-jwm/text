import { useState, useMemo, useCallback } from 'react';
import { TechCard } from '../UI';
import { BookOpen } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DrawdownHeatmap } from './sim-widgets';
import { TOOLTIP_STYLE } from './sim-constants';
import { PRESET_SCENARIOS, predictScenarios, type SimulationConfig, type PumpingWell } from '../../utils/numericalFlowSimulator';

export function ScenarioPanel({ config, wells }: { config: SimulationConfig; wells: PumpingWell[] }) {
  const [results, setResults] = useState<ReturnType<typeof predictScenarios> | null>(null);
  const [running, setRunning] = useState(false);

  const runScenarios = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const scenarios = PRESET_SCENARIOS.map(s => ({
        name: s.name,
        description: s.description,
        wells: wells.map(w => ({ ...w, rate: w.rate * s.wellMultiplier })),
        rechargeRate: config.aquifer.rechargeRate * s.rechargeMultiplier,
      }));
      const res = predictScenarios(config, scenarios);
      setResults(res);
      setRunning(false);
    }, 50);
  }, [config, wells]);

  const compareData = useMemo(() => {
    if (!results) return [];
    return results.map(r => ({
      name: r.scenarioName,
      maxDrawdown: Number(r.maxDrawdown.toFixed(2)),
      avgDrawdown: Number(r.avgDrawdown.toFixed(2)),
      drawdownArea: Number(r.drawdownArea.toFixed(1)),
      influenceRadius: Number(r.coneOfInfluence.toFixed(0)),
    }));
  }, [results]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-purple-400" />
            <h4 className="text-sm font-semibold text-gw-text">情景预测方案</h4>
          </div>
          <button
            onClick={runScenarios}
            disabled={running}
            className="px-4 py-1.5 text-xs bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50"
          >
            {running ? '计算中...' : '运行情景预测'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {PRESET_SCENARIOS.map(s => (
            <div key={s.name} className="p-2 bg-gw-surface rounded-lg border border-gw-border">
              <div className="text-xs font-medium text-gw-text">{s.name}</div>
              <div className="text-[10px] text-gw-muted mt-0.5">{s.description}</div>
            </div>
          ))}
        </div>
      </TechCard>

      {results && (
        <>
          <TechCard>
            <h4 className="text-sm font-semibold text-gw-text mb-3">方案对比 — 降深与影响范围</h4>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '降深 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '面积 (km²)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="maxDrawdown" name="最大降深" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="avgDrawdown" name="平均降深" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="drawdownArea" name="影响面积" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </TechCard>

          <div className="grid md:grid-cols-2 gap-4">
            {results.map((r, idx) => (
              <TechCard key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gw-text">{r.scenarioName}</h5>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    r.maxDrawdown > 10 ? 'bg-red-500/20 text-red-400' :
                    r.maxDrawdown > 5 ? 'bg-orange-500/20 text-orange-400' :
                    r.maxDrawdown > 1 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    最大降深 {r.maxDrawdown.toFixed(2)}m
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">平均降深</div>
                    <div className="text-sm font-bold text-amber-400">{r.avgDrawdown.toFixed(2)}m</div>
                  </div>
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">影响面积</div>
                    <div className="text-sm font-bold text-cyan-400">{r.drawdownArea.toFixed(1)}km²</div>
                  </div>
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">影响半径</div>
                    <div className="text-sm font-bold text-purple-400">{r.coneOfInfluence.toFixed(0)}m</div>
                  </div>
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">井间干扰</div>
                    <div className="text-sm font-bold text-blue-400">{r.wellInterference.toFixed(2)}m</div>
                  </div>
                </div>
                <DrawdownHeatmap drawdown={r.result.drawdown} rows={config.grid.rows} cols={config.grid.cols} />
              </TechCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
