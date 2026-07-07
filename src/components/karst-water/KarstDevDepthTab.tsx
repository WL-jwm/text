import React from 'react';
import { Layers, ArrowUpRight, ArrowDownRight, Timer } from 'lucide-react';
import { karstDevelopmentDepth } from '../../data/karstWater';
import { StatCard, TechCard, DataSourceNote } from '../UI';

export function KarstDevDepthTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="岩溶发育分区" value={String(karstDevelopmentDepth.length)} unit="个" icon={Layers} accent="blue" />
        <StatCard title="浅层深度" value="0~80" unit="m" icon={ArrowUpRight} accent="cyan" />
        <StatCard title="深层深度" value="120~400" unit="m" icon={ArrowDownRight} accent="green" />
        <StatCard title="侵蚀基准面" value="250~500" unit="m" icon={Timer} accent="amber" />
      </div>

      <TechCard title="岩溶发育深度分区" icon={Layers}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">分区</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">浅层</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">中层</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">深层</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">底界</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">特征</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">典型泉域</th>
            </tr></thead>
            <tbody>
              {karstDevelopmentDepth.map((d, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="px-2 py-1.5 text-xs font-medium text-gw-text">{d.zone}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-cyan">{d.shallow}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{d.moderate}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{d.deep}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-muted">{d.base}</td>
                  <td className="px-2 py-1.5 text-xs text-gw-muted">{d.feature}</td>
                  <td className="px-2 py-1.5 text-xs text-gw-highlight">{d.typical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 岩溶发育深度分区" version="岩溶参数" />
    </div>
  );
}
