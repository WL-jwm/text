import React, { useMemo } from 'react';
import {
  ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Globe, AlertTriangle, Target, Zap, BarChart3,
} from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, CHART_COLORS } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartExport } from '../../components/ChartExport';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { CrossLinkPanel } from '../../components/CrossLink';
import { SPATIAL_DATA, getZone } from './spatialData';

/** Tab 3: 空间异常检测 */
export function AnomalyTab() {
  // 水位异常（偏离均值>1.5倍标准差）
  const meanWl = SPATIAL_DATA.reduce((s, d) => s + d.waterLevel, 0) / SPATIAL_DATA.length;
  const stdWl = Math.sqrt(SPATIAL_DATA.reduce((s, d) => s + (d.waterLevel - meanWl) ** 2, 0) / SPATIAL_DATA.length);
  const threshold = 1.5;

  const anomalies = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      city: d.city,
      指标: '水位埋深',
      实测值: d.waterLevel + 'm',
      均值: meanWl.toFixed(1) + 'm',
      标准差: stdWl.toFixed(1),
      偏离: ((d.waterLevel - meanWl) / stdWl).toFixed(2),
      类型: Math.abs(d.waterLevel - meanWl) > threshold * stdWl ? '异常' : '正常',
      分区: getZone(d.city),
    })).sort((a, b) => Math.abs(parseFloat(b.偏离)) - Math.abs(parseFloat(a.偏离))),
  []);

  const anomalyCount = anomalies.filter(a => a.类型 === '异常').length;
  const normalCount = anomalies.length - anomalyCount;

  // 异常分类饼图
  const typePie = useMemo(() => [
    { name: '异常(>1.5σ)', value: anomalyCount },
    { name: '正常', value: normalCount },
  ], []);

  // 分区异常分布
  const zoneAnomaly = useMemo(() => {
    const m: Record<string, number> = {};
    anomalies.filter(a => a.类型 === '异常').forEach(a => { m[a.分区] = (m[a.分区] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="检测城市" value={SPATIAL_DATA.length} unit="市" icon={Globe} subtitle="全空间覆盖" accent="blue" />
        <StatCard title="异常城市" value={anomalyCount} unit="市" icon={AlertTriangle} subtitle={`>1.5σ(${threshold}标准差)`} accent="red" />
        <StatCard title="正常城市" value={normalCount} unit="市" icon={Target} subtitle="在正常波动范围" accent="emerald" />
        <StatCard title="最大偏离" value={Math.max(...anomalies.map(a => Math.abs(parseFloat(a.偏离)))).toFixed(2)} unit="σ" icon={Zap} subtitle={anomalies[0]?.city} accent="amber" />
        <StatCard title="阈值" value={threshold.toFixed(1)} unit="σ" icon={BarChart3} subtitle="IQR*1.5" accent="cyan" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 异常分布饼图 */}
        <LazyChartCard title="异常/正常分布" height={220}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typePie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                <Cell fill="#ef4444" />
                <Cell fill="#22c55e" />
              </Pie>
              <Tooltip content={<ChartTooltip title="异常分布" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* 分区异常分布 */}
        <LazyChartCard title="异常城市分区分布" height={220}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={zoneAnomaly} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} ${value}市`}>
                {zoneAnomaly.map((entry, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="分区异常" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 异常检测结果表 */}
      <TechCard title="水位埋深空间异常检测结果">
        <div className="mb-2 flex justify-end">
          <ChartExport data={anomalies} filename="空间异常检测结果" sheetName="异常检测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['城市', '指标', '实测值', '均值', '标准差', '偏离(σ)', '类型', '分区']}
          rows={anomalies.map(a => [a.city, a.指标, a.实测值, a.均值, a.标准差, a.偏离, a.类型, a.分区])}
          filterPlaceholder="搜索城市..."
        />
      </TechCard>

      {/* 分析说明 */}
      <TechCard title="空间异常分析方法说明" badge="1.5σ准则">
        <div className="space-y-2">
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">方法：</span>基于各市浅层地下水水位埋深均值和标准差，使用1.5σ准则（IQR方法）识别空间异常值。偏离|z| &gt; 1.5的城市标记为异常。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">结果解读：</span>衡水(40m)和邢台(35m)因位于山前平原深层漏斗区，水位埋深显著高于全省均值{meanWl.toFixed(1)}m。张家口(12m)和承德(6m)因位于山区，水位浅于均值，属正常波动。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">应用建议：</span>异常高值区应加强监测频率，关注超采漏斗演化趋势；异常低值区可考虑作为应急水源地候选。</p>
        </div>
      </TechCard>

      {/* 跨模块关联链接 */}
      <CrossLinkPanel currentPath="/spatial" />
    </div>
  );
}
