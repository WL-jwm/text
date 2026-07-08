import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Layers, MapPin, Droplets, Database, GitBranch, Info, BookOpen } from 'lucide-react';
import { systemZones, subZones, zoneRechargeDischarge, zoneAquiferParams, zoneBoundaryStats } from '../data/systemZoning';
import { hydrogeoZones, getHydrogeoSummary, stratigraphyLayers, rockEngineeringGroups } from '../data/hydrogeologyReference';
import { exportDataCSV } from '../utils/exportUtils';
import { TechCard, StatCard, ChartTooltip, DataSourceNote, CHART_COLORS } from '../components/UI';
import { LazyChartCard } from '../components/LazyChartCard';
import { CrossLinkPanel } from '../components/CrossLink';
import { ChartExport } from '../components/ChartExport';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'zones', label: '一级分区', icon: Layers },
  { key: 'subzones', label: '子区明细', icon: GitBranch },
  { key: 'recharge', label: '补给排泄', icon: Droplets },
  { key: 'params', label: '含水层参数', icon: Database },
  { key: 'boundary', label: '边界类型', icon: MapPin },
  { key: 'classic', label: '经典分区', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

export function SystemZoning() {

  const { success } = usePageCommons({
    pageName: 'system-zoning',
    collector: useCallback(async () => ({ systemZones, subZones }), []),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('zones');

  const activeZones = useMemo(() => systemZones.filter(z => z.area > 0), []);
  const totalArea = systemZones.reduce((s, z) => s + z.area, 0);
  const totalSubZones = subZones.filter(z => z.type === '子区').length;
  const totalSubCells = subZones.filter(z => z.type === '小区').length;

  const zoneBar = useMemo(() => activeZones.map(z => ({
    name: z.name.length > 8 ? z.name.substring(0, 8) : z.name,
    area: z.area,
    proportion: z.proportion,
  })).sort((a, b) => b.area - a.area), []);

  const subZoneByParent = useMemo(() => {
    const map: Record<string, number> = {};
    subZones.forEach(z => {
      const key = z.parentCode;
      map[key] = (map[key] || 0) + 1;
    });
    return systemZones.filter(z => (map[z.code] || 0) > 0).map(z => ({
      name: z.code,
      fullName: z.name,
      count: map[z.code],
    }));
  }, []);

  const boundaryPie = useMemo(() => zoneBoundaryStats.map((b, i) => ({ name: b.boundaryType, value: b.count, color: CHART_COLORS[i % CHART_COLORS.length] })), []);

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">地下水系统区划</h1>
          <p className="text-xs text-gw-muted mt-1">一级/二级分区、补给排泄、含水层参数与边界类型</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20">固定型</span>
          <button onClick={() => { exportDataCSV(systemZones, 'system-zones'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="一级分区" value={String(systemZones.length)} unit="个" icon={Layers} accent="blue" />
        <StatCard title="子区" value={String(totalSubZones)} unit="个" icon={GitBranch} accent="cyan" />
        <StatCard title="小区" value={String(totalSubCells)} unit="个" icon={Layers} accent="emerald" />
        <StatCard title="总面积" value={totalArea.toLocaleString()} unit="km²" icon={MapPin} accent="amber" />
        <StatCard title="边界类型" value={String(zoneBoundaryStats.length)} unit="种" icon={Info} accent="red" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="一级分区面积对比" className="scan-line" height={320}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={zoneBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" height={45} />
                  <YAxis stroke="#64748b" fontSize={10} label={{ value: 'km²', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
                  <Bar dataKey="area" name="面积(km²)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <LazyChartCard title="各系统区子区数量分布" className="scan-line" height={320}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={subZoneByParent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} label={{ value: '个', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />
                  <Bar dataKey="count" name="子区数量" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="地下水系统一级分区详表">
              <div className="mb-3 flex justify-end">
                <ChartExport data={systemZones} filename="system-zones" sheetName="系统分区" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">编号</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">名称</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">面积(km²)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">占比(%)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">子区</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">含水层</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">特征</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">水质</th>
                </tr></thead>
                <tbody>
                  {systemZones.map((z, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 text-xs font-mono text-gw-highlight">{z.code}</td>
                      <td className="py-2 px-2 text-xs font-medium text-gw-text">{z.name}</td>
                      <td className="py-2 px-2 font-mono text-xs text-gw-cyan">{z.area > 0 ? z.area.toLocaleString() : '-'}</td>
                      <td className="py-2 px-2 font-mono text-xs">{z.proportion > 0 ? z.proportion : '-'}</td>
                      <td className="py-2 px-2 font-mono text-xs">{z.subCount > 0 ? z.subCount : '-'}</td>
                      <td className="py-2 px-2 text-xs">{z.aquiferType}</td>
                      <td className="py-2 px-2 text-xs text-gw-muted max-w-[200px] truncate">{z.features}</td>
                      <td className="py-2 px-2 text-xs text-gw-muted">{z.waterQuality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="地下水系统区划原则" badge="区划方法">
            <div className="space-y-2">
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">系统划分原则：</span>以地下水系统理论为指导，综合考虑地质构造、水文地质条件、水动力特征、水化学特征，按四级体系（系统区→子区→小区→计算单元）逐级划分。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">一级系统区：</span>以地表水流域为基础，结合含水介质类型和地质构造单元划分。全省共划分10个一级系统区（I~X），其中面积最大的为滦河系统区(IV, 22.3%)。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">二级子区：</span>在一级系统区内部，按含水层结构和水动力条件进一步划分。平原区按冲洪积扇→冲积平原→滨海平原三级划分；山区按独立水文地质单元划分。</p>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'subzones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard title="子区总数" value={String(totalSubZones)} unit="个" icon={GitBranch} accent="blue" />
            <StatCard title="小区总数" value={String(totalSubCells)} unit="个" icon={Layers} accent="cyan" />
            <StatCard title="覆盖系统区" value={String(subZoneByParent.length)} unit="个" icon={MapPin} accent="emerald" />
          </div>

          <TechCard title={`子区/小区明细 (${subZones.length}个)`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">编号</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">名称</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">级别</th>
                </tr></thead>
                <tbody>
                  {subZones.map((z, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 text-xs font-mono text-gw-highlight">{z.parentCode}.{z.seq}</td>
                      <td className="py-2 px-2 text-xs text-gw-text">{z.name}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${z.type === '子区' ? 'bg-blue-500/15 text-blue-400' : 'bg-cyan-500/15 text-cyan-400'}`}>{z.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'recharge' && (
        <div className="space-y-4">
          <TechCard title="系统区补给排泄特征总表">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">编号</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">名称</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">降水入渗</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">河流渗漏</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">侧向补给</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">灌溉回渗</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">蒸发排泄</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">人工开采</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">泉水排泄</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">流出方向</th>
                </tr></thead>
                <tbody>
                  {zoneRechargeDischarge.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 text-xs font-mono text-gw-highlight">{r.code}</td>
                      <td className="py-2 px-2 text-xs text-gw-text">{r.name}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.rainfallInfiltration}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.riverLeakage}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.lateralInflow}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.irrigationReturn}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.evaporation}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.artificialExtraction}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.springDischarge}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.outflow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="补给排泄特征分析" badge="水均衡">
            <div className="space-y-2">
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">补给模式：</span>山前区以大气降水入渗为主（补给模数10~25万m³/km²·a），山间盆地有河流渗漏补给，平原区还有灌溉回渗和渠系渗漏等人工补给途径。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">排泄演变：</span>天然状态下以泉水排泄和潜水蒸发为主，20世纪70年代后人工开采成为主要排泄方式。1980-2015年深层超采导致天然排泄大幅减少。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">南水北调影响：</span>2015年通水后，受水区（沧州、衡水、邢台等）地下水开采量大幅压减，水均衡逐步向天然状态恢复。</p>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'params' && (
        <div className="space-y-4">
          <TechCard title="系统区含水层参数概要">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">编号</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">名称</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">含水层类型</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">厚度(m)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">岩性</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">K(m/d)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">T(m²/d)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">给水度</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">水位埋深</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">水质</th>
                </tr></thead>
                <tbody>
                  {zoneAquiferParams.map((p, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 text-xs font-mono text-gw-highlight">{p.code}</td>
                      <td className="py-2 px-2 text-xs text-gw-text">{p.name}</td>
                      <td className="py-2 px-2 text-xs">{p.aquiferType}</td>
                      <td className="py-2 px-2 font-mono text-xs text-gw-cyan">{p.thickness}</td>
                      <td className="py-2 px-2 text-xs">{p.lithology}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.K}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.T}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.mu}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.waterLevel}</td>
                      <td className="py-2 px-2 text-xs text-gw-muted">{p.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'boundary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="边界类型统计" className="scan-line" height={280}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={boundaryPie} cx="50%" cy="50%" innerRadius={40} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} ${value}`}>
                    {boundaryPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="边界类型说明">
              <div className="space-y-2">
                {zoneBoundaryStats.map((b, i) => (
                  <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gw-text">{b.boundaryType}</span>
                      <span className="text-xs font-mono text-gw-highlight">{b.count}条</span>
                    </div>
                    <p className="text-[10px] text-gw-muted mt-1">{b.description}</p>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>
        </div>
      )}

{activeTab === 'classic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="水文地质大区" value={String(hydrogeoZones.length)} unit="个" icon={BookOpen} accent="blue" />
            <StatCard title="亚区总数" value={String(getHydrogeoSummary().totalSubZones)} unit="个" icon={Layers} accent="cyan" />
            <StatCard title="地层系统" value={String(stratigraphyLayers.length)} unit="层" icon={GitBranch} accent="green" />
            <StatCard title="岩石分组" value={String(rockEngineeringGroups.length)} unit="类" icon={Database} accent="amber" />
          </div>

          <TechCard title="经典水文地质分区体系" icon={BookOpen}>
            <p className="text-[10px] text-gw-muted mb-3">
              《河北省水文地质工程地质》中的水文地质大区-亚区两级分区体系
            </p>
            <div className="space-y-3">
              {hydrogeoZones.map((zone, i) => (
                <div key={i} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400">{zone.zoneId}</span>
                    <span className="text-sm font-medium text-gw-text">{zone.zoneName}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {zone.subZones.map((sz, j) => (
                      <div key={j} className="flex items-center gap-2 text-[10px]">
                        <span className="font-mono text-gw-cyan">{sz.subId}</span>
                        <span className="text-gw-text">{sz.name}</span>
                        <span className="px-1 rounded bg-gw-surface text-gw-muted">{sz.waterType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="地层岩性系统概览" icon={GitBranch}>
            <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gw-surface z-10">
                  <tr className="border-b border-gw-border">
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">界</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">系</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">统</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">代号</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">厚度(m)</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">主要岩性</th>
                  </tr>
                </thead>
                <tbody>
                  {stratigraphyLayers.map((sl, i) => (
                    <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                      <td className="px-2 py-1 text-gw-text whitespace-nowrap">{sl.era}</td>
                      <td className="px-2 py-1 text-gw-text whitespace-nowrap">{sl.system}</td>
                      <td className="px-2 py-1 text-gw-text text-[10px] whitespace-nowrap">{sl.series}</td>
                      <td className="px-2 py-1 font-mono text-gw-highlight">{sl.code}</td>
                      <td className="px-2 py-1 font-mono text-gw-text">{sl.thickness || '-'}</td>
                      <td className="px-2 py-1 text-gw-muted text-[10px] max-w-[200px]">{sl.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <DataSourceNote source="《河北省水文地质工程地质》| 水文地质分区+地层系统" version="经典分区" />
        </div>
      )}

      <DataSourceNote source="1999基础文献 | 第五章 地下水系统区划及分区特征" version="v2.0" />
      <CrossLinkPanel currentPath="/system-zoning" />
    </div>
  );
}
