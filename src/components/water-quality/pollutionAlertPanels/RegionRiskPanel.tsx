/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 * 面板组件：RegionRiskPanel（拆分自 PollutionAlertTab.tsx）
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ALERT_LEVELS, REGION_PRESETS, calcBatchRegionRisk } from '../../../utils/pollutionAlertEngine';

export function RegionRiskPanel() {
  const regionResults = useMemo(() => calcBatchRegionRisk(REGION_PRESETS), []);



  const regionColors: Record<string, string> = {
    '山前平原': '#3b82f6',
    '中部平原': '#f59e0b',
    '滨海平原': '#ef4444',
    '冀东平原': '#f97316',
    '坝上高原': '#10b981',
    '山区': '#06b6d4',
  };

  // 风险排名数据
  const rankData = useMemo(() =>
    [...regionResults].sort((a, b) => b.riskScore - a.riskScore),
    [regionResults]
  );

  // 风险饼图数据
  const riskPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    regionResults.forEach(r => { counts[r.riskLevel] = (counts[r.riskLevel] || 0) + 1; });
    return (['安全', '关注', '预警', '警告', '严重'] as const)
      .filter(l => counts[l] > 0)
      .map(l => ({ name: l, value: counts[l], color: ALERT_LEVELS[l].color }));
  }, [regionResults]);

  return (
    <div className="space-y-4">
      <TechCard title="区域风险评分" badge="6大水文地质分区">
        <p className="text-xs text-gw-muted mb-3">基于各区域超标率加权评分，权重反映健康危害程度：毒理指标 &gt; 一般化学指标</p>
      </TechCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 风险排名柱状图 */}
        <LazyChartCard title="区域风险评分排名" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <YAxis dataKey="region" type="category" stroke="#64748b" fontSize={10} width={70} />
              <Tooltip />
              <Bar dataKey="riskScore" name="风险评分" radius={[0, 3, 3, 0]} barSize={14}>
                {rankData.map(entry => (
                  <Cell key={entry.region} fill={regionColors[entry.region] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" />≥75 严重</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" />55~75 警告</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />35~55 预警</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />15~35 关注</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500 inline-block" />&lt;15 安全</span>
          </div>
        </LazyChartCard>
        {/* 风险等级分布 */}
        <LazyChartCard title="区域风险等级分布" height={320}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                {riskPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
      {/* 区域详情表 */}
      <TechCard title="区域风险详情">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">区域</th>
                <th className="text-left p-2 text-gw-muted">范围</th>
                <th className="text-right p-2 text-gw-muted">风险评分</th>
                <th className="text-left p-2 text-gw-muted">风险等级</th>
                <th className="text-left p-2 text-gw-muted">主要风险因子</th>
                <th className="text-left p-2 text-gw-muted">风险描述</th>
              </tr>
            </thead>
            <tbody>
              {rankData.map(r => (
                <tr key={r.region} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.region}</td>
                  <td className="p-2 text-gw-muted">{r.area}</td>
                  <td className="p-2 text-right font-mono font-semibold" style={{ color: ALERT_LEVELS[r.riskLevel].color }}>{r.riskScore}</td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: ALERT_LEVELS[r.riskLevel].color + '20', color: ALERT_LEVELS[r.riskLevel].color }}>
                      {ALERT_LEVELS[r.riskLevel].icon} {r.riskLevel}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {r.primaryRisks.map(f => (
                        <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400">{f}</span>
                      ))}
                      {r.primaryRisks.length === 0 && <span className="text-gw-muted text-[10px]">无</span>}
                    </div>
                  </td>
                  <td className="p-2 text-gw-muted">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
