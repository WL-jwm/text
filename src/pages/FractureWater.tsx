import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Mountain, Search, Droplets, Layers, MapPin, FlaskConical, Wrench, Gauge, Crosshair, BookOpen } from 'lucide-react';
import { fractureWaterTypes, fractureWaterZones, fractureWaterCases, fractureExplorationMethods, fractureWaterResources, fractureWaterChemistry, fractureWaterUtilization, fractureWaterYieldByLithology } from '../data/fractureWater';
import { rockEngineeringGroups, weatheringThickness, rockCompressiveStrength, runoffModulus } from '../data/hydrogeologyReference';
import { exportDataCSV } from '../utils/exportUtils';
import { SectionTitle, TechCard, StatCard, TechTable, ChartTooltip, DataSourceNote, CHART_COLORS } from '../components/UI';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { ChartExport } from '../components/ChartExport';
import { CrossLinkPanel } from '../components/CrossLink';
import { useToast } from '../components/Toast';
import { LazyChartCard } from '../components/LazyChartCard';

import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册报告生成器
const TABS = [
  { key: 'types', label: '类型分类', icon: Layers },
  { key: 'zones', label: '富水性分区', icon: MapPin },
  { key: 'chemistry', label: '水化学特征', icon: FlaskConical },
  { key: 'cases', label: '开发案例', icon: Droplets },
  { key: 'lithology', label: '岩性富水性', icon: Gauge },
  { key: 'classic', label: '经典参考', icon: BookOpen },
] as const;

