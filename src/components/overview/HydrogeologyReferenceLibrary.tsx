// HydrogeologyReferenceLibrary — 历史水文地质参数参考库
// Phase 6d: 沉睡数据唤醒 — hydrogeologyHistorical 21个导出

import React, { useMemo, useState } from 'react';
import { TechCard, SortableTechTable } from '../UI';
import {
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
  historicalStratigraphy,
  largeIrrigationDistricts,
  mediumIrrigationByRegion,
  ionMobility,
  chengdeHydrochemistry,
} from '../../data/hydrogeologyHistorical';

type TabKey = 'springs' | 'aquifer' | 'runoff' | 'resistivity' | 'stratigraphy' | 'irrigation' | 'hydrochemistry';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'springs', label: '泉水数据库', icon: '💧' },
  { key: 'aquifer', label: '含水层参数', icon: '📊' },
  { key: 'runoff', label: '径流/渗漏', icon: '🌊' },
  { key: 'resistivity', label: '电阻率/力学', icon: '⚡' },
  { key: 'stratigraphy', label: '地层/岩溶', icon: '🏔️' },
  { key: 'irrigation', label: '灌溉区', icon: '🌾' },
  { key: 'hydrochemistry', label: '水化学', icon: '🧪' },
];

function springsTable() {
  return (
    <SortableTechTable
      headers={['地区', '位置', '流量(m³/h)', '出露地层']}
      rows={historicalSprings.map(s => [s.region, s.location, s.flow, s.geology])}
      highlightColumn={2}
    />
  );
}

function springsSummary() {
  return (
    <SortableTechTable
      headers={['地区', '泉数']}
      rows={springStatsByRegion.map(s => [s.region, s.count])}
      highlightColumn={1}
    />
  );
}

function aquiferTable() {
  const rows: (string | number)[][] = [];
  aquiferYieldRate.forEach(r => rows.push(['给水度', r.lithology, r.aquiferGroup, r.region, r.range]));
  kValueByZone.forEach(r => rows.push(['渗透系数K', r.lithology, r.aquiferGroup, r.plainZone, r.range]));
  thicknessYieldRelation.forEach(r => rows.push(['厚度-给水度', r.lithology, '-', r.thicknessRange, r.yieldRate]));
  deepWaterParams.forEach(r => rows.push(['深层水', r.region, 'S=' + r.elasticReleaseCoeff, 'ε=' + r.leakageRechargeCoeff, r.leakageMin + '~' + r.leakageMax]));
  regionSpecificYield.forEach(r => rows.push(['区域给水度', r.region, r.aquiferGroup, r.specificYield, r.staticReserve]));
  huailaiBasinParams.forEach(r => rows.push(['怀来盆地', r.position, r.lithology, r.yieldRate, r.waterType]));
  hanxingKarstParams.forEach(r => rows.push(['邯邢岩溶', r.location, r.aquifer, r.yieldRate, r.source]));
  basinAquiferParams.forEach(r => rows.push(['盆地含水层', r.location, r.lithology, r.yieldRate, r.thickness + 'm']));
  return (
    <SortableTechTable
      headers={['参数类型', '区段/岩性', '含水组', '数值', '附加信息']}
      rows={rows}
      highlightColumn={3}
    />
  );
}

function runoffTable() {
  const rows: (string | number)[][] = [];
  riverLeakageData.forEach(r => rows.push(['河流渗漏', r.river, r.section, r.measuredLeakage, r.avgLeakage, r.note]));
  mountainRunoffModulus.forEach(r => rows.push(['径流模数', r.rockType, '-', r.range, r.average, 'L/(s·km²)']));
  return (
    <SortableTechTable
      headers={['类型', '河流/岩性', '断面', '数值1', '数值2', '备注']}
      rows={rows}
      highlightColumn={3}
    />
  );
}

