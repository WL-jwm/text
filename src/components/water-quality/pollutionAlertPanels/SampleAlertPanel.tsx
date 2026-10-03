/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 * 面板组件：SampleAlertPanel（拆分自 PollutionAlertTab.tsx）
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ALERT_LEVELS, DEFAULT_THRESHOLDS, calcAlertSummary, getDemoAlertResults, type AlertThresholds, type FactorAlertResult } from '../../../utils/pollutionAlertEngine';
import { AlertOverviewPanel } from './AlertOverviewPanel';

export function SampleAlertPanel() {
  const [thresholds, _setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);

  const results = useMemo(() => getDemoAlertResults(thresholds), [thresholds]);
  const summary = useMemo(() => calcAlertSummary(results), [results]);

  // 热力图数据
  const heatmapData = useMemo(() => {
    const allFactors = new Set<string>();
    results.forEach(r => r.factors.forEach(f => allFactors.add(f.name)));
    return {
      factors: [...allFactors],
      samples: results.map(r => ({
        name: r.sampleName,
        level: r.level,
        factorLevels: r.factors.reduce<Record<string, FactorAlertResult>>((acc, f) => { acc[f.name] = f; return acc; }, {}),
      })),
    };
  }, [results]);

  // 超标因子排名数据
  const factorRankData = useMemo(() => {
    const factorMap: Record<string, { count: number; maxPi: number; levels: Record<string, number> }> = {};
    results.forEach(r => {
      r.factors.forEach(f => {
        if (!factorMap[f.name]) factorMap[f.name] = { count: 0, maxPi: 0, levels: {} };
        if (f.levelNum >= 2) factorMap[f.name].count++;
        if (f.Pi !== null && f.Pi > factorMap[f.name].maxPi) factorMap[f.name].maxPi = f.Pi;
        factorMap[f.name].levels[f.level] = (factorMap[f.name].levels[f.level] || 0) + 1;
      });
    });
    return Object.entries(factorMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  return (
    <div className="space-y-4">
      <AlertOverviewPanel summary={summary} />
      <TechCard title="水样预警结果" badge={`${results.length}个水样`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">水样名称</th>
                <th className="text-left p-2 text-gw-muted">预警等级</th>
                <th className="text-right p-2 text-gw-muted">超标因子数</th>
                <th className="text-right p-2 text-gw-muted">污染指数</th>
                <th className="text-left p-2 text-gw-muted">主要超标因子</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.sampleName} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 text-gw-text">{r.sampleName}</td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: ALERT_LEVELS[r.level].color + '20', color: ALERT_LEVELS[r.level].color }}>
                      {ALERT_LEVELS[r.level].icon} {r.level}
                    </span>
                  </td>
                  <td className="p-2 text-right text-gw-text">{r.exceededCount}</td>
                  <td className="p-2 text-right font-mono text-gw-text">{r.pollutionIndex.toFixed(2)}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {r.exceededFactors.map(f => (
                        <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400">{f}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
      {/* 超标因子排名 */}
      <LazyChartCard title="因子超标频次与最大Pi" height={300}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={factorRankData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
            <XAxis type="number" stroke="#64748b" fontSize={10} />
            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={120} />
            <Tooltip />
            <Bar dataKey="count" name="超标次数" fill="#ef4444" radius={[0, 3, 3, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>
      {/* 因子热力图 */}
      <TechCard title="因子预警等级热力图" badge="水样×因子">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-1.5 text-gw-muted sticky left-0 bg-gw-bg">水样</th>
                {heatmapData.factors.map(f => (
                  <th key={f} className="p-1.5 text-gw-muted text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', maxHeight: 80 }}>{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.samples.map(s => (
                <tr key={s.name} className="border-b border-gw-border/50">
                  <td className="p-1.5 text-gw-text sticky left-0 bg-gw-bg whitespace-nowrap">{s.name.split('-').slice(0, 2).join('-')}</td>
                  {heatmapData.factors.map(f => {
                    const fr = s.factorLevels[f];
                    if (!fr || fr.Pi === null) return <td key={f} className="p-1.5 text-center text-gw-muted">-</td>;
                    return (
                      <td key={f} className="p-1.5 text-center" style={{ backgroundColor: ALERT_LEVELS[fr.level].color + '30' }}>
                        <span style={{ color: ALERT_LEVELS[fr.level].color }}>{fr.Pi.toFixed(2)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-gw-muted">
          {(['安全', '关注', '预警', '警告', '严重'] as const).map(l => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-3 h-2 rounded" style={{ backgroundColor: ALERT_LEVELS[l].color + '50' }} />
              {l}
            </span>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
