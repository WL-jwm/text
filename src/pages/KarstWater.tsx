import { useTabTransition } from '../hooks/useTabTransition';
import React, { useMemo, useCallback } from 'react';
import { Waves, Droplets, Mountain, Gauge, Shield } from 'lucide-react';
import { karstSprings, karstSystemZones, karstWaterChemistry, karstProtectionZones, karstExploitation } from '../data/karstWater';
import { springDatabase, getSpringStatsByGeology } from '../data/hydrogeologyReference';
import { SectionTitle, StatCard } from '../components/UI';
import { exportDataCSV } from '../utils/exportUtils';
import { KarstSpringsOverviewTab } from '../components/karst-water/KarstSpringsOverviewTab';
import { KarstSystemTab } from '../components/karst-water/KarstSystemTab';
import { KarstChemistryTab } from '../components/karst-water/KarstChemistryTab';
import { KarstProtectionTab } from '../components/karst-water/KarstProtectionTab';
import { KarstRecoveryTab } from '../components/karst-water/KarstRecoveryTab';
import { KarstClassicSpringsTab } from '../components/karst-water/KarstClassicSpringsTab';
import { KarstDevDepthTab } from '../components/karst-water/KarstDevDepthTab';
import { KarstFlowDynamicsTab } from '../components/karst-water/KarstFlowDynamicsTab';
import { KarstRechargeTab } from '../components/karst-water/KarstRechargeTab';
import { KarstIsotopeTab } from '../components/karst-water/KarstIsotopeTab';
import { SpringDecayTab } from '../components/karst-water/SpringDecayTab';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
// ── Tab 定义 ──
const tabs = ['泉域概览', '系统分区', '水化学特征', '保护分区', '泉域恢复', '经典岩溶泉', '发育深度', '泉水动态', '补给特征', '同位素特征', '流量衰减'];
const [SPRINGS, SYSTEM, CHEMISTRY, PROTECTION, RECOVERY, KARST_SPRINGS, DEV_DEPTH, FLOW_DYNAMICS, RECHARGE, ISOTOPE, DECAY] = tabs;

