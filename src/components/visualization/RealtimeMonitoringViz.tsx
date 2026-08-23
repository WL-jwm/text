/**
 * 实时监测数据可视化（容器）
 * 5 个子组件：
 *  - MonitoringNetworkOverview   监测站网总览
 *  - WaterLevelTimeline          水位动态时序（自动播放）
 *  - SubsidenceHeatmap           地面沉降热力图
 *  - QualityEvolutionChart       水质演变
 *  - MonitoringAlertPanel        监测预警面板
 */

import { Activity } from 'lucide-react';
import { MonitoringNetworkOverview } from './MonitoringNetworkOverview';
import { WaterLevelTimeline } from './WaterLevelTimeline';
import { SubsidenceHeatmap } from './SubsidenceHeatmap';
import { QualityEvolutionChart } from './QualityEvolutionChart';
import { MonitoringAlertPanel } from './MonitoringAlertPanel';

export function RealtimeMonitoringViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <Activity size={14} className="text-cyan-400" />
        <span>实时监测数据可视化 — 监测站网/水位动态/沉降热力/水质演变/预警面板</span>
      </div>

      {/* 监测站网总览 */}
      <MonitoringNetworkOverview />

      {/* 水位时序 + 预警面板 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WaterLevelTimeline />
        <MonitoringAlertPanel />
      </div>

      {/* 沉降热力图 + 水质演变 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SubsidenceHeatmap />
        <QualityEvolutionChart />
      </div>
    </div>
  );
}
