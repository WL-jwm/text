/**
 * 河北省地下水数据库总览页（Overview）
 * 数据层见 useOverviewData，核心图表区见 OverviewChartsSection
 */

import React, { lazy, Suspense } from 'react';
import { Activity, TrendingUp, Droplets, CheckCircle2, Trophy, Shield, HardHat } from 'lucide-react';

import { groundwaterDynamic2024, overExploitControl2024, cityBulletin2024 } from '../data/resources';
import { shallowTotal2024, deepTotal2024 } from '../data/environment';
import { dbMeta } from '../data/dbMeta';
import type { CityBulletinBrief } from '../types/county';

import { TechCard } from '../components/UI';
import { usePageCommons } from '../hooks/usePageCommons';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { StaggerContainer } from '../components/AnimatedCounter';
import { KPICard, GaugeCard } from './OverviewHelpers';
import { OverExploitMilestones } from '../components/overview/OverExploitMilestones';
import { OverviewWaterPressure } from './OverviewWaterPressure';
import { OverviewNavigation } from './OverviewNavigation';
import { CountyCoverageSection } from '../components/overview/CountyCoverageSection';
import { GovernanceSummaryCards } from '../components/overview/GovernanceSummaryCards';
import { CollapsiblePanel } from '../components/overview/CollapsiblePanel';
import { OverviewChartsSection } from './OverviewChartsSection';
import { useOverviewData } from './useOverviewData';

// ── 折叠面板内区块组件懒加载（默认折叠，展开时才加载，降低首屏 bundle）──
const HydrogeologyReferenceLibrary = lazy(() => import('../components/overview/HydrogeologyReferenceLibrary').then(m => ({ default: m.HydrogeologyReferenceLibrary })));
const ExploitationControlComparison = lazy(() => import('../components/overview/ExploitationControlComparison').then(m => ({ default: m.ExploitationControlComparison })));
const ExploitationManagement = lazy(() => import('../components/overview/ExploitationManagement').then(m => ({ default: m.ExploitationManagement })));
const AlluvialFansWaterSources = lazy(() => import('../components/overview/AlluvialFansWaterSources').then(m => ({ default: m.AlluvialFansWaterSources })));
const StandardsReferencePanel = lazy(() => import('../components/overview/StandardsReferencePanel').then(m => ({ default: m.StandardsReferencePanel })));
const HydroParamsReferencePanel = lazy(() => import('../components/overview/HydroParamsReferencePanel').then(m => ({ default: m.HydroParamsReferencePanel })));
const ZoneParamsPanel = lazy(() => import('../components/overview/ZoneParamsPanel').then(m => ({ default: m.ZoneParamsPanel })));
const HistoricalEvolution = lazy(() => import('../components/overview/HistoricalEvolution').then(m => ({ default: m.HistoricalEvolution })));
const PollutionQualityComparison = lazy(() => import('../components/overview/PollutionQualityComparison').then(m => ({ default: m.PollutionQualityComparison })));

const PanelFallback = () => (
  <div className="py-4 text-center text-gw-muted text-[10px]">加载中...</div>
);

