import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';
import { Database, Compass, Gauge } from 'lucide-react';
import { karstWaterChemistry } from '../../data/karstWater';
import { TechCard, ChartTooltip, CHART_COLORS, DataSourceNote } from '../UI';
import { TechTable } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

interface Props {
  chemScatterData: any[];
  waterTypePie: any[];
}

export function KarstChemistryTab({ chemScatterData, waterTypePie }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="TDS - pH 关系" badge={`${chemScatterData.length} 组数据`} icon={Database} height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="pH" name="pH" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} domain={[6.5, 8.5]} />
              <YAxis dataKey="TDS" name="TDS(g/L)" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <ZAxis dataKey="hardness" range={[40, 200]} />
              <ChartTooltip unit="g/L" />
              <Scatter data={chemScatterData} name="分区水化学">
                {chemScatterData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gw-muted/50 text-center mt-1">气泡大小 = 硬度(mg/L)</p>
        </LazyChartCard>

        <LazyChartCard title="水化学类型分布" icon={Compass} height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={waterTypePie} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                {waterTypePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="各分区水化学特征" icon={Gauge}>
          <TechTable
            title={`${karstWaterChemistry.length} 个分区`}
            headers={['分区', '水类型', 'TDS(g/L)', '硬度(mg/L)', 'pH', '水温(°C)', '特征']}
            rows={karstWaterChemistry.map(c => [c.zone, c.waterType, c.tds, c.hardness, c.pH, c.temperature, c.features])}
          />
        </TechCard>

        <LazyChartCard title="硬度与TDS对比" icon={Gauge} height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={karstWaterChemistry.map(c => ({
              name: c.zone,
              TDS: parseFloat(String(c.tds).split('~').pop() || '0'),
              硬度: parseFloat(String(c.hardness).split('~').pop() || '0'),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <ChartTooltip unit="mg/L" />
              <Bar dataKey="TDS" fill="var(--gw-cyan, #06b6d4)" name="TDS" radius={[4, 4, 0, 0]} />
              <Bar dataKey="硬度" fill="var(--gw-amber, #f59e0b)" name="硬度" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <DataSourceNote source="1999年《河北省地下水》" version="岩溶水专题" />
    </div>
  );
}
