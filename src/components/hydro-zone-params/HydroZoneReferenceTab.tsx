import React from 'react';
import { TechCard } from '../UI';
import type { PermeabilityKValueItem, AquiferYieldRateItem, ThicknessYieldItem, RegionalParamItem } from '../../types/hydrogeologyReference';
import { permeabilityKValues, aquiferYieldRates, specificYieldInfiltration, aquiferParameters, deepWaterParameters } from '../../data/hydrogeologyReference';

export function HydroZoneReferenceTab() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-[10px] text-amber-300">经典参考数据来源于《河北省水文地质工程地质》（1980s），为历史基准参数值，不反映当前地下水动态状态。</p>
      </div>

      {/* 含水层参数详表 */}
      <TechCard title="典型含水层水文地质参数" badge={String(aquiferParameters.length) + '条'}>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-2">位置</th>
              <th className="text-left text-gw-muted py-1.5 px-2">岩性</th>
              <th className="text-gw-muted py-1.5 px-2">厚度(m)</th>
              <th className="text-gw-muted py-1.5 px-2">单位涌水量</th>
              <th className="text-gw-muted py-1.5 px-2">埋深(m)</th>
              <th className="text-gw-muted py-1.5 px-2">来源</th>
            </tr></thead>
            <tbody>
              {aquiferParameters.map((a, i) => (
                <tr key={i} className="border-b border-gw-border/20 hover:bg-gw-surface/50">
                  <td className="py-1 px-2 text-gw-text">{a.area}</td>
                  <td className="py-1 px-2">{a.lithology}</td>
                  <td className="py-1 px-2 font-mono text-gw-cyan">{a.thickness || '-'}</td>
                  <td className="py-1 px-2 font-mono">{a.unitYield}</td>
                  <td className="py-1 px-2 font-mono">{a.depth || '-'}</td>
                  <td className="py-1 px-2 text-gw-muted">{a.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      {/* 渗透系数K值分区表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['aquiferI', 'aquiferII', 'aquiferIII'] as const).map(aqKey => {
          const aq = permeabilityKValues[aqKey];
          if (!aq) return null;
          return (
            <TechCard key={aqKey} title={aq.label + ' K值分区'} badge="表112">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1 px-1.5">岩性</th>
                    <th className="text-gw-muted py-1 px-1.5">山前(m/d)</th>
                    <th className="text-gw-muted py-1 px-1.5">中部(m/d)</th>
                    <th className="text-gw-muted py-1 px-1.5">东部(m/d)</th>
                  </tr></thead>
                  <tbody>
                    {aq.data.map((d: PermeabilityKValueItem, i: number) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1 px-1.5 text-gw-text">{d.lithology}</td>
                        <td className="py-1 px-1.5 font-mono text-gw-cyan">{d.front}</td>
                        <td className="py-1 px-1.5 font-mono">{d.middle}</td>
                        <td className="py-1 px-1.5 font-mono">{d.east}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          );
        })}
      </div>

      {/* 含水层出水率 + 给水度入渗系数 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard title="含水层出水率（山前全淡水区）" badge="表100">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-1.5">岩性</th>
                <th className="text-gw-muted py-1 px-1.5">I组(m³/h·m)</th>
                <th className="text-gw-muted py-1 px-1.5">II组(m³/h·m)</th>
              </tr></thead>
              <tbody>
                {aquiferYieldRates.aquiferI.freshFull.map((d: AquiferYieldRateItem, i: number) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1 px-1.5 text-gw-text">{d.lithology}</td>
                    <td className="py-1 px-1.5 font-mono text-gw-cyan">{d.min}~{d.max}</td>
                    <td className="py-1 px-1.5 font-mono">{aquiferYieldRates.aquiferII?.freshFull?.[i] ? `${aquiferYieldRates.aquiferII.freshFull[i].min}~${aquiferYieldRates.aquiferII.freshFull[i].max}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>

        <TechCard title="给水度与入渗系数" badge="表101/102/113">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-medium text-gw-text mb-1">出水率与厚度关系（表101）</p>
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1 px-1">&lt;5m</th>
                  <th className="text-gw-muted py-1 px-1">5-10m</th>
                  <th className="text-gw-muted py-1 px-1">&gt;10m</th>
                </tr></thead>
                <tbody>
                  {specificYieldInfiltration.thicknessYield.map((d: ThicknessYieldItem, i: number) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1 px-1 text-gw-text">{d.lithology}</td>
                      <td className="py-1 px-1 font-mono text-gw-cyan">{d.t1}</td>
                      <td className="py-1 px-1 font-mono">{d.t2}</td>
                      <td className="py-1 px-1 font-mono">{d.t3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gw-text mb-1">分区参数（南皮县，表113）</p>
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1 px-1">分区</th>
                  <th className="text-gw-muted py-1 px-1">给水度u</th>
                  <th className="text-gw-muted py-1 px-1">入渗系数a</th>
                </tr></thead>
                <tbody>
                  {specificYieldInfiltration.regionalParams.map((d: RegionalParamItem, i: number) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1 px-1 text-gw-text">{d.zone}</td>
                      <td className="py-1 px-1 font-mono text-gw-cyan">{d.sy}</td>
                      <td className="py-1 px-1 font-mono">{d.alpha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TechCard>
      </div>

      {/* 深层水参数 */}
      <TechCard title="深层水参数" badge="弹性释放系数">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-2">地区</th>
              <th className="text-gw-muted py-1.5 px-2">弹性释放系数S</th>
              <th className="text-gw-muted py-1.5 px-2">越流补给系数e</th>
              <th className="text-gw-muted py-1.5 px-2">越流系数(最大)</th>
              <th className="text-gw-muted py-1.5 px-2">越流系数(最小)</th>
            </tr></thead>
            <tbody>
              {deepWaterParameters.map((d, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1.5 px-2 text-gw-text">{d.region}</td>
                  <td className="py-1.5 px-2 font-mono text-gw-cyan">{d.storageCoeff}</td>
                  <td className="py-1.5 px-2 font-mono">{d.leakageFactor}</td>
                  <td className="py-1.5 px-2 font-mono">{d.leakMax}</td>
                  <td className="py-1.5 px-2 font-mono">{d.leakMin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
