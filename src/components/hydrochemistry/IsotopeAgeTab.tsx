/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { Atom, Calculator, Thermometer, Activity, MapPin } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_SITES,
  calcTritiumAge,
  calcCarbon14Age,
  calcHelium4Age,
  calcRechargeTemp,
  calcAllPresetSites,
  calcIsotopeSummary,
  type TritiumInput,
  type Carbon14Input,
  type Helium4Input,
  type RechargeTempInput,
} from '../../utils/isotopeAgeCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const AGE_COLORS: Record<string, string> = {
  '现代水(<10a)': '#10b981',
  '次现代水(10~50a)': '#3b82f6',
  '老水(50~1000a)': '#f59e0b',
  '古水(>1000a)': '#ef4444',
  '现代碳': '#10b981',
  '百年级': '#3b82f6',
  '千年级': '#f59e0b',
  '万年级': '#ef4444',
  '现代水': '#10b981',
  '百年-千年': '#f59e0b',
  '千年-万年': '#ef4444',
  '万年以上': '#dc2626',
};

// ── 面板1: ³H年龄 ──

function TritiumPanel() {
  const [name, setName] = useState('自定义监测点');
  const [measuredTU, setMeasuredTU] = useState(3.8);
  const [initialTU, setInitialTU] = useState(20);
  const [model, setModel] = useState<TritiumInput['model']>('piston');
  const [turnoverTime, setTurnoverTime] = useState(30);

  const input: TritiumInput = { name, measuredTU, initialTU, model, turnoverTime };
  const result = useMemo(() => calcTritiumAge(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="³H放射性衰变年龄计算" icon={Atom}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测³H (TU)</label>
            <input type="number" step="0.1" value={measuredTU} onChange={e => setMeasuredTU(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">初始³H (TU)</label>
            <input type="number" step="0.1" value={initialTU} onChange={e => setInitialTU(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">模型类型</label>
            <select value={model} onChange={e => setModel(e.target.value as TritiumInput['model'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="piston">活塞流模型 (PFM)</option>
              <option value="exponential">指数模型 (EMM)</option>
            </select>
          </div>
          {model === 'exponential' && (
            <div>
              <label className="text-xs text-gw-muted block mb-1">平均周转时间 τ (a)</label>
              <input type="number" value={turnoverTime} onChange={e => setTurnoverTime(parseFloat(e.target.value) || 0)}
                className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
            </div>
          )}
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="表观年龄" value={result.apparentAge} unit="a" accent={AGE_COLORS[result.ageGrade] ?? '#6b7280'} />
        <StatCard title="剩余³H比例" value={result.remainingFraction} unit="%" accent="text-cyan-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">年龄分级</span>
          <span className="text-sm font-bold" style={{ color: AGE_COLORS[result.ageGrade] ?? '#6b7280' }}>
            {result.ageGrade}
          </span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center">
          <span className="text-xs text-gw-muted mb-1">模型</span>
          <span className="text-xs text-gw-text">{result.model}</span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">原理：</strong>
          {' '}³H半衰期12.32a，通过测量地下水中³H浓度与补给时初始浓度的比值估算年龄。
          {' '}活塞流模型假设无混合，t = -ln(C/C₀)/λ；指数模型假设完全混合，t = τ。
          {' '}{result.note}
        </p>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">³H浓度参考：</strong>
          {' '}现代降水³H≈10~25TU（北半球受核试验影响）；1952年前大气³H≈5~10TU；
          {' '}³H&lt;0.5TU通常认为是核试验前老水（&gt;50a）；
          {' '}³H=0.5~5TU为次现代-现代混合水；³H&gt;10TU为现代水（&lt;20a）。
        </p>
      </div>
    </div>
  );
}

// ── 面板2: ¹⁴C年龄 ──

function Carbon14Panel() {
  const [name, setName] = useState('自定义监测点');
  const [measuredPMC, setMeasuredPMC] = useState(15);
  const [initialPMC, setInitialPMC] = useState(100);
  const [delta13C, setDelta13C] = useState(-6);
  const [rechargeDelta13C, setRechargeDelta13C] = useState(-13);
  const [dilutionFactor, setDilutionFactor] = useState(0.15);

  const input: Carbon14Input = { name, measuredPMC, initialPMC, delta13C, rechargeDelta13C, dilutionFactor };
  const result = useMemo(() => calcCarbon14Age(input), [input]);

  const ageData = useMemo(() => [
    { name: '未校正', 年龄: result.rawAge, fill: '#6b7280' },
    { name: 'δ¹³C校正', 年龄: result.correctedAge, fill: '#3b82f6' },
    { name: '稀释校正', 年龄: result.dilutionCorrectedAge, fill: '#f59e0b' },
    { name: '推荐年龄', 年龄: result.recommendedAge, fill: '#10b981' },
  ], [result]);

  return (
    <div className="space-y-4">
      <TechCard title="¹⁴C年龄校正计算" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测¹⁴C (pmc)</label>
            <input type="number" value={measuredPMC} onChange={e => setMeasuredPMC(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">初始¹⁴C A₀ (pmc)</label>
            <input type="number" value={initialPMC} onChange={e => setInitialPMC(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测δ¹³C (‰)</label>
            <input type="number" value={delta13C} onChange={e => setDelta13C(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">补给区δ¹³C (‰)</label>
            <input type="number" value={rechargeDelta13C} onChange={e => setRechargeDelta13C(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">碳酸盐稀释系数</label>
            <input type="number" step="0.01" value={dilutionFactor} onChange={e => setDilutionFactor(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="未校正年龄" value={result.rawAge} unit="a BP" accent="text-gray-400" />
        <StatCard title="δ¹³C校正年龄" value={result.correctedAge} unit="a BP" accent="text-blue-400" />
        <StatCard title="稀释校正年龄" value={result.dilutionCorrectedAge} unit="a BP" accent="text-amber-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">推荐年龄/分级</span>
          <span className="text-lg font-bold text-emerald-400">{result.recommendedAge}</span>
          <span className="text-xs" style={{ color: AGE_COLORS[result.ageGrade] ?? '#6b7280' }}>{result.ageGrade}</span>
        </div>
      </div>

      <LazyChartCard title="不同校正方法年龄对比">
        <ChartExport data={ageData} filename="14C年龄校正对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={ageData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'a BP', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="年龄" radius={[4, 4, 0, 0]}>
              {ageData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">校正说明：</strong>
          {' '}{result.note}
          {' '}¹⁴C半衰期5730a，适用于500~50000a范围的地下水定年。
          {' '}δ¹³C校正用于消除碳酸盐溶解对¹⁴C稀释的影响；
          {' '}稀释校正扣除死碳（无放射性碳的碳酸盐）的贡献。
          {' '}实际应用中应结合水文地质条件选择适当的校正方法。
        </p>
      </div>
    </div>
  );
}

// ── 面板3: ⁴He年龄 ──

function Helium4Panel() {
  const [name, setName] = useState('自定义监测点');
  const [measuredHe4, setMeasuredHe4] = useState(2e-6);
  const [atmosphericHe4, setAtmosphericHe4] = useState(4e-8);
  const [accumRate, setAccumRate] = useState(1e-8);

  const input: Helium4Input = { name, measuredHe4, atmosphericHe4, accumRate };
  const result = useMemo(() => calcHelium4Age(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="⁴He累积年龄计算" icon={Activity}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测⁴He (cm³STP/kg)</label>
            <input type="number" step="1e-8" value={measuredHe4} onChange={e => setMeasuredHe4(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">大气背景⁴He</label>
            <input type="number" step="1e-8" value={atmosphericHe4} onChange={e => setAtmosphericHe4(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">累积速率 (cm³STP/kg·a)</label>
            <input type="number" step="1e-9" value={accumRate} onChange={e => setAccumRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="过量⁴He" value={result.excessHe4.toExponential(3)} unit="cm³STP/kg" accent="text-violet-400" />
        <StatCard title="估算年龄" value={result.estimatedAge} unit="a" accent={AGE_COLORS[result.ageGrade] ?? '#6b7280'} />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">年龄分级</span>
          <span className="text-sm font-bold" style={{ color: AGE_COLORS[result.ageGrade] ?? '#6b7280' }}>
            {result.ageGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">原理：</strong>
          {' '}{result.note}
          {' '}⁴He年龄适用于10³~10⁶年范围的地下水，弥补¹⁴C（上限5万年）的不足。
          {' '}累积速率受含水层U/Th含量影响，不同地质环境差异较大（10⁻⁹~10⁻⁷ cm³STP/kg·a），
          {' '}实际应用中需通过已知年龄水样标定。
        </p>
      </div>
    </div>
  );
}

// ── 面板4: 补给温度 ──

function RechargeTempPanel() {
  const [name, setName] = useState('自定义监测点');
  const [delta18O, setDelta18O] = useState(-9.1);
  const [deltaD, setDeltaD] = useState(-68);
  const [lmwlSlope, setLmwlSlope] = useState(7.8);
  const [lmwlIntercept, setLmwlIntercept] = useState(9);
  const [d18OTempSlope, setD18OTempSlope] = useState(0.3);
  const [elevationGradient, setElevationGradient] = useState(-0.25);
  const [referenceElevation, setReferenceElevation] = useState(50);
  const [referenceDelta18O, setReferenceDelta18O] = useState(-8.0);

  const input: RechargeTempInput = {
    name, delta18O, deltaD, lmwlSlope, lmwlIntercept,
    d18OTempSlope: d18OTempSlope, elevationGradient, referenceElevation, referenceDelta18O,
  };
  const result = useMemo(() => calcRechargeTemp(input), [input]);

  // δ²H-δ¹⁸O散点图
  const scatterData = useMemo(() => {
    const sites = calcAllPresetSites();
    return sites.map(s => ({
      x: s.site.delta18O,
      y: s.site.deltaD,
      name: s.site.name,
      fill: s.site.aquiferType === '潜水' ? '#3b82f6' : s.site.aquiferType === '岩溶水' ? '#10b981' : '#f59e0b',
    }));
  }, []);

  // LMWL线
  const lmwlLine = useMemo(() => {
    const points: Array<{ x: number; y: number }> = [];
    for (let x = -12; x <= -6; x += 0.5) {
      points.push({ x, y: lmwlSlope * x + lmwlIntercept });
    }
    return points;
  }, [lmwlSlope, lmwlIntercept]);

  // LMWL ReferenceLine segment
  const lmwlSegment = useMemo(() => {
    if (lmwlLine.length < 2) return [{ x: -12, y: 0 }, { x: -6, y: 0 }];
    return [lmwlLine[0], lmwlLine[lmwlLine.length - 1]];
  }, [lmwlLine]);

  return (
    <div className="space-y-4">
      <TechCard title="δ²H-δ¹⁸O同位素补给温度估算" icon={Thermometer}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">δ¹⁸O (‰)</label>
            <input type="number" step="0.1" value={delta18O} onChange={e => setDelta18O(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">δ²H (‰)</label>
            <input type="number" step="0.1" value={deltaD} onChange={e => setDeltaD(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">LMWL斜率</label>
            <input type="number" step="0.1" value={lmwlSlope} onChange={e => setLmwlSlope(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">LMWL截距</label>
            <input type="number" value={lmwlIntercept} onChange={e => setLmwlIntercept(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">δ¹⁸O-温度斜率 (‰/°C)</label>
            <input type="number" step="0.1" value={d18OTempSlope} onChange={e => setD18OTempSlope(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">高程梯度 (‰/100m)</label>
            <input type="number" step="0.01" value={elevationGradient} onChange={e => setElevationGradient(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">参考高程</label>
            <input type="number" value={referenceElevation} onChange={e => setReferenceElevation(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">参考δ¹⁸O (‰)</label>
            <input type="number" step="0.1" value={referenceDelta18O} onChange={e => setReferenceDelta18O(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="补给温度" value={result.rechargeTemp} unit="°C" accent="text-orange-400" />
        <StatCard title="补给高程" value={result.rechargeElevation} unit="m" accent="text-blue-400" />
        <StatCard title="氘盈余 d-excess" value={result.dExcess} unit="‰" accent="text-violet-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center">
          <span className="text-xs text-gw-muted mb-1">蒸发影响</span>
          <span className="text-xs text-gw-text">{result.evaporationEffect}</span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">分析：</strong>
          {' '}{result.note}
          {' '}{result.waterRockInteraction}
        </p>
      </div>

      {/* δ²H-δ¹⁸O散点图 */}
      <LazyChartCard title="δ²H-δ¹⁸O同位素散点图（预设监测点）">
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="x" name="δ¹⁸O" domain={[-12, -6]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'δ¹⁸O (‰)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -10 }} />
            <YAxis type="number" dataKey="y" name="δ²H" domain={[-90, -40]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'δ²H (‰)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <ZAxis range={[80, 80]} />
            <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
            <ReferenceLine segment={lmwlSegment} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'LMWL', fill: '#10b981', fontSize: 10 }} />
            <Scatter data={scatterData} name="监测点">
              {scatterData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}

// ── 面板5: 预设监测点对比 ──

function PresetSitesPanel() {
  const results = useMemo(() => calcAllPresetSites(), []);
  const summary = useMemo(() => calcIsotopeSummary(), []);

  const ageCompare = useMemo(() => results.map(r => ({
    name: r.site.name,
    '³H年龄': r.tritiumResult.apparentAge,
    '¹⁴C年龄': r.c14Result.recommendedAge,
    '⁴He年龄': r.he4Result.estimatedAge,
    fill: r.site.aquiferType === '潜水' ? '#3b82f6' : r.site.aquiferType === '岩溶水' ? '#10b981' : '#f59e0b',
  })), [results]);

  const tempData = useMemo(() => results.map(r => ({
    name: r.site.name,
    补给温度: r.tempResult.rechargeTemp,
    氘盈余: r.tempResult.dExcess,
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="监测点数" value={summary.siteCount} unit="组" accent="text-blue-400" />
        <StatCard title="现代水比例" value={`${summary.modernCount}/${summary.siteCount}`} accent="text-emerald-400" />
        <StatCard title="平均¹⁴C年龄" value={summary.avgC14Age} unit="a BP" accent="text-amber-400" />
        <StatCard title="平均补给温度" value={summary.avgRechargeTemp} unit="°C" accent="text-orange-400" />
      </div>

      <LazyChartCard title="各监测点多种同位素年龄对比（对数刻度）">
        <ChartExport data={ageCompare} filename="同位素年龄对比" />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={ageCompare} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} scale="log" domain={[1, 1000000]} label={{ value: 'a', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="³H年龄" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="¹⁴C年龄" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="⁴He年龄" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各监测点补给温度与氘盈余">
        <ChartExport data={tempData} filename="补给温度对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tempData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '‰', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="补给温度" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="氘盈余" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['监测点', '位置', '含水层', '深度', '³H(TU)', '³H年龄', '¹⁴C(pmc)', '¹⁴C年龄', '⁴He年龄', 'δ¹⁸O(‰)', '补给温度(°C)', '备注']}
        rows={PRESET_SITES.map((s, i) => [
          s.name, s.location, s.aquiferType, s.depth,
          s.tritium, results[i].tritiumResult.apparentAge,
          s.c14, results[i].c14Result.recommendedAge,
          results[i].he4Result.estimatedAge,
          s.delta18O, results[i].tempResult.rechargeTemp,
          s.note,
        ])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北平原地下水同位素特征：</strong>
          {' '}河北平原地下水同位素呈现明显的深度分带性：
          {' '}浅层水（&lt;50m）³H含量高（10~25TU），为现代水；中层水（50~200m）³H降低（1~5TU），为次现代-现代混合；
          {' '}深层水（&gt;200m）³H极低（&lt;1TU），¹⁴C为5~30pmc，年龄千年~万年级。
          {' '}δ¹⁸O随深度变负（-8‰→-10‰），反映从暖期到冷期的气候变化信号。
          {' '}深层水的古水特征对地下水可持续开发具有重要指示意义。
        </p>
      </div>
    </div>
  );
}

// ── 主组件 ──

export function IsotopeAgeTab() {
  const [panel, setPanel] = useState<'tritium' | 'c14' | 'he4' | 'temp' | 'preset'>('tritium');

  const panels = [
    { key: 'tritium' as const, label: '³H年龄', icon: Atom },
    { key: 'c14' as const, label: '¹⁴C年龄', icon: Calculator },
    { key: 'he4' as const, label: '⁴He年龄', icon: Activity },
    { key: 'temp' as const, label: '补给温度', icon: Thermometer },
    { key: 'preset' as const, label: '预设监测点', icon: MapPin },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'tritium' && <TritiumPanel />}
      {panel === 'c14' && <Carbon14Panel />}
      {panel === 'he4' && <Helium4Panel />}
      {panel === 'temp' && <RechargeTempPanel />}
      {panel === 'preset' && <PresetSitesPanel />}

      <DataSourceNote source="IAEA同位素水文数据库 + 河北平原地下水同位素研究" version="B-20" />
    </div>
  );
}
