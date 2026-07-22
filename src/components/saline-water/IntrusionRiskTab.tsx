/**
 * B-13 咸水入侵风险评价 Tab
 *
 * 4大面板：
 *  1. 风险计算器 — Cl⁻输入+界面参数→综合评分
 *  2. 监测井预警 — 预设8个监测井风险排名
 *  3. 预测趋势 — Cl⁻浓度线性外推预测
 *  4. 防治参考 — 风险等级对应措施
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { AlertTriangle, Shield, TrendingUp, MapPin, BookOpen } from 'lucide-react';
import { TechCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  RISK_LEVELS,
  CL_STANDARD_III,
  PRESET_MONITORING_WELLS,
  type ChlorideInput,
  calcChlorideChange,
  calcInterfaceAnalysis,
  calcRiskEvaluation,
  predictChloride,
} from '../../utils/intrusionRiskCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

// ── 面板1: 风险计算器 ──

function RiskCalculatorPanel() {
  const [wellName, setWellName] = useState('监测井-01');
  const [initialCl, setInitialCl] = useState(85);
  const [currentCl, setCurrentCl] = useState(320);
  const [years, setYears] = useState(5);
  const [distanceToCoast, setDistanceToCoast] = useState(10);
  const [initialDepth, setInitialDepth] = useState(50);
  const [currentDepth, setCurrentDepth] = useState(65);
  const [freshwaterHead, setFreshwaterHead] = useState(15);
  const [K, setK] = useState(10);
  const [ne, _setNe] = useState(0.2);

  const clInput: ChlorideInput = { wellName, initialCl, currentCl, years, waterType: '孔隙水', distanceToCoast };
  const ifInput = { initialDepth, currentDepth, years, aquiferType: '浅层' as const, K, ne, freshwaterHead, seawaterDensity: 1025, freshwaterDensity: 1000 };

  const clResult = useMemo(() => calcChlorideChange(clInput), [wellName, initialCl, currentCl, years, distanceToCoast]);
  const ifResult = useMemo(() => calcInterfaceAnalysis(ifInput), [initialDepth, currentDepth, years, K, ne, freshwaterHead]);
  const riskEval = useMemo(() => calcRiskEvaluation(clResult, ifResult), [clResult, ifResult]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <TechCard icon={Shield} title="监测参数输入" badge="Cl⁻+界面">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gw-muted">监测井名称</label>
              <input type="text" value={wellName} onChange={e => setWellName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">初始Cl⁻ (mg/L)</label>
              <input type="number" step="any" value={initialCl} onChange={e => setInitialCl(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">当前Cl⁻ (mg/L)</label>
              <input type="number" step="any" value={currentCl} onChange={e => setCurrentCl(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">间隔年数</label>
              <input type="number" step="1" value={years} onChange={e => setYears(Number(e.target.value) || 1)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">距海岸线 (km)</label>
              <input type="number" step="any" value={distanceToCoast} onChange={e => setDistanceToCoast(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">初始界面深度 (m)</label>
              <input type="number" step="any" value={initialDepth} onChange={e => setInitialDepth(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">当前界面深度 (m)</label>
              <input type="number" step="any" value={currentDepth} onChange={e => setCurrentDepth(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">淡水位标高 (m)</label>
              <input type="number" step="any" value={freshwaterHead} onChange={e => setFreshwaterHead(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">渗透系数 K (m/d)</label>
              <input type="number" step="any" value={K} onChange={e => setK(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
          </div>
        </TechCard>

        {/* 风险评分仪表 */}
        <TechCard icon={AlertTriangle} title="综合风险评价" badge={riskEval.riskLevel}>
          <div className="flex flex-col items-center py-4">
            {/* 仪表盘 */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={riskEval.color} strokeWidth="8"
                  strokeDasharray={`${riskEval.totalScore * 3.14} 314`}
                  strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: riskEval.color }}>{riskEval.totalScore}</span>
                <span className="text-xs text-gw-muted">/ 100</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-semibold" style={{ color: riskEval.color }}>{riskEval.riskLevel}</span>
              <span className="text-xs text-gw-muted ml-2">| {riskEval.intrusionType}</span>
            </div>
          </div>

          {/* 维度评分 */}
          <div className="space-y-2 mt-2">
            {riskEval.dimensions.map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-xs text-gw-muted mb-0.5">
                  <span>{d.name} ({(d.weight * 100).toFixed(0)}%)</span>
                  <span>{d.score.toFixed(0)}分 — {d.description}</span>
                </div>
                <div className="h-2 rounded-full bg-gw-surface overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${d.score}%`,
                    backgroundColor: d.score > 30 ? riskEval.color : '#10b981',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      {/* Cl⁻+界面结果 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard icon={MapPin} title="氯离子变化" badge={clResult.riskLevel}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gw-muted">初始Cl⁻</span>
              <p className="text-gw-text font-mono font-semibold mt-0.5">{clResult.initialCl} mg/L</p>
            </div>
            <div>
              <span className="text-gw-muted">当前Cl⁻</span>
              <p className="font-mono font-semibold mt-0.5" style={{ color: clResult.color }}>{clResult.currentCl} mg/L</p>
            </div>
            <div>
              <span className="text-gw-muted">变化量</span>
              <p className={`font-mono font-semibold mt-0.5 ${clResult.deltaCl > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {clResult.deltaCl > 0 ? '+' : ''}{clResult.deltaCl} mg/L
              </p>
            </div>
            <div>
              <span className="text-gw-muted">变化率</span>
              <p className={`font-mono font-semibold mt-0.5 ${clResult.rateCl > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {clResult.rateCl > 0 ? '+' : ''}{clResult.rateCl} mg/L/a
              </p>
            </div>
          </div>
        </TechCard>

        <TechCard icon={MapPin} title="咸淡水界面变化" badge={ifResult.riskLevel}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gw-muted">初始界面深度</span>
              <p className="text-gw-text font-mono font-semibold mt-0.5">{ifResult.initialDepth} m</p>
            </div>
            <div>
              <span className="text-gw-muted">当前界面深度</span>
              <p className="font-mono font-semibold mt-0.5" style={{ color: ifResult.color }}>{ifResult.currentDepth} m</p>
            </div>
            <div>
              <span className="text-gw-muted">G-H理论深度</span>
              <p className="text-gw-text font-mono mt-0.5">{ifResult.ghDepth} m</p>
            </div>
            <div>
              <span className="text-gw-muted">变化速率</span>
              <p className={`font-mono font-semibold mt-0.5 ${ifResult.deltaDepth > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {ifResult.deltaDepth > 0 ? '下移' : '回升'} {Math.abs(ifResult.deltaDepth)}m / {ifResult.rateDepth}m/a
              </p>
            </div>
          </div>
        </TechCard>
      </div>

      {/* 建议措施 */}
      <TechCard icon={Shield} title="防治建议">
        <ul className="space-y-1 text-xs">
          {riskEval.suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gw-blue mt-0.5">▸</span>
              <span className="text-gw-text">{s}</span>
            </li>
          ))}
        </ul>
      </TechCard>
    </div>
  );
}

