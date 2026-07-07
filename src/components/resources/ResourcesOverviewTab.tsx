import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { historicalComparison, cityGroundwater2024 } from '../../data/resources';
import { TechCard, StatCard, ChartTooltip } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';

interface ResourcesOverviewTabProps {
  ws: any;
}

export function ResourcesOverviewTab({ ws }: ResourcesOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="年降水量" value={`${ws.rainfall.value}`} unit={ws.rainfall.unit} accent="blue" subtitle={`较多年均值 ${ws.rainfall.multiChange}`} />
        <StatCard title="水资源总量" value={`${ws.totalResource.value}`} unit={ws.totalResource.unit} accent="emerald" subtitle={`较多年均值 ${ws.totalResource.multiChange}`} />
        <StatCard title="地下水资源量" value={`${ws.groundwater.value}`} unit={ws.groundwater.unit} accent="cyan" subtitle={`较多年均值 ${ws.groundwater.multiChange}`} />
        <StatCard title="人均水资源量" value={`${ws.perCapita.value}`} unit={ws.perCapita.unit} accent="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard title="水资源构成" badge="2024年">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gw-muted text-sm">地表水资源量</span>
              <span className="text-cyan-400 font-bold">{ws.surfaceWater.value} {ws.surfaceWater.unit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gw-muted text-sm">地下水资源量</span>
              <span className="text-emerald-400 font-bold">{ws.groundwater.value} {ws.groundwater.unit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gw-muted text-sm">水资源总量</span>
              <span className="text-blue-400 font-bold">{ws.totalResource.value} {ws.totalResource.unit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gw-muted text-sm">径流系数</span>
              <span className="text-gw-muted">{ws.runOffCoeff.value}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gw-muted text-sm">径流模数</span>
              <span className="text-gw-muted">{ws.runOffModule.value} {ws.runOffModule.unit}</span>
            </div>
          </div>
        </TechCard>

        <TechCard title="历史对比" badge="地下水">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gw-muted text-sm">1980s地下水资源量</span>
              <span className="text-amber-400 font-bold">{historicalComparison.period1980s.totalResource} {historicalComparison.period1980s.unit}</span>
            </div>
            <div className="text-xs text-gw-muted">{historicalComparison.period1980s.source}</div>
            <div className="flex justify-between items-center">
              <span className="text-gw-muted text-sm">2024年地下水资源量</span>
              <span className="text-emerald-400 font-bold">{historicalComparison.year2024.totalResource} {historicalComparison.year2024.unit}</span>
            </div>
            <div className="text-xs text-gw-muted">{historicalComparison.year2024.source}</div>
            <div className="mt-2 p-2 bg-gw-card-alt/50 rounded text-xs text-gw-muted">
              地下水资源量变化: {((historicalComparison.year2024.totalResource / historicalComparison.period1980s.totalResource - 1) * 100).toFixed(1)}%
            </div>
          </div>
        </TechCard>
      </div>

      <TechCard title="各市地下水资源量" badge="2024年">
        <div className="mb-3 flex justify-end gap-2">
          <ChartExport
            data={cityGroundwater2024}
            filename="河北各市水资源量2024"
            sheetName="各市供水结构"
            formats={['xlsx', 'csv', 'json']}
            label="导出数据"
          />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={cityGroundwater2024} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="city" tick={{ fill: '#9ca3af', fontSize: 11 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: '#9ca3af' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <ChartTooltip unit="亿m³" title="供水结构" />
            <Legend />
            <Bar dataKey="surface" name="地表水" fill="#3b82f6" stackId="a" />
            <Bar dataKey="ground" name="地下水" fill="#10b981" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard title="各市水资源量明细表" badge="14市">
        <FilterableTechTable
          headers={['城市', '地表水(亿m³)', '地下水(亿m³)', '总量(亿m³)', '径流系数']}
          rows={cityGroundwater2024.map(d => [d.city, d.surface.toFixed(2), d.ground.toFixed(2), d.total.toFixed(2), d.coeff.toFixed(2)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
