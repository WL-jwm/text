/**
 * B-36 不确定性分析与敏感性诊断器 Tab
 *
 * 5大面板：
 *  1. Monte Carlo — 参数分布设置+输出统计+直方图+CDF+收敛曲线
 *  2. Sobol敏感性 — 一阶/总阶指数+二阶交互+参数贡献饼图
 *  3. Morris筛选 — 基本效应 mu, mu*, sigma + 参数排名 + 影响分类
 *  4. 局部敏感性 — OAT扰动+弹性系数+龙卷风图
 *  5. Bootstrap — 重采样置信区间+直方图
 */
import React, { useState, useMemo} from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend, PieChart, Pie,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import {
  Dice5, GitBranch, Filter, Wind, RefreshCw,
  Settings, AlertTriangle, BookOpen,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_MODELS, DISTRIBUTION_LABELS,
  runMonteCarlo, runSobolAnalysis, runMorrisScreening,
  runLocalSensitivity, runBootstrap,
  type UncertainParameter, type ModelFunction,
} from '../../utils/uncertaintyAnalyzer';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

const PIE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function NumInput({ label, value, onChange, unit, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gw-muted mb-0.5">{label}{unit ? ` (${unit})` : ''}</label>
      <input type="number" step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text focus:border-gw-blue focus:outline-none"
      />
    </div>
  );
}

// ── 面板1: Monte Carlo ──
function MonteCarloPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
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

// ── 面板2: Sobol ──
function SobolPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
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

// ── 面板3: Morris ──
function MorrisPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
  const [r, setR] = useState(10);
  const [result, setResult] = useState<ReturnType<typeof runMorrisScreening> | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const res = runMorrisScreening(parameters, model, r, 4, 42);
      setResult(res);
      setRunning(false);
    }, 50);
  };

  const scatterData = useMemo(() => {
    if (!result) return [];
    return result.elementaryEffects.map(ee => ({
      name: ee.parameter,
      muStar: ee.muStar,
      sigma: ee.sigma,
    }));
  }, [result]);

  const tableRows = useMemo(() => {
    if (!result) return [];
    return result.elementaryEffects.map(ee => {
      const rank = result.ranking.find(r => r.parameter === ee.parameter);
      return [
        ee.parameter,
        ee.mu.toFixed(4),
        ee.muStar.toFixed(4),
        ee.sigma.toFixed(4),
        rank?.influence === 'high' ? '高影响' : rank?.influence === 'medium' ? '中等影响' : '低影响',
      ];
    });
  }, [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-amber-400" />
            <h4 className="text-sm font-semibold text-gw-text">Morris筛选法</h4>
          </div>
          <div className="flex items-center gap-2">
            <NumInput label="轨迹数r" value={r} onChange={setR} step={5} />
            <button onClick={run} disabled={running}
              className="px-4 py-1.5 text-xs bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 mt-4">
              {running ? '计算中...' : '运行'}
            </button>
          </div>
        </div>
      </TechCard>

      {result && (
        <>
          <TechCard>
            <h5 className="text-xs font-medium text-gw-text mb-3">μ* vs σ 散点图（影响-交互诊断）</h5>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="muStar" name="μ*" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'μ*（影响大小）', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="sigma" name="σ" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'σ（非线性/交互）', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <ZAxis range={[80, 80]} />
                <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#f59e0b" />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-gw-muted mt-1">
              右上角：高影响+高交互 | 右下角：高影响+低交互(线性) | 左侧：低影响
            </div>
          </TechCard>

          <TechCard>
            <h5 className="text-xs font-medium text-gw-text mb-2">Morris基本效应统计</h5>
            <FilterableTechTable
              headers={['参数', 'μ（均值）', 'μ*（绝对均值）', 'σ（标准差）', '影响等级']}
              rows={tableRows}
            />
          </TechCard>
        </>
      )}
    </div>
  );
}

