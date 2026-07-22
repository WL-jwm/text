/**
 * B-18 矿坑涌水量预测计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 稳定流涌水量计算（潜水/承压/承压转无压）
 *  2. 疏干排水 — 非稳定流Theis修正 + 时间-涌水量曲线
 *  3. 影响半径 — Kusakin/Sichardt/修正公式
 *  4. 预设矿区 — 6个河北典型矿区对比 + 涌水量分级
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
  Line, Area, ComposedChart,
} from 'recharts';
import { Calculator, Mountain, TrendingDown, BookOpen, AlertTriangle } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_MINES,
  RADIUS_METHODS,
  INFLOW_GRADES,
  calcMineInflow,
  calcInfluenceRadius,
  calcDewatering,
  calcAllPresetMines,
  calcMineSummary,
  type MineInflowInput,
  type DewateringInput,
  type RadiusInput,
} from '../../utils/mineInflowCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const GRADE_COLORS: Record<string, string> = {
  '极小': '#10b981',
  '小': '#3b82f6',
  '中等': '#f59e0b',
  '大': '#ef4444',
  '极大': '#dc2626',
};

// ── 面板1: 大井法计算 ──

function BigWellPanel() {
  const [name, setName] = useState('自定义矿区');
  const [aquiferType, setAquiferType] = useState<MineInflowInput['aquiferType']>('承压转无压');
  const [K, setK] = useState(0.85);
  const [M, setM] = useState(180);
  const [equivalentRadius, setEquivalentRadius] = useState(800);
  const [drawdown, setDrawdown] = useState(150);
  const [waterTableHeight, setWaterTableHeight] = useState(180);
  const [influenceRadius, setInfluenceRadius] = useState(3500);

  const input: MineInflowInput = {
    name, aquiferType, K, M, equivalentRadius, drawdown, waterTableHeight, influenceRadius,
  };
  const result = useMemo(() => calcMineInflow(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="大井法涌水量计算参数" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">矿区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层类型</label>
            <select value={aquiferType} onChange={e => setAquiferType(e.target.value as MineInflowInput['aquiferType'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="潜水">潜水</option>
              <option value="承压水">承压水</option>
              <option value="承压转无压">承压转无压</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">渗透系数 K (m/d)</label>
            <input type="number" step="0.01" value={K} onChange={e => setK(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层厚度 M (m)</label>
            <input type="number" value={M} onChange={e => setM(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={equivalentRadius} onChange={e => setEquivalentRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">设计降深 s0 (m)</label>
            <input type="number" value={drawdown} onChange={e => setDrawdown(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">静止水位高度 H (m)</label>
            <input type="number" value={waterTableHeight} onChange={e => setWaterTableHeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">影响半径 R (m)</label>
            <input type="number" value={influenceRadius} onChange={e => setInfluenceRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="涌水量 Q" value={result.bigWellQ} unit="m³/d" accent={GRADE_COLORS[result.inflowGrade]} />
        <StatCard title="涌水量 Q" value={result.bigWellQh} unit="m³/h" accent={GRADE_COLORS[result.inflowGrade]} />
        <StatCard title="单位降深涌水量" value={result.specificInflow} unit="m³/d·m" accent="text-blue-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">涌水量等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.inflowGrade] }}>
            {result.inflowGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}{result.formula}
          {' '}。其中 K={K} m/d, M={M} m, s={drawdown} m, R={influenceRadius} m, r0={equivalentRadius} m。
          {' '}矿坑系统面积 = π×r0² = {result.systemArea.toLocaleString()} m²。
        </p>
      </div>

      {/* 涌水量分级表 */}
      <FilterableTechTable
        headers={['等级', '涌水量范围(m³/h)', '防治措施']}
        rows={INFLOW_GRADES.map(g => [g.grade, g.range, g.measure])}
      />
    </div>
  );
}

// ── 面板2: 疏干排水 ──

