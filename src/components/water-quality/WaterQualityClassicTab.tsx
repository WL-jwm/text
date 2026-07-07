import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, MapPin, Shield, AlertTriangle } from 'lucide-react';
import { resistivityMineralization, citySupplyHydrogeology } from '../../data/hydrogeologyReference';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';

export function WaterQualityClassicTab() {
  // 城市开采量柱图
  const extractionData = React.useMemo(() =>
    [...citySupplyHydrogeology]
      .sort((a: any, b: any) => parseFloat(b.extraction) - parseFloat(a.extraction))
      .map((c: any) => ({ name: c.city, 开采量: parseFloat(c.extraction) || 0 })),
    []
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="电性层分级" value={String(resistivityMineralization.length)} unit="级" icon={BookOpen} accent="blue" subtitle="视电阻率-矿化度" />
        <StatCard title="城市供水" value={String(citySupplyHydrogeology.length)} unit="市" icon={MapPin} accent="cyan" subtitle="水文地质条件" />
        <StatCard title="淡水阈值" value="<1.2" unit="g/L" icon={Shield} accent="green" />
        <StatCard title="咸水上限" value=">5" unit="g/L" icon={AlertTriangle} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="主要城市地下水开采量对比" badge="万m³/d" className="scan-line" height={320}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={extractionData} filename="城市开采量对比" sheetName="开采量" formats={['xlsx','csv','json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={extractionData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} unit="万m³/d" />
              <YAxis dataKey="name" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={50} />
              <Tooltip content={<ChartTooltip title="开采量" unit="万m³/d" />} />
              <Bar dataKey="开采量" name="开采量" fill="#06b6d4" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="视电阻率与矿化度分级" badge="5级" className="hud-corners" height={320}>
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted flex-wrap">
            {resistivityMineralization.map((r: any, i: number) => (
              <span key={i} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  r.waterType.includes('淡') ? 'bg-emerald-400' :
                  r.waterType.includes('微') ? 'bg-cyan-400' :
                  r.waterType.includes('半') ? 'bg-amber-400' :
                  'bg-red-400'
                }`} />
                {r.waterType}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            {resistivityMineralization.map((r: any, i: number) => {
              const maxResistivity = Math.max(...resistivityMineralization.map((x: any) => {
                const v = x.resistivity.replace(/[~>]/g, '').split('-').pop();
                return parseFloat(v) || 100;
              }));
              const val = parseFloat(r.resistivity.replace(/[~>]/g, '').split('-').pop() || '0');
              const pct = Math.min(100, (val / maxResistivity) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gw-text w-16">{r.waterType}</span>
                  <div className="flex-1 h-5 rounded bg-gw-surface/60 relative overflow-hidden">
                    <div className="h-full rounded transition-all duration-500" style={{
                      width: `${pct}%`,
                      background: r.waterType.includes('淡') ? 'linear-gradient(90deg, #10b981, #34d399)' :
                        r.waterType.includes('微') ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' :
                        r.waterType.includes('半') ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                        'linear-gradient(90deg, #ef4444, #f87171)',
                    }} />
                  </div>
                  <span className="text-[10px] font-mono text-gw-muted w-24 text-right">ρs {r.resistivity} Ω·m</span>
                  <span className="text-[10px] font-mono text-gw-highlight w-20 text-right">M {r.mineralization} g/L</span>
                </div>
              );
            })}
          </div>
        </LazyChartCard>
      </div>

      <TechCard title="视电阻率与地下水矿化度判别标准" icon={BookOpen}>
        <p className="text-[10px] text-gw-muted mb-3">
          物探视电阻率(Ω·m)与地下水矿化度(g/L)的对应关系，用于水质快速判别
        </p>
        <div className="space-y-2">
          {resistivityMineralization.map((r: any, i: number) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
              r.waterType.includes('淡') ? 'bg-emerald-500/5 border-emerald-500/15' :
              r.waterType.includes('微') ? 'bg-cyan-500/5 border-cyan-500/15' :
              r.waterType.includes('半') ? 'bg-amber-500/5 border-amber-500/15' :
              r.waterType.includes('咸') && !r.waterType.includes('高') ? 'bg-orange-500/5 border-orange-500/15' :
              'bg-red-500/5 border-red-500/15'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gw-text">{r.waterType}</span>
                <span className="text-[10px] text-gw-muted">ρs <span className="font-mono">{r.resistivity}</span> Ω·m</span>
              </div>
              <span className="text-xs font-mono text-gw-highlight">M {r.mineralization} g/L</span>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="主要城市供水水质基础条件" icon={MapPin}>
        <p className="text-[10px] text-gw-muted mb-3">1980年代前城市地下水开采与含水层条件概述</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {citySupplyHydrogeology.map((c: any, i: number) => (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gw-text">{c.city}</span>
                <span className="text-xs font-mono text-gw-highlight">{c.extraction}万m³/d</span>
              </div>
              <p className="text-[10px] text-gw-muted leading-relaxed">{c.aquifer}</p>
            </div>
          ))}
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 物探参数+城市供水" version="经典参数" />
    </div>
  );
}
