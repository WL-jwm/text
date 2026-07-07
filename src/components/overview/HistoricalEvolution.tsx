import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Clock } from 'lucide-react';
import { waterSubstitutionProjects } from '../../data/exploitation';
import { SectionTitle, TechCard } from '../UI';

export function HistoricalEvolution() {
  const _comparisonData = [
    { name: '地下水资源量', period1980s: 192.6, year2024: 247.9, unit: '亿m³' },
    { name: '开采量', period1980s: 155.3, year2024: 94.5, unit: '亿m³' },
    { name: '浅层漏斗面积', period1980s: 8700, year2024: 3200, unit: 'km²' },
    { name: '浅层漏斗数量', period1980s: 15, year2024: 7, unit: '个' },
  ];
  return (
    <>

<SectionTitle icon={Clock} badge="历史对比">1990s vs 2024 历史演变</SectionTitle>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

  <TechCard title="地下水关键指标变化" className="scan-line" badge="1990s → 2024" >

    <ResponsiveContainer width="100%" height={220}>

      <BarChart data={[

        { name: '开采量(亿m³)', period1980s: 192.6, year2024: 154.7 },

        { name: '超采区(km²)', period1980s: 61500, year2024: 38000 },

        { name: '浅层水位(m)', period1980s: 25.8, year2024: 27.2 },

        { name: '深层水位(m)', period1980s: 0.3, year2024: 0.8 },

      ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />

        <YAxis stroke="#64748b" fontSize={9} />

        <Tooltip />

        <Legend wrapperStyle={{ fontSize: 10 }} />

        <Bar dataKey="period1980s" name="1990s" fill="#f59e0b" radius={[2, 2, 0, 0]} />

        <Bar dataKey="year2024" name="2024" fill="#3b82f6" radius={[2, 2, 0, 0]} />

      </BarChart>

    </ResponsiveContainer>

  </TechCard>

  <TechCard title="引调水替代工程" badge="水源替代">

    <ResponsiveContainer width="100%" height={200}>

      <BarChart data={waterSubstitutionProjects?.map(p => ({ name: p.name?.length > 8 ? p.name.slice(0, 8) + '...' : p.name, volume: p.substitutionVolume })) || []} layout="vertical" margin={{ left: 0, right: 10 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis type="number" stroke="#64748b" fontSize={9} />

        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={60} />

        <Tooltip />

        <Bar dataKey="volume" fill="#06b6d4" radius={[0, 2, 2, 0]} />

      </BarChart>

    </ResponsiveContainer>

    <p className="text-[10px] text-gw-muted mt-2">南水北调中线累计引江182.6亿m³(2014-2024)，直接促成深层漏斗全部消散</p>

  </TechCard>

</div>
    </>
  );
}
