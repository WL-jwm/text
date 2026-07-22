/**
 * B-17 地热资源量评价计算器 Tab
 *
 * 4大面板：
 *  1. 热储储量 — 热储法 Q=ρ·c·V·ΔT 计算 + 预设地热田对比
 *  2. 井产能评价 — 热功率/年产热量/产能等级
 *  3. 地温梯度 — 梯度/热流值/不同深度温度预测
 *  4. 可开采量 — 开采系数法/回灌率/服务年限
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell,
} from 'recharts';
import { Calculator, Flame, TrendingUp, BookOpen, Zap } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_FIELDS,
  ROCK_PROPERTIES,
  RECOVERY_FACTOR_TABLE,
  calcReservoirReserve,
  calcWellProductivity,
  calcGradient,
  calcExploitable,
  calcAllPresetFields,
  calcAllPresetWells,
  calcGeothermalSummary,
  type ReservoirInput,
  type RockType,
  type WellProductivityInput,
  type GradientInput,
  type ExploitableInput,
} from '../../utils/geothermalCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const GRADE_COLORS: Record<string, string> = {
  '低产': '#6b7280',
  '中产': '#3b82f6',
  '高产': '#f59e0b',
  '特高产': '#ef4444',
};

const GRADIENT_COLORS: Record<string, string> = {
  '正常': '#10b981',
  '偏高': '#3b82f6',
  '高地温': '#f59e0b',
  '异常': '#ef4444',
};

// ── 面板1: 热储储量计算 ──

function ReservoirPanel() {
  const [name, setName] = useState('自定义地热田');
  const [area, setArea] = useState(250);
  const [reservoirThickness, setReservoirThickness] = useState(300);
  const [reservoirTemp, setReservoirTemp] = useState(75);
  const [referenceTemp, setReferenceTemp] = useState(25);
  const [porosity, setPorosity] = useState(0.06);
  const [rockType, setRockType] = useState<RockType>('limestone');

  const input: ReservoirInput = {
    name, area, reservoirThickness, reservoirTemp, referenceTemp, porosity, rockType,
  };
  const result = useMemo(() => calcReservoirReserve(input), [input]);
  const presets = useMemo(() => calcAllPresetFields(), []);
  const summary = useMemo(() => calcGeothermalSummary(), []);

  const compareData = useMemo(() => presets.map(r => ({
    name: PRESET_FIELDS[i].name.replace('地热田', ''),
    热储量: r.totalHeatReservePJ,
    可开采量: r.recoverableHeat,
    fill: r.totalHeatReservePJ > 50 ? '#ef4444' : r.totalHeatReservePJ > 30 ? '#f59e0b' : '#3b82f6',
  })), [presets]);

  const tempData = useMemo(() => PRESET_FIELDS.map(f => ({
    name: f.name.replace('地热田', ''),
    热储温度: f.reservoirTemp,
    井口温度: f.wellheadTemp,
    fill: f.reservoirTemp >= 80 ? '#ef4444' : f.reservoirTemp >= 70 ? '#f59e0b' : '#3b82f6',
  })), []);

  return (
    <div className="space-y-4">
      <TechCard title="热储法储量计算" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">地热田名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">热储面积 (km²)</label>
            <input type="number" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">热储厚度</label>
            <input type="number" value={reservoirThickness} onChange={e => setReservoirThickness(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">热储温度 (°C)</label>
            <input type="number" value={reservoirTemp} onChange={e => setReservoirTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">基准温度 (°C)</label>
            <input type="number" value={referenceTemp} onChange={e => setReferenceTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">孔隙度</label>
            <input type="number" step="0.01" value={porosity} onChange={e => setPorosity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">岩石类型</label>
            <select value={rockType} onChange={e => setRockType(e.target.value as RockType)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {Object.entries(ROCK_PROPERTIES).map(([k, v]) => (
                <option key={k} value={k}>{v.type}</option>
              ))}
            </select>
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="热储体积" value={(result.volume / 1e9).toFixed(2)} unit="×10⁹m³" accent="text-blue-400" />
        <StatCard title="总热储量" value={result.totalHeatReservePJ} unit="×10¹²kJ" accent="text-orange-400" />
        <StatCard title="折合标煤" value={result.coalEquivalent} unit="万t" accent="text-amber-400" />
        <StatCard title="可开采热能" value={result.recoverableHeat} unit="×10¹²kJ" accent="text-red-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}Q = [ρw·cw·φ + ρr·cr·(1-φ)] × V × (T - T0)
          {' '}其中 V=F×M 为热储体积，φ为孔隙度，w为水，r为岩石。
          {' '}体积比热容 = {result.volumetricHeatCapacity} kJ/(m³·°C)，
          {' '}水中热量占比 = {Math.round(result.heatInWater / result.totalHeatReserve * 100)}%。
        </p>
      </div>

      {/* 预设地热田对比 */}
      <LazyChartCard title="各预设地热田热储量对比">
        <ChartExport data={compareData} filename="地热田热储量对比" />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '×10¹² kJ', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="热储量" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="可开采量" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各地热田温度对比">
        <ChartExport data={tempData} filename="地热田温度对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tempData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '中温地热(70°C)', fill: '#f59e0b', fontSize: 10 }} />
            <Bar dataKey="热储温度" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="井口温度" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['地热田', '位置', '面积(km²)', '厚度', '温度(°C)', '热储量(×10¹²kJ)', '折合标煤(万t)', '开采状态']}
        rows={PRESET_FIELDS.map((f, i) => [f.name, f.location, f.area, f.reservoirThickness, f.reservoirTemp, presets[i].totalHeatReservePJ, presets[i].coalEquivalent, f.status])}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="地热田总数" value={summary.fieldCount} unit="处" accent="text-red-400" />
        <StatCard title="总热储量" value={summary.totalHeat} unit="×10¹²kJ" accent="text-orange-400" />
        <StatCard title="总折合标煤" value={summary.totalCoal} unit="万t" accent="text-amber-400" />
        <StatCard title="平均热储温度" value={summary.avgTemp} unit="°C" accent="text-blue-400" />
      </div>
    </div>
  );
}

