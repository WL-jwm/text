import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { Droplets, MapPin, AlertTriangle, TrendingDown, TrendingUp, Waves, Fish, Factory, BookOpen } from 'lucide-react';
import { salineDistribution, salineTypes, salineUtilization, salineFeatures, salineHydroParams, interfaceChange } from '../data/salineWater';
import { resistivityMineralization, deepWaterParameters } from '../data/hydrogeologyReference';
import { TechCard, StatCard, TechTable, ChartTooltip, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { LazyChartCard } from '../components/LazyChartCard';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { ChartExport } from '../components/ChartExport';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'distribution', label: '咸水分布', icon: MapPin },
  { key: 'types', label: '类型分区', icon: Droplets },
  { key: 'utilization', label: '开发利用', icon: Factory },
  { key: 'interface', label: '界面变化', icon: AlertTriangle },
  { key: 'geophysical', label: '物探参数', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

export function SalineWater() {

  usePageCommons({
    pageName: 'saline-water',
    collector: useCallback(async () => ({ salineWaterOverview: { totalArea: 40000, totalStorage: "1793.85" }, salineDistribution }), []),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('distribution');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [_sortDir, _setSortDir] = useState<'asc' | 'desc'>('desc');


  const _handleSort = (col: number) => {
    if ((sortCol ?? -1) === col) { _setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortCol(col); _setSortDir('desc'); }
  };

  const typePie = useMemo(() => salineTypes.filter(t => Number(t.area) > 100).map(t => ({ name: t.type, value: parseFloat(String(t.area).replace(/[^0-9.]/g, "")) || 0, color: t.color })), []);

  const distBarData = useMemo(() => salineDistribution.filter(d => d.salineArea > 0).map(d => ({
    name: d.region, shallow: d.shallowSaline, deep: d.deepSaline, total: d.salineArea,
  })).sort((a, b) => b.total - a.total), []);

  const interfaceLineData = useMemo(() => interfaceChange.map(ic => ({
    name: ic.period,
    minD: parseFloat(ic.interfaceDepth.split('~')[0]) || 50,
    maxD: parseFloat(ic.interfaceDepth.split('~')[1]) || 100,
  })), []);

  const totalSalineArea = salineDistribution.reduce((sum, d) => sum + d.salineArea, 0);
  const affectedCities = salineDistribution.filter(d => d.salineArea > 0).length;

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">咸水分布与利用</h1>
          <p className="text-xs text-gw-muted mt-1">咸水空间分布、矿化度分区与开发利用现状</p>
        </div>
        <span className="px-2 py-1 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">调查年限型</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="咸水总面积" value={(totalSalineArea / 10000).toFixed(4)} unit="万km²" icon={Waves} accent="red" />
        <StatCard title="涉及地市" value={String(affectedCities)} unit="个" icon={MapPin} accent="amber" />
        <StatCard title="微咸水可利用" value="~15" unit="万亩" icon={Droplets} accent="blue" />
        <StatCard title="淡水占比" value="64.9" unit="%" icon={TrendingUp} accent="emerald" />
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

      {activeTab === 'distribution' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="各市咸水面积对比(浅层+深层)" className="scan-line" height={280}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} label={{ value: 'km²', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="shallow" name="浅层咸水" fill="#f59e0b" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="deep" name="深层咸水" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="咸水分布特征" badge="水文地质">
              <div className="space-y-2">
                {salineFeatures.map((f, i) => (
                  <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gw-text">{f.feature}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${f.importance === '极高' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>重要性: {f.importance}</span>
                    </div>
                    <p className="text-[10px] text-gw-muted mt-1">{f.description}</p>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>

          <TechCard title="各市咸水分布详细数据">
              <div className="mb-3 flex justify-end">
                <ChartExport data={salineDistribution} filename="saline-distribution" sheetName="咸水分布" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable headers={['地市', '总面积(km²)', '咸水面积', '淡水面积', '淡水占比', '浅层咸水', '深层咸水']}
              rows={salineDistribution.map(d => [d.region, String(d.totalArea), String(d.salineArea), String(d.freshArea), d.freshRatio, String(d.shallowSaline), String(d.deepSaline)])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>

          <TechCard title="咸水区水文地质参数" badge="参数特征">
            <TechTable headers={['分区', '矿化度', '含水层类型', '含水层厚度', 'K(m/d)', '涌水量', '深度']}
              rows={salineHydroParams.map(p => [p.zone, p.mineralization, p.aquiferType, p.aquiferThickness, p.K, p.yield, p.depth])}
          />
          </TechCard>
        </div>
      )}

      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="淡水区" value="57,833" unit="km²" icon={Droplets} accent="blue" />
            <StatCard title="微咸水" value="10,354" unit="km²" icon={Waves} accent="cyan" />
            <StatCard title="半咸水" value="7,289" unit="km²" icon={Waves} accent="amber" />
            <StatCard title="咸水以上" value="13,525" unit="km²" icon={AlertTriangle} accent="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="矿化度类型面积分布" className="scan-line" height={280}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={typePie} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {typePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="矿化度分级标准">
              <div className="space-y-2">
                {salineTypes.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-gw-text">{t.type}</span>
                      <span className="text-[10px] text-gw-muted ml-2">{t.salinityRange}{t.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-gw-cyan">{t.area.toLocaleString()}</span>
                      <span className="text-[10px] text-gw-muted ml-1">km²</span>
                    </div>
                    <span className="text-[10px] text-gw-muted">{t.proportion}</span>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>

          <TechCard title="咸水水平分带规律" badge="空间分布">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <p className="text-xs font-semibold text-gw-text">山前淡水带</p>
                <p className="text-[10px] text-gw-muted mt-1">太行山/燕山山前冲洪积扇区，地下水矿化度小于1g/L，水质优良。石家庄、保定、邯郸、张家口、承德5市全域为淡水区。</p>
                <p className="text-[10px] text-gw-highlight mt-1">特征: 补给条件好，水交替积极</p>
              </div>
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <p className="text-xs font-semibold text-gw-text">中部咸淡水交错带</p>
                <p className="text-[10px] text-gw-muted mt-1">石德线以东至滨海过渡区，浅层淡水与咸水交错分布。矿化度1~5g/L，唐山、廊坊、邢台东部、衡水、沧州西部。垂向上淡水-咸水-淡水三层结构。</p>
                <p className="text-[10px] text-gw-highlight mt-1">特征: 咸淡水界面复杂，开采需注意防咸化</p>
              </div>
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <p className="text-xs font-semibold text-gw-text">滨海全咸水带</p>
                <p className="text-[10px] text-gw-muted mt-1">渤海湾沿岸地带，矿化度5~50g/L以上，局部超过海水盐度。沧州东部、唐山南部沿海。仅深层200m以下有承压淡水。历史上多次海侵影响。</p>
                <p className="text-[10px] text-gw-highlight mt-1">特征: 淡水资源极匮乏，依赖外调水</p>
              </div>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'utilization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="微咸水灌溉" value="~15" unit="万亩" icon={Droplets} accent="emerald" />
            <StatCard title="工业冷却" value="~0.5" unit="亿m³/a" icon={Factory} accent="blue" />
            <StatCard title="盐业生产" value="~200" unit="万吨/a" icon={Waves} accent="amber" />
            <StatCard title="养殖产值" value="~15" unit="亿元/a" icon={Fish} accent="cyan" />
          </div>

          <TechCard title="咸水综合利用方式">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {salineUtilization.map((u, i) => (
                <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gw-text">{u.use}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{u.trend}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gw-muted">规模</span>
                      <span className="font-mono text-gw-cyan">{u.area || u.quantity} {u.unit}</span>
                    </div>
                    <p className="text-[10px] text-gw-muted">{u.description}</p>
                    <p className="text-[10px] text-gw-highlight">{u.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="微咸水农业灌溉技术要点" badge="节水技术">
            <div className="space-y-2">
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">适用范围：</span>矿化度1~3g/L微咸水，可用于耐盐作物灌溉。大于3g/L需与淡水混灌或轮灌。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">适宜作物：</span>棉花、向日葵、甜菜、高粱等耐盐作物可直接灌溉；小麦、玉米需控制灌溉次数和定额。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">灌溉制度：</span>关键期用淡水（播期、苗期），非关键期用咸水；咸淡轮灌（2:1或1:1）；控制灌水定额不超过60m³/亩·次。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">配套措施：</span>深耕松土、覆盖保墒、增施有机肥、秸秆还田、种植绿肥，防止土壤次生盐渍化。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">监测要求：</span>定期监测土壤盐分（0~20cm土层含盐量不超过0.2%）和地下水盐度变化。</p>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'interface' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="当前界面深度" value="60~90" unit="m" icon={TrendingDown} accent="blue" />
            <StatCard title="最深下移" value="80~120" unit="m(2000s)" icon={AlertTriangle} accent="red" />
            <StatCard title="恢复趋势" value="回升" unit="持续" icon={TrendingUp} accent="emerald" />
            <StatCard title="驱动因素" value="超采治理" unit="南水北调" icon={Droplets} accent="cyan" />
          </div>

          <LazyChartCard title="咸淡水界面深度变化趋势" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={interfaceLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} label={{ value: '界面深度(m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} domain={[0, 140]} />
                <Tooltip content={<ChartTooltip title="数据" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="maxD" name="界面最大深度" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                <Area type="monotone" dataKey="minD" name="界面最小深度" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <TechCard title="咸淡水界面变化历史">
            <TechTable headers={['时期', '界面深度(m)', '趋势', '说明']}
              rows={interfaceChange.map(ic => [ic.period, ic.interfaceDepth, ic.trend, ic.description])}
          />
          </TechCard>

          <TechCard title="超采治理与界面恢复分析" badge="治理成效">
            <div className="space-y-2">
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">界面下移机理：</span>深层地下水超采导致含水层水头大幅下降，咸水区与淡水区之间压力平衡被打破，矿化度较高的水向淡水区运移，表现为界面整体下移。1970s-2000s为下移最剧烈阶段。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">恢复机制：</span>2015年南水北调中线通水后，受水区（沧州、衡水、邢台、廊坊等）深层水开采量大幅压减，含水层水头回升，咸淡水界面开始上移恢复。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">治理成效：</span>河北省地下水超采综合治理实施以来，深层漏斗面积持续缩减。2024年监测显示，沧州/衡水深层水位较2015年累计回升10~25m，咸淡水界面恢复明显。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">残余风险：</span>历史上长期咸化可能造成含水层介质阳离子交换和矿物溶蚀，淡水恢复后水质改善存在滞后效应。需要持续监测。</p>
            </div>
          </TechCard>
        </div>
      )}

{activeTab === 'geophysical' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="电性层分区" value={String(resistivityMineralization.length)} unit="级" icon={BookOpen} accent="blue" />
            <StatCard title="深层参数" value={String(deepWaterParameters.length)} unit="地区" icon={Waves} accent="cyan" />
            <StatCard title="淡水阈值" value="<1.2" unit="g/L" icon={Droplets} accent="green" />
            <StatCard title="高矿化度" value=">5" unit="g/L" icon={AlertTriangle} accent="red" />
          </div>

          <TechCard title="视电阻率与矿化度对应关系" icon={BookOpen}>
            <p className="text-[10px] text-gw-muted mb-3">
              物探视电阻率(Ω·m)与地下水矿化度(g/L)的定量关系，用于含水层水质快速判别
            </p>
            <div className="space-y-2">
              {resistivityMineralization.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gw-border/30 hover:bg-gw-surface/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      r.waterType.includes('淡') ? 'bg-emerald-400' :
                      r.waterType.includes('微') ? 'bg-cyan-400' :
                      r.waterType.includes('半') ? 'bg-amber-400' :
                      r.waterType.includes('咸') && !r.waterType.includes('高') ? 'bg-orange-400' :
                      'bg-red-400'
                    }`} />
                    <span className="text-xs text-gw-text font-medium">{r.waterType}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gw-muted">ρs <span className="font-mono text-gw-highlight">{r.resistivity}</span> Ω·m</span>
                    <span className="text-gw-muted">M <span className="font-mono text-gw-highlight">{r.mineralization}</span> g/L</span>
                  </div>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="深层承压水弹性释放参数" icon={Waves}>
            <p className="text-[10px] text-gw-muted mb-3">沧州/衡水/邢台深层承压水越流系统参数</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gw-border">
                  <th className="px-3 py-1.5 text-left text-gw-muted font-medium">地区</th>
                  <th className="px-3 py-1.5 text-left text-gw-muted font-medium">弹性储存系数(S)</th>
                  <th className="px-3 py-1.5 text-left text-gw-muted font-medium">越流系数(B)</th>
                  <th className="px-3 py-1.5 text-left text-gw-muted font-medium">越流层厚度(m)</th>
                </tr>
              </thead>
              <tbody>
                {deepWaterParameters.map((d, i) => (
                  <tr key={i} className="border-b border-gw-border/50">
                    <td className="px-3 py-1.5 text-gw-text">{d.region}</td>
                    <td className="px-3 py-1.5 font-mono text-gw-highlight">{d.storageCoeff}</td>
                    <td className="px-3 py-1.5 font-mono text-gw-highlight">{d.leakageFactor}</td>
                    <td className="px-3 py-1.5 font-mono text-gw-text">{d.leakMin}~{d.leakMax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TechCard>

          <DataSourceNote source="《河北省水文地质工程地质》| 物探+深层水参数" version="物探参数" />
        </div>
      )}

      <DataSourceNote source="1999基础文献 + 2024河北省水资源公报 | 第十二章" version="v2.0" />
      <CrossLinkPanel currentPath="/saline-water" />
    </div>
  );
}
