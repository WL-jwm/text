/**
 * Visualization — 可视化中心
 *
 * 汇集 V-01~V-04 可视化升级组件 + E-01~E-04 专业扩展 + F-01 实时数据：
 *   - V-01 交互式地图（EnhancedMap）
 *   - V-02 含水层剖面（AquiferProfile3D）
 *   - V-03 交互式Piper三线图（InteractivePiperDiagram）
 *   - V-04 综合Dashboard（ComprehensiveDashboard）
 *   - E-01 地下水年龄（GroundwaterAgeViz）
 *   - E-02 包气带运移（VadoseZoneViz）
 *   - E-03 多层耦合（MultiLayerCouplingViz）
 *   - E-04 实时监测（RealtimeMonitoringViz）
 *   - F-01 实时数据接入（RealtimeDashboard）
 */

import { useState } from 'react';
import { Map, Layers3, FlaskConical, LayoutDashboard, Hourglass, CloudRain, GitBranch, Activity, Radio } from 'lucide-react';
import { EnhancedMap } from '../components/visualization/EnhancedMap';
import { AquiferProfile3D } from '../components/visualization/AquiferProfile3D';
import { InteractivePiperDiagram } from '../components/visualization/InteractivePiperDiagram';
import { ComprehensiveDashboard } from '../components/visualization/ComprehensiveDashboard';
import { GroundwaterAgeViz } from '../components/visualization/GroundwaterAgeViz';
import { VadoseZoneViz } from '../components/visualization/VadoseZoneViz';
import { MultiLayerCouplingViz } from '../components/visualization/MultiLayerCouplingViz';
import { RealtimeMonitoringViz } from '../components/visualization/RealtimeMonitoringViz';
import { RealtimeDashboard } from '../components/realtime/RealtimeDashboard';
import { VizExportBar } from '../components/visualization/VizExportBar';
import { ResponsiveVizPanel } from '../components/visualization/ResponsiveVizPanel';
import { useIsMobile } from '../hooks/useMediaQuery';

type VizTab = 'map' | 'profile' | 'piper' | 'dashboard' | 'age' | 'vadose' | 'coupling' | 'monitoring' | 'realtime';

const TABS: { key: VizTab; label: string; icon: typeof Map; description: string }[] = [
  { key: 'map', label: '交互式地图', icon: Map, description: '多图层等值线 / 城市详情 / 全屏模式' },
  { key: 'profile', label: '含水层剖面', icon: Layers3, description: '多层结构 / 水头曲线 / 钻孔详情' },
  { key: 'piper', label: 'Piper三线图', icon: FlaskConical, description: '多水样叠加 / 水化学分区 / 实时编辑' },
  { key: 'dashboard', label: '综合仪表盘', icon: LayoutDashboard, description: '关键指标 / 雷达图 / 风险排行' },
  { key: 'age', label: '地下水年龄', icon: Hourglass, description: '14C年龄剖面 / δD-δ18O散点 / 氚衰减 / 年龄分级' },
  { key: 'vadose', label: '包气带运移', icon: CloudRain, description: '包气带剖面 / 入渗系数对比 / 埋深关系 / 流域排行 / 补给构成' },
  { key: 'coupling', label: '多层耦合', icon: GitBranch, description: '含水层系统剖面 / 越流流图 / 分层开采对比 / 水位恢复' },
  { key: 'monitoring', label: '实时监测', icon: Activity, description: '监测站网 / 水位动态 / 沉降热力 / 水质演变 / 预警面板' },
  { key: 'realtime', label: '实时数据', icon: Radio, description: '4通道实时轮询 / 自动刷新 / 预警推送 / 数据流' },
];

export function Visualization() {
  const [activeTab, setActiveTab] = useState<VizTab>('map');
  const isMobile = useIsMobile();

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
  };

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
        <VizExportBar
          panelId={tabExportConfig[activeTab].id}
          panelTitle={tabExportConfig[activeTab].title}
          compact={isMobile}
        />
      </div>

      {/* 内容区 — 通过ResponsiveVizPanel实现移动端适配 */}
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
      </div>
    </div>
  );
}
