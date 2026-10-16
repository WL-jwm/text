/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 * 主组件（面板已拆分至 exportCenterPanels/ 子目录）
 */
import { useExportCenterStore } from '../../store/exportCenterStore';
import { DataSourceNote, StatCard, TechCard } from '../UI';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PANELS, type PanelKey } from './exportCenterPanels/exportCenterConstants';
import { ExportConfigPanel } from './exportCenterPanels/ExportConfigPanel';
import { HistoryPanel } from './exportCenterPanels/HistoryPanel';
import { PipelineExportPanel } from './exportCenterPanels/PipelineExportPanel';
import { SourceListPanel } from './exportCenterPanels/SourceListPanel';

export function ExportCenterTab() {
  const [panel, setPanel] = useState<PanelKey>('sources');
  const store = useExportCenterStore();
  const { init } = store;

  useEffect(() => { init(); }, [init]);

  const readyCount = store.sources.filter(s => s.isReady).length;
  const selectedCount = store.selectedIds.size;

  return (
    <div className="space-y-4">
      {/* 标题卡 */}
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gw-text flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            统一导出中心
          </h2>
          <span className="text-xs text-gw-muted">D-02</span>
        </div>
        <p className="text-xs text-gw-muted">
          27 个模块数据源统一管理，支持 Excel 多 Sheet / Word 多章节 / JSON 全量三种批量导出格式。
          数据来源于各模块预采集缓存，导出前请先在对应模块执行计算。
        </p>
      </TechCard>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="数据源总数" value={store.sources.length} unit="个" accent="cyan" />
        <StatCard title="已就绪" value={readyCount} unit="个" accent="green" />
        <StatCard title="已选中" value={selectedCount} unit="个" accent="amber" />
        <StatCard title="导出记录" value={store.history.length} unit="条" accent="purple" />
      </div>

      {/* 面板切换 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {PANELS.map(p => {
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => setPanel(p.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all border ${
                panel === p.key
                  ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
                  : 'text-gw-muted border-gw-border/20 hover:border-gw-border hover:text-gw-text'
              }`}
            >
              <Icon size={14} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* 面板内容 */}
      <div>
        {panel === 'sources' && <SourceListPanel />}
        {panel === 'export' && <ExportConfigPanel />}
        {panel === 'history' && <HistoryPanel />}
        {panel === 'pipeline' && <PipelineExportPanel />}
      </div>

      <DataSourceNote source="基于各模块预采集缓存数据，复用reportGenerator报告生成引擎" version="D-02" />
    </div>
  );
}
