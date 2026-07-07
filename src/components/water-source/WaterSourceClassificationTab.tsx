import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { waterSourceClassification } from '../../data/waterSource';
import { TechCard, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';

const TYPE_COLORS: Record<string, string> = {
  '岩溶水': '#06b6d4',
  '孔隙水': '#3b82f6',
  '裂隙水': '#10b981',
  '构造裂隙水': '#8b5cf6',
  '风化裂隙水': '#f59e0b',
};

export function WaterSourceClassificationTab() {
  // 按类型统计
  const typePie = React.useMemo(() => {
    const counts: Record<string, number> = {};
    waterSourceClassification.forEach(c => {
      const type = c.medium || '其他';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: TYPE_COLORS[name] || '#64748b',
    }));
  }, []);

  return (
    <div className="space-y-4">
      <LazyChartCard title="水源地类型分布" badge={`${waterSourceClassification.length}类`} className="scan-line" height={320}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={typePie} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
              {typePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip title="水源地类型" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="水源地分类标准(HJ/T338-2007)">
        <FilterableTechTable
          headers={['编号', '类型', '模型', '介质', '稳定性', '代表']}
          rows={waterSourceClassification.map(c => [c.code, c.name, c.model, c.medium, c.stabilityType, c.representative])}
          pageSize={10}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
