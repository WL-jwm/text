import React from 'react';
import { BookOpen, MapPin, Activity, Waves } from 'lucide-react';
import { aquiferParameters, citySupplyHydrogeology, deepWaterParameters } from '../../data/hydrogeologyReference';
import { TechCard, StatCard, DataSourceNote } from '../UI';

export function WaterSourceClassicTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="含水层参数" value={String(aquiferParameters.length)} unit="条" icon={BookOpen} accent="blue" subtitle="山前/盆地典型值" />
        <StatCard title="城市供水" value={String(citySupplyHydrogeology.length)} unit="市" icon={MapPin} accent="cyan" />
        <StatCard title="K值分区" value="3" unit="含水组" icon={Activity} accent="green" subtitle="渗透系数分区表" />
        <StatCard title="深层水参数" value={String(deepWaterParameters.length)} unit="地区" icon={Waves} accent="amber" />
      </div>

      <TechCard title="含水层参数详表（典型剖面）" icon={BookOpen}>
        <p className="text-[10px] text-gw-muted mb-3">
          含水层岩性、厚度、单位涌水量经典参考值，数据来源：《河北省水文地质工程地质》
        </p>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">地区/剖面</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">厚度(m)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">单位涌水量(m³/h·m)</th>
              </tr>
            </thead>
            <tbody>
              {aquiferParameters.map((a, i) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text text-[10px]">{a.area}</td>
                  <td className="px-2 py-1 text-gw-text">{a.lithology}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{a.thickness}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{a.unitYield}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="主要城市供水水文地质条件" icon={MapPin}>
        <p className="text-[10px] text-gw-muted mb-3">
          1980年代前城市地下水开采条件概要，反映历史基准状况
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {citySupplyHydrogeology.map((c, i) => (
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

      <TechCard title="深层承压水弹性释放参数" icon={Waves}>
        <p className="text-[10px] text-gw-muted mb-3">沧州/衡水/邢台深层承压水弹性储存系数与越流参数</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gw-border">
              <th className="px-3 py-1.5 text-left text-gw-muted font-medium">地区</th>
              <th className="px-3 py-1.5 text-left text-gw-muted font-medium">弹性储存系数(S)</th>
              <th className="px-3 py-1.5 text-left text-gw-muted font-medium">越流系数(B)</th>
              <th className="px-3 py-1.5 text-left text-gw-muted font-medium">越流层厚(m)</th>
            </tr>
          </thead>
          <tbody>
            {deepWaterParameters.map((d, i) => (
              <tr key={i} className="border-b border-gw-border/50">
                <td className="px-3 py-1.5 text-gw-text">{d.region}</td>
                <td className="px-3 py-1.5 font-mono text-gw-highlight">{d.storageCoeff}</td>
                <td className="px-3 py-1.5 font-mono text-gw-highlight">{d.leakageFactor}</td>
                <td className="px-3 py-1.5 font-mono text-gw-text">{d.leakMin}~{d.leakMax}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 含水层参数+城市供水" version="经典参数" />
    </div>
  );
}
