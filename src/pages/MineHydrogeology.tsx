import { ChartExport } from '../components/ChartExport';
import { CrossLinkPanel } from '../components/CrossLink';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { LazyChartCard } from '../components/LazyChartCard';
import { TechCard, TechTable, ChartTooltip, StatCard } from '../components/UI';
import { MineInflowTab } from '../components/mine/MineInflowTab';
import { mineEcologicalRestoration, mineHydrogeologyClassification, mineComplexityStandard, mineWaterInrushHistory, mineHydrogeologyData, mineDrainageImpact, mineDrainageStatistics, mineWaterUtilization } from '../data/mineHydrogeology';
import { usePageCommons } from '../hooks/usePageCommons';
import { useTabTransition } from '../hooks/useTabTransition';
import { exportDataCSV } from '../utils/exportUtils';
import React, { useCallback } from 'react';
import { CartesianGrid, Bar, YAxis, Tooltip, ResponsiveContainer, BarChart, XAxis } from 'recharts';
import { TABS, TabKey } from './minePanels/mineHydrogenConstants';
import { StatisticsPanel } from './minePanels/StatisticsPanel';
import { InrushPanel } from './minePanels/InrushPanel';
import { RestorationPanel } from './minePanels/RestorationPanel';
import { DrainageImpactPanel } from './minePanels/DrainageImpactPanel';

// 注册报告生成器

export function MineHydrogeology() {

  const { success } = usePageCommons({
    pageName: 'mine-hydrogeology',
    collector: useCallback(async () => ({ mineData: mineHydrogeologyData }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('mines');

  const inflowData = mineHydrogeologyData.map(d => {
    const range = d.mineWaterInflow.split('～');
    return {
      mine: d.mine,
      min: parseFloat(range[0]) || 0,
      max: parseFloat(range[1]) || 0,
      avg: ((parseFloat(range[0]) || 0) + (parseFloat(range[1]) || 0)) / 2 };
  });

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">矿床水文地质</h1>
          <p className="text-xs text-gw-muted mt-1">矿区充水条件、排水统计、突水事故与生态修复</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20">稳定可更新</span>
          <button onClick={() => { exportDataCSV(mineHydrogeologyData as Record<string, unknown>[], 'mine-hydrogeology'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
        </div>
      </div>

      {/* KPI卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="主要矿区" value={String(mineHydrogeologyData.length)} unit="处" accent="amber" />
        <StatCard title="年排水量" value={mineDrainageStatistics.totalAnnualDrainage.replace('约', '')} accent="cyan" />
        <StatCard title="综合利用率" value={mineDrainageStatistics.overallUtilizationRate} accent="emerald" />
        <StatCard title="突水事故" value={String(mineWaterInrushHistory.length)} unit="起" accent="red" />
        <StatCard title="生态修复" value={String(mineEcologicalRestoration.length)} unit="案例" accent="green" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ 矿区特征 ============ */}
      {activeTab === 'mines' && (
        <div className="space-y-4">
          <LazyChartCard title="矿区涌水量对比" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inflowData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
                <XAxis dataKey="mine" tick={{ fill: '#8b9dc3', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: 'm³/h', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 11 } }} />
                <Tooltip content={<ChartTooltip unit="m³" title="矿区涌水量对比" />} />
                <Bar dataKey="min" name="最小涌水" fill="#3b82f6" />
                <Bar dataKey="max" name="最大涌水" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
          <TechCard title="主要矿区水文地质特征">
              <div className="mb-3 flex justify-end">
                <ChartExport data={mineHydrogeologyData} filename="mine-hydrogeology" sheetName="矿区水文地质" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable headers={['矿区', '位置', '矿种', '时代', '含水层类型', '涌水量(m³/h)', '充水水源', '富水性', '水文地质类型', '年排水量', '防治措施']}
              rows={mineHydrogeologyData.map(d => [d.mine, d.location, d.oreType, d.geologicAge, d.aquiferType, d.mineWaterInflow, d.waterFillingSource, d.waterRichness, d.hydrogeologyType, d.annualDrainage, d.protectionMeasures])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>
        </div>
      )}

      {/* ============ 排水统计(新增) ============ */}
      {activeTab === 'statistics' && <StatisticsPanel />}

      {/* ============ 突水事故(新增) ============ */}
      {activeTab === 'inrush' && <InrushPanel />}

      {/* ============ 分类标准 ============ */}
      {activeTab === 'classification' && (
        <div className="space-y-4">
          <TechCard title="矿床水文地质分类">
            <TechTable headers={['类型', '描述', '复杂程度', '代表矿区']}
              rows={mineHydrogeologyClassification.map(c => [c.type, c.description, c.complexity, c.representative])}
          />
          </TechCard>
        </div>
      )}

      {/* ============ 排水影响 ============ */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          <TechCard title="矿区排水环境影响">
            <TechTable headers={['影响类型', '描述', '严重程度', '影响范围', '恢复状况']}
              rows={mineDrainageImpact.map(d => [d.impact, d.description, d.severity, d.affectedArea, d.recoveryStatus])}
          />
          </TechCard>
        </div>
      )}

      {/* ============ 矿坑水利用 ============ */}
      {activeTab === 'utilization' && (
        <div className="space-y-4">
          <TechCard title="矿坑水利用情况">
            <FilterableTechTable headers={['矿区', '年排水量(亿m³)', '利用率(%)', '利用途径', '利用量']}
              rows={mineWaterUtilization.map(u => [u.mine, u.annualDrainage, u.utilizationRate, u.utilization, u.utilizationAmount])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>
        </div>
      )}

      {/* ============ 生态修复(新增) ============ */}
      {activeTab === 'restoration' && <RestorationPanel />}

      {/* ============ 复杂度分级 ============ */}
      {activeTab === 'complexity' && (
        <div className="space-y-4">
          <TechCard title="矿区水文地质条件复杂程度分级">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mineComplexityStandard.map((s, i) => (
                <div key={i} className={`p-4 rounded-lg bg-gw-surface/50 border ${s.color === 'green' ? 'border-emerald-500/30' : s.color === 'blue' ? 'border-blue-500/30' : s.color === 'amber' ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${s.color === 'green' ? 'text-emerald-400' : s.color === 'blue' ? 'text-blue-400' : s.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>{s.level}</h3>
                  <p className="text-xs text-gw-muted">{s.criteria}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-gw-surface text-gw-text text-[10px]">充水层: {s.waterFillingLayers}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] text-gw-muted">勘查要求: </span>
                    <span className="text-[10px] text-gw-text">{s.explorationRequirement}</span>
                  </div>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      )}

      <DrainageImpactPanel />
      {activeTab === 'inflow_calc' && <MineInflowTab />}

      <CrossLinkPanel currentPath="/mine-hydrogeology" />
    </div>
  );
}
