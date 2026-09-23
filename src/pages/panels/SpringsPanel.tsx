/**
 * SpringsPanel — 泉水数据库面板（自 HydrogeologyHistorical.tsx 拆分）
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Search } from 'lucide-react';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { VirtualizedTable } from '../../components/VirtualizedTable';
import { historicalSprings, springStatsByRegion } from '../../data/hydrogeologyHistorical';
import type { HistoricalSpring } from '../../data/hydrogeologyHistorical';
import { REGION_COLORS } from './hydrogeologyConstants';

interface SpringsPanelProps {
  filteredSprings: HistoricalSpring[];
  springFlowData: { name: string; flow: number; region: string }[];
  springSearch: string;
  springRegion: string;
  onSearchChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onToggleExpand: (id: number) => void;
}

export function SpringsPanel({ filteredSprings, springFlowData, springSearch, springRegion, onSearchChange, onRegionChange, onToggleExpand }: SpringsPanelProps) {
  return (
        <div className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {springStatsByRegion.map(r => (
              <div key={r.region} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/30 text-center">
                <p className="text-[10px] text-gw-muted">{r.region}</p>
                <p className="text-lg font-bold" style={{ color: REGION_COLORS[r.region] || '#3b82f6' }}>{r.count}</p>
                <p className="text-[9px] text-gw-muted">处泉水</p>
              </div>
            ))}
          </div>

          {/* 流量Top30柱图 */}
          <LazyChartCard title="泉水流量排名（Top 30）" className="scan-line" height={300}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={springFlowData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={90} />
                <Tooltip content={<ChartTooltip unit="m³/h" title="流量" />} />
                <Bar dataKey="flow" fill="#3b82f6" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          {/* 搜索过滤 */}
          <TechCard title="泉水数据库" badge={`${filteredSprings.length}/${historicalSprings.length}`}>
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted" />
                <input type="text" value={springSearch} onChange={e => onSearchChange(e.target.value)}
                  placeholder="搜索泉水位置/地质条件..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gw-surface border border-gw-border/40 text-xs text-gw-text placeholder:text-gw-muted/50 focus:outline-none focus:border-gw-blue/50" />
              </div>
              <select value={springRegion} onChange={e => onRegionChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-gw-surface border border-gw-border/40 text-xs text-gw-text focus:outline-none focus:border-gw-blue/50">
                <option value="全部">全部地区</option>
                {springStatsByRegion.map(r => <option key={r.region} value={r.region}>{r.region}({r.count})</option>)}
              </select>
            </div>
            <VirtualizedTable
              rows={filteredSprings}
              rowHeight={32}
              maxHeight={500}
              rowKey={(s) => String(s.id)}
              renderHeader={() => (
                <thead className="sticky top-0 bg-gw-card z-10"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5 w-8">#</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">位置</th>
                  <th className="text-gw-muted py-1.5 px-1.5">流量(m³/h)</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">出露条件</th>
                  <th className="text-gw-muted py-1.5 px-1.5 w-12">地区</th>
                </tr></thead>
              )}
              renderRow={(s) => (
                <tr className="border-b border-gw-border/20 data-row cursor-pointer"
                  onClick={() => onToggleExpand(s.id)}>
                  <td className="py-1.5 px-1.5 text-gw-muted font-mono text-[10px]">{s.id}</td>
                  <td className="py-1.5 px-1.5 font-medium text-gw-text">{s.location}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{s.flow}</td>
                  <td className="py-1.5 px-1.5 text-gw-muted text-[10px]">{s.geology}</td>
                  <td className="py-1.5 px-1.5">
                    <span className="px-1 py-0.5 rounded text-[9px] text-white"
                      style={{ backgroundColor: REGION_COLORS[s.region] || '#3b82f6' }}>{s.region}</span>
                  </td>
                </tr>
              )}
            />
          </TechCard>
        </div>
  );
}
