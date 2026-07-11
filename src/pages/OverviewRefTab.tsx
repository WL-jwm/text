// OverviewRefTab — Overview 的"参数参考"子 Tab
// Phase 7: Overview 拆分 — 将7个参数面板+历史+污染归入子 Tab，减轻首屏负载

import React from 'react';
import { HydrogeologyReferenceLibrary } from '../components/overview/HydrogeologyReferenceLibrary';
import { ExploitationControlComparison } from '../components/overview/ExploitationControlComparison';
import { ExploitationManagement } from '../components/overview/ExploitationManagement';
import { AlluvialFansWaterSources } from '../components/overview/AlluvialFansWaterSources';
import { StandardsReferencePanel } from '../components/overview/StandardsReferencePanel';
import { HydroParamsReferencePanel } from '../components/overview/HydroParamsReferencePanel';
import { ZoneParamsPanel } from '../components/overview/ZoneParamsPanel';
import { HistoricalEvolution } from '../components/overview/HistoricalEvolution';
import { PollutionQualityComparison } from '../components/overview/PollutionQualityComparison';

export function OverviewRefTab() {
  return (
    <div className="space-y-4">
      <HydrogeologyReferenceLibrary />

      <ExploitationControlComparison />

      <ExploitationManagement />

      <AlluvialFansWaterSources />

      <StandardsReferencePanel />

      <HydroParamsReferencePanel />

      <ZoneParamsPanel />

      <HistoricalEvolution />

      <PollutionQualityComparison />
    </div>
  );
}
