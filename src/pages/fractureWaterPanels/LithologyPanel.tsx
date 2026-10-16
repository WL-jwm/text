/**
 * 面板（拆分自 FractureWater.tsx）
 */
import React, { useMemo } from 'react';
import { useToast } from '../../components/Toast';
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartTooltip, TechCard, DataSourceNote, TechTable } from '../../components/UI';
import { fractureWaterYieldByLithology, fractureExplorationMethods } from '../../data/fractureWater';
import { exportDataCSV } from '../../utils/exportUtils';
import { Gauge, Search } from 'lucide-react';
import { Radar, Bar, ResponsiveContainer, PolarRadiusAxis, PolarGrid, Legend, BarChart, PolarAngleAxis, CartesianGrid, RadarChart, XAxis, YAxis } from 'recharts';

export function LithologyPanel() {
  const { success } = useToast();
  const methodRadarData = useMemo(() =>
    fractureExplorationMethods.map(m => ({
      method: m.method,
      成本: { '极低': 5, '低': 3, '中': 2, '高': 1 }[m.cost] || 3,
      精度: { '中等': 2, '中高': 3, '高': 4, '极高': 5 }[m.accuracy] || 3,
    })),
    []
  );
  return (
        <div className="space-y-4">
          {fractureWaterYieldByLithology && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LazyChartCard title="岩性与出水量关系" icon={Gauge} height={280}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={fractureWaterYieldByLithology.map(l => ({
                    name: l.lithology ? l.lithology.substring(0, 8) : '-',
                    出水量: l.fractureYield || 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                    <ChartTooltip unit="m³/d" />
                    <Bar dataKey="出水量" fill="var(--gw-amber, #f59e0b)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </LazyChartCard>
            </div>
          )}

          <LazyChartCard title="勘查方法对比" icon={Search} height={280}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={methodRadarData}>
                <PolarGrid stroke="var(--gw-border, #1a2d4d)" />
                <PolarAngleAxis dataKey="method" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} domain={[0, 6]} />
                <Radar name="成本" dataKey="成本" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Radar name="精度" dataKey="精度" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
                <ChartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <TechCard title="勘查方法详情" icon={Search}>
            <TechTable
              headers={['方法', '说明', '成本', '精度', '适用比例尺']}
              rows={fractureExplorationMethods.map(m => [m.method, m.description, m.cost, m.accuracy, m.suitableScale])}
              pageSize={10}
            />
          </TechCard>

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { exportDataCSV(fractureExplorationMethods as Record<string, unknown>[], 'fracture-exploration-methods'); success('数据已导出'); }}
              className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
              导出数据
            </button>
          </div>

          <DataSourceNote source="1999年《河北省地下水资源评价》" version="裂隙水勘查" />
        </div>
  );
}
