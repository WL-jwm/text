/**
 * F-01 实时数据接入框架 — 实时监测仪表盘
 *
 * 汇总展示所有通道的实时读数：
 *   1. 顶部状态栏：连接状态 + 自动刷新控制
 *   2. 通道卡片网格：4通道 × 各站点实时读数
 *   3. 实时数据流：滚动展示最新读数
 *   4. 预警面板：基于阈值的实时告警
 *
 * 常量与内联子组件已拆分至 realtimeDashboardParts.tsx。
 */

import { TechCard } from '../UI';
import { MobileSVGContainer } from '../mobile/MobileSVGContainer';
import {
  type DataChannel,
} from '../../services/realtimeDataService';
import { useRealtimeAll, useConnectionStatus } from '../../hooks/useRealtimeData';
import { RealtimeStatusBadge, AutoRefreshControl, ChannelStatusGrid } from './RealtimeStatus';
import { DataSourcePanel } from './DataSourcePanel';
import { OfflineAnalysisPanel } from './OfflineAnalysisPanel';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { useAutoCache } from '../../hooks/useRealtimeCache';
import { QualityPanel } from './QualityPanel';
import { PerformancePanel } from './PerformancePanel';
import { ChannelCard, DataStream, AlertPanel, MobileRealtimeKpis } from './realtimeDashboardParts';

// ── 主组件 ──

export function RealtimeDashboard() {
  const { allReadings, refreshAll } = useRealtimeAll();
  const status = useConnectionStatus();
  const { cachedCount } = useAutoCache(allReadings, status === 'connected');

  const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

  return (
    <div className="space-y-4">
      {/* 顶部控制栏 */}
      <TechCard>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <RealtimeStatusBadge />
            <span className="text-[11px] text-gw-muted">
              共 {allReadings.length} 条实时读数
            </span>
            {cachedCount > 0 && (
              <span className="text-[11px] text-emerald-400">
                已缓存 {cachedCount} 条
              </span>
            )}
          </div>
          <AutoRefreshControl intervalMs={30000} />
        </div>
      </TechCard>

      {/* 移动端KPI概览 */}
      <MobileRealtimeKpis readings={allReadings} />

      {/* 通道卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map(ch => {
          const chReadings = allReadings.filter(r => r.channel === ch);
          return (
            <ChannelCard key={ch} channel={ch} readings={chReadings} />
          );
        })}
      </div>

      {/* 底部：数据流 + 预警 + 通道状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <MobileSVGContainer svgWidth={600} svgHeight={400}>
            <DataStream readings={allReadings} />
          </MobileSVGContainer>
        </div>
        <div className="space-y-3">
          <AlertPanel readings={allReadings} />
          <ChannelStatusGrid />
        </div>
      </div>

      {/* 手动刷新按钮 */}
      <div className="flex justify-center">
        <button
          onClick={refreshAll}
          disabled={status === 'connecting'}
          className="px-4 py-2 rounded-lg text-xs bg-gw-blue/15 text-gw-cyan border border-gw-blue/30 hover:bg-gw-blue/25 transition-all disabled:opacity-50"
        >
          手动刷新全部通道
        </button>
      </div>

      {/* G-01a: 数据源管理面板 */}
      <DataSourcePanel />

      {/* G-02: 离线分析面板 */}
      <OfflineAnalysisPanel />

      {/* G-01b: 诊断增强面板 */}
      <DiagnosticsPanel />

      {/* G-08: 数据质量评估面板 */}
      <QualityPanel readings={allReadings} />

      {/* G-07: 性能监控面板 */}
      <PerformancePanel />
    </div>
  );
}
