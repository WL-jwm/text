/**
 * B-21 裂隙水涌水量估算计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Kf估算 + Q = Kf×I×F
 *  3. 径流模数法 — 经验公式按岩性分区
 *  4. 预设岩性 — 6种岩性对比 + 干扰分析 + 参考表
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Calculator, Mountain, Activity, BookOpen, GitBranch } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_LITHOLOGIES,
  RUNOFF_MODULUS_REF,
  FRACTURE_K_REF,
  INFLOW_GRADES,
  calcBigWell,
  calcFractureMethod,
  calcRunoffModulus,
  calcInterference,
  calcAllPresetBigWell,
  calcAllPresetRunoff,
  calcFractureSummary,
  type BigWellInput,
  type FractureMethodInput,
  type RunoffModulusInput,
  type InterferenceInput,
} from '../../utils/fractureWaterCalculator';

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

const FRACTURE_COLORS: Record<string, string> = {
  '极弱': '#10b981',
  '弱': '#3b82f6',
  '中等': '#f59e0b',
  '强': '#ef4444',
  '极强': '#dc2626',
};

// ── 面板1: 大井法 ──

function BigWellPanel() {
  const [name, setName] = useState('自定义评价区');
  const [aquiferType, setAquiferType] = useState<BigWellInput['aquiferType']>('承压水');
  const [Kf, setKf] = useState(0.25);
  const [M, setM] = useState(80);
  const [r0, setR0] = useState(250);
  const [s0, setS0] = useState(40);
  const [H, setH] = useState(80);
  const [R, setR] = useState(1500);
  const [completeness, setCompleteness] = useState<BigWellInput['completeness']>('完整井');
  const [filterLength, setFilterLength] = useState(40);

  const input: BigWellInput = { name, aquiferType, Kf, M, r0, s0, H, R, completeness, filterLength };
  const result = useMemo(() => calcBigWell(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="大井法涌水量计算参数" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层类型</label>
            <select value={aquiferType} onChange={e => setAquiferType(e.target.value as BigWellInput['aquiferType'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="潜水">潜水</option>
              <option value="承压水">承压水</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">完整性</label>
            <select value={completeness} onChange={e => setCompleteness(e.target.value as BigWellInput['completeness'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="完整井">完整井</option>
              <option value="非完整井">非完整井</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙渗透系数 Kf (m/d)</label>
            <input type="number" step="0.01" value={Kf} onChange={e => setKf(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层厚度 M (m)</label>
            <input type="number" value={M} onChange={e => setM(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={r0} onChange={e => setR0(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">设计降深 s0 (m)</label>
            <input type="number" value={s0} onChange={e => setS0(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">水位至底板 H (m)</label>
            <input type="number" value={H} onChange={e => setH(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">影响半径 R (m)</label>
            <input type="number" value={R} onChange={e => setR(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          {completeness === '非完整井' && (
            <div>
              <label className="text-xs text-gw-muted block mb-1">过滤器长度 l (m)</label>
              <input type="number" value={filterLength} onChange={e => setFilterLength(parseFloat(e.target.value) || 0)}
                className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
            </div>
          )}
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="涌水量 Q" value={result.Q} unit="m³/d" accent={GRADE_COLORS[result.grade]} />
        <StatCard title="涌水量 Q" value={result.Qh} unit="m³/h" accent={GRADE_COLORS[result.grade]} />
        <StatCard title="单位降深涌水量" value={result.specificQ} unit="m³/d·m" accent="text-blue-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">涌水量等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.grade] }}>
            {result.grade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}{result.formula}
          {' '}。Kf={Kf} m/d, M={M} m, s={s0} m, R={R} m, r0={r0} m。
        </p>
      </div>

      <FilterableTechTable
        headers={['等级', '涌水量范围(m³/h)', '适用场景']}
        rows={INFLOW_GRADES.map(g => [g.grade, g.range, g.measure])}
      />
    </div>
  );
}

// ── 面板2: 裂隙率法 ──

function FracturePanel() {
  const [name, setName] = useState('自定义评价区');
  const [fractureRatio, setFractureRatio] = useState(0.012);
  const [fractureAperture, setFractureAperture] = useState(0.5);
  const [connectivity, setConnectivity] = useState(0.7);
  const [hydraulicGradient, setHydraulicGradient] = useState(0.005);
  const [crossSectionArea, setCrossSectionArea] = useState(500);
  const [fractureDensity, setFractureDensity] = useState(3.5);

  const input: FractureMethodInput = {
    name, fractureRatio, fractureAperture, connectivity, hydraulicGradient, crossSectionArea, fractureDensity,
  };
  const result = useMemo(() => calcFractureMethod(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="裂隙率法涌水量估算参数" icon={Mountain}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙率 n (小数)</label>
            <input type="number" step="0.001" value={fractureRatio} onChange={e => setFractureRatio(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙开度 b (mm)</label>
            <input type="number" step="0.1" value={fractureAperture} onChange={e => setFractureAperture(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">连通系数 (0~1)</label>
            <input type="number" step="0.05" value={connectivity} onChange={e => setConnectivity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">水力梯度 I</label>
            <input type="number" step="0.001" value={hydraulicGradient} onChange={e => setHydraulicGradient(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">过水断面 F (m²)</label>
            <input type="number" value={crossSectionArea} onChange={e => setCrossSectionArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙密度 (条/m)</label>
            <input type="number" step="0.5" value={fractureDensity} onChange={e => setFractureDensity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="裂隙渗透系数 Kf" value={result.Kf} unit="m/d" accent={FRACTURE_COLORS[result.fractureGrade]} />
        <StatCard title="等效渗透系数 Keq" value={result.Keq} unit="m/d" accent="text-violet-400" />
        <StatCard title="涌水量 Q" value={result.Q} unit="m³/d" accent={FRACTURE_COLORS[result.fractureGrade]} />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">裂隙发育等级</span>
          <span className="text-xl font-bold" style={{ color: FRACTURE_COLORS[result.fractureGrade] }}>
            {result.fractureGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算原理：</strong>
          {' '}{result.note}
          {' '}。公式 Kf = n·b²·g/(12ν)·c，其中g=9.81m/s², ν=1.0×10⁻⁶m²/s(15°C水)。
          {' '}裂隙开度对Kf影响最大（平方关系），开度增加1倍，Kf增大4倍。
        </p>
      </div>

      <FilterableTechTable
        headers={['裂隙等级', '开度范围', 'Kf范围(m/d)', 'Kf均值', '典型特征']}
        rows={FRACTURE_K_REF.map(r => [r.fractureGrade, r.apertureRange, r.KfRange, r.KfAvg, r.typical])}
      />
    </div>
  );
}

// ── 面板3: 径流模数法 ──

function RunoffPanel() {
  const [name, setName] = useState('自定义评价区');
  const [lithology, setLithology] = useState('砂岩类');
  const [runoffModulus, setRunoffModulus] = useState(3.5);
  const [area, setArea] = useState(100);
  const [guaranteeFactor, setGuaranteeFactor] = useState(0.75);

  const input: RunoffModulusInput = { name, lithology, runoffModulus, area, guaranteeFactor };
  const result = useMemo(() => calcRunoffModulus(input), [input]);

  const presets = useMemo(() => calcAllPresetRunoff(), []);
  const compareData = useMemo(() => PRESET_LITHOLOGIES.map((l, i) => ({
    name: l.rockType,
    径流模数: l.runoffModulus,
    涌水量: presets[i].Qh,
    fill: FRACTURE_COLORS[
      l.runoffModulus < 1 ? '极弱' :
      l.runoffModulus < 3 ? '弱' :
      l.runoffModulus < 5 ? '中等' :
      l.runoffModulus < 8 ? '强' : '极强'
    ] ?? '#6b7280',
  })), [presets]);

  return (
    <div className="space-y-4">
      <TechCard title="经验径流模数法参数" icon={Activity}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">岩性类型</label>
            <select value={lithology} onChange={e => setLithology(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {RUNOFF_MODULUS_REF.map(r => (
                <option key={r.rockType} value={r.rockType}>{r.rockType} (M={r.avg})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">径流模数 M (L/s·km²)</label>
            <input type="number" step="0.1" value={runoffModulus} onChange={e => setRunoffModulus(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">汇水面积 F (km²)</label>
            <input type="number" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">保证率修正系数</label>
            <input type="number" step="0.05" value={guaranteeFactor} onChange={e => setGuaranteeFactor(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="涌水量 Q" value={result.Q} unit="m³/d" accent="text-blue-400" />
        <StatCard title="涌水量 Q" value={result.Qh} unit="m³/h" accent="text-cyan-400" />
        <StatCard title="年总资源量" value={result.annualResource} unit="万m³/a" accent="text-amber-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">模数等级</span>
          <span className="text-sm font-bold text-blue-400">{result.modulusGrade}</span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}Q = M × F × β，其中M为径流模数(L/s·km²)，F为汇水面积(km²)，β为保证率修正系数。
          {' '}径流模数法适用于缺少抽水试验资料的基岩山区，通过经验统计获得不同岩性的产水能力。
        </p>
      </div>

      <LazyChartCard title="各岩性径流模数与涌水量对比">
        <ChartExport data={compareData} filename="岩性径流模数对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'L/s·km²', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/h', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="径流模数" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="涌水量" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['岩性类型', '径流模数范围', '均值', '等级', '分布区域']}
        rows={RUNOFF_MODULUS_REF.map(r => [r.rockType, r.range, r.avg, r.grade, r.distribution])}
      />
    </div>
  );
}

// ── 面板4: 预设岩性 + 干扰分析 ──

function PresetPanel() {
  const [showInterference, setShowInterference] = useState(false);
  const [wellCount, setWellCount] = useState(5);
  const [singleWellQ, setSingleWellQ] = useState(300);
  const [wellSpacing, setWellSpacing] = useState(500);
  const [singleRadius, setSingleRadius] = useState(1500);
  const [K, setK] = useState(0.25);
  const [M, setM] = useState(80);

  const bigWellResults = useMemo(() => calcAllPresetBigWell(), []);
  const summary = useMemo(() => calcFractureSummary(), []);

  const interferenceInput: InterferenceInput = {
    name: '群孔干扰分析', wellCount, singleWellQ, wellSpacing, singleRadius, K, M,
  };
  const interferenceResult = useMemo(() => calcInterference(interferenceInput), [interferenceInput]);

  const compareData = useMemo(() => PRESET_LITHOLOGIES.map((l, i) => ({
    name: l.rockType,
    大井法: bigWellResults[i].Qh,
    径流模数法: calcAllPresetRunoff()[i].Qh,
    fill: GRADE_COLORS[bigWellResults[i].grade] ?? '#6b7280',
  })), [bigWellResults]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="岩性类型数" value={summary.lithologyCount} unit="种" accent="text-blue-400" />
        <StatCard title="大井法总涌水量" value={summary.totalBigWell} unit="m³/h" accent="text-cyan-400" />
        <StatCard title="径流模数法总涌水量" value={summary.totalRunoff} unit="m³/h" accent="text-amber-400" />
        <StatCard title="高涌水量岩性" value={summary.highYieldCount} unit="种" accent="text-red-400" subtitle="大/极大" />
      </div>

      <LazyChartCard title="各岩性大井法 vs 径流模数法涌水量对比">
        <ChartExport data={compareData} filename="岩性涌水量对比" />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/h', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="大井法" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="径流模数法" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['岩性', '位置', 'Kf(m/d)', 'M(m)', '裂隙率(%)', '开度', '密度(条/m)', '径流模数', '大井法Q(m³/h)', '等级', '备注']}
        rows={PRESET_LITHOLOGIES.map((l, i) => [
          l.rockType, l.location, l.Kf, l.M, (l.fractureRatio * 100).toFixed(2),
          l.fractureAperture, l.fractureDensity, l.runoffModulus,
          bigWellResults[i].Qh, bigWellResults[i].grade, l.note,
        ])}
      />

      {/* 群孔干扰分析 */}
      <TechCard title="群孔干扰降深预测" icon={GitBranch}>
        <button
          onClick={() => setShowInterference(!showInterference)}
          className="mb-3 px-3 py-1.5 rounded-lg text-sm bg-gw-card-alt text-gw-muted hover:text-gw-text"
        >
          {showInterference ? '收起干扰分析' : '展开干扰分析'}
        </button>
        {showInterference && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="text-xs text-gw-muted block mb-1">群孔数量</label>
                <input type="number" value={wellCount} onChange={e => setWellCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">单孔涌水量 (m³/d)</label>
                <input type="number" value={singleWellQ} onChange={e => setSingleWellQ(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">孔间距 d (m)</label>
                <input type="number" value={wellSpacing} onChange={e => setWellSpacing(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">单孔影响半径 R (m)</label>
                <input type="number" value={singleRadius} onChange={e => setSingleRadius(parseFloat(e.target.value) || 0)}
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="理论总量" value={interferenceResult.theoreticalQ} unit="m³/d" accent="text-gray-400" />
              <StatCard title="实际总量" value={interferenceResult.totalQ} unit="m³/d" accent="text-blue-400" />
              <StatCard title="折减系数" value={interferenceResult.reductionFactor} accent="text-amber-400" />
              <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
                <span className="text-xs text-gw-muted mb-1">干扰评价</span>
                <span className="text-sm font-bold text-orange-400">{interferenceResult.interferenceLevel}</span>
              </div>
            </div>

            <div className="bg-gw-card-alt rounded-lg p-3 mt-2">
              <p className="text-xs text-gw-muted leading-relaxed">{interferenceResult.note}</p>
            </div>
          </>
        )}
      </TechCard>
    </div>
  );
}

// ── 主组件 ──

export function FractureWaterCalculatorTab() {
  const [panel, setPanel] = useState<'bigwell' | 'fracture' | 'runoff' | 'preset'>('bigwell');

  const panels = [
    { key: 'bigwell' as const, label: '大井法', icon: Calculator },
    { key: 'fracture' as const, label: '裂隙率法', icon: Mountain },
    { key: 'runoff' as const, label: '径流模数法', icon: Activity },
    { key: 'preset' as const, label: '预设岩性', icon: BookOpen },
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
      {panel === 'fracture' && <FracturePanel />}
      {panel === 'runoff' && <RunoffPanel />}
      {panel === 'preset' && <PresetPanel />}

      <DataSourceNote source="GB 50027-2001 供水水文地质勘察规范 + 河北基岩山区水文地质" version="B-21" />
    </div>
  );
}