// ── 面板2: 井产能评价 ──

function WellPanel() {
  const [name, setName] = useState('自定义地热井');
  const [yieldVal, setYield] = useState(2000);
  const [wellheadTemp, setWellheadTemp] = useState(75);
  const [reinjectionTemp, setReinjectionTemp] = useState(25);
  const [depth, setDepth] = useState(3000);
  const [wellDiameter, setWellDiameter] = useState(0.2);

  const input: WellProductivityInput = {
    name, yield: yieldVal, wellheadTemp, reinjectionTemp, depth, wellDiameter,
  };
  const result = useMemo(() => calcWellProductivity(input), [input]);
  const wells = useMemo(() => calcAllPresetWells(), []);
  const summary = useMemo(() => calcGeothermalSummary(), []);

  const wellCompare = useMemo(() => wells.map((w, i) => ({
    name: PRESET_FIELDS[i].name.replace('地热田', ''),
    热功率: w.thermalPower,
    fill: GRADE_COLORS[w.productivityGrade] ?? '#6b7280',
  })), [wells]);

  return (
    <div className="space-y-4">
      <TechCard title="地热井产能参数" icon={Zap}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">井名</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">产量 (m³/d)</label>
            <input type="number" value={yieldVal} onChange={e => setYield(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">井口温度 (°C)</label>
            <input type="number" value={wellheadTemp} onChange={e => setWellheadTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">回灌温度 (°C)</label>
            <input type="number" value={reinjectionTemp} onChange={e => setReinjectionTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">井深</label>
            <input type="number" value={depth} onChange={e => setDepth(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">井径</label>
            <input type="number" step="0.01" value={wellDiameter} onChange={e => setWellDiameter(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="热功率" value={result.thermalPower} unit="kW" accent={GRADE_COLORS[result.productivityGrade]} />
        <StatCard title="年产热量" value={result.annualHeat} unit="×10⁶kWh" accent="text-orange-400" />
        <StatCard title="年折合标煤" value={result.annualCoal} unit="万t" accent="text-amber-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">产能等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.productivityGrade] }}>
            {result.productivityGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}P = Q × ρw × cw × (Tin - Tout) / 86400 (kW)，其中 Q 为日产量(m³/d)。
          {' '}产能分级：&lt;2000kW 低产，2000~5000kW 中产，5000~10000kW 高产，&ge;10000kW 特高产。
          {' '}水的焓值 = {result.enthalpy} kJ/m³，单位深度热功率 = {result.powerPerDepth} kW/m。
        </p>
      </div>

      <LazyChartCard title="各预设地热田井产能对比">
        <ChartExport data={wellCompare} filename="地热井产能对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={wellCompare} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'kW', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <ReferenceLine y={2000} stroke="#6b7280" strokeDasharray="3 3" label={{ value: '低/中', fill: '#6b7280', fontSize: 10 }} />
            <ReferenceLine y={5000} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '中/高', fill: '#3b82f6', fontSize: 10 }} />
            <ReferenceLine y={10000} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '高/特高', fill: '#ef4444', fontSize: 10 }} />
            <Bar dataKey="热功率" radius={[4, 4, 0, 0]}>
              {wellCompare.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['地热井', '产量(m³/d)', '井口温度(°C)', '热功率(kW)', '年产热(×10⁶kWh)', '折合标煤(万t)', '产能等级']}
        rows={PRESET_FIELDS.map((f, i) => [f.name, f.yield, f.wellheadTemp, wells[i].thermalPower, wells[i].annualHeat, wells[i].annualCoal, wells[i].productivityGrade])}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="总热功率" value={summary.totalPower} unit="kW" accent="text-red-400" />
        <StatCard title="最高热储温度" value={summary.maxTemp} unit="°C" accent="text-orange-400" />
        <StatCard title="总可开采热能" value={summary.totalRecoverable} unit="×10¹²kJ" accent="text-amber-400" />
      </div>
    </div>
  );
}

// ── 面板3: 地温梯度 ──

function GradientPanel() {
  const [name, setName] = useState('自定义区域');
  const [constantTempZone, setConstantTempZone] = useState(15);
  const [constantTempDepth, setConstantTempDepth] = useState(20);
  const [depth1, setDepth1] = useState(500);
  const [temp1, setTemp1] = useState(30);
  const [depth2, setDepth2] = useState(2000);
  const [temp2, setTemp2] = useState(78);
  const [thermalConductivity, setThermalConductivity] = useState(2.5);

  const input: GradientInput = {
    name, constantTempZone, constantTempDepth, depth1, temp1, depth2, temp2, thermalConductivity,
  };
  const result = useMemo(() => calcGradient(input), [input]);

  const depthProfile = useMemo(() => {
    const temps: Array<{ depth: number; 温度: number }> = [];
    for (let d = 0; d <= 3500; d += 100) {
      const t = constantTempZone + result.gradient * Math.max(0, d - constantTempDepth) / 100;
      temps.push({ depth: d, 温度: Math.round(t * 10) / 10 });
    }
    return temps;
  }, [result, constantTempZone, constantTempDepth]);

  return (
    <div className="space-y-4">
      <TechCard title="地温梯度计算参数" icon={TrendingUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">区域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">恒温带温度 (°C)</label>
            <input type="number" value={constantTempZone} onChange={e => setConstantTempZone(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">恒温带深度</label>
            <input type="number" value={constantTempDepth} onChange={e => setConstantTempDepth(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点1深度</label>
            <input type="number" value={depth1} onChange={e => setDepth1(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点1温度 (°C)</label>
            <input type="number" value={temp1} onChange={e => setTemp1(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点2深度</label>
            <input type="number" value={depth2} onChange={e => setDepth2(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点2温度 (°C)</label>
            <input type="number" value={temp2} onChange={e => setTemp2(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">岩石热导率 W/(m·K)</label>
            <input type="number" step="0.1" value={thermalConductivity} onChange={e => setThermalConductivity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="地温梯度" value={result.gradient} unit="°C/100m" accent={GRADIENT_COLORS[result.gradientGrade]} />
        <StatCard title="大地热流值" value={result.heatFlow} unit="mW/m²" accent="text-orange-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">地温等级</span>
          <span className="text-xl font-bold" style={{ color: GRADIENT_COLORS[result.gradientGrade] }}>
            {result.gradientGrade}
          </span>
        </div>
        <StatCard title="1000m温度" value={result.tempAt1000m} unit="°C" accent="text-blue-400" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard title="1000m温度" value={result.tempAt1000m} unit="°C" accent="text-blue-400" />
        <StatCard title="2000m温度" value={result.tempAt2000m} unit="°C" accent="text-amber-400" />
        <StatCard title="3000m温度" value={result.tempAt3000m} unit="°C" accent="text-red-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}G = (T2 - T1) / (Z2 - Z1) × 100  (°C/100m)，q = G/100 × λ  (mW/m²)。
          {' '}地温梯度分级：&lt;3.0 正常，3.0~3.5 偏高，3.5~4.5 高地温，&ge;4.5 异常。
          {' '}河北平原平均地温梯度3.0~4.0°C/100m，牛驼镇-雄县一带可达4.0+°C/100m，属高地温异常区。
        </p>
      </div>

      <LazyChartCard title="地温剖面图（温度-深度曲线）">
        <ChartExport data={depthProfile} filename={`${name}_地温剖面`} />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={depthProfile} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '°C', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis type="number" dataKey="depth" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '深度(m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} reversed />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="温度" fill="#ef4444" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}

// ── 面板4: 可开采量评价 ──

function ExploitablePanel() {
  const [name, setName] = useState('自定义地热田');
  const [totalHeatReserve, setTotalHeatReserve] = useState(50);
  const [recoveryFactor, setRecoveryFactor] = useState(0.20);
  const [years, setYears] = useState(50);
  const [reinjectionRate, setReinjectionRate] = useState(0.80);

  const input: ExploitableInput = {
    name, totalHeatReserve, recoveryFactor, years, reinjectionRate,
  };
  const result = useMemo(() => calcExploitable(input), [input]);

  const recoveryData = useMemo(() => {
    const factors = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40];
    return factors.map(f => ({
      factor: `${(f * 100).toFixed(0)}%`,
      可开采量: Math.round(totalHeatReserve * f * 100) / 100,
      年开采量: Math.round(totalHeatReserve * f / years * 100) / 100,
    }));
  }, [totalHeatReserve, years]);

  return (
    <div className="space-y-4">
      <TechCard title="可开采量评价参数" icon={Flame}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">地热田名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">总热储量 (×10¹²kJ)</label>
            <input type="number" value={totalHeatReserve} onChange={e => setTotalHeatReserve(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">开采系数</label>
            <input type="number" step="0.01" value={recoveryFactor} onChange={e => setRecoveryFactor(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">开采年限</label>
            <input type="number" value={years} onChange={e => setYears(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">回灌率</label>
            <input type="number" step="0.01" value={reinjectionRate} onChange={e => setReinjectionRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="可开采热能" value={result.recoverableHeat} unit="×10¹²kJ" accent="text-red-400" />
        <StatCard title="年可开采量" value={result.annualRecoverable} unit="×10¹²kJ/a" accent="text-orange-400" />
        <StatCard title="年折合标煤" value={result.annualCoal} unit="万t/a" accent="text-amber-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">服务年限评价</span>
          <span className="text-xl font-bold text-blue-400">{result.serviceLife}</span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">评价方法：</strong>
          {' '}可开采量 = 总热储量 × 开采系数，年开采量 = 可开采量 / 开采年限。
          {' '}考虑回灌率后年可开采水量增加（1+回灌率）倍。
          {' '}服务年限：&lt;30a 短期，30~100a 中期，&ge;100a 长期。
          {' '}回灌率&ge;80%是实现地热可持续开发的关键条件。
        </p>
      </div>

      <LazyChartCard title="不同开采系数下可开采量对比">
        <ChartExport data={recoveryData} filename="开采系数敏感性分析" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={recoveryData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '开采系数', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '×10¹² kJ', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="可开采量" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="年开采量" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['热储类型', '系数范围', '推荐值', '适用条件']}
        rows={RECOVERY_FACTOR_TABLE.map(r => [r.reservoirType, r.range, r.recommended, r.condition])}
      />
    </div>
  );
}

// ── 面板5: 岩石物性参考 ──

function ReferencePanel() {
  return (
    <div className="space-y-4">
      <FilterableTechTable
        headers={['岩石类型', '密度(kg/m³)', '比热容(kJ/kg·°C)', '热导率(W/m·K)', '典型产状']}
        rows={Object.entries(ROCK_PROPERTIES).map(([, v]) => [v.type, v.density, v.specificHeat, v.thermalConductivity, v.typicalSetting])}
      />
      <FilterableTechTable
        headers={['热储类型', '开采系数范围', '推荐值', '适用条件']}
        rows={RECOVERY_FACTOR_TABLE.map(r => [r.reservoirType, r.range, r.recommended, r.condition])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">热储法原理：</strong>
          {' '}热储法是地热资源量评价的基本方法，通过计算热储层中水和岩石骨架储存的热总量来评价地热资源。
          {' '}公式 Q = [ρw·cw·φ + ρr·cr·(1-φ)] × V × ΔT 中，水的贡献通过孔隙度φ加权，岩石贡献通过(1-φ)加权。
          {' '}对于低孔隙度裂隙型热储（如灰岩φ=0.05），岩石骨架贡献占主导（≥90%）；
          {' '}对于高孔隙度孔隙型热储（如砂岩φ=0.10），水的贡献可达15%以上。
        </p>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北平原地热资源特征：</strong>
          {' '}河北平原地热资源主要赋存于蓟县系雾迷山组（岩溶裂隙型）和新生界馆陶组/明化镇组（孔隙型砂岩）。
          {' '}雄县-牛驼镇-容城一带为高地温异常区，热储温度75~85°C，地温梯度3.5~4.0°C/100m。
          {' '}全省8个主要地热田总热储量约{calcGeothermalSummary().totalHeat}×10¹²kJ，
          {' '}折合标煤约{calcGeothermalSummary().totalCoal}万t，是华北平原地热资源最丰富的省份之一。
        </p>
      </div>
    </div>
  );
}

// ── 主组件 ──

export function GeothermalCalculatorTab() {
  const [panel, setPanel] = useState<'reservoir' | 'well' | 'gradient' | 'exploitable' | 'ref'>('reservoir');

  const panels = [
    { key: 'reservoir' as const, label: '热储储量', icon: Flame },
    { key: 'well' as const, label: '井产能评价', icon: Zap },
    { key: 'gradient' as const, label: '地温梯度', icon: TrendingUp },
    { key: 'exploitable' as const, label: '可开采量', icon: Calculator },
    { key: 'ref' as const, label: '参数参考', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'reservoir' && <ReservoirPanel />}
      {panel === 'well' && <WellPanel />}
      {panel === 'gradient' && <GradientPanel />}
      {panel === 'exploitable' && <ExploitablePanel />}
      {panel === 'ref' && <ReferencePanel />}

      <DataSourceNote source="河北省地热资源调查评价报告 + DZ/T 0286-2015地热能评价方法" version="B-17" />
    </div>
  );
}
