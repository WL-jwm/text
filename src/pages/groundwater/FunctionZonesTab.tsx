import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { TechCard } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { groundwaterFunctionZones } from '../../data/groundwaterFunction';

interface FunctionZonesTabProps {
  funcZoneRadar: { name: string; value: number }[];
}

export function FunctionZonesTab({ funcZoneRadar }: FunctionZonesTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="地下水功能区划" badge="四区管理">
          <div className="space-y-3">
            {groundwaterFunctionZones.map((z, i) => (
              <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gw-text">
                    {z.zone}（{z.code}）
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gw-blue/10 text-gw-cyan">{z.protectionTarget}</span>
                </div>
                <p className="text-[10px] text-gw-muted">{z.description}</p>
                <p className="text-[9px] text-gw-highlight mt-1">典型区域：{z.typicalArea}</p>
              </div>
            ))}
          </div>
        </TechCard>
        <LazyChartCard title="功能区保护目标雷达" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={funcZoneRadar}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" fontSize={9} />
              <Radar name="功能区" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="功能分区管理原则">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {groundwaterFunctionZones.map((z, i) => (
            <div key={i} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/30">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0 ? 'bg-emerald-500/15 text-emerald-400' :
                  i === 1 ? 'bg-blue-500/15 text-blue-400' :
                  i === 2 ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                }`}>{z.code}</span>
                <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
              </div>
              <p className="text-[10px] text-gw-muted">{z.description}</p>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
