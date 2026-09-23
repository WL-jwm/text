/**
 * B-25 地下水数值模拟参数估算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 水力参数转换+网格估算+稳定性判断+时间步长
 *  2. 模型校准 — 观测/模拟数据对比+NSE/RMSE/R²等指标
 *  3. 预设分区 — 6个河北典型数值模拟区参数对比
 *  4. 参考方法 — 数值方法+稳定性准则+校准标准
 * 面板组件：PresetZonesPanel（拆分自 NumericalModelCalculatorTab.tsx）
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Calculator, Gauge, MapPin, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_MODEL_ZONES, calcAllPresetZones } from '../../../utils/numericalModelCalculator';
import { TOOLTIP_STYLE } from './numericalModelConstants';

// ── 面板3: 预设分区 ──
export function PresetZonesPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);

  const nodeBarData = results.map(r => ({
    name: r.zone.name.length > 8 ? r.zone.name.substring(0, 8) + '...' : r.zone.name,
    nodes: r.gridResult.totalNodes,
    steps: r.timeStepResult.totalSteps,
  }));

  const radarData = results.map(r => ({
    name: r.zone.name.length > 6 ? r.zone.name.substring(0, 6) + '...' : r.zone.name,
    T: Math.min(100, r.hydraulicResult.transmissivity),
    v: Math.min(100, r.hydraulicResult.actualVelocity * 10000),
    D: Math.min(100, r.hydraulicResult.diffusivity / 100),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="预设模拟区" value={PRESET_MODEL_ZONES.length} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="平均节点数" value={Math.round(results.reduce((s, r) => s + r.gridResult.totalNodes, 0) / results.length).toLocaleString()} unit="" icon={Calculator} accent="cyan" />
        <StatCard title="平均步数" value={Math.round(results.reduce((s, r) => s + r.timeStepResult.totalSteps, 0) / results.length)} unit="步" icon={Gauge} accent="amber" />
        <StatCard title="稳定区域" value={results.filter(r => r.stabilityResult.isStable).length} unit={`/${results.length}`} icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分区节点数与时间步数对比" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nodeBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
              <Tooltip content={<ChartTooltip title="对比" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="nodes" name="总节点数" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar yAxisId="right" dataKey="steps" name="时间步数" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各分区水力参数雷达图" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={90}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar dataKey="T" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              <Radar dataKey="v" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Radar dataKey="D" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="各分区参数估算汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            分区: r.zone.name,
            渗透系数: r.zone.hydraulic.k,
            导水系数: r.hydraulicResult.transmissivity,
            实际流速: r.hydraulicResult.actualVelocity,
            扩散系数: r.hydraulicResult.diffusivity,
            网格尺寸m: r.gridResult.dx,
            总节点: r.gridResult.totalNodes,
            时间步长d: r.timeStepResult.suggestedDt,
            总步数: r.timeStepResult.totalSteps,
            Courant数: r.stabilityResult.courant,
            弥散Peclet: r.stabilityResult.pecletD,
            稳定性: r.stabilityResult.isStable ? '稳定' : '不稳定',
            求解方法: r.zone.method,
          }))} filename="numerical-model-params" sheetName="数值模拟参数" formats={['xlsx', 'csv', 'json']} label="导出参数表" />
        </div>
        <FilterableTechTable
          headers={['分区', 'K(m/d)', 'T(m²/d)', 'Δx(m)', '节点数', 'Δt(d)', '步数', 'Courant', 'Pe_d', '稳定性', '方法']}
          rows={results.map(r => [
            r.zone.name.length > 12 ? r.zone.name.substring(0, 12) + '...' : r.zone.name,
            String(r.zone.hydraulic.k),
            String(r.hydraulicResult.transmissivity),
            String(r.gridResult.dx),
            r.gridResult.totalNodes.toLocaleString(),
            String(r.timeStepResult.suggestedDt),
            String(r.timeStepResult.totalSteps),
            String(r.stabilityResult.courant),
            String(r.stabilityResult.pecletD),
            r.stabilityResult.isStable ? '稳定' : '不稳定',
            r.zone.method,
          ])}
          filterPlaceholder="搜索分区..."
        />
      </TechCard>
    </div>
  );
}
