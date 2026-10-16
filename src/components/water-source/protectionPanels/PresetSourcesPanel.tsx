/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 * 面板: PresetSourcesPanel（拆分自 ProtectionZoneTab.tsx）
 */
import { calcAllPresets } from '../../../utils/protectionZoneCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { PipelinePanel } from '../../PipelinePanel';
import { TechCard } from '../../UI';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { BarChart, Tooltip, ResponsiveContainer, Bar, Legend, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TOOLTIP_STYLE } from './protectionConstants';

export function PresetSourcesPanel() {
  const results = useMemo(() => calcAllPresets(), []);

  const barData = useMemo(() =>
    results.map(r => ({
      name: r.sourceName.replace('水源地', ''),
      '一级': r.primaryRadius,
      '二级': r.secondaryRadius,
    })),
    [results],
  );

  const areaData = useMemo(() =>
    results.map(r => ({
      name: r.sourceName.replace('水源地', ''),
      '一级面积': r.zones[0]?.area || 0,
      '二级面积': r.zones[1]?.area || 0,
      '总面积': r.totalArea,
    })),
    [results],
  );

  return (
    <div className="space-y-4">
      <TechCard icon={MapPin} title="河北重要水源地保护区划分一览" badge={`${results.length}个水源地`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">水源地</th>
                <th className="text-left p-2 text-gw-muted">类型</th>
                <th className="text-right p-2 text-gw-muted">一级R(m)</th>
                <th className="text-right p-2 text-gw-muted">一级A(km²)</th>
                <th className="text-right p-2 text-gw-muted">二级R(m)</th>
                <th className="text-right p-2 text-gw-muted">二级A(km²)</th>
                <th className="text-right p-2 text-gw-muted">总面积(km²)</th>
                <th className="text-left p-2 text-gw-muted">划分方法</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.sourceName} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.sourceName}</td>
                  <td className="p-2 text-gw-muted">{r.sourceType}</td>
                  <td className="p-2 text-right font-mono text-red-400">{r.primaryRadius}</td>
                  <td className="p-2 text-right font-mono text-gw-muted">{r.zones[0]?.area || 0}</td>
                  <td className="p-2 text-right font-mono text-amber-400">{r.secondaryRadius}</td>
                  <td className="p-2 text-right font-mono text-gw-muted">{r.zones[1]?.area || 0}</td>
                  <td className="p-2 text-right font-mono font-semibold text-blue-400">{r.totalArea}</td>
                  <td className="p-2 text-gw-muted text-[11px]">{r.methodSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各水源地保护区半径对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={barData} filename="水源地保护区半径" sheetName="保护区半径" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit="m" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="一级" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="二级" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各水源地保护区面积对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={areaData} filename="水源地保护区面积" sheetName="保护区面积" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={areaData} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit="km²" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="一级面积" stackId="a" fill="#ef4444" />
              <Bar dataKey="二级面积" stackId="a" fill="#f59e0b" />
              <Bar dataKey="总面积" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}
