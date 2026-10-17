/**
 * 拆分自 UncertaintyAnalysisTab.tsx
 */
import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { TechCard } from '../../UI';
import { runBootstrap, runMonteCarlo, type ModelFunction, type UncertainParameter } from '../../../utils/uncertaintyAnalyzer';
import { NumInput } from './NumInput';
import { TOOLTIP_STYLE } from './uncertaintyConstants';

export function BootstrapPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
  const [iterations, setIterations] = useState(3000);
  const [statistic, setStatistic] = useState<'mean' | 'median' | 'std' | 'percentile_95'>('mean');
  const [result, setResult] = useState<ReturnType<typeof runBootstrap> | null>(null);
  const [running, setRunning] = useState(false);

  const mcResult = useMemo(() => runMonteCarlo(parameters, model, 1000, 42), [parameters, model]);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runBootstrap(mcResult.output, statistic, iterations, 42);
      setResult(r);
      setRunning(false);
    }, 50);
  };

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-green-400" />
            <h4 className="text-sm font-semibold text-gw-text">Bootstrap重采样置信区间</h4>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <label className="block text-[10px] text-gw-muted mb-0.5">统计量</label>
              <select value={statistic} onChange={e => setStatistic(e.target.value as typeof statistic)}
                className="px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text">
                <option value="mean">均值</option>
                <option value="median">中位数</option>
                <option value="std">标准差</option>
                <option value="percentile_95">P95</option>
              </select>
            </div>
            <NumInput label="迭代次数" value={iterations} onChange={setIterations} step={500} />
            <button onClick={run} disabled={running}
              className="px-4 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50 mt-4">
              {running ? '重采样中...' : '运行'}
            </button>
          </div>
        </div>
      </TechCard>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">原始估计</div>
              <div className="text-sm font-bold text-cyan-400">{result.originalEstimate}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">Bootstrap均值</div>
              <div className="text-sm font-bold text-green-400">{result.bootstrapMean}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">Bootstrap标准差</div>
              <div className="text-sm font-bold text-amber-400">{result.bootstrapStd}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">偏差</div>
              <div className="text-sm font-bold text-purple-400">{result.bias}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">迭代次数</div>
              <div className="text-sm font-bold text-gw-text">{result.iterations}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TechCard>
              <h5 className="text-xs font-medium text-gw-text mb-3">Bootstrap分布直方图</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.histogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="binStart" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <ReferenceLine x={result.originalEstimate.toString()} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: '原始', fill: '#06b6d4', fontSize: 9 }} />
                </BarChart>
              </ResponsiveContainer>
            </TechCard>

            <TechCard>
              <h5 className="text-xs font-medium text-gw-text mb-3">置信区间对比</h5>
              <div className="space-y-3">
                <div className="p-3 bg-gw-surface rounded-lg">
                  <div className="text-[10px] text-gw-muted mb-1">95%置信区间</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-400">{result.ci95.lower}</span>
                    <span className="text-[10px] text-gw-muted">—</span>
                    <span className="text-sm font-bold text-red-400">{result.ci95.upper}</span>
                  </div>
                  <div className="mt-2 h-2 bg-gw-border rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="p-3 bg-gw-surface rounded-lg">
                  <div className="text-[10px] text-gw-muted mb-1">90%置信区间</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-400">{result.ci90.lower}</span>
                    <span className="text-[10px] text-gw-muted">—</span>
                    <span className="text-sm font-bold text-red-400">{result.ci90.upper}</span>
                  </div>
                  <div className="mt-2 h-2 bg-gw-border rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{ width: '90%' }} />
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="text-[10px] text-amber-400 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    偏差 {result.bias > 0 ? '> 0（高估）' : '< 0（低估）'}
                  </div>
                  <div className="text-[10px] text-gw-muted mt-1">
                    {Math.abs(result.bias) < result.bootstrapStd * 0.1
                      ? '偏差较小，Bootstrap估计可靠'
                      : '偏差较大，建议增加迭代次数或使用偏差校正法'}
                  </div>
                </div>
              </div>
            </TechCard>
          </div>
        </>
      )}
    </div>
  );
}
