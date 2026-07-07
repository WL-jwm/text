import React from 'react';
import { Droplets, MapPin, Timer, Waves } from 'lucide-react';
import { karstRechargeFeatures } from '../../data/karstWater';
import { StatCard, TechCard, DataSourceNote } from '../UI';

export function KarstRechargeTab() {
  const maxArea = Math.max(...karstRechargeFeatures.map(r => r.rechargeArea));
  const avgInfilt = (karstRechargeFeatures.reduce((s, r) => s + r.infiltrationCoeff, 0) / karstRechargeFeatures.length).toFixed(2);
  const totalRecharge = karstRechargeFeatures.reduce((s, r) => s + r.totalRecharge, 0);
  const totalRiverLeak = karstRechargeFeatures.reduce((s, r) => s + r.riverLeakage, 0);
  const riverLeakPct = ((totalRiverLeak / totalRecharge) * 100).toFixed(0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="补给区统计" value={String(karstRechargeFeatures.length)} unit="个" icon={Droplets} accent="blue" />
        <StatCard title="最大补给区" value={String(maxArea)} unit="km²" icon={MapPin} accent="cyan" />
        <StatCard title="平均入渗系数" value={avgInfilt} unit="" icon={Timer} accent="green" />
        <StatCard title="河流渗漏占比" value={riverLeakPct} unit="%" icon={Waves} accent="amber" />
      </div>

      <TechCard title="岩溶泉补给特征" icon={Droplets}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">泉名</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">补给区(km²)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">降雨(mm)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">总补给(亿m³/a)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">降水入渗</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">河流渗漏</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">侧向径流</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">入渗系数</th>
            </tr></thead>
            <tbody>
              {karstRechargeFeatures.map((r, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="px-2 py-1.5 text-xs font-medium text-gw-text">{r.spring}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{r.rechargeArea}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-muted">{r.rainfall}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-cyan">{r.totalRecharge}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{r.precipInfiltration}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{r.riverLeakage}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-muted">{r.lateralInflow}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{r.infiltrationCoeff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 岩溶泉补给特征" version="补给参数" />
    </div>
  );
}
