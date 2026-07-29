/**
 * B-32 地下水管理决策支持器 Tab (优化版)
 *
 * 5大面板：
 *  1. 水资源配置优化 — 多水源多用户线性规划分配
 *  2. 压采方案评估 — 分阶段压采+替代水源+经济成本
 *  3. 生态水位保障 — 阈值+保障措施+达标率
 *  4. 风险预警决策 — 四级预警+响应措施矩阵
 *  5. 综合决策评价 — 多目标加权+方案排序
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart,
} from 'recharts';
import {
  ClipboardList, BookOpen, AlertTriangle, Activity, Layers,
  Droplets, TrendingDown, Shield, Award, ArrowRight,
} from 'lucide-react';
import { TechCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_SOURCES, PRESET_USERS, PRESET_REDUCTION_PLANS, PRESET_DECISION_OPTIONS,
  calcWaterAllocation, calcReductionPlan, calcEcoLevel, calcWarningDecision, calcDecisionEvaluation,
  type WaterSource, type WaterUser, type ReductionPlan, type EcoLevelInput, type WarningInput, type DecisionOption,
} from '../../utils/decisionSupportCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const WARNING_COLORS: Record<string, string> = {
  '蓝色': '#2563eb', '黄色': '#eab308', '橙色': '#ea580c', '红色': '#dc2626',
};

const SOURCE_COLORS = ['#06b6d4', '#0ea5e9', '#6366f1', '#14b8a6', '#f43f5e'];

/** 预警级别渐变色 (from → to) */
const WARNING_GRADIENTS: Record<string, [string, string]> = {
  '蓝色': ['#1e3a5f', '#1a2f4a'],
  '黄色': ['#422006', '#3a1d05'],
  '橙色': ['#431407', '#3a1206'],
  '红色': ['#450a0a', '#3c0808'],
};

function romanLevel(n: number): string { return 'Ⅰ'.repeat(n) + '类'; }

/** 统一数字输入控件 */
function InputCell({
  label, value, onChange, unit, step,
}: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gw-muted mb-0.5">{label}{unit ? ` (${unit})` : ''}</label>
      <input
        type="number" step={step ?? 1} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
      />
    </div>
  );
}

/** 进度条组件 */
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/** 预警等级徽章 */
function WarningBadge({ level }: { level: string }) {
  const color = WARNING_COLORS[level] ?? '#64748b';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{ background: `${color}25`, color, border: `1px solid ${color}60`, boxShadow: `0 0 12px ${color}30` }}
    >
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {level}预警
    </span>
  );
}

/** 排名徽章 */
function RankBadge({ rank }: { rank: number }) {
  const colors = ['#f59e0b', '#94a3b8', '#b45309', '#64748b'];
  const bg = rank <= 3 ? colors[rank - 1] : colors[3];
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white"
      style={{ background: `${bg}` }}
    >
      {rank}
    </span>
  );
}

/** 满足率条件着色 */
function satisfactionColor(rate: number): string {
  if (rate >= 90) return '#10b981';
  if (rate >= 70) return '#3b82f6';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
}

