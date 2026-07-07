import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,  Cell,  ReferenceLine, ComposedChart, Scatter,
} from 'recharts';
import { Activity, Droplets, TrendingUp } from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { CrossLinkPanel } from '../CrossLink';
import { LazyChartCard } from '../LazyChartCard';
import { cityWaterSupply2024, cityBulletin2024 } from '../../data/resources';
import type { GwDepRankItem } from '../../types/county';

interface SupplyStructureTabProps {
  supplyDemandData: { name: string; 地下水: number; 地表水: number }[];
  gwDepRank: GwDepRankItem[];
  exportSupplyData: () => void;
  setActiveKey: (key: string | null) => void;
}

export function SupplyStructureTab({ supplyDemandData, gwDepRank, exportSupplyData, setActiveKey }: SupplyStructureTabProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="最高地下水占比" value={gwDepRank[0]?.rate || 0} unit="%" subtitle={gwDepRank[0]?.name || ''} icon={Droplets} accent="red" />
          <StatCard title="最低地下水占比" value={gwDepRank[gwDepRank.length - 1]?.rate || 0} unit="%" subtitle={gwDepRank[gwDepRank.length - 1]?.name || ''} icon={Droplets} accent="emerald" />
          <StatCard title="全省平均" value={Math.round(gwDepRank.reduce((s, r) => s + r.rate, 0) / gwDepRank.length)} unit="%" subtitle="地下水依赖度" icon={Activity} accent="cyan" />
          <StatCard title="总供水量" value={cityWaterSupply2024.reduce((s, c) => s + c.totalSupply, 0).toFixed(1)} unit="亿m³" subtitle="2024年" icon={TrendingUp} accent="blue" />
        </div>

        <TechCard title="各市地下水依赖度排名" className="scan-line">
          <div className="flex justify-end mb-3">
            <button onClick={exportSupplyData} className="text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors">
              导出CSV <span className="ml-1 opacity-60">&darr;</span>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={gwDepRank} layout="vertical" margin={{ left: 60 }}
              onClick={(data) => { if (data?.activePayload?.[0]) setActiveKey(data.activePayload[0].name); }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="%" title="" />} />
              <Bar dataKey="rate" name="地下水占比(%)" radius={[0, 4, 4, 0]}>
                {gwDepRank.map((entry: GwDepRankItem, i: number) => (
                  <Cell key={i} fill={entry.rate > 70 ? '#ef4444' : entry.rate > 50 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="红色&gt;70% 高依赖 | 黄色50-70% 中依赖 | 绿色&lt;50% 低依赖" />
        </TechCard>

        <LazyChartCard title="各市供水结构对比" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplyDemandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="各市供水结构对比" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="地下水" stackId="a" fill="#3b82f6" />
              <Bar dataKey="地表水" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="供水结构: 地下水(蓝) + 地表水(绿)" />
        </LazyChartCard>

        {/* B-12: 地下水依赖度 vs 供水强度气泡图 */}
        <TechCard title="地下水依赖度 vs 供水强度" badge="气泡大小=总供水量" className="scan-line">
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
            <span>X轴: 人均供水强度(万m³/万人)</span>
            <span>Y轴: 地下水占比(%)</span>
            <span>气泡: 总供水量</span>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={cityWaterSupply2024.map((c: { city: string; totalSupply: number; gwSupply: number; gwRatio: number; population?: number }) => ({
              name: c.city,
              人均强度: c.population && c.population > 0 ? Math.round(c.totalSupply / c.population * 10000) / 10 : 0,
              地下水占比: c.totalSupply > 0 ? Math.round(c.gwSupply / c.totalSupply * 100) : 0,
              总供水: c.totalSupply,
            })).sort((a, b) => b.地下水占比 - a.地下水占比)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="人均强度" tick={{ fill: '#94a3b8', fontSize: 10 }} name="人均供水强度(万m³/万人)" label={{ value: '人均供水强度(万m³/万人)', position: 'insideBottom', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="number" dataKey="地下水占比" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} name="地下水占比(%)" label={{ value: '地下水占比(%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip unit="" title="" />} />
              <Scatter dataKey="人均强度" data={[]} />
              {cityWaterSupply2024.map((c: { city: string; totalSupply: number; gwSupply: number; gwRatio: number; population?: number }, _i: number) => {
                const item = {
                  name: c.city,
                  人均强度: c.population && c.population > 0 ? Math.round(c.totalSupply / c.population * 10000) / 10 : 0,
                  地下水占比: c.totalSupply > 0 ? Math.round(c.gwSupply / c.totalSupply * 100) : 0,
                  总供水: c.totalSupply,
                };
                const color = item.地下水占比 > 70 ? '#ef4444' : item.地下水占比 > 50 ? '#f59e0b' : '#10b981';
                const size = Math.max(40, Math.sqrt(c.totalSupply) * 30);
                return (
                  <Scatter
                    key={c.city}
                    data={[item]}
                    fill={color}
                    fillOpacity={0.6}
                    r={size}
                  />
                );
              })}
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 3" strokeOpacity={0.4} />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 3" strokeOpacity={0.4} />
              <ReferenceLine x={400} stroke="#6b7280" strokeDasharray="5 3" strokeOpacity={0.3} />
            </ComposedChart>
          </ResponsiveContainer>
          <DataSourceNote source="红线=70%高依赖阈值 | 黄线=50%中依赖阈值 | 气泡越大供水总量越高" />
        </TechCard>

        {/* D-17: 万元GDP用水量对比 */}
        <TechCard title="万元GDP用水量对比" badge="2024年" className="scan-line">
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
            <span>柱高=万元GDP用水量(m³/万元, 2015价)</span>
            <span>颜色越深=用水效率越低</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cityBulletin2024
              .filter(c => c.gdpWaterUse != null && c.gdpWaterUse > 0)
              .map(c => ({ name: c.city.replace('市', ''), 万元GDP用水量: c.gdpWaterUse! }))
              .sort((a, b) => (b.万元GDP用水量 ?? 0) - (a.万元GDP用水量 ?? 0))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-25} textAnchor="end" height={55} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="m³" />
              <Tooltip content={<ChartTooltip title="万元GDP用水量" unit="m³" />} />
              <Bar dataKey="万元GDP用水量" name="万元GDP用水量(m³)" radius={[3, 3, 0, 0]}>
                {cityBulletin2024
                  .filter(c => c.gdpWaterUse != null && c.gdpWaterUse > 0)
                  .map((entry, index) => {
                    const val = entry.gdpWaterUse!;
                    return <Cell key={index} fill={val > 60 ? '#ef4444' : val > 40 ? '#f59e0b' : val > 25 ? '#3b82f6' : '#10b981'} />;
                  })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="红色>60m³/万元 低效 | 黄色40-60 | 蓝色25-40 | 绿色<25m³/万元 高效 | 数据来源: 2024年水资源公报" />
        </TechCard>

        <CrossLinkPanel currentPath="/data-insight" />
      </div>
    </>
  );
}
