/**
 * B-31 地下水风险评估计算器 Tab
 *
 * 5大面板：
 *  1. 污染风险 — 改进DRASTIC模型
 *  2. 超采风险 — 开采强度+补亏比+水位下降
 *  3. 沉降风险 — 压缩层+水位降幅+历史沉降
 *  4. 海水入侵 — 距海距离+Cl⁻+水力梯度
 *  5. 综合评价 — AHP权重+风险矩阵
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { ShieldAlert, BookOpen, AlertTriangle, ArrowDown, Waves } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { PipelinePanel } from '../PipelinePanel';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_AREAS,
  calcPollutionRisk, calcOverexploitationRisk, calcSubsidenceRisk,
  calcSeawaterIntrusionRisk, calcComprehensiveRisk,
  type DrasticInput, type OverexploitationInput, type SubsidenceRiskInput, type SeawaterIntrusionInput,
  type AquiferMedia, type SoilMedia, type VadoseZone, type LandUse,
} from '../../utils/riskAssessmentCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const RISK_COLORS: Record<string, string> = {
  '极低': '#10b981', '低': '#3b82f6', '中等': '#f59e0b', '高': '#f97316', '极高': '#ef4444',
};

const AQUIFER_OPTIONS: AquiferMedia[] = ['页岩', '变质岩', '砂岩', '灰岩', '砂砾石', '玄武岩'];
const SOIL_OPTIONS: SoilMedia[] = ['黏土', '粉质黏土', '粉土', '砂土', '砾石', '薄层/缺失'];
const VADOSE_OPTIONS: VadoseZone[] = ['黏土', '粉质黏土', '粉土', '砂', '砂砾', '灰岩', '砂岩'];
const LANDUSE_OPTIONS: LandUse[] = ['林地', '草地', '耕地', '建设用地', '工业区', '垃圾填埋场'];

type RiskLevel = '极低' | '低' | '中等' | '高' | '极高';

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: `${RISK_COLORS[level]}20`, color: RISK_COLORS[level], border: `1px solid ${RISK_COLORS[level]}40` }}
    >
      {level}
    </span>
  );
}

export function RiskAssessmentTab() {
  const [selectedArea, setSelectedArea] = useState(0);
  const [pollution, setPollution] = useState<DrasticInput>(PRESET_AREAS[0].pollution);
  const [overexploitation, setOverexploitation] = useState<OverexploitationInput>(PRESET_AREAS[0].overexploitation);
  const [subsidence, setSubsidence] = useState<SubsidenceRiskInput>(PRESET_AREAS[0].subsidence);
  const [seawater, setSeawater] = useState<SeawaterIntrusionInput>(PRESET_AREAS[0].seawater);

  const loadPreset = (idx: number) => {
    setSelectedArea(idx);
    setPollution(PRESET_AREAS[idx].pollution);
    setOverexploitation(PRESET_AREAS[idx].overexploitation);
    setSubsidence(PRESET_AREAS[idx].subsidence);
    setSeawater(PRESET_AREAS[idx].seawater);
  };

  const pollutionResult = useMemo(() => calcPollutionRisk(pollution), [pollution]);
  const overexploitResult = useMemo(() => calcOverexploitationRisk(overexploitation), [overexploitation]);
  const subsidenceResult = useMemo(() => calcSubsidenceRisk(subsidence), [subsidence]);
  const seawaterResult = useMemo(() => calcSeawaterIntrusionRisk(seawater), [seawater]);
  const comprehensiveResult = useMemo(() => calcComprehensiveRisk({
    pollutionRisk: pollutionResult.riskLevel,
    overexploitationRisk: overexploitResult.riskLevel,
    subsidenceRisk: subsidenceResult.riskLevel,
    seawaterIntrusionRisk: seawaterResult.riskLevel,
  }), [pollutionResult, overexploitResult, subsidenceResult, seawaterResult]);

  // 雷达图数据
  const radarData = useMemo(() => [
    { risk: '污染风险', score: RISK_COLORS[pollutionResult.riskLevel] ? RISK_SCORES_MAP[pollutionResult.riskLevel] : 1 },
    { risk: '超采风险', score: RISK_SCORES_MAP[overexploitResult.riskLevel] ?? 1 },
    { risk: '沉降风险', score: RISK_SCORES_MAP[subsidenceResult.riskLevel] ?? 1 },
    { risk: '海水入侵', score: RISK_SCORES_MAP[seawaterResult.riskLevel] ?? 1 },
  ], [pollutionResult, overexploitResult, subsidenceResult, seawaterResult]);

  // 综合风险条形图
  const barData = useMemo(() => comprehensiveResult.riskContributions.map(r => ({
    name: r.riskType,
    score: r.score,
    contribution: r.contribution,
    fill: RISK_COLORS[r.level],
  })), [comprehensiveResult]);

  // DRASTIC因子评分条形图
  const drasticBarData = useMemo(() => pollutionResult.factorRatings.map(f => ({
    name: f.symbol,
    label: f.factor,
    rating: f.rating,
    contribution: +f.contribution.toFixed(2),
  })), [pollutionResult]);

  return (
    <div className="space-y-4">
      {/* 预设区域选择器 */}
      <TechCard title="地下水风险评估计算器" badge="B-31" icon={ShieldAlert}>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="col-span-1">
            <label className="block text-[11px] text-gw-muted mb-1">预设评价区域</label>
            <select
              value={selectedArea}
              onChange={e => loadPreset(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-emerald-500/50"
            >
              {PRESET_AREAS.map((a, i) => (
                <option key={i} value={i}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex items-end">
            <p className="text-[11px] text-gw-muted">{PRESET_AREAS[selectedArea].description}</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <StatCard title="污染风险" value={pollutionResult.riskLevel} accent={pollutionResult.riskLevel === '极高' || pollutionResult.riskLevel === '高' ? 'red' : 'amber'} />
          <StatCard title="超采风险" value={overexploitResult.riskLevel} accent={overexploitResult.riskLevel === '极高' || overexploitResult.riskLevel === '高' ? 'red' : 'orange'} />
          <StatCard title="沉降风险" value={subsidenceResult.riskLevel} accent={subsidenceResult.riskLevel === '极高' || subsidenceResult.riskLevel === '高' ? 'red' : 'blue'} />
          <StatCard title="海水入侵" value={seawaterResult.riskLevel} accent={seawaterResult.riskLevel === '极高' || seawaterResult.riskLevel === '高' ? 'red' : 'cyan'} />
          <StatCard title="综合风险" value={comprehensiveResult.overallLevel} accent={comprehensiveResult.overallLevel === '极高' || comprehensiveResult.overallLevel === '高' ? 'red' : 'green'} subtitle={`评分 ${comprehensiveResult.overallScore}`} />
        </div>
      </TechCard>

      {/* ═══ Panel 1: 污染风险（DRASTIC）═══ */}
      <TechCard title="污染风险评价（改进DRASTIC）" badge="污染" icon={AlertTriangle} className="border-amber-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">D - 地下水埋深 (m)</label>
            <input type="number" value={pollution.depthToWater} onChange={e => setPollution({ ...pollution, depthToWater: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">R - 净补给量 (mm/yr)</label>
            <input type="number" value={pollution.netRecharge} onChange={e => setPollution({ ...pollution, netRecharge: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">A - 含水层介质</label>
            <select value={pollution.aquiferMedia} onChange={e => setPollution({ ...pollution, aquiferMedia: e.target.value as AquiferMedia })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {AQUIFER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <label className="block text-[11px] text-gw-muted">S - 土壤介质</label>
            <select value={pollution.soilMedia} onChange={e => setPollution({ ...pollution, soilMedia: e.target.value as SoilMedia })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {SOIL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <label className="block text-[11px] text-gw-muted">T - 地形坡度 (%)</label>
            <input type="number" value={pollution.topography} onChange={e => setPollution({ ...pollution, topography: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">I - 包气带</label>
            <select value={pollution.vadoseZone} onChange={e => setPollution({ ...pollution, vadoseZone: e.target.value as VadoseZone })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {VADOSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <label className="block text-[11px] text-gw-muted">C - 渗透系数 (m/d)</label>
            <input type="number" value={pollution.conductivity} onChange={e => setPollution({ ...pollution, conductivity: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">土地利用类型</label>
            <select value={pollution.landUse} onChange={e => setPollution({ ...pollution, landUse: e.target.value as LandUse })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {LANDUSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <StatCard title="DRASTIC指数" value={pollutionResult.drasticIndex} accent="blue" />
              <StatCard title="修正后指数" value={pollutionResult.adjustedIndex} accent="amber" subtitle={`土地利用×${(LANDUSE_FACTOR_MAP[pollution.landUse]).toFixed(1)}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gw-muted">风险等级:</span>
              <RiskBadge level={pollutionResult.riskLevel} />
            </div>
            <LazyChartCard title="DRASTIC因子评分" height={220}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={drasticBarData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(_v: unknown, _n: string, props: { payload?: { label?: string; rating?: number; contribution?: number } }) => [
                    `因子: ${props.payload?.label ?? ''}`,
                    `评分: ${props.payload?.rating ?? 0}/10`,
                    `贡献: ${props.payload?.contribution ?? 0}`,
                  ]} />
                  <Bar dataKey="rating" name="评分" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">主要风险因子</p>
              {pollutionResult.keyRiskFactors.length > 0 ? (
                pollutionResult.keyRiskFactors.map((f, i) => (
                  <p key={i} className="text-[10px] text-gw-muted">• {f}</p>
                ))
              ) : (
                <p className="text-[10px] text-gw-muted">无显著高风险因子</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">防护建议</p>
              {pollutionResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 2: 超采风险 ═══ */}
      <TechCard title="超采风险评价" badge="超采" icon={ArrowDown} className="border-orange-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">年开采量 (万m³/yr)</label>
            <input type="number" value={overexploitation.extraction} onChange={e => setOverexploitation({ ...overexploitation, extraction: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">年补给量 (万m³/yr)</label>
            <input type="number" value={overexploitation.recharge} onChange={e => setOverexploitation({ ...overexploitation, recharge: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">可开采量 (万m³/yr)</label>
            <input type="number" value={overexploitation.allowableExtraction} onChange={e => setOverexploitation({ ...overexploitation, allowableExtraction: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">水位年均下降速率 (m/yr)</label>
            <input type="number" step="0.1" value={overexploitation.waterLevelDecline} onChange={e => setOverexploitation({ ...overexploitation, waterLevelDecline: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">含水层类型</label>
            <select value={overexploitation.aquiferType} onChange={e => setOverexploitation({ ...overexploitation, aquiferType: e.target.value as OverexploitationInput['aquiferType'] })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              <option value="浅层孔隙水">浅层孔隙水</option>
              <option value="深层孔隙水">深层孔隙水</option>
              <option value="岩溶水">岩溶水</option>
              <option value="裂隙水">裂隙水</option>
            </select>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatCard title="开采强度" value={overexploitResult.extractionIntensity} accent={overexploitResult.extractionIntensity > 1 ? 'red' : 'green'} subtitle="开采/可开采" />
              <StatCard title="补亏比" value={overexploitResult.exploitationRatio} accent={overexploitResult.exploitationRatio > 1 ? 'red' : 'green'} subtitle="开采/补给" />
              <StatCard title="综合评分" value={overexploitResult.overallScore} accent="orange" subtitle={overexploitResult.riskLevel} />
            </div>
            <FilterableTechTable
              headers={['指标', '值', '评分', '权重', '判定']}
              rows={overexploitResult.details.map(d => [d.indicator, d.value, d.score, d.weight, d.assessment])}
            />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">管控建议</p>
              {overexploitResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 3: 沉降风险 ═══ */}
      <TechCard title="地面沉降风险评价" badge="沉降" icon={ArrowDown} className="border-blue-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">压缩层厚度 (m)</label>
            <input type="number" value={subsidence.compressibleLayerThickness} onChange={e => setSubsidence({ ...subsidence, compressibleLayerThickness: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">水位累计降幅 (m)</label>
            <input type="number" value={subsidence.waterLevelDecline} onChange={e => setSubsidence({ ...subsidence, waterLevelDecline: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">压缩层类型</label>
            <select value={subsidence.layerType} onChange={e => setSubsidence({ ...subsidence, layerType: e.target.value as SubsidenceRiskInput['layerType'] })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              <option value="黏土">黏土</option><option value="粉质黏土">粉质黏土</option><option value="粉土">粉土</option><option value="砂">砂</option>
            </select>
            <label className="block text-[11px] text-gw-muted">地层结构</label>
            <select value={subsidence.structure} onChange={e => setSubsidence({ ...subsidence, structure: e.target.value as SubsidenceRiskInput['structure'] })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              <option value="单层">单层</option><option value="多层互层">多层互层</option><option value="厚层黏土">厚层黏土</option>
            </select>
            <label className="block text-[11px] text-gw-muted">历史累计沉降量 (mm)</label>
            <input type="number" value={subsidence.historicalSubsidence} onChange={e => setSubsidence({ ...subsidence, historicalSubsidence: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">当前沉降速率 (mm/yr)</label>
            <input type="number" value={subsidence.currentRate} onChange={e => setSubsidence({ ...subsidence, currentRate: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatCard title="预测沉降量" value={subsidenceResult.predictedSubsidence} unit="mm" accent="blue" />
              <StatCard title="综合评分" value={subsidenceResult.overallScore} accent="orange" />
              <StatCard title="风险等级" value={subsidenceResult.riskLevel} accent={subsidenceResult.riskLevel === '极高' || subsidenceResult.riskLevel === '高' ? 'red' : 'blue'} />
            </div>
            <FilterableTechTable
              headers={['指标', '值', '评分', '判定']}
              rows={subsidenceResult.details.map(d => [d.indicator, d.value, d.score, d.assessment])}
            />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">管控建议</p>
              {subsidenceResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 4: 海水入侵风险 ═══ */}
      <TechCard title="海水入侵风险评价" badge="入侵" icon={Waves} className="border-cyan-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">距海岸线距离 (km)</label>
            <input type="number" value={seawater.distanceToCoast} onChange={e => setSeawater({ ...seawater, distanceToCoast: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">当前Cl⁻浓度 (mg/L)</label>
            <input type="number" value={seawater.currentChloride} onChange={e => setSeawater({ ...seawater, currentChloride: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">5年前Cl⁻浓度 (mg/L)</label>
            <input type="number" value={seawater.previousChloride} onChange={e => setSeawater({ ...seawater, previousChloride: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">内陆水位标高 (m)</label>
            <input type="number" step="0.1" value={seawater.inlandWaterLevel} onChange={e => setSeawater({ ...seawater, inlandWaterLevel: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">含水层渗透系数 (m/d)</label>
            <input type="number" value={seawater.conductivity} onChange={e => setSeawater({ ...seawater, conductivity: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="flex items-center gap-2 text-[11px] text-gw-muted">
              <input type="checkbox" checked={seawater.hasInterface} onChange={e => setSeawater({ ...seawater, hasInterface: e.target.checked })}
                className="accent-cyan-500" />
              存在咸淡水界面
            </label>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatCard title="侵入程度" value={seawaterResult.intrusionDegree} accent={seawaterResult.intrusionDegree.includes('严重') ? 'red' : 'cyan'} />
              <StatCard title="综合评分" value={seawaterResult.overallScore} accent="orange" />
              <StatCard title="风险等级" value={seawaterResult.riskLevel} accent={seawaterResult.riskLevel === '极高' || seawaterResult.riskLevel === '高' ? 'red' : 'cyan'} />
            </div>
            <FilterableTechTable
              headers={['指标', '值', '评分', '权重', '判定']}
              rows={seawaterResult.details.map(d => [d.indicator, d.value, d.score, d.weight, d.assessment])}
            />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">管控建议</p>
              {seawaterResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 5: 综合风险评价 ═══ */}
      <TechCard title="综合风险评价（AHP权重）" badge="综合" icon={ShieldAlert} className="border-red-500/15">
        <div className="grid grid-cols-2 gap-3">
          <LazyChartCard title="风险雷达图" height={300}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="risk" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="风险评分" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Tooltip {...TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <div className="space-y-3">
            <LazyChartCard title="各风险贡献度" height={180}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={55} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="score" name="评分" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/15">
              <p className="text-xs font-semibold text-red-400">{comprehensiveResult.matrixLevel}</p>
              <p className="text-[11px] text-gw-muted mt-1">综合评分: {comprehensiveResult.overallScore} / 5.00</p>
              <p className="text-[11px] text-gw-muted">优先管控: {comprehensiveResult.priorityOrder.join(' → ')}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">综合建议</p>
              {comprehensiveResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <FilterableTechTable
            headers={['风险类型', '等级', '评分', '权重', '贡献度', '占比']}
            rows={comprehensiveResult.riskContributions.map(r => [r.riskType, r.level, r.score, r.weight, r.contribution, `${r.barWidth}%`])}
          />
        </div>
      </TechCard>

      {/* ═══ Panel 6: 方法参考 ═══ */}
      <TechCard title="方法参考" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">改进DRASTIC模型</p>
            <p className="text-[10px] text-gw-muted">标准DRASTIC七因子(D/R/A/S/T/I/C)加权叠加，叠加土地利用修正系数(0.7~2.5)。权重: D=0.22, R=0.17, A=0.13, S=0.09, T=0.06, I=0.17, C=0.16。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">超采风险评价</p>
            <p className="text-[10px] text-gw-muted">三指标加权: 开采强度(40%) + 补亏比(30%) + 水位下降速率(30%)。深层含水层额外加权1.2倍。开采强度&gt;1即为超采。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">沉降风险评价</p>
            <p className="text-[10px] text-gw-muted">四指标加权: 压缩层条件(30%) + 水位降幅(25%) + 历史沉降(25%) + 当前速率(20%)。考虑压缩性系数(黏土0.9~砂0.3)和结构系数。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">海水入侵评价</p>
            <p className="text-[10px] text-gw-muted">三指标加权: 距海岸距离(30%) + Cl⁻浓度及趋势(35%) + 水力梯度(35%)。Cl⁻&gt;250mg/L为入侵阈值，趋势变化率&gt;1.5加重一级。</p>
          </div>
        </div>
        <PipelinePanel moduleId="riskAssessment" onReceive={(dataType, payload) => {
        if (dataType === 'drasticResult') {
          alert(`已接收DRASTIC脆弱性结果:\n指数=${payload.drasticIndex}, 等级=${payload.level}\n\n请据此调整风险评估的污染风险维度参数。`);
        } else if (dataType === 'waterQualityFactors') {
          const factors = (payload as { factors?: unknown[] }).factors;
          if (factors) alert(`已接收水质评价数据(${factors.length}项因子)\n\n请据此调整风险评估的水质维度。`);
        }
      }} />
      <DataSourceNote source="基于DRASTIC模型标准+河北省水文地质分区特征整理" version="B-31 v1.0" />
      </TechCard>
    </div>
  );
}

// 辅助映射
const RISK_SCORES_MAP: Record<string, number> = { '极低': 1, '低': 2, '中等': 3, '高': 4, '极高': 5 };
const LANDUSE_FACTOR_MAP: Record<string, number> = { '林地': 0.7, '草地': 0.8, '耕地': 1.2, '建设用地': 1.5, '工业区': 2.0, '垃圾填埋场': 2.5 };
