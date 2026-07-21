/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { FlaskConical, Calculator, MapPin, BookOpen, Beaker } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_SAMPLES,
  type IonInput,
  type HydrochemAnalysisResult,
  analyzeHydrochem,
  checkIonBalance,
  calcHardness,
} from '../../utils/hydrochemCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

// ── Piper三线图SVG ──

function PiperDiagramSVG({ result }: { result: HydrochemAnalysisResult | null }) {
  if (!result) {
    return <div className="flex items-center justify-center h-[400px] text-gw-muted text-sm">请先输入离子数据</div>;
  }

  const { piper } = result;
  const W = 380, H = 360;
  // 三角形边长

  // 阳离子三角形（左下）
  const cTop = { x: 80, y: 20 };       // Ca (上)
  const cLeft = { x: 10, y: 140 };     // Mg (左下)
  const cRight = { x: 150, y: 140 };   // NaK (右下)
  // 阴离子三角形（右下）
  const aTop = { x: 300, y: 20 };      // Cl (上)
  const aLeft = { x: 160, y: 140 };    // HCO3 (左下)
  const aRight = { x: 370, y: 140 };   // SO4 (右下)
  // 菱形（上方中间）
  const dTop = { x: 220, y: 10 };      // NaK-SO4+Cl
  const dLeft = { x: 80, y: 130 };     // Ca+Mg-HCO3
  const dRight = { x: 300, y: 130 };   // NaK-HCO3... wait
  const dBottom = { x: 220, y: 250 };  // Ca+Mg-SO4+Cl

  // 阳离子点位置：Ca在上，Mg左下，NaK右下
  // 点 = Ca%沿上→左下 + Ca%沿上→右下 的交点
  function cationPoint(Ca: number, Mg: number, NaK: number) {
    // 等边三角形重心坐标→笛卡尔
    // Ca% = (上顶点权重), Mg% = (左下权重), NaK% = (右下权重)
    const x = cTop.x * (Ca / 100) + cLeft.x * (Mg / 100) + cRight.x * (NaK / 100);
    const y = cTop.y * (Ca / 100) + cLeft.y * (Mg / 100) + cRight.y * (NaK / 100);
    return { x, y };
  }

  function anionPoint(HCO3: number, SO4: number, Cl: number) {
    // HCO3左下, SO4右下, Cl上
    const x = aLeft.x * (HCO3 / 100) + aRight.x * (SO4 / 100) + aTop.x * (Cl / 100);
    const y = aLeft.y * (HCO3 / 100) + aRight.y * (SO4 / 100) + aTop.y * (Cl / 100);
    return { x, y };
  }

  function diamondPoint(dx: number, dy: number) {
    // 菱形坐标(0-100) → SVG坐标
    // x轴: 左→右 = Ca+Mg→NaK (阳离子) + HCO3→SO4+Cl (阴离子)
    // y轴: 下→上 = HCO3→SO4+Cl ... 不完全是
    // 简化映射：菱形x 0-100 → dLeft.x→dRight.x, 菱形y 0-100 → dBottom.y→dTop.y
    const x = dLeft.x + (dRight.x - dLeft.x) * (dx / 100);
    const y = dBottom.y - (dBottom.y - dTop.y) * (dy / 100);
    return { x, y };
  }

  const catPt = cationPoint(piper.cation.Ca, piper.cation.Mg, piper.cation.NaK);
  const aniPt = anionPoint(piper.anion.HCO3, piper.anion.SO4, piper.anion.Cl);
  const diaPt = diamondPoint(piper.diamond.x, piper.diamond.y);

  return (
    <svg width={W} height={H} className="max-w-full">
      {/* 阳离子三角形 */}
      <polygon points={`${cTop.x},${cTop.y} ${cLeft.x},${cLeft.y} ${cRight.x},${cRight.y}`}
        fill="rgba(59,130,246,0.05)" stroke="#3b82f6" strokeWidth={1} />
      <text x={cTop.x} y={cTop.y - 5} fontSize={10} fill="#3b82f6" textAnchor="middle">Ca²⁺</text>
      <text x={cLeft.x - 5} y={cLeft.y + 14} fontSize={10} fill="#3b82f6" textAnchor="middle">Mg²⁺</text>
      <text x={cRight.x + 10} y={cRight.y + 14} fontSize={10} fill="#3b82f6" textAnchor="middle">Na⁺+K⁺</text>

      {/* 阴离子三角形 */}
      <polygon points={`${aTop.x},${aTop.y} ${aLeft.x},${aLeft.y} ${aRight.x},${aRight.y}`}
        fill="rgba(239,68,68,0.05)" stroke="#ef4444" strokeWidth={1} />
      <text x={aTop.x} y={aTop.y - 5} fontSize={10} fill="#ef4444" textAnchor="middle">Cl⁻</text>
      <text x={aLeft.x - 12} y={aLeft.y + 14} fontSize={10} fill="#ef4444" textAnchor="middle">HCO₃⁻</text>
      <text x={aRight.x + 10} y={aRight.y + 14} fontSize={10} fill="#ef4444" textAnchor="middle">SO₄²⁻</text>

      {/* 菱形 */}
      <polygon points={`${dTop.x},${dTop.y} ${dRight.x},${dRight.y} ${dBottom.x},${dBottom.y} ${dLeft.x},${dLeft.y}`}
        fill="rgba(139,92,246,0.05)" stroke="#8b5cf6" strokeWidth={1} />

      {/* 连接线（阳离子→菱形→阴离子） */}
      <line x1={catPt.x} y1={catPt.y} x2={diaPt.x} y2={diaPt.y} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="2 2" />
      <line x1={aniPt.x} y1={aniPt.y} x2={diaPt.x} y2={diaPt.y} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="2 2" />

      {/* 数据点 */}
      <circle cx={catPt.x} cy={catPt.y} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1} />
      <circle cx={aniPt.x} cy={aniPt.y} r={4} fill="#ef4444" stroke="#fff" strokeWidth={1} />
      <circle cx={diaPt.x} cy={diaPt.y} r={5} fill="#8b5cf6" stroke="#fff" strokeWidth={1.5} />

      {/* 标注菱形点 */}
      <text x={diaPt.x + 8} y={diaPt.y - 4} fontSize={9} fill="#8b5cf6" fontWeight="bold">
        {result.sukalief.type}
      </text>
    </svg>
  );
}

