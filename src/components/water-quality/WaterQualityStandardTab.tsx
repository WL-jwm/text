import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TechCard, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { groundwaterQualityStandards } from '../../data/standards';

interface StandardClass { class: string; name: string; color: string; description: string; usage?: string }
interface FactorItem { name: string; unit?: string; type: string; I: string; II: string; III: string; IV: string; V: string }

interface Props {
  groundwaterQualityStandard: { classes: StandardClass[]; evaluationFactors: FactorItem[]; standardName?: string };
}

const CLASS_COLORS: Record<string, string> = {
  'I': '#22c55e', 'II': '#84cc16', 'III': '#eab308', 'IV': '#f97316', 'V': '#ef4444',
};

export function WaterQualityStandardTab({ groundwaterQualityStandard }: Props) {
  // 关键因子限值对比图：选取10个典型因子
  const factorChartData = React.useMemo(() => {
    const keyFactors = ['pH', '总硬度', '溶解性总固体', '硫酸盐', '氯化物', '氟化物', '硝酸盐', '亚硝酸盐', '氨氮', '铁'];
    return groundwaterQualityStandard.evaluationFactors
      .filter(f => keyFactors.includes(f.name))
      .map(f => ({
        name: f.name,
        I: parseFloat(f.I) || 0,
        II: parseFloat(f.II) || 0,
        III: parseFloat(f.III) || 0,
        IV: parseFloat(f.IV) || 0,
        V: parseFloat(f.V) || 0,
        unit: f.unit || '',
      }));
  }, [groundwaterQualityStandard]);

  return (
    <div className="space-y-4">
      <TechCard title="评价标准选择">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gw-muted">当前标准：</span>
          <span className="px-3 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            {groundwaterQualityStandards.currentVersion}: {groundwaterQualityStandard.standardName}
          </span>
          <span className="text-[10px] text-gw-muted">状态: 现行 | 发布日期: 2017-10-14 | 实施日期: 2018-05-01</span>
        </div>
        <p className="text-[10px] text-gw-muted mt-2 italic">
          💡 提示：GB/T 14848标准版本切换由 data/standards.ts 集中管理，新版标准发布后仅需添加版本即可。
        </p>
      </TechCard>

      <TechCard title="GB/T 14848-2017 地下水质量标准">
        <div className="grid grid-cols-5 gap-3 mb-4">
          {groundwaterQualityStandard.classes.map((c: StandardClass, _i: number) => (
            <div key={c.class} className="p-3 rounded-lg text-center border" style={{ borderColor: c.color + '40', backgroundColor: c.color + '10' }}>
              <div className="text-lg font-bold" style={{ color: c.class }}>{c.class}</div>
              <div className="text-xs font-medium mt-1" style={{ color: c.color }}>{c.name}</div>
              <p className="text-[10px] text-gw-muted mt-1.5 leading-tight">{c.description}</p>
            </div>
          ))}
        </div>
      </TechCard>

      <LazyChartCard title="关键评价因子各级限值对比" badge="10因子" className="scan-line" height={320}>
        <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />I类</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lime-400" />II类</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />III类</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />IV类</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />V类</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={factorChartData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip title="标准限值" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="I" name="I类" fill="#22c55e" radius={[2, 2, 0, 0]} />
            <Bar dataKey="II" name="II类" fill="#84cc16" radius={[2, 2, 0, 0]} />
            <Bar dataKey="III" name="III类" fill="#eab308" radius={[2, 2, 0, 0]} />
            <Bar dataKey="IV" name="IV类" fill="#f97316" radius={[2, 2, 0, 0]} />
            <Bar dataKey="V" name="V类" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="评价因子标准限值">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left py-2 px-2 text-gw-muted">评价因子</th>
                <th className="text-center py-2 px-2 text-gw-muted">单位</th>
                <th className="text-center py-2 px-2 text-gw-muted">类型</th>
                <th className="text-center py-2 px-2" style={{ color: CLASS_COLORS['I'] }}>I类</th>
                <th className="text-center py-2 px-2" style={{ color: CLASS_COLORS['II'] }}>II类</th>
                <th className="text-center py-2 px-2" style={{ color: CLASS_COLORS['III'] }}>III类</th>
                <th className="text-center py-2 px-2" style={{ color: CLASS_COLORS['IV'] }}>IV类</th>
                <th className="text-center py-2 px-2" style={{ color: CLASS_COLORS['V'] }}>V类</th>
              </tr>
            </thead>
            <tbody>
              {groundwaterQualityStandard.evaluationFactors.map((f: FactorItem, i: number) => (
                <tr key={i} className="border-b border-gw-border/20 data-row">
                  <td className="py-1.5 px-2 text-gw-text font-medium">{f.name}</td>
                  <td className="py-1.5 px-2 text-center text-gw-muted">{f.unit || '-'}</td>
                  <td className="py-1.5 px-2 text-center text-gw-muted">{f.type}</td>
                  <td className="py-1.5 px-2 text-center font-mono" style={{ color: CLASS_COLORS['I'] }}>{f.I}</td>
                  <td className="py-1.5 px-2 text-center font-mono" style={{ color: CLASS_COLORS['II'] }}>{f.II}</td>
                  <td className="py-1.5 px-2 text-center font-mono font-medium" style={{ color: CLASS_COLORS['III'] }}>{f.III}</td>
                  <td className="py-1.5 px-2 text-center font-mono" style={{ color: CLASS_COLORS['IV'] }}>{f.IV}</td>
                  <td className="py-1.5 px-2 text-center font-mono" style={{ color: CLASS_COLORS['V'] }}>{f.V}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
