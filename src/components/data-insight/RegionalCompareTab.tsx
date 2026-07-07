import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,  ComposedChart, Scatter, Line, ReferenceLine,
} from 'recharts';
import { AlertTriangle, ArrowLeftRight, Droplets, MapPin } from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { CrossLinkPanel } from '../CrossLink';
import { LazyChartCard } from '../LazyChartCard';
import { ComparePanel } from '../ComparePanel';
import { cityWaterSupply2024, cityBulletin2024 } from '../../data/resources';
import { salineDistribution } from '../../data/salineWater';
import { landSubsidence, landSubsidence2024 } from '../../data/environment';
import { cityGroundwaterQuality2024 } from '../../data/waterQuality';
import type { RegionalCompareItem, GwDepRankItem, RegionalColumnItem } from '../../types/county';

interface RegionalCompareTabProps {
  regionalCompare: RegionalCompareItem[];
  gwDepRank: GwDepRankItem[];
  regionalColumns: RegionalColumnItem[];
  exportRegionalCompare: () => void;
}

interface SalineChartItem {
  name: string;
  咸水面积: number;
  浅层咸水: number;
  深层咸水: number;
}

interface GwDepScatterItem {
  name: string;
  地下水占比: number;
  沉降量: number;
  地下水供水: number;
  县级覆盖: number;
}

interface CouplingItem {
  name: string;
  地下水供水: number;
  水质达标率: number;
  沉降速率: number;
}

interface ScoreItem {
  name: string;
  gw: number;
  dep: number;
  wq: number;
  sub: number;
  score: number;
}

