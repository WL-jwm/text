/**
 * 拆分自 SystemZoning.tsx — 一级分区 Tab 面板
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { systemZones, subZones } from '../../data/systemZoning';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartExport } from '../../components/ChartExport';

export function ZonesTab() {

  const activeZones = useMemo(() => systemZones.filter(z => z.area > 0), []);
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
  return (
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
  );
}
