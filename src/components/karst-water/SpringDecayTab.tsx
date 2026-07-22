/**
 * B-19 岩溶泉流量衰减分析 Tab
 *
 * 4大面板：
 *  1. 衰减分析 — Maillet指数衰减模型 + 衰减曲线
 *  2. 滞后相关 — 降水-泉流量滞后相关分析
 *  3. 调蓄评价 — 系统调蓄功能评价
 *  4. 预设泉域 — 6个河北岩溶大泉对比 + 衰减系数参考表
 */
import React, { useState, useMemo } from 'react';
import {
  Line, Area, ComposedChart, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, Cell,
} from 'recharts';
import { Calculator, TrendingDown, Activity, Waves } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_SPRINGS,
  ALPHA_REF_TABLE,
  calcDecay,
  calcCorrelation,
  calcRegulation,
  calcAllPresetSprings,
  calcSpringSummary,
  type DecayInput,
  type CorrelationInput,
  type RegulationInput,
} from '../../utils/springDecayCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const REGULATION_COLORS: Record<string, string> = {
  '极强': '#10b981',
  '强': '#3b82f6',
  '中等': '#f59e0b',
  '弱': '#ef4444',
};

const AMPLITUDE_COLORS: Record<string, string> = {
  '稳定': '#10b981',
  '较稳定': '#3b82f6',
  '变幅较大': '#f59e0b',
  '极不稳定': '#ef4444',
};

// ── 面板1: 衰减分析 ──

