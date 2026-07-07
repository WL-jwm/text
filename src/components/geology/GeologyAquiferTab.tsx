import React, { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Layers, ArrowDownToLine, Activity, Droplets } from 'lucide-react';
import { quaternaryAquiferGroups } from '../../data/geology';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { Aquifer3D } from '../Aquifer3D';

export function GeologyAquiferTab() {
  const radarData = useMemo(() => quaternaryAquiferGroups.map(g => ({
    name: g.group.replace('第', '').replace('含水组', ''),
    K: parseFloat(g.K) || 5,
    yield: parseFloat(g.yield) || 10,
    depth: parseFloat(g.depth.split('~')[1]) || 50,
  })), []);

  const depthProfileData = useMemo(() => quaternaryAquiferGroups.map(g => ({
    name: g.group,
    top: parseFloat(g.depth.split('~')[0]),
    bottom: parseFloat(g.depth.split('~')[1]),
    K: parseFloat(g.K) || 5,
  })), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="含水层组" value="4" unit="组" icon={Layers} accent="blue" />
        <StatCard title="总厚度" value="0~550" unit="m" icon={ArrowDownToLine} accent="cyan" />
        <StatCard title="主要渗透系数" value="0.5~50" unit="m/d" icon={Activity} accent="green" />
        <StatCard title="涌水量" value="5~150" unit="m³/d" icon={Droplets} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="含水层组参数雷达图" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <Radar name="K(m/d)" dataKey="K" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="涌水量(m³/d)" dataKey="yield" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              <Tooltip content={<ChartTooltip title="开采数据" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <LazyChartCard title="渗透系数随深度变化趋势" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={depthProfileData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: 'K(m/d)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="参数数据" />} />
              <Area type="monotone" dataKey="K" name="渗透系数K(m/d)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="四组含水层基本特征">
        <div className="mb-3 flex justify-end">
          <ChartExport data={quaternaryAquiferGroups} filename="aquifer-groups" sheetName="含水层组" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-2 px-2 text-xs">含水层组</th>
              <th className="text-gw-muted py-2 px-2 text-xs">深度(m)</th>
              <th className="text-gw-muted py-2 px-2 text-xs">时代</th>
              <th className="text-gw-muted py-2 px-2 text-xs">岩性</th>
              <th className="text-gw-muted py-2 px-2 text-xs">K(m/d)</th>
              <th className="text-gw-muted py-2 px-2 text-xs">涌水量</th>
              <th className="text-gw-muted py-2 px-2 text-xs">水质</th>
              <th className="text-gw-muted py-2 px-2 text-xs">补给源</th>
            </tr></thead>
            <tbody>
              {quaternaryAquiferGroups.map((g, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-2 px-2 text-xs font-medium text-gw-text">{g.group}</td>
                  <td className="py-2 px-2 font-mono text-xs text-gw-cyan">{g.depth}</td>
                  <td className="py-2 px-2 text-xs">{g.age}</td>
                  <td className="py-2 px-2 text-xs">{g.lithology}</td>
                  <td className="py-2 px-2 font-mono text-xs">{g.K}</td>
                  <td className="py-2 px-2 font-mono text-xs">{g.yield}</td>
                  <td className="py-2 px-2 text-xs text-gw-muted">{g.quality}</td>
                  <td className="py-2 px-2 text-xs text-gw-muted">{g.rechargeSource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard title="各含水组利用状况" badge="开采建议">
          <div className="space-y-2">
            {quaternaryAquiferGroups.map((g, i) => (
              <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gw-text">{g.group}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${i === 0 ? 'bg-emerald-500/15 text-emerald-400' : i === 1 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>{g.mainUse}</span>
                </div>
                <p className="text-[10px] text-gw-muted mt-1">{g.waterType} | {g.rechargeSource}</p>
              </div>
            ))}
          </div>
        </TechCard>
        <TechCard title="垂向分带规律" badge="水文地质">
          <div className="space-y-3">
            <div className="p-3 bg-gw-surface/50 rounded-lg">
              <p className="text-xs font-semibold text-gw-text">浅层带 (I组, 0~50m)</p>
              <p className="text-[10px] text-gw-muted mt-1">积极水循环带，补给条件好，水量丰富，水质优良。主要接受大气降水和地表水入渗补给，是农业灌溉和农村供水的主要水源。</p>
            </div>
            <div className="p-3 bg-gw-surface/50 rounded-lg">
              <p className="text-xs font-semibold text-gw-text">中层过渡带 (II组, 50~150m)</p>
              <p className="text-[10px] text-gw-muted mt-1">半承压-承压过渡，补给条件中等，以越流和侧向径流为主。历史上为城镇集中供水主要层位，目前超采严重区域已限制开采。</p>
            </div>
            <div className="p-3 bg-gw-surface/50 rounded-lg">
              <p className="text-xs font-semibold text-gw-text">深层承压带 (III-IV组, 150~550m)</p>
              <p className="text-[10px] text-gw-muted mt-1">补给条件差，径流迟缓，水交替周期长（百年~千年量级）。III组为历史供水层，IV组限制开采。深层水高氟问题突出。</p>
            </div>
          </div>
        </TechCard>
        <TechCard title="含水层三维结构示意" badge="CSS 3D" className="lg:col-span-2">
          <Aquifer3D />
          <DataSourceNote source="基于含水层组参数数据，CSS 3D Transform实现，拖拽旋转查看各层详情" />
        </TechCard>
      </div>
    </div>
  );
}
