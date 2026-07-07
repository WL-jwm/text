import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { TechCard, StatCard, ChartTooltip, SortableTechTable } from '../UI';

interface BulletinSupplyTabProps {
  supplyStructureData: any[];
  useStructureData: any[];
  bulletinData: any[];
}

export function BulletinSupplyTab({ supplyStructureData, useStructureData, bulletinData }: BulletinSupplyTabProps) {
  const citiesWithSupply = bulletinData.filter(b => b.totalSupply != null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="总供水量" value={citiesWithSupply.reduce((s, b) => s + (b.totalSupply ?? 0), 0).toFixed(2)} unit="亿m³" accent="blue" subtitle={`覆盖${citiesWithSupply.length}个行政区`} />
        <StatCard title="地下水供水" value={citiesWithSupply.reduce((s, b) => s + (b.groundSupply ?? 0), 0).toFixed(2)} unit="亿m³" accent="cyan" />
        <StatCard title="跨流域调水" value={citiesWithSupply.reduce((s, b) => s + (b.interBasinTransferSupply ?? 0), 0).toFixed(2)} unit="亿m³" accent="emerald" />
        <StatCard title="引江水" value={citiesWithSupply.reduce((s, b) => s + (b.southWaterDiversion ?? 0), 0).toFixed(2)} unit="亿m³" accent="green" />
      </div>

      <TechCard title="各市供水水源结构" badge="本地地表水 / 跨流域调水 / 地下水 / 其他">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={supplyStructureData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
            <YAxis tick={{ fill: '#9ca3af' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <ChartTooltip unit="亿m³" />
            <Legend />
            <Bar dataKey="本地地表水" name="本地地表水" fill="#3b82f6" stackId="sup" />
            <Bar dataKey="跨流域调水" name="跨流域调水" fill="#10b981" stackId="sup" />
            <Bar dataKey="地下水" name="地下水" fill="#06b6d4" stackId="sup" />
            <Bar dataKey="其他" name="其他" fill="#6b7280" stackId="sup" />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      {useStructureData.length > 0 && (
        <TechCard title="各市用水部门结构" badge="农业 / 工业 / 生活 / 生态">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={useStructureData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: '#9ca3af' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <ChartTooltip unit="亿m³" />
              <Legend />
              <Bar dataKey="农业" name="农业" fill="#10b981" stackId="use" />
              <Bar dataKey="工业" name="工业" fill="#f59e0b" stackId="use" />
              <Bar dataKey="生活" name="生活" fill="#3b82f6" stackId="use" />
              <Bar dataKey="生态" name="生态" fill="#8b5cf6" stackId="use" />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      )}

      <TechCard title="供水水源明细表" badge={`${citiesWithSupply.length}市`}>
        <SortableTechTable
          headers={['城市', '本地地表水', '跨流域调水', '地下水', '其他', '总供水', '农业', '工业', '生活', '生态']}
          rows={citiesWithSupply.map(b => [
            b.city,
            b.localSurfaceSupply?.toFixed(2) ?? '-',
            b.interBasinTransferSupply?.toFixed(2) ?? '-',
            b.groundSupply?.toFixed(2) ?? '-',
            b.otherSupply?.toFixed(2) ?? '-',
            b.totalSupply?.toFixed(2) ?? '-',
            b.agriUse?.toFixed(2) ?? '-',
            b.industryUse?.toFixed(2) ?? '-',
            b.domesticUse?.toFixed(2) ?? '-',
            b.ecoUse?.toFixed(2) ?? '-',
          ])}
        />
      </TechCard>
    </div>
  );
}
