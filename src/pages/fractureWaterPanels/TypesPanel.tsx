/**
 * 面板（拆分自 FractureWater.tsx）
 */
import React, { useMemo } from 'react';
import { useToast } from '../../components/Toast';
import { ChartExport } from '../../components/ChartExport';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartTooltip, TechCard, CHART_COLORS } from '../../components/UI';
import { fractureWaterTypes } from '../../data/fractureWater';
import { exportDataCSV } from '../../utils/exportUtils';
import { Crosshair, Layers } from 'lucide-react';
import { Radar, ResponsiveContainer, PolarRadiusAxis, PolarGrid, Cell, Legend, PolarAngleAxis, Pie, RadarChart, PieChart } from 'recharts';

export function TypesPanel() {
  const { success } = useToast();
  const typePieData = useMemo(() =>
    fractureWaterTypes.map(t => ({ name: t.type, value: parseInt(String(t.proportion).replace(/[^0-9]/g, '')) || 0 })),
    []
  );
  return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="裂隙水类型分布" icon={Layers} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={typePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name.length > 8 ? name.substring(0, 8) + '..' : name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false} stroke="none">
                    {typePieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <LazyChartCard title="类型特征对比" icon={Crosshair} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={fractureWaterTypes.map(t => ({
                  type: t.type.length > 8 ? t.type.substring(0, 8) : t.type,
                  比例: parseInt(String(t.proportion).replace(/[^0-9]/g, '')) || 0,
                  出水量上限: parseInt(String(t.yield).split('~').pop() || '0'),
                }))}>
                  <PolarGrid stroke="var(--gw-border, #1a2d4d)" />
                  <PolarAngleAxis dataKey="type" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                  <Radar name="比例(%)" dataKey="比例" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Radar name="出水量上限(m³/d)" dataKey="出水量上限" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
                  <ChartTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="类型详细特征" icon={Layers}>
              <div className="mb-3 flex justify-end">
                <ChartExport data={fractureWaterTypes} filename="fracture-water-types" sheetName="裂隙水类型" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable
              filterPlaceholder="搜索裂隙水类型..."
              headers={['类型', '分布', '深度(m)', '出水量(m³/d)', '水质', '占比', '富水性']}
              rows={fractureWaterTypes.map(t => [t.type, t.distribution, `${t.depth}${t.depthUnit}`, `${t.yield}${t.yieldUnit}`, t.waterQuality, t.proportion, t.richness])}
              pageSize={10}
            />
          </TechCard>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { exportDataCSV(fractureWaterTypes as Record<string, unknown>[], 'fracture-water-types'); success('数据已导出'); }}
              className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
              导出数据
            </button>
          </div>
        </div>
  );
}