export function RegionalCompareTab({ regionalCompare, gwDepRank, regionalColumns, exportRegionalCompare }: RegionalCompareTabProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="对比城市" value={regionalColumns.length} unit="个" subtitle="主要地市" icon={MapPin} accent="blue" />
          <StatCard title="对比维度" value={6} unit="项" subtitle="供水+水位+沉降" icon={ArrowLeftRight} accent="cyan" />
          <StatCard title="最高地下水占比" value={gwDepRank[0]?.rate || 0} unit="%" subtitle={gwDepRank[0]?.name || ''} icon={Droplets} accent="red" />
          <StatCard title="咸水总面积" value={salineDistribution.reduce((s, d) => s + d.salineArea, 0).toLocaleString()} unit="km²" subtitle="11市合计" icon={AlertTriangle} accent="amber" />
        </div>

        <div className="flex justify-end">
          <button onClick={exportRegionalCompare} className="text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors">
            导出区域对比数据 <span className="ml-1 opacity-60">&darr;</span>
          </button>
        </div>

        <ComparePanel columns={regionalColumns as any} title="主要城市多维度对比" caption="供水结构 / 水位动态 / 咸水分布 / 地面沉降" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazyChartCard title="各市水位变化对比" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={regionalCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<ChartTooltip title="各市水位变化对比" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="浅层变化" name="浅层水位变化(m)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                <Line dataKey="深层变化" name="深层水位变化(m)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <LazyChartCard title="各市沉降与咸水面积" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salineDistribution.filter(d => d.salineArea > 0).map(d => ({
                name: d.region,
                咸水面积: d.salineArea,
                浅层咸水: d.shallowSaline,
                深层咸水: d.deepSaline,
              } as SalineChartItem)).slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <ChartTooltip title="数据" />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="浅层咸水" stackId="a" fill="#f59e0b" />
                <Bar dataKey="深层咸水" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
            <DataSourceNote source="咸水分布: 浅层(黄) + 深层(红)" />
          </LazyChartCard>
        </div>

        {/* B-15: 地下水依赖度-沉降风险关联散点图 */}
        <TechCard title="地下水依赖度 vs 地面沉降风险" badge="关联分析" className="scan-line">
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted flex-wrap">
            <span>X轴: 地下水占供水比例(%)</span>
            <span>Y轴: 累计沉降量(mm)</span>
            <span>气泡大小: 地下水供水量</span>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={gwDepRank.filter(d => {
              const bulletin = cityBulletin2024.find(c => c.city === d.name);
              return !!(bulletin && bulletin.counties && bulletin.counties.length > 0);
            }).map(d => {
              const bulletin = cityBulletin2024.find(c => c.city === d.name)!;
              const supply = cityWaterSupply2024.find(c => c.city === d.name.replace('市',''));
              return {
                name: d.name,
                地下水占比: d.rate,
                沉降量: landSubsidence.find(l => l.city === d.name)?.totalMm || 0,
                地下水供水: supply?.gwSupply || 0,
                县级覆盖: bulletin.counties?.length || 0,
              } as GwDepScatterItem;
            }).sort((a, b) => b.沉降量 - a.沉降量)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="地下水占比" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} name="地下水占比(%)" label={{ value: '地下水占比(%)', position: 'insideBottom', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="number" dataKey="沉降量" tick={{ fill: '#94a3b8', fontSize: 10 }} name="沉降量" label={{ value: '累计沉降(mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip unit="" title="" />} />
              <Scatter dataKey="地下水占比" data={[]} />
              {gwDepRank.filter(d => cityBulletin2024.find(c => c.city === d.name)).map((d: GwDepRankItem, _i: number) => {
                const supply = cityWaterSupply2024.find(c => c.city === d.name.replace('市',''));
                const settle = landSubsidence.find(l => l.city === d.name)?.totalMm || 0;
                const item = { name: d.name, 地下水占比: d.rate, 沉降量: settle, 地下水供水: supply?.gwSupply || 0 };
                const color = settle > 1000 ? '#ef4444' : settle > 500 ? '#f59e0b' : settle > 100 ? '#3b82f6' : '#10b981';
                const size = Math.max(30, Math.sqrt(supply?.gwSupply || 0) * 15);
                return <Scatter key={d.name} data={[item]} fill={color} fillOpacity={0.6} r={size} />;
              })}
              <ReferenceLine x={70} stroke="#ef4444" strokeDasharray="5 3" strokeOpacity={0.3} />
              <ReferenceLine x={50} stroke="#f59e0b" strokeDasharray="5 3" strokeOpacity={0.3} />
              <ReferenceLine y={500} stroke="#6b7280" strokeDasharray="5 3" strokeOpacity={0.3} />
            </ComposedChart>
          </ResponsiveContainer>
          <DataSourceNote source="红线=70%高依赖阈值 | 黄线=50%中依赖 | 灰线=500mm沉降预警" />
        </TechCard>

        {/* D-2: 开采量-水质达标率-沉降速率 三轴关联 */}
        <LazyChartCard title="水资源-水环境-地面沉降三轴耦合分析(2024)" className="hud-corners" height={320}>
          <div className="flex items-center gap-4 text-[10px] text-gw-muted mb-2 flex-wrap">
            <span className="text-blue-400">蓝色柱=地下水供水量(左轴)</span>
            <span className="text-emerald-400">绿色线=水质达标率(右轴)</span>
            <span className="text-red-400">红色线=沉降速率(右轴)</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={useMemo(() => {
              return cityWaterSupply2024.map(s => {
                const q = cityGroundwaterQuality2024.find(c => s.city.startsWith(c.city.slice(0, 2)));
                const sub = landSubsidence2024.find(l => s.city.startsWith(l.city.slice(0, 2)));
                return {
                  name: s.city.replace('市', ''),
                  地下水供水: s.gwSupply,
                  水质达标率: q?.rate || 0,
                  沉降速率: sub?.maxRateMmYr || 0,
                } as CouplingItem;
              }).filter(d => d.水质达标率 > 0 || d.沉降速率 > 0);
            }, []).sort((a, b) => b.地下水供水 - a.地下水供水)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
              <YAxis yAxisId="supply" tick={{ fill: '#8b9dc3', fontSize: 10 }} unit="亿m³" />
              <YAxis yAxisId="rate" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} unit="%" />
              <Tooltip content={<ChartTooltip title="三轴耦合分析" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="supply" dataKey="地下水供水" name="地下水供水(亿m³)" fill="#3b82f6" radius={[3, 3, 0, 0]} fillOpacity={0.8} />
              <Line yAxisId="rate" dataKey="水质达标率" name="水质达标率(%)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
              <Line yAxisId="rate" dataKey="沉降速率" name="沉降速率(mm/yr)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} strokeDasharray="5 3" />
              <ReferenceLine yAxisId="rate" y={50} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: '50%达标率', fill: '#f59e0b', fontSize: 8 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <DataSourceNote source="耦合规律: 高开采(蓝柱高)城市往往达标率低(绿线低)且沉降速率高(红线高)" />
        </LazyChartCard>

        {/* D-2: 水环境综合评分卡片 */}
        <TechCard title="各市水环境综合评分" badge="开采+水质+沉降三维评估">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2">城市</th>
                  <th className="text-center text-gw-muted py-2 px-2">地下水供水量</th>
                  <th className="text-center text-gw-muted py-2 px-2">依赖度</th>
                  <th className="text-center text-gw-muted py-2 px-2">水质达标率</th>
                  <th className="text-center text-gw-muted py-2 px-2">沉降速率</th>
                  <th className="text-center text-gw-muted py-2 px-2">综合评分</th>
                </tr>
              </thead>
              <tbody>
                {useMemo(() => cityWaterSupply2024.map(s => {
                  const q = cityGroundwaterQuality2024.find(c => s.city.startsWith(c.city.slice(0, 2)));
                  const sub = landSubsidence2024.find(l => s.city.startsWith(l.city.slice(0, 2)));
                  const dep = Math.round(s.gwSupply / s.totalSupply * 100);
                  const score = Math.round((dep < 40 ? 30 : dep < 60 ? 20 : 10) + (q?.rate || 0) * 0.4 + (sub ? (sub.maxRateMmYr < 20 ? 30 : sub.maxRateMmYr < 50 ? 20 : 10) : 25));
                  return { name: s.city.replace('市', ''), gw: s.gwSupply, dep, wq: q?.rate || 0, sub: sub?.maxRateMmYr || 0, score } as ScoreItem;
                }).sort((a, b) => b.score - a.score), []).map((r: ScoreItem, _i: number) => (
                  <tr key={r.name} className="border-b border-gw-border/30 hover:bg-gw-surface/30">
                    <td className="py-1.5 px-2 font-medium text-gw-text">{_i + 1}. {r.name}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-gw-cyan">{r.gw}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.dep < 40 ? 'bg-emerald-500/15 text-emerald-400' : r.dep < 60 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                        {r.dep}%
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono">{r.wq > 0 ? r.wq + '%' : '-'}</td>
                    <td className="py-1.5 px-2 text-center font-mono">{r.sub > 0 ? r.sub + 'mm/yr' : '-'}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.score >= 70 ? 'bg-emerald-500/15 text-emerald-400' : r.score >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                        {r.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">评分算法: 依赖度(30分) + 水质达标率权重(40分) + 沉降控制(30分) | 绿色=优良({'>'}=70) 黄色=中等(50-69) 红色=待改善({'<='}50)</p>
        </TechCard>

        <CrossLinkPanel currentPath="/data-insight" />
      </div>
    </>
  );
}
