// SupplyStructurePanel
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, StatCard, TechCard } from '../components/UI';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { cityWaterSupply2024 } from '../data/resources-core';
import {ALL_CITIES} from './timeSeriesUtils';

export function SupplyStructurePanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);
  const supplyData = useMemo(() => cityWaterSupply2024.filter(c => cities.includes(c.city)), [cities]);

  const totalStats = useMemo(() => {
    if (supplyData.length === 0) return null;
    const totalSupply = supplyData.reduce((s, c) => s + c.totalSupply, 0);
    const totalGw = supplyData.reduce((s, c) => s + c.gwSupply, 0);
    const totalOther = supplyData.reduce((s, c) => s + c.totalSupply - c.gwSupply, 0);
    return { totalSupply, totalGw, totalOther };
  }, [supplyData]);

  return (
    <div className="space-y-4">
      {totalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="总供水量" value={`${totalStats.totalSupply.toFixed(1)}`} unit="亿m³" accent="blue" subtitle={`${supplyData.length}市合计`} />
          <StatCard title="地下水占比" value={`${(totalStats.totalGw / totalStats.totalSupply * 100).toFixed(1)}`} unit="%" accent="cyan" subtitle={`${totalStats.totalGw.toFixed(1)}亿m³`} />
          <StatCard title="地表水+外调占比" value={`${(totalStats.totalOther / totalStats.totalSupply * 100).toFixed(1)}`} unit="%" accent="emerald" subtitle={`${totalStats.totalOther.toFixed(1)}亿m³`} />
          <StatCard title="主要改善城市" value="沧州" unit="18.7%" accent="purple" subtitle="地下水占比全省最低" />
        </div>
      )}

      {/* 供水结构堆叠柱状图 */}
      <TechCard title="各市供水结构对比(2024)" badge="亿m³" className="hud-corners">
        {supplyData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, supplyData.length * 28 + 60)}>
            <BarChart data={[...supplyData].map(c => ({ ...c, otherSupply: c.totalSupply - c.gwSupply })).sort((a, b) => b.totalSupply - a.totalSupply)} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip unit="亿m³" title="供水量" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="gwSupply" name="地下水" stackId="1" fill="#3b82f6" />
              <Bar dataKey="otherSupply" name="其他水源" stackId="1" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 地下水占比排名 */}
      <TechCard title="各市地下水占供水比排名(2024)" badge="%">
        {supplyData.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(200, supplyData.length * 25 + 40)}>
            <BarChart
              data={[...supplyData].sort((a, b) => b.gwRatio - a.gwRatio)}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 100]} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="%" title="地下水占比" />} />
              <Bar dataKey="gwRatio" name="地下水占比(%)" radius={[0, 4, 4, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 明细表 */}
      {supplyData.length > 0 && (
        <TechCard title="各市供水结构数据明细(2024)" badge="亿m³">
          <FilterableTechTable
            headers={['城市', '总供水(亿m³)', '地下水(亿m³)', '其他水源(亿m³)', '地下水占比(%)']}
            rows={[...supplyData].sort((a, b) => b.totalSupply - a.totalSupply).map(c => [
              c.city,
              c.totalSupply.toFixed(2),
              c.gwSupply.toFixed(2),
              (c.totalSupply - c.gwSupply).toFixed(2),
              c.gwRatio.toFixed(1),
            ])}
            pageSize={10}
          />
        </TechCard>
      )}
    </div>
  );
}

// ── 雷达对比 Tab ──
