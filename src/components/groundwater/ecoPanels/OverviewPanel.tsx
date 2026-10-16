/**
 * 面板: OverviewPanel（拆分自 EcosystemServiceTab.tsx）
 */
import { calculateEcosystemService } from '../../../utils/ecosystemServiceEvaluator';
import { TechCard } from '../../UI';
import { AlertCircle } from 'lucide-react';
import { YAxis, Cell, Pie, CartesianGrid, XAxis, PieChart, ComposedChart, BarChart, ResponsiveContainer, Tooltip, Bar, Legend, Line } from 'recharts';
import { CATEGORY_COLORS, TOOLTIP_STYLE } from './ecoConstants';
import { StatBox } from './StatBox';

export function OverviewPanel({ result }: { result: ReturnType<typeof calculateEcosystemService> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="总生态系统服务价值" value={result.totalValue.toLocaleString()} unit="万元/年" color="#06b6d4" />
        <StatBox label="可持续性评分" value={result.sustainabilityScore} unit="/100" color={result.sustainabilityScore >= 55 ? '#10b981' : '#f59e0b'} />
        <StatBox label="可持续性等级" value={result.sustainabilityLevel} color={result.sustainabilityScore >= 55 ? '#10b981' : '#f59e0b'} />
        <StatBox label="服务类型数" value={4} unit="大类" color="#8b5cf6" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">生态系统服务价值构成</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={result.valueByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(e: { category?: string; percentage?: number }) => `${e.category || ''} ${e.percentage || 0}%`}>
                {result.valueByCategory.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
            </PieChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={result.valueByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={70} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {result.valueByCategory.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">各地区生态系统服务价值对比</h4>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={result.valueByRegion}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="region" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '总价值(万元)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '人均(万元)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="value" name="总价值" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="perCapita" name="人均价值" stroke="#f59e0b" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">管理建议</h4>
        <ul className="space-y-1.5">
          {result.recommendations.map((r, i) => (
            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </TechCard>
    </div>
  );
}
