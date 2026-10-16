/**
 * B-24 地下水功能评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入14项指标 → 四维度评分+综合评价
 *  2. 预设分区 — 6个河北典型功能区对比
 *  3. 评分标准 — 各指标评分细则
 *  4. 权重方法 — AHP权重+功能等级标准
 * 面板: CalculatorPanel（拆分自 GroundwaterFunctionCalculatorTab.tsx）
 */
import { type FunctionEvaluationInput, calcFunctionEvaluation, scoreToColor } from '../../../utils/groundwaterFunctionCalculator';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartTooltip, TechCard } from '../../UI';
import { Calculator, BookOpen, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PolarGrid, YAxis, PolarRadiusAxis, Cell, PolarAngleAxis, CartesianGrid, XAxis, ReferenceLine, BarChart, ResponsiveContainer, RadarChart, Tooltip, Bar, Radar } from 'recharts';
import { FIELD_DEFS, GROUP_COLORS, TOOLTIP_STYLE } from './gwFuncConstants';

export function CalculatorPanel() {
  const [name, setName] = useState('自定义评价单元');
  const [values, setValues] = useState<Record<string, number>>({
    wellYield: 1500, waterQualityGrade: 3, exploitableModulus: 8, utilizationRate: 85,
    baseflowRatio: 20, wetlandDependency: 2, vegetationDependency: 15,
    subsidenceRate: 10, seawaterIntrusion: 0, salinizationRatio: 15,
    aquiferThickness: 35, specificYield: 0.08, rechargeIntensity: 40, waterLevelAmplitude: 5,
  });

  const input = { name, regionType: '平原', ...values } as unknown as FunctionEvaluationInput;
  const result = useMemo(() => calcFunctionEvaluation(input), [input]);

  const setField = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // 雷达图数据
  const radarData = result.dimensions.map(d => ({
    dimension: d.dimension.replace('功能', ''),
    score: d.totalScore,
  }));

  // 指标得分柱状图
  const indicatorBarData = useMemo(() => {
    const items: Array<{ name: string; score: number; group: string; color: string }> = [];
    result.dimensions.forEach(dim => {
      dim.indicators.forEach(ind => {
        items.push({ name: ind.name, score: ind.score, group: dim.dimension, color: GROUP_COLORS[dim.dimension.replace('功能', '')] ?? '#64748b' });
      });
    });
    return items;
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入面板 */}
        <TechCard title="评价指标输入" badge="14项指标" icon={Calculator}>
          <div className="space-y-2">
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text mb-1" />
            <div className="grid grid-cols-2 gap-2">
              {FIELD_DEFS.map(f => (
                <div key={f.key} className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-gw-muted">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: GROUP_COLORS[f.group] }} />
                    {f.label}
                  </label>
                  <input type="number" step={f.step ?? 'any'} value={values[f.key as string] ?? 0}
                    onChange={e => setField(f.key as string, parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono" />
                </div>
              ))}
            </div>
          </div>
        </TechCard>

        {/* 综合评价结果 */}
        <div className="space-y-3">
          <TechCard title="综合功能评价" badge={result.functionGrade} icon={Settings}>
            <div className="text-center py-2">
              <div className="text-4xl font-mono font-bold" style={{ color: scoreToColor(result.comprehensiveScore) }}>
                {result.comprehensiveScore}
              </div>
              <div className="text-xs text-gw-muted mt-1">综合得分 / 100</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">主导功能</div>
                <div className="text-sm text-gw-highlight">{result.dominantFunction}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">功能等级</div>
                <div className="text-sm" style={{ color: scoreToColor(result.comprehensiveScore) }}>{result.functionGrade}</div>
              </div>
            </div>
          </TechCard>

          <TechCard title="四维度评分" badge="AHP加权">
            <div className="grid grid-cols-2 gap-2">
              {result.dimensions.map((d, i) => (
                <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gw-muted">{d.dimension}</span>
                    <span className="text-[9px] text-gw-muted">权重{(d.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-lg font-mono" style={{ color: scoreToColor(d.totalScore) }}>{d.totalScore}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: scoreToColor(d.totalScore) + '20', color: scoreToColor(d.totalScore) }}>{d.grade}</span>
                  </div>
                  <div className="text-[9px] text-gw-muted mt-0.5 leading-tight">{d.note}</div>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="四维度功能雷达图" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={100}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各指标得分明细" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={indicatorBarData} layout="vertical" margin={{ left: 20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={80} />
              <Tooltip content={<ChartTooltip title="指标得分" unit="分" />} />
              <ReferenceLine x={55} stroke="#f59e0b" strokeDasharray="5 5" />
              <Bar dataKey="score" name="得分" radius={[0, 2, 2, 0]}>
                {indicatorBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 各维度详细指标 */}
      {result.dimensions.map((dim, i) => (
        <TechCard key={i} title={dim.dimension} badge={`${dim.totalScore}分 · ${dim.grade}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dim.indicators.map((ind, j) => (
              <div key={j} className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">{ind.name}</div>
                <div className="text-sm font-mono text-gw-text mt-0.5">{ind.value}</div>
                <div className="text-base font-mono mt-0.5" style={{ color: scoreToColor(ind.score) }}>{ind.score}</div>
                <div className="text-[9px] text-gw-muted">权重{(ind.weight * 100).toFixed(0)}% · {ind.rating}</div>
              </div>
            ))}
          </div>
        </TechCard>
      ))}

      {/* 区划建议 */}
      <TechCard title="功能区划与保护建议" icon={BookOpen}>
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">功能区划建议</div>
            <div className="text-sm text-gw-text mt-1">{result.zoningSuggestion}</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-amber-400">具体措施建议</div>
            <div className="text-sm text-gw-text mt-1">{result.suggestion}</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
