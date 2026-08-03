/**
 * Visualization — 可视化中心
 *
 * 汇集 V-01~V-04 可视化升级 + E-01~E-04 专业扩展 + F-01 实时数据 + F-02 3D可视化：
 *   - V-01 交互式地图（EnhancedMap）
 *   - V-02 含水层剖面（AquiferProfile3D）
 *   - V-03 交互式Piper三线图（InteractivePiperDiagram）
 *   - V-04 综合Dashboard（ComprehensiveDashboard）
 *   - E-01 地下水年龄（GroundwaterAgeViz）
 *   - E-02 包气带运移（VadoseZoneViz）
 *   - E-03 多层耦合（MultiLayerCouplingViz）
 *   - E-04 实时监测（RealtimeMonitoringViz）
 *   - F-01 实时数据接入（RealtimeDashboard）
 *   - F-02a 3D含水层剖面（AquiferProfile3DWebGL）
 *   - F-02b 3D多层耦合（MultiLayerCoupling3D）
 */

import { useState } from 'react';
import { Map, Layers3, FlaskConical, LayoutDashboard, Hourglass, CloudRain, GitBranch, Activity, Radio, Box, Boxes, Globe } from 'lucide-react';
import { EnhancedMap } from '../components/visualization/EnhancedMap';
import { AquiferProfile3D } from '../components/visualization/AquiferProfile3D';
import { InteractivePiperDiagram } from '../components/visualization/InteractivePiperDiagram';
import { ComprehensiveDashboard } from '../components/visualization/ComprehensiveDashboard';
import { GroundwaterAgeViz } from '../components/visualization/GroundwaterAgeViz';
import { VadoseZoneViz } from '../components/visualization/VadoseZoneViz';
import { MultiLayerCouplingViz } from '../components/visualization/MultiLayerCouplingViz';
import { RealtimeMonitoringViz } from '../components/visualization/RealtimeMonitoringViz';
import { RealtimeDashboard } from '../components/realtime/RealtimeDashboard';
import { AquiferProfile3DWebGL } from '../components/visualization/AquiferProfile3DWebGL';
import { MultiLayerCoupling3D } from '../components/visualization/MultiLayerCoupling3D';
import { Isosurface3DContainer } from '../components/visualization/Isosurface3DContainer';
import { VizExportBar } from '../components/visualization/VizExportBar';
import { ResponsiveVizPanel } from '../components/visualization/ResponsiveVizPanel';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useI18n } from '../hooks/useI18n';

type VizTab = 'map' | 'profile' | 'piper' | 'dashboard' | 'age' | 'vadose' | 'coupling' | 'monitoring' | 'realtime' | 'profile3d' | 'coupling3d' | 'isosurface3d';

const TAB_DEFS: { key: VizTab; icon: typeof Map; labelKey: string; descKey: string }[] = [
  { key: 'map', icon: Map, labelKey: 'viz.tab.map', descKey: 'viz.tab.map.desc' },
  { key: 'profile', icon: Layers3, labelKey: 'viz.tab.profile', descKey: 'viz.tab.profile.desc' },
  { key: 'piper', icon: FlaskConical, labelKey: 'viz.tab.piper', descKey: 'viz.tab.piper.desc' },
  { key: 'dashboard', icon: LayoutDashboard, labelKey: 'viz.tab.dashboard', descKey: 'viz.tab.dashboard.desc' },
  { key: 'age', icon: Hourglass, labelKey: 'viz.tab.age', descKey: 'viz.tab.age.desc' },
  { key: 'vadose', icon: CloudRain, labelKey: 'viz.tab.vadose', descKey: 'viz.tab.vadose.desc' },
  { key: 'coupling', icon: GitBranch, labelKey: 'viz.tab.coupling', descKey: 'viz.tab.coupling.desc' },
  { key: 'monitoring', icon: Activity, labelKey: 'viz.tab.monitoring', descKey: 'viz.tab.monitoring.desc' },
  { key: 'realtime', icon: Radio, labelKey: 'viz.tab.realtime', descKey: 'viz.tab.realtime.desc' },
  { key: 'profile3d', icon: Box, labelKey: 'viz.tab.profile3d', descKey: 'viz.tab.profile3d.desc' },
  { key: 'coupling3d', icon: Boxes, labelKey: 'viz.tab.coupling3d', descKey: 'viz.tab.coupling3d.desc' },
  { key: 'isosurface3d', icon: Globe, labelKey: 'viz.tab.isosurface3d', descKey: 'viz.tab.isosurface3d.desc' },
];

