/**
 * 拆分自 HistoricalParamCalculatorTab.tsx — 地质年代面板
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Atom, Droplets, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { calcAllAges } from '../../../utils/historicalParamCalculator';


export function AgePanel() {
  const results = useMemo(() => calcAllAges(), []);

  const AGE_COLORS: Record<string, string> = {
    '现代水': '#10b981', '全新世水': '#06b6d4', '晚更新世水': '#f59e0b',
    '中更新世水': '#f97316', '古水': '#ef4444',
  };

  const chartData = results.map(r => ({
    name: r.name.length > 8 ? r.name.substring(0, 8) + '...' : r.name,
    c14校正: r.c14CorrectedAge,
    稀释模型: r.c14DilutionAge,
    地层对比: r.stratigraphicEstimate,
    推荐值: r.recommendedAge,
    color: AGE_COLORS[r.ageCategory] ?? '#64748b',
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="监测点" value={results.length} unit="个" icon={Atom} accent="blue" />
        <StatCard title="古水(>3.5万年)" value={results.filter(r => r.ageCategory === '古水').length} unit="个" icon={Atom} accent="red" />
        <StatCard title="现代水(<50年)" value={results.filter(r => r.ageCategory === '现代水').length} unit="个" icon={Droplets} accent="emerald" />
        <StatCard title="最大年龄" value={Math.max(...results.map(r => r.recommendedAge)).toLocaleString()} unit="年" icon={BookOpen} accent="amber" />
      </div>

      <LazyChartCard title="各监测点地下水年龄对比" height={300}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: '年龄(a)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="年龄估算" unit="年" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="c14校正" name="¹⁴C校正" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar dataKey="稀释模型" name="¹⁴C稀释" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="地层对比" name="地层对比" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各监测点年龄估算汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            监测点: r.name,
            C14校正年龄: r.c14CorrectedAge,
            C14稀释年龄: r.c14DilutionAge,
            地层对比年龄: r.stratigraphicEstimate,
            推荐年龄: r.recommendedAge,
            年龄分类: r.ageCategory,
            氚法判定: r.tritiumAge,
          }))} filename="groundwater-age" sheetName="地下水年龄" formats={['xlsx', 'csv', 'json']} label="导出年龄数据" />
        </div>
        <FilterableTechTable
          headers={['监测点', '¹⁴C校正(a)', '¹⁴C稀释(a)', '地层对比(a)', '推荐年龄(a)', '分类', '氚法判定']}
          rows={results.map(r => [
            r.name, String(r.c14CorrectedAge), String(r.c14DilutionAge),
            String(r.stratigraphicEstimate), String(r.recommendedAge),
            r.ageCategory, r.tritiumAge,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="年龄分类说明" icon={BookOpen}>
        <div className="space-y-2">
          {[
            { cat: '现代水', range: '<50年', color: '#10b981', desc: '当代补给水，含核爆氚，可更新性强' },
            { cat: '全新世水', range: '50~1000年', color: '#06b6d4', desc: '全新世补给，氚衰减，补给周期较长' },
            { cat: '晚更新世水', range: '1000~10000年', color: '#f59e0b', desc: '晚更新世补给，无核爆氚，更新缓慢' },
            { cat: '中更新世水', range: '10000~35000年', color: '#f97316', desc: '中更新世补给， fossil水，不可更新' },
            { cat: '古水', range: '>35000年', color: '#ef4444', desc: '地质历史时期补给，开采即消耗，需严格保护' },
          ].map(g => (
            <div key={g.cat} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: g.color }}>{g.cat}</span>
                <span className="text-[10px] font-mono text-gw-text">{g.range}</span>
              </div>
              <div className="text-[10px] text-gw-muted mt-1">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》(1980年代) | ¹⁴C测年方法(Stuiver&Polach,1977) | 氚法测年(IAEA)" version="B-28" />
    </div>
  );
}
