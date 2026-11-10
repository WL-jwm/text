/**
 * 拆分自 MineralWater.tsx — 开发现状面板（产业 KPI / 概况 / 状态分布饼图）
 */

import {
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Database, CheckCircle, Gauge, TrendingUp, Compass, MapPin } from 'lucide-react';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../../components/UI';
import { mineralWaterIndustry } from '../../data/mineralWater';
import { LazyChartCard } from '../../components/LazyChartCard';
import { CrossLinkPanel } from '../../components/CrossLink';

export function DevelopmentTabPanel() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="总许可证" value={mineralWaterIndustry.totalPermits} unit="个" icon={Database} accent="blue" />
        <StatCard title="生产中" value={mineralWaterIndustry.producing} unit="个" icon={CheckCircle} accent="green" />
        <StatCard title="勘查中" value={mineralWaterIndustry.exploring} unit="个" icon={Gauge} accent="amber" />
        <StatCard title="年产值" value={mineralWaterIndustry.annualRevenue} icon={TrendingUp} accent="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="产业概况" icon={Compass}>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gw-muted">年产量</span>
              <span className="text-gw-text">{mineralWaterIndustry.annualOutput}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gw-muted">市场份额</span>
              <span className="text-gw-text">{mineralWaterIndustry.marketShare}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gw-muted">年均增长率</span>
              <span className="text-gw-text">{mineralWaterIndustry.growthRate}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gw-muted">主要消费区</span>
              <span className="text-gw-text">{mineralWaterIndustry.mainConsumption}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gw-muted">主要品牌</span>
              <span className="text-gw-text text-[10px]">{mineralWaterIndustry.mainBrands}</span>
            </div>
          </div>
        </TechCard>

        <LazyChartCard title="产地状态分布" icon={MapPin} height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={[
                { name: '生产中', value: mineralWaterIndustry.producing },
                { name: '勘查中', value: mineralWaterIndustry.exploring },
              ]} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>      <CrossLinkPanel currentPath="/mineral-water" />
  <DataSourceNote source="2024年河北省矿泉水产业发展报告" version="产业概况" />
    </div>
  );
}