// ── 面板4: 局部敏感性 ──
function LocalSensitivityPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
  const [perturbation, setPerturbation] = useState(10);
  const result = useMemo(() => runLocalSensitivity(parameters, model, perturbation), [parameters, model, perturbation]);



  const tornadoChartData = useMemo(() => {
    const sorted = [...result].sort((a, b) => Math.abs(b.normalizedSensitivity) - Math.abs(a.normalizedSensitivity));
    return sorted.map(r => ({
      name: r.parameter,
      negative: -Math.abs(r.normalizedSensitivity),
      positive: Math.abs(r.normalizedSensitivity),
    }));
  }, [result]);

  const tableRows = useMemo(() =>
    result.map(r => [
      r.parameter,
      r.baseValue.toFixed(4),
      r.elasticity.toFixed(4),
      r.normalizedSensitivity.toFixed(4),
      r.perturbedOutputs.find(p => p.delta === 0.05)?.output.toFixed(4) ?? '-',
      r.perturbedOutputs.find(p => p.delta === -0.05)?.output.toFixed(4) ?? '-',
    ]),
  [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-gw-text">局部敏感性分析（OAT）</h4>
          </div>
          <NumInput label="扰动幅度" value={perturbation} onChange={setPerturbation} unit="%" step={5} />
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">敏感性龙卷风图</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tornadoChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="positive" name="正向敏感度" fill="#06b6d4" radius={[0, 3, 3, 0]} stackId="a" barSize={15} />
            <Bar dataKey="negative" name="负向敏感度" fill="#ef4444" radius={[3, 0, 0, 3]} stackId="a" barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">参数扰动响应曲线</h5>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" domain={[-0.5, 0.5]} tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '参数变化(%)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '输出变化(%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine x={0} stroke="#64748b" />
            {result.map((r, idx) => (
              <Line
                key={r.parameter}
                type="monotone"
                dataKey="delta"
                name={r.parameter}
                data={r.perturbedOutputs.map(p => ({ x: p.delta, [r.parameter]: p.delta }))}
                stroke={PIE_COLORS[idx % PIE_COLORS.length]}
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">局部敏感性明细</h5>
        <FilterableTechTable
          headers={['参数', '基值', '弹性系数', '归一化敏感度', '+5%输出', '-5%输出']}
          rows={tableRows}
        />
      </TechCard>
    </div>
  );
}

// ── 面板5: Bootstrap ──
function BootstrapPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
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

// ── 面板6: 参考说明 ──
function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="Monte Carlo方法" defaultOpen icon={Dice5}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">原理</strong>：对每个不确定参数按其概率分布进行随机采样，将采样值代入模型计算输出。重复大量次数后，输出的统计分布即为模型输出的不确定性。</p>
          <p><strong className="text-gw-text">采样方法</strong>：支持4种分布 — 正态分布(均值±标准差)、均匀分布(最小~最大)、对数正态(乘法效应)、三角分布(最小-众数-最大)。</p>
          <p><strong className="text-gw-text">收敛判断</strong>：通过运行均值和运行标准差的收敛曲线判断样本数是否充足。通常5000-10000次即可收敛。</p>
          <p><strong className="text-gw-text">置信区间</strong>：P2.5-P97.5为95%CI，P5-P95为90%CI。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Sobol敏感性分析" icon={GitBranch}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">一阶指数Si</strong>：单独由参数Xi引起的方差占总方差的比例。Si高表示该参数独立影响大。</p>
          <p><strong className="text-gw-text">总阶指数STi</strong>：包含参数Xi的所有效应（一阶+交互）。STi &gt; Si的差值即为该参数参与的交互效应。</p>
          <p><strong className="text-gw-text">Saltelli抽样</strong>：生成两个独立采样矩阵A和B，以及k个混合矩阵AB_i。共需N*(2k+2)次模型评估。</p>
          <p><strong className="text-gw-text">解读</strong>：一阶指数总和接近1 → 加性模型；远小于1 → 强交互效应。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Morris筛选法" icon={Filter}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">基本效应EE</strong>：在一条轨迹上只改变一个参数(Δ)，计算(Δy/Δx)。每条轨迹有k个EE。</p>
          <p><strong className="text-gw-text">μ*（绝对均值）</strong>：衡量参数的整体影响大小。μ*越大，参数越重要。</p>
          <p><strong className="text-gw-text">σ（标准差）</strong>：衡量参数的非线性或交互效应。σ大表示参数效应依赖其他参数取值。</p>
          <p><strong className="text-gw-text">优势</strong>：计算量远小于Sobol(O(k*r))，适合初步筛选大量参数。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Bootstrap方法" icon={RefreshCw}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">原理</strong>：从原始数据中有放回抽样B次（通常3000-5000次），每次计算统计量。B个统计量值的经验分布即为该统计量的抽样分布。</p>
          <p><strong className="text-gw-text">偏差</strong>：Bootstrap均值与原始估计的差。偏差过大时需使用偏差校正法。</p>
          <p><strong className="text-gw-text">置信区间</strong>：取Bootstrap分布的P2.5和P97.5作为95%CI，无需假设分布形式。</p>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="Saltelli et al. (2008) Global Sensitivity Analysis: The Primer | Morris (1991) Factorial Sampling Plans | Efron & Tibshirani (1993) An Introduction to the Bootstrap | Sobol (2001) Global sensitivity indices for nonlinear mathematical models" />
    </div>
  );
}

// ── 主组件 ──
export function UncertaintyAnalysisTab() {
  const [activePanel, setActivePanel] = useState<number>(0);
  const [modelId, setModelId] = useState<string>(PRESET_MODELS[0].id);

  const model = useMemo(() => PRESET_MODELS.find(m => m.id === modelId) ?? PRESET_MODELS[0], [modelId]);
  const parameters = model.parameters as unknown as UncertainParameter[];
  const modelFn = model as unknown as ModelFunction;

  const panels = [
    { key: 0, label: 'Monte Carlo', icon: Dice5 },
    { key: 1, label: 'Sobol敏感性', icon: GitBranch },
    { key: 2, label: 'Morris筛选', icon: Filter },
    { key: 3, label: '局部敏感性', icon: Wind },
    { key: 4, label: 'Bootstrap', icon: RefreshCw },
    { key: 5, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 模型选择 */}
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Settings size={16} className="text-gw-blue" />
          <h4 className="text-sm font-semibold text-gw-text">选择分析模型</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRESET_MODELS.map(m => (
            <button key={m.id} onClick={() => setModelId(m.id)}
              className={`p-2 rounded-lg text-left transition-all ${
                modelId === m.id
                  ? 'bg-gw-blue/20 border border-gw-blue/40 text-gw-highlight'
                  : 'bg-gw-surface border border-gw-border text-gw-muted hover:border-gw-blue/20'
              }`}
            >
              <div className="text-xs font-medium">{m.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{m.description}</div>
            </button>
          ))}
        </div>

        {/* 参数分布显示 */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">参数</th>
                <th className="text-center py-1 px-2">符号</th>
                <th className="text-center py-1 px-2">分布类型</th>
                <th className="text-center py-1 px-2">均值</th>
                <th className="text-center py-1 px-2">标准差</th>
                <th className="text-center py-1 px-2">范围</th>
                <th className="text-center py-1 px-2">单位</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {parameters.map((p, idx) => (
                <tr key={idx} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{p.name}</td>
                  <td className="py-1 px-2 text-center font-mono">{p.symbol}</td>
                  <td className="py-1 px-2 text-center">{DISTRIBUTION_LABELS[p.distribution]}</td>
                  <td className="py-1 px-2 text-center text-cyan-400">{p.mean}</td>
                  <td className="py-1 px-2 text-center text-amber-400">{p.stdDev}</td>
                  <td className="py-1 px-2 text-center text-[10px]">[{p.min}, {p.max}]</td>
                  <td className="py-1 px-2 text-center">{p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 0 && <MonteCarloPanel model={modelFn} parameters={parameters} />}
      {activePanel === 1 && <SobolPanel model={modelFn} parameters={parameters} />}
      {activePanel === 2 && <MorrisPanel model={modelFn} parameters={parameters} />}
      {activePanel === 3 && <LocalSensitivityPanel model={modelFn} parameters={parameters} />}
      {activePanel === 4 && <BootstrapPanel model={modelFn} parameters={parameters} />}
      {activePanel === 5 && <ReferencePanel />}
    </div>
  );
}
