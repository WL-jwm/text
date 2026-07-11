import React from 'react';
import { TechCard } from '../../components/UI';
import { groundwaterBackground, type ZoneBackgroundData } from '../../data/backgroundValues';
import { ZONE_COLORS } from './backgroundData';

interface BackgroundQueryTabProps {
  selectedZone: string;
  selectedLayer: 'shallow' | 'deep';
  setSelectedZone: (zone: string) => void;
  setSelectedLayer: (layer: 'shallow' | 'deep') => void;
  currentZoneData: ZoneBackgroundData | undefined;
}

export function BackgroundQueryTab({
  selectedZone,
  selectedLayer,
  setSelectedZone,
  setSelectedLayer,
  currentZoneData,
}: BackgroundQueryTabProps) {
  const zones = selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep;

  return (
    <div className="space-y-4">
      {/* 选择器 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gw-surface rounded-lg p-1">
          {(['shallow', 'deep'] as const).map(layer => (
            <button key={layer} onClick={() => setSelectedLayer(layer)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                selectedLayer === layer
                  ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                  : 'text-gw-muted hover:text-gw-text'
              }`}>
              {layer === 'shallow' ? '浅层水' : '深层水'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gw-surface rounded-lg p-1">
          {zones.map(z => (
            <button key={z.zone} onClick={() => setSelectedZone(z.zone)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                selectedZone === z.zone
                  ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                  : 'text-gw-muted hover:text-gw-text'
              }`}>
              {z.zone}
            </button>
          ))}
        </div>
      </div>

      {/* 当前分区详情 */}
      {currentZoneData && (
        <>
          <TechCard title={`${currentZoneData.zone} — ${selectedLayer === 'shallow' ? '浅层' : '深层'}地下水背景值`}
            badge={currentZoneData.waterType}>
            <p className="text-[10px] text-gw-muted mb-3">
              分布范围：{currentZoneData.cities} | {currentZoneData.note}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {[
                { label: 'pH', value: currentZoneData.pH },
                { label: 'TDS(mg/L)', value: currentZoneData.TDS },
                { label: '总硬度(mg/L)', value: currentZoneData.totalHardness },
                { label: 'Cl⁻(mg/L)', value: currentZoneData.Cl },
                { label: 'SO₄²⁻(mg/L)', value: currentZoneData.SO4 },
                { label: 'HCO₃⁻(mg/L)', value: currentZoneData.HCO3 },
                { label: 'Na⁺(mg/L)', value: currentZoneData.Na },
                { label: 'Ca²⁺(mg/L)', value: currentZoneData.Ca },
                { label: 'Mg²⁺(mg/L)', value: currentZoneData.Mg },
                { label: 'NO₃⁻(mg/L)', value: currentZoneData.NO3 },
                { label: 'NO₂⁻(mg/L)', value: currentZoneData.NO2 },
                { label: 'NH₄⁺(mg/L)', value: currentZoneData.NH4 },
                { label: 'F⁻(mg/L)', value: currentZoneData.F },
                { label: 'Fe(mg/L)', value: currentZoneData.Fe },
                { label: 'Mn(mg/L)', value: currentZoneData.Mn },
                { label: 'As(mg/L)', value: currentZoneData.As || '-' },
                { label: 'Cr⁶⁺(mg/L)', value: currentZoneData.Cr6 || '-' },
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/30">
                  <p className="text-[9px] text-gw-muted">{item.label}</p>
                  <p className="text-sm font-bold font-mono text-gw-text">{item.value}</p>
                </div>
              ))}
            </div>
          </TechCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="其他分区同层对比">
              <div className="space-y-2">
                {zones.filter(z => z.zone !== selectedZone).map(z => (
                  <div key={z.zone} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-gw-blue/10 text-gw-cyan">{z.waterType}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[9px]">
                      <div><span className="text-gw-muted">TDS</span> <span className="font-mono">{z.TDS}</span></div>
                      <div><span className="text-gw-muted">硬度</span> <span className="font-mono">{z.totalHardness}</span></div>
                      <div><span className="text-gw-muted">Cl</span> <span className="font-mono">{z.Cl}</span></div>
                      <div><span className="text-gw-muted">F</span> <span className="font-mono">{z.F}</span></div>
                    </div>
                    <p className="text-[9px] text-gw-muted mt-1">{z.note}</p>
                  </div>
                ))}
              </div>
            </TechCard>

            <TechCard title="水化学类型与特征">
              <div className="space-y-3">
                {zones.map((z, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-gw-border/30"
                    style={{ borderColor: `${ZONE_COLORS[i]}33` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONE_COLORS[i] }} />
                      <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                    </div>
                    <p className="text-[10px] text-gw-cyan font-mono">{z.waterType}</p>
                    <p className="text-[9px] text-gw-muted mt-0.5">{z.note}</p>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>
        </>
      )}
    </div>
  );
}
