import { useTabTransition } from '../hooks/useTabTransition';
import React, { useMemo, useCallback } from 'react';
import {
  Scale, BarChart3, MapPin, AlertTriangle, Droplets,
  TrendingDown, TrendingUp, MinusCircle, Calculator,
} from 'lucide-react';
import {
  plainWaterBalance, cityWaterBalance,
  cityGroundwaterExtraction2000,
  hydrogeologicalParams, cityExploitationPotential,
  potentialZoneSummary, cityGroundwaterPollution,
  pollutantDetectionRates, wastewaterDischarge1999,
} from '../data/groundwaterResources';
import { SectionTitle, StatCard, DataSourceNote } from '../components/UI';
import { usePageCommons } from '../hooks/usePageCommons';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
import { BalanceOverviewTab } from './groundwater/BalanceOverviewTab';
import { BalanceCityTab } from './groundwater/BalanceCityTab';
import { BalancePotentialTab } from './groundwater/BalancePotentialTab';
import { BalanceQualityTab } from './groundwater/BalanceQualityTab';
import { BalancePollutionTab } from './groundwater/BalancePollutionTab';
import { BalanceCalculatorTab } from '../components/groundwater/BalanceCalculatorTab';

type TabKey = 'overview' | 'city' | 'potential' | 'quality' | 'pollution' | 'calculator';
const TABS: { key: TabKey; label: string; icon: typeof Scale }[] = [
  { key: 'overview', label: '均衡总览', icon: Scale },
  { key: 'city', label: '各市均衡', icon: MapPin },
  { key: 'potential', label: '开采潜力', icon: BarChart3 },
  { key: 'quality', label: '水质评价', icon: Droplets },
  { key: 'pollution', label: '污染评价', icon: AlertTriangle },
  { key: 'calculator', label: '均衡计算', icon: Calculator },
];

export function GroundwaterBalance() {
  const { setExportOpen, exportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'groundwater-balance',
    collector: useCallback(async () => ({
      plainWaterBalance, cityWaterBalance, cityGroundwaterExtraction2000,
      shallowWaterQualityByClass: undefined, hydrogeologicalParams,
      cityExploitationPotential, potentialZoneSummary,
      cityGroundwaterPollution, pollutantDetectionRates, wastewaterDischarge1999,
    }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('overview');

  const rechargePie = useMemo(() =>
    plainWaterBalance.rechargeBreakdown.map(r => ({ name: r.item, value: r.value })), []);
  const dischargePie = useMemo(() =>
    plainWaterBalance.dischargeBreakdown.map(d => ({ name: d.item, value: d.value })), []);
  const cityBalanceChart = useMemo(() =>
    cityWaterBalance.map(c => ({
      name: c.city, recharge: c.total.recharge, discharge: c.total.discharge, balance: c.total.balance,
    })), []);
  const potentialChart = useMemo(() =>
    cityExploitationPotential.map(c => ({
      name: c.city, resource: c.resource, extraction: c.extraction2000, surplus: c.surplus,
    })), []);
  const pollutionChart = useMemo(() =>
    cityGroundwaterPollution.map(c => ({
      name: c.city, unpol: c.unpol, light: c.light, moderate: c.moderate, heavy: c.heavy, severe: c.severe,
    })), []);

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={Scale}>地下水均衡与资源评价</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">
            数据来源：《中国地下水资源 河北卷》(2005) | 平原区水均衡 · 各市均衡 · 开采潜力 · 水质污染评价
          </p>
        </div>
        <button onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出报告
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
        <StatCard title="总补给量" value={String(plainWaterBalance.totalRecharge)} unit="亿m³/a" icon={TrendingUp} accent="blue" />
        <StatCard title="总排泄量" value={String(plainWaterBalance.totalDischarge)} unit="亿m³/a" icon={TrendingDown} accent="red" />
        <StatCard title="年均超采" value={String(Math.abs(plainWaterBalance.balance))} unit="亿m³/a" icon={MinusCircle} accent="orange" />
        <StatCard title="总开采量" value={String(potentialZoneSummary.totalExtraction2000)} unit="亿m³/a(2000)" icon={Droplets} accent="amber" />
        <StatCard title="超采区占比" value={String(potentialZoneSummary.zones[2].percent)} unit="%" icon={AlertTriangle} accent="red" />
        <StatCard title="农业开采占比" value="76.8" unit="%" icon={BarChart3} accent="green" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <BalanceOverviewTab rechargePie={rechargePie} dischargePie={dischargePie} />}
      {activeTab === 'city' && <BalanceCityTab cityBalanceChart={cityBalanceChart} />}
      {activeTab === 'potential' && <BalancePotentialTab potentialChart={potentialChart} />}
      {activeTab === 'quality' && <BalanceQualityTab />}
      {activeTab === 'pollution' && <BalancePollutionTab pollutionChart={pollutionChart} />}
      {activeTab === 'calculator' && <BalanceCalculatorTab />}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="groundwater-balance"
        reportLabel="河北省地下水均衡与资源评价报告"
        data={getData()}
        dataLoading={dataLoading}
      />
      <CrossLinkPanel currentPath="/groundwater-balance" />
      <DataSourceNote source="《中国地下水资源 河北卷》(2005) 第三、四、六章 | 河北瑞三元环境科技有限公司整理" />
    </div>
  );
}
