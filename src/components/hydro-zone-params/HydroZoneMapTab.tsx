import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Map } from 'lucide-react';
import { systemZones, subZones, plainZones } from '../../data/zoneParams';
import { TechCard } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  systemAreaData: any[];
}

export function HydroZoneMapTab({ systemAreaData }: Props) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* 系统分区面积图 */}
      <TechCard title="系统分区面积分布" icon={Map}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={systemAreaData} filename="系统分区面积分布" sheetName="分区面积" formats={['xlsx','csv','json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={systemAreaData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
            <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'var(--gw-card, #0f1a2e)', border: '1px solid var(--gw-border, #1a2d4d)', borderRadius: 6, fontSize: 11 }} labelStyle={{ color: 'var(--gw-text, #e2e8f0)' }} />
            <Bar dataKey="面积" fill="var(--gw-cyan, #06b6d4)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard title="地下水系统分区(10大系统区)">
        <FilterableTechTable
          filterPlaceholder="搜索系统分区..."
          headers={['编码', '名称', '面积(km2)', '占比(%)', 'alpha', 'T(m2/d)', 'q(m3/h*m)', '含水层厚度', '水位', '径流模数']}
          rows={systemZones.map(d => [d.code, d.name, String(d.area ?? '-'), String(d.areaPercent ?? '-'), d.alpha ?? '-', d.T ?? '-', d.q ?? '-', d.aquiferThickness ?? '-', d.waterLevel ?? '-', d.runoffModulus ?? '-'])}
          pageSize={10}
        />
      </TechCard>

      <TechCard title="地下水子区/小区">
        <FilterableTechTable
          filterPlaceholder="搜索子分区..."
          headers={['编码', '名称', '等级', '父区', '面积(km2)', 'alpha', 'T(m2/d)', 'q(m3/h*m)']}
          rows={subZones.map(d => [d.code, d.name, d.level, d.parent, String(d.area ?? '-'), d.alpha ?? '-', d.T ?? '-', d.q ?? '-'])}
          pageSize={10}
        />
      </TechCard>

      <TechCard title="山前平原分区参数">
        <FilterableTechTable
          filterPlaceholder="搜索平原分区..."
          headers={['分区', '位置', '含水层', 'T(m2/d)', 'q(m3/h*m)', 'mu', 'alpha', '矿化度(g/L)', '特征']}
          rows={plainZones.map(d => [d.name, d.location, d.aquifer, d.T, d.q, d.mu, d.alpha, d.salinity, d.feature])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}
