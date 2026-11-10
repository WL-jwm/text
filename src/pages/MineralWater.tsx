import { useTabTransition } from '../hooks/useTabTransition';
import { useCallback } from 'react';
import { MapPin, TrendingUp, CheckCircle, Gauge, Droplets } from 'lucide-react';
import { mineralWaterSites } from '../data/mineralWater';
import { SectionTitle, StatCard } from '../components/UI';
import { exportDataCSV } from '../utils/exportUtils';

import { usePageCommons } from '../hooks/usePageCommons'
import { MineralWaterCalculatorTab } from '../components/mineral-water/MineralWaterCalculatorTab';
import { SitesTabPanel } from './mineralWaterParts/SitesTabPanel';
import { TypesTabPanel } from './mineralWaterParts/TypesTabPanel';
import { StandardsTabPanel } from './mineralWaterParts/StandardsTabPanel';
import { DevelopmentTabPanel } from './mineralWaterParts/DevelopmentTabPanel';
import { HotSpringSection } from './mineralWaterParts/HotSpringSection';
// 注册报告生成器
// ── Tab 定义 ──
const tabs = ['产地分布', '水质类型', '标准对比', '开发现状', '水质评价'];
const [SITES, TYPES, STANDARDS, DEVELOPMENT, CALCULATOR] = tabs;

export function MineralWater() {

  const { success, setExportOpen } = usePageCommons({
    pageName: 'mineral-water',
    collector: useCallback(async () => ({ mineralWaterSites }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition(tabs[0]);

  // ── 导出 ──
  const handleExport = () => {
    exportDataCSV(mineralWaterSites.map(s => ({
      名称: s.name, 位置: s.location, 类型: s.type, 水温: s.temperature,
      日产量: s.dailyYield, 批准文号: s.approvalNo, 状态: s.status,
      矿化度: s.mineralization, SiO2: s.siO2, 锶: s.strontium, pH: s.ph
    })), '河北省矿泉水产地');
    success('矿泉水数据已导出');
  };

  // ── 统计 ──
  const producing = mineralWaterSites.filter(s => s.status === '生产中').length;
  const exploring = mineralWaterSites.filter(s => s.status === '勘查中').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Droplets}>矿泉水</SectionTitle>
        <button onClick={() => setExportOpen(true)}
          className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
          导出报告
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="矿泉水产地" value={mineralWaterSites.length} unit="处" icon={MapPin} accent="blue" />
        <StatCard title="生产中" value={producing} unit="处" icon={CheckCircle} accent="green" />
        <StatCard title="勘查中" value={exploring} unit="处" icon={Gauge} accent="amber" />
        <StatCard title="年产量" value="~85万" unit="m³" icon={TrendingUp} accent="cyan" />
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-gw-surface/50 rounded-lg overflow-x-auto scrollbar-none">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeTab === t ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/80'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ====== 产地分布 ====== */}
      {activeTab === SITES && <SitesTabPanel onExport={handleExport} />}

      {/* ====== 水质类型 ====== */}
      {activeTab === TYPES && <TypesTabPanel />}

      {/* ====== 标准对比 ====== */}
      {activeTab === STANDARDS && <StandardsTabPanel />}

      {/* ====== 开发现状 ====== */}
      {activeTab === DEVELOPMENT && <DevelopmentTabPanel />}

      {activeTab === CALCULATOR && <MineralWaterCalculatorTab />}

      <HotSpringSection />
    </div>
  );
}
