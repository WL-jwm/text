import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FlaskConical } from 'lucide-react';
import { pollutionDegree1990s, shallowGroundwaterQuality2024 } from '../../data/waterQuality';
import { SectionTitle, TechCard } from '../UI';

export function PollutionQualityComparison() {
  return (
    <>
{/* ═══════════════════ 1990s污染 vs 2024水质 ═══════════════════ */}

<SectionTitle icon={FlaskConical} badge="水质演变">1990s污染 vs 2024水质</SectionTitle>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

  <TechCard title="1990s地下水污染程度分布" badge="历史数据" className="scan-line">

    <ResponsiveContainer width="100%" height={220}>

      <BarChart data={pollutionDegree1990s?.map(p => ({ name: p.city, 未污染: p.unpolluted, 轻度: p.light, 中度: p.moderate, 重度: p.heavy, 严重: p.severe })) || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />

        <YAxis stroke="#64748b" fontSize={9} />

        <Tooltip />

        <Legend wrapperStyle={{ fontSize: 9 }} />

        <Bar dataKey="未污染" fill="#22c55e" stackId="a" />

        <Bar dataKey="轻度" fill="#eab308" stackId="a" />

        <Bar dataKey="中度" fill="#f97316" stackId="a" />

        <Bar dataKey="重度" fill="#ef4444" stackId="a" />

        <Bar dataKey="严重" fill="#7c2d12" stackId="a" />

      </BarChart>

    </ResponsiveContainer>

    <p className="text-[10px] text-gw-muted mt-1">数据来源: 1990s全省地下水污染普查</p>

  </TechCard>

  <TechCard title="2024年浅层地下水水质类别" badge="最新数据" className="scan-line">

    <ResponsiveContainer width="100%" height={220}>

      <BarChart data={shallowGroundwaterQuality2024?.slice(0, 8).map(q => ({ name: q.region, 'III类及以上': +(q.I + q.II + q.III).toFixed(1), 'IV类': q.IV, 'V类': q.V })) || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />

        <YAxis stroke="#64748b" fontSize={9} />

        <Tooltip />

        <Legend wrapperStyle={{ fontSize: 9 }} />

        <Bar dataKey="III类及以上" fill="#22c55e" stackId="a" />

        <Bar dataKey="IV类" fill="#eab308" stackId="a" />

        <Bar dataKey="V类" fill="#ef4444" stackId="a" />

      </BarChart>

    </ResponsiveContainer>

    <p className="text-[10px] text-gw-muted mt-1">依据GB/T 14848-2017地下水质量标准</p>

  </TechCard>

</div>
    </>
  );
}
