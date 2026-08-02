/**
 * Visualization — 可视化中心
 *
 * 汇集 V-01~V-04 可视化升级组件：
 *   - V-01 交互式地图（EnhancedMap）
 *   - V-02 含水层剖面（AquiferProfile3D）
 *   - V-03 交互式Piper三线图（InteractivePiperDiagram）
 *   - V-04 综合Dashboard（ComprehensiveDashboard）
 */

import { useState } from 'react';
import { Map, Layers3, FlaskConical, LayoutDashboard, Hourglass, CloudRain } from 'lucide-react';
import { EnhancedMap } from '../components/visualization/EnhancedMap';
import { AquiferProfile3D } from '../components/visualization/AquiferProfile3D';
import { InteractivePiperDiagram } from '../components/visualization/InteractivePiperDiagram';
import { ComprehensiveDashboard } from '../components/visualization/ComprehensiveDashboard';
import { GroundwaterAgeViz } from '../components/visualization/GroundwaterAgeViz';
import { VadoseZoneViz } from '../components/visualization/VadoseZoneViz';

type VizTab = 'map' | 'profile' | 'piper' | 'dashboard' | 'age' | 'vadose';

const TABS: { key: VizTab; label: string; icon: typeof Map; description: string }[] = [
  { key: 'map', label: '交互式地图', icon: Map, description: '多图层等值线 / 城市详情 / 全屏模式' },
  { key: 'profile', label: '含水层剖面', icon: Layers3, description: '多层结构 / 水头曲线 / 钻孔详情' },
  { key: 'piper', label: 'Piper三线图', icon: FlaskConical, description: '多水样叠加 / 水化学分区 / 实时编辑' },
  { key: 'dashboard', label: '综合仪表盘', icon: LayoutDashboard, description: '关键指标 / 雷达图 / 风险排行' },
  { key: 'age', label: '地下水年龄', icon: Hourglass, description: '14C年龄剖面 / δD-δ18O散点 / 氚衰减 / 年龄分级' },
  { key: 'vadose', label: '包气带运移', icon: CloudRain, description: '包气带剖面 / 入渗系数对比 / 埋深关系 / 流域排行 / 补给构成' },
];

export function Visualization() {
  const [activeTab, setActiveTab] = useState<VizTab>('map');

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

      {/* 当前Tab描述 */}
      <div className="text-[11px] text-gw-muted">
        {TABS.find(t => t.key === activeTab)?.description}
      </div>

      {/* 内容区 */}
      <div>
        {activeTab === 'map' && <EnhancedMap />}
        {activeTab === 'profile' && <AquiferProfile3D />}
        {activeTab === 'piper' && <InteractivePiperDiagram />}
        {activeTab === 'dashboard' && <ComprehensiveDashboard />}
        {activeTab === 'age' && <GroundwaterAgeViz />}
        {activeTab === 'vadose' && <VadoseZoneViz />}
      </div>
    </div>
  );
}
