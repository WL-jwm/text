import React from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { alluvialFanStructures, mountainFrontRichZones } from '../../data/waterSource';
import { TechCard, TechTable, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

interface Props {
  richZoneBarData: { name: string; width: number; K: number }[];
  richRadarData: { zone: string; 渗透系数: number; 宽度: number; 出水量: number }[];
}

export function WaterSourceAlluvialTab({ richZoneBarData, richRadarData }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="冲洪积扇蓄水构造明细">
          <TechTable
            title={`${alluvialFanStructures.length} 个冲洪积扇`}
            headers={['名称', '面积(km²)', '边界条件', '岩性', '深度(m)', '含水层', '水源地']}
            rows={alluvialFanStructures.map(s => [s.name, s.area, s.boundary, s.lithology, s.depth, s.aquiferRock, s.waterSource])}
            pageSize={10}
          />
        </TechCard>
        <TechCard title="冲洪积扇水文地质特征" badge="孔隙水系统">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">结构分带：</span>冲洪积扇从扇顶到扇缘呈明显的垂向和水平分带：扇顶（粗粒、大厚度、高渗透、强补给）→扇中（中粗粒、中等厚度）→扇缘（细粒、薄层、弱渗透）。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">供水价值：</span>山前冲洪积扇是河北省城镇供水的主要水源地分布区。石家庄/保定/邢台/邯郸等主要城市水源地均位于太行山前冲洪积扇中上部。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">演化趋势：</span>超采导致冲洪积扇区地下水位大幅下降，含水层疏干。南水北调替代后水位逐步回升，但含水层参数可能发生不可逆变化。</p>
          </div>
        </TechCard>
      </div>

      <LazyChartCard title="山前富水带参数对比" className="scan-line" height={280}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={richZoneBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={35} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'km / m/d', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="数据" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="width" name="宽度(km)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="K" name="K(m/d)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="山前富水带参数归一化对比" className="scan-line" height={280}>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={richRadarData}>
            <PolarGrid stroke="#1a2d4d" />
            <PolarAngleAxis dataKey="zone" stroke="#64748b" fontSize={10} />
            <PolarRadiusAxis stroke="#1a2d4d" fontSize={9} />
            <Radar name="渗透系数" dataKey="渗透系数" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            <Radar name="宽度" dataKey="宽度" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
            <Radar name="出水量" dataKey="出水量" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Tooltip content={<ChartTooltip title="归一化参数(0-100)" />} />
          </RadarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="山前富水带详细参数">
        <TechTable
          title={`${mountainFrontRichZones.length} 个富水带`}
          headers={['位置', '宽度(km)', 'K(m/d)', '给水度', '岩性', '厚度(m)', '单井(m³/h·m)']}
          rows={mountainFrontRichZones.map(z => [z.zone, z.width, z.K, z.mu, z.lithology, z.thickness, z.yield])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}
