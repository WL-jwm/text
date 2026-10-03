/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 * 主组件（面板已拆分至 pollutionAlertPanels/ 子目录）
 */

import { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DataSourceNote } from '../UI';
import { getDemoAlertResults, calcAlertSummary } from '../../utils/pollutionAlertEngine';
import { SUB_TABS, type SubTabKey } from './pollutionAlertPanels/pollutionAlertConstants';
import { AlertOverviewPanel } from './pollutionAlertPanels/AlertOverviewPanel';
import { FactorAlertPanel } from './pollutionAlertPanels/FactorAlertPanel';
import { SampleAlertPanel } from './pollutionAlertPanels/SampleAlertPanel';
import { RegionRiskPanel } from './pollutionAlertPanels/RegionRiskPanel';
import { TrendForecastPanel } from './pollutionAlertPanels/TrendForecastPanel';

export function PollutionAlertTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('overview');

  // 默认概览数据
  const defaultResults = useMemo(() => getDemoAlertResults(), []);
  const defaultSummary = useMemo(() => calcAlertSummary(defaultResults), [defaultResults]);

  return (
    <div className="space-y-6">
      {/* 横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-sm text-amber-400 font-medium">地下水污染预警系统</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">基于GB/T 14848-2017标准，以III类标准限值为基准，对单因子/水样/区域进行多级预警分析</p>
      </div>

      {/* 子Tab */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 面板切换 */}
      {activeSubTab === 'overview' && <AlertOverviewPanel summary={defaultSummary} />}
      {activeSubTab === 'factor' && <FactorAlertPanel />}
      {activeSubTab === 'sample' && <SampleAlertPanel />}
      {activeSubTab === 'region' && <RegionRiskPanel />}
      {activeSubTab === 'trend' && <TrendForecastPanel />}

      <DataSourceNote source="GB/T 14848-2017 | 2024河北省水资源公报 | 区域超标率基于历史监测数据估算" />
    </div>
  );
}
