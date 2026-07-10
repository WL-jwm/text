// 各市水资源丰缺综合评估面板
// 提取自 Overview.tsx Phase 6b 拆分 (B-14)

import React from 'react';
import { TechCard } from '../components/UI';
import { cityBulletin2024 } from '../data/resources';
import type { CountyDataItem } from '../types/county';

export interface WaterPressureCityData {
  name: string;
  pressureIndex: number;
  avgPrecip: number;
  totalUse: number;
  countyCount: number;
  pressureLevel: string;
  pressureColor: string;
}

export function computeCityPressure(): WaterPressureCityData[] {
  const cities = cityBulletin2024.filter(
    (c) => c.counties && (c.counties as CountyDataItem[]).some(
      (ct: CountyDataItem) => ct.precip != null && (ct.totalUse ?? 0) > 0
    )
  );
  return cities.map((c) => {
    const counties = (c.counties as CountyDataItem[]).filter(
      (ct: CountyDataItem) => ct.precip != null && (ct.totalUse ?? 0) > 0
    );
    const avgPrecip = counties.reduce((s: number, ct: CountyDataItem) => s + (ct.precip ?? 0), 0) / counties.length;
    const totalUse = counties.reduce((s: number, ct: CountyDataItem) => s + (ct.totalUse ?? 0), 0);
    const pressureIndex = avgPrecip > 0 ? Math.round(totalUse / avgPrecip * 1000) / 10 : 0;
    const pressureLevel = pressureIndex > 15 ? '极缺水' : pressureIndex > 10 ? '缺水' : pressureIndex > 6 ? '一般' : '丰水';
    const pressureColor = pressureIndex > 15 ? '#ef4444' : pressureIndex > 10 ? '#f59e0b' : pressureIndex > 6 ? '#3b82f6' : '#10b981';
    return { name: c.city, pressureIndex, avgPrecip: Math.round(avgPrecip), totalUse: Math.round(totalUse * 10000) / 10000, countyCount: counties.length, pressureLevel, pressureColor };
  }).sort((a, b) => b.pressureIndex - a.pressureIndex);
}

export interface OverviewWaterPressureProps {
  dataCounties: number;
}

export function OverviewWaterPressure({ dataCounties }: OverviewWaterPressureProps) {
  if (dataCounties <= 10) return null;

  const cityPressure = computeCityPressure();
  const avgPressure = cityPressure.length > 0
    ? Math.round(cityPressure.reduce((s, c) => s + c.pressureIndex, 0) / cityPressure.length * 10) / 10
    : 0;
  const avgPressureLevel = avgPressure > 15 ? '极缺水' : avgPressure > 10 ? '缺水' : avgPressure > 6 ? '一般' : '丰水';

  return (
    <TechCard title="各市水资源丰缺评估" badge={`${cityPressure.length}市 · 用水/降水压力指数`} className="scan-line">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gw-border/50">
                  <th className="text-left py-1.5 px-2 text-gw-muted">排名</th>
                  <th className="text-left py-1.5 px-2 text-gw-muted">城市</th>
                  <th className="text-center py-1.5 px-2 text-gw-muted">压力指数</th>
                  <th className="text-center py-1.5 px-2 text-gw-muted">平均降水</th>
                  <th className="text-center py-1.5 px-2 text-gw-muted">总用水</th>
                  <th className="text-center py-1.5 px-2 text-gw-muted">县数</th>
                  <th className="text-center py-1.5 px-2 text-gw-muted">评估</th>
                </tr>
              </thead>
              <tbody>
                {cityPressure.map((c, i: number) => (
                  <tr key={c.name} className="border-b border-gw-border/15 hover:bg-gw-surface/30 transition-colors">
                    <td className="py-1.5 px-2 text-gw-muted">{i + 1}</td>
                    <td className="py-1.5 px-2 text-gw-text font-medium">{c.name}</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-10 h-1.5 rounded-full bg-gw-bg/80 overflow-hidden">
                          <div className="h-full rounded-full" style={{width: `${Math.min(100, c.pressureIndex * 5)}%`, backgroundColor: c.pressureColor}} />
                        </div>
                        <span className="font-mono text-[10px]" style={{color: c.pressureColor}}>{c.pressureIndex}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center text-blue-400">{c.avgPrecip}</td>
                    <td className="py-1.5 px-2 text-center text-cyan-400">{c.totalUse}</td>
                    <td className="py-1.5 px-2 text-center text-gw-muted">{c.countyCount}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{backgroundColor: c.pressureColor + '15', color: c.pressureColor}}>
                        {c.pressureLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-gw-bg/50 border border-gw-border/20 text-center">
            <p className="text-[10px] text-gw-muted mb-1">全省平均压力指数</p>
            <p className="text-3xl font-mono font-bold" style={{color: avgPressure > 15 ? '#ef4444' : avgPressure > 10 ? '#f59e0b' : avgPressure > 6 ? '#3b82f6' : '#10b981'}}>
              {avgPressure}
            </p>
            <p className="text-sm text-gw-muted mt-1">{avgPressureLevel}</p>
            <p className="text-[9px] text-gw-muted/50 mt-2">压力指数 = 用水总量 / 平均降水 × 调整系数</p>
          </div>
          <div className="p-3 rounded-lg space-y-1.5 text-[10px]">
            <p className="text-gw-muted font-medium mb-1">评估标准</p>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-gw-muted">{'< 6.0  丰水'}</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-gw-muted">6.0~10.0  一般</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-gw-muted">10.0~15.0  缺水</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-gw-muted">{'> 15.0  极缺水'}</span></div>
          </div>
        </div>
      </div>
    </TechCard>
  );
}
