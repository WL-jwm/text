import React from 'react';
import { Activity, TrendingUp, Timer, Waves } from 'lucide-react';
import { springFlowDynamics } from '../../data/karstWater';
import { StatCard, TechCard, DataSourceNote } from '../UI';

export function KarstFlowDynamicsTab() {
  const avgRecession = (springFlowDynamics.reduce((s, d) => s + d.recessionCoeff, 0) / springFlowDynamics.length).toFixed(4);
  const strongRegCount = springFlowDynamics.filter(s => s.regulationType === '强调节').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="动态监测泉" value={String(springFlowDynamics.length)} unit="个" icon={Activity} accent="blue" />
        <StatCard title="最大流量" value={String(Math.max(...springFlowDynamics.map(s => s.maxFlow)))} unit="m³/s" icon={TrendingUp} accent="cyan" />
        <StatCard title="平均衰减系数" value={avgRecession} unit="" icon={Timer} accent="green" />
        <StatCard title="强调节泉" value={String(strongRegCount)} unit="个" icon={Waves} accent="amber" />
      </div>

      <TechCard title="岩溶泉流量动态特征" icon={Activity}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">泉名</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">监测期</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">最大(m³/s)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">最小(m³/s)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">平均(m³/s)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">CV</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">衰减系数</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">调节类型</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">降雨响应</th>
            </tr></thead>
            <tbody>
              {springFlowDynamics.map((s, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="px-2 py-1.5 text-xs font-medium text-gw-text">{s.spring}</td>
                  <td className="px-2 py-1.5 text-xs text-gw-muted">{s.period}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{s.maxFlow}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{s.minFlow}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-cyan">{s.avgFlow}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-muted">{s.cv}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{s.recessionCoeff}</td>
                  <td className="px-2 py-1.5 text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${s.regulationType === '强调节' ? 'bg-blue-500/15 text-blue-400' : s.regulationType === '中调节' ? 'bg-amber-500/15 text-amber-400' : 'bg-green-500/15 text-green-400'}`}>{s.regulationType}</span>
                  </td>
                  <td className="px-2 py-1.5 text-xs text-gw-muted">{s.rainfallResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 泉流量动态特征" version="泉水动态" />
    </div>
  );
}
