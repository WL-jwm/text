import React from 'react';
import { BookOpen, Droplets, TrendingUp, AlertTriangle } from 'lucide-react';
import { resistivityMineralization } from '../../data/hydrochemistry';
import { lithologyResistivity, plainResistivityZones } from '../../data/hydrogeologyHistorical';
import { StatCard, TechCard, DataSourceNote } from '../UI';

export function HydrochemGeophysicalTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="电性层分区" value={String(resistivityMineralization.length)} unit="级" icon={BookOpen} accent="blue" />
        <StatCard title="淡水下限" value="<1.2" unit="g/L" icon={Droplets} accent="cyan" />
        <StatCard title="微咸水区间" value="1.2~2" unit="g/L" icon={TrendingUp} accent="green" />
        <StatCard title="高矿化咸水" value=">5" unit="g/L" icon={AlertTriangle} accent="red" />
      </div>

      <TechCard title="视电阻率与地下水矿化度关系" icon={BookOpen}>
        <p className="text-[10px] text-gw-muted mb-3">物探视电阻率(Ω·m)与地下水矿化度(g/L)对应关系，用于含水层水质快速判别</p>
        <div className="space-y-2">
          {resistivityMineralization.map((r: typeof resistivityMineralization[number], i: number) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
              r.waterType.includes('淡') ? 'bg-emerald-500/5 border-emerald-500/15' :
              r.waterType.includes('微') ? 'bg-cyan-500/5 border-cyan-500/15' :
              r.waterType.includes('半') ? 'bg-amber-500/5 border-amber-500/15' :
              r.waterType.includes('咸') && !r.waterType.includes('高') ? 'bg-orange-500/5 border-orange-500/15' :
              'bg-red-500/5 border-red-500/15'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  r.waterType.includes('淡') ? 'bg-emerald-500/20 text-emerald-400' :
                  r.waterType.includes('微') ? 'bg-cyan-500/20 text-cyan-400' :
                  r.waterType.includes('半') ? 'bg-amber-500/20 text-amber-400' :
                  r.waterType.includes('咸') && !r.waterType.includes('高') ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>{r.waterType}</span>
                <span className="text-xs text-gw-text">ρs {r.resistivity} Ω·m</span>
              </div>
              <span className="text-xs font-mono text-gw-highlight">M {r.mineralization} g/L</span>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="岩性视电阻率参考值" badge="岩性">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">视电阻率(Ω·m)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">备注</th>
            </tr></thead>
            <tbody>
              {lithologyResistivity.map((l: typeof lithologyResistivity[number], i: number) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text font-medium">{l.lithology}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{l.resistivity}</td>
                  <td className="px-2 py-1 text-gw-muted">{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="平原区视电阻率分区" badge="分区">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">水文分区</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">砂(Ω·m)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">粉砂(Ω·m)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">粉质粘土(Ω·m)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">粘土(Ω·m)</th>
            </tr></thead>
            <tbody>
              {plainResistivityZones.map((z: typeof plainResistivityZones[number], i: number) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text font-medium">{z.hydroZone}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{z.sand}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{z.siltySand}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{z.siltyClay}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{z.clay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 物探电性层与矿化度对应关系" version="物探参数" />
    </div>
  );
}
