/**
 * 拆分自 SystemZoning.tsx — 经典分区 Tab 面板
 */

import { Layers, GitBranch, BookOpen, Database } from 'lucide-react';
import { hydrogeoZones, getHydrogeoSummary, stratigraphyLayers, rockEngineeringGroups } from '../../data/hydrogeologyReference';
import { TechCard, StatCard, DataSourceNote } from '../../components/UI';

export function ClassicTab() {
  return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="水文地质大区" value={String(hydrogeoZones.length)} unit="个" icon={BookOpen} accent="blue" />
            <StatCard title="亚区总数" value={String(getHydrogeoSummary().totalSubZones)} unit="个" icon={Layers} accent="cyan" />
            <StatCard title="地层系统" value={String(stratigraphyLayers.length)} unit="层" icon={GitBranch} accent="green" />
            <StatCard title="岩石分组" value={String(rockEngineeringGroups.length)} unit="类" icon={Database} accent="amber" />
          </div>

          <TechCard title="经典水文地质分区体系" icon={BookOpen}>
            <p className="text-[10px] text-gw-muted mb-3">
              《河北省水文地质工程地质》中的水文地质大区-亚区两级分区体系
            </p>
            <div className="space-y-3">
              {hydrogeoZones.map((zone, i) => (
                <div key={i} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400">{zone.zoneId}</span>
                    <span className="text-sm font-medium text-gw-text">{zone.zoneName}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {zone.subZones.map((sz, j) => (
                      <div key={j} className="flex items-center gap-2 text-[10px]">
                        <span className="font-mono text-gw-cyan">{sz.subId}</span>
                        <span className="text-gw-text">{sz.name}</span>
                        <span className="px-1 rounded bg-gw-surface text-gw-muted">{sz.waterType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="地层岩性系统概览" icon={GitBranch}>
            <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gw-surface z-10">
                  <tr className="border-b border-gw-border">
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">界</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">系</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">统</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">代号</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">厚度(m)</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">主要岩性</th>
                  </tr>
                </thead>
                <tbody>
                  {stratigraphyLayers.map((sl, i) => (
                    <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                      <td className="px-2 py-1 text-gw-text whitespace-nowrap">{sl.era}</td>
                      <td className="px-2 py-1 text-gw-text whitespace-nowrap">{sl.system}</td>
                      <td className="px-2 py-1 text-gw-text text-[10px] whitespace-nowrap">{sl.series}</td>
                      <td className="px-2 py-1 font-mono text-gw-highlight">{sl.code}</td>
                      <td className="px-2 py-1 font-mono text-gw-text">{sl.thickness || '-'}</td>
                      <td className="px-2 py-1 text-gw-muted text-[10px] max-w-[200px]">{sl.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <DataSourceNote source="《河北省水文地质工程地质》| 水文地质分区+地层系统" version="经典分区" />
        </div>
  );
}