function resistivityTable() {
  const rows: (string | number)[][] = [];
  resistivitySalinityRelation.forEach(r => rows.push(['电阻率-矿化度', r.resistivityRange, r.salinityRange, r.waterType]));
  lithologyResistivity.forEach(r => rows.push(['岩性电阻率', r.lithology, r.resistivity, r.note]));
  plainResistivityZones.forEach(r => rows.push(['平原分区', r.hydroZone, r.sand, r.siltySand + '/' + r.siltyClay + '/' + r.clay]));
  rockMechanics.forEach(r => rows.push(['岩石力学', r.location, r.rockName, r.compressiveDry, r.compressiveSaturated]));
  reservoirGeology.forEach(r => rows.push(['水库地质', r.name, r.location, r.damType, r.foundationRock]));
  return (
    <SortableTechTable
      headers={['类型', '名称/岩性', '位置/分区', '数值', '备注']}
      rows={rows}
      highlightColumn={2}
    />
  );
}

function stratigraphyTable() {
  return (
    <SortableTechTable
      headers={['时代', '系', '统', '群', '厚度(m)', '主要岩性', '含水层备注']}
      rows={historicalStratigraphy.map(r => [r.era, r.system, r.series, r.group, r.thickness, r.mainLithology, r.aquiferNote])}
      highlightColumn={5}
    />
  );
}

function irrigationTable() {
  const rows: (string | number)[][] = [];
  largeIrrigationDistricts.forEach(r => rows.push(['大型', r.name, r.waterSource, r.designFlow, r.actualFlow, r.designArea, r.efficiency]));
  mediumIrrigationByRegion.forEach(r => rows.push(['中型', r.region, '-', r.designFlow, '-', r.designArea, '-']));
  return (
    <SortableTechTable
      headers={['规模', '名称/地区', '水源', '设计流量', '实际流量', '设计面积(万亩)', '有效系数']}
      rows={rows}
      highlightColumn={5}
    />
  );
}

function hydrochemistryTable() {
  const rows: (string | number)[][] = [];
  chengdeHydrochemistry.forEach(r => rows.push(['承德水化学', r.component, r.strongErosion, r.erosionDepositShallow, r.erosionDepositDeep, r.unit]));
  ionMobility.forEach(r => rows.push(['离子迁移', r.ion, r.mobility, r.ionType, '-', '-']));
  return (
    <SortableTechTable
      headers={['类型', '组分/离子', '强烈侵蚀区', '侵蚀堆积浅部', '侵蚀堆积深部', '单位']}
      rows={rows}
      highlightColumn={2}
    />
  );
}

export function HydrogeologyReferenceLibrary() {
  const [activeTab, setActiveTab] = useState<TabKey>('springs');

  const totalRecords = useMemo(() => {
    return historicalSprings.length + aquiferYieldRate.length + kValueByZone.length +
      riverLeakageData.length + mountainRunoffModulus.length + historicalStratigraphy.length +
      largeIrrigationDistricts.length + chengdeHydrochemistry.length;
  }, []);

  return (
    <TechCard title="历史水文地质参数参考库" badge={`${totalRecords}条`} className="hud-corners">
      <p className="text-xs text-gw-muted mb-3">
        数据来源：《河北省水文地质工程地质》(1980年代) — 供环评参数取值参考
      </p>

      {/* Tab 切换 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
              activeTab === tab.key
                ? 'bg-gw-cyan/15 text-gw-cyan border-gw-cyan/30'
                : 'bg-gw-surface text-gw-muted border-gw-surface hover:border-gw-cyan/20'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="max-h-[500px] overflow-y-auto">
        {activeTab === 'springs' && (
          <div className="space-y-4">
            {springsSummary()}
            {springsTable()}
          </div>
        )}
        {activeTab === 'aquifer' && aquiferTable()}
        {activeTab === 'runoff' && runoffTable()}
        {activeTab === 'resistivity' && resistivityTable()}
        {activeTab === 'stratigraphy' && stratigraphyTable()}
        {activeTab === 'irrigation' && irrigationTable()}
        {activeTab === 'hydrochemistry' && hydrochemistryTable()}
      </div>
    </TechCard>
  );
}
