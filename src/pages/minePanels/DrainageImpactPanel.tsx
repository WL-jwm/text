/**
 * 面板（拆分自 MineHydrogeology.tsx）
 */
import { DataSourceNote, StatCard, SectionTitle, TechCard } from '../../components/UI';
import { rockCompressiveStrength, getReservoirSummary, reservoirEngineeringData } from '../../data/hydrogeologyReference';
import { mineComplexityStandard, mineDrainageImpact } from '../../data/mineHydrogeology';
import { AlertTriangle, Layers, Gauge, BookOpen, Droplets, Mountain } from 'lucide-react';

export function DrainageImpactPanel() {
  return (
    <>
      <SectionTitle icon={AlertTriangle} badge="影响评估" >排水环境影响与复杂度分级</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="矿区排水环境影响矩阵" className="scan-line">
          <div className="space-y-1.5">
            {mineDrainageImpact.map((d: typeof mineDrainageImpact[number], i: number) => (
              <div key={i} className={`p-2 rounded-lg border ${d.severity === '严重' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/15'}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-gw-text">{d.impact}</span>
                  <span className={`text-[9px] px-1.5 rounded font-medium ${d.severity === '严重' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {d.severity}
                  </span>
                </div>
                <p className="text-[9px] text-gw-muted/70 leading-relaxed">{d.description}</p>
                <div className="flex items-center justify-between mt-1 text-[9px]">
                  <span className="text-gw-muted">{d.affectedArea}</span>
                  <span className="text-emerald-400">{d.recoveryStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </TechCard>

        <TechCard title="矿床水文地质复杂度分级标准" className="hud-corners">
          <div className="space-y-2">
            {mineComplexityStandard.map((s: typeof mineComplexityStandard[number], i: number) => (
              <div key={i} className={`p-2.5 rounded-lg border ${s.color === 'green' ? 'bg-emerald-500/10 border-emerald-500/15' : s.color === 'blue' ? 'bg-blue-500/10 border-blue-500/15' : s.color === 'amber' ? 'bg-amber-500/10 border-amber-500/15' : 'bg-red-500/10 border-red-500/15'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${s.color === 'green' ? 'text-emerald-400' : s.color === 'blue' ? 'text-blue-400' : s.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.level}
                  </span>
                  <span className="text-[9px] text-gw-muted bg-gw-surface/50 px-1.5 py-0.5 rounded">
                    充水层: {s.waterFillingLayers}
                  </span>
                </div>
                <p className="text-[9px] text-gw-muted/80">{s.criteria}</p>
                <p className="text-[8px] text-gw-muted/50 mt-0.5">勘探要求: {s.explorationRequirement}</p>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <DataSourceNote source="1999基础文献 | 第十四章 矿床水文地质特征" version="v3.0" />

      <SectionTitle icon={BookOpen} badge="经典参考">水库坝基工程地质</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard title="大型水库" value={String(reservoirEngineeringData.length)} unit="座" icon={Layers} accent="blue" />
        <StatCard title="总库容" value={getReservoirSummary().totalCapacity.toFixed(1)} unit="亿m³" icon={Droplets} accent="cyan" />
        <StatCard title="总流域面积" value={(getReservoirSummary().totalCatchArea / 10000).toFixed(1)} unit="万km²" icon={Mountain} accent="green" />
        <StatCard title="坝基强度" value={String(rockCompressiveStrength.length)} unit="组" icon={Gauge} accent="amber" />
      </div>

      <TechCard title="大型水库坝基工程地质条件" icon={BookOpen}>
        <p className="text-[10px] text-gw-muted mb-3">
          河北省主要水库坝型、坝基岩性及主要工程地质问题
        </p>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">水库</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">位置</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">河流</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">坝型</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">库容(亿m³)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">坝基</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">主要地质问题</th>
              </tr>
            </thead>
            <tbody>
              {reservoirEngineeringData.map((r, i) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-2 py-1 text-gw-text text-[10px]">{r.location}</td>
                  <td className="px-2 py-1 text-gw-text">{r.river}</td>
                  <td className="px-2 py-1 text-gw-text text-[10px]">{r.damType}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{r.capacity}</td>
                  <td className="px-2 py-1 text-gw-text text-[10px]">{r.foundation}</td>
                  <td className="px-2 py-1 text-gw-muted text-[10px] max-w-[180px]">{r.geoIssue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </>

  );
}