// ── 面板2: 监测井预警 ──

function MonitoringWellsPanel() {
  const results = useMemo(() => PRESET_MONITORING_WELLS.map(w => calcChlorideChange(w)), []);

  const sortedByCl = useMemo(() => [...results].sort((a, b) => b.currentCl - a.currentCl), [results]);
  const sortedByRate = useMemo(() => [...results].sort((a, b) => Math.abs(b.rateCl) - Math.abs(a.rateCl)), [results]);

  return (
    <div className="space-y-4">
      <TechCard icon={MapPin} title="监测井Cl⁻浓度预警" badge={`${results.length}口井`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">监测井</th>
                <th className="text-right p-2 text-gw-muted">初始Cl⁻</th>
                <th className="text-right p-2 text-gw-muted">当前Cl⁻</th>
                <th className="text-right p-2 text-gw-muted">变化率(mg/L/a)</th>
                <th className="text-right p-2 text-gw-muted">超标倍数</th>
                <th className="text-left p-2 text-gw-muted">风险等级</th>
                <th className="text-left p-2 text-gw-muted">入侵类型</th>
                <th className="text-left p-2 text-gw-muted">距海岸(km)</th>
              </tr>
            </thead>
            <tbody>
              {sortedByCl.map(r => (
                <tr key={r.wellName} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.wellName}</td>
                  <td className="p-2 text-right font-mono text-gw-muted">{r.initialCl}</td>
                  <td className="p-2 text-right font-mono font-semibold" style={{ color: r.color }}>{r.currentCl}</td>
                  <td className={`p-2 text-right font-mono ${r.rateCl > 2 ? 'text-red-400' : 'text-gw-muted'}`}>{r.rateCl > 0 ? '+' : ''}{r.rateCl}</td>
                  <td className="p-2 text-right font-mono">{r.exceedRatio ? `${r.exceedRatio}×` : '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${RISK_LEVELS[r.riskLevel].bgColor}`} style={{ color: RISK_LEVELS[r.riskLevel].color }}>
                      {r.riskLevel}
                    </span>
                  </td>
                  <td className="p-2 text-gw-muted">{r.intrusionType}</td>
                  <td className="p-2 text-right text-gw-muted">{r.distanceToCoast}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各监测井Cl⁻浓度排名" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={sortedByCl} filename="监测井Cl浓度排名" sheetName="Cl排名" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={sortedByCl} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis dataKey="wellName" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={85} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="currentCl" name="当前Cl⁻ (mg/L)" radius={[0, 3, 3, 0]} barSize={14}>
                {sortedByCl.map(entry => (
                  <Cell key={entry.wellName} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="Cl⁻变化率对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={sortedByRate} filename="Cl变化率对比" sheetName="变化率" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={sortedByRate} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis dataKey="wellName" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={85} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="rateCl" name="变化率 (mg/L/a)" radius={[0, 3, 3, 0]} barSize={14}>
                {sortedByRate.map(entry => (
                  <Cell key={entry.wellName} fill={entry.rateCl > 2 ? '#ef4444' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
    </div>
  );
}

// ── 面板3: 预测趋势 ──

function PredictPanel() {
  const [baseCl, setBaseCl] = useState(85);
  const [rateCl, setRateCl] = useState(15);
  const [predictYears, setPredictYears] = useState(5);
  const startYear = 2024;

  const predictData = useMemo(() => predictChloride(baseCl, rateCl, predictYears, startYear), [baseCl, rateCl, predictYears]);

  return (
    <div className="space-y-4">
      <TechCard icon={TrendingUp} title="Cl⁻浓度变化预测" badge="线性外推">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-gw-muted">基准Cl⁻ (mg/L)</label>
            <input type="number" step="any" value={baseCl} onChange={e => setBaseCl(Number(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
          </div>
          <div>
            <label className="text-xs text-gw-muted">年均变化率 (mg/L/a)</label>
            <input type="number" step="any" value={rateCl} onChange={e => setRateCl(Number(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
          </div>
          <div>
            <label className="text-xs text-gw-muted">预测年数</label>
            <input type="number" step="1" value={predictYears} onChange={e => setPredictYears(Number(e.target.value) || 1)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
          </div>
        </div>
      </TechCard>

      <LazyChartCard title="Cl⁻浓度预测趋势" height={360}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={predictData} filename="Cl浓度预测" sheetName="预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={predictData} margin={{ top: 5, right: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" mg/L" />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="clValue" name="Cl⁻ (mg/L)" radius={[2, 2, 0, 0]}>
              {predictData.map((entry, idx) => (
                <Cell key={idx} fill={entry.isPredicted ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />实际数据</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />预测数据</span>
          <span>III类标准线: {CL_STANDARD_III}mg/L</span>
        </div>
      </LazyChartCard>
    </div>
  );
}

// ── 面板4: 防治参考 ──

function ReferencePanel() {
  const riskTable = [
    { level: '低风险', color: '#10b981', clRange: '<100', interfaceTrend: '稳定或回升', monitoring: '年度一次', measure: '常规监测' },
    { level: '中风险', color: '#f59e0b', clRange: '100~250', interfaceTrend: '缓慢下移', monitoring: '半年度一次', measure: '控制开采+加密监测' },
    { level: '高风险', color: '#f97316', clRange: '250~500', interfaceTrend: '持续下移', monitoring: '季度一次', measure: '限采+回灌+替代水源' },
    { level: '严重', color: '#ef4444', clRange: '>500', interfaceTrend: '快速下移', monitoring: '月度一次', measure: '禁采+地下帷幕+紧急替代水源' },
  ];

  const ghTable = [
    { head: '5', ratio: '40', note: '典型淡水透镜体' },
    { head: '10', ratio: '40', note: '常见淡水透镜体' },
    { head: '15', ratio: '40', note: '一般潜水补给区' },
    { head: '20', ratio: '40', note: '强补给淡水体' },
    { head: '30', ratio: '40', note: 'G-H公式理论值' },
  ];

  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="海水入侵风险分级与防治措施">
        <FilterableTechTable
          headers={['风险等级', 'Cl⁻范围(mg/L)', '界面趋势', '监测频率', '防治措施']}
          rows={riskTable.map(r => [r.level, r.clRange, r.interfaceTrend, r.monitoring, r.measure])}
          filterPlaceholder="搜索等级或措施..."
        />
      </TechCard>

      <TechCard icon={BookOpen} title="Ghyben-Herzberg理论界面深度">
        <p className="text-xs text-gw-muted mb-3">公式: z = (ρf/(ρs-ρf)) × hf ≈ 40 × hf，其中ρs=1025kg/m³, ρf=1000kg/m³</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">淡水位标高hf (m)</th>
                <th className="text-right p-2 text-gw-muted">理论界面深度z (m)</th>
                <th className="text-left p-2 text-gw-muted">说明</th>
              </tr>
            </thead>
            <tbody>
              {ghTable.map(r => (
                <tr key={r.head} className="border-b border-gw-border/50">
                  <td className="p-2 font-mono text-gw-text">{r.head}</td>
                  <td className="p-2 text-right font-mono text-blue-400">{r.ratio}</td>
                  <td className="p-2 text-gw-muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gw-muted mt-2">注：实际界面深度受含水层非均质性、越流补给、开采影响等因素制约，G-H公式仅提供理论参考值。</p>
      </TechCard>

      <TechCard icon={AlertTriangle} title="海水入侵类型识别">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: '成片入侵', icon: '▬', color: '#ef4444', desc: '滨海地区大规模成片咸水区扩展，Cl⁻>500mg/L，距离海岸<10km', measure: '建设地下帷幕+禁采' },
            { type: '舌状入侵', icon: '▸', color: '#f97316', desc: '咸水沿古河道/强透水层舌状内侵，Cl⁻250~500mg/L，距离海岸10~20km', measure: '控制开采+回灌' },
            { type: '越流入侵', icon: '↕', color: '#f59e0b', desc: '深层咸水通过越流进入浅层，Cl⁻100~250mg/L，与开采漏斗相关', measure: '调整开采层位' },
          ].map(item => (
            <div key={item.type} className="p-3 rounded-lg bg-gw-surface">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" style={{ color: item.color }}>{item.icon}</span>
                <span className="font-semibold text-sm" style={{ color: item.color }}>{item.type}</span>
              </div>
              <p className="text-xs text-gw-muted">{item.desc}</p>
              <p className="text-[10px] text-gw-blue mt-1">建议: {item.measure}</p>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════

const SUB_TABS = [
  { key: 'calc', label: '风险计算器', icon: Shield },
  { key: 'wells', label: '监测井预警', icon: MapPin },
  { key: 'predict', label: '趋势预测', icon: TrendingUp },
  { key: 'ref', label: '防治参考', icon: BookOpen },
] as const;

type SubTabKey = typeof SUB_TABS[number]['key'];

export function IntrusionRiskTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('calc');

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-sm text-red-400 font-medium">海水入侵风险评价系统</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">基于Cl⁻浓度变化、咸淡水界面动态(Ghyben-Herzberg公式)、距海岸距离等多维度综合评估海水入侵风险等级</p>
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

      {activeSubTab === 'calc' && <RiskCalculatorPanel />}
      {activeSubTab === 'wells' && <MonitoringWellsPanel />}
      {activeSubTab === 'predict' && <PredictPanel />}
      {activeSubTab === 'ref' && <ReferencePanel />}

      <DataSourceNote source="Ghyben-Herzberg公式 | GB/T 14848-2017 | 河北省海水入侵监测资料" />
    </div>
  );
}
