/**
 * B-23 土壤盐渍化评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入土壤参数 → 盐分分级/类型判定/淋洗需水量/改良预测/临界深度
 *  2. 预设分区 — 8个河北平原盐渍化分区对比评价
 *  3. 盐分分级标准 — 5级分级标准参考
 *  4. 质地参数 — 不同质地毛细参数与改良建议
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter,
} from 'recharts';
import { Calculator, MapPin, BookOpen, Layers } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_ZONES,
  SALT_GRADE_STANDARDS,
  PH_GRADE_STANDARDS,
  TEXTURE_PARAMS,
  calcSalinizationEvaluation,
  calcAllPresetZones,
  calcSalinizationSummary,
  type SalinizationInput,
} from '../../utils/soilSalinizationCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const GRADE_COLORS: Record<string, string> = {
  '无盐渍化': '#10b981',
  '轻度盐渍化': '#06b6d4',
  '中度盐渍化': '#f59e0b',
  '重度盐渍化': '#f97316',
  '极重度盐渍化': '#ef4444',
  '非碱化': '#10b981',
  '轻度碱化': '#f59e0b',
  '中度碱化': '#f97316',
  '重度碱化': '#ef4444',
};

const ACCENT_MAP: Record<string, string> = {
  'emerald': 'emerald', 'cyan': 'cyan', 'amber': 'amber',
  'orange': 'orange', 'red': 'red', 'blue': 'blue',
};

const FIELD_DEFS: Array<{ key: keyof SalinizationInput; label: string; step?: string }> = [
  { key: 'totalSalt', label: '全盐量 (g/kg)', step: '0.1' },
  { key: 'ecE', label: '电导率 EC_e (dS/m)', step: '0.1' },
  { key: 'ph', label: 'pH', step: '0.1' },
  { key: 'chloride', label: 'Cl⁻ (cmol/kg)', step: '0.1' },
  { key: 'sulfate', label: 'SO₄²⁻ (cmol/kg)', step: '0.1' },
  { key: 'bicarbonate', label: 'HCO₃⁻ (cmol/kg)', step: '0.1' },
  { key: 'carbonate', label: 'CO₃²⁻ (cmol/kg)', step: '0.1' },
  { key: 'sodium', label: 'Na⁺ (cmol/kg)', step: '0.1' },
  { key: 'calcium', label: 'Ca²⁺ (cmol/kg)', step: '0.1' },
  { key: 'magnesium', label: 'Mg²⁺ (cmol/kg)', step: '0.1' },
  { key: 'gwMineralization', label: '地下水矿化度 (g/L)', step: '0.1' },
  { key: 'gwDepth', label: '地下水埋深 (m)', step: '0.1' },
  { key: 'irrigationEC', label: '灌溉水EC_dw (dS/m)', step: '0.1' },
  { key: 'cropThreshold', label: '作物耐盐阈值 EC_t (dS/m)', step: '0.1' },
];

const TEXTURE_OPTIONS = ['砂土', '砂壤', '轻壤', '中壤', '重壤', '黏土'];

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  const [name, setName] = useState('自定义采样点');
  const [soilTexture, setSoilTexture] = useState('中壤');
  const [values, setValues] = useState<Record<string, number>>({
    totalSalt: 3.5, ecE: 9.0, ph: 8.5,
    chloride: 3.8, sulfate: 3.0, bicarbonate: 0.6, carbonate: 0,
    sodium: 4.5, calcium: 1.4, magnesium: 1.5,
    gwMineralization: 4.5, gwDepth: 1.5,
    irrigationEC: 1.1, cropThreshold: 4.0,
  });

  const input = { name, soilTexture, ...values } as unknown as SalinizationInput;
  const result = useMemo(() => calcSalinizationEvaluation(input), [input]);

  const setField = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // 雷达图数据：阴离子当量
  const anionRadar = [
    { ion: 'Cl⁻', value: input.chloride },
    { ion: 'SO₄²⁻', value: input.sulfate },
    { ion: 'HCO₃⁻', value: input.bicarbonate },
    { ion: 'CO₃²⁻', value: input.carbonate },
    { ion: 'Na⁺', value: input.sodium },
    { ion: 'Ca²⁺', value: input.calcium },
    { ion: 'Mg²⁺', value: input.magnesium },
  ];

  // 改良曲线数据
  const reclamationCurve = useMemo(() => {
    const pts: Array<{ year: string; salt: number; target: number }> = [];
    let salt = input.totalSalt;
    const annualRate = result.reclamation.annualDesalinationRate / 100;
    for (let y = 0; y <= result.reclamation.reclamationYears + 2; y++) {
      pts.push({ year: `第${y}年`, salt: Math.round(salt * 100) / 100, target: 1.5 });
      salt = salt * (1 - annualRate);
    }
    return pts;
  }, [input.totalSalt, result.reclamation]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入面板 */}
        <TechCard title="土壤参数输入" badge="参数设置" icon={Calculator}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input value={name} onChange={e => setName(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text" />
              <select value={soilTexture} onChange={e => setSoilTexture(e.target.value)}
                className="px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text">
                {TEXTURE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_DEFS.map(f => (
                <div key={f.key} className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-gw-muted">{f.label}</label>
                  <input type="number" step={f.step ?? 'any'} value={values[f.key as string] ?? 0}
                    onChange={e => setField(f.key as string, parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono" />
                </div>
              ))}
            </div>
          </div>
        </TechCard>

        {/* 评价结果 */}
        <div className="space-y-3">
          <TechCard title="盐分分级评价" badge={result.overallGrade} icon={Layers}>
            <div className="grid grid-cols-3 gap-2">
              {result.saltGrades.map((g, i) => (
                <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                  <div className="text-[10px] text-gw-muted">{g.indicator}</div>
                  <div className="text-lg font-mono text-gw-highlight">{g.value}<span className="text-[10px] text-gw-muted ml-0.5">{g.unit}</span></div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5 bg-${ACCENT_MAP[g.color] ?? 'blue'}-500/15 text-${ACCENT_MAP[g.color] ?? 'blue'}-400`}>{g.grade}</div>
                  <div className="text-[9px] text-gw-muted mt-0.5 leading-tight">{g.description}</div>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="盐分类型判定" badge={result.saltType.primaryType}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">Cl⁻/SO₄²⁻比: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.clSo4Ratio}</span>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">HCO₃⁻比值: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.hco3Ratio}</span>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">钠吸附比SAR: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.sar}</span>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">碱化度ESP: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.esp}%</span>
              </div>
            </div>
            <p className="text-[10px] text-gw-muted mt-2">{result.saltType.note}</p>
          </TechCard>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="离子组成雷达图" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={anionRadar}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="ion" tick={{ fill: '#64748b', fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="改良脱盐预测曲线" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={reclamationCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={40} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: 'g/kg', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="全盐量变化" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="salt" name="全盐量(g/kg)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="5 5" label={{ value: '改良目标', fill: '#10b981', fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 淋洗与临界深度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="淋洗需水量计算（FAO方法）" badge={`LR=${(result.leaching.lr * 100).toFixed(0)}%`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">淋洗比例LR</div>
              <div className="text-base font-mono text-gw-highlight">{(result.leaching.lr * 100).toFixed(0)}%</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">淋洗水量</div>
              <div className="text-base font-mono text-gw-cyan">{result.leaching.leachingVolume} m³/ha</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">排盐量</div>
              <div className="text-base font-mono text-amber-400">{result.leaching.saltRemoval} t/ha</div>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted">{result.leaching.suggestion}</p>
          <div className="mt-2 text-[10px] text-gw-muted">
            公式：LR = EC_dw / (EC_e × 5) = {input.irrigationEC} / ({input.ecE} × 5) = {result.leaching.lr.toFixed(3)}
          </div>
        </TechCard>

        <TechCard title="地下水临界深度判断" badge={result.criticalDepth.riskLevel}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">实际埋深</div>
              <div className="text-base font-mono text-gw-text">{result.criticalDepth.gwDepth} m</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">临界深度</div>
              <div className="text-base font-mono text-amber-400">{result.criticalDepth.criticalDepth} m</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">安全深度</div>
              <div className="text-base font-mono text-emerald-400">{result.criticalDepth.safeDepth} m</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">毛细上升</div>
              <div className="text-base font-mono text-gw-cyan">{result.criticalDepth.capillaryRise} m</div>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted">{result.criticalDepth.suggestion}</p>
        </TechCard>
      </div>

      {/* 改良预测 */}
      <TechCard title="改良效果预测" badge={result.reclamation.difficulty}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">初始全盐量</div>
            <div className="text-base font-mono text-red-400">{result.reclamation.initialSalt.toFixed(1)} g/kg</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">目标全盐量</div>
            <div className="text-base font-mono text-emerald-400">{result.reclamation.targetSalt.toFixed(1)} g/kg</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">年脱盐率</div>
            <div className="text-base font-mono text-gw-highlight">{result.reclamation.annualDesalinationRate}%</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">改良年限</div>
            <div className="text-base font-mono text-amber-400">{result.reclamation.reclamationYears} 年</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gw-surface/50 rounded">
            <span className="text-gw-muted">年排盐量: </span>
            <span className="font-mono text-gw-cyan">{result.reclamation.annualSaltRemoval} t/ha</span>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded">
            <span className="text-gw-muted">总排盐量: </span>
            <span className="font-mono text-gw-cyan">{result.reclamation.totalSaltRemoval} t/ha</span>
          </div>
        </div>
        <p className="text-[10px] text-gw-muted mt-2">{result.reclamation.suggestion}</p>
      </TechCard>

      {/* 综合结论 */}
      <TechCard title="综合评价结论" icon={BookOpen}>
        <p className="text-sm text-gw-text leading-relaxed">{result.conclusion}</p>
      </TechCard>
    </div>
  );
}

// ── 面板2: 预设分区 ──

function PresetZonesPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);
  const summary = useMemo(() => calcSalinizationSummary(), []);

  const gradeBarData = useMemo(() => {
    const order = ['无盐渍化', '轻度盐渍化', '中度盐渍化', '重度盐渍化', '极重度盐渍化'];
    return order.map(g => ({
      name: g,
      count: summary.gradeCounts[g] || 0,
      color: GRADE_COLORS[g],
    }));
  }, [summary]);

  const scatterData = useMemo(() => results.map(r => ({
    name: r.name,
    salt: PRESET_ZONES.find(z => z.name === r.name)?.totalSalt ?? 0,
    depth: PRESET_ZONES.find(z => z.name === r.name)?.gwDepth ?? 0,
    grade: r.overallGrade,
    color: GRADE_COLORS[r.overallGrade] ?? '#64748b',
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="盐渍化分区" value={summary.zoneCount} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="平均全盐量" value={summary.avgSalt} unit="g/kg" icon={Layers} accent="amber" />
        <StatCard title="平均EC_e" value={summary.avgEC} unit="dS/m" icon={Calculator} accent="red" />
        <StatCard title="平均改良年限" value={summary.avgYears} unit="年" icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分区盐渍化等级分布" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={gradeBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-25} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
              <Tooltip content={<ChartTooltip title="等级分布" />} />
              <Bar dataKey="count" name="分区数" radius={[2, 2, 0, 0]}>
                {gradeBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="全盐量 vs 地下水埋深" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="depth" name="地下水埋深" unit="m" stroke="#64748b" fontSize={10} domain={[0, 5]} />
              <YAxis type="number" dataKey="salt" name="全盐量" unit="g/kg" stroke="#64748b" fontSize={10} domain={[0, 7]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4">
                {scatterData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Scatter>
              <ReferenceLine x={2.5} stroke="#f59e0b" strokeDasharray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="各分区综合评价结果">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            分区: r.name,
            综合等级: r.overallGrade,
            盐分类型: r.saltType.primaryType,
            全盐量gkg: PRESET_ZONES.find(z => z.name === r.name)?.totalSalt ?? 0,
            EC_e: PRESET_ZONES.find(z => z.name === r.name)?.ecE ?? 0,
            pH: PRESET_ZONES.find(z => z.name === r.name)?.ph ?? 0,
            SAR: r.saltType.sar,
            ESP: r.saltType.esp,
            淋洗比例: (r.leaching.lr * 100).toFixed(0) + '%',
            淋洗水量m3ha: r.leaching.leachingVolume,
            改良年限: r.reclamation.reclamationYears,
            改良难度: r.reclamation.difficulty,
            地下水风险: r.criticalDepth.riskLevel,
          }))} filename="salinization-evaluation" sheetName="盐渍化评价" formats={['xlsx', 'csv', 'json']} label="导出评价结果" />
        </div>
        <FilterableTechTable
          headers={['分区', '综合等级', '盐分类型', '全盐量(g/kg)', 'EC_e(dS/m)', 'pH', 'SAR', 'ESP(%)', 'LR(%)', '改良年限', '地下水风险']}
          rows={results.map(r => {
            const zone = PRESET_ZONES.find(z => z.name === r.name);
            return [
              r.name, r.overallGrade, r.saltType.primaryType,
              String(zone?.totalSalt ?? 0), String(zone?.ecE ?? 0), String(zone?.ph ?? 0),
              String(r.saltType.sar), String(r.saltType.esp),
              String(Math.round(r.leaching.lr * 100)),
              String(r.reclamation.reclamationYears),
              r.criticalDepth.riskLevel,
            ];
          })}
          filterPlaceholder="搜索分区..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板3: 盐分分级标准 ──

function GradeStandardsPanel() {
  return (
    <div className="space-y-4">
      <TechCard title="土壤盐分分级标准" badge="全盐量+EC_e">
        <FilterableTechTable
          headers={['等级', '全盐量(g/kg)', 'EC_e(dS/m)', '说明', '颜色标识']}
          rows={SALT_GRADE_STANDARDS.map(s => [
            s.grade,
            s.saltMax === Infinity ? '>6.0' : `≤${s.saltMax}`,
            s.ecMax === Infinity ? '>16' : `≤${s.ecMax}`,
            s.description,
            s.color,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="土壤碱化分级标准" badge="pH指标">
        <FilterableTechTable
          headers={['等级', 'pH范围', '说明', '颜色标识']}
          rows={PH_GRADE_STANDARDS.map(s => [
            s.grade,
            s.phMax === Infinity ? `≥${s.phMin}` : `${s.phMin}~${s.phMax}`,
            s.description,
            s.color,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="盐分类型判定规则" badge="阴离子当量比">
        <div className="space-y-2">
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">Cl⁻/SO₄²⁻ 当量比判定</div>
            <div className="text-[10px] text-gw-muted mt-1">
              <span className="font-mono text-gw-highlight">≥4</span>: 氯化物型 | 
              <span className="font-mono text-gw-highlight"> 1~4</span>: 硫酸盐-氯化物型 | 
              <span className="font-mono text-gw-highlight"> 0.25~1</span>: 氯化物-硫酸盐型 | 
              <span className="font-mono text-gw-highlight"> &lt;0.25</span>: 硫酸盐型
            </div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">HCO₃⁻/(Cl⁻+SO₄²⁻) 比值判定</div>
            <div className="text-[10px] text-gw-muted mt-1">
              <span className="font-mono text-gw-highlight">&gt;1</span>: 苏打型（碱化严重） | 
              <span className="font-mono text-gw-highlight"> ≤1</span>: 非苏打型
            </div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">钠吸附比 SAR 与碱化度 ESP</div>
            <div className="text-[10px] text-gw-muted mt-1">
              SAR = Na⁺ / √((Ca²⁺ + Mg²⁺)/2)，ESP ≈ 100×(-0.0126 + 0.01475×SAR)。ESP&gt;15%为碱化土，需施用石膏等改良剂。
            </div>
          </div>
        </div>
      </TechCard>

      <TechCard title="淋洗需水量计算方法" badge="FAO方法">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">FAO 稳态淋洗公式</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">LR = EC_dw / (EC_e × 5)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              LR: 淋洗需水量比例 | EC_dw: 灌溉水电导率(dS/m) | EC_e: 饱和泥浆电导率(dS/m)
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">总灌水量计算</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">总灌水量 = 净需水量 / (1 - LR)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              净需水量按作物ET估算（默认600mm/季）。淋洗水量 = 总灌水量 × LR。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">排盐量估算</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">排盐量 = 淋洗水量 × 排水EC × 0.064 (t/ha)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              排水EC ≈ 5 × EC_e（稳态假设）。转换系数0.064由 dS/m → g/L 和 m³/ha → t/ha 推导。
            </div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="FAO Irrigation and Drainage Paper 29 | 土壤学| 河北省盐碱地调查" version="B-23" />
    </div>
  );
}

// ── 面板4: 质地参数 ──

function TextureParamsPanel() {
  const capillaryData = TEXTURE_PARAMS.map(t => ({
    name: t.texture,
    capillary: t.capillaryRise,
    critical: t.capillaryRise + t.criticalExtra,
    permeability: t.permeability,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="质地类型" value={TEXTURE_PARAMS.length} unit="种" icon={Layers} accent="blue" />
        <StatCard title="毛细上升范围" value="1.0~3.5" unit="m" icon={Calculator} accent="amber" />
        <StatCard title="渗透系数范围" value="0.08~1.5" unit="m/d" icon={MapPin} accent="emerald" />
        <StatCard title="改良参考" value="6" unit="类" icon={BookOpen} accent="cyan" />
      </div>

      <LazyChartCard title="各质地毛细上升与临界深度" height={280}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={capillaryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'm', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip unit="m" title="毛细参数" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="capillary" name="毛细水上升高度(m)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar dataKey="critical" name="临界深度(m)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="土壤质地毛细参数详表" badge="改良参考">
        <FilterableTechTable
          headers={['质地', '毛细水上升(m)', '临界附加(m)', '临界深度(m)', '渗透系数(m/d)', '改良建议']}
          rows={TEXTURE_PARAMS.map(t => {
            const critical = t.capillaryRise + t.criticalExtra;
            let advice: string;
            if (t.permeability > 1.0) advice = '排水良好，改良容易';
            else if (t.permeability > 0.3) advice = '排水中等，需适当排水';
            else if (t.permeability > 0.1) advice = '排水较差，需暗管排水';
            else advice = '排水困难，需综合改良';
            return [t.texture, String(t.capillaryRise), String(t.criticalExtra), critical.toFixed(1), String(t.permeability), advice];
          })}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="改良措施选择建议" badge="因地制宜">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-emerald-400">轻度盐渍化（全盐量1~2 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">农业措施为主：选用耐盐品种、增施有机肥、秸秆覆盖减少蒸发。配合适量淡水灌溉淋洗。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-amber-400">中度盐渍化（全盐量2~4 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">水利+农业措施结合：建设排水系统、淡水灌溉淋洗、种植绿肥作物（田菁、草木樨）、磷石膏改良。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-orange-400">重度盐渍化（全盐量4~6 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">工程改良为主：暗管排盐、淡水洗盐、客土改良、施用脱硫石膏。先种植盐生植物（碱蓬、盐角草）生物改良。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-red-400">极重度盐渍化（全盐量≥6 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">综合改良：工程排水+淡水洗盐+化学改良+生物改良多管齐下。改良周期长（10年以上），宜先做水产养殖或盐生植物利用。</div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="《土壤学》| FAO Paper 29 | 河北省盐碱地综合治理" version="B-23" />
    </div>
  );
}

// ── 主组件 ──

export function SoilSalinizationCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'zones' | 'standards' | 'texture'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'zones' as const, label: '预设分区', icon: MapPin },
    { key: 'standards' as const, label: '分级标准', icon: BookOpen },
    { key: 'texture' as const, label: '质地参数', icon: Layers },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activePanel === p.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 'calculator' && <CalculatorPanel />}
      {activePanel === 'zones' && <PresetZonesPanel />}
      {activePanel === 'standards' && <GradeStandardsPanel />}
      {activePanel === 'texture' && <TextureParamsPanel />}
    </div>
  );
}
