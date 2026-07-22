/**
 * B-14 水文地质分区参数计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入分区参数→T/补给量/可开采量/储存量/模数
 *  2. 预设分区 — 7大系统区资源量对比
 *  3. 入渗系数参考 — 10类岩性α值查表
 *  4. 给水度参考 — 8类岩性μ值查表
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Calculator, MapPin, BookOpen, Database } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_ZONES,
  INFILTRATION_COEFF_TABLE,
  SPECIFIC_YIELD_TABLE,
  type ZoneParamInput,
  calcZoneParams,
  calcAllPresetZones,
} from '../../utils/zoneParamCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const BALANCE_COLORS: Record<string, string> = {
  '正均衡': '#10b981',
  '基本平衡': '#3b82f6',
  '负均衡': '#ef4444',
};

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  const [name, setName] = useState('自定义分区');
  const [area, setArea] = useState(10000);
  const [K, setK] = useState(50);
  const [M, setM] = useState(60);
  const [mu, setMu] = useState(0.15);
  const [precipitation, setPrecipitation] = useState(500);
  const [infiltrationCoeff, setInfiltrationCoeff] = useState(0.15);
  const [lateralRecharge, setLateralRecharge] = useState(5000);
  const [riverLeakage, setRiverLeakage] = useState(2000);
  const [canalLeakage, setCanalLeakage] = useState(1000);
  const [irrigationReturn, setIrrigationReturn] = useState(1500);
  const [extraction, setExtraction] = useState(8000);
  const [allowableCoeff, setAllowableCoeff] = useState(0.80);
  const [deltaH, setDeltaH] = useState(4);

  const input: ZoneParamInput = {
    name, area, K, M, mu, precipitation, infiltrationCoeff,
    lateralRecharge, riverLeakage, canalLeakage, irrigationReturn,
    extraction, allowableCoeff, deltaH,
  };

  const result = useMemo(() => calcZoneParams(input), [name, area, K, M, mu, precipitation, infiltrationCoeff, lateralRecharge, riverLeakage, canalLeakage, irrigationReturn, extraction, allowableCoeff, deltaH]);

  const loadPreset = (preset: typeof PRESET_ZONES[number]) => {
    const p = preset.input;
    setName(p.name); setArea(p.area); setK(p.K); setM(p.M); setMu(p.mu);
    setPrecipitation(p.precipitation); setInfiltrationCoeff(p.infiltrationCoeff);
    setLateralRecharge(p.lateralRecharge); setRiverLeakage(p.riverLeakage);
    setCanalLeakage(p.canalLeakage); setIrrigationReturn(p.irrigationReturn);
    setExtraction(p.extraction); setAllowableCoeff(p.allowableCoeff); setDeltaH(p.deltaH);
  };

  const fields: Array<{ label: string; value: string | number; set: (v: string | number) => void; type?: string }> = [
    { label: '分区名称', value: name, set: (v) => setName(String(v)), type: 'text' },
    { label: '面积 F (km²)', value: area, set: (v) => setArea(Number(v)) },
    { label: '渗透系数 K (m/d)', value: K, set: (v) => setK(Number(v)) },
    { label: '含水层厚度 M (m)', value: M, set: (v) => setM(Number(v)) },
    { label: '给水度 μ', value: mu, set: (v) => setMu(Number(v)) },
    { label: '年降水量 P (mm)', value: precipitation, set: (v) => setPrecipitation(Number(v)) },
    { label: '入渗系数 α', value: infiltrationCoeff, set: (v) => setInfiltrationCoeff(Number(v)) },
    { label: '侧向径流补给 (万m³/a)', value: lateralRecharge, set: (v) => setLateralRecharge(Number(v)) },
    { label: '河流渗漏补给 (万m³/a)', value: riverLeakage, set: (v) => setRiverLeakage(Number(v)) },
    { label: '渠系渗漏补给 (万m³/a)', value: canalLeakage, set: (v) => setCanalLeakage(Number(v)) },
    { label: '灌溉回渗补给 (万m³/a)', value: irrigationReturn, set: (v) => setIrrigationReturn(Number(v)) },
    { label: '现状开采量 (万m³/a)', value: extraction, set: (v) => setExtraction(Number(v)) },
    { label: '允许开采系数', value: allowableCoeff, set: (v) => setAllowableCoeff(Number(v)) },
    { label: '水位变幅 Δh (m)', value: deltaH, set: (v) => setDeltaH(Number(v)) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <TechCard icon={Calculator} title="分区参数输入" badge="输入">
          <div className="grid grid-cols-2 gap-2">
            {fields.map(f => (
              <div key={f.label}>
                <label className="text-xs text-gw-muted">{f.label}</label>
                <input
                  type={f.type === 'text' ? 'text' : 'number'}
                  step="any"
                  value={f.value}
                  onChange={e => f.type === 'text' ? f.set(e.target.value) : f.set(Number(e.target.value) || 0)}
                  className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-xs"
                />
              </div>
            ))}
          </div>
          {/* 预设快捷加载 */}
          <div className="mt-2">
            <label className="text-xs text-gw-muted">快捷加载预设</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {PRESET_ZONES.map(p => (
                <button key={p.code} onClick={() => loadPreset(p)}
                  className="px-2 py-1 rounded text-[10px] bg-gw-surface border border-gw-border/30 text-gw-muted hover:bg-gw-border/30 transition-all">
                  {p.code} {p.name}
                </button>
              ))}
            </div>
          </div>
        </TechCard>

        {/* 结果区 */}
        <TechCard icon={Database} title="计算结果" badge={result.balanceStatus}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard title="导水系数 T" value={`${result.T.toLocaleString()}`} unit="m²/d" subtitle={`K×M = ${K}×${M}`} accent="blue" />
            <StatCard title="总补给量" value={`${result.totalRecharge.toLocaleString()}`} unit="万m³/a" subtitle={`降水${result.rainfallRecharge.toLocaleString()}`} accent="cyan" />
            <StatCard title="可开采量" value={`${result.allowableExtraction.toLocaleString()}`} unit="万m³/a" subtitle={`系数${allowableCoeff}`} accent="emerald" />
            <StatCard title="均衡差" value={`${result.balance.toLocaleString()}`} unit="万m³/a" subtitle={result.balanceStatus} accent={result.balance >= 0 ? 'emerald' : 'red'} />
            <StatCard title="开采系数" value={result.exploitationCoeff.toFixed(3)} subtitle={result.exploitationCoeff > 1 ? '超采' : '正常'} accent={result.exploitationCoeff > 1 ? 'red' : 'green'} />
            <StatCard title="储存调节量" value={`${result.storageRegulation.toLocaleString()}`} unit="万m³" subtitle={`μ×F×Δh`} accent="violet" />
          </div>
          <div className="p-2 rounded-lg bg-gw-surface text-xs text-gw-muted">
            <p>{result.description}</p>
            <p className="mt-1">补给模数: <span className="text-blue-400 font-mono">{result.rechargeModulus}</span> 万m³/km²·a | 开采模数: <span className="text-amber-400 font-mono">{result.extractionModulus}</span> 万m³/km²·a</p>
          </div>
        </TechCard>
      </div>
    </div>
  );
}