export function Overview() {

  const { exportOpen, setExportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'overview',
    collector: async () => ({
      summary: overviewSummaryData,
      cityWaterLevel: cityWaterLevelExportData,
      systemZones: systemZoneExportData,
      overExploitDetail: overExploitCityData,
      historicalComp: historicalCompData,
      countyDataStats,
    }),
  });

  const {
    totalMineDrainage,
    avgMineUtilization,
    animResource,
    animSupply,
    animCompliance,
    animOverExploitReduction,
    animShallowRise,
    animDeepRise,
    animStorageChange,
    animRivers,
    animEcoVolume,
    animSpringCount,
    cityWaterLevelData,
    precipWaterLevelScatter,
    cityRadarData,
    supplyStructure,
    springData,
    countyDataStats,
    overviewSummaryData,
    cityWaterLevelExportData,
    systemZoneExportData,
    historicalCompData,
    overExploitCityData,
  } = useOverviewData();

  const d = groundwaterDynamic2024;

  const oe = overExploitControl2024;

  const now = new Date();

  const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (

    <div className="p-6 max-w-[1440px] mx-auto space-y-6">

      {/* ═══════════════════ Header ═══════════════════ */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gw-text tracking-tight">

            <span className="text-gw-highlight text-glow-cyan">河北地下水</span>

            <span className="text-gw-muted mx-2">/</span>

            基础资料数据库

          </h1>

          <p className="text-xs text-gw-muted mt-1 font-mono">

            Hebei Groundwater Database v2.0 | {timeStr}

          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="px-3 py-1 rounded-full text-[10px] bg-gw-cyan/10 text-gw-cyan border border-gw-cyan/20 font-mono tracking-wider">{dbMeta.version}</span>

          <span className="px-3 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">{dbMeta.lastUpdate}</span>

        </div>

      </div>

      <CountyCoverageSection countyDataStats={countyDataStats} cityBulletin2024={cityBulletin2024 as CityBulletinBrief[]} />

      {/* ═══════════════════ 核心指标 KPI（8列） ═══════════════════ */}

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3" staggerDelay={60}>

        <KPICard title="水资源总量" value={animResource} unit="亿m³" sub="2024年" href="/resources" change="+40.5%" changeType="up" icon={Droplets} accent="blue" sparkline={[167.7, 214.8, 206.2, 226.9, 168.6, 241.4, 247.9]} sparkColor="#3b82f6" />

        <KPICard title="地下水供水量" value={animSupply} unit="亿m³" sub="2024年" href="/resources" change={`峰值${d.declinePercent}%`} changeType="down" icon={Activity} accent="cyan" sparkline={[120.2, 112.6, 108.5, 106.1, 99.8, 82.3, 73.2]} sparkColor="#06b6d4" />

        <KPICard title="饮水源达标率" value={animCompliance} unit="%" href="/water-quality" change="27水源地" changeType="up" icon={CheckCircle2} accent="green" />

        <KPICard title="严重超采缩减" value={animOverExploitReduction} unit="%" href="/groundwater-function" change="历史突破" changeType="up" icon={Trophy} accent="emerald" sparkline={[155.3, 149.3, 143.8, 138.0, 132.6, 126.8, 121.1, 115.7, 110.8, 105.7, 94.5]} sparkColor="#10b981" />

        <KPICard title="浅层水位" value={animShallowRise} unit="m" href="/time-series" change="同比回升" changeType="up" icon={TrendingUp} accent="cyan" sparkline={[25.8, 27.2, 29.5, 32.1, 35.8, 40.2, 44.5, 50.3, 56.8, 63.5]} sparkColor="#06b6d4" />

        <KPICard title="深层水位" value={animDeepRise} unit="m" href="/time-series" change="同比回升" changeType="up" icon={TrendingUp} accent="blue" sparkline={[0.3, 0.5, 0.8, 1.0, 1.2, 1.5, 1.91]} sparkColor="#3b82f6" />

        <KPICard title="矿坑水利用" value={avgMineUtilization} unit="%" href="/mine-hydrogeology" change={`${totalMineDrainage.toFixed(1)}亿m³/a`} changeType="up" icon={HardHat} accent="amber" />

        <KPICard title="深层漏斗" value="消散" unit="" href="/groundwater-background" change="3个漏斗" changeType="neutral" icon={Shield} accent="purple" />

      </StaggerContainer>

      {/* ═════════════════ 历史治理成效摘要（Phase 3.2） ═════════════════ */}
      <TechCard title="2014→2024 超采治理十年成效" badge="综合评估" className="hud-corners">
        <GovernanceSummaryCards />
      </TechCard>

      <OverviewWaterPressure dataCounties={countyDataStats.dataCounties} />

      {/* ═══════════════════ 地下水动态仪表盘 ═══════════════════ */}

      <TechCard title="2024年地下水动态" icon={Activity} className="hud-corners">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <GaugeCard label="浅层水位回升" value={animShallowRise} unit="m" color="emerald" />

          <GaugeCard label="深层水位回升" value={animDeepRise} unit="m" color="emerald" />

          <GaugeCard label="蓄水变量" value={`+${animStorageChange}`} unit="亿m³" color="cyan" />

          <GaugeCard label="浅层漏斗面积" value={shallowTotal2024.totalArea} unit="km²" color="blue" sub="较上年-734" />

        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">

          <div>

            <div className="flex justify-between text-xs mb-1">

              <span className="text-gw-muted">浅层漏斗总面积</span>

              <span className="font-mono text-gw-cyan">{shallowTotal2024.totalArea} km²</span>

            </div>

            <div className="h-2.5 bg-gw-surface rounded-full overflow-hidden">

              <div className="h-full bg-gradient-to-r from-gw-blue to-gw-cyan rounded-full progress-bar" style={{ width: `${(Number(shallowTotal2024.totalArea) / 18000 * 100).toFixed(0)}%` }} />

            </div>

          </div>

          <div>

            <div className="flex justify-between text-xs mb-1">

              <span className="text-gw-muted">深层漏斗总面积</span>

              <span className="font-mono text-emerald-400">{deepTotal2024.totalArea} km²</span>

            </div>

            <div className="h-2.5 bg-gw-surface rounded-full overflow-hidden">

              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full progress-bar" style={{ width: '0%' }} />

            </div>

            <p className="text-[10px] text-emerald-400/70 mt-1 font-mono">3个深层漏斗全部消散</p>

          </div>

        </div>

      </TechCard>
      {/* ═══════════════════ 核心图表区（OverviewChartsSection） ═══════════════════ */}
      <OverviewChartsSection
        supplyStructure={supplyStructure}
        cityWaterLevelData={cityWaterLevelData}
        cityRadarData={cityRadarData}
        precipWaterLevelScatter={precipWaterLevelScatter}
      />

      <OverExploitMilestones
        oe={oe}
        springData={springData}
        animSpringCount={animSpringCount}
        animRivers={animRivers}
        animEcoVolume={animEcoVolume}
      />

      {/* ═══════════════════ 参数参考面板（默认折叠） ═══════════════════ */}
      <CollapsiblePanel title="历史水文地质参数参考库" badge="A表">
        <Suspense fallback={<PanelFallback />}><HydrogeologyReferenceLibrary /></Suspense>
      </CollapsiblePanel>

      <CollapsiblePanel title="超采治理成效对比" badge="exploitation">
        <Suspense fallback={<PanelFallback />}><ExploitationControlComparison /></Suspense>
      </CollapsiblePanel>

      <CollapsiblePanel title="开采管理概览" badge="管理">
        <Suspense fallback={<PanelFallback />}><ExploitationManagement /></Suspense>
      </CollapsiblePanel>

      <CollapsiblePanel title="冲洪积扇与水源地" badge="蓄水构造">
        <Suspense fallback={<PanelFallback />}><AlluvialFansWaterSources /></Suspense>
      </CollapsiblePanel>

      <CollapsiblePanel title="评价标准参考" badge="GB">
        <Suspense fallback={<PanelFallback />}><StandardsReferencePanel /></Suspense>
      </CollapsiblePanel>

      <CollapsiblePanel title="水文地质参数速查" badge="B表">
        <Suspense fallback={<PanelFallback />}><HydroParamsReferencePanel /></Suspense>
      </CollapsiblePanel>

      <CollapsiblePanel title="地下水系统分区参数" badge="分区">
        <Suspense fallback={<PanelFallback />}><ZoneParamsPanel /></Suspense>
      </CollapsiblePanel>

      <CollapsiblePanel title="历史演变与污染对比" badge="历史">
        <Suspense fallback={<PanelFallback />}><HistoricalEvolution /><PollutionQualityComparison /></Suspense>
      </CollapsiblePanel>

      <OverviewNavigation />

      {/* 导出报告按钮 */}
      <div className="flex items-center justify-end mb-2">
        <button onClick={() => setExportOpen(true)} className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出总览报告
        </button>
      </div>
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="overview"
        reportLabel="河北省地下水数据库总览报告"
        data={getData()}
        dataLoading={dataLoading}
      />

      {/* ── 数据源标注 ── */}

      <div className="flex items-center justify-between text-[10px] text-gw-muted/40 pb-4">

        <span>数据来源: 1999年《河北省地下水》+ 2024年水资源公报 + 2024年生态环境公报</span>

        <span>河北瑞三元环境科技有限公司</span>
      </div>
      </div>

  );
}
