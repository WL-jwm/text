/**
 * B-19 岩溶泉流量衰减分析 Tab
 *
 * 4大面板：
 *  1. 衰减分析 — Maillet指数衰减模型 + 衰减曲线
 *  2. 滞后相关 — 降水-泉流量滞后相关分析
 *  3. 调蓄评价 — 系统调蓄功能评价
 *  4. 预设泉域 — 6个河北岩溶大泉对比 + 衰减系数参考表
 * 面板: CorrelationPanel（拆分自 SpringDecayTab.tsx）
 */
import { type CorrelationInput, calcCorrelation } from '../../../utils/springDecayCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, StatCard } from '../../UI';
import { Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Legend, BarChart, Cell, ResponsiveContainer, Tooltip, CartesianGrid, Bar, Line, XAxis, ComposedChart, YAxis, ReferenceLine } from 'recharts';
import { REGULATION_COLORS, TOOLTIP_STYLE } from './springDecayConstants';

export function CorrelationPanel() {
  // 预设月度降水-流量数据（模拟典型岩溶泉域年序列）
  const defaultData = useMemo(() => [
    { month: '1月', rainfall: 8, discharge: 5.2 },
    { month: '2月', rainfall: 12, discharge: 4.8 },
    { month: '3月', rainfall: 20, discharge: 4.5 },
    { month: '4月', rainfall: 35, discharge: 5.0 },
    { month: '5月', rainfall: 45, discharge: 6.5 },
    { month: '6月', rainfall: 80, discharge: 7.2 },
    { month: '7月', rainfall: 180, discharge: 8.0 },
    { month: '8月', rainfall: 160, discharge: 11.5 },
    { month: '9月', rainfall: 55, discharge: 10.8 },
    { month: '10月', rainfall: 30, discharge: 8.5 },
    { month: '11月', rainfall: 15, discharge: 6.8 },
    { month: '12月', rainfall: 10, discharge: 5.5 },
  ], []);

  const [name, setName] = useState('威州泉');
  const [data, setData] = useState(defaultData);
  const [maxLag, setMaxLag] = useState(6);

  const input: CorrelationInput = { name, data, maxLag };
  const result = useMemo(() => calcCorrelation(input), [input]);

  const updateData = (idx: number, field: 'rainfall' | 'discharge', value: number) => {
    setData(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  return (
    <div className="space-y-4">
      <TechCard title="降水-泉流量滞后相关分析" icon={Activity}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-gw-muted block mb-1">泉域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">最大滞后月数</label>
            <input type="number" value={maxLag} onChange={e => setMaxLag(parseInt(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>

        {/* 月度数据编辑表 */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1 text-left text-gw-muted">月份</th>
                {data.map((d, i) => (
                  <th key={i} className="px-2 py-1 text-center text-gw-muted">{d.month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gw-border/50">
                <td className="px-2 py-1 text-gw-text">降水</td>
                {data.map((d, i) => (
                  <td key={i} className="px-1 py-1">
                    <input type="number" value={d.rainfall} onChange={e => updateData(i, 'rainfall', parseFloat(e.target.value) || 0)}
                      className="w-14 bg-gw-card-alt border border-gw-border rounded px-1 py-0.5 text-xs text-gw-text text-center" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-2 py-1 text-gw-text">流量(m³/s)</td>
                {data.map((d, i) => (
                  <td key={i} className="px-1 py-1">
                    <input type="number" step="0.1" value={d.discharge} onChange={e => updateData(i, 'discharge', parseFloat(e.target.value) || 0)}
                      className="w-14 bg-gw-card-alt border border-gw-border rounded px-1 py-0.5 text-xs text-gw-text text-center" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="最佳滞后期" value={result.bestLag} unit="月" accent="text-blue-400" />
        <StatCard title="相关系数 r" value={result.bestR} accent={REGULATION_COLORS[result.correlation] ?? '#6b7280'} />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">相关性等级</span>
          <span className="text-xl font-bold" style={{ color: REGULATION_COLORS[result.correlation] ?? '#6b7280' }}>
            {result.correlation}
          </span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center">
          <span className="text-xs text-gw-muted mb-1">系统判断</span>
          <span className="text-xs text-gw-text">{result.note}</span>
        </div>
      </div>

      <LazyChartCard title="不同滞后期相关系数">
        <ChartExport data={result.lagResults} filename={`${name}_滞后相关分析`} />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={result.lagResults} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lag" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '滞后期(月)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[-1, 1]} />
            <Tooltip {...TOOLTIP_STYLE} />
            <ReferenceLine y={0.8} stroke="#10b981" strokeDasharray="3 3" label={{ value: '极强(0.8)', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine y={0.6} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '强(0.6)', fill: '#3b82f6', fontSize: 10 }} />
            <ReferenceLine y={0.3} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '中等(0.3)', fill: '#f59e0b', fontSize: 10 }} />
            <Bar dataKey="r" name="相关系数" radius={[4, 4, 0, 0]}>
              {result.lagResults.map((entry, idx) => (
                <Cell key={idx} fill={Math.abs(entry.r) === Math.abs(result.bestR) ? '#10b981' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      {/* 降水-流量双轴图 */}
      <LazyChartCard title="月度降水-泉流量对比">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/s', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="rainfall" name="降水量(mm)" fill="#3b82f6" fillOpacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="discharge" name="泉流量(m³/s)" stroke="#ef4444" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}
