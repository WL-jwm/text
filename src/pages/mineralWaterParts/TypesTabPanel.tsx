/**
 * 拆分自 MineralWater.tsx — 水质类型面板（雷达 / 类型详情表 / 矿化度-SiO2 / 锶含量）
 */

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import { Gauge, Beaker, Compass } from 'lucide-react';
import { TechCard, TechTable, ChartTooltip, DataSourceNote } from '../../components/UI';
import { mineralWaterSites, mineralWaterTypes } from '../../data/mineralWater';
import { LazyChartCard } from '../../components/LazyChartCard';
import { CrossLinkPanel } from '../../components/CrossLink';

export function TypesTabPanel() {
  // 各类型特征雷达
  const typeRadarData = useMemo(() => [
    { type: '偏硅酸型', 达标率: 100, 代表产地数: 8, 平均SiO2: 38, 矿化度均值: 65 },
    { type: '复合型', 达标率: 100, 代表产地数: 4, 平均SiO2: 39, 矿化度均值: 79 },
    { type: '锶型', 达标率: 100, 代表产地数: 2, 平均SiO2: 25, 矿化度均值: 76 },
  ], []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各类型特征对比" icon={Gauge} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={typeRadarData}>
              <PolarGrid stroke="var(--gw-border, #1a2d4d)" />
              <PolarAngleAxis dataKey="type" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
              <Radar name="达标率" dataKey="达标率" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="代表产地数" dataKey="代表产地数" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
              <ChartTooltip />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="类型特征详情" icon={Beaker}>
          <TechTable
            title={`${mineralWaterTypes.length} 种类型`}
            headers={['类型', '产地数', '占比', '达标限值', '特征']}
            rows={mineralWaterTypes.map(t => [t.type, String(t.count), t.proportion, t.threshold, t.features])}
          />
        </TechCard>

        <LazyChartCard title="矿化度-SiO₂关系" icon={Compass} height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mineralWaterSites.map(s => ({
              name: s.name.length > 5 ? s.name.substring(0, 5) : s.name,
              矿化度: parseFloat(s.mineralization) || 0,
              SiO2: parseFloat(s.siO2) || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
              <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <ChartTooltip unit="mg/L" />
              <Bar dataKey="矿化度" fill="var(--gw-cyan, #06b6d4)" name="矿化度(g/L)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="SiO2" fill="var(--gw-green, #10b981)" name="SiO₂(mg/L)" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各产地锶含量" icon={Beaker} height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mineralWaterSites.filter(s => parseFloat(s.strontium) > 0).map(s => ({
              name: s.name.length > 6 ? s.name.substring(0, 6) : s.name,
              锶: parseFloat(s.strontium) || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
              <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <ChartTooltip unit="mg/L" />
              <Bar dataKey="锶" fill="var(--gw-amber, #f59e0b)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>      <CrossLinkPanel currentPath="/mineral-water" />
  <DataSourceNote source="GB 8537-2018 + 2024年监测数据" version="矿泉水水质" />
    </div>
  );
}