// ── 面板2: 预设分区对比 ──

function PresetZonesPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);

  const modulusData = useMemo(() =>
    results.map(r => ({
      name: r.name,
      '补给模数': r.rechargeModulus,
      '开采模数': r.extractionModulus,
    })),
    [results],
  );

  return (
    <div className="space-y-4">
      <TechCard icon={MapPin} title="河北地下水系统区参数对比" badge={`${results.length}个分区`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">分区</th>
                <th className="text-right p-2 text-gw-muted">T(m²/d)</th>
                <th className="text-right p-2 text-gw-muted">补给量(万m³/a)</th>
                <th className="text-right p-2 text-gw-muted">可开采量</th>
                <th className="text-right p-2 text-gw-muted">开采系数</th>
                <th className="text-right p-2 text-gw-muted">补给模数</th>
                <th className="text-right p-2 text-gw-muted">开采模数</th>
                <th className="text-left p-2 text-gw-muted">均衡状态</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.name} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.name}</td>
                  <td className="p-2 text-right font-mono text-blue-400">{r.T.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-gw-text">{r.totalRecharge.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-emerald-400">{r.allowableExtraction.toLocaleString()}</td>
                  <td className={`p-2 text-right font-mono ${r.exploitationCoeff > 1 ? 'text-red-400 font-semibold' : 'text-gw-text'}`}>{r.exploitationCoeff.toFixed(3)}</td>
                  <td className="p-2 text-right font-mono text-cyan-400">{r.rechargeModulus}</td>
                  <td className="p-2 text-right font-mono text-amber-400">{r.extractionModulus}</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: BALANCE_COLORS[r.balanceStatus] + '20', color: BALANCE_COLORS[r.balanceStatus] }}>
                      {r.balanceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分区补给量与开采量对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={results} filename="分区参数对比" sheetName="参数对比" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={results} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" 万m³" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="totalRecharge" name="总补给量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="allowableExtraction" name="可开采量" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="补给模数 vs 开采模数" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={modulusData} filename="模数对比" sheetName="模数" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={modulusData} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" 万m³/km²" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="补给模数" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="开采模数" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
    </div>
  );
}

