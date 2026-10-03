/**
 * B-23 土壤盐渍化评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入土壤参数 → 盐分分级/类型判定/淋洗需水量/改良预测/临界深度
 *  2. 预设分区 — 8个河北平原盐渍化分区对比评价
 *  3. 盐分分级标准 — 5级分级标准参考
 *  4. 质地参数 — 不同质地毛细参数与改良建议
 * 面板组件：CalculatorPanel（拆分自 SoilSalinizationCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calculator, BookOpen, Layers } from 'lucide-react';
import { TechCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { calcSalinizationEvaluation, type SalinizationInput } from '../../../utils/soilSalinizationCalculator';
import { TOOLTIP_STYLE, ACCENT_MAP, FIELD_DEFS, TEXTURE_OPTIONS } from './salineSoilConstants';

// ── 面板1: 计算器 ──
export function CalculatorPanel() {
  const [name, setName] = useState('自定义采样点');
  const [soilTexture, setSoilTexture] = useState('中壤');
  const [values, setValues] = useState<Record<string, number>>({
    totalSalt: 3.5, ecE: 9.0, ph: 8.5,
    chloride: 3.8, sulfate: 3.0, bicarbonate: 0.6, carbonate: 0,
    sodium: 4.5, calcium: 1.4, magnesium: 1.5,
    gwMineralization: 4.5, gwDepth: 1.5,
    irrigationEC: 1.1, cropThreshold: 4.0,
  });

  const input = { name, soilTexture, ...values } as unknown as SalinizationInput;
  const result = useMemo(() => calcSalinizationEvaluation(input), [input]);

  const setField = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // 雷达图数据：阴离子当量
  const anionRadar = [
    { ion: 'Cl⁻', value: input.chloride },
    { ion: 'SO₄²⁻', value: input.sulfate },
    { ion: 'HCO₃⁻', value: input.bicarbonate },
    { ion: 'CO₃²⁻', value: input.carbonate },
    { ion: 'Na⁺', value: input.sodium },
    { ion: 'Ca²⁺', value: input.calcium },
    { ion: 'Mg²⁺', value: input.magnesium },
  ];

  // 改良曲线数据
  const reclamationCurve = useMemo(() => {
    const pts: Array<{ year: string; salt: number; target: number }> = [];
    let salt = input.totalSalt;
    const annualRate = result.reclamation.annualDesalinationRate / 100;
    for (let y = 0; y <= result.reclamation.reclamationYears + 2; y++) {
      pts.push({ year: `第${y}年`, salt: Math.round(salt * 100) / 100, target: 1.5 });
      salt = salt * (1 - annualRate);
    }
    return pts;
  }, [input.totalSalt, result.reclamation]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入面板 */}
        <TechCard title="土壤参数输入" badge="参数设置" icon={Calculator}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input value={name} onChange={e => setName(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text" />
              <select value={soilTexture} onChange={e => setSoilTexture(e.target.value)}
                className="px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text">
                {TEXTURE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_DEFS.map(f => (
                <div key={f.key} className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-gw-muted">{f.label}</label>
                  <input type="number" step={f.step ?? 'any'} value={values[f.key as string] ?? 0}
                    onChange={e => setField(f.key as string, parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono" />
                </div>
              ))}
            </div>
          </div>
        </TechCard>

        {/* 评价结果 */}
        <div className="space-y-3">
          <TechCard title="盐分分级评价" badge={result.overallGrade} icon={Layers}>
            <div className="grid grid-cols-3 gap-2">
              {result.saltGrades.map((g, i) => (
                <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                  <div className="text-[10px] text-gw-muted">{g.indicator}</div>
                  <div className="text-lg font-mono text-gw-highlight">{g.value}<span className="text-[10px] text-gw-muted ml-0.5">{g.unit}</span></div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5 bg-${ACCENT_MAP[g.color] ?? 'blue'}-500/15 text-${ACCENT_MAP[g.color] ?? 'blue'}-400`}>{g.grade}</div>
                  <div className="text-[9px] text-gw-muted mt-0.5 leading-tight">{g.description}</div>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="盐分类型判定" badge={result.saltType.primaryType}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">Cl⁻/SO₄²⁻比: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.clSo4Ratio}</span>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">HCO₃⁻比值: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.hco3Ratio}</span>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">钠吸附比SAR: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.sar}</span>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded">
                <span className="text-gw-muted">碱化度ESP: </span>
                <span className="font-mono text-gw-highlight">{result.saltType.esp}%</span>
              </div>
            </div>
            <p className="text-[10px] text-gw-muted mt-2">{result.saltType.note}</p>
          </TechCard>
        </div>
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="离子组成雷达图" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={anionRadar}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="ion" tick={{ fill: '#64748b', fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="改良脱盐预测曲线" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={reclamationCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={40} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: 'g/kg', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="全盐量变化" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="salt" name="全盐量(g/kg)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="5 5" label={{ value: '改良目标', fill: '#10b981', fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 淋洗与临界深度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="淋洗需水量计算（FAO方法）" badge={`LR=${(result.leaching.lr * 100).toFixed(0)}%`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">淋洗比例LR</div>
              <div className="text-base font-mono text-gw-highlight">{(result.leaching.lr * 100).toFixed(0)}%</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">淋洗水量</div>
              <div className="text-base font-mono text-gw-cyan">{result.leaching.leachingVolume} m³/ha</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">排盐量</div>
              <div className="text-base font-mono text-amber-400">{result.leaching.saltRemoval} t/ha</div>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted">{result.leaching.suggestion}</p>
          <div className="mt-2 text-[10px] text-gw-muted">
            公式：LR = EC_dw / (EC_e × 5) = {input.irrigationEC} / ({input.ecE} × 5) = {result.leaching.lr.toFixed(3)}
          </div>
        </TechCard>

        <TechCard title="地下水临界深度判断" badge={result.criticalDepth.riskLevel}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">实际埋深</div>
              <div className="text-base font-mono text-gw-text">{result.criticalDepth.gwDepth} m</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">临界深度</div>
              <div className="text-base font-mono text-amber-400">{result.criticalDepth.criticalDepth} m</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">安全深度</div>
              <div className="text-base font-mono text-emerald-400">{result.criticalDepth.safeDepth} m</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">毛细上升</div>
              <div className="text-base font-mono text-gw-cyan">{result.criticalDepth.capillaryRise} m</div>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted">{result.criticalDepth.suggestion}</p>
        </TechCard>
      </div>

      {/* 改良预测 */}
      <TechCard title="改良效果预测" badge={result.reclamation.difficulty}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">初始全盐量</div>
            <div className="text-base font-mono text-red-400">{result.reclamation.initialSalt.toFixed(1)} g/kg</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">目标全盐量</div>
            <div className="text-base font-mono text-emerald-400">{result.reclamation.targetSalt.toFixed(1)} g/kg</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">年脱盐率</div>
            <div className="text-base font-mono text-gw-highlight">{result.reclamation.annualDesalinationRate}%</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded text-center">
            <div className="text-[10px] text-gw-muted">改良年限</div>
            <div className="text-base font-mono text-amber-400">{result.reclamation.reclamationYears} 年</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gw-surface/50 rounded">
            <span className="text-gw-muted">年排盐量: </span>
            <span className="font-mono text-gw-cyan">{result.reclamation.annualSaltRemoval} t/ha</span>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded">
            <span className="text-gw-muted">总排盐量: </span>
            <span className="font-mono text-gw-cyan">{result.reclamation.totalSaltRemoval} t/ha</span>
          </div>
        </div>
        <p className="text-[10px] text-gw-muted mt-2">{result.reclamation.suggestion}</p>
      </TechCard>

      {/* 综合结论 */}
      <TechCard title="综合评价结论" icon={BookOpen}>
        <p className="text-sm text-gw-text leading-relaxed">{result.conclusion}</p>
      </TechCard>
    </div>
  );
}
