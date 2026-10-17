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
  PRESET_SOURCES, PRESET_USERS, PRESET_REDUCTION_PLANS, PRESET_DECISION_OPTIONS,
  calcWaterAllocation, calcReductionPlan, calcEcoLevel, calcWarningDecision, calcDecisionEvaluation,
  type WaterSource, type WaterUser, type ReductionPlan, type EcoLevelInput, type WarningInput, type DecisionOption,
} from '../../utils/decisionSupportCalculator';
import { OverviewPanel } from './decisionPanels/OverviewPanel';
import { AllocationPanel } from './decisionPanels/AllocationPanel';
import { ReductionPanel } from './decisionPanels/ReductionPanel';
import { EcoLevelPanel } from './decisionPanels/EcoLevelPanel';
import { WarningPanel } from './decisionPanels/WarningPanel';
import { DecisionPanel } from './decisionPanels/DecisionPanel';
import { ReferencePanel } from './decisionPanels/ReferencePanel';

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
      <OverviewPanel
        allocationResult={allocationResult}
        reductionResult={reductionResult}
        ecoResult={ecoResult}
        warningResult={warningResult}
        decisionResult={decisionResult}
      />
      <AllocationPanel
        allocationResult={allocationResult}
        sources={sources}
        users={users}
        allocationBarData={allocationBarData}
        sourceUtilData={sourceUtilData}
      />
      <ReductionPanel reductionResult={reductionResult} reductionTrendData={reductionTrendData} />
      <EcoLevelPanel ecoInput={ecoInput} onEcoInputChange={setEcoInput} ecoResult={ecoResult} />
      <WarningPanel warningInput={warningInput} onWarningInputChange={setWarningInput} warningResult={warningResult} />
      <DecisionPanel decisionResult={decisionResult} decisionRadarData={decisionRadarData} />
      <ReferencePanel />
    </div>
  );
}
