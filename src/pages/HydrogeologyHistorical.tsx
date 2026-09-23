/**
 * 河北省历史水文地质参数汇编页
 * 主组件：数据收集 + Tab 状态编排（面板组件已拆分至 ./panels/）
 */
import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState, useMemo, useCallback } from 'react';
import { Database } from 'lucide-react';
import {
  historicalSprings, springStatsByRegion,
  riverLeakageData, mountainRunoffModulus,
  aquiferYieldRate, kValueByZone,
  thicknessYieldRelation, deepWaterParams,
  regionSpecificYield, huailaiBasinParams,
  hanxingKarstParams, basinAquiferParams,
  reservoirGeology, rockMechanics,
  resistivitySalinityRelation, lithologyResistivity,
  plainResistivityZones, ionMobility,
  chengdeHydrochemistry, historicalStratigraphy,
  largeIrrigationDistricts, mediumIrrigationByRegion,
} from '../data/hydrogeologyHistorical';
import { SectionTitle, DataSourceNote } from '../components/UI';
import { usePageCommons } from '../hooks/usePageCommons'
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
import { HistoricalParamCalculatorTab } from '../components/hydrogeology-historical/HistoricalParamCalculatorTab';
import { TABS, type TabKey } from './panels/hydrogeologyConstants';
import { SpringsPanel } from './panels/SpringsPanel';
import { AquiferPanel } from './panels/AquiferPanel';
import { RunoffPanel } from './panels/RunoffPanel';
import { BasinPanel } from './panels/BasinPanel';
import { EngineeringPanel } from './panels/EngineeringPanel';
import { GeophysicsPanel } from './panels/GeophysicsPanel';
import { StratigraphyPanel } from './panels/StratigraphyPanel';
// 注册报告生成器
export function HydrogeologyHistorical() {

  const { setExportOpen, exportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'hydrogeology-historical',
    collector: useCallback(async () => ({
      historicalSprings,
      springStatsByRegion,
      riverLeakageData,
      mountainRunoffModulus,
      aquiferYieldRate,
      kValueByZone,
      thicknessYieldRelation,
      deepWaterParams,
      regionSpecificYield,
      huailaiBasinParams,
      hanxingKarstParams,
      basinAquiferParams,
      reservoirGeology,
      rockMechanics,
      resistivitySalinityRelation,
      lithologyResistivity,
      plainResistivityZones,
      ionMobility,
      chengdeHydrochemistry,
      historicalStratigraphy,
      largeIrrigationDistricts,
      mediumIrrigationByRegion,
    }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('springs');
  const [springSearch, setSpringSearch] = useState('');
  const [springRegion, setSpringRegion] = useState('全部');
  const [expandedSpring, setExpandedSpring] = useState<number | null>(null);

  // ── 泉水过滤 ──
  const filteredSprings = useMemo(() => {
    let list = historicalSprings;
    if (springRegion !== '全部') list = list.filter(s => s.region === springRegion);
    if (springSearch.trim()) {
      const kw = springSearch.trim().toLowerCase();
      list = list.filter(s =>
        s.location.toLowerCase().includes(kw) ||
        s.geology.toLowerCase().includes(kw) ||
        s.region.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [springSearch, springRegion]);

  // ── 泉水流量分布（用于散点图） ──
  const springFlowData = useMemo(() => {
    return filteredSprings.map(s => {
      const flowStr = s.flow.replace(/~.*$/, '').replace(/[^0-9.]/g, '');
      const flow = parseFloat(flowStr);
      return { name: s.location, flow: isNaN(flow) ? 0 : flow, region: s.region };
    }).filter(d => d.flow > 0).sort((a, b) => b.flow - a.flow).slice(0, 30);
  }, [filteredSprings]);

  // ── 渗透系数对比数据 ──
  const _kComparison = useMemo(() => {
    const groups = ['粉砂', '细砂', '中砂', '粗砂', '砾石', '卵石'];
    return groups.map(l => {
      const items = kValueByZone.filter(k => k.lithology === l && k.aquiferGroup === 'I');
      const shallow = items.find(i => i.plainZone === '山前平原');
      const middle = items.find(i => i.plainZone === '中部平原');
      return { name: l, 山前: shallow ? shallow.range : '-', 中部: middle ? middle.range : '-' };
    });
  }, []);

  // ── 报告数据 ──

  return (

    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={Database}>历史水文地质参数汇编</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">
            数据来源：《河北省水文地质工程地质》(1980年代, OCR识别) | {historicalSprings.length}条泉水 · 12条河流渗漏 · 含水层参数 · 工程地质
          </p>
        </div>
        <button onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出报告
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}>
            <tab.icon size={14} />
            {tab.label}
            {tab.count && <span className="text-[9px] px-1 py-0.5 rounded bg-gw-blue/10 text-gw-cyan">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ═══════════════════ 泉水数据库 ═══════════════════ */}

      {activeTab === 'springs' && (
        <SpringsPanel
          filteredSprings={filteredSprings}
          springFlowData={springFlowData}
          springSearch={springSearch}
          springRegion={springRegion}
          onSearchChange={setSpringSearch}
          onRegionChange={setSpringRegion}
          onToggleExpand={(id) => setExpandedSpring(expandedSpring === id ? null : id)}
        />
      )}
      {activeTab === 'aquifer' && <AquiferPanel />}
      {activeTab === 'runoff' && <RunoffPanel />}
      {activeTab === 'basin' && <BasinPanel />}
      {activeTab === 'engineering' && <EngineeringPanel />}
      {activeTab === 'geophysics' && <GeophysicsPanel />}
      {activeTab === 'stratigraphy' && <StratigraphyPanel />}
            {activeTab === 'calculator' && <HistoricalParamCalculatorTab />}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="hydrogeology-historical"
        reportLabel="河北省历史水文地质参数汇编报告"
        data={getData()}
        dataLoading={dataLoading}
      />      <CrossLinkPanel currentPath="/hydrogeology-historical" />
      <DataSourceNote source="《河北省水文地质工程地质》(1980年代, OCR识别) | 河北瑞三元环境科技有限公司整理" />
    </div>
  );
}