export function Visualization() {
  const [activeTab, setActiveTab] = useState<VizTab>('map');
  const isMobile = useIsMobile();
  const { t } = useI18n();

  const TABS = TAB_DEFS.map(td => ({
    key: td.key,
    icon: td.icon,
    label: t(td.labelKey),
    description: t(td.descKey),
  }));

  // 当前Tab的导出配置
  const tabExportConfig: Record<VizTab, { id: string; title: string }> = {
    map: { id: 'interactive-map', title: '交互式地图' },
    profile: { id: 'aquifer-profile', title: '含水层剖面' },
    piper: { id: 'piper-diagram', title: 'Piper三线图' },
    dashboard: { id: 'comprehensive-dashboard', title: '综合仪表盘' },
    age: { id: 'groundwater-age', title: '地下水年龄' },
    vadose: { id: 'vadose-zone', title: '包气带运移' },
    coupling: { id: 'multi-layer-coupling', title: '多层耦合' },
    monitoring: { id: 'realtime-monitoring', title: '实时监测' },
    realtime: { id: 'realtime-dashboard', title: '实时数据' },
    profile3d: { id: '3d-aquifer-profile', title: '3D含水层剖面' },
    coupling3d: { id: '3d-multi-layer-coupling', title: '3D多层耦合' },
    isosurface3d: { id: '3d-isosurface', title: '3D等值面' },
  };

  // 3D Tab不需要ResponsiveVizPanel（Three.js自行处理canvas尺寸）
  const is3DTab = activeTab === 'profile3d' || activeTab === 'coupling3d' || activeTab === 'isosurface3d';

  return (
    <div className="space-y-4">
      {/* Tab切换 */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                isActive
                  ? 'bg-gw-blue/15 border-gw-blue/40 text-gw-blue'
                  : 'border-gw-border/30 text-gw-muted hover:text-gw-text hover:border-gw-border/50'
              }`}
            >
              <Icon size={14} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 当前Tab描述 + 导出工具栏 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[11px] text-gw-muted">
          {TABS.find(t => t.key === activeTab)?.description}
        </div>
        {!is3DTab && (
          <VizExportBar
            panelId={tabExportConfig[activeTab].id}
            panelTitle={tabExportConfig[activeTab].title}
            compact={isMobile}
          />
        )}
        {is3DTab && (
          <span className="text-[10px] text-gw-muted/60">Three.js WebGL · Drag to rotate · Scroll to zoom</span>
        )}
      </div>

      {/* 内容区 */}
      <div>
        {activeTab === 'map' && (
          <ResponsiveVizPanel defaultSvgWidth={800} defaultSvgHeight={600}><EnhancedMap /></ResponsiveVizPanel>
        )}
        {activeTab === 'profile' && (
          <ResponsiveVizPanel defaultSvgWidth={520} defaultSvgHeight={420}><AquiferProfile3D /></ResponsiveVizPanel>
        )}
        {activeTab === 'piper' && (
          <ResponsiveVizPanel defaultSvgWidth={440} defaultSvgHeight={380}><InteractivePiperDiagram /></ResponsiveVizPanel>
        )}
        {activeTab === 'dashboard' && (
          <ResponsiveVizPanel defaultSvgWidth={520} defaultSvgHeight={400}><ComprehensiveDashboard /></ResponsiveVizPanel>
        )}
        {activeTab === 'age' && (
          <ResponsiveVizPanel defaultSvgWidth={460} defaultSvgHeight={380}><GroundwaterAgeViz /></ResponsiveVizPanel>
        )}
        {activeTab === 'vadose' && (
          <ResponsiveVizPanel defaultSvgWidth={520} defaultSvgHeight={420}><VadoseZoneViz /></ResponsiveVizPanel>
        )}
        {activeTab === 'coupling' && (
          <ResponsiveVizPanel defaultSvgWidth={520} defaultSvgHeight={420}><MultiLayerCouplingViz /></ResponsiveVizPanel>
        )}
        {activeTab === 'monitoring' && (
          <ResponsiveVizPanel defaultSvgWidth={520} defaultSvgHeight={340}><RealtimeMonitoringViz /></ResponsiveVizPanel>
        )}
        {activeTab === 'realtime' && <RealtimeDashboard />}
        {activeTab === 'profile3d' && <AquiferProfile3DWebGL />}
        {activeTab === 'coupling3d' && <MultiLayerCoupling3D />}
        {activeTab === 'isosurface3d' && <Isosurface3DContainer />}
      </div>
    </div>
  );
}
