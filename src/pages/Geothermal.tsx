import { useTabTransition } from '../hooks/useTabTransition';
import React, { useMemo, useCallback } from 'react';
import { Thermometer, MapPin, Factory, Recycle, BookOpen, BarChart3, Activity, Target, Flame, TrendingUp, Zap, Calculator } from 'lucide-react';
import { geothermalFields, geothermalTypes, geothermalUtilization, geothermalResources, geothermalGradient } from '../data/geothermal';
import { exportDataCSV } from '../utils/exportUtils';
import { StatCard, DataSourceNote, CHART_COLORS } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { GeothermalFieldsTab } from '../components/geothermal/GeothermalFieldsTab';
import { GeothermalTypesTab } from '../components/geothermal/GeothermalTypesTab';
import { GeothermalUtilizationTab } from '../components/geothermal/GeothermalUtilizationTab';
import { GeothermalReinjectionTab } from '../components/geothermal/GeothermalReinjectionTab';
import { GeothermalHotSpringsTab } from '../components/geothermal/GeothermalHotSpringsTab';
import { GeothermalGradientTab } from '../components/geothermal/GeothermalGradientTab';
import { GeothermalChemistryTab } from '../components/geothermal/GeothermalChemistryTab';
import { GeothermalPotentialTab } from '../components/geothermal/GeothermalPotentialTab';
import { GeothermalCalculatorTab } from '../components/geothermal/GeothermalCalculatorTab';
import type { GeothermalField, GeothermalType, GeothermalUtilization, GeothermalGradient, TempBarItem, AreaBarItem, GradientDepthItem, PieItem, BarItem } from '../types/geothermal';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'fields', label: '地热田', icon: MapPin },
  { key: 'types', label: '类型分区', icon: Thermometer },
  { key: 'utilization', label: '开发利用', icon: Factory },
  { key: 'reinjection', label: '回灌数据', icon: Recycle },
  { key: 'hotsprings', label: '热泉资料', icon: BookOpen },
  { key: 'gradient', label: '地温梯度', icon: BarChart3 },
  { key: 'chemistry', label: '流体化学', icon: Activity },
  { key: 'potential', label: '潜力评估', icon: Target },
  { key: 'calculator', label: '资源量计算', icon: Calculator },
] as const;

type TabKey = typeof TABS[number]['key'];

export function Geothermal() {

  const { success } = usePageCommons({
    pageName: 'geothermal',
    collector: useCallback(async () => ({ geothermalFields, geothermalTypes }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('fields');

  // ── 图表数据 ──
  const typePie: PieItem[] = useMemo(() =>
    (geothermalTypes as GeothermalType[]).map((t: GeothermalType, i: number) => ({ name: t.type, value: t.count, color: CHART_COLORS[i] })),
    []
  );

  const utilizationBar: BarItem[] = useMemo(() =>
    (geothermalUtilization as GeothermalUtilization[]).map((u: GeothermalUtilization, i: number) => ({
      name: u.use.replace('地热', '').replace('(试验)', '(试验)'),
      value: parseInt(u.proportion) || 0,
      color: CHART_COLORS[i],
    })),
    []
  );

  const tempBarData: TempBarItem[] = useMemo(() =>
    (geothermalFields as GeothermalField[])
      .map((f: GeothermalField) => ({
        name: f.name.length > 6 ? f.name.slice(0, 6) : f.name,
        minT: parseFloat(f.temperature.split('~')[0]) || 50,
        maxT: parseFloat(f.temperature.split('~')[1]) || 80,
      }))
      .sort((a: TempBarItem, b: TempBarItem) => b.maxT - a.maxT),
    []
  );

  const gradientDepthData: GradientDepthItem[] = useMemo(() =>
    (geothermalGradient as GeothermalGradient[]).map((g: GeothermalGradient) => ({
      name: g.region,
      d1000: parseFloat(g.depth1000m.split('~')[0]) || 40,
      d2000: parseFloat(g.depth2000m.split('~')[0]) || 60,
      d3000: parseFloat(g.depth3000m.split('~')[0]) || 80,
    })),
    []
  );

  const areaBarData: AreaBarItem[] = useMemo(() =>
    (geothermalFields as GeothermalField[])
      .map((f: GeothermalField) => ({
        name: f.name.length > 6 ? f.name.slice(0, 6) : f.name,
        area: parseFloat(f.area) || 100,
        status: f.status,
      }))
      .sort((a: AreaBarItem, b: AreaBarItem) => b.area - a.area),
    []
  );

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">地热资源</h1>
          <p className="text-xs text-gw-muted mt-1">地热田分布、类型分区与开发利用现状</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">调查年限型</span>
          <button onClick={() => { exportDataCSV(geothermalFields, 'geothermal-fields'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="地热田" value="8" unit="处" icon={Flame} accent="red" />
        <StatCard title="全国排名" value="第8" unit="位" icon={TrendingUp} accent="amber" />
        <StatCard title="地热供暖" value="~4500" unit="万m²" icon={Thermometer} accent="emerald" />
        <StatCard title="等效标煤" value={geothermalResources.annualReplaceable} icon={Zap} accent="blue" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'fields' && <GeothermalFieldsTab tempBarData={tempBarData} areaBarData={areaBarData} gradientDepthData={gradientDepthData} />}
      {activeTab === 'types' && <GeothermalTypesTab typePie={typePie} />}
      {activeTab === 'utilization' && <GeothermalUtilizationTab utilizationBar={utilizationBar} />}
      {activeTab === 'reinjection' && <GeothermalReinjectionTab />}
      {activeTab === 'hotsprings' && <GeothermalHotSpringsTab />}
      {activeTab === 'gradient' && <GeothermalGradientTab />}
      {activeTab === 'chemistry' && <GeothermalChemistryTab />}
      {activeTab === 'potential' && <GeothermalPotentialTab />}
      {activeTab === 'calculator' && <GeothermalCalculatorTab />}

      <DataSourceNote source="1999基础文献 + 2024年数据 | 第十章" version="v2.0" />
      <CrossLinkPanel currentPath="/geothermal" />
    </div>
  );
}
