/**
 * B-32 地下水管理决策支持器 Tab
 *
 * 5大面板：
 *  1. 水资源配置优化 — 多水源多用户线性规划分配
 *  2. 压采方案评估 — 分阶段压采+替代水源+经济成本
 *  3. 生态水位保障 — 阈值+保障措施+达标率
 *  4. 风险预警决策 — 三级预警+响应措施矩阵
 *  5. 综合决策评价 — 多目标加权+方案排序
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart,
} from 'recharts';
import { ClipboardList, BookOpen, AlertTriangle, Activity, Layers } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
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
  '蓝色': '#3b82f6', '黄色': '#f59e0b', '橙色': '#f97316', '红色': '#ef4444',
};

const USER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function romanLevel(n: number): string { return 'Ⅰ'.repeat(n) + '类'; }

export function DecisionSupportTab() {
  // 水资源配置
  const [sources] = useState<WaterSource[]>(PRESET_SOURCES);
  const [users] = useState<WaterUser[]>(PRESET_USERS);
  const allocationResult = useMemo(() => calcWaterAllocation(sources, users), [sources, users]);

  // 压采方案
  const [plans] = useState<ReductionPlan[]>(PRESET_REDUCTION_PLANS);
  const reductionResult = useMemo(() => calcReductionPlan(plans), [plans]);

  // 生态水位
  const [ecoInput, setEcoInput] = useState<EcoLevelInput>({
    thresholdDepth: 20, currentDepth: 22, targetDepth: 18,
    monitoringWells: 50, compliantWells: 35,
    annualRecharge: 3000, annualExtraction: 5000,
    aquiferType: '深层',
  });
  const ecoResult = useMemo(() => calcEcoLevel(ecoInput), [ecoInput]);

  // 风险预警
  const [warningInput, setWarningInput] = useState<WarningInput>({
    currentDepth: 28, yellowThreshold: 20, redThreshold: 25, emergencyThreshold: 30,
    monthlyChangeRate: 0.3, chloride: 180, chlorideRate: 5,
    extractionStatus: '超采',
  });
  const warningResult = useMemo(() => calcWarningDecision(warningInput), [warningInput]);

  // 综合决策
  const [options] = useState<DecisionOption[]>(PRESET_DECISION_OPTIONS);
  const decisionResult = useMemo(() => calcDecisionEvaluation(options), [options]);

  // 水资源配置图数据
  const allocationBarData = useMemo(() => {
    return allocationResult.userSatisfaction.map(u => ({
      name: u.user,
      allocated: u.allocated,
      demand: u.demand,
      satisfaction: u.satisfaction,
    }));
  }, [allocationResult]);

  // 水源利用率图数据
  const sourceUtilData = useMemo(() => {
    return allocationResult.sourceRemainder.map(s => ({
      name: s.source,
      utilization: s.utilization,
      remainder: s.remainder,
    }));
  }, [allocationResult]);

  // 压采趋势图数据
  const reductionTrendData = useMemo(() => {
    const cumulative = plans[0]?.currentExtraction ?? 0;
    const data: { phase: string; extraction: number; target: number; alternative: number }[] = [];
    data.push({ phase: '基准', extraction: cumulative, target: cumulative, alternative: 0 });
    for (const p of plans) {
      data.push({
        phase: p.phase,
        extraction: p.currentExtraction,
        target: p.targetExtraction,
        alternative: p.alternativeSupply,
      });
    }
    return data;
  }, [plans]);

  // 决策雷达图数据
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
      {/* 概览 */}
      <TechCard title="地下水管理决策支持器" badge="B-32" icon={ClipboardList}>
        <p className="text-[11px] text-gw-muted mb-3">集成水资源配置优化、压采方案评估、生态水位保障、风险预警决策和综合方案评价，为地下水管理提供量化决策支持。</p>
        <div className="grid grid-cols-5 gap-2">
          <StatCard title="配置满足率" value={`${allocationResult.overallSatisfaction}%`} accent={allocationResult.overallSatisfaction >= 80 ? 'green' : 'amber'} />
          <StatCard title="压采总量" value={reductionResult.totalReduction} unit="万m³" accent="orange" subtitle={`压采率${reductionResult.totalReductionRate}%`} />
          <StatCard title="生态保障" value={ecoResult.overallScore} unit="分" accent={ecoResult.overallScore >= 60 ? 'green' : 'red'} />
          <StatCard title="预警等级" value={warningResult.overallWarning} accent={warningResult.overallWarning === '红色' || warningResult.overallWarning === '橙色' ? 'red' : 'amber'} />
          <StatCard title="最优方案" value={decisionResult.bestOption.split(':')[0]} accent="blue" subtitle={`评分${decisionResult.rankedOptions[0]?.totalScore ?? 0}`} />
        </div>
      </TechCard>

      {/* ═══ Panel 1: 水资源配置优化 ═══ */}
      <TechCard title="水资源配置优化" badge="配置" icon={Layers} className="border-blue-500/15">
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
          <LazyChartCard title="用户供水满足率" height={260}>
            <ResponsiveContainer width="100%" height={260}>
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

          <LazyChartCard title="水源利用率" height={260}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sourceUtilData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="utilization" name="利用率" radius={[4, 4, 0, 0]}>
                  {sourceUtilData.map((_, i) => <Cell key={i} fill={USER_COLORS[i % USER_COLORS.length]} />)}
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
              <p key={i} className="text-[10px] text-amber-400">⚠ {n}</p>
            ))}
          </div>
        )}
      </TechCard>

      {/* ═══ Panel 2: 压采方案评估 ═══ */}
      <TechCard title="压采方案评估" badge="压采" icon={Activity} className="border-orange-500/15">
        <LazyChartCard title="分阶段压采趋势" height={260}>
          <ResponsiveContainer width="100%" height={260}>
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
          <StatCard title="总压采量" value={reductionResult.totalReduction} unit="万m³/yr" accent="orange" />
          <StatCard title="压采率" value={`${reductionResult.totalReductionRate}%`} accent="red" />
          <StatCard title="总替代成本" value={reductionResult.totalAlternativeCost} unit="万元" accent="amber" />
          <StatCard title="综合评分" value={reductionResult.overallScore} unit="/100" accent={reductionResult.overallScore >= 70 ? 'green' : 'amber'} />
        </div>

        <div className="mt-3">
          <FilterableTechTable
            headers={['阶段', '年份', '压采量(万m³)', '压采率', '替代水量', '替代成本(万元)', '缺口', '生态效益', '评估']}
            rows={reductionResult.phaseResults.map(p => [p.phase, p.yearRange, p.reduction, `${p.reductionRate}%`, p.alternativeVolume, p.alternativeCost, p.gap, p.ecologicalBenefit, p.assessment])}
          />
        </div>

        <div className="mt-2 space-y-1">
          {reductionResult.recommendations.map((r, i) => (
            <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
          ))}
        </div>
      </TechCard>

      {/* ═══ Panel 3: 生态水位保障 ═══ */}
      <TechCard title="生态水位保障" badge="生态" icon={Layers} className="border-green-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">生态水位埋深阈值 (m)</label>
            <input type="number" value={ecoInput.thresholdDepth} onChange={e => setEcoInput({ ...ecoInput, thresholdDepth: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">当前水位埋深 (m)</label>
            <input type="number" value={ecoInput.currentDepth} onChange={e => setEcoInput({ ...ecoInput, currentDepth: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">目标水位埋深 (m)</label>
            <input type="number" value={ecoInput.targetDepth} onChange={e => setEcoInput({ ...ecoInput, targetDepth: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">监测井数 / 达标井数</label>
            <div className="flex gap-2">
              <input type="number" value={ecoInput.monitoringWells} onChange={e => setEcoInput({ ...ecoInput, monitoringWells: +e.target.value })}
                className="w-1/2 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
              <input type="number" value={ecoInput.compliantWells} onChange={e => setEcoInput({ ...ecoInput, compliantWells: +e.target.value })}
                className="w-1/2 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            </div>
            <label className="block text-[11px] text-gw-muted">年回补量 / 年开采量 (万m³)</label>
            <div className="flex gap-2">
              <input type="number" value={ecoInput.annualRecharge} onChange={e => setEcoInput({ ...ecoInput, annualRecharge: +e.target.value })}
                className="w-1/2 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
              <input type="number" value={ecoInput.annualExtraction} onChange={e => setEcoInput({ ...ecoInput, annualExtraction: +e.target.value })}
                className="w-1/2 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            </div>
            <label className="block text-[11px] text-gw-muted">含水层类型</label>
            <select value={ecoInput.aquiferType} onChange={e => setEcoInput({ ...ecoInput, aquiferType: e.target.value as '浅层' | '深层' })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              <option value="浅层">浅层</option>
              <option value="深层">深层</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <StatCard title="达标率" value={`${ecoResult.complianceRate}%`} accent={ecoResult.complianceRate >= 80 ? 'green' : 'amber'} />
              <StatCard title="水位差距" value={ecoResult.depthGap} unit="m" accent={ecoResult.depthGap <= 0 ? 'green' : 'red'} />
              <StatCard title="补采比" value={ecoResult.rechargeExtractionRatio} accent={ecoResult.rechargeExtractionRatio >= 1 ? 'green' : 'red'} />
              <StatCard title="预测达标" value={ecoResult.estimatedYears > 0 ? `${ecoResult.estimatedYears}年` : '已达标'} accent="blue" />
            </div>
            <div className="p-2 rounded-lg bg-green-500/8 border border-green-500/15">
              <p className="text-[11px] font-semibold text-green-400">{ecoResult.level}</p>
              <p className="text-[10px] text-gw-muted">综合保障评分: {ecoResult.overallScore}/100</p>
            </div>
            <FilterableTechTable
              headers={['指标', '值', '评分', '判定']}
              rows={ecoResult.details.map(d => [d.indicator, d.value, d.score, d.assessment])}
            />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">保障措施</p>
              <FilterableTechTable
                headers={['措施', '优先级', '效果', '时间线']}
                rows={ecoResult.measures.map(m => [m.measure, m.priority, m.effect, m.timeline])}
              />
            </div>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 4: 风险预警决策 ═══ */}
      <TechCard title="风险预警决策" badge="预警" icon={AlertTriangle} className="border-red-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">当前水位埋深 (m)</label>
            <input type="number" step="0.1" value={warningInput.currentDepth} onChange={e => setWarningInput({ ...warningInput, currentDepth: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">黄色警戒 / 红色预警 / 极限水位 (m)</label>
            <div className="flex gap-2">
              <input type="number" value={warningInput.yellowThreshold} onChange={e => setWarningInput({ ...warningInput, yellowThreshold: +e.target.value })}
                className="w-1/3 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
              <input type="number" value={warningInput.redThreshold} onChange={e => setWarningInput({ ...warningInput, redThreshold: +e.target.value })}
                className="w-1/3 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
              <input type="number" value={warningInput.emergencyThreshold} onChange={e => setWarningInput({ ...warningInput, emergencyThreshold: +e.target.value })}
                className="w-1/3 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            </div>
            <label className="block text-[11px] text-gw-muted">水位月变化率 (m/月)</label>
            <input type="number" step="0.1" value={warningInput.monthlyChangeRate} onChange={e => setWarningInput({ ...warningInput, monthlyChangeRate: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">Cl⁻浓度 (mg/L) / 月变化率 (mg/L/月)</label>
            <div className="flex gap-2">
              <input type="number" value={warningInput.chloride} onChange={e => setWarningInput({ ...warningInput, chloride: +e.target.value })}
                className="w-1/2 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
              <input type="number" step="0.1" value={warningInput.chlorideRate} onChange={e => setWarningInput({ ...warningInput, chlorideRate: +e.target.value })}
                className="w-1/2 px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            </div>
            <label className="block text-[11px] text-gw-muted">区域开采状态</label>
            <select value={warningInput.extractionStatus} onChange={e => setWarningInput({ ...warningInput, extractionStatus: e.target.value as WarningInput['extractionStatus'] })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              <option value="正常">正常</option>
              <option value="超采">超采</option>
              <option value="严重超采">严重超采</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border" style={{ background: `${WARNING_COLORS[warningResult.overallWarning]}15`, borderColor: `${WARNING_COLORS[warningResult.overallWarning]}40` }}>
              <p className="text-sm font-bold" style={{ color: WARNING_COLORS[warningResult.overallWarning] }}>
                {warningResult.overallWarning}预警
              </p>
              <p className="text-[11px] text-gw-muted mt-0.5">{warningResult.warningSignal}</p>
            </div>

            <FilterableTechTable
              headers={['指标', '值', '预警', '判定']}
              rows={warningResult.details.map(d => [d.indicator, d.value, d.warning, d.assessment])}
            />

            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">响应措施矩阵</p>
              <FilterableTechTable
                headers={['等级', '措施', '责任单位', '时限']}
                rows={warningResult.responseMeasures.map(m => [m.level, m.measure, m.responsible, m.timeline])}
              />
            </div>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 5: 综合决策评价 ═══ */}
      <TechCard title="综合决策评价（多目标加权）" badge="综合" icon={ClipboardList} className="border-purple-500/15">
        <LazyChartCard title="方案对比雷达图" height={320}>
          <ResponsiveContainer width="100%" height={320}>
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
              <div key={i} className="p-2 rounded-lg bg-purple-500/8 border border-purple-500/12">
                <p className="text-[10px] text-gw-muted">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 6: 方法参考 ═══ */}
      <TechCard title="方法参考" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">水资源配置优化</p>
            <p className="text-[10px] text-gw-muted">多水源多用户线性规划分配，按用户优先级排序，每个用户内部按水源成本从低到高分配。保证最低供水保障量，水质等级需匹配用户要求。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">压采方案评估</p>
            <p className="text-[10px] text-gw-muted">分阶段计算压采量、替代水量、经济成本和缺口。生态效益(60%权重) + 经济可行性(40%权重)综合评分。替代水成本越低，经济可行性越高。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">生态水位保障</p>
            <p className="text-[10px] text-gw-muted">三指标加权: 达标率(35%) + 水位差距(35%) + 补采比(30%)。深层含水层额外0.85倍折减。根据补采比估算水位恢复年限。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">风险预警决策</p>
            <p className="text-[10px] text-gw-muted">四级预警(蓝/黄/橙/红)，基于水位埋深、Cl⁻浓度、变化速率和开采状态综合判定。不同级别对应差异化的响应措施矩阵和责任分工。</p>
          </div>
        </div>
        <DataSourceNote source="基于河北省地下水管理实践及南水北调受水区配置方案整理" version="B-32 v1.0" />
      </TechCard>
    </div>
  );
}
