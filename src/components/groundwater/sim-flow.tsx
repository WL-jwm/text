import { useState, useMemo, useCallback } from 'react';
import { TechCard } from '../UI';
import { Play, Activity, Waves, Gauge, ArrowRight, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HeadHeatmap, DrawdownHeatmap } from './sim-widgets';
import { TOOLTIP_STYLE } from './sim-constants';
import { solveSteadyFlow, solveTransientFlow, calcDrawdownStats, calcVelocityStats, type SimulationConfig, type SimulationResult, type PumpingWell } from '../../utils/numericalFlowSimulator';

export function FlowSimulationPanel({ config, wells }: { config: SimulationConfig; wells: PumpingWell[] }) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  const runSimulation = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const simConfig = { ...config, wells };
      const res = config.isTransient ? solveTransientFlow(simConfig) : solveSteadyFlow(simConfig);
      setResult(res);
      setRunning(false);
    }, 50);
  }, [config, wells]);

  const drawdownStats = useMemo(() => {
    if (!result) return null;
    return calcDrawdownStats(result.drawdown, config.grid.rows, config.grid.cols);
  }, [result, config.grid]);

  const velocityStats = useMemo(() => {
    if (!result) return null;
    return calcVelocityStats(result.velocity, config.grid.rows, config.grid.cols);
  }, [result, config.grid]);

  const budgetData = useMemo(() => {
    if (!result) return [];
    return [
      { name: '补给量', value: Number(result.totalRecharge.toFixed(1)), color: '#10b981' },
      { name: '边界流入', value: Number((result.budgetIn - result.totalRecharge).toFixed(1)), color: '#06b6d4' },
      { name: '开采量', value: -Number(result.totalPumping.toFixed(1)), color: '#ef4444' },
      { name: '边界流出', value: -Number((result.budgetOut - result.totalPumping).toFixed(1)), color: '#f59e0b' },
    ];
  }, [result]);

  const timeSeriesData = useMemo(() => {
    if (!result?.timeSeries || result.timeSeries.length === 0) return [];
    const centerRow = Math.floor(config.grid.rows / 2);
    const centerCol = Math.floor(config.grid.cols / 2);
    return result.timeSeries.map((step, idx) => ({
      step: idx + 1,
      head: step[centerRow][centerCol],
    }));
  }, [result, config.grid]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-green-400" />
            <h4 className="text-sm font-semibold text-gw-text">
              {config.isTransient ? '非稳定流模拟' : '稳定流模拟'}
            </h4>
            {result && (
              <span className={`text-[10px] px-2 py-0.5 rounded ${result.converged ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {result.converged ? '已收敛' : '未收敛'}
              </span>
            )}
          </div>
          <button
            onClick={runSimulation}
            disabled={running}
            className="px-4 py-1.5 text-xs bg-gw-blue/20 text-gw-highlight rounded-lg border border-gw-blue/30 hover:bg-gw-blue/30 disabled:opacity-50"
          >
            {running ? '计算中...' : '运行模拟'}
          </button>
        </div>
        {result && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">迭代次数</div>
              <div className="text-sm font-bold text-gw-text">{result.iterations}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">总开采量</div>
              <div className="text-sm font-bold text-blue-400">{result.totalPumping.toFixed(0)}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">总补给量</div>
              <div className="text-sm font-bold text-green-400">{result.totalRecharge.toFixed(0)}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">平衡误差</div>
              <div className="text-sm font-bold text-gw-text">{result.massBalanceError.toFixed(2)}%</div>
            </div>
            {drawdownStats && (
              <>
                <div className="text-center p-2 bg-gw-surface rounded">
                  <div className="text-[10px] text-gw-muted">最大降深</div>
                  <div className="text-sm font-bold text-orange-400">{drawdownStats.maxDrawdown.toFixed(2)}m</div>
                </div>
                <div className="text-center p-2 bg-gw-surface rounded">
                  <div className="text-[10px] text-gw-muted">平均降深</div>
                  <div className="text-sm font-bold text-amber-400">{drawdownStats.avgDrawdown.toFixed(2)}m</div>
                </div>
              </>
            )}
          </div>
        )}
      </TechCard>

      {result && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <Waves size={16} className="text-cyan-400" />
                <h4 className="text-sm font-semibold text-gw-text">水头分布热力图</h4>
              </div>
              <HeadHeatmap result={result} rows={config.grid.rows} cols={config.grid.cols} />
              <div className="mt-2 text-[10px] text-gw-muted">
                网格 {config.grid.rows}x{config.grid.cols}，间距 {config.grid.cellSize}m，总面积 {(config.grid.rows * config.grid.cols * config.grid.cellSize * config.grid.cellSize / 1_000_000).toFixed(1)} km²
              </div>
            </TechCard>

            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-orange-400" />
                <h4 className="text-sm font-semibold text-gw-text">降深分布图</h4>
              </div>
              <DrawdownHeatmap drawdown={result.drawdown} rows={config.grid.rows} cols={config.grid.cols} />
              {drawdownStats && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center text-[10px]">
                    <span className="text-blue-400">{drawdownStats.above1mPercent.toFixed(1)}%</span>
                    <span className="text-gw-muted"> &gt;1m</span>
                  </div>
                  <div className="text-center text-[10px]">
                    <span className="text-amber-400">{drawdownStats.above5mPercent.toFixed(1)}%</span>
                    <span className="text-gw-muted"> &gt;5m</span>
                  </div>
                  <div className="text-center text-[10px]">
                    <span className="text-red-400">{drawdownStats.above10mPercent.toFixed(1)}%</span>
                    <span className="text-gw-muted"> &gt;10m</span>
                  </div>
                </div>
              )}
            </TechCard>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-green-400" />
                <h4 className="text-sm font-semibold text-gw-text">水量平衡</h4>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {budgetData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="text-[10px] text-gw-muted mt-1">正值为流入，负值为流出 (m³/d)</div>
            </TechCard>

            {timeSeriesData.length > 0 && (
              <TechCard>
                <div className="flex items-center gap-2 mb-3">
                  <Gauge size={16} className="text-purple-400" />
                  <h4 className="text-sm font-semibold text-gw-text">中心点水位变化（非稳定流）</h4>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="step" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间步', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '水头 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="head" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TechCard>
            )}
          </div>

          {velocityStats && (
            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight size={16} className="text-cyan-400" />
                <h4 className="text-sm font-semibold text-gw-text">达西流速统计</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gw-surface rounded-lg">
                  <div className="text-[10px] text-gw-muted">最大流速</div>
                  <div className="text-lg font-bold text-cyan-400">{velocityStats.maxVelocity.toFixed(4)}</div>
                  <div className="text-[10px] text-gw-muted">m/d</div>
                </div>
                <div className="p-3 bg-gw-surface rounded-lg">
                  <div className="text-[10px] text-gw-muted">平均流速</div>
                  <div className="text-lg font-bold text-blue-400">{velocityStats.avgVelocity.toFixed(4)}</div>
                  <div className="text-[10px] text-gw-muted">m/d</div>
                </div>
              </div>
            </TechCard>
          )}
        </>
      )}
    </div>
  );
}
