import React from 'react';
import { Atom, Thermometer, Timer, ArrowDownRight } from 'lucide-react';
import { karstIsotopeFeatures } from '../../data/karstWater';
import { StatCard, TechCard, DataSourceNote } from '../UI';

export function KarstIsotopeTab() {
  const minO = Math.min(...karstIsotopeFeatures.map(s => s.delta18O));
  const maxO = Math.max(...karstIsotopeFeatures.map(s => s.delta18O));
  const maxC14 = Math.max(...karstIsotopeFeatures.map(s => s.carbon14));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="同位素采样泉" value={String(karstIsotopeFeatures.length)} unit="个" icon={Atom} accent="blue" />
        <StatCard title="δ¹⁸O范围" value={`${minO}~${maxO}`} unit="‰" icon={Thermometer} accent="cyan" />
        <StatCard title="¹⁴C年龄" value={String(maxC14)} unit="%现代碳" icon={Timer} accent="green" />
        <StatCard title="循环深度" value="250~500" unit="m" icon={ArrowDownRight} accent="amber" />
      </div>

      <TechCard title="岩溶泉同位素特征与循环深度" icon={Atom}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">泉名</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">δD(‰)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">δ¹⁸O(‰)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">³H(TU)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">¹⁴C(%现代碳)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">年龄</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">补给高程(m)</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">循环深度(m)</th>
            </tr></thead>
            <tbody>
              {karstIsotopeFeatures.map((s, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="px-2 py-1.5 text-xs font-medium text-gw-text">{s.spring}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{s.deltaD}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-cyan">{s.delta18O}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{s.tritium}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{s.carbon14}</td>
                  <td className="px-2 py-1.5 text-xs text-gw-muted">{s.age}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-muted">{s.rechargeElevation}</td>
                  <td className="px-2 py-1.5 text-xs font-mono text-gw-highlight">{s.circulationDepth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 岩溶泉同位素特征" version="同位素" />
    </div>
  );
}