function DewateringPanel() {
  const [name, setName] = useState('自定义矿区');
  const [K, setK] = useState(0.85);
  const [M, setM] = useState(180);
  const [storageCoeff, setStorageCoeff] = useState(0.0005);
  const [equivalentRadius, setEquivalentRadius] = useState(800);
  const [targetDrawdown, setTargetDrawdown] = useState(150);
  const [dewateringTime, setDewateringTime] = useState(180);
  const [stages, setStages] = useState(3);

  const input: DewateringInput = {
    name, K, M, storageCoeff, equivalentRadius, targetDrawdown, dewateringTime, stages,
  };
  const result = useMemo(() => calcDewatering(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="疏干排水计算参数" icon={TrendingDown}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">矿区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">渗透系数 K (m/d)</label>
            <input type="number" step="0.01" value={K} onChange={e => setK(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层厚度 M (m)</label>
            <input type="number" value={M} onChange={e => setM(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">储水系数 S / 给水度 μ</label>
            <input type="number" step="0.0001" value={storageCoeff} onChange={e => setStorageCoeff(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={equivalentRadius} onChange={e => setEquivalentRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">目标降深 s0 (m)</label>
            <input type="number" value={targetDrawdown} onChange={e => setTargetDrawdown(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">疏干时间</label>
            <input type="number" value={dewateringTime} onChange={e => setDewateringTime(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">疏干阶段数</label>
            <input type="number" value={stages} onChange={e => setStages(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="初始涌水量 Q0" value={result.initialQ} unit="m³/d" accent="text-red-400" />
        <StatCard title="最终涌水量 Qt" value={result.finalQ} unit="m³/d" accent="text-amber-400" />
        <StatCard title="平均涌水量" value={result.averageQ} unit="m³/d" accent="text-blue-400" />
        <StatCard title="总排水量" value={result.totalVolume} unit="m³" accent="text-violet-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">评价结论：</strong>
          {' '}{result.timeEvaluation}。
          {' '}导水系数 T = K×M = {K * M} m²/d，
          {' '}初始涌水量 {result.initialQ} m³/d，最终衰减至 {result.finalQ} m³/d，
          {' '}疏干期总排水量约 {result.totalVolume.toLocaleString()} m³。
        </p>
      </div>

      {/* 时间-涌水量曲线 */}
      <LazyChartCard title="疏干期涌水量衰减曲线">
        <ChartExport data={result.curve} filename={`${name}_疏干曲线`} />
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={result.curve} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间(d)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/d', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="涌水量" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Area yAxisId="right" type="monotone" dataKey="累计量" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={1} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算原理：</strong>
          {' '}基于Theis非稳定流方程修正，采用Jacob近似 W(u) ≈ -0.5772 - ln(u)。
          {' '}涌水量随时间衰减，因为疏干范围逐渐扩大、水力梯度降低。
          {' '}u = r0²S / (4Tt)，T = KM。时间越长，涌水量越接近稳定值。
        </p>
      </div>
    </div>
  );
}

// ── 面板3: 影响半径 ──

function RadiusPanel() {
  const [K, setK] = useState(0.85);
  const [drawdown, setDrawdown] = useState(150);
  const [equivalentRadius, setEquivalentRadius] = useState(800);
  const [method, setMethod] = useState<RadiusInput['method']>('kusakin_modified');

  const input: RadiusInput = { K, drawdown, equivalentRadius, method };
  const result = useMemo(() => calcInfluenceRadius(input), [input]);

  // 多方法对比
  const compareData = useMemo(() => {
    const methods: RadiusInput['method'][] = ['kusakin', 'sichardt', 'kusakin_modified'];
    return methods.map(m => {
      const r = calcInfluenceRadius({ K, drawdown, equivalentRadius, method: m });
      return { method: r.description, 影响半径: r.R, 公式: r.formula };
    });
  }, [K, drawdown, equivalentRadius]);

  return (
    <div className="space-y-4">
      <TechCard title="影响半径计算" icon={Mountain}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs text-gw-muted block mb-1">渗透系数 K (m/d)</label>
            <input type="number" step="0.01" value={K} onChange={e => setK(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">降深 s (m)</label>
            <input type="number" value={drawdown} onChange={e => setDrawdown(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={equivalentRadius} onChange={e => setEquivalentRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">计算方法</label>
            <select value={method} onChange={e => setMethod(e.target.value as RadiusInput['method'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="kusakin">Kusakin (库萨金)</option>
              <option value="sichardt">Sichardt (席哈尔)</option>
              <option value="kusakin_modified">修正库萨金 (含r0)</option>
            </select>
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="影响半径 R" value={result.R} unit="m" accent="text-amber-400" />
        <StatCard title="采用公式" value={result.formula} accent="text-blue-400" />
        <StatCard title="方法说明" value={result.description} accent="text-violet-400" />
      </div>

      <LazyChartCard title="三种方法影响半径对比">
        <ChartExport data={compareData} filename="影响半径方法对比" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="method" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="影响半径" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['方法', '公式', '适用条件', '说明']}
        rows={RADIUS_METHODS.map(r => [r.method, r.formula, r.applicable, r.description])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">影响半径的工程意义：</strong>
          {' '}影响半径R是矿坑排水后水位下降漏斗的外边界，直接影响涌水量计算结果。
          {' '}库萨金公式适用于潜水或承压水，席哈尔公式主要用于承压含水层。
          {' '}修正库萨金公式考虑了矿坑系统本身的半径r0，更符合矿坑排水实际情况。
          {' '}实际工程中应结合抽水试验观测数据校核经验公式计算结果。
        </p>
      </div>
    </div>
  );
}

// ── 面板4: 预设矿区 ──

function PresetMinesPanel() {
  const results = useMemo(() => calcAllPresetMines(), []);
  const summary = useMemo(() => calcMineSummary(), []);

  const compareData = useMemo(() => results.map((r, i) => ({
    name: PRESET_MINES[i].name.replace('矿区', ''),
    计算涌水量: r.bigWellQh,
    实际最小: parseFloat(PRESET_MINES[i].actualInflow.split('~')[0]) || 0,
    实际最大: parseFloat(PRESET_MINES[i].actualInflow.split('~')[1]) || 0,
    fill: GRADE_COLORS[r.inflowGrade] ?? '#6b7280',
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="矿区总数" value={summary.mineCount} unit="处" accent="text-amber-400" />
        <StatCard title="总涌水量" value={summary.totalInflow} unit="m³/h" accent="text-red-400" />
        <StatCard title="平均涌水量" value={summary.avgInflow} unit="m³/h" accent="text-blue-400" />
        <StatCard title="高风险矿区" value={summary.highRiskCount} unit="处" accent="text-red-400" subtitle="大/极大涌水量" />
      </div>

      <LazyChartCard title="各矿区计算涌水量 vs 实际涌水量">
        <ChartExport data={compareData} filename="矿区涌水量对比" />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/h', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="计算涌水量" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="实际最小" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="实际最大" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['矿区', '位置', '矿种', '含水层类型', 'K(m/d)', 'M(m)', '降深(m)', '计算涌水量(m³/h)', '实际涌水量(m³/h)', '等级', '备注']}
        rows={PRESET_MINES.map((m, i) => [m.name, m.location, m.oreType, m.aquiferType, m.K, m.M, m.drawdown, results[i].bigWellQh, m.actualInflow, results[i].inflowGrade, m.note])}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TechCard title="高风险矿区" icon={AlertTriangle} className="border-red-500/20">
          <div className="space-y-1.5">
            {results.filter(r => r.inflowGrade === '大' || r.inflowGrade === '极大').map((r, i) => {
              const idx = results.indexOf(r);
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ background: GRADE_COLORS[r.inflowGrade] }} />
                  <span className="text-gw-text">{PRESET_MINES[idx].name}</span>
                  <span className="text-gw-muted text-xs">{r.bigWellQh} m³/h</span>
                </div>
              );
            })}
          </div>
        </TechCard>
        <TechCard title="涌水量分级标准" icon={BookOpen}>
          <div className="space-y-1.5">
            {INFLOW_GRADES.map(g => (
              <div key={g.grade} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full" style={{ background: GRADE_COLORS[g.grade] }} />
                <span className="text-gw-text">{g.grade}</span>
                <span className="text-gw-muted text-xs">{g.range} m³/h</span>
                <span className="text-gw-muted text-xs ml-auto">{g.measure}</span>
              </div>
            ))}
          </div>
        </TechCard>
      </div>
    </div>
  );
}

// ── 主组件 ──

export function MineInflowTab() {
  const [panel, setPanel] = useState<'bigwell' | 'dewatering' | 'radius' | 'preset'>('bigwell');

  const panels = [
    { key: 'bigwell' as const, label: '大井法', icon: Calculator },
    { key: 'dewatering' as const, label: '疏干排水', icon: TrendingDown },
    { key: 'radius' as const, label: '影响半径', icon: Mountain },
    { key: 'preset' as const, label: '预设矿区', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'bigwell' && <BigWellPanel />}
      {panel === 'dewatering' && <DewateringPanel />}
      {panel === 'radius' && <RadiusPanel />}
      {panel === 'preset' && <PresetMinesPanel />}

      <DataSourceNote source="GB 50027-2001 供水水文地质勘察规范 + 河北省矿区水文地质资料" version="B-18" />
    </div>
  );
}
