import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,  Line,
} from 'recharts';
import { Activity, AlertTriangle, Droplets } from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, CompactMetric, DataSourceNote } from '../UI';
import { CrossLinkPanel } from '../CrossLink';
import { LazyChartCard } from '../LazyChartCard';
import { waterResourceSummary2024, cityWaterSupply2024, groundwaterDynamic2024, cityGroundwaterDynamic2024 } from '../../data/resources';
import { shallowGroundwaterQuality2024, waterQuality2024, qualityLevelTrend2020_2024 } from '../../data/waterQuality';
import { shallowTotal2024, deepTotal2024, landSubsidence2024 } from '../../data/environment';
import { importantWaterSources } from '../../data/waterSource';
import type { ResourceEnvDataItem, ResourceComboItem, PieDataItem, BarDataItem, ShallowGroundwaterQuality } from '../../types/resources';

interface ResourceEnvTabProps {
  resourceEnvData: ResourceEnvDataItem[];
  resourceCombo: ResourceComboItem[];
  gwDynamicPie: PieDataItem[];
  gwDynamicBar: BarDataItem[];
  wqSourcePie: PieDataItem[];
}

export function ResourceEnvTab({ resourceEnvData, resourceCombo, gwDynamicPie, gwDynamicBar, wqSourcePie }: ResourceEnvTabProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="水资源总量" value={waterResourceSummary2024.totalResource.value} unit="亿m³" subtitle="2024年" icon={Droplets} accent="blue" />
          <StatCard title="地下水供给比" value={Math.round(cityWaterSupply2024.reduce((s, c) => s + c.gwSupply, 0) / cityWaterSupply2024.reduce((s, c) => s + c.totalSupply, 0) * 100)} unit="%" subtitle="全省平均" icon={Activity} accent="cyan" />
          <StatCard title="浅层漏斗面积" value={shallowTotal2024.totalArea} unit="km²" subtitle="持续缩减" icon={AlertTriangle} accent="amber" />
          <StatCard title="深层漏斗" value={deepTotal2024.totalArea} unit="km²" subtitle="全部消散" icon={AlertTriangle} accent="emerald" />
        </div>

        {/* 紧凑指标行 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <CompactMetric
            label="地表水占比"
            value={Math.round(100 - cityWaterSupply2024.reduce((s: number, c: { gwSupply: number; totalSupply: number }) => s + c.gwSupply, 0) / cityWaterSupply2024.reduce((s: number, c: { totalSupply: number }) => s + c.totalSupply, 0) * 100)}
            unit="%"
            trend="up"
          />
          <CompactMetric
            label="监测井总数"
            value={shallowGroundwaterQuality2024.reduce((s: number, q: ShallowGroundwaterQuality) => s + (q.stations || 0), 0)}
            unit="眼"
            trend="flat"
          />
          <CompactMetric
            label="超采区面积"
            value={shallowTotal2024.totalArea}
            unit="km²"
            trend="down"
          />
          <CompactMetric
            label="水源地数量"
            value={String(importantWaterSources?.length || '-')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazyChartCard title="水资源量与漏斗面积关联趋势(2016-2024)" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={resourceEnvData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<ChartTooltip title="水资源量与漏斗面积关联趋势" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="水资源总量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="left" dataKey="地下水" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                <Line yAxisId="right" dataKey="浅层漏斗" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
            <DataSourceNote source="水资源量(左轴/亿m³) vs 浅层漏斗面积(右轴/km²)" />
          </LazyChartCard>

          {/* D-3: 开采量-水质达标率-水位回升四维联动(2020-2024) */}
          <LazyChartCard title="超采治理四维响应(2020-2024)" className="hud-corners" height={300}>
            <div className="flex items-center gap-4 text-[10px] text-gw-muted mb-2 flex-wrap">
              <span className="text-blue-400">蓝柱=地下水开采量(左轴)</span>
              <span className="text-emerald-400">绿线=水质达标率(右轴)</span>
              <span className="text-amber-400">橙线=水位回升速率(m/yr, 右轴)</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={qualityLevelTrend2020_2024.map((d: { year: number; gwSupply: number; IIIplus: number; shallowRise: number }) => ({
                name: String(d.year),
                开采量: d.gwSupply,
                达标率: d.IIIplus,
                水位回升: d.shallowRise * 100,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 120]} unit="亿m³" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 80]} unit="%" />
                <Tooltip content={<ChartTooltip title="超采治理四维响应" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="开采量" name="地下水开采量(亿m³)" fill="#3b82f6" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
                <Line yAxisId="right" dataKey="达标率" name="III类及以上达标率(%)" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
                <Line yAxisId="right" dataKey="水位回升" name="水位回升速率(cm/yr)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} strokeDasharray="5 3" />
              </ComposedChart>
            </ResponsiveContainer>
            <DataSourceNote source="开采量下降(蓝柱缩短) → 达标率上升(绿线升高) + 水位回升加速(橙线升) | 因果联动验证" />
          </LazyChartCard>

          <LazyChartCard title="河北省数据库资产分布" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={resourceCombo} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`} labelLine={{ stroke: '#475569' }}>
                  {resourceCombo.map((entry: ResourceComboItem, i: number) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip title="河北省数据库资产分布" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <DataSourceNote source="各类别调查数据覆盖范围" />
          </LazyChartCard>
        </div>

        {/* 地下水动态可视化 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazyChartCard title="2024年平原区浅层水位变化面积占比" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={gwDynamicPie} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`} labelLine={{ stroke: '#475569' }}>
                  {gwDynamicPie.map((entry: PieDataItem, i: number) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip title="浅层水位变化面积占比" unit="%" />} />
              </PieChart>
            </ResponsiveContainer>
            <DataSourceNote source={`全省回升面积${groundwaterDynamic2024.shallowRiseArea}%, 储量增加${groundwaterDynamic2024.plainStorageChange}亿m³`} />
          </LazyChartCard>

          <LazyChartCard title="各区域水位回升幅度对比(m)" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gwDynamicBar} margin={{ left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} unit="m" />
                <Tooltip content={<ChartTooltip title="水位回升幅度" unit="m" />} />
                <Bar dataKey="value" name="回升幅度(m)" radius={[4, 4, 0, 0]}>
                  {gwDynamicBar.map((_: BarDataItem, i: number) => <Cell key={i} fill={['#06b6d4', '#3b82f6', '#8b5cf6', '#22c55e', '#10b981'][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <DataSourceNote source="2024年较上年同期水位回升幅度(正值为回升)" />
          </LazyChartCard>
        </div>

        {/* 水质数据卡片 */}
        <TechCard title="饮用水水源地达标情况(2024)" className="scan-line" badge={`${waterQuality2024.drinkingWater.totalSources}处全达标`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={wqSourcePie} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}处`} labelLine={{ stroke: '#475569' }}>
                    {wqSourcePie.map((entry: PieDataItem, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip title="水源地类型分布" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
                <p className="text-[10px] text-gw-muted">国考断面优良比例</p>
                <p className="text-lg font-mono font-bold text-emerald-400">{waterQuality2024.nationalExam.classVRatio}% <span className="text-xs text-gw-muted font-normal">(优于{waterQuality2024.nationalExam.nationalRequirement}%要求)</span></p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/15">
                <p className="text-[10px] text-gw-muted">饮用水源达标率</p>
                <p className="text-lg font-mono font-bold text-blue-400">{waterQuality2024.drinkingWater.overallCompliance}% <span className="text-xs text-gw-muted font-normal">({waterQuality2024.drinkingWater.totalSources}处水源地)</span></p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
                <p className="text-[10px] text-gw-muted">监测方式</p>
                <p className="text-xs text-gw-text">{waterQuality2024.nationalExam.monitoring}</p>
              </div>
            </div>
          </div>
        </TechCard>

        {/* D-16: 城市综合评估雷达图 */}
        <TechCard title="各市综合评估雷达图" badge="5维度 · 5城市" className="hud-corners">
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted flex-wrap">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#06b6d4'}} />石家庄</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#3b82f6'}} />邢台</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#f59e0b'}} />保定</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#10b981'}} />承德</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#ef4444'}} />邯郸</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={(() => {
              const dims = ['水资源保障', '水质安全', '水位回升', '沉降控制', '开采强度'];
              const cities = ['石家庄', '邢台', '保定', '承德', '邯郸'];
              const gwDynamicMap = new Map(cityGroundwaterDynamic2024.filter(c => c.shallowChange != null).map(c => [c.city, c]));
              const subsMap = new Map(landSubsidence2024.map(l => [l.city, l]));
              return dims.map(dim => {
                const entry: Record<string, unknown> = { dimension: dim };
                cities.forEach(city => {
                  const bulletin = cityWaterSupply2024.find(c => c.city.startsWith(city.slice(0, 2)));
                  const gwD = gwDynamicMap.get(city);
                  const sub = subsMap.get(city);
                  let val = 50;
                  if (dim === '水资源保障') {
                    val = bulletin ? Math.min(100, Math.round((bulletin.totalSupply / 35) * 100)) : 50;
                  } else if (dim === '水质安全') {
                    val = 95;
                  } else if (dim === '水位回升') {
                    val = gwD ? Math.min(100, Math.round(((gwD.shallowChange || 0) / 3) * 100)) : 50;
                  } else if (dim === '沉降控制') {
                    val = sub ? Math.max(10, Math.round(100 - (sub.maxRateMmYr || 0) / 2)) : 70;
                  } else if (dim === '开采强度') {
                    val = bulletin ? Math.max(10, Math.round(100 - (bulletin.gwSupply / bulletin.totalSupply) * 100)) : 50;
                  }
                  entry[city] = val;
                });
                return entry;
              });
            })()}>
              <PolarGrid stroke="rgba(6,182,212,0.12)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              <Radar name="石家庄" dataKey="石家庄" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="邢台" dataKey="邢台" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="保定" dataKey="保定" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="承德" dataKey="承德" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="邯郸" dataKey="邯郸" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="综合评估" />} />
            </RadarChart>
          </ResponsiveContainer>
          <DataSourceNote source="5维度评分(0-100): 水资源保障(供水总量归一化) / 水质安全(达标率) / 水位回升(年变幅) / 沉降控制(沉降速率反比) / 开采强度(地下水占比反比)" />
        </TechCard>

        <CrossLinkPanel currentPath="/data-insight" />
      </div>
    </>
  );
}
