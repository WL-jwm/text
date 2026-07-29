/**
 * B-29 地下水空间统计分析器 Tab
 *
 * 4大面板：
 *  1. Moran's I — 全局空间自相关+LISA局部热点/冷点
 *  2. 半变异函数 — 实验+理论模型拟合(球状/指数/高斯)
 *  3. 交叉验证 — 克里金插值精度评估(留一法)
 *  4. 参考 — 空间统计方法与判据说明
 */
import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Legend, ZAxis,
} from 'recharts';
import { Globe, TrendingUp, Calculator, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_REGIONS,
  calcMoranI, calcLocalMoran, calcVariogram, calcCrossValidation,
} from '../../utils/spatialStatsCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const PATTERN_COLORS: Record<string, string> = {
  '聚集': '#ef4444', '随机': '#64748b', '离散': '#06b6d4',
};

const QUADRANT_COLORS: Record<string, string> = {
  'HH（高-高聚集）': '#ef4444',
  'LL（低-低聚集）': '#06b6d4',
  'HL（高-低异常）': '#f59e0b',
  'LH（低-高异常）': '#8b5cf6',
};

// ── 面板1: Moran's I ──

function MoranIPanel() {
  const [regionIdx, setRegionIdx] = useState(0);
  const [weightType, setWeightType] = useState<'inverse' | 'distance' | 'binary'>('inverse');
  const [distanceBand, setDistanceBand] = useState(50);

  const region = PRESET_REGIONS[regionIdx];
  const moranInput = { points: region.points, weightType, distanceBand };
  const globalResult = useMemo(() => calcMoranI(moranInput), [regionIdx, weightType, distanceBand]);
  const localResults = useMemo(() => calcLocalMoran(moranInput), [regionIdx, weightType, distanceBand]);

  const scatterData = localResults.map(r => ({
    name: r.name,
    x: r.x,
    y: r.y,
    value: r.value,
    localI: r.localI,
    z: Math.abs(r.zScore),
    quadrant: r.quadrant,
    color: QUADRANT_COLORS[r.quadrant] ?? '#64748b',
  }));

  const quadrantCounts: Record<string, number> = {};
  localResults.forEach(r => {
    const key = r.quadrant.split('（')[0];
    quadrantCounts[key] = (quadrantCounts[key] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 items-center">
        {PRESET_REGIONS.map((r, i) => (
          <button key={i} onClick={() => setRegionIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${regionIdx === i ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name}
          </button>
        ))}
        <select value={weightType} onChange={e => setWeightType(e.target.value as 'inverse' | 'distance' | 'binary')}
          className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text ml-2">
          <option value="inverse">反距离权重</option>
          <option value="distance">反距离平方权重</option>
          <option value="binary">二值邻接权重</option>
        </select>
        {weightType === 'binary' && (
          <input type="number" value={distanceBand} onChange={e => setDistanceBand(parseFloat(e.target.value) || 50)}
            className="w-16 px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text font-mono" />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Moran's I" value={globalResult.moranI} unit="" icon={Globe} accent="blue" />
        <StatCard title="Z得分" value={globalResult.zScore} unit="" icon={TrendingUp} accent="cyan" />
        <StatCard title="p值" value={globalResult.pValue} unit="" icon={Calculator} accent="amber" />
        <StatCard title="分布模式" value={globalResult.pattern} unit="" icon={BookOpen} accent={globalResult.pattern === '聚集' ? 'red' : globalResult.pattern === '离散' ? 'cyan' : 'blue'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="全局Moran's I 检验结果" badge={globalResult.significant ? '显著' : '不显著'}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">观测I值: </span>
              <span className="font-mono text-gw-highlight">{globalResult.moranI}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">期望E[I]: </span>
              <span className="font-mono text-gw-text">{globalResult.expectedI}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">方差: </span>
              <span className="font-mono text-gw-text">{globalResult.variance}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">模式: </span>
              <span className="font-mono" style={{ color: PATTERN_COLORS[globalResult.pattern] ?? '#64748b' }}>{globalResult.pattern}</span>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">{globalResult.note}</p>
        </TechCard>

        <TechCard title="LISA象限分布" badge="局部空间自相关">
          <div className="grid grid-cols-2 gap-2">
            {(['HH', 'LL', 'HL', 'LH'] as const).map(q => {
              const count = quadrantCounts[q] || 0;
              const fullKey = Object.keys(QUADRANT_COLORS).find(k => k.startsWith(q));
              return (
                <div key={q} className="p-2 bg-gw-surface/50 rounded text-center">
                  <div className="text-[10px] text-gw-muted">{q}</div>
                  <div className="text-lg font-mono" style={{ color: QUADRANT_COLORS[fullKey ?? ''] ?? '#64748b' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </TechCard>
      </div>

      <LazyChartCard title="LISA空间分布（气泡大小=|Z|，颜色=象限）" height={320}>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis type="number" dataKey="x" name="经度" stroke="#64748b" fontSize={10} />
            <YAxis type="number" dataKey="y" name="纬度" stroke="#64748b" fontSize={10} />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Scatter data={scatterData}>
              {scatterData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="局部Moran's I 明细">
        <FilterableTechTable
          headers={['点名称', '局部I', 'Z得分', '象限', '显著', '值']}
          rows={localResults.map(r => [
            r.name, String(r.localI), String(r.zScore),
            r.quadrant, r.significant ? '是' : '否', String(r.value),
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板2: 半变异函数 ──

function VariogramPanel() {
  const [regionIdx, setRegionIdx] = useState(0);
  const [model, setModel] = useState<'spherical' | 'exponential' | 'gaussian'>('spherical');
  const [lagCount, setLagCount] = useState(8);

  const region = PRESET_REGIONS[regionIdx];
  const result = useMemo(() => calcVariogram({ points: region.points, model, lagCount }), [regionIdx, model, lagCount]);

  const chartData = result.experimental.map(e => ({
    lag: e.lag,
    实验值: e.gamma,
    pairs: e.pairs,
  }));

  const theoreticalData = result.theoretical.map(t => ({
    lag: t.lag,
    理论值: t.gamma,
  }));

  // 合并图表数据
  const combinedData = [...chartData.map(d => ({ lag: d.lag, 实验值: d.实验值, 理论值: null as number | null })),
    ...theoreticalData.map(d => ({ lag: d.lag, 实验值: null as number | null, 理论值: d.理论值 }))]
    .sort((a, b) => a.lag - b.lag);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 items-center">
        {PRESET_REGIONS.map((r, i) => (
          <button key={i} onClick={() => setRegionIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${regionIdx === i ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name}
          </button>
        ))}
        <select value={model} onChange={e => setModel(e.target.value as 'spherical' | 'exponential' | 'gaussian')}
          className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text ml-2">
          <option value="spherical">球状模型</option>
          <option value="exponential">指数模型</option>
          <option value="gaussian">高斯模型</option>
        </select>
        <input type="number" value={lagCount} onChange={e => setLagCount(parseInt(e.target.value) || 8)} min={4} max={15}
          className="w-16 px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text font-mono" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="块金值C0" value={result.nugget} unit="" icon={Calculator} accent="amber" />
        <StatCard title="基台值" value={result.sill} unit="" icon={TrendingUp} accent="blue" />
        <StatCard title="变程a" value={result.range} unit="km" icon={Globe} accent="cyan" />
        <StatCard title="块金比" value={result.nuggetRatio} unit="" icon={BookOpen} accent={result.nuggetRatio < 0.25 ? 'emerald' : result.nuggetRatio < 0.5 ? 'amber' : 'red'} />
      </div>

      <LazyChartCard title={`半变异函数拟合（${result.model}）`} height={320}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="lag" stroke="#64748b" fontSize={10} label={{ value: '滞后距离(km)', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'γ(h)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="半变异函数" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line dataKey="实验值" name="实验半变异" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
            <Line dataKey="理论值" name="理论模型" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls />
            <ReferenceLine y={result.sill} stroke="#10b981" strokeDasharray="3 3" label={{ value: '基台', fill: '#10b981', fontSize: 10 }} />
          </LineChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="模型参数" badge={result.model}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">块金C0: </span>
              <span className="font-mono text-gw-highlight">{result.nugget}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">结构方差C: </span>
              <span className="font-mono text-gw-text">{result.structureVariance}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">基台C0+C: </span>
              <span className="font-mono text-gw-text">{result.sill}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">变程a: </span>
              <span className="font-mono text-gw-cyan">{result.range} km</span>
            </div>
          </div>
          <div className="mt-2 p-2 bg-gw-surface/50 rounded">
            <span className="text-[10px] text-gw-muted">空间自相关强度: </span>
            <span className="text-xs font-semibold text-gw-highlight">{result.spatialCorrelation}</span>
          </div>
        </TechCard>

        <TechCard title="评价说明" icon={BookOpen}>
          <p className="text-[10px] text-gw-muted leading-relaxed">{result.note}</p>
        </TechCard>
      </div>

      <TechCard title="实验半变异函数数据">
        <FilterableTechTable
          headers={['滞后距离(km)', 'γ(h)', '点对数']}
          rows={result.experimental.map(e => [String(e.lag), String(e.gamma), String(e.pairs)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板3: 交叉验证 ──

function CrossValidationPanel() {
  const [regionIdx, setRegionIdx] = useState(0);
  const region = PRESET_REGIONS[regionIdx];
  const result = useMemo(() => calcCrossValidation(region.points), [regionIdx]);

  const scatterData = result.points.map(p => ({
    name: p.name,
    actual: p.actual,
    predicted: p.predicted,
    error: p.error,
  }));

  const minVal = Math.min(...result.points.map(p => p.actual), ...result.points.map(p => p.predicted));
  const maxVal = Math.max(...result.points.map(p => p.actual), ...result.points.map(p => p.predicted));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_REGIONS.map((r, i) => (
          <button key={i} onClick={() => setRegionIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${regionIdx === i ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="ME(平均误差)" value={result.me} unit="" icon={Calculator} accent="blue" />
        <StatCard title="RMSE" value={result.rmse} unit="" icon={TrendingUp} accent="amber" />
        <StatCard title="MAE" value={result.mae} unit="" icon={Globe} accent="cyan" />
        <StatCard title="精度等级" value={result.accuracy} unit="" icon={BookOpen} accent={result.accuracy === '优' ? 'emerald' : result.accuracy === '良' ? 'cyan' : result.accuracy === '合格' ? 'amber' : 'red'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="实测 vs 预测散点图（1:1线）" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="actual" name="实测值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <YAxis type="number" dataKey="predicted" name="预测值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4" />
              <ReferenceLine segment={[{ x: minVal - 1, y: minVal - 1 }, { x: maxVal + 1, y: maxVal + 1 }]} stroke="#10b981" strokeDasharray="5 5" label={{ value: '1:1', fill: '#10b981', fontSize: 10 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各点误差分布" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: '误差', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="误差" />} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="error" name="误差" radius={[2, 2, 0, 0]}>
                {scatterData.map((d, i) => <Cell key={i} fill={d.error >= 0 ? '#06b6d4' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="交叉验证明细">
        <FilterableTechTable
          headers={['点名称', '实测值', '预测值', '误差', '标准化误差']}
          rows={result.points.map(p => [p.name, String(p.actual), String(p.predicted), String(p.error), String(p.stdError)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="精度评价" badge={result.accuracy} icon={BookOpen}>
        <p className="text-sm text-gw-text leading-relaxed">{result.note}</p>
      </TechCard>
    </div>
  );
}

// ── 面板4: 参考说明 ──

function ReferencePanel() {
  return (
    <div className="space-y-4">
      <TechCard title="Moran's I 方法说明" badge="全局空间自相关">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">计算公式</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">I = (n/S₀) × ΣᵢΣⱼ wᵢⱼ(xᵢ-x̄)(xⱼ-x̄) / Σᵢ(xᵢ-x̄)²</div>
            <div className="text-[10px] text-gw-muted mt-1">
              n为样本数，S₀=ΣᵢΣⱼwᵢⱼ为权重矩阵之和，x̄为均值。E[I]=-1/(n-1)为期望值。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">结果判读</div>
            <div className="text-[10px] text-gw-muted mt-1">
              I &gt; E[I] 且 Z &gt; 1.96：空间聚集（高值或低值聚集）<br/>
              I ≈ E[I]：空间随机分布<br/>
              I &lt; E[I] 且 Z &lt; -1.96：空间离散（高低值交替）
            </div>
          </div>
        </div>
      </TechCard>

      <TechCard title="LISA 局部空间自相关" badge="热点/冷点">
        <div className="grid grid-cols-2 gap-2">
          {[
            { q: 'HH', color: '#ef4444', desc: '高值被高值包围，热点区域' },
            { q: 'LL', color: '#06b6d4', desc: '低值被低值包围，冷点区域' },
            { q: 'HL', color: '#f59e0b', desc: '高值被低值包围，空间异常' },
            { q: 'LH', color: '#8b5cf6', desc: '低值被高值包围，空间异常' },
          ].map(g => (
            <div key={g.q} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.q}</div>
              <div className="text-[10px] text-gw-muted mt-1">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="半变异函数模型" badge="3种理论模型">
        <FilterableTechTable
          headers={['模型', '公式', '特点', '适用场景']}
          rows={[
            ['球状模型', 'γ(h)=C₀+C×[1.5(h/a)-0.5(h/a)³]', '变程处达到基台', '最常用，适用于大多数地质数据'],
            ['指数模型', 'γ(h)=C₀+C×[1-exp(-3h/a)]', '渐近逼近基台', '连续变化的空间变量'],
            ['高斯模型', 'γ(h)=C₀+C×[1-exp(-3h²/a²)]', '原点处抛物线', '变化平缓的空间变量'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="块金效应评价" badge="空间自相关强度">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {[
            { range: 'C0/(C0+C)<0.25', level: '强', color: '#10b981', desc: '空间结构明显，适合克里金插值' },
            { range: '0.25~0.50', level: '中等', color: '#06b6d4', desc: '有一定空间结构，插值效果尚可' },
            { range: '0.50~0.75', level: '弱', color: '#f59e0b', desc: '空间结构弱，需增加采样密度' },
            { range: '>0.75', level: '极弱', color: '#ef4444', desc: '随机变异为主，不宜空间插值' },
          ].map(g => (
            <div key={g.level} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.level}</div>
              <div className="text-[10px] font-mono text-gw-text mt-0.5">{g.range}</div>
              <div className="text-[9px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="交叉验证指标" badge="插值精度">
        <FilterableTechTable
          headers={['指标', '公式', '评价标准', '说明']}
          rows={[
            ['ME(平均误差)', 'Σ(actual-predicted)/n', '接近0为优', '反映系统偏差，越小越好'],
            ['RMSE(均方根误差)', '√[Σ(actual-predicted)²/n]', '越小越好', '对大偏差敏感'],
            ['MAE(平均绝对误差)', 'Σ|actual-predicted|/n', '越小越好', '稳健的误差度量'],
            ['精度等级', 'RMSE/均值', '<10%优, <20%良, <30%合格', '相对误差分级'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <DataSourceNote source="Moran(1950) | Anselin(1995) LISA | Cressie(1993) Statistics for Spatial Data | 河北省地下水监测网" version="B-29" />
    </div>
  );
}

// ── 主组件 ──

export function SpatialStatsCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'moran' | 'variogram' | 'cv' | 'reference'>('moran');

  const panels = [
    { key: 'moran' as const, label: "Moran's I", icon: Globe },
    { key: 'variogram' as const, label: '半变异函数', icon: TrendingUp },
    { key: 'cv' as const, label: '交叉验证', icon: Calculator },
    { key: 'reference' as const, label: '参考', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activePanel === p.key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 'moran' && <MoranIPanel />}
      {activePanel === 'variogram' && <VariogramPanel />}
      {activePanel === 'cv' && <CrossValidationPanel />}
      {activePanel === 'reference' && <ReferencePanel />}
    </div>
  );
}
