import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, Bar, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, ComposedChart, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import {
  FlaskConical, Droplets, GitBranch, Sprout, Wind,
  Scale, BookOpen, CheckCircle2, XCircle,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
// PipelinePanel removed (unused)
import { FilterableTechTable } from '../FilterableTechTable';
import {
  REMEDIATION_PRESETS, TECH_COMPARISON_TABLE,
  calculatePRB, calculatePAT, calculateMNA, calculateBio, calculateAS, calculateMCDA,
  type PRBInput, type PATInput, type MNAInput, type BioInput, type ASInput, type MCDAInput,
} from '../../utils/remediationEvaluator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};

const TABS = [
  { key: 'prb', label: 'PRB反应墙', icon: FlaskConical },
  { key: 'pat', label: '抽出处理', icon: Droplets },
  { key: 'mna', label: '自然衰减', icon: GitBranch },
  { key: 'bio', label: '生物修复', icon: Sprout },
  { key: 'as', label: '气相抽提', icon: Wind },
  { key: 'mcda', label: '方案比选', icon: Scale },
  { key: 'ref', label: '参考说明', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

// 默认参数
const DEFAULT_PRB: PRBInput = {
  aquiferThickness: 10, hydraulicGradient: 0.003, hydraulicConductivity: 5,
  porosity: 0.25, plumeWidth: 80, initialConcentration: 5.0,
  targetConcentration: 0.05, mediaHalfLife: 3650, reactionRateConstant: 0.5,
  designLife: 20,
};

const DEFAULT_PAT: PATInput = {
  hydraulicConductivity: 5, aquiferThickness: 10, hydraulicGradient: 0.003,
  porosity: 0.25, plumeArea: 2000, initialConcentration: 5.0,
  targetConcentration: 0.05, pumpingRate: 25, wellRadius: 0.1,
  storageCoefficient: 0.001, designPeriod: 15,
};

const DEFAULT_MNA: MNAInput = {
  initialConcentration: 5.0, targetConcentration: 0.05, decayRate: 0.001,
  groundwaterVelocity: 0.06, sourceDistance: 200, porosity: 0.25,
  aquiferThickness: 10, hydraulicConductivity: 5, hydraulicGradient: 0.003,
  monitoringWells: 8, designPeriod: 30,
};

const DEFAULT_BIO: BioInput = {
  initialConcentration: 5.0, targetConcentration: 0.05, temperature: 16,
  pH: 7.2, dissolvedOxygen: 2.0, nitrate: 5.0, sulfate: 50, fe3: 10,
  toc: 5, microbialCount: 10000, hydraulicConductivity: 5, porosity: 0.25,
  plumeVolume: 20000, designPeriod: 20,
};

const DEFAULT_AS: ASInput = {
  initialConcentration: 5.0, targetConcentration: 0.05, henryConstant: 0.01,
  aquiferThickness: 10, hydraulicConductivity: 5, porosity: 0.25,
  saturation: 1.0, plumeArea: 2000, depthToWater: 5, designPeriod: 10,
};

// 默认MCDA方案
const DEFAULT_MCDA: MCDAInput = {
  alternatives: [
    { id: 'prb', name: 'PRB反应墙', cost: 80, remediationTime: 0, scores: { efficiency: 90, cost: 50, time: 95, feasibility: 75, risk: 85, sustainability: 80 } },
    { id: 'pat', name: '抽出处理', cost: 120, remediationTime: 12, scores: { efficiency: 85, cost: 40, time: 55, feasibility: 90, risk: 60, sustainability: 50 } },
    { id: 'mna', name: '自然衰减', cost: 30, remediationTime: 25, scores: { efficiency: 55, cost: 95, time: 20, feasibility: 80, risk: 90, sustainability: 95 } },
    { id: 'bio', name: '生物修复', cost: 60, remediationTime: 8, scores: { efficiency: 70, cost: 75, time: 65, feasibility: 60, risk: 80, sustainability: 90 } },
    { id: 'as', name: '气相抽提', cost: 70, remediationTime: 4, scores: { efficiency: 75, cost: 70, time: 80, feasibility: 65, risk: 65, sustainability: 70 } },
  ],
  weights: { efficiency: 0.30, cost: 0.20, time: 0.20, feasibility: 0.15, risk: 0.10, sustainability: 0.05 },
  criteriaLabels: { efficiency: '去除效率', cost: '经济性', time: '修复速度', feasibility: '技术可行性', risk: '二次污染风险', sustainability: '可持续性' },
};

function NumberField({ label, value, onChange, unit, step = 0.01 }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}{unit ? ` (${unit})` : ''}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
      />
    </div>
  );
}

function StatBox({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-semibold" style={{ color: color || '#06b6d4' }}>
        {value}{unit && <span className="text-xs ml-1 text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

// PRB面板
function PRBPanel() {
  const [input, setInput] = useState<PRBInput>(DEFAULT_PRB);
  const result = useMemo(() => calculatePRB(input), [input]);
  
  const update = (key: keyof PRBInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-cyan-400" /> PRB设计参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="含水层厚度" value={input.aquiferThickness} onChange={v => update('aquiferThickness', v)} unit="m" step={1} />
          <NumberField label="水力梯度" value={input.hydraulicGradient} onChange={v => update('hydraulicGradient', v)} step={0.001} />
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="污染羽宽度" value={input.plumeWidth} onChange={v => update('plumeWidth', v)} unit="m" step={5} />
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="反应速率常数" value={input.reactionRateConstant} onChange={v => update('reactionRateConstant', v)} unit="1/d" step={0.1} />
          <NumberField label="介质半衰期" value={input.mediaHalfLife} onChange={v => update('mediaHalfLife', v)} unit="d" step={100} />
          <NumberField label="设计寿命" value={input.designLife} onChange={v => update('designLife', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="PRB厚度(沿流向)" value={result.prbThickness.toFixed(2)} unit="m" />
        <StatBox label="PRB宽度" value={result.prbWidth.toFixed(0)} unit="m" color="#10b981" />
        <StatBox label="PRB深度" value={result.prbDepth.toFixed(1)} unit="m" color="#10b981" />
        <StatBox label="停留时间" value={result.residenceTime.toFixed(2)} unit="d" color="#f59e0b" />
        <StatBox label="出流浓度" value={result.effluentConcentration.toFixed(4)} unit="mg/L" color={result.effluentConcentration <= input.targetConcentration ? '#10b981' : '#ef4444'} />
        <StatBox label="去除率" value={result.removalEfficiency.toFixed(1)} unit="%" color="#8b5cf6" />
        <StatBox label="介质体积" value={result.mediaVolume.toFixed(1)} unit="m³" color="#06b6d4" />
        <StatBox label="更换周期" value={result.replacementCycle.toFixed(1)} unit="年" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatBox label="建设投资" value={result.capitalCost.toFixed(1)} unit="万元" color="#f59e0b" />
        <StatBox label="年运维费" value={result.annualOcost.toFixed(1)} unit="万元/年" color="#f59e0b" />
        <StatBox label="全生命周期成本" value={result.lifecycleCost.toFixed(1)} unit="万元" color="#ef4444" />
      </div>
      
      <CollapsiblePanel title="PRB设计说明" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p>可渗透反应墙(PRB)是在地下设置含有反应介质的可渗透墙体，当污染地下水通过时发生吸附、降解、沉淀等反应，实现原位处理。</p>
          <p>厚度计算基于一级反应动力学: C/C₀ = exp(-k·t)，其中停留时间 t = 厚度/流速。</p>
          <p>反应介质选择取决于污染物类型: 零价铁(ZVI)适用于重金属和氯代溶剂; 活性炭适用于有机物; 石灰石适用于中和酸性地下水。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

// PAT面板
function PATPanel() {
  const [input, setInput] = useState<PATInput>(DEFAULT_PAT);
  const result = useMemo(() => calculatePAT(input), [input]);
  
  const update = (key: keyof PATInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" /> 抽出处理系统参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="含水层厚度" value={input.aquiferThickness} onChange={v => update('aquiferThickness', v)} unit="m" step={1} />
          <NumberField label="水力梯度" value={input.hydraulicGradient} onChange={v => update('hydraulicGradient', v)} step={0.001} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="污染羽面积" value={input.plumeArea} onChange={v => update('plumeArea', v)} unit="m²" step={100} />
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="单井抽水量" value={input.pumpingRate} onChange={v => update('pumpingRate', v)} unit="m³/d" step={5} />
          <NumberField label="井半径" value={input.wellRadius} onChange={v => update('wellRadius', v)} unit="m" step={0.01} />
          <NumberField label="储水系数" value={input.storageCoefficient} onChange={v => update('storageCoefficient', v)} step={0.0001} />
          <NumberField label="设计期限" value={input.designPeriod} onChange={v => update('designPeriod', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="影响半径" value={result.influenceRadius} unit="m" />
        <StatBox label="捕获区宽度" value={result.captureWidth} unit="m" color="#10b981" />
        <StatBox label="推荐井数" value={result.recommendedWells} unit="口" color="#10b981" />
        <StatBox label="总抽水量" value={result.totalPumpingRate} unit="m³/d" color="#06b6d4" />
        <StatBox label="孔隙体积交换" value={result.poreVolumeExchanges} unit="次" color="#f59e0b" />
        <StatBox label="预测修复时间" value={result.estimatedRemediationTime} unit="年" color={result.estimatedRemediationTime <= input.designPeriod ? '#10b981' : '#ef4444'} />
        <StatBox label="能否达标" value={result.canAchieveTarget ? '是' : '否'} color={result.canAchieveTarget ? '#10b981' : '#ef4444'} />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">浓度衰减曲线</h4>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={result.concentrationCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间(年)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'PV交换次数', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={input.targetConcentration} yAxisId="left" stroke="#ef4444" strokeDasharray="5 5" label={{ value: '目标', fill: '#ef4444', fontSize: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="concentration" name="出水浓度" stroke="#06b6d4" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="cumulativePV" name="累计PV" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}

// MNA面板
function MNAPanel() {
  const [input, setInput] = useState<MNAInput>(DEFAULT_MNA);
  const result = useMemo(() => calculateMNA(input), [input]);
  
  const update = (key: keyof MNAInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-green-400" /> 自然衰减评估参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="一阶衰减速率" value={input.decayRate} onChange={v => update('decayRate', v)} unit="1/d" step={0.0005} />
          <NumberField label="地下水流速" value={input.groundwaterVelocity} onChange={v => update('groundwaterVelocity', v)} unit="m/d" step={0.01} />
          <NumberField label="污染源距离" value={input.sourceDistance} onChange={v => update('sourceDistance', v)} unit="m" step={10} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="监测井数" value={input.monitoringWells} onChange={v => update('monitoringWells', v)} unit="口" step={1} />
          <NumberField label="设计期限" value={input.designPeriod} onChange={v => update('designPeriod', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="半衰期" value={result.halfLife} unit="d" />
        <StatBox label="达标所需时间" value={result.timeToTarget} unit="年" color={result.feasible ? '#10b981' : '#ef4444'} />
        <StatBox label="衰减距离" value={result.attenuationDistance} unit="m" color="#06b6d4" />
        <StatBox label="衰减容量" value={result.attenuationCapacity} unit="mg/L·m" color="#f59e0b" />
        <StatBox label="可行性" value={result.feasible ? '可行' : '不可行'} color={result.feasible ? '#10b981' : '#ef4444'} />
        <StatBox label="监测频率建议" value={result.monitoringFrequency} unit="次/年" color="#8b5cf6" />
        <StatBox label="年监测成本" value={result.annualMonitoringCost} unit="万元/年" color="#f59e0b" />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">浓度-距离衰减曲线</h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={result.attenuationCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="distance" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '距离(m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={input.targetConcentration} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '目标', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine x={input.sourceDistance} stroke="#64748b" strokeDasharray="3 3" label={{ value: '污染源', fill: '#64748b', fontSize: 10 }} />
            <Line type="monotone" dataKey="concentration" name="污染物浓度" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">衰减机制贡献分析</h4>
        <div className="space-y-2">
          {result.attenuationMechanisms.map((m) => (
            <div key={m.mechanism} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-20">{m.mechanism}</span>
              <div className="flex-1 bg-slate-800/60 rounded-full h-4 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.contribution}%`, background: ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'][result.attenuationMechanisms.indexOf(m)] || '#64748b' }} />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">{m.contribution}%</span>
              <span className="text-xs text-slate-500 flex-1">{m.description}</span>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}

// 生物修复面板
function BioPanel() {
  const [input, setInput] = useState<BioInput>(DEFAULT_BIO);
  const result = useMemo(() => calculateBio(input), [input]);
  
  const update = (key: keyof BioInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  const suitColor = result.suitabilityScore >= 75 ? '#10b981' : result.suitabilityScore >= 50 ? '#f59e0b' : result.suitabilityScore >= 30 ? '#f97316' : '#ef4444';
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-400" /> 生物修复评估参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="温度" value={input.temperature} onChange={v => update('temperature', v)} unit="℃" step={1} />
          <NumberField label="pH值" value={input.pH} onChange={v => update('pH', v)} step={0.1} />
          <NumberField label="溶解氧" value={input.dissolvedOxygen} onChange={v => update('dissolvedOxygen', v)} unit="mg/L" step={0.5} />
          <NumberField label="硝酸盐" value={input.nitrate} onChange={v => update('nitrate', v)} unit="mg/L" step={1} />
          <NumberField label="硫酸盐" value={input.sulfate} onChange={v => update('sulfate', v)} unit="mg/L" step={5} />
          <NumberField label="Fe(III)" value={input.fe3} onChange={v => update('fe3', v)} unit="mg/L" step={1} />
          <NumberField label="TOC" value={input.toc} onChange={v => update('toc', v)} unit="mg/L" step={1} />
          <NumberField label="微生物计数" value={input.microbialCount} onChange={v => update('microbialCount', v)} unit="CFU/mL" step={1000} />
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="污染羽体积" value={input.plumeVolume} onChange={v => update('plumeVolume', v)} unit="m³" step={1000} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="适宜性评分" value={result.suitabilityScore} unit="/100" color={suitColor} />
        <StatBox label="适宜性等级" value={result.suitabilityLevel} color={suitColor} />
        <StatBox label="最大降解速率" value={result.maxDegradationRate} unit="mg/L/d" color="#10b981" />
        <StatBox label="预测修复时间" value={result.estimatedTime} unit="年" color="#f59e0b" />
        <StatBox label="需要强化" value={result.needsEnhancement ? '是' : '否'} color={result.needsEnhancement ? '#f59e0b' : '#10b981'} />
        <StatBox label="氮需求" value={result.nutrientRequirement.nitrogen} unit="kg" />
        <StatBox label="磷需求" value={result.nutrientRequirement.phosphorus} unit="kg" />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">电子受体分析</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={result.electronAcceptors}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="acceptor" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '容量(mg/L)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="concentration" name="浓度" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="capacity" name="氧化容量" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      {result.enhancementSuggestions.length > 0 && (
        <TechCard>
          <h4 className="text-xs font-semibold text-slate-300 mb-3">强化修复建议</h4>
          <ul className="space-y-1.5">
            {result.enhancementSuggestions.map((s, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </TechCard>
      )}
    </div>
  );
}

// AS面板
function ASPanel() {
  const [input, setInput] = useState<ASInput>(DEFAULT_AS);
  const result = useMemo(() => calculateAS(input), [input]);
  
  const update = (key: keyof ASInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  const suitable = input.henryConstant > 0.01;
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400" /> 气相抽提设计参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="亨利常数" value={input.henryConstant} onChange={v => update('henryConstant', v)} step={0.01} />
          <NumberField label="含水层厚度" value={input.aquiferThickness} onChange={v => update('aquiferThickness', v)} unit="m" step={1} />
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="污染羽面积" value={input.plumeArea} onChange={v => update('plumeArea', v)} unit="m²" step={100} />
          <NumberField label="地下水埋深" value={input.depthToWater} onChange={v => update('depthToWater', v)} unit="m" step={1} />
          <NumberField label="设计期限" value={input.designPeriod} onChange={v => update('designPeriod', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      {!suitable && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-300">亨利常数过低(≤0.01)，该污染物挥发性差，不适合气相抽提技术</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="影响半径" value={result.influenceRadius} unit="m" />
        <StatBox label="注气流量" value={result.airFlowRate} unit="m³/min" color="#06b6d4" />
        <StatBox label="推荐井数" value={result.recommendedWells} unit="口" color="#10b981" />
        <StatBox label="井间距" value={result.wellSpacing} unit="m" color="#10b981" />
        <StatBox label="注气压力" value={result.injectionPressure} unit="kPa" color="#f59e0b" />
        <StatBox label="预测修复时间" value={result.estimatedTime > 0 ? result.estimatedTime : 'N/A'} unit={result.estimatedTime > 0 ? '年' : ''} color={result.estimatedTime > 0 && result.estimatedTime <= input.designPeriod ? '#10b981' : '#ef4444'} />
        <StatBox label="能否达标" value={result.canAchieveTarget ? '是' : '否'} color={result.canAchieveTarget ? '#10b981' : '#ef4444'} />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">去除率随时间变化</h4>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={result.removalCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间(年)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '去除率(%)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={input.targetConcentration} yAxisId="left" stroke="#ef4444" strokeDasharray="5 5" />
            <Line yAxisId="left" type="monotone" dataKey="concentration" name="残留浓度" stroke="#06b6d4" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="removalPercent" name="去除率" stroke="#10b981" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}

// MCDA方案比选面板
function MCDAPanel() {
  const [input, setInput] = useState<MCDAInput>(DEFAULT_MCDA);
  const result = useMemo(() => calculateMCDA(input), [input]);
  
  const radarData = useMemo(() => {
    const criteria = Object.keys(input.weights);
    return criteria.map(c => {
      const row: Record<string, number | string> = { criterion: input.criteriaLabels[c] || c };
      input.alternatives.forEach(alt => {
        row[alt.name] = alt.scores[c] || 0;
      });
      return row;
    });
  }, [input]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" /> 多准则决策分析(MCDA)
        </h3>
        <div className="text-xs text-slate-400 mb-3">
          基于6项准则对5种修复技术进行综合评价，权重可通过滑块调整
        </div>
        <div className="space-y-2">
          {Object.entries(input.weights).map(([key, w]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-20">{input.criteriaLabels[key] || key}</span>
              <input
                type="range" min={0} max={1} step={0.05} value={w}
                onChange={(e) => {
                  const newW = parseFloat(e.target.value);
                  const others = Object.entries(input.weights).filter(([k]) => k !== key);
                  const remainW = 1 - newW;
                  const totalOthers = others.reduce((s, [, v]) => s + v, 0);
                  const newWeights = { ...input.weights, [key]: newW };
                  others.forEach(([k, v]) => {
                    newWeights[k] = totalOthers > 0 ? (v / totalOthers) * remainW : remainW / others.length;
                  });
                  setInput(prev => ({ ...prev, weights: newWeights }));
                }}
                className="flex-1"
              />
              <span className="text-xs text-cyan-400 w-10 text-right">{(w * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">综合排名</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400">排名</th>
                <th className="text-left py-2 px-2 text-slate-400">方案</th>
                <th className="text-right py-2 px-2 text-slate-400">综合得分</th>
                <th className="text-right py-2 px-2 text-slate-400">成本(万元)</th>
                <th className="text-right py-2 px-2 text-slate-400">修复时间(年)</th>
                <th className="text-right py-2 px-2 text-slate-400">成本效益比</th>
              </tr>
            </thead>
            <tbody>
              {result.ranking.map((r) => (
                <tr key={r.id} className={`border-b border-slate-800 ${r.rank === 1 ? 'bg-cyan-500/5' : ''}`}>
                  <td className="py-2 px-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${r.rank === 1 ? 'bg-cyan-500 text-white' : r.rank === 2 ? 'bg-slate-600 text-slate-200' : 'bg-slate-800 text-slate-400'}`}>
                      {r.rank}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-200">{r.name}{r.rank === 1 && <span className="ml-2 text-cyan-400">推荐</span>}</td>
                  <td className="text-right py-2 px-2 text-cyan-400 font-semibold">{r.totalScore}</td>
                  <td className="text-right py-2 px-2 text-slate-300">{r.cost}</td>
                  <td className="text-right py-2 px-2 text-slate-300">{r.remediationTime || '实时'}</td>
                  <td className="text-right py-2 px-2 text-amber-400">{result.costEffectiveness.find(c => c.name === r.name)?.ratio || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">雷达图对比</h4>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="criterion" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
            {input.alternatives.map((alt, i) => (
              <Radar key={alt.id} name={alt.name} dataKey={alt.name} stroke={['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i]} fill={['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i]} fillOpacity={0.1} strokeWidth={1.5} />
            ))}
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
          </RadarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">权重敏感性分析</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400">准则</th>
                <th className="text-center py-2 px-2 text-slate-400">权重+20%排序变化</th>
                <th className="text-center py-2 px-2 text-slate-400">权重-20%排序变化</th>
                <th className="text-center py-2 px-2 text-slate-400">是否敏感</th>
              </tr>
            </thead>
            <tbody>
              {result.sensitivityAnalysis.map((s) => (
                <tr key={s.criterion} className="border-b border-slate-800">
                  <td className="py-2 px-2 text-slate-200">{input.criteriaLabels[s.criterion] || s.criterion}</td>
                  <td className="text-center py-2 px-2 text-slate-400">
                    {s.increasedRank.map(id => input.alternatives.find(a => a.id === id)?.name?.charAt(0) || '?').join('→')}
                  </td>
                  <td className="text-center py-2 px-2 text-slate-400">
                    {s.decreasedRank.map(id => input.alternatives.find(a => a.id === id)?.name?.charAt(0) || '?').join('→')}
                  </td>
                  <td className="text-center py-2 px-2">
                    {s.rankChanged ? <span className="text-amber-400">敏感</span> : <span className="text-emerald-400">稳定</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}

// 参考说明面板
function ReferencePanel() {
  const headers = ['指标', 'PRB反应墙', '抽出处理', '自然衰减', '生物修复', '气相抽提'];
  const rows = TECH_COMPARISON_TABLE.map(t => [t.metric, t.prb, t.pat, t.mna, t.bio, t.as]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">五种修复技术对比</h3>
        <FilterableTechTable headers={headers} rows={rows} />
      </TechCard>
      
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">预设污染场景</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REMEDIATION_PRESETS.map(p => (
            <div key={p.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <div className="text-sm font-medium text-cyan-400">{p.name}</div>
              <div className="text-xs text-slate-400 mt-1">{p.description}</div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">污染物: {p.contaminant}</span>
                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">{p.aquiferType}含水层</span>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
      
      <CollapsiblePanel title="技术方法与参考标准" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">PRB设计</strong>: 基于一级反应动力学方程 C/C₀ = exp(-k·t)，厚度计算确保出流浓度低于目标值。参考: EPA/600/R-02/003 PRB设计指南。</p>
          <p><strong className="text-slate-300">P&amp;T系统</strong>: 基于Theis井流理论和Sichardt影响半径公式，浓度衰减采用孔隙体积交换模型。参考: EPA/540/S-92/001 抽出处理技术指南。</p>
          <p><strong className="text-slate-300">MNA评估</strong>: 基于一阶衰减模型 C(x) = C₀·exp(-λ·x/v)，衰减机制贡献参照US EPA MNA协议(EPA/600/R-01/020)。</p>
          <p><strong className="text-slate-300">生物修复</strong>: 适宜性评分基于温度、pH、电子受体、TOC、微生物丰度、渗透性多因素加权。降解速率采用Monod方程简化形式。参考: EPA/600/R-08/140 生物修复评估指南。</p>
          <p><strong className="text-slate-300">气相抽提</strong>: 影响半径基于渗透系数经验公式，挥发去除基于亨利定律。参考: EPA/540/S-91/003 SVE设计手册。</p>
          <p><strong className="text-slate-300">MCDA</strong>: 采用加权线性求和(WSM)法，敏感性分析为权重±20%单变量扰动法。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

export function RemediationTab() {
  const [activeTab, setActiveTab] = useState<TabKey>('prb');
  
  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100">地下水修复方案评估器</h2>
          <span className="text-xs text-slate-500">B-38</span>
        </div>
        <p className="text-xs text-slate-400">
          涵盖PRB反应墙、抽出处理、自然衰减、生物修复、气相抽提五大技术评估，支持多准则方案比选(MCDA)与成本效益分析
        </p>
      </TechCard>
      
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {activeTab === 'prb' && <PRBPanel />}
      {activeTab === 'pat' && <PATPanel />}
      {activeTab === 'mna' && <MNAPanel />}
      {activeTab === 'bio' && <BioPanel />}
      {activeTab === 'as' && <ASPanel />}
      {activeTab === 'mcda' && <MCDAPanel />}
      {activeTab === 'ref' && <ReferencePanel />}
      
      <DataSourceNote source="基于EPA技术指南与HJ 25.6-2019污染地块地下水修复技术导则，参数可调" />
    </div>
  );
}
