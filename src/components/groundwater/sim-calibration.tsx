import { useState, useMemo, useCallback } from 'react';
import { TechCard } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { Settings, Crosshair } from 'lucide-react';
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { TOOLTIP_STYLE } from './sim-constants';
import { PRESET_OBSERVATION_POINTS, calibrateParameters, type SimulationConfig, type ObservationPoint, type CalibrationResult } from '../../utils/numericalFlowSimulator';

export function CalibrationPanel({ config, areaId }: { config: SimulationConfig; areaId: string }) {
  const [observations, setObservations] = useState<ObservationPoint[]>(
    PRESET_OBSERVATION_POINTS[areaId] ?? []
  );
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [running, setRunning] = useState(false);

  const runCalibration = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const res = calibrateParameters(config, observations, 30);
      setResult(res);
      setRunning(false);
    }, 50);
  }, [config, observations]);

  const scatterData = useMemo(() => {
    if (!result) return [];
    return result.observedVsComputed.map(oc => ({
      observed: oc.observed,
      computed: oc.computed,
      label: oc.label,
    }));
  }, [result]);

  const scatterRange = useMemo(() => {
    if (scatterData.length === 0) return { min: 0, max: 1 };
    const all = scatterData.flatMap(d => [d.observed, d.computed]);
    return { min: Math.min(...all) - 2, max: Math.max(...all) + 2 };
  }, [scatterData]);

  const obsTableRows = useMemo(() => {
    if (!result) return [];
    return result.observedVsComputed.map((oc, idx) => [
      oc.label ?? `观测点${idx + 1}`,
      oc.observed.toFixed(2),
      oc.computed.toFixed(2),
      oc.residual.toFixed(2),
      Math.abs(oc.residual) < 1 ? '优' : Math.abs(oc.residual) < 3 ? '良' : '差',
    ]);
  }, [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crosshair size={16} className="text-amber-400" />
            <h4 className="text-sm font-semibold text-gw-text">观测点设置</h4>
          </div>
          <button
            onClick={() => setObservations([...observations, { row: 5, col: 5, observedHead: 30, label: `观测点${observations.length + 1}` }])}
            className="px-2 py-1 text-[10px] bg-amber-500/15 text-amber-400 rounded border border-amber-500/30 hover:bg-amber-500/25"
          >
            + 添加观测点
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">标签</th>
                <th className="text-center py-1 px-2">行</th>
                <th className="text-center py-1 px-2">列</th>
                <th className="text-center py-1 px-2">观测水位 (m)</th>
                <th className="text-center py-1 px-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs, idx) => (
                <tr key={idx} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">
                    <input value={obs.label ?? ''} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, label: e.target.value }; setObservations(next);
                    }} className="w-full px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={obs.row} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, row: +e.target.value }; setObservations(next);
                    }} className="w-12 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={obs.col} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, col: +e.target.value }; setObservations(next);
                    }} className="w-12 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={obs.observedHead} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, observedHead: +e.target.value }; setObservations(next);
                    }} className="w-20 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" step={0.5} />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <button onClick={() => setObservations(observations.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 text-[10px]">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-gw-text">参数反演校准</h4>
            {result && (
              <span className={`text-[10px] px-2 py-0.5 rounded ${result.converged ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {result.converged ? '已收敛' : '未完全收敛'}
              </span>
            )}
          </div>
          <button
            onClick={runCalibration}
            disabled={running}
            className="px-4 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
          >
            {running ? '校准中...' : '运行校准'}
          </button>
        </div>

        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">校准Kx</div>
                <div className="text-sm font-bold text-cyan-400">{result.calibratedKx.toFixed(2)}</div>
                <div className="text-[9px] text-gw-muted">m/d</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">校准Ky</div>
                <div className="text-sm font-bold text-blue-400">{result.calibratedKy.toFixed(2)}</div>
                <div className="text-[9px] text-gw-muted">m/d</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">校准补给</div>
                <div className="text-sm font-bold text-green-400">{result.calibratedRecharge.toFixed(1)}</div>
                <div className="text-[9px] text-gw-muted">mm/a</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">RMSE</div>
                <div className={`text-sm font-bold ${result.rmse < 1 ? 'text-green-400' : result.rmse < 3 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.rmse.toFixed(3)}
                </div>
                <div className="text-[9px] text-gw-muted">m</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">R²</div>
                <div className={`text-sm font-bold ${result.rSquared > 0.9 ? 'text-green-400' : result.rSquared > 0.7 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.rSquared.toFixed(4)}
                </div>
                <div className="text-[9px] text-gw-muted">决定系数</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h5 className="text-xs font-medium text-gw-text mb-2">观测值 vs 计算值散点图</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      type="number"
                      dataKey="observed"
                      domain={[scatterRange.min, scatterRange.max]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      label={{ value: '观测水位 (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="computed"
                      domain={[scatterRange.min, scatterRange.max]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      label={{ value: '计算水位 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
                    <ReferenceLine
                      segment={[{ x: scatterRange.min, y: scatterRange.min }, { x: scatterRange.max, y: scatterRange.max }]}
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                    />
                    <Scatter data={scatterData} fill="#06b6d4" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h5 className="text-xs font-medium text-gw-text mb-2">残差分布</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={result.observedVsComputed.map((oc, idx) => ({ name: oc.label ?? `点${idx + 1}`, residual: oc.residual }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '残差 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Bar dataKey="residual" radius={[2, 2, 0, 0]}>
                      {result.observedVsComputed.map((oc, idx) => (
                        <Cell key={idx} fill={Math.abs(oc.residual) < 1 ? '#10b981' : Math.abs(oc.residual) < 3 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {obsTableRows.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-medium text-gw-text mb-2">观测点校准结果明细</h5>
                <FilterableTechTable
                  headers={['观测点', '观测值(m)', '计算值(m)', '残差(m)', '评级']}
                  rows={obsTableRows}
                />
              </div>
            )}
          </>
        )}
      </TechCard>
    </div>
  );
}