// ── 面板1: 计算器 ──

function CalculatorPanel() {
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
    </div>
  );
}

// ── 面板2: 预设水样对比 ──

function PresetSamplesPanel() {
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

// ── Piper菱形散点SVG ──

function PiperScatterSVG({ points }: {
  points: Array<{ name: string; x: number; y: number; type: string; color: string }>;
}) {
  const W = 360, H = 320;
  const margin = 40;
  const plotW = W - margin * 2;
  const plotH = H - margin * 2;

  return (
    <svg width={W} height={H} className="max-w-full">
      {/* 菱形边框 */}
      <polygon
        points={`${W / 2},${margin} ${W - margin},${H / 2} ${W / 2},${H - margin} ${margin},${H / 2}`}
        fill="rgba(139,92,246,0.05)" stroke="#8b5cf6" strokeWidth={1}
      />
      {/* 轴标签 */}
      <text x={margin - 5} y={H / 2} fontSize={9} fill="#9ca3af" textAnchor="end">Ca+Mg</text>
      <text x={W - margin + 5} y={H / 2} fontSize={9} fill="#9ca3af" textAnchor="start">Na+K</text>
      <text x={W / 2} y={margin - 5} fontSize={9} fill="#9ca3af" textAnchor="middle">SO4+Cl</text>
      <text x={W / 2} y={H - margin + 12} fontSize={9} fill="#9ca3af" textAnchor="middle">HCO3</text>
      {/* 网格 */}
      <line x1={W / 2} y1={margin} x2={W / 2} y2={H - margin} stroke="rgba(255,255,255,0.05)" />
      <line x1={margin} y1={H / 2} x2={W - margin} y2={H / 2} stroke="rgba(255,255,255,0.05)" />
      {/* 数据点 */}
      {points.map(p => {
        const x = margin + (p.x / 100) * plotW;
        const y = H - margin - (p.y / 100) * plotH;
        return (
          <g key={p.name}>
            <circle cx={x} cy={y} r={5} fill={p.color} stroke="#fff" strokeWidth={1} opacity={0.85} />
            <text x={x + 7} y={y + 3} fontSize={9} fill="#9ca3af">{p.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 面板3: 离子换算参考 ──

function ReferencePanel() {
  const molTable = [
    { ion: 'Ca²⁺', mass: '40.08', charge: '2', eq: '20.04', note: '主要阳离子，硬度来源' },
    { ion: 'Mg²⁺', mass: '24.31', charge: '2', eq: '12.16', note: '主要阳离子，硬度来源' },
    { ion: 'Na⁺', mass: '22.99', charge: '1', eq: '22.99', note: '主导阳离子（平原区）' },
    { ion: 'K⁺', mass: '39.10', charge: '1', eq: '39.10', note: '通常与Na合并计算' },
    { ion: 'HCO₃⁻', mass: '61.02', charge: '1', eq: '61.02', note: '主要阴离子（补给区）' },
    { ion: 'SO₄²⁻', mass: '96.06', charge: '2', eq: '48.03', note: '中等矿化度阴离子' },
    { ion: 'Cl⁻', mass: '35.45', charge: '1', eq: '35.45', note: '咸水主导阴离子' },
  ];

  const standardTable = [
    { item: 'TDS', unit: 'mg/L', I: '<300', II: '<500', III: '<1000', IV: '<2000', V: '>2000' },
    { item: '总硬度(以CaCO₃计)', unit: 'mg/L', I: '<150', II: '<300', III: '<450', IV: '<650', V: '>650' },
    { item: '硫酸根 SO₄²⁻', unit: 'mg/L', I: '<50', II: '<150', III: '<250', IV: '<350', V: '>350' },
    { item: '氯离子 Cl⁻', unit: 'mg/L', I: '<50', II: '<150', III: '<250', IV: '<350', V: '>350' },
    { item: 'pH', unit: '-', I: '6.5~8.5', II: '6.5~8.5', III: '6.5~8.5', IV: '5.5~6.5或8.5~9.0', V: '<5.5或>9.0' },
  ];

  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="离子摩尔质量换算表">
        <p className="text-xs text-gw-muted mb-3">毫摩尔浓度 = 质量浓度(mg/L) ÷ 摩尔质量(g/mol)。当量浓度 = 毫摩尔浓度 × 离子价数。</p>
        <FilterableTechTable
          headers={['离子', '摩尔质量(g/mol)', '离子价数', '当量(g/eq)', '说明']}
          rows={molTable.map(r => [r.ion, r.mass, r.charge, r.eq, r.note])}
          filterPlaceholder="搜索离子..."
        />
      </TechCard>

      <TechCard icon={BookOpen} title="GB/T 14848-2017 地下水质量标准（水化学指标）">
        <FilterableTechTable
          headers={['指标', '单位', 'I类', 'II类', 'III类', 'IV类', 'V类']}
          rows={standardTable.map(r => [r.item, r.unit, r.I, r.II, r.III, r.IV, r.V])}
          filterPlaceholder="搜索指标..."
        />
      </TechCard>

      <TechCard icon={FlaskConical} title="苏卡列夫分类规则">
        <div className="p-3 rounded-lg bg-gw-surface text-xs text-gw-muted space-y-2">
          <p><span className="text-gw-text font-medium">分类原则：</span>按离子毫摩尔百分数 ≥25% 的离子组合命名，阴离子在前、阳离子在后。</p>
          <p><span className="text-gw-text font-medium">命名格式：</span>主要阴离子·次要阴离子 - 主要阳离子·次要阳离子 型</p>
          <p><span className="text-gw-text font-medium">示例：</span>HCO₃·SO₄ - Ca·Na 型 表示 HCO₃和SO₄均超25%、Ca和Na均超25%</p>
          <p><span className="text-gw-text font-medium">水文地质意义：</span>从山前HCO₃-Ca型→滨海Cl-Na型，反映水岩作用程度和蒸发浓缩趋势</p>
        </div>
      </TechCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════

const SUB_TABS = [
  { key: 'calc', label: '水化学计算器', icon: Calculator },
  { key: 'preset', label: '预设水样', icon: MapPin },
  { key: 'ref', label: '换算参考', icon: BookOpen },
] as const;

type SubTabKey = typeof SUB_TABS[number]['key'];

export function HydrochemCalculatorTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('calc');

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-violet-400" />
          <span className="text-sm text-violet-400 font-medium">水化学分析计算器</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">输入6大离子浓度，自动计算苏卡列夫分类、Piper三线图坐标、水化学指标评价。服务环评报告水化学章节。</p>
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'calc' && <CalculatorPanel />}
      {activeSubTab === 'preset' && <PresetSamplesPanel />}
      {activeSubTab === 'ref' && <ReferencePanel />}

      <DataSourceNote source="GB/T 14848-2017 | 苏卡列夫分类法 | Piper (1944)" />
    </div>
  );
}
