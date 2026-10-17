/**
 * 拆分自 UncertaintyAnalysisTab.tsx
 */
import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GitBranch } from 'lucide-react';
import { TechCard } from '../../UI';
import { runSobolAnalysis, type ModelFunction, type UncertainParameter } from '../../../utils/uncertaintyAnalyzer';
import { NumInput } from './NumInput';
import { PIE_COLORS, TOOLTIP_STYLE } from './uncertaintyConstants';

export function SobolPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
  const [N, setN] = useState(500);
  const [result, setResult] = useState<ReturnType<typeof runSobolAnalysis> | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runSobolAnalysis(parameters, model, N, 42);
      setResult(r);
      setRunning(false);
    }, 50);
  };

  const compareData = useMemo(() => {
    if (!result) return [];
    return result.firstOrder.map((f, idx) => ({
      name: f.parameter,
      firstOrder: Number((f.index * 100).toFixed(2)),
      totalOrder: Number((result.totalOrder[idx].index * 100).toFixed(2)),
    }));
  }, [result]);

  const pieData = useMemo(() => {
    if (!result) return [];
    return result.firstOrder.map((f, idx) => ({
      name: f.parameter,
      value: Number((Math.max(0, f.index) * 100).toFixed(2)),
      interaction: Number((Math.max(0, result.totalOrder[idx].index - f.index) * 100).toFixed(2)),
    }));
  }, [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-purple-400" />
            <h4 className="text-sm font-semibold text-gw-text">Sobol全局敏感性分析</h4>
          </div>
          <div className="flex items-center gap-2">
            <NumInput label="基础样本N" value={N} onChange={setN} step={100} />
            <button onClick={run} disabled={running}
              className="px-4 py-1.5 text-xs bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50 mt-4">
              {running ? '计算中...' : '运行'}
            </button>
          </div>
        </div>
        {result && (
          <div className="mt-3 p-2 bg-gw-surface rounded text-xs text-gw-muted">{result.explanation}</div>
        )}
      </TechCard>

      {result && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <TechCard>
              <h5 className="text-xs font-medium text-gw-text mb-3">一阶 vs 总阶Sobol指数</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '指数(%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="firstOrder" name="一阶Si" fill="#06b6d4" radius={[3, 3, 0, 0]} barSize={20} />
                  <Bar dataKey="totalOrder" name="总阶STi" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </TechCard>

            <TechCard>
              <h5 className="text-xs font-medium text-gw-text mb-3">方差贡献分解</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 10 }}>
                    {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-[10px] text-gw-muted mt-1">显示各参数一阶方差贡献占比</div>
            </TechCard>
          </div>

          {result.secondOrder.length > 0 && (
            <TechCard>
              <h5 className="text-xs font-medium text-gw-text mb-3">二阶交互效应（Top 10）</h5>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.secondOrder.map(s => ({ name: `${s.paramA} × ${s.paramB}`, index: Number((s.index * 100).toFixed(2)) }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 8 }} width={150} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="index" fill="#ec4899" radius={[0, 3, 3, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </TechCard>
          )}
        </>
      )}
    </div>
  );
}
