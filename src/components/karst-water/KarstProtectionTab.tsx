import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Shield, Compass, BookOpen, CheckCircle } from 'lucide-react';
import { karstProtectionZones } from '../../data/karstWater';
import { TechCard, ChartTooltip, DataSourceNote } from '../UI';
import { TechTable } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protectionBarData: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protectionPieData: any[];
}

export function KarstProtectionTab({ protectionBarData, protectionPieData }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="泉域保护区面积" badge={`${karstProtectionZones.length} 个分区`} icon={Shield} height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={protectionBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <ChartTooltip unit="km²" />
              <Bar dataKey="核心区" stackId="a" fill="#ef4444" name="核心区" />
              <Bar dataKey="其他区" stackId="a" fill="#f59e0b" name="其他保护区" />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="保护区面积占比" icon={Compass} height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={protectionPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                {protectionPieData.map((_, i) => <Cell key={i} fill={['#ef4444', '#f59e0b', '#10b981'][i]} />)}
              </Pie>
              <ChartTooltip unit="km²" />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="保护区详情" icon={BookOpen}>
          <TechTable
            headers={['泉域', '保护级别', '总面积(km²)', '核心区(km²)', '关键措施']}
            rows={karstProtectionZones.map(z => [z.spring, z.protectionLevel, z.protectionArea, z.coreArea, z.keyMeasure])}
          />
        </TechCard>

        <TechCard title="泉域保护措施" icon={Shield}>
          <div className="space-y-2.5">
            {[
              { title: '关闭取水井', desc: '一级保护区内工业自备井全部关闭' },
              { title: '生态补水', desc: '利用南水北调富余水量对泉域进行人工补给' },
              { title: '监测预警', desc: '建立泉流量、水位、水质实时监测网络' },
              { title: '污染源排查', desc: '保护区内化工企业搬迁，农业面源污染控制' },
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gw-surface/40 border border-gw-border/20">
                <CheckCircle size={14} className="text-gw-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gw-text">{m.title}</p>
                  <p className="text-[10px] text-gw-muted">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <DataSourceNote source="河北省水资源管理条例 + 泉域保护规划" version="岩溶水保护" />
    </div>
  );
}
