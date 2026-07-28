/**
 * B-24 地下水功能评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入14项指标 → 四维度评分+综合评价
 *  2. 预设分区 — 6个河北典型功能区对比
 *  3. 评分标准 — 各指标评分细则
 *  4. 权重方法 — AHP权重+功能等级标准
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter,
} from 'recharts';
import { Calculator, MapPin, BookOpen, Settings } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_ZONES,
  DIMENSION_WEIGHTS,
  scoreToColor,
  calcFunctionEvaluation,
  calcAllPresetZones,
  calcFunctionSummary,
  type FunctionEvaluationInput,
} from '../../utils/groundwaterFunctionCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const FIELD_DEFS: Array<{ key: keyof FunctionEvaluationInput; label: string; step?: string; group: string }> = [
  { key: 'wellYield', label: '单井涌水量 (m³/d)', step: '100', group: '供水' },
  { key: 'waterQualityGrade', label: '水质级别 (1~5)', step: '1', group: '供水' },
  { key: 'exploitableModulus', label: '可开采模数 (万m³/km²·a)', step: '1', group: '供水' },
  { key: 'utilizationRate', label: '开采利用率 (%)', step: '5', group: '供水' },
  { key: 'baseflowRatio', label: '基流补给比例 (%)', step: '5', group: '生态' },
  { key: 'wetlandDependency', label: '湿地依赖度 (1~5)', step: '1', group: '生态' },
  { key: 'vegetationDependency', label: '植被依赖度 (%)', step: '5', group: '生态' },
  { key: 'subsidenceRate', label: '地面沉降速率 (mm/a)', step: '1', group: '地质环境' },
  { key: 'seawaterIntrusion', label: '海水入侵距离 (km)', step: '0.5', group: '地质环境' },
  { key: 'salinizationRatio', label: '盐渍化面积比 (%)', step: '5', group: '地质环境' },
  { key: 'aquiferThickness', label: '含水层厚度 (m)', step: '5', group: '调节' },
  { key: 'specificYield', label: '给水度', step: '0.01', group: '调节' },
  { key: 'rechargeIntensity', label: '年补给强度 (mm/a)', step: '10', group: '调节' },
  { key: 'waterLevelAmplitude', label: '水位年变幅 (m)', step: '0.5', group: '调节' },
];

const GROUP_COLORS: Record<string, string> = {
  '供水': '#06b6d4',
  '生态': '#10b981',
  '地质环境': '#f59e0b',
  '调节': '#8b5cf6',
};

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  const [name, setName] = useState('自定义评价单元');
  const [values, setValues] = useState<Record<string, number>>({
    wellYield: 1500, waterQualityGrade: 3, exploitableModulus: 8, utilizationRate: 85,
    baseflowRatio: 20, wetlandDependency: 2, vegetationDependency: 15,
    subsidenceRate: 10, seawaterIntrusion: 0, salinizationRatio: 15,
    aquiferThickness: 35, specificYield: 0.08, rechargeIntensity: 40, waterLevelAmplitude: 5,
  });

  const input = { name, regionType: '平原', ...values } as unknown as FunctionEvaluationInput;
  const result = useMemo(() => calcFunctionEvaluation(input), [input]);

  const setField = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // 雷达图数据
  const radarData = result.dimensions.map(d => ({
    dimension: d.dimension.replace('功能', ''),
    score: d.totalScore,
  }));

  // 指标得分柱状图
  const indicatorBarData = useMemo(() => {
    const items: Array<{ name: string; score: number; group: string; color: string }> = [];
    result.dimensions.forEach(dim => {
      dim.indicators.forEach(ind => {
        items.push({ name: ind.name, score: ind.score, group: dim.dimension, color: GROUP_COLORS[dim.dimension.replace('功能', '')] ?? '#64748b' });
      });
    });
    return items;
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入面板 */}
        <TechCard title="评价指标输入" badge="14项指标" icon={Calculator}>
          <div className="space-y-2">
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text mb-1" />
            <div className="grid grid-cols-2 gap-2">
              {FIELD_DEFS.map(f => (
                <div key={f.key} className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-gw-muted">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: GROUP_COLORS[f.group] }} />
                    {f.label}
                  </label>
                  <input type="number" step={f.step ?? 'any'} value={values[f.key as string] ?? 0}
                    onChange={e => setField(f.key as string, parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono" />
                </div>
              ))}
            </div>
          </div>
        </TechCard>

        {/* 综合评价结果 */}
        <div className="space-y-3">
          <TechCard title="综合功能评价" badge={result.functionGrade} icon={Settings}>
            <div className="text-center py-2">
              <div className="text-4xl font-mono font-bold" style={{ color: scoreToColor(result.comprehensiveScore) }}>
                {result.comprehensiveScore}
              </div>
              <div className="text-xs text-gw-muted mt-1">综合得分 / 100</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">主导功能</div>
                <div className="text-sm text-gw-highlight">{result.dominantFunction}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">功能等级</div>
                <div className="text-sm" style={{ color: scoreToColor(result.comprehensiveScore) }}>{result.functionGrade}</div>
              </div>
            </div>
          </TechCard>

          <TechCard title="四维度评分" badge="AHP加权">
            <div className="grid grid-cols-2 gap-2">
              {result.dimensions.map((d, i) => (
                <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gw-muted">{d.dimension}</span>
                    <span className="text-[9px] text-gw-muted">权重{(d.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-lg font-mono" style={{ color: scoreToColor(d.totalScore) }}>{d.totalScore}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: scoreToColor(d.totalScore) + '20', color: scoreToColor(d.totalScore) }}>{d.grade}</span>
                  </div>
                  <div className="text-[9px] text-gw-muted mt-0.5 leading-tight">{d.note}</div>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="四维度功能雷达图" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={100}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各指标得分明细" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={indicatorBarData} layout="vertical" margin={{ left: 20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={80} />
              <Tooltip content={<ChartTooltip title="指标得分" unit="分" />} />
              <ReferenceLine x={55} stroke="#f59e0b" strokeDasharray="5 5" />
              <Bar dataKey="score" name="得分" radius={[0, 2, 2, 0]}>
                {indicatorBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 各维度详细指标 */}
      {result.dimensions.map((dim, i) => (
        <TechCard key={i} title={dim.dimension} badge={`${dim.totalScore}分 · ${dim.grade}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dim.indicators.map((ind, j) => (
              <div key={j} className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">{ind.name}</div>
                <div className="text-sm font-mono text-gw-text mt-0.5">{ind.value}</div>
                <div className="text-base font-mono mt-0.5" style={{ color: scoreToColor(ind.score) }}>{ind.score}</div>
                <div className="text-[9px] text-gw-muted">权重{(ind.weight * 100).toFixed(0)}% · {ind.rating}</div>
              </div>
            ))}
          </div>
        </TechCard>
      ))}

      {/* 区划建议 */}
      <TechCard title="功能区划与保护建议" icon={BookOpen}>
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">功能区划建议</div>
            <div className="text-sm text-gw-text mt-1">{result.zoningSuggestion}</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-amber-400">具体措施建议</div>
            <div className="text-sm text-gw-text mt-1">{result.suggestion}</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板2: 预设分区 ──

function PresetZonesPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);
  const summary = useMemo(() => calcFunctionSummary(), []);

  const scoreBarData = results.map(r => ({
    name: r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name,
    fullName: r.name,
    score: r.comprehensiveScore,
    grade: r.functionGrade,
    color: scoreToColor(r.comprehensiveScore),
  }));

  const scatterData = results.map((r, i) => {
    const zone = PRESET_ZONES[i];
    return {
      name: r.name,
      supply: r.dimensions[0].totalScore,
      geoEnv: r.dimensions[2].totalScore,
      score: r.comprehensiveScore,
      color: scoreToColor(r.comprehensiveScore),
      utilization: zone.utilizationRate,
    };
  });

  const dimAvgData = summary.dimAvg.map(d => ({
    name: d.dimension.replace('功能', ''),
    score: d.avgScore,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="评价单元" value={summary.zoneCount} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="平均综合得分" value={summary.avgScore} unit="分" icon={Calculator} accent="cyan" />
        <StatCard title="最高得分" value={summary.maxScore} unit="分" icon={BookOpen} accent="emerald" />
        <StatCard title="最低得分" value={summary.minScore} unit="分" icon={Settings} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分区综合得分对比" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreBarData} margin={{ left: 0, right: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip title="综合得分" unit="分" />} />
              <ReferenceLine y={70} stroke="#06b6d4" strokeDasharray="5 5" label={{ value: '良好', fill: '#06b6d4', fontSize: 10 }} />
              <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '中等', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="score" name="综合得分" radius={[2, 2, 0, 0]}>
                {scoreBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="供水功能 vs 地质环境功能" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="supply" name="供水功能" unit="分" stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <YAxis type="number" dataKey="geoEnv" name="地质环境" unit="分" stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4">
                {scatterData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Scatter>
              <ReferenceLine x={55} stroke="#f59e0b" strokeDasharray="5 5" />
              <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <LazyChartCard title="各维度平均得分" height={260}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dimAvgData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip title="维度平均分" unit="分" />} />
            <Bar dataKey="score" name="平均得分" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <ReferenceLine y={70} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各分区综合评价结果">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            评价单元: r.name,
            综合得分: r.comprehensiveScore,
            功能等级: r.functionGrade,
            主导功能: r.dominantFunction,
            供水功能: r.dimensions[0].totalScore,
            生态功能: r.dimensions[1].totalScore,
            地质环境功能: r.dimensions[2].totalScore,
            调节功能: r.dimensions[3].totalScore,
            区划建议: r.zoningSuggestion,
          }))} filename="gw-function-evaluation" sheetName="功能评价" formats={['xlsx', 'csv', 'json']} label="导出评价结果" />
        </div>
        <FilterableTechTable
          headers={['评价单元', '综合得分', '功能等级', '主导功能', '供水', '生态', '地质环境', '调节', '区划建议']}
          rows={results.map(r => [
            r.name, String(r.comprehensiveScore), r.functionGrade, r.dominantFunction,
            String(r.dimensions[0].totalScore), String(r.dimensions[1].totalScore),
            String(r.dimensions[2].totalScore), String(r.dimensions[3].totalScore),
            r.zoningSuggestion.substring(0, 20) + '...',
          ])}
          filterPlaceholder="搜索评价单元..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板3: 评分标准 ──

function ScoringStandardsPanel() {
  const standards: Array<{ indicator: string; group: string; criteria: string }> = [
    // 供水
    { indicator: '单井涌水量', group: '供水', criteria: '≥5000(95) | ≥2000(80) | ≥1000(65) | ≥500(50) | ≥100(35) | <100(20)' },
    { indicator: '水质级别', group: '供水', criteria: 'Ⅰ类(95) | Ⅱ类(85) | Ⅲ类(70) | Ⅳ类(50) | Ⅴ类(30)' },
    { indicator: '可开采模数', group: '供水', criteria: '≥20(90) | ≥10(75) | ≥5(60) | ≥2(45) | ≥1(30) | <1(15) 万m³/km²·a' },
    { indicator: '开采利用率', group: '供水', criteria: '≤30%(90) | ≤50%(75) | ≤70%(60) | ≤85%(45) | ≤100%(30) | >100%(15) 反向评分' },
    // 生态
    { indicator: '基流补给比例', group: '生态', criteria: '≥60%(90) | ≥40%(75) | ≥20%(60) | ≥10%(45) | >0%(30) | 0(15)' },
    { indicator: '湿地依赖度', group: '生态', criteria: '5级(95) | 4级(80) | 3级(60) | 2级(40) | 1级(20)' },
    { indicator: '植被依赖度', group: '生态', criteria: '≥60%(90) | ≥40%(75) | ≥20%(60) | ≥10%(45) | >0%(30) | 0(15)' },
    // 地质环境
    { indicator: '地面沉降速率', group: '地质环境', criteria: '0(95) | ≤5(80) | ≤10(65) | ≤20(50) | ≤40(35) | >40(20) mm/a 反向' },
    { indicator: '海水入侵距离', group: '地质环境', criteria: '0(95) | ≤1(70) | ≤3(55) | ≤5(40) | ≤10(25) | >10(15) km 反向' },
    { indicator: '盐渍化面积比', group: '地质环境', criteria: '0(95) | ≤5%(80) | ≤15%(65) | ≤30%(50) | ≤50%(35) | >50%(20) 反向' },
    // 调节
    { indicator: '含水层厚度', group: '地质环境', criteria: '≥50(90) | ≥30(75) | ≥15(60) | ≥5(45) | ≥1(30) | <1(15) m' },
    { indicator: '给水度', group: '调节', criteria: '≥0.25(90) | ≥0.15(75) | ≥0.08(60) | ≥0.04(45) | ≥0.02(30) | <0.02(15)' },
    { indicator: '年补给强度', group: '调节', criteria: '≥200(90) | ≥100(75) | ≥50(60) | ≥20(45) | ≥10(30) | <10(15) mm/a' },
    { indicator: '水位年变幅', group: '调节', criteria: '≤1(90) | ≤2(75) | ≤4(60) | ≤6(45) | ≤10(30) | >10(15) m 反向' },
  ];

  return (
    <div className="space-y-4">
      <TechCard title="指标评分细则" badge="14项指标">
        <FilterableTechTable
          headers={['指标', '维度', '评分标准（括号内为得分）']}
          rows={standards.map(s => [s.indicator, s.group, s.criteria])}
          filterPlaceholder="搜索指标..."
        />
      </TechCard>

      <TechCard title="功能等级标准" badge="5级">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { grade: '优秀', range: '85~100', color: '#10b981', desc: '各功能维度均优，可适度开发' },
            { grade: '良好', range: '70~84', color: '#06b6d4', desc: '功能良好，维持现状管理' },
            { grade: '中等', range: '55~69', color: '#f59e0b', desc: '功能中等，限制开发' },
            { grade: '较差', range: '40~54', color: '#f97316', desc: '功能较差，涵养修复' },
            { grade: '差', range: '<40', color: '#ef4444', desc: '功能差，禁采保护' },
          ].map(g => (
            <div key={g.grade} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.grade}</div>
              <div className="text-xs font-mono text-gw-text mt-0.5">{g.range}分</div>
              <div className="text-[10px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="功能区划对应关系" badge="区划建议">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-emerald-400">开发保护区（≥70分）</div>
            <div className="text-[10px] text-gw-muted mt-1">以供水开发为主，兼顾生态保护，可适度增加开采量。适用于太行山前冲洪积扇等补给条件好的区域。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-cyan-400">限制开发区（55~69分）</div>
            <div className="text-[10px] text-gw-muted mt-1">以维持现状为主，控制开采量，加强动态监测。适用于平原中部一般超采区。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-amber-400">涵养修复区（40~54分）</div>
            <div className="text-[10px] text-gw-muted mt-1">以涵养修复为主，压采减采，恢复地下水功能。适用于深层地下水严重超采区。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-red-400">禁采保护区（&lt;40分）</div>
            <div className="text-[10px] text-gw-muted mt-1">全面禁止开采，实施生态修复和地下水回补。适用于海水入侵区、严重沉降区等。</div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="《地下水功能区划分技术要求》| DZ/T 0287 | 河北省地下水功能区划报告" version="B-24" />
    </div>
  );
}

// ── 面板4: 权重方法 ──

function WeightMethodPanel() {
  const weightData = [
    { name: '供水功能', weight: DIMENSION_WEIGHTS.supply * 100, color: '#06b6d4' },
    { name: '生态功能', weight: DIMENSION_WEIGHTS.ecology * 100, color: '#10b981' },
    { name: '地质环境功能', weight: DIMENSION_WEIGHTS.geoEnvironment * 100, color: '#f59e0b' },
    { name: '调节功能', weight: DIMENSION_WEIGHTS.regulation * 100, color: '#8b5cf6' },
  ];

  const indicatorWeights: Array<{ dim: string; indicator: string; weight: string; color: string }> = [
    { dim: '供水功能', indicator: '单井涌水量', weight: '30%', color: '#06b6d4' },
    { dim: '供水功能', indicator: '水质级别', weight: '25%', color: '#06b6d4' },
    { dim: '供水功能', indicator: '可开采模数', weight: '25%', color: '#06b6d4' },
    { dim: '供水功能', indicator: '开采利用率', weight: '20%', color: '#06b6d4' },
    { dim: '生态功能', indicator: '基流补给比例', weight: '40%', color: '#10b981' },
    { dim: '生态功能', indicator: '湿地依赖度', weight: '30%', color: '#10b981' },
    { dim: '生态功能', indicator: '植被依赖度', weight: '30%', color: '#10b981' },
    { dim: '地质环境功能', indicator: '地面沉降速率', weight: '40%', color: '#f59e0b' },
    { dim: '地质环境功能', indicator: '海水入侵距离', weight: '30%', color: '#f59e0b' },
    { dim: '地质环境功能', indicator: '盐渍化面积比', weight: '30%', color: '#f59e0b' },
    { dim: '调节功能', indicator: '含水层厚度', weight: '25%', color: '#8b5cf6' },
    { dim: '调节功能', indicator: '给水度', weight: '25%', color: '#8b5cf6' },
    { dim: '调节功能', indicator: '年补给强度', weight: '30%', color: '#8b5cf6' },
    { dim: '调节功能', indicator: '水位年变幅', weight: '20%', color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-4">
      <LazyChartCard title="AHP维度权重分布" height={260}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weightData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" horizontal={false} />
            <XAxis type="number" domain={[0, 40]} stroke="#64748b" fontSize={10} unit="%" />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
            <Tooltip content={<ChartTooltip title="权重" unit="%" />} />
            <Bar dataKey="weight" name="权重" radius={[0, 4, 4, 0]}>
              {weightData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="指标层权重明细" badge="14项指标">
        <FilterableTechTable
          headers={['维度', '指标', '指标层权重', '颜色']}
          rows={indicatorWeights.map(w => [w.dim, w.indicator, w.weight, w.color])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="AHP层次分析法说明" badge="方法说明">
        <div className="space-y-3">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">层次结构</div>
            <div className="text-[10px] text-gw-muted mt-1">
              目标层(A): 地下水综合功能评价 → 准则层(B): 供水/生态/地质环境/调节四维度 → 指标层(C): 14项具体指标
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">权重确定方法</div>
            <div className="text-[10px] text-gw-muted mt-1">
              采用专家打分法构建判断矩阵，通过一致性检验(CR&lt;0.1)确定维度权重。供水功能权重最高(35%)，体现地下水首要服务功能；
              地质环境功能(25%)反映环境约束；生态功能与调节功能各占20%。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">综合评分公式</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">
              F = Σ(Bi × Wi) = B供×0.35 + B生×0.20 + B地×0.25 + B调×0.20
            </div>
            <div className="text-[10px] text-gw-muted mt-1">
              其中 Bi 为各维度内指标加权得分，Wi 为维度权重。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">主导功能判定</div>
            <div className="text-[10px] text-gw-muted mt-1">
              取四维度中得分最高者为主导功能，用于功能区划方向引导。当最高与次高差距&lt;5分时，标记为多功能复合区。
            </div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="DZ/T 0287《地下水功能区划分技术要求》| AHP层次分析法 | 河北省地下水功能区划报告" version="B-24" />
    </div>
  );
}

// ── 主组件 ──

export function GroundwaterFunctionCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'zones' | 'standards' | 'method'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'zones' as const, label: '预设分区', icon: MapPin },
    { key: 'standards' as const, label: '评分标准', icon: BookOpen },
    { key: 'method' as const, label: '权重方法', icon: Settings },
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
      {activePanel === 'standards' && <ScoringStandardsPanel />}
      {activePanel === 'method' && <WeightMethodPanel />}
    </div>
  );
}