export function DecisionSupportTab() {
  const [sources] = useState<WaterSource[]>(PRESET_SOURCES);
  const [users] = useState<WaterUser[]>(PRESET_USERS);
  const allocationResult = useMemo(() => calcWaterAllocation(sources, users), [sources, users]);

  const [plans] = useState<ReductionPlan[]>(PRESET_REDUCTION_PLANS);
  const reductionResult = useMemo(() => calcReductionPlan(plans), [plans]);

  const [ecoInput, setEcoInput] = useState<EcoLevelInput>({
    thresholdDepth: 20, currentDepth: 22, targetDepth: 18,
    monitoringWells: 50, compliantWells: 35,
    annualRecharge: 3000, annualExtraction: 5000,
    aquiferType: '深层',
  });
  const ecoResult = useMemo(() => calcEcoLevel(ecoInput), [ecoInput]);

  const [warningInput, setWarningInput] = useState<WarningInput>({
    currentDepth: 28, yellowThreshold: 20, redThreshold: 25, emergencyThreshold: 30,
    monthlyChangeRate: 0.3, chloride: 180, chlorideRate: 5,
    extractionStatus: '超采',
  });
  const warningResult = useMemo(() => calcWarningDecision(warningInput), [warningInput]);

  const [options] = useState<DecisionOption[]>(PRESET_DECISION_OPTIONS);
  const decisionResult = useMemo(() => calcDecisionEvaluation(options), [options]);

  const allocationBarData = useMemo(() => {
    return allocationResult.userSatisfaction.map(u => ({
      name: u.user, allocated: u.allocated, demand: u.demand, satisfaction: u.satisfaction,
    }));
  }, [allocationResult]);

  const sourceUtilData = useMemo(() => {
    return allocationResult.sourceRemainder.map(s => ({
      name: s.source, utilization: s.utilization, remainder: s.remainder,
    }));
  }, [allocationResult]);

  const reductionTrendData = useMemo(() => {
    const base = plans[0]?.currentExtraction ?? 0;
    const data: { phase: string; extraction: number; target: number; alternative: number }[] = [];
    data.push({ phase: '基准', extraction: base, target: base, alternative: 0 });
    for (const p of plans) {
      data.push({ phase: p.phase, extraction: p.currentExtraction, target: p.targetExtraction, alternative: p.alternativeSupply });
    }
    return data;
  }, [plans]);

  const decisionRadarData = useMemo(() => {
    return decisionResult.rankedOptions.slice(0, 4).map(opt => ({
      option: opt.name.replace('方案[ABCD]:', '').replace('方案', '').trim().slice(0, 8),
      水资源保障: opt.scores[0]?.score ?? 0,
      生态效益: opt.scores[1]?.score ?? 0,
      经济可行性: opt.scores[2]?.score ?? 0,
      技术可行性: opt.scores[3]?.score ?? 0,
      社会接受度: opt.scores[4]?.score ?? 0,
    }));
  }, [decisionResult]);

  return (
    <div className="space-y-4">
      {/* ═══ 概览面板 ═══ */}
      <TechCard title="地下水管理决策支持器" badge="B-32" icon={ClipboardList}>
        <p className="text-[11px] text-gw-muted mb-3">
          集成水资源配置优化、压采方案评估、生态水位保障、风险预警决策和综合方案评价，为地下水管理提供量化决策支持。
        </p>
        <div className="grid grid-cols-5 gap-2">
          <div className="p-2.5 rounded-xl bg-blue-500/8 border border-blue-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-gw-muted">配置满足率</span>
            </div>
            <p className="text-lg font-bold text-blue-400">{allocationResult.overallSatisfaction}%</p>
            <div className="mt-1.5"><ProgressBar value={allocationResult.overallSatisfaction} max={100} color={satisfactionColor(allocationResult.overallSatisfaction)} /></div>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-500/8 border border-orange-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] text-gw-muted">压采总量</span>
            </div>
            <p className="text-lg font-bold text-orange-400">{reductionResult.totalReduction}<span className="text-[10px] text-gw-muted ml-0.5">万m³</span></p>
            <p className="text-[10px] text-gw-muted mt-0.5">压采率 {reductionResult.totalReductionRate}%</p>
          </div>
          <div className="p-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[10px] text-gw-muted">生态保障</span>
            </div>
            <p className="text-lg font-bold text-green-400">{ecoResult.overallScore}<span className="text-[10px] text-gw-muted ml-0.5">/100</span></p>
            <div className="mt-1.5"><ProgressBar value={ecoResult.overallScore} max={100} color="#10b981" /></div>
          </div>
          <div className="p-2.5 rounded-xl border-2 relative overflow-hidden" style={{
            background: `linear-gradient(135deg, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[0] ?? '#1e293b'} 0%, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[1] ?? '#0f172a'} 100%)`,
            borderColor: `${WARNING_COLORS[warningResult.overallWarning]}40`,
          }}>
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: WARNING_COLORS[warningResult.overallWarning] }} />
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: WARNING_COLORS[warningResult.overallWarning] }} />
              <span className="text-[10px] text-gw-muted">预警等级</span>
            </div>
            <p className="text-lg font-bold" style={{ color: WARNING_COLORS[warningResult.overallWarning] }}>{warningResult.overallWarning}</p>
            <p className="text-[10px] text-gw-muted mt-0.5">{warningResult.warningSignal.slice(0, 12)}…</p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/8 border border-purple-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-gw-muted">最优方案</span>
            </div>
            <p className="text-sm font-bold text-purple-400 truncate">{decisionResult.bestOption.split(':')[0]}</p>
            <p className="text-[10px] text-gw-muted mt-0.5">评分 {decisionResult.rankedOptions[0]?.totalScore ?? 0}</p>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 1: 水资源配置优化 ═══ */}
      <TechCard title="水资源配置优化" badge="配置" icon={Layers} className="border-blue-500/15">
        {/* 水源→用户 流向概览 */}
        <div className="mb-3 p-3 rounded-xl bg-gw-surface/30 border border-gw-border/20">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <div>
              <p className="text-[10px] font-semibold text-gw-muted mb-1.5">水源 (供{allocationResult.totalAllocated}/{allocationResult.totalDemand}万m³)</p>
              <div className="space-y-1">
                {allocationResult.sourceRemainder.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-gw-text w-16 truncate">{s.source}</span>
                    <div className="flex-1"><ProgressBar value={s.utilization} max={100} color={SOURCE_COLORS[i % SOURCE_COLORS.length]} /></div>
                    <span className="text-[10px] text-gw-muted w-10 text-right">{s.utilization}%</span>
                  </div>
                ))}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gw-muted/50" />
            <div>
              <p className="text-[10px] font-semibold text-gw-muted mb-1.5">用户 (满足率{allocationResult.overallSatisfaction}%)</p>
              <div className="space-y-1">
                {allocationResult.userSatisfaction.map((u, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-gw-text w-16 truncate">{u.user}</span>
                    <div className="flex-1"><ProgressBar value={u.satisfaction} max={100} color={satisfactionColor(u.satisfaction)} /></div>
                    <span className="text-[10px] font-mono w-10 text-right" style={{ color: satisfactionColor(u.satisfaction) }}>{u.satisfaction}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[11px] font-semibold text-gw-text mb-1">水源列表</p>
            <FilterableTechTable
              headers={['水源', '可供水量(万m³)', '成本(元/m³)', '水质等级']}
              rows={sources.map(s => [s.name, s.supply, s.cost, romanLevel(s.quality)])}
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gw-text mb-1">用户需求</p>
            <FilterableTechTable
              headers={['用户', '需求(万m³)', '最低保障', '优先级', '水质要求']}
              rows={users.map(u => [u.name, u.demand, u.minSupply, 'P' + u.priority, romanLevel(u.maxQuality)])}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LazyChartCard title="用户供水满足率" height={240}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={allocationBarData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="allocated" name="已分配" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demand" name="需求量" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <LazyChartCard title="水源利用率" height={240}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sourceUtilData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="utilization" name="利用率" radius={[4, 4, 0, 0]}>
                  {sourceUtilData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
        </div>

        <div className="mt-3">
          <p className="text-[11px] font-semibold text-gw-text mb-1">分配方案明细</p>
          <FilterableTechTable
            headers={['水源', '用户', '分配水量(万m³)', '成本(万元)']}
            rows={allocationResult.allocation.map(a => [a.source, a.user, a.volume, a.cost])}
          />
        </div>
        {allocationResult.notes.length > 0 && (
          <div className="mt-2 space-y-1">
            {allocationResult.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-amber-500/8 border border-amber-500/12">
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-400">{n}</p>
              </div>
            ))}
          </div>
        )}
      </TechCard>

      {/* ═══ Panel 2: 压采方案评估 ═══ */}
      <TechCard title="压采方案评估" badge="压采" icon={Activity} className="border-orange-500/15">
        <LazyChartCard title="分阶段压采趋势" height={240}>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={reductionTrendData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="phase" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="万m³" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="extraction" name="当前开采" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="目标开采" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line dataKey="alternative" name="替代水量" stroke="#10b981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="p-2.5 rounded-xl bg-orange-500/8 border border-orange-500/15">
            <p className="text-[10px] text-gw-muted mb-0.5">总压采量</p>
            <p className="text-base font-bold text-orange-400">{reductionResult.totalReduction}<span className="text-[10px] text-gw-muted ml-0.5">万m³/yr</span></p>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/8 border border-red-500/15">
            <p className="text-[10px] text-gw-muted mb-0.5">压采率</p>
            <p className="text-base font-bold text-red-400">{reductionResult.totalReductionRate}%</p>
            <div className="mt-1"><ProgressBar value={reductionResult.totalReductionRate} max={100} color="#ef4444" /></div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
            <p className="text-[10px] text-gw-muted mb-0.5">总替代成本</p>
            <p className="text-base font-bold text-amber-400">{reductionResult.totalAlternativeCost}<span className="text-[10px] text-gw-muted ml-0.5">万元</span></p>
          </div>
          <div className="p-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
            <p className="text-[10px] text-gw-muted mb-0.5">综合评分</p>
            <p className="text-base font-bold text-green-400">{reductionResult.overallScore}<span className="text-[10px] text-gw-muted ml-0.5">/100</span></p>
            <div className="mt-1"><ProgressBar value={reductionResult.overallScore} max={100} color="#10b981" /></div>
          </div>
        </div>

        <div className="mt-3">
          <FilterableTechTable
            headers={['阶段', '年份', '压采量(万m³)', '压采率', '替代水量', '替代成本(万元)', '缺口', '生态效益', '评估']}
            rows={reductionResult.phaseResults.map(p => [p.phase, p.yearRange, p.reduction, `${p.reductionRate}%`, p.alternativeVolume, p.alternativeCost, p.gap, p.ecologicalBenefit, p.assessment])}
          />
        </div>

        <div className="mt-2 space-y-1">
          {reductionResult.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-[10px] text-orange-400 mt-0.5">▸</span>
              <p className="text-[10px] text-gw-muted">{r}</p>
            </div>
          ))}
        </div>
      </TechCard>

      {/* ═══ Panel 3: 生态水位保障 ═══ */}
      <TechCard title="生态水位保障" badge="生态" icon={Shield} className="border-green-500/15">
        <div className="grid grid-cols-2 gap-4">
          {/* 左侧输入 */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gw-text mb-1 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-green-400" /> 水位参数
            </p>
            <div className="grid grid-cols-3 gap-2">
              <InputCell label="阈值埋深" value={ecoInput.thresholdDepth} onChange={v => setEcoInput({ ...ecoInput, thresholdDepth: v })} unit="m" />
              <InputCell label="当前埋深" value={ecoInput.currentDepth} onChange={v => setEcoInput({ ...ecoInput, currentDepth: v })} unit="m" />
              <InputCell label="目标埋深" value={ecoInput.targetDepth} onChange={v => setEcoInput({ ...ecoInput, targetDepth: v })} unit="m" />
            </div>
            <p className="text-[11px] font-semibold text-gw-text mt-2 mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-green-400" /> 监测与补给
            </p>
            <div className="grid grid-cols-2 gap-2">
              <InputCell label="监测井数" value={ecoInput.monitoringWells} onChange={v => setEcoInput({ ...ecoInput, monitoringWells: v })} unit="口" />
              <InputCell label="达标井数" value={ecoInput.compliantWells} onChange={v => setEcoInput({ ...ecoInput, compliantWells: v })} unit="口" />
              <InputCell label="年回补量" value={ecoInput.annualRecharge} onChange={v => setEcoInput({ ...ecoInput, annualRecharge: v })} unit="万m³" />
              <InputCell label="年开采量" value={ecoInput.annualExtraction} onChange={v => setEcoInput({ ...ecoInput, annualExtraction: v })} unit="万m³" />
            </div>
            <div>
              <label className="block text-[10px] text-gw-muted mb-0.5">含水层类型</label>
              <select value={ecoInput.aquiferType} onChange={e => setEcoInput({ ...ecoInput, aquiferType: e.target.value as '浅层' | '深层' })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors">
                <option value="浅层">浅层</option>
                <option value="深层">深层</option>
              </select>
            </div>
          </div>

          {/* 右侧结果 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
                <p className="text-[10px] text-gw-muted">达标率</p>
                <p className="text-base font-bold" style={{ color: satisfactionColor(ecoResult.complianceRate) }}>{ecoResult.complianceRate}%</p>
                <div className="mt-1"><ProgressBar value={ecoResult.complianceRate} max={100} color={satisfactionColor(ecoResult.complianceRate)} /></div>
              </div>
              <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
                <p className="text-[10px] text-gw-muted">水位差距</p>
                <p className="text-base font-bold" style={{ color: ecoResult.depthGap <= 0 ? '#10b981' : '#ef4444' }}>{ecoResult.depthGap > 0 ? '+' : ''}{ecoResult.depthGap}m</p>
                <p className="text-[9px] text-gw-muted">当前 → 目标</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
                <p className="text-[10px] text-gw-muted">补采比</p>
                <p className="text-base font-bold" style={{ color: ecoResult.rechargeExtractionRatio >= 1 ? '#10b981' : '#ef4444' }}>{ecoResult.rechargeExtractionRatio}</p>
                <p className="text-[9px] text-gw-muted">{ecoResult.rechargeExtractionRatio >= 1 ? '正平衡' : '负平衡'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
                <p className="text-[10px] text-gw-muted">预测达标</p>
                <p className="text-base font-bold text-blue-400">{ecoResult.estimatedYears > 0 ? `${ecoResult.estimatedYears}年` : '已达标'}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
              <p className="text-[11px] font-semibold text-green-400">{ecoResult.level}</p>
              <p className="text-[10px] text-gw-muted mt-0.5">综合保障评分: {ecoResult.overallScore}/100</p>
            </div>

            <FilterableTechTable
              headers={['指标', '值', '评分', '判定']}
              rows={ecoResult.details.map(d => [d.indicator, d.value, d.score, d.assessment])}
            />

            <div>
              <p className="text-[11px] font-semibold text-gw-text mb-1">保障措施</p>
              <FilterableTechTable
                headers={['措施', '优先级', '效果', '时间线']}
                rows={ecoResult.measures.map(m => [m.measure, m.priority, m.effect, m.timeline])}
              />
            </div>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 4: 风险预警决策 ═══ */}
      <TechCard title="风险预警决策" badge="预警" icon={AlertTriangle} className="border-amber-500/20">

        {/* —— 第一行：全宽预警信号横幅 —— */}
        <div
          className="p-4 rounded-xl border-2 relative overflow-hidden mb-4"
          style={{
            background: `linear-gradient(135deg, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[0] ?? '#1e293b'} 0%, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[1] ?? '#0f172a'} 100%)`,
            borderColor: `${WARNING_COLORS[warningResult.overallWarning]}60`,
            boxShadow: `0 0 24px ${WARNING_COLORS[warningResult.overallWarning]}15, inset 0 1px 0 ${WARNING_COLORS[warningResult.overallWarning]}20`,
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: WARNING_COLORS[warningResult.overallWarning] }} />
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center pl-2">
            {/* 左：图标 */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${WARNING_COLORS[warningResult.overallWarning]}20`, border: `1px solid ${WARNING_COLORS[warningResult.overallWarning]}40` }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: WARNING_COLORS[warningResult.overallWarning] }} />
            </div>
            {/* 中：信号文字 */}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <WarningBadge level={warningResult.overallWarning} />
                <span className="text-[10px] text-gw-muted">综合预警</span>
              </div>
              <p className="text-[11px] text-gw-muted">{warningResult.warningSignal}</p>
            </div>
            {/* 右：水位+水质子预警竖排 */}
            <div className="flex gap-2">
              <div
                className="px-3 py-1.5 rounded-lg border-l-2 border-y border-r border-gw-border/20 text-center min-w-[72px]"
                style={{ borderLeftColor: WARNING_COLORS[warningResult.waterLevelWarning], background: `${WARNING_COLORS[warningResult.waterLevelWarning]}0a` }}
              >
                <p className="text-[9px] text-gw-muted">水位</p>
                <p className="text-xs font-bold" style={{ color: WARNING_COLORS[warningResult.waterLevelWarning] }}>{warningResult.waterLevelWarning}</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-lg border-l-2 border-y border-r border-gw-border/20 text-center min-w-[72px]"
                style={{ borderLeftColor: WARNING_COLORS[warningResult.waterQualityWarning], background: `${WARNING_COLORS[warningResult.waterQualityWarning]}0a` }}
              >
                <p className="text-[9px] text-gw-muted">水质</p>
                <p className="text-xs font-bold" style={{ color: WARNING_COLORS[warningResult.waterQualityWarning] }}>{warningResult.waterQualityWarning}</p>
              </div>
            </div>
          </div>
        </div>

        {/* —— 第二行：左输入 / 右水位标尺 —— */}
        <div className="grid grid-cols-[1fr_1fr] gap-4 mb-4">
          {/* 左：输入区分组卡片 */}
          <div className="space-y-3">
            {/* 水位参数组 */}
            <div className="p-3 rounded-xl bg-gw-surface/30 border border-gw-border/15">
              <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> 水位预警参数
              </p>
              <div className="grid grid-cols-2 gap-2">
                <InputCell label="当前水位埋深" value={warningInput.currentDepth} onChange={v => setWarningInput({ ...warningInput, currentDepth: v })} unit="m" step={0.1} />
                <InputCell label="月变化率" value={warningInput.monthlyChangeRate} onChange={v => setWarningInput({ ...warningInput, monthlyChangeRate: v })} unit="m/月" step={0.1} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <InputCell label="黄色警戒" value={warningInput.yellowThreshold} onChange={v => setWarningInput({ ...warningInput, yellowThreshold: v })} unit="m" />
                <InputCell label="红色预警" value={warningInput.redThreshold} onChange={v => setWarningInput({ ...warningInput, redThreshold: v })} unit="m" />
                <InputCell label="极限水位" value={warningInput.emergencyThreshold} onChange={v => setWarningInput({ ...warningInput, emergencyThreshold: v })} unit="m" />
              </div>
            </div>
            {/* 水质与开采组 */}
            <div className="p-3 rounded-xl bg-gw-surface/30 border border-gw-border/15">
              <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-amber-400" /> 水质与开采
              </p>
              <div className="grid grid-cols-2 gap-2">
                <InputCell label="Cl⁻浓度" value={warningInput.chloride} onChange={v => setWarningInput({ ...warningInput, chloride: v })} unit="mg/L" />
                <InputCell label="Cl⁻月变化率" value={warningInput.chlorideRate} onChange={v => setWarningInput({ ...warningInput, chlorideRate: v })} unit="mg/L/月" step={0.1} />
              </div>
              <div className="mt-2">
                <label className="block text-[10px] text-gw-muted mb-0.5">区域开采状态</label>
                <select value={warningInput.extractionStatus} onChange={e => setWarningInput({ ...warningInput, extractionStatus: e.target.value as WarningInput['extractionStatus'] })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors">
                  <option value="正常">正常</option>
                  <option value="超采">超采</option>
                  <option value="严重超采">严重超采</option>
                </select>
              </div>
            </div>
          </div>

          {/* 右：水位阈值标尺可视化 */}
          <div className="p-3 rounded-xl bg-gw-surface/30 border border-gw-border/15">
            <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> 水位阈值标尺
            </p>
            {(() => {
              const vals = [warningInput.yellowThreshold, warningInput.redThreshold, warningInput.emergencyThreshold, warningInput.currentDepth];
              const minVal = Math.min(...vals) * 0.8;
              const maxVal = Math.max(...vals) * 1.1;
              const range = maxVal - minVal;
              const pct = (v: number) => Math.max(0, Math.min(100, ((v - minVal) / range) * 100));
              const currentPct = pct(warningInput.currentDepth);
              const thresholds = [
                { label: '黄色警戒', value: warningInput.yellowThreshold, color: WARNING_COLORS['黄色'] },
                { label: '红色预警', value: warningInput.redThreshold, color: WARNING_COLORS['橙色'] },
                { label: '极限水位', value: warningInput.emergencyThreshold, color: WARNING_COLORS['红色'] },
              ];
              return (
                <div className="relative pt-2 pb-8">
                  {/* 标尺轨道 */}
                  <div className="relative h-8 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, #1e3a5f 0%, #422006 35%, #431407 65%, #450a0a 100%)' }}>
                    {/* 阈值标记线 */}
                    {thresholds.map((t, i) => (
                      <div key={i} className="absolute top-0 bottom-0" style={{ left: `${pct(t.value)}%` }}>
                        <div className="h-full w-0.5" style={{ background: t.color }} />
                        <div className="absolute -top-0.5 -translate-x-1/2 w-2 h-2 rounded-full border" style={{ background: t.color, borderColor: `${t.color}80` }} />
                      </div>
                    ))}
                    {/* 当前水位指针 */}
                    <div className="absolute top-0 bottom-0 z-10" style={{ left: `${currentPct}%` }}>
                      <div className="h-full w-0.5 bg-white shadow-lg" />
                      <div className="absolute -top-1 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white whitespace-nowrap" style={{ background: WARNING_COLORS[warningResult.waterLevelWarning] }}>
                        当前 {warningInput.currentDepth}m
                      </div>
                    </div>
                  </div>
                  {/* 阈值标签 */}
                  <div className="relative h-5 mt-1">
                    {thresholds.map((t, i) => (
                      <div key={i} className="absolute -translate-x-1/2 text-[9px] text-gw-muted whitespace-nowrap" style={{ left: `${pct(t.value)}%` }}>
                        {t.label}<br /><span style={{ color: t.color }}>{t.value}m</span>
                      </div>
                    ))}
                  </div>
                  {/* 区域标注 */}
                  <div className="flex justify-between mt-2 text-[9px] text-gw-muted/60">
                    <span>← 安全</span>
                    <span>危险 →</span>
                  </div>
                </div>
              );
            })()}
            {/* 预警指标速览 */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {warningResult.details.map((d, i) => (
                <div key={i} className="px-2 py-1 rounded-lg border-l-2 border-y border-r border-gw-border/15" style={{ borderLeftColor: WARNING_COLORS[d.warning] ?? '#64748b' }}>
                  <p className="text-[9px] text-gw-muted truncate">{d.indicator}</p>
                  <p className="text-[10px] font-semibold" style={{ color: WARNING_COLORS[d.warning] ?? '#94a3b8' }}>{d.warning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* —— 第三行：全宽响应措施矩阵 —— */}
        <div className="p-3 rounded-xl bg-gw-surface/20 border border-gw-border/15">
          <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> 响应措施矩阵
          </p>
          <div className="grid grid-cols-3 gap-2">
            {warningResult.responseMeasures.map((m, i) => {
              const mColor = WARNING_COLORS[m.level] ?? '#64748b';
              return (
                <div key={i} className="p-2.5 rounded-lg border-l-2 border-y border-r border-gw-border/15" style={{ borderLeftColor: mColor, background: `${mColor}06` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: mColor }} />
                    <span className="text-[10px] font-bold" style={{ color: mColor }}>{m.level}</span>
                    <span className="text-[9px] text-gw-muted ml-auto">{m.timeline}</span>
                  </div>
                  <p className="text-[10px] text-gw-text mb-1">{m.measure}</p>
                  <p className="text-[9px] text-gw-muted">责任: {m.responsible}</p>
                </div>
              );
            })}
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 5: 综合决策评价 ═══ */}
      <TechCard title="综合决策评价（多目标加权）" badge="综合" icon={Award} className="border-purple-500/15">
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <LazyChartCard title="方案对比雷达图" height={300}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { criterion: '水资源保障', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.水资源保障])) },
                { criterion: '生态效益', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.生态效益])) },
                { criterion: '经济可行性', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.经济可行性])) },
                { criterion: '技术可行性', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.技术可行性])) },
                { criterion: '社会接受度', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.社会接受度])) },
              ]} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="criterion" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                {decisionRadarData.map((d, i) => {
                  const key = d.option;
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                  return <Radar key={key} name={key} dataKey={key} stroke={colors[i % 4]} fill={colors[i % 4]} fillOpacity={0.15} />;
                })}
                <Tooltip {...TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          {/* 方案排名卡片 */}
          <div className="space-y-2">
            {decisionResult.rankedOptions.map((opt) => {
              const colors = ['#f59e0b', '#94a3b8', '#b45309', '#64748b'];
              const accent = opt.rank <= 3 ? colors[opt.rank - 1] : colors[3];
              return (
                <div
                  key={opt.name}
                  className="p-2.5 rounded-xl border transition-all"
                  style={{
                    background: opt.rank === 1 ? `${accent}10` : 'rgba(255,255,255,0.02)',
                    borderColor: opt.rank === 1 ? `${accent}40` : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <RankBadge rank={opt.rank} />
                    <span className="text-xs font-semibold text-gw-text flex-1">{opt.name}</span>
                    <span className="text-sm font-bold" style={{ color: accent }}>{opt.totalScore}</span>
                  </div>
                  <div className="mb-1"><ProgressBar value={opt.totalScore} max={100} color={accent} /></div>
                  <div className="flex items-center gap-3 text-[10px] text-gw-muted">
                    <span>投资 {opt.investment}万</span>
                    <span>周期 {opt.period}年</span>
                  </div>
                  <p className="text-[10px] text-gw-muted mt-1">{opt.recommendation}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3">
          <FilterableTechTable
            headers={['排名', '方案', '综合评分', '投资(万元)', '周期(年)', '推荐意见']}
            rows={decisionResult.rankedOptions.map(o => [o.rank, o.name, o.totalScore, o.investment, o.period, o.recommendation])}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold text-gw-text mb-1">权重设置</p>
            <FilterableTechTable
              headers={['评价准则', '权重', '说明']}
              rows={decisionResult.weights.map(w => [w.criterion, `${(w.weight * 100).toFixed(0)}%`, w.description])}
            />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gw-text">综合建议</p>
            {decisionResult.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 p-2 rounded-lg bg-purple-500/8 border border-purple-500/12">
                <span className="text-[10px] text-purple-400 font-bold mt-0.5">{i + 1}.</span>
                <p className="text-[10px] text-gw-muted">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 6: 方法参考 ═══ */}
      <TechCard title="方法参考" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/12">
            <p className="text-xs font-semibold text-blue-400 mb-1">水资源配置优化</p>
            <p className="text-[10px] text-gw-muted">多水源多用户线性规划分配，按用户优先级排序，每个用户内部按水源成本从低到高分配。保证最低供水保障量，水质等级需匹配用户要求。</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/12">
            <p className="text-xs font-semibold text-orange-400 mb-1">压采方案评估</p>
            <p className="text-[10px] text-gw-muted">分阶段计算压采量、替代水量、经济成本和缺口。生态效益(60%权重) + 经济可行性(40%权重)综合评分。替代水成本越低，经济可行性越高。</p>
          </div>
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/12">
            <p className="text-xs font-semibold text-green-400 mb-1">生态水位保障</p>
            <p className="text-[10px] text-gw-muted">三指标加权: 达标率(35%) + 水位差距(35%) + 补采比(30%)。深层含水层额外0.85倍折减。根据补采比估算水位恢复年限。</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/12">
            <p className="text-xs font-semibold text-amber-400 mb-1">风险预警决策</p>
            <p className="text-[10px] text-gw-muted">四级预警(蓝/黄/橙/红)，基于水位埋深、Cl⁻浓度、变化速率和开采状态综合判定。不同级别对应差异化的响应措施矩阵和责任分工。</p>
          </div>
        </div>
        <DataSourceNote source="基于河北省地下水管理实践及南水北调受水区配置方案整理" version="B-32 v1.1" />
      </TechCard>
    </div>
  );
}
