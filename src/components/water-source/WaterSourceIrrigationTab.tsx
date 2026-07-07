import React from 'react';
import { Droplets, Waves, MapPin, Activity } from 'lucide-react';
import { largeIrrigationDistricts, mediumIrrigationByRegion } from '../../data/hydrogeologyHistorical';
import { TechCard, StatCard, DataSourceNote } from '../UI';

export function WaterSourceIrrigationTab() {
  const totalMedium = mediumIrrigationByRegion.reduce((s, r) => s + r.count, 0);
  const totalDesignArea = parseFloat(
    largeIrrigationDistricts.reduce((s, d) => s + parseFloat(d.designArea || '0'), 0).toFixed(0)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="大型灌区" value={String(largeIrrigationDistricts.length)} unit="处" icon={Droplets} accent="blue" />
        <StatCard title="中型灌区" value={String(totalMedium)} unit="处" icon={Waves} accent="cyan" />
        <StatCard title="覆盖地市" value={String(mediumIrrigationByRegion.length)} unit="个" icon={MapPin} accent="green" />
        <StatCard title="设计面积" value={String(totalDesignArea)} unit="万亩" icon={Activity} accent="amber" />
      </div>

      <TechCard title="大型灌区一览" icon={Droplets}>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">灌区名称</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">水源</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">设计流量(m³/s)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">实际流量(m³/s)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">设计面积(万亩)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">实际面积(万亩)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">效率</th>
              </tr>
            </thead>
            <tbody>
              {largeIrrigationDistricts.map((d, i) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text font-medium">{d.name}</td>
                  <td className="px-2 py-1 text-gw-text">{d.waterSource}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{d.designFlow}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{d.actualFlow}</td>
                  <td className="px-2 py-1 font-mono text-gw-cyan">{d.designArea}</td>
                  <td className="px-2 py-1 font-mono text-gw-cyan">{d.actualArea}</td>
                  <td className="px-2 py-1 font-mono">{d.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="中型灌区分地区统计" icon={MapPin}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">地区</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">数量(处)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">设计流量(m³/s)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">实际流量(m³/s)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">设计面积(万亩)</th>
              </tr>
            </thead>
            <tbody>
              {mediumIrrigationByRegion.map((r, i) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text font-medium">{r.region}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{r.count}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{r.designFlow}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{r.actualFlow}</td>
                  <td className="px-2 py-1 font-mono text-gw-cyan">{r.designArea}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 大中型灌区数据" version="历史数据" />
    </div>
  );
}
