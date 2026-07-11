import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend,
} from 'recharts';
import {
  Layers, MapPin, Mountain,
} from 'lucide-react';
import { TechCard, ChartTooltip, StatCard } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { SPATIAL_DATA, ZONE_DEFS, type CitySpatialPoint } from './spatialData';

/** Tab 2: 分区特征分析 */
export function ZoneAnalysisTab() {
  // 分区汇总统计
  const zoneSummary = useMemo(() =>
    Object.entries(ZONE_DEFS).map(([zone, def]) => {
      const cities = SPATIAL_DATA.filter(d => def.cities.includes(d.city));
      return {
        zone,
        '城市数': cities.length,
        '平均埋深(m)': +(cities.reduce((s, d) => s + d.waterLevel, 0) / cities.length).toFixed(1),
        '平均水质': +(cities.reduce((s, d) => s + d.quality, 0) / cities.length).toFixed(1),
        '总开采(亿m3)': +(cities.reduce((s, d) => s + d.extraction, 0)).toFixed(1),
        '平均沉降(mm/a)': +(cities.reduce((s, d) => s + d.subsidence, 0) / cities.length).toFixed(1),
        '平均梯度': +(cities.reduce((s, d) => s + d.gradient, 0) / cities.length).toFixed(1),
      };
    }),
  []);

  // 分区雷达图数据
  const radarData = useMemo(() => {
    const metrics = ['平均埋深', '平均水质', '总开采', '平均沉降', '平均梯度'];
    const normalize = (val: number, max: number) => Math.round((val / max) * 100);
    return metrics.map(metric => {
      const vals: Record<string, number> = {};
      for (const [zone, def] of Object.entries(ZONE_DEFS)) {
        const cities = SPATIAL_DATA.filter(d => def.cities.includes(d.city));
        const avg = cities.reduce((s: number, d: CitySpatialPoint) => {
          if (metric === '平均埋深') return s + d.waterLevel;
          if (metric === '平均水质') return s + d.quality;
          if (metric === '总开采') return s + d.extraction;
          if (metric === '平均沉降') return s + d.subsidence;
          return s + d.gradient;
        }, 0) / cities.length;
        vals[zone] = avg;
      }
      const maxVal = Math.max(...Object.values(vals));
      return { metric, ...Object.fromEntries(Object.entries(vals).map(([z, v]) => [z, normalize(v, maxVal)])) };
    });
  }, []);

  // 分区堆叠柱状图
  const _zoneStackData = useMemo(() =>
    Object.entries(ZONE_DEFS).map(([zone, def]) => {
      const entry: Record<string, string | number> = { zone };
      SPATIAL_DATA.filter(d => def.cities.includes(d.city)).forEach(d => {
        entry[d.city] = d.extraction;
      });
      return entry;
    }),
  []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="山前平原" value="4" unit="市" icon={MapPin} subtitle="开采核心区" accent="emerald" />
        <StatCard title="中部平原" value="2" unit="市" icon={MapPin} subtitle="过渡带" accent="amber" />
        <StatCard title="滨海平原" value="3" unit="市" icon={MapPin} subtitle="地热丰富" accent="blue" />
        <StatCard title="山区" value="2" unit="市" icon={Mountain} subtitle="水质优良" accent="violet" />
        <StatCard title="区域差异" value="2.1x" unit="倍" icon={Layers} subtitle="山前vs山区水质" accent="red" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 分区雷达图 */}
        <LazyChartCard title="四大分区综合特征雷达" badge="归一化" height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              {Object.entries(ZONE_DEFS).map(([zone, def]) => (
                <Radar key={zone} name={zone} dataKey={zone} stroke={def.color} fill={def.color} fillOpacity={0.12} />
              ))}
              <Tooltip content={<ChartTooltip title="分区雷达" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* 分区统计表 */}
        <TechCard title="分区汇总统计" badge="11市">
          <FilterableTechTable
            headers={['分区', '城市数', '平均埋深(m)', '平均水质', '总开采(亿m3)', '平均沉降(mm/a)', '平均梯度(C/100m)']}
            rows={zoneSummary.map(z => [z.zone, z['城市数'], z['平均埋深(m)'], z['平均水质'], z['总开采(亿m3)'], z['平均沉降(mm/a)'], z['平均梯度']])}
            filterPlaceholder="搜索分区..."
          />
        </TechCard>
      </div>

      {/* 分区详情卡片 */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(ZONE_DEFS).map(([zone, def]) => {
          const cities = SPATIAL_DATA.filter(d => def.cities.includes(d.city));
          const avgWl = (cities.reduce((s, d) => s + d.waterLevel, 0) / cities.length).toFixed(1);
          const avgQ = (cities.reduce((s, d) => s + d.quality, 0) / cities.length).toFixed(1);
          const avgSub = (cities.reduce((s, d) => s + d.subsidence, 0) / cities.length).toFixed(1);
          return (
            <TechCard key={zone} title={zone} badge={def.cities.length + '市'}>
              <div className="p-3 bg-gw-surface/50 rounded-lg border" style={{ borderColor: def.color + '40' }}>
                <p className="text-xs text-gw-muted">{def.desc}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-[9px] text-gw-muted">平均埋深</div>
                    <div className="text-sm font-bold" style={{ color: def.color }}>{avgWl}m</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-gw-muted">平均水质</div>
                    <div className="text-sm font-bold" style={{ color: def.color }}>{avgQ}类</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-gw-muted">平均沉降</div>
                    <div className="text-sm font-bold" style={{ color: def.color }}>{avgSub}mm/a</div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gw-cyan">包含城市: {def.cities.join('、')}</p>
              </div>
            </TechCard>
          );
        })}
      </div>
    </div>
  );
}
