import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Line, ReferenceLine } from 'recharts';
import { MapPin, Droplets, Activity, Award, Target, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, CHART_COLORS, ExportButton, InfoGrid, ProgressBadge, DataSourceNote } from '../UI';
import { SectionWithFold } from '../SectionWithFold';
import { LazyChartCard } from '../LazyChartCard';
import type { CountyDataItem, CityBulletinBrief, ScatterDataPoint, RadarDataPoint, PieDataItem, QuadrantDataPoint, ReservoirData, CountyGroundwaterData } from '../../types/county';

const USE_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'];

interface Props {
  currentCity: CityBulletinBrief;
  selectedCity: string;
  countyData: CountyDataItem[];
  isSkelCity: boolean;
  scatterData: ScatterDataPoint[];
  radarData: RadarDataPoint[];
  supplyPieData: PieDataItem[];
  sortField: string;
  sortDir: 'asc' | 'desc';
  toggleSort: (field: string) => void;
  handleExportCounty: () => void;
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ArrowUpDown size={12} className="opacity-30" />;
  return sortDir === 'desc'
    ? <ChevronDown size={12} className="text-gw-cyan" />
    : <ChevronUp size={12} className="text-gw-cyan" />;
}

export function CountySingleView({ currentCity, selectedCity, countyData, isSkelCity, scatterData, radarData, supplyPieData, sortField, sortDir, toggleSort, handleExportCounty }: Props) {
  return (
    <div className="space-y-4">
      {isSkelCity && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-amber-400 font-semibold text-sm mb-1">该市县级数据尚未入库</p>
          <p className="text-gw-muted text-xs">已录入{currentCity.counties?.length ?? 0}个县区名称，实际数据待{selectedCity}2024年水资源公报发布后补充。</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {currentCity.counties?.map((c: CountyDataItem) => (
              <span key={c.name} className="px-2 py-0.5 bg-amber-500/10 text-amber-400/70 rounded-full text-[10px] border border-amber-500/15">{c.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard title="县级区划" value={currentCity.counties?.length ?? 0} unit="个" icon={MapPin} accent="blue" subtitle={selectedCity} />
        <StatCard title="总用水量" value={countyData.reduce((s: number, c: CountyDataItem) => s + (c.totalUse ?? 0), 0).toFixed(2)} unit="亿m³" icon={Droplets} accent="cyan" subtitle="县级合计" />
        <StatCard title="地下水用水" value={countyData.reduce((s: number, c: CountyDataItem) => s + (c.gwUse ?? 0), 0).toFixed(2)} unit="亿m³" icon={Activity} accent="emerald"
          subtitle={(() => { const t = countyData.reduce((s: number, c: CountyDataItem) => s + (c.totalUse ?? 0), 0); const g = countyData.reduce((s: number, c: CountyDataItem) => s + (c.gwUse ?? 0), 0); return t > 0 ? `占比${(g / t * 100).toFixed(1)}%` : ''; })()} />
        <StatCard title="最高用水县" value={countyData[0]?.name ?? '-'} unit={`${countyData[0]?.totalUse?.toFixed(2) ?? 0}亿m³`} icon={Award} accent="amber" subtitle="按用水总量" />
        <StatCard title="最高地下水占比" value={(() => { const max = [...countyData].sort((a: CountyDataItem, b: CountyDataItem) => (b.gwRatio ?? 0) - (a.gwRatio ?? 0))[0]; return max?.gwRatio?.toFixed(0) ?? '-'; })()} unit="%" icon={Target} accent="red"
          subtitle={(() => { const max = [...countyData].sort((a: CountyDataItem, b: CountyDataItem) => (b.gwRatio ?? 0) - (a.gwRatio ?? 0))[0]; return max?.name ?? ''; })()} />
      </div>

      <div className="flex justify-end">
        <ExportButton onClick={handleExportCounty} label="导出县级数据" />
      </div>

      {!isSkelCity && (<>
        <LazyChartCard title="各县用水总量排行" badge={`按${sortDir === 'desc' ? '降' : '升'}序`} height={Math.max(320, countyData.length * 36)}>
          <ResponsiveContainer width="100%" height={Math.max(320, countyData.length * 36)}>
            <BarChart data={countyData} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '亿m³', position: 'insideBottom', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="city" tick={{ fill: '#94a3b8', fontSize: 10 }} width={85} />
              <Tooltip content={<ChartTooltip title="用水总量排行" unit="亿m³" />} />
              <Bar dataKey="totalUse" name="总用水量" radius={[0, 4, 4, 0]}>
                {countyData.map((_: CountyDataItem, i: number) => (
                  <Cell key={i} fill={'#06b6d4'} fillOpacity={0.5 + 0.5 * (1 - i / countyData.length)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazyChartCard title="各县用水部门结构" badge={`农业/工业/生活/生态 (${countyData.length}县)`}>
            <ResponsiveContainer width="100%" height={Math.max(300, countyData.length * 22 + 60)}>
              <BarChart data={countyData} margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="city" tick={{ fill: '#94a3b8', fontSize: 9 }} width={75} />
                <Tooltip content={<ChartTooltip title="用水结构" unit="亿m³" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="agri" name="农业" stackId="u" fill={USE_COLORS[0]} />
                <Bar dataKey="industry" name="工业" stackId="u" fill={USE_COLORS[1]} />
                <Bar dataKey="domestic" name="生活" stackId="u" fill={USE_COLORS[2]} />
                <Bar dataKey="eco" name="生态" stackId="u" fill={USE_COLORS[3]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <LazyChartCard title="各县地下水用水占比" badge={`地下水用水 / 总用水 (${countyData.length}县)`}>
            <ResponsiveContainer width="100%" height={Math.max(300, countyData.length * 22 + 60)}>
              <BarChart data={countyData} margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} label={{ value: '%', position: 'insideBottom', fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="city" tick={{ fill: '#94a3b8', fontSize: 9 }} width={75} />
                <Tooltip content={<ChartTooltip title="地下水占比" unit="%" />} />
                <Bar dataKey="gwRatio" name="地下水占比" radius={[0, 4, 4, 0]}>
                  {countyData.map((c: CountyDataItem, i: number) => (
                    <Cell key={i} fill={(c.gwRatio ?? 0) > 80 ? '#ef4444' : (c.gwRatio ?? 0) > 60 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-gw-muted text-center mt-1">红&gt;80% 橙&gt;60% 绿&lt;60%</p>
          </LazyChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazyChartCard title="用水总量 vs 地下水依赖度" badge="气泡大小=降水量">
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="总用水量" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '总用水量(亿m³)', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="地下水占比" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} label={{ value: '地下水占比(%)', fill: '#94a3b8', fontSize: 10, angle: -90, position: 'insideLeft' }} />
                <ZAxis type="number" dataKey="size" range={[30, 400]} />
                <Tooltip content={({ active, payload }: any) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (<div className="bg-gw-card border border-gw-border rounded-lg p-3 text-xs shadow-xl">
                    <p className="font-bold text-gw-text mb-1">{d.name}</p>
                    <p className="text-gw-muted">总用水量: <span className="text-cyan-400">{d.x.toFixed(4)} 亿m³</span></p>
                    <p className="text-gw-muted">地下水占比: <span className="text-emerald-400">{d.y.toFixed(1)}%</span></p>
                    <p className="text-gw-muted">降水量: <span className="text-blue-400">{d.size ? (d.size * 10).toFixed(0) : '-'} mm</span></p>
                  </div>);
                }} />
                <Scatter data={scatterData} fill="#06b6d4" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </LazyChartCard>

          {radarData.length > 0 && (
            <LazyChartCard title={`用水结构多维对比（Top${Math.min(countyData.length, 8)}县）`} badge="归一化0-100">
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  {countyData.slice(0, Math.min(countyData.length, 8)).map((c: CountyDataItem, i: number) => (
                    <Radar key={i} name={c.name} dataKey={c.name} stroke={CHART_COLORS[i]} fill={CHART_COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip title="多维对比" />} />
                </RadarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          )}
        </div>

        {countyData.filter((c: CountyDataItem) => (c.precip ?? 0) > 0 && (c.totalUse ?? 0) > 0).length > 2 && (() => {
          const quadrantData: QuadrantDataPoint[] = countyData.filter((c: CountyDataItem) => (c.precip ?? 0) > 0 && (c.totalUse ?? 0) > 0).map((c: CountyDataItem) => ({
            name: c.name, precip: c.precip ?? 0, gwRatio: (c.totalUse ?? 0) > 0 ? Math.round(((c.gwUse ?? 0) / (c.totalUse ?? 0)) * 100) : 0, totalUse: c.totalUse ?? 0,
          }));
          if (quadrantData.length < 3) return null;
          const avgPrecip = quadrantData.reduce((s: number, d: QuadrantDataPoint) => s + d.precip, 0) / quadrantData.length;
          const avgGw = quadrantData.reduce((s: number, d: QuadrantDataPoint) => s + d.gwRatio, 0) / quadrantData.length;
          return (
            <TechCard title="降水-地下水依赖度象限分析" badge="四象限分类" className="scan-line">
              <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#ef4444' }}></span>高水高依赖(关注)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#f59e0b' }}></span>高水低依赖</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#8b5cf6' }}></span>低水高依赖(危机)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#10b981' }}></span>低水低依赖(理想)</span>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="precip" name="降水量" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '降水量(mm)', fill: '#94a3b8', fontSize: 10, position: 'insideBottom' }} />
                  <YAxis type="number" dataKey="gwRatio" name="地下水占比" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} label={{ value: '地下水占比(%)', fill: '#94a3b8', fontSize: 10, angle: -90, position: 'insideLeft' }} />
                  <ZAxis type="number" dataKey="totalUse" range={[20, 200]} />
                  <Tooltip content={({ active, payload }: any) => {
                    if (!active || !payload?.[0]) return null;
                    const d = payload[0].payload;
                    const q = d.precip >= avgPrecip ? (d.gwRatio >= avgGw ? '高水高依赖' : '高水低依赖') : (d.gwRatio >= avgGw ? '低水高依赖' : '低水低依赖');
                    return (<div className="bg-gw-card border border-gw-border rounded-lg p-3 text-xs shadow-xl">
                      <p className="font-bold text-gw-text">{d.name}</p>
                      <p className="text-gw-muted">降水: <span className="text-blue-400">{d.precip} mm</span></p>
                      <p className="text-gw-muted">地下水占比: <span className="text-emerald-400">{d.gwRatio}%</span></p>
                      <p className="text-[9px] mt-1" style={{ color: q.includes('高依赖') ? '#ef4444' : q.includes('低依赖') ? '#10b981' : '#f59e0b' }}>{q} | 总用水: {d.totalUse.toFixed(4)} 亿m³</p>
                    </div>);
                  }} />
                  <ReferenceLine x={avgPrecip} stroke="#6b7280" strokeDasharray="5 3" strokeOpacity={0.4} />
                  <ReferenceLine y={avgGw} stroke="#6b7280" strokeDasharray="5 3" strokeOpacity={0.4} />
                  {quadrantData.map((d: QuadrantDataPoint) => {
                    const color = d.precip >= avgPrecip ? (d.gwRatio >= avgGw ? '#ef4444' : '#f59e0b') : (d.gwRatio >= avgGw ? '#8b5cf6' : '#10b981');
                    return <Scatter key={d.name} data={[d]} fill={color} fillOpacity={0.7} />;
                  })}
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-gw-muted/60 mt-2 text-center">虚线=平均值 | 气泡大小=总用水量 | 红色象限需重点关注（降水多但仍高度依赖地下水）</p>
            </TechCard>
          );
        })()}

        {supplyPieData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="全市用水部门构成" badge="县级数据汇总">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={supplyPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(1)}%`} labelLine={{ stroke: '#6b7280' }}>
                    {supplyPieData.map((_: PieDataItem, i: number) => (<Cell key={i} fill={USE_COLORS[i]} />))}
                  </Pie>
                  <Tooltip content={<ChartTooltip title="用水构成" unit="亿m³" />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>

            {currentCity.reservoirs && currentCity.reservoirs.length > 0 && (
              <TechCard title="大中型水库蓄水动态" badge={`${currentCity.reservoirs.length}座`}>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={currentCity.reservoirs.map((r: ReservoirData) => ({ name: r.name, 年末蓄水: r.yearEndStorage ?? 0, 变化: r.change ?? 0 }))} margin={{ top: 5, right: 15, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <Tooltip content={<ChartTooltip title="水库蓄水" unit="亿m³" />} />
                    <Legend />
                    <Bar dataKey="年末蓄水" name="年末蓄水" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Line dataKey="变化" name="年变幅" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </TechCard>
            )}
          </div>
        )}

        {currentCity.countyGroundwater && currentCity.countyGroundwater.length > 0 && (
          <SectionWithFold title="各县地下水位埋深变幅" badge={`${currentCity.countyGroundwater.length}县 · 2023-2024`} defaultOpen={true}>
            <ResponsiveContainer width="100%" height={Math.max(300, currentCity.countyGroundwater.length * 36)}>
              <BarChart data={currentCity.countyGroundwater.map((c: CountyGroundwaterData) => ({ name: c.name, 变化: c.change ?? 0, '2024年埋深': c.depth2024 ?? 0, '2023年埋深': c.depth2023 ?? 0 }))} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#94a3b8' }} label={{ value: 'm', position: 'insideBottom', fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="city" tick={{ fill: '#94a3b8', fontSize: 10 }} width={75} />
                <Tooltip content={<ChartTooltip title="地下水位" unit="m" />} />
                <Legend />
                <Bar dataKey="变化" name="水位回升" radius={[0, 4, 4, 0]}>
                  {currentCity.countyGroundwater.map((c: CountyGroundwaterData, i: number) => (<Cell key={i} fill={(c.change ?? 0) >= 0 ? '#10b981' : '#ef4444'} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3">
              <InfoGrid items={[
                { label: '最大回升', value: `${currentCity.countyGroundwater.reduce((max: number, c: CountyGroundwaterData) => Math.max(max, c.change ?? 0), 0).toFixed(2)} m`, highlight: true },
                { label: '平均埋深', value: `${(currentCity.countyGroundwater.reduce((s: number, c: CountyGroundwaterData) => s + (c.depth2024 ?? 0), 0) / currentCity.countyGroundwater.length).toFixed(2)} m` },
                { label: '最深县', value: `${[...currentCity.countyGroundwater].sort((a: CountyGroundwaterData, b: CountyGroundwaterData) => (b.depth2024 ?? 0) - (a.depth2024 ?? 0))[0]?.name}（${[...currentCity.countyGroundwater].sort((a: CountyGroundwaterData, b: CountyGroundwaterData) => (b.depth2024 ?? 0) - (a.depth2024 ?? 0))[0]?.depth2024}m）` },
                { label: '回升最大', value: `${[...currentCity.countyGroundwater].sort((a: CountyGroundwaterData, b: CountyGroundwaterData) => (b.change ?? 0) - (a.change ?? 0))[0]?.name}（+${[...currentCity.countyGroundwater].sort((a: CountyGroundwaterData, b: CountyGroundwaterData) => (b.change ?? 0) - (a.change ?? 0))[0]?.change}m）` },
              ]} />
            </div>
          </SectionWithFold>
        )}

        <TechCard title="县级数据明细" badge={`${countyData.length}个区县 · 点击表头排序`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gw-border/50">
                  {[{ key: 'name', label: '区县' }, { key: 'precip', label: '降水(mm)' }, { key: 'totalUse', label: '总用水(亿m³)' }, { key: 'gwUse', label: '地下水(亿m³)' }, { key: 'gwRatio', label: '地下水占比' }, { key: 'agri', label: '农业(亿m³)' }, { key: 'industry', label: '工业(亿m³)' }, { key: 'domestic', label: '生活(亿m³)' }, { key: 'eco', label: '生态(亿m³)' }].map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)} className="py-2 px-2 text-left text-gw-muted cursor-pointer hover:text-gw-text whitespace-nowrap">
                      <span className="flex items-center gap-1">{col.label}<SortIcon field={col.key} sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countyData.map((c: CountyDataItem, _i: number) => (
                  <tr key={c.name} className="border-b border-gw-border/20 hover:bg-gw-surface/30 transition-colors">
                    <td className="py-1.5 px-2 font-medium text-gw-text">{c.name}</td>
                    <td className="py-1.5 px-2 text-gw-muted">{c.precip != null ? c.precip : '-'}</td>
                    <td className="py-1.5 px-2 text-blue-400">{(c.totalUse ?? 0).toFixed(4)}</td>
                    <td className="py-1.5 px-2 text-cyan-400">{(c.gwUse ?? 0).toFixed(4)}</td>
                    <td className="py-1.5 px-2"><ProgressBadge value={c.gwRatio ?? 0} max={100} size="sm" color={(c.gwRatio ?? 0) > 80 ? '#ef4444' : (c.gwRatio ?? 0) > 60 ? '#f59e0b' : '#10b981'} /></td>
                    <td className="py-1.5 px-2 text-amber-400">{(c.agri ?? 0).toFixed(4)}</td>
                    <td className="py-1.5 px-2 text-red-400">{(c.industry ?? 0).toFixed(4)}</td>
                    <td className="py-1.5 px-2 text-blue-400">{(c.domestic ?? 0).toFixed(4)}</td>
                    <td className="py-1.5 px-2 text-emerald-400">{(c.eco ?? 0).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>

        <DataSourceNote source="2024年各市水资源公报" version="v3.5" />
      </>)}
    </div>
  );
}
