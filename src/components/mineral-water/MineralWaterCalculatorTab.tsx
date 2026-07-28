/**
 * B-22 饮用天然矿泉水水质评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入水质参数 → 界限指标/限量指标/类型判定/综合等级
 *  2. 预设水源地 — 14个产地对比评价
 *  3. 标准对比 — GB 8537 vs GB/T 14848
 *  4. 类型统计 — 矿泉水类型分布分析
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie,
} from 'recharts';
import { Calculator, MapPin, BookOpen, PieChart as PieIcon } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_SITES,
  LIMIT_INDICATOR_STANDARDS,
  CONTAMINANT_STANDARDS,
  GROUNDWATER_STANDARDS,
  calcMineralWaterEvaluation,
  calcAllPresetSites,
  calcMineralWaterSummary,
  type MineralWaterInput,
} from '../../utils/mineralWaterCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const GRADE_COLORS: Record<string, string> = {
  '合格': '#10b981',
  '界限达标': '#f59e0b',
  '不合格': '#ef4444',
};

const FIELD_DEFS: Array<{ key: keyof MineralWaterInput; label: string; step?: string }> = [
  { key: 'sio2', label: '偏硅酸 SiO₂ (mg/L)' },
  { key: 'strontium', label: '锶 Sr (mg/L)', step: '0.01' },
  { key: 'lithium', label: '锂 Li (mg/L)', step: '0.01' },
  { key: 'selenium', label: '硒 Se (mg/L)', step: '0.001' },
  { key: 'zinc', label: '锌 Zn (mg/L)', step: '0.01' },
  { key: 'freeCO2', label: '游离CO₂ (mg/L)' },
  { key: 'mineralization', label: '矿化度 (mg/L)' },
  { key: 'temperature', label: '水温 (°C)' },
  { key: 'ph', label: 'pH', step: '0.1' },
  { key: 'arsenic', label: '砷 As (mg/L)', step: '0.001' },
  { key: 'cadmium', label: '镉 Cd (mg/L)', step: '0.0001' },
  { key: 'chromium', label: '铬 Cr⁶⁺ (mg/L)', step: '0.001' },
  { key: 'lead', label: '铅 Pb (mg/L)', step: '0.001' },
  { key: 'mercury', label: '汞 Hg (mg/L)', step: '0.0001' },
  { key: 'fluoride', label: '氟化物 F⁻ (mg/L)', step: '0.1' },
  { key: 'nitrate', label: '硝酸盐 NO₃⁻ (mg/L)' },
  { key: 'cyanide', label: '氰化物 (mg/L)', step: '0.001' },
];

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  const [name, setName] = useState('自定义水源地');
  const [values, setValues] = useState<Record<string, number>>({
    sio2: 38.0, strontium: 0.35, lithium: 0.05, selenium: 0.002,
    zinc: 0.02, freeCO2: 80, mineralization: 750, temperature: 35,
    ph: 7.2, arsenic: 0.002, cadmium: 0.0005, chromium: 0.01,
    lead: 0.003, mercury: 0.0002, fluoride: 0.7, nitrate: 5, cyanide: 0.001,
  });

  const input = { name, ...values } as unknown as MineralWaterInput;
  const result = useMemo(() => calcMineralWaterEvaluation(input), [input]);

  const setField = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // 界限指标雷达图数据
  const radarData = useMemo(() => result.limitIndicators.map(r => ({
    name: r.name.split('(')[0],
    达标程度: Math.min(150, r.achievement),
    满分线: 100,
  })), [result]);

  return (
    <div className="space-y-4">
      <TechCard title="矿泉水水质参数输入" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-gw-muted block mb-1">水源地名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          {FIELD_DEFS.map(f => (
            <div key={f.key}>
              <label className="text-xs text-gw-muted block mb-1">{f.label}</label>
              <input
                type="number"
                step={f.step ?? 'any'}
                value={values[f.key as string] ?? 0}
                onChange={e => setField(f.key as string, parseFloat(e.target.value) || 0)}
                className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text"
              />
            </div>
          ))}
        </div>
      </TechCard>

      {/* 结果概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="达标界限指标" value={`${result.passedLimitCount}/${result.totalLimitCount}`} accent="text-blue-400" />
        <StatCard title="合格限量指标" value={`${result.passedContaminantCount}/${result.totalContaminantCount}`} accent="text-cyan-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">矿泉水类型</span>
          <span className="text-sm font-bold text-violet-400">{result.waterType}</span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">综合等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.grade] }}>
            {result.grade}
          </span>
        </div>
      </div>

      {/* 评价结论 */}
      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-sm text-gw-text leading-relaxed">
          <strong>评价结论：</strong>{result.conclusion}
        </p>
        <p className="text-xs text-gw-muted mt-2 leading-relaxed">
          {result.typeNote}
        </p>
      </div>

      {/* 界限指标雷达图 */}
      <LazyChartCard title="界限指标达标程度雷达图">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 150]} tick={{ fill: '#64748b', fontSize: 9 }} />
            <Radar name="达标程度(%)" dataKey="达标程度" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Radar name="达标线(100%)" dataKey="满分线" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      {/* 界限指标详表 */}
      <FilterableTechTable
        headers={['界限指标', '实测值', '单位', '界限值', '是否达标', '达标程度(%)']}
        rows={result.limitIndicators.map(r => [
          r.name, r.value, r.unit, r.threshold,
          r.passed ? '✓ 达标' : '✗ 未达标',
          r.achievement,
        ])}
      />

      {/* 限量指标详表 */}
      <FilterableTechTable
        headers={['限量指标', '实测值', '单位', '限值', '是否合格', '超标比']}
        rows={result.contaminants.map(r => [
          r.name, r.value, r.unit, r.limit,
          r.passed ? '✓ 合格' : '✗ 超标',
          r.excessRatio,
        ])}
      />
    </div>
  );
}

