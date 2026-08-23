/**
 * Overview 页面 — 核心图表区
 * 水资源时序 / 平原区水位分区 / 供水结构 / 各市水位变幅 / 14市供水量 / 降水散点 / 多维雷达
 * 数据经 props 注入（由 useOverviewData 计算），静态数据内部直接引用
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Radar,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { groundwaterDynamic2024, resourceTimeSeries, cityWaterSupply2024 } from '../data/resources';
import { TechCard, ChartTooltip } from '../components/UI';
import { DataSourceTag } from '../components/ui/DataSourceTag';
import { LazyChartCard } from '../components/LazyChartCard';
import { ChartExport } from '../components/ChartExport';

export interface OverviewChartsSectionProps {
  supplyStructure: { name: string; value: number; color: string }[];
  cityWaterLevelData: { city: string; shallowChange: number }[];
  cityRadarData: Record<string, unknown>[];
  precipWaterLevelScatter: { name: string; precipitation: number; shallowChange: number; gwRatio: number; totalSupply: number }[];
}

export function OverviewChartsSection({ supplyStructure, cityWaterLevelData, cityRadarData, precipWaterLevelScatter }: OverviewChartsSectionProps) {
  const d = groundwaterDynamic2024;
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <LazyChartCard title="水资源量时序变化" className="scan-line min-h-[320px]" height={280}>
            <div className="flex justify-start mb-2"><DataSourceTag module="resources" /></div>
            <div className="mb-2 flex justify-end">
              <ChartExport data={resourceTimeSeries} filename="水资源量时序变化" sheetName="水资源时序" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
          <ResponsiveContainer width="100%" height={280}>

            <AreaChart data={resourceTimeSeries}>

              <defs>

                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />

                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />

                </linearGradient>

                <linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />

                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />

                </linearGradient>

                <linearGradient id="gSurface" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />

                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />

                </linearGradient>

              </defs>

              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />

              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />

              <YAxis stroke="#64748b" fontSize={11} />

              <Tooltip content={<ChartTooltip unit="亿m³" title="水资源趋势" />} />

              <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />

              <Area type="monotone" dataKey="total" name="总量" stroke="#3b82f6" fill="url(#gTotal)" strokeWidth={2} />

              <Area type="monotone" dataKey="ground" name="地下水" stroke="#06b6d4" fill="url(#gGround)" strokeWidth={2} />

              <Area type="monotone" dataKey="surface" name="地表水" stroke="#10b981" fill="url(#gSurface)" strokeWidth={2} />

            </AreaChart>

          </ResponsiveContainer>

        </LazyChartCard>

        <TechCard title="平原区浅层水位变化分区" className="hud-corners">

          <div className="flex items-center gap-6">

            <ResponsiveContainer width="60%" height={260}>

              <PieChart>

                <Pie

                  data={[

                    { name: '上升区', value: d.shallowRiseArea },

                    { name: '稳定区', value: d.shallowStableArea },

                    { name: '下降区', value: d.shallowDeclineArea },

                  ]}

                  cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}

                  dataKey="value" stroke="none"

                >

                  <Cell fill="#10b981" />

                  <Cell fill="#f59e0b" />

                  <Cell fill="#ef4444" />

                </Pie>

                <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />

              </PieChart>

            </ResponsiveContainer>

            <div className="flex-1 space-y-4">

              {[

                { name: '上升区', value: d.shallowRiseArea, color: 'emerald', icon: TrendingUp },

                { name: '稳定区', value: d.shallowStableArea, color: 'amber', icon: Activity },

                { name: '下降区', value: d.shallowDeclineArea, color: 'red', icon: TrendingDown },

              ].map(item => (

                <div key={item.name} className="flex items-center gap-3">

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${item.color}-500/15`}>

                    <item.icon size={14} className={`text-${item.color}-400`} />

                  </div>

                  <div className="flex-1">

                    <div className="flex justify-between text-xs mb-1">

                      <span className="text-gw-muted">{item.name}</span>

                      <span className="font-mono text-gw-text">{item.value}%</span>

                    </div>

                    <div className="h-1.5 bg-gw-surface rounded-full overflow-hidden">

                      <div className={`h-full bg-${item.color}-500 rounded-full progress-bar`} style={{ width: `${item.value}%` }} />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </TechCard>

      </div>

      {/* ═══════════════════ 供水结构 + 各市水位回升 ═══════════════════ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <LazyChartCard title="供水结构(2024)" className="hud-corners" height={280}>
            <div className="flex justify-start mb-2"><DataSourceTag module="resources" /></div>
            <div className="mb-2 flex justify-end">
              <ChartExport data={supplyStructure} filename="供水结构2024" sheetName="供水结构" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
          <ResponsiveContainer width="100%" height={260}>

            <PieChart>

              <Pie data={supplyStructure} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">

                {supplyStructure.map((entry, i) => <Cell key={i} fill={entry.color} />)}

              </Pie>

              <Tooltip content={<ChartTooltip percentDigits={1} title="供水结构" />} />

              <Legend wrapperStyle={{ fontSize: 11 }} />

            </PieChart>

          </ResponsiveContainer>

        </LazyChartCard>

        <LazyChartCard title="各市浅层水位年变幅(2024)" className="scan-line lg:col-span-2" height={280}>
            <div className="flex justify-start mb-2"><DataSourceTag module="environment" /></div>
            <div className="mb-2 flex justify-end">
              <ChartExport data={cityWaterLevelData} filename="各市浅层水位年变幅2024" sheetName="水位变幅" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
          <ResponsiveContainer width="100%" height={260}>

            <BarChart data={cityWaterLevelData} layout="vertical" margin={{ left: 10 }}>

              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />

              <XAxis type="number" stroke="#64748b" fontSize={11} unit="m" />

              <YAxis dataKey="city" type="category" stroke="#64748b" fontSize={11} width={65} />

              <Tooltip content={<ChartTooltip unit="m" title="水位变幅" />} />

              <Bar dataKey="shallowChange" name="水位年变幅(m)" radius={[0, 3, 3, 0]} barSize={14}>

                {cityWaterLevelData.map((entry, index) => (

                  <Cell key={index} fill={entry.shallowChange > 1.5 ? '#10b981' : entry.shallowChange > 0.5 ? '#3b82f6' : '#f59e0b'} />

                ))}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

          <div className="flex items-center gap-4 mt-2 text-[10px] text-gw-muted">

            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" />&gt;1.5m</span>

            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />0.5~1.5m</span>

            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />&lt;0.5m</span>

          </div>

        </LazyChartCard>

      </div>

      {/* ═══════════════════ 14市供水量 ═══════════════════ */}

      <LazyChartCard title="14市地下水供水量" height={280}>
        <div className="flex justify-start mb-2"><DataSourceTag module="exploitation" /></div>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart data={cityWaterSupply2024} layout="vertical" margin={{ left: 10 }}>

            <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />

            <XAxis type="number" stroke="#64748b" fontSize={11} />

            <YAxis dataKey="city" type="category" stroke="#64748b" fontSize={11} width={55} />

            <Tooltip content={<ChartTooltip unit="亿m³" title="供水量" />} />

            <Bar dataKey="gwSupply" name="地下水(亿m³)" fill="#3b82f6" radius={[0, 3, 3, 0]} barSize={12} />

            <Bar dataKey="totalSupply" name="总供水(亿m³)" fill="#1a2d4d" radius={[0, 3, 3, 0]} barSize={12} />

          </BarChart>

        </ResponsiveContainer>

      </LazyChartCard>

      {/* ═══════════════════ 降水-水位散点 + 多维雷达 ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="降水-水位回升相关性" badge={`${precipWaterLevelScatter.length}市`} className="scan-line" height={320}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] text-gw-muted">X:年降水量(mm) Y:浅层水位年变幅(m) 气泡大小=地下水占比</span>
            <ChartExport data={precipWaterLevelScatter} filename="降水-水位回升相关性" sheetName="散点数据" formats={['xlsx','csv','json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis dataKey="precipitation" name="降水量" type="number" unit="mm" stroke="#64748b" fontSize={11} domain={[200, 700]} />
              <YAxis dataKey="shallowChange" name="水位变幅" type="number" unit="m" stroke="#64748b" fontSize={11} domain={[0, 4]} />
              <ZAxis dataKey="gwRatio" range={[40, 200]} name="地下水占比" />
              <Tooltip content={<ChartTooltip title="降水-水位" />} />
              <Scatter name="城市" data={precipWaterLevelScatter} fill="#06b6d4">
                {precipWaterLevelScatter.map((entry, index) => (
                  <Cell key={index} fill={entry.shallowChange > 1.5 ? '#10b981' : entry.shallowChange > 0.5 ? '#3b82f6' : '#f59e0b'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各市多维水资源雷达图" badge="5维度 · 5城市" className="hud-corners" height={320}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#06b6d4'}} />石家庄</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#3b82f6'}} />邢台</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#f59e0b'}} />保定</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#10b981'}} />承德</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#ef4444'}} />邯郸</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={cityRadarData}>
              <PolarGrid stroke="rgba(6,182,212,0.12)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              <Radar name="石家庄" dataKey="石家庄" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="邢台" dataKey="邢台" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="保定" dataKey="保定" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="承德" dataKey="承德" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="邯郸" dataKey="邯郸" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="多维对比" />} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
    </>
  );
}
