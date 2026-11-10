/**
 * 拆分自 MineralWater.tsx — 天然热泉与矿泉资源经典参考区块
 */

import { BookOpen, TrendingUp, Gauge, Compass, Beaker } from 'lucide-react';
import { SectionTitle, StatCard, TechCard } from '../../components/UI';
import { hotSpringData } from '../../data/hydrogeologyReference';

export function HotSpringSection() {
  return (
    <>
  <SectionTitle icon={BookOpen} badge="经典参考">天然热泉与矿泉资源</SectionTitle>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <StatCard title="热泉点" value={String(hotSpringData.summary.totalPoints)} unit="处" icon={BookOpen} accent="blue" />
    <StatCard title="≥37°C" value={String(hotSpringData.summary.above37C)} unit="处" icon={TrendingUp} accent="cyan" />
    <StatCard title="≥42°C" value={String(hotSpringData.summary.above42C)} unit="处" icon={Gauge} accent="green" />
    <StatCard title="最高温度" value={String(hotSpringData.summary.maxTemp)} unit="°C" icon={Compass} accent="amber" subtitle={hotSpringData.summary.maxLocation} />
  </div>

  <TechCard title={`天然热泉调查（${hotSpringData.summary.totalPoints}处）`} icon={BookOpen}>
    <p className="text-[10px] text-gw-muted mb-3">
      数据来源：《河北省水文地质工程地质》（1980年代前调查），水温单位°C，流量单位m³/h
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {hotSpringData.hotSprings.map((hs, i) => (
        <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gw-text">{hs.name}</span>
            <span className="text-xs font-mono text-gw-highlight">
              {hs.temp ? `${hs.temp}°C` : '-'} / {hs.flow} m³/h
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gw-muted">{hs.location}</span>
            {hs.type && <span className="text-gw-cyan">{hs.type}</span>}
          </div>
        </div>
      ))}
    </div>
  </TechCard>

  <TechCard title="水化学类型与流量特征" icon={Beaker}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3 bg-gw-surface/50 rounded-lg">
        <p className="text-[10px] text-gw-muted mb-1">主要水化学类型</p>
        <p className="text-xs text-gw-text">{hotSpringData.summary.hydrochemType}</p>
      </div>
      <div className="p-3 bg-gw-surface/50 rounded-lg">
        <p className="text-[10px] text-gw-muted mb-1">常见流量范围</p>
        <p className="text-xs text-gw-text">{hotSpringData.summary.commonFlow}</p>
      </div>
    </div>
  </TechCard>
    </>
  );
}
