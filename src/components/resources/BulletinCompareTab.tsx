import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Legend } from 'recharts';
import { TechCard, StatCard, ChartTooltip, SortableTechTable, CHART_COLORS } from '../UI';
import type { BulletinCompareItem, BulletinTableRow, CityBulletinBrief, CountyDataItem } from '../../types/county';

interface BulletinCompareTabProps {
  bulletinCompareData: BulletinCompareItem[];
  bulletinTableData: BulletinTableRow[];
  bulletinSortCol: number | null;
  bulletinSortDir: 'asc' | 'desc';
  handleBulletinSort: (col: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bulletinData: any[];
}

export function BulletinCompareTab({
  bulletinCompareData, bulletinTableData,
  bulletinSortCol, bulletinSortDir, handleBulletinSort,
  bulletinData,
}: BulletinCompareTabProps) {
  const citiesWithCounties = bulletinData.filter(b => b.counties && b.counties.length > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="覆盖行政区" value={bulletinData.length} unit="个" accent="blue" subtitle={`${citiesWithCounties.length}个含县级数据`} />
        <StatCard title="县级数据总量" value={citiesWithCounties.reduce((s, b) => s + (b.counties?.length ?? 0), 0)} unit="个区县" accent="cyan" subtitle="覆盖5个地级市" />
        <StatCard title="全省降水总量" value={bulletinData.reduce((s, b) => s + (b.precipTotal ?? 0), 0).toFixed(1)} unit="亿m³" accent="blue" />
        <StatCard title="全省水资源总量" value={bulletinData.reduce((s, b) => s + b.totalWater, 0).toFixed(1)} unit="亿m³" accent="emerald" />
      </div>

      <TechCard title="各市水资源量对比" badge="按总量降序">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={bulletinCompareData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: '#9ca3af' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <ChartTooltip unit="亿m³" />
            <Legend />
            <Bar dataKey="地表水" name="地表水" fill="#3b82f6" stackId="r" />
            <Bar dataKey="地下水" name="地下水" fill="#10b981" stackId="r" />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="各市年降水量" badge="mm">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={[...bulletinCompareData].sort((a, b) => b.降水量 - a.降水量)} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: '#9ca3af' }} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <ChartTooltip unit="mm" />
              <Bar dataKey="降水量" name="降水量" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                {bulletinCompareData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard title="各市地下水供水占比" badge="供水结构">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={bulletinCompareData.filter((d: BulletinCompareItem) => d.总供水 > 0).map((d: BulletinCompareItem) => ({
              name: d.name,
              地下水供水: d.地下水供水,
              其他供水: d.总供水 - d.地下水供水,
              占比: d.总供水 > 0 ? (d.地下水供水 / d.总供水 * 100) : 0,
            })).sort((a, b) => b.占比 - a.占比)} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: '#9ca3af' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <ChartTooltip unit="亿m³" />
              <Legend />
              <Bar dataKey="地下水供水" name="地下水供水" fill="#06b6d4" stackId="g" />
              <Bar dataKey="其他供水" name="其他供水" fill="#374151" stackId="g" />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard title="各市公报数据对比表" badge={`${bulletinData.length}市 · 点击表头排序`}>
        <SortableTechTable
          headers={['城市', '降水(mm)', '地表水(亿m³)', '地下水(亿m³)', '总量(亿m³)', '供水(亿m³)', '地下水占比(%)', '浅层埋深(m)', '变化(m)', '县级数']}
          rows={bulletinTableData.map((r: BulletinTableRow) => [
            r.name,
            r.降水.toFixed(1),
            r.地表水.toFixed(2),
            r.地下水.toFixed(2),
            r.总量.toFixed(2),
            r.供水 > 0 ? r.供水.toFixed(2) : '-',
            r.供水 > 0 ? r.地下水供水比.toFixed(1) : '-',
            r.浅层埋深 > 0 ? r.浅层埋深.toFixed(2) : '-',
            r.浅层变化 !== 0 ? (r.浅层变化 > 0 ? `+${r.浅层变化.toFixed(2)}` : r.浅层变化.toFixed(2)) : '-',
            r.县级数据 > 0 ? `${r.县级数据}` : '-',
          ])}
          sortColumn={bulletinSortCol}
          sortDirection={bulletinSortDir}
          onSort={handleBulletinSort}
          highlightColumn={bulletinSortCol ?? undefined}
        />
      </TechCard>

      <TechCard title="县级数据可用性矩阵" badge="14市 · 数据状态一目了然" className="scan-line">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border/30">
                <th className="text-left py-1.5 px-2 text-gw-muted font-medium">城市</th>
                <th className="text-center py-1.5 px-2 text-gw-muted font-medium">县区数</th>
                <th className="text-center py-1.5 px-2 text-gw-muted font-medium">有数据</th>
                <th className="text-center py-1.5 px-2 text-gw-muted font-medium">完整度</th>
                <th className="text-left py-1.5 px-2 text-gw-muted font-medium">降水</th>
                <th className="text-left py-1.5 px-2 text-gw-muted font-medium">用水</th>
                <th className="text-left py-1.5 px-2 text-gw-muted font-medium">供水</th>
                <th className="text-left py-1.5 px-2 text-gw-muted font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {(bulletinData as CityBulletinBrief[]).map((city: CityBulletinBrief) => {
                const counties = city.counties as CountyDataItem[] | undefined;
                const hasCounties = counties != null && counties.length > 0;
                const total = hasCounties ? counties!.length : 0;
                const withData = hasCounties ? counties!.filter((c: CountyDataItem) => c.precip != null).length : 0;
                const hasUse = hasCounties ? counties!.filter((c: CountyDataItem) => (c.totalUse ?? 0) > 0).length : 0;
                const hasSupply = hasCounties ? counties!.filter((c: CountyDataItem) => (c.gwUse ?? 0) > 0 || (c.industry ?? 0) > 0).length : 0;
                const pct = total > 0 ? Math.round((withData / total) * 100) : 0;
                const statusColor = !hasCounties ? '#6b7280' : pct === 100 ? '#10b981' : withData > 0 ? '#f59e0b' : '#6b7280';
                const statusLabel = !hasCounties ? '无counties' : pct === 100 ? '完整' : withData > 0 ? '部分' : '骨架';
                return (
                  <tr key={city.city} className="border-b border-gw-border/15 hover:bg-gw-surface/30 transition-colors">
                    <td className="py-1.5 px-2 text-gw-text font-medium">{city.city}</td>
                    <td className="py-1.5 px-2 text-center text-gw-text">{total || '-'}</td>
                    <td className="py-1.5 px-2 text-center font-mono" style={{color: withData > 0 ? '#10b981' : '#6b7280'}}>{withData || '-'}</td>
                    <td className="py-1.5 px-2 text-center">
                      {total > 0 ? (
                        <div className="flex items-center gap-1.5 justify-center">
                          <div className="w-12 h-1.5 rounded-full bg-gw-bg/80 overflow-hidden">
                            <div className="h-full rounded-full" style={{width: `${pct}%`, backgroundColor: statusColor}} />
                          </div>
                          <span className="font-mono text-[10px]" style={{color: statusColor}}>{pct}%</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-1.5 px-2">{withData > 0 ? <span className="text-emerald-400">{'●'.repeat(Math.min(3, Math.ceil(withData/5)))}</span> : <span className="text-gw-muted">-</span>}</td>
                    <td className="py-1.5 px-2">{hasUse > 0 ? <span className="text-blue-400">{'●'.repeat(Math.min(3, Math.ceil(hasUse/5)))}</span> : <span className="text-gw-muted">-</span>}</td>
                    <td className="py-1.5 px-2">{hasSupply > 0 ? <span className="text-cyan-400">{'●'.repeat(Math.min(3, Math.ceil(hasSupply/5)))}</span> : <span className="text-gw-muted">-</span>}</td>
                    <td className="py-1.5 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{backgroundColor: statusColor + '15', color: statusColor}}>{statusLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-gw-muted/60 mt-2 text-center">●密度表示数据丰富度（1=少量 3=丰富）| 完整度 = 有降水数据的县占比</p>
      </TechCard>
    </div>
  );
}
