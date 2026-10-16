import { CrossLinkPanel } from '../components/CrossLink';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { LazyChartCard } from '../components/LazyChartCard';
import { useToast } from '../components/Toast';
import { SectionTitle, TechCard, DataSourceNote, ChartTooltip, StatCard } from '../components/UI';
import { FractureWaterCalculatorTab } from '../components/fracture-water/FractureWaterCalculatorTab';
import { fractureWaterResources, fractureWaterTypes, fractureWaterChemistry, fractureWaterCases } from '../data/fractureWater';
import { useReportData } from '../hooks/useReportData';
import { useTabTransition } from '../hooks/useTabTransition';
import { exportDataCSV } from '../utils/exportUtils';
import { MapPin, Mountain, Gauge, Search, Crosshair, Wrench, FlaskConical, Droplets } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';
import { YAxis, Bar, CartesianGrid, ResponsiveContainer, BarChart, XAxis } from 'recharts';
import { TABS } from './fractureWaterPanels/fractureWaterConstants';
import { TypesPanel } from './fractureWaterPanels/TypesPanel';
import { ZonesPanel } from './fractureWaterPanels/ZonesPanel';
import { LithologyPanel } from './fractureWaterPanels/LithologyPanel';
import { UtilizationPanel } from './fractureWaterPanels/UtilizationPanel';
import { ClassicPanel } from './fractureWaterPanels/ClassicPanel';

// 注册报告生成器

export function FractureWater() {
  const [exportOpen, setExportOpen] = useState(false);
  const {success} = useToast();
  const [activeTab, setActiveTab] = useTabTransition<typeof TABS[number]['key']>('types');
  const [searchQuery, setSearchQuery] = useState('');

  // ── 类型分布饼图 ──

  // ── 分区出水量对比 ──

  // ── 案例出水量柱状图 ──
  const caseYieldData = useMemo(() =>
    fractureWaterCases.filter(c => searchQuery === '' || c.location.includes(searchQuery)).map(c => ({
      name: c.location.length > 6 ? c.location.substring(0, 6) : c.location,
      出水量: parseInt(String(c.yield).split('~').pop() || '0'),
      井深m: parseInt(String(c.wellDepth).replace('~', '').replace('m', '')) || 0,
    })),
    [searchQuery]
  );

  // ── 勘探方法雷达 ──

  // 报告数据预采集（增量缓存）
  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'fracture-water',
    collector: useCallback(async () => ({ fractureTypes: fractureWaterTypes }), []),
    autoCollect: true,
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Mountain}>裂隙水</SectionTitle>
        <button onClick={() => setExportOpen(true)}
          className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
          导出报告
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="分布面积" value={fractureWaterResources.totalArea} icon={MapPin} accent="blue" />
        <StatCard title="天然资源量" value={fractureWaterResources.totalNaturalYield} icon={Droplets} accent="cyan" />
        <StatCard title="可开采量" value={fractureWaterResources.totalExploitable} icon={Gauge} accent="green" />
        <StatCard title="开采率" value={fractureWaterResources.exploitationRate} icon={Wrench} accent="amber" />
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-gw-surface/50 rounded-lg overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${activeTab === t.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/80'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ====== 类型分类 ====== */}
      {activeTab === 'types' && <TypesPanel />}

      {/* ====== 富水性分区 ====== */}
      {activeTab === 'zones' && <ZonesPanel />}

      {/* ====== 水化学特征 ====== */}
      {activeTab === 'chemistry' && (
        <div className="space-y-4">
          <TechCard title="水化学特征" icon={FlaskConical}>
            <FilterableTechTable
              filterPlaceholder="搜索水化学数据..."
              headers={['岩性', '水类型', '矿化度(g/L)', 'pH', '特征']}
              rows={fractureWaterChemistry.map(c => [
                c.rockType, c.waterType, c.tds, c.ph, c.features
              ])}
              pageSize={10}
            />
          </TechCard>

          <DataSourceNote source="1999年《河北省地下水资源评价》" version="裂隙水专题" />
        </div>
      )}

      {/* ====== 开发案例 ====== */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索案例位置..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-gw-surface/60 border border-gw-border/40 text-xs text-gw-text placeholder:text-gw-muted/60 focus:outline-none focus:border-gw-cyan/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="案例出水量" icon={Droplets} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={caseYieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <ChartTooltip unit="m³/d" />
                  <Bar dataKey="出水量" fill="var(--gw-green, #10b981)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <TechCard title="案例详情" icon={Crosshair}>
              <FilterableTechTable
                filterPlaceholder="搜索案例..."
                headers={['位置', '岩性', '裂隙类型', '井深(m)', '出水量(m³/d)', '方法', '服务人数', '状态']}
                rows={fractureWaterCases.map(c => [c.location, c.rockType, c.fractureType, c.wellDepth, `${c.yield}${c.yieldUnit}`, c.method, c.servicePop, c.status])}
                pageSize={10}
              />
            </TechCard>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { exportDataCSV(fractureWaterCases as Record<string, unknown>[], 'fracture-water-cases'); success('数据已导出'); }}
              className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
              导出数据
            </button>
          </div>
        </div>
      )}

      {/* ====== 岩性富水性 ====== */}
      {activeTab === 'lithology' && <LithologyPanel />}
      <UtilizationPanel />
      {activeTab === 'classic' && <ClassicPanel />}

      {activeTab === 'calculator' && <FractureWaterCalculatorTab />}

<CrossLinkPanel currentPath={window.location.pathname} />
      {/* 导出报告对话框 */}
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="fracture-water"
        reportLabel="基岩裂隙水资源概况"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}