export function KarstWater() {

  const { success, setExportOpen } = usePageCommons({
    pageName: 'karst-water',
    collector: useCallback(async () => ({ karstSprings }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition(tabs[0]);

  // ── 导出 ──
  const handleExportSprings = () => {
    exportDataCSV(karstSprings.map(s => ({
      泉域: s.name, 位置: s.location, 类型: s.type, 流量: s.discharge, 单位: s.unit,
      面积km2: s.area, 岩性: s.lithology, 特征: s.features, 补给面积: s.rechargeArea, 水位: s.waterLevel, 矿化度: s.tds
    })), '河北省岩溶泉域');
    success('泉域数据已导出');
  };
  const handleExportZones = () => {
    exportDataCSV(karstSystemZones.map(z => ({
      分区: z.zone, 面积km2: z.area, 含水层: z.aquifer, 特征: z.feature,
      岩溶类型: z.karstType, 导水系数T: z.T, 平均出水量: z.avgYield, 降雨量: z.rainfall, 补给系数: z.rechargeCoeff
    })), '岩溶水系统分区');
    success('系统分区数据已导出');
  };

  // ── 统计 ──
  const producingSprings = karstSprings.filter(s => s.discharge !== '-').length;

  // ── 泉域面积饼图数据 ──
  const springAreaData = useMemo(() =>
    karstSprings.map(p => ({ name: p.name, value: parseFloat(p.area) || 0 }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value),
    []
  );

  // ── 开发分区数据 ──
  const exploitationBarData = useMemo(() =>
    karstExploitation.map(e => ({
      name: e.zone,
      可开采量: parseFloat(String(e.totalAllowable).replace('~', '')) || 0,
      当前开采: parseFloat(String(e.currentExtraction).replace('~', '')) || 0,
      status: e.status,
    })),
    []
  );

  // ── 水化学散点数据 ──
  const chemScatterData = useMemo(() =>
    karstWaterChemistry.map(c => ({
      name: c.zone,
      TDS: parseFloat(String(c.tds).split('~').pop() || '0'),
      pH: parseFloat(String(c.pH).split('~').pop() || '7'),
      hardness: parseFloat(String(c.hardness).split('~').pop() || '0'),
    })),
    []
  );

  // ── 保护分区数据 ──
  const protectionBarData = useMemo(() =>
    karstProtectionZones.map(z => ({
      name: z.spring,
      保护面积: parseFloat(z.protectionArea) || 0,
      核心区: parseFloat(z.coreArea) || 0,
      其他区: (parseFloat(z.protectionArea) || 0) - (parseFloat(z.coreArea) || 0),
    })),
    []
  );

  const protectionPieData = useMemo(() => {
    const coreTotal = karstProtectionZones.reduce((s, z) => s + (parseFloat(z.coreArea) || 0), 0);
    const totalArea = karstProtectionZones.reduce((s, z) => s + (parseFloat(z.protectionArea) || 0), 0);
    return [
      { name: '核心区', value: coreTotal },
      { name: '其他保护区', value: totalArea - coreTotal },
    ].filter(d => d.value > 0);
  }, []);

  // ── 经典岩溶泉筛选 ──
  const classicKarstSprings = useMemo(() => {
    const keywords = ['灰岩', '白云岩', '石灰岩', '奥陶', '寒武', '震旦', '碳酸盐'];
    return springDatabase.filter(s => keywords.some(kw => s.geology.includes(kw)));
  }, []);

  const karstSpringRegionData = useMemo(() => {
    const map: Record<string, number> = {};
    classicKarstSprings.forEach(s => {
      map[s.region] = (map[s.region] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [classicKarstSprings]);

  const karstSpringGeologyData = useMemo(() => {
    return Object.entries(getSpringStatsByGeology())
      .filter(([geo]) => ['灰岩', '白云岩', '石灰岩', '奥陶', '寒武', '震旦', '碳酸盐'].some(kw => geo.includes(kw)))
      .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, []);

  // ── 系统分区导水系数对比 ──
  const tBarData = useMemo(() =>
    karstSystemZones.map(z => {
      const tRange = String(z.T).split('～').map(s => parseFloat(s.replace(',', '')));
      return {
        name: z.zone,
        T_min: tRange[0] || 0,
        T_max: tRange[1] || tRange[0] || 0,
      };
    }),
    []
  );

  // ── 水化学水类型分布 ──
  const waterTypePie = useMemo(() => {
    const typeMap: Record<string, number> = {};
    karstWaterChemistry.forEach(c => {
      const t = c.waterType.split('-')[0];
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, []);

  // 报告数据预采集（增量缓存）
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Waves}>岩溶水</SectionTitle>
        <button onClick={() => setExportOpen(true)}
          className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
          导出报告
        </button>
      </div>

      {/* KPI 指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="岩溶泉域" value={karstSprings.length} unit="个" icon={Droplets} accent="blue" />
        <StatCard title="系统分区" value={karstSystemZones.length} unit="个" icon={Mountain} accent="cyan" />
        <StatCard title="有流量记录" value={producingSprings} unit={`/${karstSprings.length}`} icon={Gauge} accent="green" subtitle={`${karstSprings.length - producingSprings}个已断流`} />
        <StatCard title="保护区" value={karstProtectionZones.length} unit="个" icon={Shield} accent="amber" />
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 p-1 bg-gw-surface/50 rounded-lg overflow-x-auto scrollbar-none">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeTab === t ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/80'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === SPRINGS && (
        <KarstSpringsOverviewTab
          springAreaData={springAreaData}
          handleExportSprings={handleExportSprings}
        />
      )}

      {activeTab === SYSTEM && (
        <KarstSystemTab
          tBarData={tBarData}
          exploitationBarData={exploitationBarData}
          handleExportZones={handleExportZones}
        />
      )}

      {activeTab === CHEMISTRY && (
        <KarstChemistryTab
          chemScatterData={chemScatterData}
          waterTypePie={waterTypePie}
        />
      )}

      {activeTab === PROTECTION && (
        <KarstProtectionTab
          protectionBarData={protectionBarData}
          protectionPieData={protectionPieData}
        />
      )}

      {activeTab === RECOVERY && <KarstRecoveryTab />}

      {activeTab === KARST_SPRINGS && (
        <KarstClassicSpringsTab
          classicKarstSprings={classicKarstSprings}
          karstSpringRegionData={karstSpringRegionData}
          karstSpringGeologyData={karstSpringGeologyData}
        />
      )}

      {activeTab === DEV_DEPTH && <KarstDevDepthTab />}
      {activeTab === FLOW_DYNAMICS && <KarstFlowDynamicsTab />}
      {activeTab === RECHARGE && <KarstRechargeTab />}
      {activeTab === ISOTOPE && <KarstIsotopeTab />}
      {activeTab === DECAY && <SpringDecayTab />}
    </div>
  );
}
