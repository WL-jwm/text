/**
 * B-23 土壤盐渍化评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入土壤参数 → 盐分分级/类型判定/淋洗需水量/改良预测/临界深度
 *  2. 预设分区 — 8个河北平原盐渍化分区对比评价
 *  3. 盐分分级标准 — 5级分级标准参考
 *  4. 质地参数 — 不同质地毛细参数与改良建议
 * 面板组件：PresetZonesPanel（拆分自 SoilSalinizationCalculatorTab.tsx）
 */

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, ScatterChart, Scatter } from 'recharts';
import { Calculator, MapPin, BookOpen, Layers } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_ZONES, calcAllPresetZones, calcSalinizationSummary } from '../../../utils/soilSalinizationCalculator';
import { TOOLTIP_STYLE, GRADE_COLORS } from './salineSoilConstants';

// ── 面板2: 预设分区 ──
export function PresetZonesPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);
  const summary = useMemo(() => calcSalinizationSummary(), []);

  const gradeBarData = useMemo(() => {
    const order = ['无盐渍化', '轻度盐渍化', '中度盐渍化', '重度盐渍化', '极重度盐渍化'];
    return order.map(g => ({
      name: g,
      count: summary.gradeCounts[g] || 0,
      color: GRADE_COLORS[g],
    }));
  }, [summary]);

  const scatterData = useMemo(() => results.map(r => ({
    name: r.name,
    salt: PRESET_ZONES.find(z => z.name === r.name)?.totalSalt ?? 0,
    depth: PRESET_ZONES.find(z => z.name === r.name)?.gwDepth ?? 0,
    grade: r.overallGrade,
    color: GRADE_COLORS[r.overallGrade] ?? '#64748b',
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="盐渍化分区" value={summary.zoneCount} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="平均全盐量" value={summary.avgSalt} unit="g/kg" icon={Layers} accent="amber" />
        <StatCard title="平均EC_e" value={summary.avgEC} unit="dS/m" icon={Calculator} accent="red" />
        <StatCard title="平均改良年限" value={summary.avgYears} unit="年" icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分区盐渍化等级分布" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={gradeBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-25} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
              <Tooltip content={<ChartTooltip title="等级分布" />} />
              <Bar dataKey="count" name="分区数" radius={[2, 2, 0, 0]}>
                {gradeBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="全盐量 vs 地下水埋深" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="depth" name="地下水埋深" unit="m" stroke="#64748b" fontSize={10} domain={[0, 5]} />
              <YAxis type="number" dataKey="salt" name="全盐量" unit="g/kg" stroke="#64748b" fontSize={10} domain={[0, 7]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4">
                {scatterData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Scatter>
              <ReferenceLine x={2.5} stroke="#f59e0b" strokeDasharray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="各分区综合评价结果">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            分区: r.name,
            综合等级: r.overallGrade,
            盐分类型: r.saltType.primaryType,
            全盐量gkg: PRESET_ZONES.find(z => z.name === r.name)?.totalSalt ?? 0,
            EC_e: PRESET_ZONES.find(z => z.name === r.name)?.ecE ?? 0,
            pH: PRESET_ZONES.find(z => z.name === r.name)?.ph ?? 0,
            SAR: r.saltType.sar,
            ESP: r.saltType.esp,
            淋洗比例: (r.leaching.lr * 100).toFixed(0) + '%',
            淋洗水量m3ha: r.leaching.leachingVolume,
            改良年限: r.reclamation.reclamationYears,
            改良难度: r.reclamation.difficulty,
            地下水风险: r.criticalDepth.riskLevel,
          }))} filename="salinization-evaluation" sheetName="盐渍化评价" formats={['xlsx', 'csv', 'json']} label="导出评价结果" />
        </div>
        <FilterableTechTable
          headers={['分区', '综合等级', '盐分类型', '全盐量(g/kg)', 'EC_e(dS/m)', 'pH', 'SAR', 'ESP(%)', 'LR(%)', '改良年限', '地下水风险']}
          rows={results.map(r => {
            const zone = PRESET_ZONES.find(z => z.name === r.name);
            return [
              r.name, r.overallGrade, r.saltType.primaryType,
              String(zone?.totalSalt ?? 0), String(zone?.ecE ?? 0), String(zone?.ph ?? 0),
              String(r.saltType.sar), String(r.saltType.esp),
              String(Math.round(r.leaching.lr * 100)),
              String(r.reclamation.reclamationYears),
              r.criticalDepth.riskLevel,
            ];
          })}
          filterPlaceholder="搜索分区..."
        />
      </TechCard>
    </div>
  );
}
