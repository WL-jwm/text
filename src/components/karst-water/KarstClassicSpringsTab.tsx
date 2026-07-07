import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, MapPin, Compass, Gauge } from 'lucide-react';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../UI';

interface SpringItem { region: string; location: string; flow: string; geology: string }
interface RegionItem { name: string; value: number }
interface GeologyItem { name: string; value: number }

interface Props {
  classicKarstSprings: SpringItem[];
  karstSpringRegionData: RegionItem[];
  karstSpringGeologyData: GeologyItem[];
}

export function KarstClassicSpringsTab({ classicKarstSprings, karstSpringRegionData, karstSpringGeologyData }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="经典岩溶泉" value={classicKarstSprings.length} unit="处" icon={BookOpen} accent="blue" />
        <StatCard title="覆盖地区" value={karstSpringRegionData.length} unit="个" icon={MapPin} accent="cyan" />
        <StatCard title="主要岩性" value={karstSpringGeologyData.length} unit="类" icon={Compass} accent="green" />
        <StatCard title="最大流量" value={classicKarstSprings.length > 0 ? Math.max(...classicKarstSprings.map(s => parseFloat(String(s.flow).split('~').pop() || '0'))) : 0} unit="L/s" icon={Gauge} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="岩溶泉地区分布" icon={MapPin}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={karstSpringRegionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="var(--gw-blue, #3b82f6)" radius={[0, 4, 4, 0]} name="泉数" />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard title="出露地层统计(Top10)" icon={Compass}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={karstSpringGeologyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="var(--gw-cyan, #06b6d4)" radius={[4, 4, 0, 0]} name="泉数" />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard title={`经典岩溶泉数据库（${classicKarstSprings.length}处）`} icon={BookOpen}>
        <p className="text-[10px] text-gw-muted mb-3">
          数据来源：《河北省水文地质工程地质》（1980年代前基准调查），流量单位L/s，含水温标注的为温泉
        </p>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">地区</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">位置</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">流量(L/s)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">出露地层</th>
              </tr>
            </thead>
            <tbody>
              {classicKarstSprings.map((s, i) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text whitespace-nowrap">{s.region}</td>
                  <td className="px-2 py-1 text-gw-text">{s.location}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{s.flow}</td>
                  <td className="px-2 py-1 text-gw-muted text-[10px]">{s.geology}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》（682页）泉水数据库OCR识别" version="经典岩溶泉" />
    </div>
  );
}