// ── 面板3: 入渗系数参考 ──

function InfiltrationRefPanel() {
  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="降水入渗系数参考表">
        <p className="text-xs text-gw-muted mb-3">降水入渗补给量 = P × α × F × 0.1 (万m³/a)，其中P为年降水量(mm)，α为入渗系数，F为面积(km²)</p>
        <FilterableTechTable
          headers={['岩性/介质', '入渗系数范围', '典型值', '适用区域']}
          rows={INFILTRATION_COEFF_TABLE.map(r => [r.lithology, r.range, String(r.typical), r.zone])}
          filterPlaceholder="搜索岩性或区域..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板4: 给水度参考 ──

function SpecificYieldRefPanel() {
  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="给水度参考表">
        <p className="text-xs text-gw-muted mb-3">储存调节量 V = μ × F × Δh × 0.1 (万m³)，其中μ为给水度，F为面积(km²)，Δh为水位变幅(m)</p>
        <FilterableTechTable
          headers={['岩性', '给水度范围', '典型值']}
          rows={SPECIFIC_YIELD_TABLE.map(r => [r.lithology, r.range, String(r.typical)])}
          filterPlaceholder="搜索岩性..."
        />
      </TechCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════

const SUB_TABS = [
  { key: 'calc', label: '参数计算器', icon: Calculator },
  { key: 'preset', label: '预设分区', icon: MapPin },
  { key: 'infiltration', label: '入渗系数', icon: BookOpen },
  { key: 'yield', label: '给水度', icon: Database },
] as const;

type SubTabKey = typeof SUB_TABS[number]['key'];

export function ZoneParamCalculatorTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('calc');

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-cyan-400" />
          <span className="text-sm text-cyan-400 font-medium">水文地质分区参数计算器</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">输入分区水文地质参数，计算导水系数、补给资源量、可开采量、储存调节量及资源模数，服务地下水资源评价章节</p>
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'calc' && <CalculatorPanel />}
      {activeSubTab === 'preset' && <PresetZonesPanel />}
      {activeSubTab === 'infiltration' && <InfiltrationRefPanel />}
      {activeSubTab === 'yield' && <SpecificYieldRefPanel />}

      <DataSourceNote source="河北省地下水系统区划(1999) | GB/T 14848-2017 | 水文地质手册" />
    </div>
  );
}
