/**
 * 拆分自 UncertaintyAnalysisTab.tsx
 */
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Dice5 } from 'lucide-react';
import { TechCard } from '../../UI';
import { runMonteCarlo, type ModelFunction, type UncertainParameter } from '../../../utils/uncertaintyAnalyzer';
import { NumInput } from './NumInput';
import { TOOLTIP_STYLE } from './uncertaintyConstants';

export function MonteCarloPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
  const [sampleSize, setSampleSize] = useState(5000);
  const [result, setResult] = useState<ReturnType<typeof runMonteCarlo> | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runMonteCarlo(parameters, model, sampleSize, 42);
      setResult(r);
      setRunning(false);
    }, 50);
  };



  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dice5 size={16} className="text-cyan-400" />
            <h4 className="text-sm font-semibold text-gw-text">Monte Carlo模拟</h4>
          </div>
          <div className="flex items-center gap-2">
            <NumInput label="样本数" value={sampleSize} onChange={setSampleSize} step={1000} />
            <button onClick={run} disabled={running}
              className="px-4 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 mt-4">
              {running ? '模拟中...' : '运行'}
            </button>
          </div>
        </div>
      </TechCard>

      {result && (
        <>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">均值</div>
              <div className="text-sm font-bold text-cyan-400">{result.statistics.mean}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">标准差</div>
              <div className="text-sm font-bold text-amber-400">{result.statistics.stdDev}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">变异系数</div>
              <div className="text-sm font-bold text-purple-400">{result.statistics.coefficientOfVariation}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">偏度</div>
              <div className="text-sm font-bold text-gw-text">{result.statistics.skewness}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">95%CI下限</div>
              <div className="text-sm font-bold text-green-400">{result.confidenceInterval95.lower}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">95%CI上限</div>
              <div className="text-sm font-bold text-red-400">{result.confidenceInterval95.upper}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TechCard>
              <h5 className="text-xs font-medium text-gw-text mb-3">输出概率分布直方图</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.histogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="binStart" tick={{ fill: '#94a3b8', fontSize: 9 }} label={{ value: '输出值', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '频率', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="frequency" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TechCard>

            <TechCard>
              <h5 className="text-xs font-medium text-gw-text mb-3">累积分布函数(CDF)</h5>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={result.cdf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="value" tick={{ fill: '#94a3b8', fontSize: 9 }} label={{ value: '输出值', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '累积概率', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <ReferenceLine y={0.5} stroke="#64748b" strokeDasharray="3 3" />
                  <ReferenceLine y={0.95} stroke="#ef4444" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </TechCard>
          </div>

          <TechCard>
            <h5 className="text-xs font-medium text-gw-text mb-3">收敛诊断</h5>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={result.convergenceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="sampleSize" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '样本数', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="runningMean" name="运行均值" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="runningStd" name="运行标准差" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </TechCard>
        </>
      )}
    </div>
  );
}
