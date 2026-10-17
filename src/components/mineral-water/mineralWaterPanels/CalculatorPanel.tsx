/**
 * B-22 饮用天然矿泉水水质评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入水质参数 → 界限指标/限量指标/类型判定/综合等级
 *  2. 预设水源地 — 14个产地对比评价
 *  3. 标准对比 — GB 8537 vs GB/T 14848
 *  4. 类型统计 — 矿泉水类型分布分析
 * 面板: CalculatorPanel（拆分自 MineralWaterCalculatorTab.tsx）
 */
import { type MineralWaterInput, calcMineralWaterEvaluation } from '../../../utils/mineralWaterCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard, TechCard } from '../../UI';
import { Calculator } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PolarRadiusAxis, RadarChart, ResponsiveContainer, Tooltip, Legend, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { FIELD_DEFS, GRADE_COLORS, TOOLTIP_STYLE } from './mineralWaterConstants';

export function CalculatorPanel() {
  const [name, setName] = useState('自定义水源地');
  const [values, setValues] = useState<Record<string, number>>({
    sio2: 38.0, strontium: 0.35, lithium: 0.05, selenium: 0.002,
    zinc: 0.02, freeCO2: 80, mineralization: 750, temperature: 35,
    ph: 7.2, arsenic: 0.002, cadmium: 0.0005, chromium: 0.01,
    lead: 0.003, mercury: 0.0002, fluoride: 0.7, nitrate: 5, cyanide: 0.001,
  });

  const input = { name, ...values } as unknown as MineralWaterInput;
  const result = useMemo(() => calcMineralWaterEvaluation(input), [input]);

  const setField = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // 界限指标雷达图数据
  const radarData = useMemo(() => result.limitIndicators.map(r => ({
    name: r.name.split('(')[0],
    达标程度: Math.min(150, r.achievement),
    满分线: 100,
  })), [result]);

  return (
    <div className="space-y-4">
      <TechCard title="矿泉水水质参数输入" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-gw-muted block mb-1">水源地名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          {FIELD_DEFS.map(f => (
            <div key={f.key}>
              <label className="text-xs text-gw-muted block mb-1">{f.label}</label>
              <input
                type="number"
                step={f.step ?? 'any'}
                value={values[f.key as string] ?? 0}
                onChange={e => setField(f.key as string, parseFloat(e.target.value) || 0)}
                className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text"
              />
            </div>
          ))}
        </div>
      </TechCard>

      {/* 结果概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="达标界限指标" value={`${result.passedLimitCount}/${result.totalLimitCount}`} accent="text-blue-400" />
        <StatCard title="合格限量指标" value={`${result.passedContaminantCount}/${result.totalContaminantCount}`} accent="text-cyan-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">矿泉水类型</span>
          <span className="text-sm font-bold text-violet-400">{result.waterType}</span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">综合等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.grade] }}>
            {result.grade}
          </span>
        </div>
      </div>

      {/* 评价结论 */}
      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-sm text-gw-text leading-relaxed">
          <strong>评价结论：</strong>{result.conclusion}
        </p>
        <p className="text-xs text-gw-muted mt-2 leading-relaxed">
          {result.typeNote}
        </p>
      </div>

      {/* 界限指标雷达图 */}
      <LazyChartCard title="界限指标达标程度雷达图">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 150]} tick={{ fill: '#64748b', fontSize: 9 }} />
            <Radar name="达标程度(%)" dataKey="达标程度" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Radar name="达标线(100%)" dataKey="满分线" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      {/* 界限指标详表 */}
      <FilterableTechTable
        headers={['界限指标', '实测值', '单位', '界限值', '是否达标', '达标程度(%)']}
        rows={result.limitIndicators.map(r => [
          r.name, r.value, r.unit, r.threshold,
          r.passed ? '✓ 达标' : '✗ 未达标',
          r.achievement,
        ])}
      />

      {/* 限量指标详表 */}
      <FilterableTechTable
        headers={['限量指标', '实测值', '单位', '限值', '是否合格', '超标比']}
        rows={result.contaminants.map(r => [
          r.name, r.value, r.unit, r.limit,
          r.passed ? '✓ 合格' : '✗ 超标',
          r.excessRatio,
        ])}
      />
    </div>
  );
}
