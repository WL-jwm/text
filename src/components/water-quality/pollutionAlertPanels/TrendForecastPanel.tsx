/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 * 面板组件：TrendForecastPanel（拆分自 PollutionAlertTab.tsx）
 */

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { QUALITY_TREND_FORECAST } from '../../../utils/pollutionAlertEngine';

export function TrendForecastPanel() {
  const actualData = QUALITY_TREND_FORECAST.filter(d => !d.period.includes('(预)'));
  const forecastData = QUALITY_TREND_FORECAST.filter(d => d.period.includes('(预)'));

  const targetYear2030 = 85; // 目标：2030年III类+占比85%

  // 连接线数据（实际最后一个点 + 预测第一个点）
  const bridgeData = [
    { period: actualData[actualData.length - 1].period, value: actualData[actualData.length - 1].value },
    { period: forecastData[0].period, value: forecastData[0].value },
  ];

  return (
    <div className="space-y-4">
      <TechCard title="水质改善趋势与预测" badge="2014-2030">
        <p className="text-xs text-gw-muted">基于2014-2024实际数据线性外推，目标2030年III类+占比达85%。数据来源：河北省水资源公报。</p>
      </TechCard>
      <LazyChartCard title="III类及以上占比趋势" height={360}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={QUALITY_TREND_FORECAST} filename="水质改善趋势预测" sheetName="趋势预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={[...actualData, ...bridgeData, ...forecastData]} margin={{ top: 10, right: 20 }}>
            <defs>
              <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
            <XAxis dataKey="period" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* 实际数据 */}
            <Area type="monotone" dataKey="value" name="III类+占比(实际)" stroke="#3b82f6" fill="url(#gActual)" strokeWidth={2}
              data={actualData} />
            {/* 预测数据 */}
            <Area type="monotone" dataKey="value" name="III类+占比(预测)" stroke="#f59e0b" fill="url(#gForecast)" strokeWidth={2} strokeDasharray="5 5"
              data={forecastData} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-gw-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />实际数据</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />线性预测</span>
          <span className="ml-4">目标：2030年达{targetYear2030}%</span>
        </div>
      </LazyChartCard>
      {/* 里程碑 */}
      <TechCard title="改善里程碑">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { year: '2015', event: '超采治理启动', value: '25.8%', color: '#ef4444', icon: AlertTriangle },
            { year: '2022', event: 'III类+首超50%', value: '50.3%', color: '#f59e0b', icon: TrendingUp },
            { year: '2024', event: '达标率63.5%', value: '63.5%', color: '#3b82f6', icon: ShieldCheck },
          ].map(m => (
            <div key={m.year} className="flex items-start gap-3 p-3 rounded-lg bg-gw-surface">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + '20' }}>
                <m.icon size={16} style={{ color: m.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gw-text">{m.year}年</div>
                <div className="text-xs text-gw-muted">{m.event}</div>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: m.color }}>{m.value}</div>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
