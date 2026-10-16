/**
 * B-24 地下水功能评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入14项指标 → 四维度评分+综合评价
 *  2. 预设分区 — 6个河北典型功能区对比
 *  3. 评分标准 — 各指标评分细则
 *  4. 权重方法 — AHP权重+功能等级标准
 * 面板: PresetZonesPanel（拆分自 GroundwaterFunctionCalculatorTab.tsx）
 */
import { scoreToColor, PRESET_ZONES, calcFunctionSummary, calcAllPresetZones } from '../../../utils/groundwaterFunctionCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard, ChartTooltip, TechCard } from '../../UI';
import { Calculator, MapPin, BookOpen, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { YAxis, Cell, CartesianGrid, XAxis, ReferenceLine, BarChart, ResponsiveContainer, ScatterChart, Tooltip, Bar, Scatter } from 'recharts';
import { TOOLTIP_STYLE } from './gwFuncConstants';

export function PresetZonesPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);
  const summary = useMemo(() => calcFunctionSummary(), []);

  const scoreBarData = results.map(r => ({
    name: r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name,
    fullName: r.name,
    score: r.comprehensiveScore,
    grade: r.functionGrade,
    color: scoreToColor(r.comprehensiveScore),
  }));

  const scatterData = results.map((r, i) => {
    const zone = PRESET_ZONES[i];
    return {
      name: r.name,
      supply: r.dimensions[0].totalScore,
      geoEnv: r.dimensions[2].totalScore,
      score: r.comprehensiveScore,
      color: scoreToColor(r.comprehensiveScore),
      utilization: zone.utilizationRate,
    };
  });

  const dimAvgData = summary.dimAvg.map(d => ({
    name: d.dimension.replace('功能', ''),
    score: d.avgScore,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="评价单元" value={summary.zoneCount} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="平均综合得分" value={summary.avgScore} unit="分" icon={Calculator} accent="cyan" />
        <StatCard title="最高得分" value={summary.maxScore} unit="分" icon={BookOpen} accent="emerald" />
        <StatCard title="最低得分" value={summary.minScore} unit="分" icon={Settings} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分区综合得分对比" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreBarData} margin={{ left: 0, right: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip title="综合得分" unit="分" />} />
              <ReferenceLine y={70} stroke="#06b6d4" strokeDasharray="5 5" label={{ value: '良好', fill: '#06b6d4', fontSize: 10 }} />
              <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '中等', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="score" name="综合得分" radius={[2, 2, 0, 0]}>
                {scoreBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="供水功能 vs 地质环境功能" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="supply" name="供水功能" unit="分" stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <YAxis type="number" dataKey="geoEnv" name="地质环境" unit="分" stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4">
                {scatterData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Scatter>
              <ReferenceLine x={55} stroke="#f59e0b" strokeDasharray="5 5" />
              <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <LazyChartCard title="各维度平均得分" height={260}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dimAvgData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip title="维度平均分" unit="分" />} />
            <Bar dataKey="score" name="平均得分" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <ReferenceLine y={70} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各分区综合评价结果">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            评价单元: r.name,
            综合得分: r.comprehensiveScore,
            功能等级: r.functionGrade,
            主导功能: r.dominantFunction,
            供水功能: r.dimensions[0].totalScore,
            生态功能: r.dimensions[1].totalScore,
            地质环境功能: r.dimensions[2].totalScore,
            调节功能: r.dimensions[3].totalScore,
            区划建议: r.zoningSuggestion,
          }))} filename="gw-function-evaluation" sheetName="功能评价" formats={['xlsx', 'csv', 'json']} label="导出评价结果" />
        </div>
        <FilterableTechTable
          headers={['评价单元', '综合得分', '功能等级', '主导功能', '供水', '生态', '地质环境', '调节', '区划建议']}
          rows={results.map(r => [
            r.name, String(r.comprehensiveScore), r.functionGrade, r.dominantFunction,
            String(r.dimensions[0].totalScore), String(r.dimensions[1].totalScore),
            String(r.dimensions[2].totalScore), String(r.dimensions[3].totalScore),
            r.zoningSuggestion.substring(0, 20) + '...',
          ])}
          filterPlaceholder="搜索评价单元..."
        />
      </TechCard>
    </div>
  );
}
