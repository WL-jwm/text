/*
 * 组件：ExtractionTrendChart（拆分自 balanceCharts.tsx）
 */

import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TechCard, StatCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { EXTRACTION_TREND, calcExtractionTrendSummary } from '../../../utils/balanceCalculator';
import { TOOLTIP_STYLE } from '../balanceConstants';

export function ExtractionTrendChart() {
  const trendData = EXTRACTION_TREND;
  const trendSummary = useMemo(() => calcExtractionTrendSummary(trendData), [trendData]);

  // 用途结构数据
  const usageData = useMemo(() =>
    trendData.map(d => ({
      year: d.year,
      '农业灌溉': Math.round(d.totalExtraction * d.agriRatio * 10) / 10,
      '工业': Math.round(d.totalExtraction * d.industrialRatio * 10) / 10,
      '生活': Math.round(d.totalExtraction * d.domesticRatio * 10) / 10,
      '生态': Math.round(d.totalExtraction * d.ecologicalRatio * 10) / 10,
    })),
    [trendData],
  );

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          title="峰值开采量"
          value={`${trendSummary.peakValue}`}
          unit="亿m\u00b3/a"
          subtitle={`${trendSummary.peakYear}年`}
          accent="red"
        />
        <StatCard
          title="最新开采量"
          value={`${trendSummary.latestValue}`}
          unit="亿m\u00b3/a"
          subtitle={`${trendSummary.latestYear}年`}
          accent="blue"
        />
        <StatCard
          title="累计压减量"
          value={`${trendSummary.totalReduction.toFixed(1)}`}
          unit="亿m\u00b3"
          subtitle={`降幅 ${(trendSummary.reductionRate * 100).toFixed(1)}%`}
          accent="emerald"
        />
        <StatCard
          title="年均压减"
          value={`${trendSummary.avgAnnualReduction.toFixed(2)}`}
          unit="亿m\u00b3/a"
          subtitle="压采政策效果"
          accent="cyan"
        />
        <StatCard
          title="浅/深层贡献"
          value={`${trendSummary.shallowReduction.toFixed(0)}`}
          unit={`/ ${trendSummary.deepReduction.toFixed(0)}`}
          subtitle="浅层/深层压减量"
          accent="violet"
        />
      </div>

      {/* 双图布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 总开采量堆叠面积图 */}
        <LazyChartCard title="地下水开采量年度趋势（浅层+深层）" height={380}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={trendData} filename="开采量年度趋势" sheetName="趋势数据" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={trendData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gShallow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gDeep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['dataMin - 10', 'dataMax + 10']} unit=" 亿m\u00b3" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="shallowExtraction" name="浅层水" stackId="1" stroke="#3b82f6" fill="url(#gShallow)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="deepExtraction" name="深层水" stackId="1" stroke="#8b5cf6" fill="url(#gDeep)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />浅层水</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500 inline-block" />深层水</span>
            <span>2003年峰值170.2亿m\u00b3 → 2024年107.8亿m\u00b3</span>
          </div>
        </LazyChartCard>

        {/* 用途结构面积图 */}
        <LazyChartCard title="开采量用途结构变化（2000-2024）" height={380}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={usageData} filename="开采量用途结构" sheetName="用途结构" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={usageData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gAgri" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gIndus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gDom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gEco" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" 亿m\u00b3" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="农业灌溉" stackId="usage" stroke="#f59e0b" fill="url(#gAgri)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="工业" stackId="usage" stroke="#6366f1" fill="url(#gIndus)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="生活" stackId="usage" stroke="#06b6d4" fill="url(#gDom)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="生态" stackId="usage" stroke="#10b981" fill="url(#gEco)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />农业</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" />工业</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500 inline-block" />生活</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" />生态</span>
          </div>
        </LazyChartCard>
      </div>

      {/* 压采政策里程碑 */}
      <TechCard title="压采政策里程碑">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { year: '2000', event: '历史峰值区间', detail: '年均开采170亿m\u00b3，深层超采严重', color: '#ef4444' },
            { year: '2014', event: '国家地下水超采综合治理', detail: '河北率先启动压采试点', color: '#f59e0b' },
            { year: '2019', event: '南水北调中线通水5年', detail: '城镇供水替代深层水开采', color: '#3b82f6' },
            { year: '2024', event: '压采成效显著', detail: '降至107.8亿m\u00b3，降幅36.7%', color: '#10b981' },
          ].map(m => (
            <div key={m.year} className="flex items-start gap-3 p-3 rounded-lg bg-gw-surface">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: m.color }}>
                  {m.year}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gw-text">{m.event}</div>
                <div className="text-[10px] text-gw-muted mt-0.5">{m.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
