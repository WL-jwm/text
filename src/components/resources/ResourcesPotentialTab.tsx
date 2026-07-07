import React from 'react';
import { Droplets, TrendingDown, MapPin, AlertTriangle } from 'lucide-react';
import { cityExploitationPotential, cityGroundwaterPollution, pollutantDetectionRates } from '../../data/groundwaterResources';
import { TechCard, StatCard } from '../UI';

export function ResourcesPotentialTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="评价城市" value={String(cityExploitationPotential.length)} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="总资源量" value={String(cityExploitationPotential.reduce((s, c) => s + c.resource, 0).toFixed(1))} unit="亿m³/a" icon={Droplets} accent="cyan" />
        <StatCard title="总开采量" value={String(cityExploitationPotential.reduce((s, c) => s + c.extraction2000, 0).toFixed(1))} unit="亿m³/a" icon={TrendingDown} accent="red" />
        <StatCard title="超采城市" value={String(cityExploitationPotential.filter(c => c.overdraft > 0).length)} unit="个" icon={AlertTriangle} accent="amber" />
      </div>

      <TechCard title="各市地下水开采潜力评价" badge="1991-2000">
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-1.5">城市</th>
                <th className="text-gw-muted py-1 px-1.5">面积(km²)</th>
                <th className="text-gw-muted py-1 px-1.5">资源量</th>
                <th className="text-gw-muted py-1 px-1.5">2000年开采</th>
                <th className="text-gw-muted py-1 px-1.5">潜力指数</th>
                <th className="text-gw-muted py-1 px-1.5">盈余(万m³/d)</th>
                <th className="text-gw-muted py-1 px-1.5">超采(万m³/d)</th>
                <th className="text-left text-gw-muted py-1 px-1.5">评价</th>
              </tr>
            </thead>
            <tbody>
              {cityExploitationPotential.map((c, i) => (
                <tr key={i} className={'border-b border-gw-border/20 ' + (c.overdraft > 0 ? 'bg-red-500/5' : 'bg-emerald-500/5')}>
                  <td className="py-1 px-1.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1 px-1.5 font-mono">{c.area}</td>
                  <td className="py-1 px-1.5 font-mono text-blue-400">{c.resource.toFixed(2)}</td>
                  <td className="py-1 px-1.5 font-mono text-red-400">{c.extraction2000.toFixed(2)}</td>
                  <td className="py-1 px-1.5 font-mono">{c.potentialIndex.toFixed(2)}</td>
                  <td className={'py-1 px-1.5 font-mono ' + (c.surplus > 0 ? 'text-emerald-400' : 'text-gw-muted')}>{c.surplus.toFixed(2)}</td>
                  <td className={'py-1 px-1.5 font-mono ' + (c.overdraft > 0 ? 'text-red-400' : 'text-gw-muted')}>{c.overdraft.toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-[9px] text-gw-muted">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="地下水污染现状" badge="1991-2000">
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-1.5">城市</th>
                <th className="text-gw-muted py-1 px-1.5">未污染</th>
                <th className="text-gw-muted py-1 px-1.5">轻污染</th>
                <th className="text-gw-muted py-1 px-1.5">中污染</th>
                <th className="text-gw-muted py-1 px-1.5">重污染</th>
                <th className="text-gw-muted py-1 px-1.5">严重污染</th>
                <th className="text-left text-gw-muted py-1 px-1.5">主要污染物</th>
                <th className="text-left text-gw-muted py-1 px-1.5">趋势</th>
              </tr>
            </thead>
            <tbody>
              {cityGroundwaterPollution.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1 px-1.5 font-mono text-emerald-400">{c.unpol.toFixed(1)}</td>
                  <td className="py-1 px-1.5 font-mono text-amber-400">{c.light.toFixed(1)}</td>
                  <td className="py-1 px-1.5 font-mono text-orange-400">{c.moderate.toFixed(1)}</td>
                  <td className="py-1 px-1.5 font-mono text-red-400">{c.heavy.toFixed(1)}</td>
                  <td className="py-1 px-1.5 font-mono text-red-500">{c.severe.toFixed(1)}</td>
                  <td className="py-1 px-1.5 text-[9px] text-gw-muted">{c.mainPollutants}</td>
                  <td className="py-1 px-1.5">
                    <span className={'px-1 py-0.5 rounded text-[8px] ' + (c.trend === '减缓' ? 'bg-emerald-500/15 text-emerald-400' : c.trend === '变差' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400')}>{c.trend}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="主要污染物检出率与超标率" badge="%">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pollutantDetectionRates.map((p, i) => (
            <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gw-text">{p.pollutant}</span>
                <span className="text-[9px] text-gw-muted">超标率 {p.exceedance}%</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-[8px] text-gw-muted mb-0.5">
                    <span>检出率</span>
                    <span>{p.detection}%</span>
                  </div>
                  <div className="h-1.5 bg-gw-border/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: p.detection + '%'}} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[8px] text-gw-muted mb-0.5">
                    <span>超标率</span>
                    <span>{p.exceedance}%</span>
                  </div>
                  <div className="h-1.5 bg-gw-border/30 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{width: p.exceedance + '%'}} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