// ── 面板2: 预设水源地 ──

function PresetPanel() {
  const results = useMemo(() => calcAllPresetSites(), []);
  const summary = useMemo(() => calcMineralWaterSummary(), []);

  const gradeData = useMemo(() => [
    { name: '合格', value: summary.qualified, fill: GRADE_COLORS['合格'] },
    { name: '界限达标', value: summary.borderline, fill: GRADE_COLORS['界限达标'] },
    { name: '不合格', value: summary.unqualified, fill: GRADE_COLORS['不合格'] },
  ], [summary]);

  const sio2Data = useMemo(() => PRESET_SITES.map((s, i) => ({
    name: s.name,
    SiO2: s.sio2,
    Sr: s.strontium,
    界限值: 25,
    Sr界限: 0.2,
    fill: GRADE_COLORS[results[i].grade],
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="水源地总数" value={summary.siteCount} unit="处" accent="text-blue-400" />
        <StatCard title="合格" value={summary.qualified} unit="处" accent="text-emerald-400" />
        <StatCard title="平均SiO₂" value={summary.avgSiO2} unit="mg/L" accent="text-cyan-400" />
        <StatCard title="平均锶" value={summary.avgSr} unit="mg/L" accent="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="水质等级分布">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={gradeData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                {gradeData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各水源地SiO₂与锶含量">
          <ChartExport data={sio2Data} filename="矿泉水指标对比" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sio2Data} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-25} textAnchor="end" height={70} />
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'SiO₂(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Sr(mg/L)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine yAxisId="left" y={25} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'SiO₂界限(25)', fill: '#ef4444', fontSize: 9 }} />
              <Bar yAxisId="left" dataKey="SiO2" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="right" dataKey="Sr" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <FilterableTechTable
        headers={['水源地', 'SiO₂(mg/L)', 'Sr(mg/L)', '矿化度(mg/L)', '水温(°C)', 'pH', '达标界限数', '类型', '综合等级', '结论']}
        rows={PRESET_SITES.map((s, i) => [
          s.name, s.sio2, s.strontium, s.mineralization, s.temperature, s.ph,
          `${results[i].passedLimitCount}/${results[i].totalLimitCount}`,
          results[i].waterType, results[i].grade, results[i].conclusion.substring(0, 30) + '...',
        ])}
      />
    </div>
  );
}

// ── 面板3: 标准对比 ──

function StandardPanel() {
  return (
    <div className="space-y-4">
      <FilterableTechTable
        headers={['界限指标', '界限值', '单位', '比较方式']}
        rows={LIMIT_INDICATOR_STANDARDS.map(s => [s.name, `≥ ${s.threshold}`, s.unit, s.compareOp])}
      />

      <FilterableTechTable
        headers={['限量指标', '限值', '单位']}
        rows={CONTAMINANT_STANDARDS.map(s => [s.name, `≤ ${s.limit}`, s.unit])}
      />

      <FilterableTechTable
        headers={['指标', 'GB/T 14848 III类', 'GB/T 14848 II类', '单位']}
        rows={GROUNDWATER_STANDARDS.map(s => [s.name, s.class3, s.class2, s.unit])}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gw-card-alt rounded-lg p-4">
          <p className="text-xs text-gw-muted leading-relaxed">
            <strong className="text-gw-text">GB 8537-2018 界限指标要求：</strong>
            {' '}饮用天然矿泉水须至少有一项界限指标达标。
            {' '}河北省矿泉水以偏硅酸型为主（SiO₂≥25mg/L），部分水源地同时达标锶（Sr≥0.2mg/L），
            {' '}属偏硅酸锶复合型，品质优良。
          </p>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-4">
          <p className="text-xs text-gw-muted leading-relaxed">
            <strong className="text-gw-text">与GB/T 14848对比：</strong>
            {' '}矿泉水标准（GB 8537）的限量指标通常严于或等同于地下水III类标准。
            {' '}例如硝酸盐：矿泉水≤45mg/L vs 地下水III类≤30mg/L；
            {' '}氟化物：矿泉水≤1.5mg/L vs 地下水III类≤1.0mg/L。
            {' '}矿泉水标准允许范围略宽，因矿泉水的天然地质背景特性。
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 面板4: 类型统计 ──

function TypePanel() {
  const summary = useMemo(() => calcMineralWaterSummary(), []);

  const typePieData = useMemo(() =>
    Object.entries(summary.typeCounts).map(([k, v]) => ({ name: k, value: v })),
    [summary],
  );

  const TYPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const tempData = useMemo(() => PRESET_SITES.map(s => ({
    name: s.name,
    水温: s.temperature,
    SiO2: s.sio2,
  })), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="最高SiO₂" value={summary.maxSiO2} unit="mg/L" accent="text-blue-400" />
        <StatCard title="最高锶" value={summary.maxSr} unit="mg/L" accent="text-amber-400" />
        <StatCard title="合格率" value={`${Math.round(summary.qualified / summary.siteCount * 100)}%`} accent="text-emerald-400" />
        <StatCard title="类型数" value={Object.keys(summary.typeCounts).length} unit="种" accent="text-violet-400" />
      </div>

      <LazyChartCard title="矿泉水类型分布">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={typePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
              {typePieData.map((_, idx) => (
                <Cell key={idx} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各水源地水温与SiO₂对比">
        <ChartExport data={tempData} filename="矿泉水水温SiO2对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tempData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-25} textAnchor="end" height={70} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'mg/L', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="left" y={25} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '温水界限(25°C)', fill: '#ef4444', fontSize: 9 }} />
            <Bar yAxisId="left" dataKey="水温" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="SiO2" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北省矿泉水特征：</strong>
          {' '}河北省矿泉水以偏硅酸型为主导（SiO₂ 22~45mg/L），约57%的水源地属此类型。
          {' '}偏硅酸锶复合型约占29%，品质最优。锶型约占14%，集中分布在隆化、涞水、涉县等地。
          {' '}水温方面，平山温塘（68°C）和赤城汤泉（58°C）属温热矿泉水，具有理疗价值。
          {' '}14处水源地中{summary.qualified}处综合评价合格，合格率{Math.round(summary.qualified / summary.siteCount * 100)}%。
        </p>
      </div>
    </div>
  );
}

// ── 主组件 ──

export function MineralWaterCalculatorTab() {
  const [panel, setPanel] = useState<'calc' | 'preset' | 'standard' | 'type'>('calc');

  const panels = [
    { key: 'calc' as const, label: '计算器', icon: Calculator },
    { key: 'preset' as const, label: '预设水源地', icon: MapPin },
    { key: 'standard' as const, label: '标准对比', icon: BookOpen },
    { key: 'type' as const, label: '类型统计', icon: PieIcon },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'calc' && <CalculatorPanel />}
      {panel === 'preset' && <PresetPanel />}
      {panel === 'standard' && <StandardPanel />}
      {panel === 'type' && <TypePanel />}

      <DataSourceNote source="GB 8537-2018 饮用天然矿泉水 + GB/T 14848-2017 地下水质量标准" version="B-22" />
    </div>
  );
}
