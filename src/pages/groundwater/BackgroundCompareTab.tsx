import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { groundwaterBackground } from '../../data/backgroundValues';
import type { RadarDataPoint, IndicatorComparePoint } from './backgroundData';

interface BackgroundCompareTabProps {
  selectedLayer: 'shallow' | 'deep';
  setSelectedLayer: (layer: 'shallow' | 'deep') => void;
  radarData: RadarDataPoint[];
  indicatorCompare: IndicatorComparePoint[];
}

export function BackgroundCompareTab({
  selectedLayer,
  setSelectedLayer,
  radarData,
  indicatorCompare,
}: BackgroundCompareTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 w-fit">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="主要指标分区对比（上限值）" className="scan-line" height={350}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={indicatorCompare}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-20} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={9} />
              <Tooltip content={<ChartTooltip unit="mg/L" title="含量" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="山前平原" name="山前平原" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="中部平原" name="中部平原" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="滨海平原" name="滨海平原" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="指标分布雷达图" className="scan-line" height={350}>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="indicator" stroke="#64748b" fontSize={9} />
              <PolarRadiusAxis angle={90} domain={[0, 'auto']} stroke="#64748b" fontSize={8} />
              <Tooltip />
              <Radar name="山前平原" dataKey="山前平原" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="中部平原" dataKey="中部平原" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="滨海平原" dataKey="滨海平原" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="浅层 vs 深层背景值对比">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['山前平原', '中部平原', '滨海平原'].map(zone => {
            const shallow = groundwaterBackground.shallow.find(z => z.zone === zone);
            const deep = groundwaterBackground.deep.find(z => z.zone === zone + '深层');
            return (
              <div key={zone} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/50">
                <p className="text-xs font-semibold text-gw-text mb-2">{zone}</p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gw-muted">浅层TDS</span>
                    <span className="font-mono">{shallow?.TDS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gw-muted">深层TDS</span>
                    <span className="font-mono">{deep?.TDS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gw-muted">浅层F</span>
                    <span className="font-mono">{shallow?.F}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gw-muted">深层F</span>
                    <span className="font-mono">{deep?.F}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gw-muted">浅层水型</span>
                    <span className="text-gw-cyan text-[9px]">{shallow?.waterType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gw-muted">深层水型</span>
                    <span className="text-gw-cyan text-[9px]">{deep?.waterType}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TechCard>
    </div>
  );
}
