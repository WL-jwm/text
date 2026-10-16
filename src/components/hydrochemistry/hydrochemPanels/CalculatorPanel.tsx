/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 * 面板: CalculatorPanel（拆分自 HydrochemCalculatorTab.tsx）
 */
import { usePipeline } from '../../../hooks/usePipeline';
import { type IonInput, calcHardness, analyzeHydrochem, checkIonBalance } from '../../../utils/hydrochemCalculator';
import { PipelinePanel } from '../../PipelinePanel';
import { TechCard, StatCard } from '../../UI';
import { FlaskConical, Beaker, Calculator } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PiperDiagramSVG } from './PiperDiagramSVG';

export function CalculatorPanel() {
  const { publishData } = usePipeline('hydrochem');
  const [Ca, setCa] = useState(68);
  const [Mg, setMg] = useState(24);
  const [NaK, setNaK] = useState(18);
  const [HCO3, setHCO3] = useState(280);
  const [SO4, setSO4] = useState(72);
  const [Cl, setCl] = useState(38);
  const [pH, setpH] = useState(7.4);

  const input: IonInput = { Ca, Mg, NaK, HCO3, SO4, Cl, pH };
  const result = useMemo(() => analyzeHydrochem(input), [Ca, Mg, NaK, HCO3, SO4, Cl, pH]);
  const balance = useMemo(() => checkIonBalance(result.mmol), [result.mmol]);

  const ionFields = [
    { key: 'Ca', label: 'Ca²⁺ 钙', value: Ca, set: setCa, color: '#3b82f6' },
    { key: 'Mg', label: 'Mg²⁺ 镁', value: Mg, set: setMg, color: '#06b6d4' },
    { key: 'NaK', label: 'Na⁺+K⁺ 钠钾', value: NaK, set: setNaK, color: '#8b5cf6' },
    { key: 'HCO3', label: 'HCO₃⁻ 重碳酸根', value: HCO3, set: setHCO3, color: '#10b981' },
    { key: 'SO4', label: 'SO₄²⁻ 硫酸根', value: SO4, set: setSO4, color: '#f59e0b' },
    { key: 'Cl', label: 'Cl⁻ 氯离子', value: Cl, set: setCl, color: '#ef4444' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <TechCard icon={Calculator} title="离子浓度输入" badge="mg/L">
          <div className="grid grid-cols-2 gap-3">
            {ionFields.map(f => (
              <div key={f.key}>
                <label className="text-xs text-gw-muted flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: f.color }} />
                  {f.label}
                </label>
                <input type="number" step="any" value={f.value} onChange={e => f.set(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gw-muted">pH值</label>
              <input type="number" step="any" value={pH} onChange={e => setpH(Number(e.target.value) || 7)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
          </div>
          {/* 离子平衡检验 */}
          <div className={`mt-3 p-2 rounded-lg text-xs ${balance.pass ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            离子平衡误差：{balance.error}% {balance.pass ? '✓ 合格(<5%)' : '✗ 不合格(≥5%)，请检查数据'}
          </div>
        </TechCard>

        {/* Piper图 */}
        <TechCard icon={FlaskConical} title="Piper三线图">
          <PiperDiagramSVG result={result} />
        </TechCard>
      </div>

      {/* 结果区 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="水化学类型" value={result.sukalief.type} subtitle={result.sukalief.quality} accent="violet" />
        <StatCard title="TDS" value={`${result.calculatedTDS}`} unit="mg/L" subtitle={result.evaluation.tds.level} accent={result.evaluation.tds.color === '#10b981' ? 'emerald' : 'amber'} />
        <StatCard title="总硬度" value={`${calcHardness(Ca, Mg)}`} unit="mg/L" subtitle={result.evaluation.hardness.level} accent="blue" />
        <StatCard title="典型区域" value={result.sukalief.typicalZone} subtitle={result.sukalief.description} accent="cyan" />
      </div>

      {/* 毫摩尔浓度表 */}
      <TechCard icon={Beaker} title="离子毫摩尔浓度与百分数" badge="换算结果">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">离子</th>
                <th className="text-right p-2 text-gw-muted">浓度 (mg/L)</th>
                <th className="text-right p-2 text-gw-muted">毫摩尔 (mmol/L)</th>
                <th className="text-right p-2 text-gw-muted">百分数 (%)</th>
                <th className="text-left p-2 text-gw-muted">类别</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Ca²⁺', mg: Ca, mmol: result.mmol.Ca, pct: result.percent.Ca, cat: '阳离子' },
                { name: 'Mg²⁺', mg: Mg, mmol: result.mmol.Mg, pct: result.percent.Mg, cat: '阳离子' },
                { name: 'Na⁺+K⁺', mg: NaK, mmol: result.mmol.NaK, pct: result.percent.NaK, cat: '阳离子' },
                { name: 'HCO₃⁻', mg: HCO3, mmol: result.mmol.HCO3, pct: result.percent.HCO3, cat: '阴离子' },
                { name: 'SO₄²⁻', mg: SO4, mmol: result.mmol.SO4, pct: result.percent.SO4, cat: '阴离子' },
                { name: 'Cl⁻', mg: Cl, mmol: result.mmol.Cl, pct: result.percent.Cl, cat: '阴离子' },
              ].map(r => (
                <tr key={r.name} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.name}</td>
                  <td className="p-2 text-right font-mono text-gw-text">{r.mg}</td>
                  <td className="p-2 text-right font-mono text-blue-400">{r.mmol}</td>
                  <td className="p-2 text-right font-mono text-amber-400">{r.pct}%</td>
                  <td className="p-2 text-gw-muted">{r.cat}</td>
                </tr>
              ))}
              <tr className="border-b border-gw-border font-medium">
                <td className="p-2 text-gw-text">合计</td>
                <td className="p-2 text-right font-mono text-gw-text">{Ca + Mg + NaK + HCO3 + SO4 + Cl}</td>
                <td className="p-2 text-right font-mono text-blue-400">阳{result.mmol.totalCation} / 阴{result.mmol.totalAnion}</td>
                <td className="p-2 text-right text-gw-muted" colSpan={2}>阳离子100% / 阴离子100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TechCard>

      {/* 评价结果 */}
      <TechCard icon={FlaskConical} title="水化学指标评价" badge={result.sukalief.type}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { name: 'TDS', ...result.evaluation.tds, unit: 'mg/L' },
            { name: '总硬度', ...result.evaluation.hardness, unit: 'mg/L' },
            { name: '氯离子', ...result.evaluation.chloride, unit: 'mg/L' },
            { name: '硫酸根', ...result.evaluation.sulfate, unit: 'mg/L' },
            { name: 'pH', ...result.evaluation.pH, unit: '' },
          ].map(item => (
            <div key={item.name} className="p-3 rounded-lg bg-gw-surface">
              <div className="text-xs text-gw-muted">{item.name}</div>
              <div className="text-lg font-bold font-mono mt-1" style={{ color: item.color }}>
                {item.value}{item.unit && <span className="text-xs ml-0.5">{item.unit}</span>}
              </div>
              <div className="text-xs mt-0.5" style={{ color: item.color }}>{item.level}</div>
              <div className="text-[10px] text-gw-muted mt-0.5">{item.description}</div>
            </div>
          ))}
        </div>
      </TechCard>
      <PipelinePanel moduleId="hydrochem" onPublish={() => {
        const ions = [
          { factor: '钙(Ca)', value: Ca },
          { factor: '镁(Mg)', value: Mg },
          { factor: '钠钾(Na+K)', value: NaK },
          { factor: '碳酸氢根(HCO3)', value: HCO3 },
          { factor: '硫酸根(SO4)', value: SO4 },
          { factor: '氯离子(Cl)', value: Cl },
        ].filter(f => f.value > 0);
        if (ions.length > 0) {
          publishData('ionConcentrations', `水化学离子(${ions.length}项)`, { ions, Ca, Mg, NaK, HCO3, SO4, Cl, pH });
        }
      }} />
    </div>
  );
}
