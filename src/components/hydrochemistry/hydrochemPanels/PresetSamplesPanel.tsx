/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 * 面板: PresetSamplesPanel（拆分自 HydrochemCalculatorTab.tsx）
 */
import { PRESET_SAMPLES, calcHardness, analyzeHydrochem } from '../../../utils/hydrochemCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard } from '../../UI';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { Legend, BarChart, ResponsiveContainer, Tooltip, CartesianGrid, Bar, XAxis, YAxis } from 'recharts';
import { TOOLTIP_STYLE } from './hydrochemConstants';
import { PiperScatterSVG } from './PiperScatterSVG';

export function PresetSamplesPanel() {
  const results = useMemo(() => PRESET_SAMPLES.map(s => ({ ...s, analysis: analyzeHydrochem(s.input) })), []);

  const barData = useMemo(() =>
    results.map(r => ({
      name: r.name.split('-')[0],
      TDS: r.analysis.calculatedTDS,
      硬度: calcHardness(r.input.Ca, r.input.Mg),
      氯离子: r.input.Cl,
    })),
    [results],
  );

  const piperPoints = useMemo(() =>
    results.map(r => ({
      name: r.name.split('-')[0],
      x: r.analysis.piper.diamond.x,
      y: r.analysis.piper.diamond.y,
      type: r.analysis.sukalief.type,
      color: r.analysis.sukalief.color,
    })),
    [results],
  );

  return (
    <div className="space-y-4">
      <TechCard icon={MapPin} title="河北典型水样水化学分析" badge={`${results.length}个水样`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">水样</th>
                <th className="text-left p-2 text-gw-muted">区域</th>
                <th className="text-left p-2 text-gw-muted">水化学类型</th>
                <th className="text-right p-2 text-gw-muted">TDS(mg/L)</th>
                <th className="text-right p-2 text-gw-muted">硬度(mg/L)</th>
                <th className="text-left p-2 text-gw-muted">水质评价</th>
                <th className="text-left p-2 text-gw-muted">典型区域</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.name} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.name}</td>
                  <td className="p-2 text-gw-muted">{r.zone}</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: r.analysis.sukalief.color + '20', color: r.analysis.sukalief.color }}>
                      {r.analysis.sukalief.type}
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono text-gw-text">{r.analysis.calculatedTDS}</td>
                  <td className="p-2 text-right font-mono text-gw-text">{calcHardness(r.input.Ca, r.input.Mg)}</td>
                  <td className="p-2" style={{ color: r.analysis.sukalief.color }}>{r.analysis.sukalief.quality}</td>
                  <td className="p-2 text-gw-muted text-[11px]">{r.analysis.sukalief.typicalZone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各水样TDS/硬度/氯离子对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={barData} filename="水样指标对比" sheetName="指标对比" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="TDS" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="硬度" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="氯离子" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* Piper菱形散点图 */}
        <LazyChartCard title="Piper菱形图（多水样投影）" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={piperPoints} filename="Piper菱形坐标" sheetName="Piper坐标" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <PiperScatterSVG points={piperPoints} />
        </LazyChartCard>
      </div>
    </div>
  );
}
