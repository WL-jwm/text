import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Map } from 'lucide-react';
import { historicalSprings, springStatsByRegion, riverLeakageData, mountainRunoffModulus } from '../../data/hydrogeologyHistorical';
import { exportDataCSV } from '../../utils/exportUtils';
import { StatCard, TechCard, CollapsiblePanel, TagFilter, ChartTooltip } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { ExportButton } from '../UI';
import { useToast } from '../Toast';

export function HydroZoneSpringsTab() {
  const { success } = useToast();
  const [springFilter, setSpringFilter] = useState('');

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-[10px] text-blue-300">历史泉水数据来源于《河北省水文地质工程地质》（1980s），记录126处泉水出露点，涵盖全省6大区域，为泉域恢复和岩溶水文地质研究提供历史基准。</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="泉水总数" value={String(historicalSprings.length)} unit="处" accent="cyan" />
        <StatCard title="涉及区域" value="6" unit="个" accent="blue" />
        <StatCard title="河流渗漏" value={String(riverLeakageData.length)} unit="条" accent="emerald" />
        <StatCard title="径流模数" value={String(mountainRunoffModulus.length)} unit="类" accent="amber" />
      </div>

      {/* 泉水统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="泉水按区域分布" icon={Droplets}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={springStatsByRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="region" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
              <ChartTooltip unit="处" />
              <Bar dataKey="count" fill="var(--gw-blue, #3b82f6)" name="泉水数" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard title="山区径流模数（按岩性）" icon={Map}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mountainRunoffModulus.map(m => ({
              name: m.rockType.length > 8 ? m.rockType.substring(0, 8) : m.rockType,
              平均值: parseFloat(m.average),
              范围上限: parseFloat(m.range.split('~')[1] || m.range),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 8 }} />
              <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} unit="L/(s·km²)" />
              <Tooltip contentStyle={{ background: 'var(--gw-card, #0f1a2e)', border: '1px solid var(--gw-border, #1a2d4d)', borderRadius: 6, fontSize: 11 }} labelStyle={{ color: 'var(--gw-text, #e2e8f0)' }} />
              <Bar dataKey="平均值" fill="var(--gw-cyan, #06b6d4)" name="平均值" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      {/* 泉水详表 */}
      <CollapsiblePanel title="历史泉水数据库（126处）" defaultOpen>
        <div className="mb-3 flex flex-wrap gap-2 items-center">
          <TagFilter
            tags={['全部', ...springStatsByRegion.map(s => s.region)]}
            activeTag={springFilter || '全部'}
            onTagChange={v => setSpringFilter(v === '全部' ? '' : v)}
          />
          <div className="flex-1" />
          <ExportButton onClick={() => { exportDataCSV(historicalSprings.filter(s => !springFilter || s.region === springFilter), 'historical-springs'); success('泉水数据已导出'); }} label="导出" />
        </div>
        <FilterableTechTable
          filterPlaceholder="搜索历史泉水..."
          headers={['序号', '区域', '位置', '流量(m³/h)', '出露地层/构造条件']}
          rows={historicalSprings.filter(s => !springFilter || s.region === springFilter).map(d => [String(d.id), d.region, d.location, d.flow, d.geology])}
          pageSize={20}
        />
      </CollapsiblePanel>

      {/* 河流渗漏 */}
      <CollapsiblePanel title="河流渗漏数据">
        <FilterableTechTable
          filterPlaceholder="搜索河流渗漏..."
          headers={['序号', '河流', '渗漏段', '实测漏失量', '多年平均漏失量', '备注']}
          rows={riverLeakageData.map(d => [String(d.id), d.river, d.section, d.measuredLeakage, d.avgLeakage, d.note])}
          pageSize={12}
        />
      </CollapsiblePanel>
    </div>
  );
}
