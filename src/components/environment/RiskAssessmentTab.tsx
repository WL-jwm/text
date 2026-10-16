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
import { OverexploitationInput, SubsidenceRiskInput, SeawaterIntrusionInput, DrasticInput, calcSeawaterIntrusionRisk, calcOverexploitationRisk, calcSubsidenceRisk, calcComprehensiveRisk, calcPollutionRisk, PRESET_AREAS } from '../../utils/riskAssessmentCalculator';
import { TechCard, StatCard } from '../UI';
import { ShieldAlert } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { RISK_COLORS, RISK_SCORES_MAP } from './riskPanels/riskAssessmentConstants';
import { PollutionPanel } from './riskPanels/PollutionPanel';
import { OverexploitPanel } from './riskPanels/OverexploitPanel';
import { SubsidencePanel } from './riskPanels/SubsidencePanel';
import { SeawaterPanel } from './riskPanels/SeawaterPanel';
import { ComprehensivePanel } from './riskPanels/ComprehensivePanel';
import { MethodPanel } from './riskPanels/MethodPanel';

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
      <PollutionPanel pollution={pollution} setPollution={setPollution} pollutionResult={pollutionResult} drasticBarData={drasticBarData} />

      {/* ═══ Panel 2: 超采风险 ═══ */}
      <OverexploitPanel overexploitation={overexploitation} setOverexploitation={setOverexploitation} overexploitResult={overexploitResult} />

      {/* ═══ Panel 3: 沉降风险 ═══ */}
      <SubsidencePanel subsidence={subsidence} setSubsidence={setSubsidence} subsidenceResult={subsidenceResult} />

      {/* ═══ Panel 4: 海水入侵风险 ═══ */}
      <SeawaterPanel seawater={seawater} setSeawater={setSeawater} seawaterResult={seawaterResult} />

      {/* ═══ Panel 5: 综合风险评价 ═══ */}
      <ComprehensivePanel radarData={radarData} barData={barData} comprehensiveResult={comprehensiveResult} />

      {/* ═══ Panel 6: 方法参考 ═══ */}
      <MethodPanel />
    </div>
  );
}

// 辅助映射
