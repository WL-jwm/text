import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState } from 'react';
import {
  Layers, TrendingUp, MapPin, Zap, Globe, Calculator,
  ChevronDown, ChevronRight, FileText,
} from 'lucide-react';
import { TechCard } from '../components/UI';
import { useReportData } from '../hooks/useReportData';
import { SPATIAL_DATA } from './spatial/spatialData';
import { CorrelationTab } from './spatial/CorrelationTab';
import { ZoneAnalysisTab } from './spatial/ZoneAnalysisTab';
import { AnomalyTab } from './spatial/AnomalyTab';
import { MoranITab } from './spatial/MoranITab';
import { SpatialStatsCalculatorTab } from '../components/spatial-analysis/SpatialStatsCalculatorTab';

// ═══════════════════════════════════════════════════════════════
// 主页面组件
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { key: 'correlation', label: '空间自相关', icon: TrendingUp },
  { key: 'zone', label: '分区特征', icon: MapPin },
  { key: 'anomaly', label: '异常检测', icon: Zap },
  { key: 'moran', label: "Moran's I", icon: Globe },
  { key: 'calculator', label: '空间统计', icon: Calculator },
] as const;

export function SpatialAnalysis() {
  const [activeTab, setActiveTab] = useTabTransition<typeof TABS[number]['key']>('correlation');
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set(['correlation']));
  const [exportOpen, setExportOpen] = useState(false);

  const { getData, isLoading: _dataLoading } = useReportData({
    pageName: 'spatial-analysis',
    collector: async () => ({ spatialData: SPATIAL_DATA }),
    deps: [],
  });

  const toggleExpand = (key: string) => {
    setExpandedTabs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/20">
            <Layers size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gw-text">空间分析</h2>
            <p className="text-xs text-gw-muted">空间自相关 / 分区特征 / 异常检测 / Moran's I / 空间统计</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gw-muted">v5.0.0 | 5 Tab | Moran's I</span>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
          >
            <FileText size={14} />
            导出报告
          </button>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-1.5">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); toggleExpand(tab.key); }}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' +
              (activeTab === tab.key ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25' : 'bg-gw-surface/50 text-gw-muted border border-gw-border/20 hover:border-purple-500/15')}
          >
            <tab.icon size={13} />
            {tab.label}
            {expandedTabs.has(tab.key) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ))}
      </div>

      {/* Tab内容 */}
      {activeTab === 'correlation' && <CorrelationTab />}
      {activeTab === 'zone' && <ZoneAnalysisTab />}
      {activeTab === 'anomaly' && <AnomalyTab />}
      {activeTab === 'moran' && <MoranITab />}
      {activeTab === 'calculator' && <SpatialStatsCalculatorTab />}

      {/* 报告导出对话框 */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setExportOpen(false)}>
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gw-text">导出空间分析报告</h3>
            <p className="text-xs text-gw-muted">生成包含空间相关性分析、分区特征、异常检测和Moran's I空间自相关统计的综合报告（Word格式）。</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setExportOpen(false)} className="px-3 py-1.5 rounded text-xs text-gw-muted border border-gw-border/20 hover:border-purple-500/15">取消</button>
              <button onClick={async () => { setExportOpen(false); const { loadReportGenerator } = await import('../services/reportGeneratorLoader'); await loadReportGenerator('spatial-analysis'); const { generateTypedReport } = await import('../services/reportGenerator'); const data = getData(); if (data) generateTypedReport('spatial-analysis', data); }} className="px-3 py-1.5 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30">生成Word报告</button>
            </div>
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <TechCard title="空间分析说明">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">数据来源</p>
            <p className="text-[10px] text-gw-muted">基于平台已有数据集（水位埋深/水质/开采量/地温梯度/沉降速率/监测井数），以11个地级市为空间单元进行分析。</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">方法说明</p>
            <p className="text-[10px] text-gw-muted">空间自相关使用Pearson相关系数；分区按水文地质条件划分为山前平原/中部平原/滨海平原/山区；异常检测使用1.5σ准则。</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">局限性</p>
            <p className="text-[10px] text-gw-muted">以地级市为空间单元精度有限，县级尺度分析需CountyWaterCompare数据支持。IDW等值线插值详见MapView等值线图层。</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
