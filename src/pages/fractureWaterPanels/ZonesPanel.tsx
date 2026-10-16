/**
 * 面板（拆分自 FractureWater.tsx）
 */
import React, { useMemo } from 'react';
import { useToast } from '../../components/Toast';
import { ChartExport } from '../../components/ChartExport';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartTooltip, TechCard } from '../../components/UI';
import { fractureWaterZones } from '../../data/fractureWater';
import { exportDataCSV } from '../../utils/exportUtils';
import { Gauge, MapPin } from 'lucide-react';
import { Bar, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export function ZonesPanel() {
  const { success } = useToast();
  const zoneYieldData = useMemo(() =>
    fractureWaterZones.map(z => ({
      name: z.zone,
      出水量: parseInt(String(z.avgYield).split('~').pop() || '0'),
    })),
    []
  );
  return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="分区出水量对比" icon={Gauge} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={zoneYieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <ChartTooltip unit="m³/d" />
                  <Bar dataKey="出水量" fill="var(--gw-cyan, #06b6d4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <LazyChartCard title="分区面积对比" icon={MapPin} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={fractureWaterZones.map(z => ({
                  name: z.zone,
                  面积: parseInt(String(z.area).replace(/[^0-9]/g, '')) || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <ChartTooltip unit="km²" />
                  <Bar dataKey="面积" fill="var(--gw-blue, #3b82f6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="富水性分区详情" icon={MapPin}>
              <div className="mb-3 flex justify-end">
                <ChartExport data={fractureWaterZones} filename="fracture-water-zones" sheetName="富水性分区" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable
              filterPlaceholder="搜索分区..."
              headers={['分区', '岩性', '裂隙类型', '富水性', '平均出水量(m³/d)', '面积', '代表区域', '主要用途']}
              rows={fractureWaterZones.map(z => [z.zone, z.rockType, z.fractureType, z.richness, `${z.avgYield}${z.yieldUnit}`, z.area, z.representative, z.mainUse])}
              pageSize={10}
            />
          </TechCard>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { exportDataCSV(fractureWaterZones as Record<string, unknown>[], 'fracture-water-zones'); success('数据已导出'); }}
              className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
              导出数据
            </button>
          </div>
        </div>
  );
}