export function FractureWater() {
  const [exportOpen, setExportOpen] = useState(false);
  const {success} = useToast();
  const [activeTab, setActiveTab] = useState<string>('types');
  const [searchQuery, setSearchQuery] = useState('');

  // ── 类型分布饼图 ──
  const typePieData = useMemo(() =>
    fractureWaterTypes.map(t => ({ name: t.type, value: parseInt(String(t.proportion).replace(/[^0-9]/g, '')) || 0 })),
    []
  );

  // ── 分区出水量对比 ──
  const zoneYieldData = useMemo(() =>
    fractureWaterZones.map(z => ({
      name: z.zone,
      出水量: parseInt(String(z.avgYield).split('~').pop() || '0'),
    })),
    []
  );

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
  const methodRadarData = useMemo(() =>
    fractureExplorationMethods.map(m => ({
      method: m.method,
      成本: { '极低': 5, '低': 3, '中': 2, '高': 1 }[m.cost] || 3,
      精度: { '中等': 2, '中高': 3, '高': 4, '极高': 5 }[m.accuracy] || 3,
    })),
    []
  );

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
      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="裂隙水类型分布" icon={Layers} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={typePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name.length > 8 ? name.substring(0, 8) + '..' : name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false} stroke="none">
                    {typePieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <LazyChartCard title="类型特征对比" icon={Crosshair} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={fractureWaterTypes.map(t => ({
                  type: t.type.length > 8 ? t.type.substring(0, 8) : t.type,
                  比例: parseInt(String(t.proportion).replace(/[^0-9]/g, '')) || 0,
                  出水量上限: parseInt(String(t.yield).split('~').pop() || '0'),
                }))}>
                  <PolarGrid stroke="var(--gw-border, #1a2d4d)" />
                  <PolarAngleAxis dataKey="type" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                  <Radar name="比例(%)" dataKey="比例" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Radar name="出水量上限(m³/d)" dataKey="出水量上限" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
                  <ChartTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="类型详细特征" icon={Layers}>
              <div className="mb-3 flex justify-end">
                <ChartExport data={fractureWaterTypes} filename="fracture-water-types" sheetName="裂隙水类型" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable
              filterPlaceholder="搜索裂隙水类型..."
              headers={['类型', '分布', '深度(m)', '出水量(m³/d)', '水质', '占比', '富水性']}
              rows={fractureWaterTypes.map(t => [t.type, t.distribution, `${t.depth}${t.depthUnit}`, `${t.yield}${t.yieldUnit}`, t.waterQuality, t.proportion, t.richness])}
              pageSize={10}
            />
          </TechCard>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { exportDataCSV(fractureWaterTypes as Record<string, unknown>[], 'fracture-water-types'); success('数据已导出'); }}
              className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
              导出数据
            </button>
          </div>
        </div>
      )}

      {/* ====== 富水性分区 ====== */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="分区出水量对比" icon={Gauge} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={zoneYieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <ChartTooltip unit="m³/d" />
                  <Bar dataKey="出水量" fill="var(--gw-cyan, #06b6d4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <LazyChartCard title="分区面积对比" icon={MapPin} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={fractureWaterZones.map(z => ({
                  name: z.zone,
                  面积: parseInt(String(z.area).replace(/[^0-9]/g, '')) || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <ChartTooltip unit="km²" />
                  <Bar dataKey="面积" fill="var(--gw-blue, #3b82f6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="富水性分区详情" icon={MapPin}>
              <div className="mb-3 flex justify-end">
                <ChartExport data={fractureWaterZones} filename="fracture-water-zones" sheetName="富水性分区" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable
              filterPlaceholder="搜索分区..."
              headers={['分区', '岩性', '裂隙类型', '富水性', '平均出水量(m³/d)', '面积', '代表区域', '主要用途']}
              rows={fractureWaterZones.map(z => [z.zone, z.rockType, z.fractureType, z.richness, `${z.avgYield}${z.yieldUnit}`, z.area, z.representative, z.mainUse])}
              pageSize={10}
            />
          </TechCard>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { exportDataCSV(fractureWaterZones as Record<string, unknown>[], 'fracture-water-zones'); success('数据已导出'); }}
              className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
              导出数据
            </button>
          </div>
        </div>
      )}

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
      {activeTab === 'lithology' && (
        <div className="space-y-4">
          {fractureWaterYieldByLithology && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LazyChartCard title="岩性与出水量关系" icon={Gauge} height={280}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={fractureWaterYieldByLithology.map(l => ({
                    name: l.lithology ? l.lithology.substring(0, 8) : '-',
                    出水量: l.fractureYield || 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                    <ChartTooltip unit="m³/d" />
                    <Bar dataKey="出水量" fill="var(--gw-amber, #f59e0b)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </LazyChartCard>
            </div>
          )}

          <LazyChartCard title="勘查方法对比" icon={Search} height={280}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={methodRadarData}>
                <PolarGrid stroke="var(--gw-border, #1a2d4d)" />
                <PolarAngleAxis dataKey="method" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} domain={[0, 6]} />
                <Radar name="成本" dataKey="成本" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Radar name="精度" dataKey="精度" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
                <ChartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <TechCard title="勘查方法详情" icon={Search}>
            <TechTable
              headers={['方法', '说明', '成本', '精度', '适用比例尺']}
              rows={fractureExplorationMethods.map(m => [m.method, m.description, m.cost, m.accuracy, m.suitableScale])}
              pageSize={10}
            />
          </TechCard>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { exportDataCSV(fractureExplorationMethods as Record<string, unknown>[], 'fracture-exploration-methods'); success('数据已导出'); }}
              className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
              导出数据
            </button>
          </div>

          <DataSourceNote source="1999年《河北省地下水资源评价》" version="裂隙水勘查" />
        </div>
      )}

            {/* ═══════════════════ 裂隙水开发利用 ═══════════════════ */}
      <TechCard title="裂隙水开发利用现状" badge="开发利用">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gw-muted mb-2">按用途分布(估算)</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={fractureWaterUtilization.byPurpose.map(p => ({ name: p.purpose, value: p.percent }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {fractureWaterUtilization.byPurpose.map((_, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip unit="%" percentDigits={1} title="用途分布" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/15">
                <p className="text-[10px] text-gw-muted">机井总数</p>
                <p className="text-sm font-mono font-bold text-blue-400">{fractureWaterUtilization.wellStatistics.totalWells}</p>
              </div>
              <div className="text-center p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
                <p className="text-[10px] text-gw-muted">平均井深</p>
                <p className="text-sm font-mono font-bold text-cyan-400">{fractureWaterUtilization.wellStatistics.avgWellDepth}</p>
              </div>
              <div className="text-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/15">
                <p className="text-[10px] text-gw-muted">平均出水量</p>
                <p className="text-sm font-mono font-bold text-amber-400">{fractureWaterUtilization.wellStatistics.avgYield}</p>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded-lg border border-red-500/15">
                <p className="text-[10px] text-gw-muted">废井率</p>
                <p className="text-sm font-mono font-bold text-red-400">{fractureWaterUtilization.wellStatistics.failureRate}</p>
              </div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <p className="text-[10px] text-gw-muted mb-1">重点工程</p>
              {fractureWaterUtilization.keyProjects.map((p: { name: string; period: string; wells: number; servicePop: number; unit: string }) => (
                <p key={p.name} className="text-[10px] text-gw-text leading-relaxed">
                  <span className="text-gw-cyan">{p.name}</span>({p.period}): {p.wells}眼井，服务{p.servicePop}{p.unit}
                </p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>

{activeTab === 'classic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="岩石工程分组" value={String(rockEngineeringGroups.length)} unit="类" icon={Layers} accent="blue" />
            <StatCard title="风化带数据" value={String(weatheringThickness.length)} unit="条" icon={Mountain} accent="cyan" />
            <StatCard title="抗压强度" value={String(rockCompressiveStrength.length)} unit="组" icon={Gauge} accent="green" />
            <StatCard title="径流模数" value={String(runoffModulus.length)} unit="类" icon={Droplets} accent="amber" />
          </div>

          <TechCard title="岩石工程地质分组" icon={Layers}>
            <p className="text-[10px] text-gw-muted mb-3">
              河北省岩石按力学强度和工程地质特征分类，数据来源：《河北省水文地质工程地质》
            </p>
            <div className="space-y-2">
              {rockEngineeringGroups.map((g, i) => (
                <div key={i} className={`p-3 rounded-lg border ${g.category.includes('坚硬') ? 'bg-emerald-500/5 border-emerald-500/15' : g.category.includes('半坚硬') ? 'bg-amber-500/5 border-amber-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gw-text">{g.category}</span>
                    {g.strength && <span className="text-[10px] font-mono text-gw-highlight">{g.strength}</span>}
                  </div>
                  {g.desc && <p className="text-[10px] text-gw-muted mb-1">{g.desc}</p>}
                  {g.rocks && <p className="text-[10px] text-gw-text">代表性岩石：{g.rocks}</p>}
                </div>
              ))}
            </div>
          </TechCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="风化带厚度" icon={Mountain}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gw-border">
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">全风化(m)</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">半风化(m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weatheringThickness.map((w, i) => (
                      <tr key={i} className="border-b border-gw-border/50">
                        <td className="px-2 py-1 text-gw-text text-[10px]">{w.lithology}</td>
                        <td className="px-2 py-1 font-mono text-gw-highlight">{w.full}</td>
                        <td className="px-2 py-1 font-mono text-gw-text">{w.half}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>

            <TechCard title="径流模数（按岩性分类）" icon={Droplets}>
              <p className="text-[10px] text-gw-muted mb-3">不同岩性组合的地下水径流模数统计</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gw-border">
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性组合</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">范围(L/s·km²)</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">均值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runoffModulus.map((r, i) => (
                      <tr key={i} className="border-b border-gw-border/50">
                        <td className="px-2 py-1 text-gw-text text-[10px]">{r.rockType}</td>
                        <td className="px-2 py-1 font-mono text-gw-highlight">{r.range}</td>
                        <td className="px-2 py-1 font-mono text-gw-text">{r.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>

          <DataSourceNote source="《河北省水文地质工程地质》| 岩石力学+风化带+径流模数" version="经典参考" />
        </div>
      )}

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