function DecayPanel() {
  const [name, setName] = useState('自定义泉域');
  const [Q0, setQ0] = useState(7.0);
  const [alpha, setAlpha] = useState(0.010);
  const [duration, setDuration] = useState(180);
  const [startDay, setStartDay] = useState(120);

  const input: DecayInput = { name, Q0, alpha, duration, startDay };
  const result = useMemo(() => calcDecay(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="Maillet指数衰减模型参数" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">泉域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">初始流量 Q0 (m³/s)</label>
            <input type="number" step="0.1" value={Q0} onChange={e => setQ0(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减系数 α (1/d)</label>
            <input type="number" step="0.001" value={alpha} onChange={e => setAlpha(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减持续天数</label>
            <input type="number" value={duration} onChange={e => setDuration(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减起始日（年内第N天）</label>
            <input type="number" value={startDay} onChange={e => setStartDay(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="期末流量 Qt" value={result.Qt} unit="m³/s" accent={REGULATION_COLORS[result.regulation]} />
        <StatCard title="衰减率" value={result.decayRate} unit="%" accent="text-amber-400" />
        <StatCard title="半衰期" value={result.halfLife} unit="d" accent="text-blue-400" subtitle="流量减半天数" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">调蓄能力</span>
          <span className="text-xl font-bold" style={{ color: REGULATION_COLORS[result.regulation] }}>
            {result.regulation}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="衰减期总排泄量" value={result.totalDischarge} unit="万m³" accent="text-cyan-400" />
        <StatCard title="储水量估算" value={result.storageEstimate} unit="万m³" accent="text-violet-400" subtitle="Q0/α" />
        <StatCard title="衰减系数 α" value={result.alpha} unit="1/d" accent="text-orange-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">Maillet模型：</strong>
          {' '}Qt = Q0 · e^(-αt)，其中 α 为衰减系数，反映岩溶系统的排水速率。
          {' '}α越小，调蓄能力越强；α越大，系统响应越快、衰减越迅速。
          {' '}半衰期 t₁/₂ = ln2/α = {result.halfLife}天，储水量 V ≈ Q0/α = {result.storageEstimate}万m³。
        </p>
      </div>

      {/* 衰减曲线 */}
      <LazyChartCard title="泉流量衰减曲线">
        <ChartExport data={result.curve} filename={`${name}_衰减曲线`} />
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={result.curve} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '天数(d)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/s', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '万m³', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="流量" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Area yAxisId="right" type="monotone" dataKey="累计量" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={1} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}

// ── 面板2: 滞后相关分析 ──

function CorrelationPanel() {
  // 预设月度降水-流量数据（模拟典型岩溶泉域年序列）
  const defaultData = useMemo(() => [
    { month: '1月', rainfall: 8, discharge: 5.2 },
    { month: '2月', rainfall: 12, discharge: 4.8 },
    { month: '3月', rainfall: 20, discharge: 4.5 },
    { month: '4月', rainfall: 35, discharge: 5.0 },
    { month: '5月', rainfall: 45, discharge: 6.5 },
    { month: '6月', rainfall: 80, discharge: 7.2 },
    { month: '7月', rainfall: 180, discharge: 8.0 },
    { month: '8月', rainfall: 160, discharge: 11.5 },
    { month: '9月', rainfall: 55, discharge: 10.8 },
    { month: '10月', rainfall: 30, discharge: 8.5 },
    { month: '11月', rainfall: 15, discharge: 6.8 },
    { month: '12月', rainfall: 10, discharge: 5.5 },
  ], []);

  const [name, setName] = useState('威州泉');
  const [data, setData] = useState(defaultData);
  const [maxLag, setMaxLag] = useState(6);

  const input: CorrelationInput = { name, data, maxLag };
  const result = useMemo(() => calcCorrelation(input), [input]);

  const updateData = (idx: number, field: 'rainfall' | 'discharge', value: number) => {
    setData(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  return (
    <div className="space-y-4">
      <TechCard title="降水-泉流量滞后相关分析" icon={Activity}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-gw-muted block mb-1">泉域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">最大滞后月数</label>
            <input type="number" value={maxLag} onChange={e => setMaxLag(parseInt(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>

        {/* 月度数据编辑表 */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1 text-left text-gw-muted">月份</th>
                {data.map((d, i) => (
                  <th key={i} className="px-2 py-1 text-center text-gw-muted">{d.month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gw-border/50">
                <td className="px-2 py-1 text-gw-text">降水</td>
                {data.map((d, i) => (
                  <td key={i} className="px-1 py-1">
                    <input type="number" value={d.rainfall} onChange={e => updateData(i, 'rainfall', parseFloat(e.target.value) || 0)}
                      className="w-14 bg-gw-card-alt border border-gw-border rounded px-1 py-0.5 text-xs text-gw-text text-center" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-2 py-1 text-gw-text">流量(m³/s)</td>
                {data.map((d, i) => (
                  <td key={i} className="px-1 py-1">
                    <input type="number" step="0.1" value={d.discharge} onChange={e => updateData(i, 'discharge', parseFloat(e.target.value) || 0)}
                      className="w-14 bg-gw-card-alt border border-gw-border rounded px-1 py-0.5 text-xs text-gw-text text-center" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="最佳滞后期" value={result.bestLag} unit="月" accent="text-blue-400" />
        <StatCard title="相关系数 r" value={result.bestR} accent={REGULATION_COLORS[result.correlation] ?? '#6b7280'} />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">相关性等级</span>
          <span className="text-xl font-bold" style={{ color: REGULATION_COLORS[result.correlation] ?? '#6b7280' }}>
            {result.correlation}
          </span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center">
          <span className="text-xs text-gw-muted mb-1">系统判断</span>
          <span className="text-xs text-gw-text">{result.note}</span>
        </div>
      </div>

      <LazyChartCard title="不同滞后期相关系数">
        <ChartExport data={result.lagResults} filename={`${name}_滞后相关分析`} />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={result.lagResults} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lag" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '滞后期(月)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[-1, 1]} />
            <Tooltip {...TOOLTIP_STYLE} />
            <ReferenceLine y={0.8} stroke="#10b981" strokeDasharray="3 3" label={{ value: '极强(0.8)', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine y={0.6} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '强(0.6)', fill: '#3b82f6', fontSize: 10 }} />
            <ReferenceLine y={0.3} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '中等(0.3)', fill: '#f59e0b', fontSize: 10 }} />
            <Bar dataKey="r" name="相关系数" radius={[4, 4, 0, 0]}>
              {result.lagResults.map((entry, idx) => (
                <Cell key={idx} fill={Math.abs(entry.r) === Math.abs(result.bestR) ? '#10b981' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      {/* 降水-流量双轴图 */}
      <LazyChartCard title="月度降水-泉流量对比">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/s', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="rainfall" name="降水量(mm)" fill="#3b82f6" fillOpacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="discharge" name="泉流量(m³/s)" stroke="#ef4444" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}

// ── 面板3: 调蓄评价 ──

function RegulationPanel() {
  const [name, setName] = useState('威州泉');
  const [alpha, setAlpha] = useState(0.008);
  const [rechargeQ, setRechargeQ] = useState(12.0);
  const [decayQ, setDecayQ] = useState(3.5);
  const [decayDays, setDecayDays] = useState(180);
  const [rechargeDays, setRechargeDays] = useState(185);
  const [amplitudeRatio, setAmplitudeRatio] = useState(2.1);

  const input: RegulationInput = { name, alpha, rechargeQ, decayQ, decayDays, rechargeDays, amplitudeRatio };
  const result = useMemo(() => calcRegulation(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="系统调蓄功能评价参数" icon={Waves}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">泉域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减系数 α (1/d)</label>
            <input type="number" step="0.001" value={alpha} onChange={e => setAlpha(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">补给期均值 (m³/s)</label>
            <input type="number" step="0.1" value={rechargeQ} onChange={e => setRechargeQ(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减期均值 (m³/s)</label>
            <input type="number" step="0.1" value={decayQ} onChange={e => setDecayQ(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减期天数</label>
            <input type="number" value={decayDays} onChange={e => setDecayDays(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">补给期天数</label>
            <input type="number" value={rechargeDays} onChange={e => setRechargeDays(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">流量变幅比 Qmax/Qmin</label>
            <input type="number" step="0.1" value={amplitudeRatio} onChange={e => setAmplitudeRatio(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="调蓄系数 K" value={result.regulationCoeff} accent={REGULATION_COLORS[result.regulation]} subtitle="衰减/补给" />
        <StatCard title="年调节量" value={result.annualRegulation} unit="万m³" accent="text-cyan-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">流量变幅</span>
          <span className="text-lg font-bold" style={{ color: AMPLITUDE_COLORS[result.amplitudeGrade] }}>
            {result.amplitudeGrade}
          </span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">调蓄能力</span>
          <span className="text-xl font-bold" style={{ color: REGULATION_COLORS[result.regulation] }}>
            {result.regulation}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-sm text-gw-text leading-relaxed mb-2">
          <strong>评价结论：</strong>{result.conclusion}
        </p>
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">储水特征：</strong>{result.storageDesc}
        </p>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">调蓄系数K：</strong>
          {' '}K = 衰减期平均流量 / 补给期平均流量，反映岩溶系统对降水的缓冲调节能力。
          {' '}K越接近1，系统调蓄能力越强（流量稳定）；K越接近0，系统调蓄能力越弱（流量变幅大）。
          {' '}年调节量反映系统在年内储存和释放的水量规模。
        </p>
      </div>

      <FilterableTechTable
        headers={['α范围', '调蓄能力', '储水类型', '说明']}
        rows={ALPHA_REF_TABLE.map(a => [a.range, a.regulation, a.storageType, a.description])}
      />
    </div>
  );
}

// ── 面板4: 预设泉域对比 ──

function PresetSpringsPanel() {
  const results = useMemo(() => calcAllPresetSprings(), []);
  const summary = useMemo(() => calcSpringSummary(), []);

  const compareData = useMemo(() => PRESET_SPRINGS.map((s, i) => ({
    name: s.name,
    初始流量: s.Q0,
    期末流量: results[i].Qt,
    衰减率: results[i].decayRate,
    fill: REGULATION_COLORS[results[i].regulation] ?? '#6b7280',
  })), [results]);

  const alphaData = useMemo(() => PRESET_SPRINGS.map((s, i) => ({
    name: s.name,
    衰减系数: s.alpha * 1000,
    半衰期: results[i].halfLife,
    变幅比: s.amplitudeRatio,
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="岩溶大泉数" value={summary.springCount} unit="个" accent="text-cyan-400" />
        <StatCard title="总衰减期排泄量" value={summary.totalDischarge} unit="万m³" accent="text-blue-400" />
        <StatCard title="平均衰减系数" value={summary.avgAlpha} unit="1/d" accent="text-amber-400" />
        <StatCard title="强调蓄泉域" value={summary.strongRegulation} unit="个" accent="text-emerald-400" subtitle="强/极强" />
      </div>

      <LazyChartCard title="各泉域初始流量 vs 期末流量">
        <ChartExport data={compareData} filename="岩溶泉流量衰减对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/s', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="初始流量" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="期末流量" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各泉域衰减系数与半衰期">
        <ChartExport data={alphaData} filename="衰减系数对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={alphaData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '×10⁻³/d', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="衰减系数" name="衰减系数(×10⁻³/d)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['泉域', '位置', '初始流量(m³/s)', '衰减系数(1/d)', '半衰期', '期末流量(m³/s)', '衰减率(%)', '调蓄能力', '储水量(万m³)', '状态', '备注']}
        rows={PRESET_SPRINGS.map((s, i) => [s.name, s.location, s.Q0, s.alpha, results[i].halfLife, results[i].Qt, results[i].decayRate, results[i].regulation, results[i].storageEstimate, s.status, s.note])}
      />

      <FilterableTechTable
        headers={['α范围', '调蓄能力', '储水类型', '说明']}
        rows={ALPHA_REF_TABLE.map(a => [a.range, a.regulation, a.storageType, a.description])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北岩溶泉域特征：</strong>
          {' '}河北省岩溶大泉主要分布在太行山前和燕山南麓，含水层以中奥陶统灰岩为主。
          {' '}威州泉、黑龙江洞泉、百泉为三大岩溶水系统，衰减系数α=0.008~0.012/d，属强调蓄型。
          {' '}2021年黑龙洞泉和百泉相继复涌，标志着超采治理取得显著成效。
          {' '}衰减系数是评价岩溶水系统调蓄能力的核心参数，α越小表明储水空间越大、调蓄能力越强。
        </p>
      </div>
    </div>
  );
}

// ── 主组件 ──

export function SpringDecayTab() {
  const [panel, setPanel] = useState<'decay' | 'correlation' | 'regulation' | 'preset'>('decay');

  const panels = [
    { key: 'decay' as const, label: '衰减分析', icon: Calculator },
    { key: 'correlation' as const, label: '滞后相关', icon: Activity },
    { key: 'regulation' as const, label: '调蓄评价', icon: Waves },
    { key: 'preset' as const, label: '预设泉域', icon: TrendingDown },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'decay' && <DecayPanel />}
      {panel === 'correlation' && <CorrelationPanel />}
      {panel === 'regulation' && <RegulationPanel />}
      {panel === 'preset' && <PresetSpringsPanel />}

      <DataSourceNote source="河北省岩溶水资源评价报告 + Maillet衰减模型" version="B-19" />
    </div>
  );
}
