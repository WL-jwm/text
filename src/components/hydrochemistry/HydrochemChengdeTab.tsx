import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FlaskConical, AlertTriangle, MapPin, Beaker } from 'lucide-react';
import { chengdeHydrochemistry } from '../../data/hydrogeologyHistorical';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

export function HydrochemChengdeTab() {
  // 提取数值型数据做对比图
  const chartData = React.useMemo(() => {
    const numericItems = chengdeHydrochemistry.filter((c) => {
      const v = parseFloat(c.strongErosion);
      return !isNaN(v) && v > 0;
    });
    return numericItems.map((c) => ({
      name: c.component,
      强烈侵蚀区: parseFloat(c.strongErosion) || 0,
      侵蚀沉积浅层: parseFloat(c.erosionDepositShallow) || 0,
      侵蚀沉积深层: parseFloat(c.erosionDepositDeep) || 0,
    }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="组分" value={String(chengdeHydrochemistry.length)} unit="项" icon={FlaskConical} accent="blue" />
        <StatCard title="强侵蚀区" value="覆盖" unit="全区" icon={AlertTriangle} accent="red" />
        <StatCard title="侵蚀-沉积区" value="覆盖" unit="浅层/深层" icon={MapPin} accent="cyan" />
        <StatCard title="典型项目" value="Ca²⁺/SO₄²⁻/HCO₃⁻" unit="" icon={Beaker} accent="green" />
      </div>

      {chartData.length > 0 && (
        <LazyChartCard title="承德地区水化学组分对比" badge="3分区" className="scan-line" height={320}>
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />强烈侵蚀区</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />侵蚀-沉积浅层</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />侵蚀-沉积深层</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="水化学组分" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="强烈侵蚀区" name="强烈侵蚀区" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="侵蚀沉积浅层" name="侵蚀-沉积浅层" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="侵蚀沉积深层" name="侵蚀-沉积深层" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      )}

      <TechCard title="承德地区水化学组分含量范围" icon={MapPin}>
        <p className="text-[10px] text-gw-muted mb-3">
          承德地区三个水文地质单元（强烈侵蚀区、侵蚀-沉积浅层区、侵蚀-沉积深层区）主要水化学组分浓度范围(mg/L)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">组分</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">强烈侵蚀区(mg/L)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">侵蚀-沉积浅层(mg/L)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">侵蚀-沉积深层(mg/L)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">单位</th>
              </tr>
            </thead>
            <tbody>
              {chengdeHydrochemistry.map((c, i: number) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text font-medium">{c.component}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{c.strongErosion}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{c.erosionDepositShallow}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{c.erosionDepositDeep}</td>
                  <td className="px-2 py-1 text-gw-muted">{c.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 承德地区水化学数据" version="承德水化学" />
    </div>
  );
}
