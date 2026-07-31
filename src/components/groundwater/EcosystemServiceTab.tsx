import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart, LineChart, Line,
} from 'recharts';
import {
  Leaf, Droplets, Wind, Mountain, BookOpen,
  TrendingDown, TrendingUp, AlertCircle,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  REGION_PRESETS,
  calculateEcosystemService,
  calculateValueTransfer,
  calculateEcoWaterDemand,
  type SupplyServiceInput, type RegulationServiceInput,
  type CulturalServiceInput, type SupportingServiceInput,
  type ValueTransferInput, type EcoWaterDemandInput,
} from '../../utils/ecosystemServiceEvaluator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};

const TABS = [
  { key: 'overview', label: '服务总览', icon: Leaf },
  { key: 'supply', label: '供给服务', icon: Droplets },
  { key: 'regulation', label: '调节服务', icon: Wind },
  { key: 'cultural', label: '文化服务', icon: Mountain },
  { key: 'demand', label: '生态需水', icon: TrendingDown },
  { key: 'transfer', label: '价值转移', icon: TrendingUp },
  { key: 'ref', label: '参考说明', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

const CATEGORY_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

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

// 服务总览面板
function OverviewPanel({ result }: { result: ReturnType<typeof calculateEcosystemService> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="总生态系统服务价值" value={result.totalValue.toLocaleString()} unit="万元/年" color="#06b6d4" />
        <StatBox label="可持续性评分" value={result.sustainabilityScore} unit="/100" color={result.sustainabilityScore >= 55 ? '#10b981' : '#f59e0b'} />
        <StatBox label="可持续性等级" value={result.sustainabilityLevel} color={result.sustainabilityScore >= 55 ? '#10b981' : '#f59e0b'} />
        <StatBox label="服务类型数" value={4} unit="大类" color="#8b5cf6" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">生态系统服务价值构成</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={result.valueByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(e: { category?: string; percentage?: number }) => `${e.category || ''} ${e.percentage || 0}%`}>
                {result.valueByCategory.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
            </PieChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={result.valueByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={70} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {result.valueByCategory.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">各地区生态系统服务价值对比</h4>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={result.valueByRegion}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="region" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '总价值(万元)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '人均(万元)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="value" name="总价值" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="perCapita" name="人均价值" stroke="#f59e0b" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">管理建议</h4>
        <ul className="space-y-1.5">
          {result.recommendations.map((r, i) => (
            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </TechCard>
    </div>
  );
}

// 供给服务面板
function SupplyPanel({ supply }: { supply: EcosystemServiceResult['supply'] }) {
  const data = [
    { name: '生活用水', volume: supply.domestic.volume, value: supply.domestic.value },
    { name: '农业灌溉', volume: supply.irrigation.volume, value: supply.irrigation.value },
    { name: '工业用水', volume: supply.industrial.volume, value: supply.industrial.value },
    { name: '生态用水', volume: supply.ecological.volume, value: supply.ecological.value },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="总供水量" value={supply.totalVolume.toLocaleString()} unit="万m³/年" color="#06b6d4" />
        <StatBox label="供水总价值" value={supply.totalValue.toLocaleString()} unit="万元/年" color="#10b981" />
        <StatBox label="生活用水价值" value={supply.domestic.value.toLocaleString()} unit="万元" />
        <StatBox label="农业灌溉价值" value={supply.irrigation.value.toLocaleString()} unit="万元" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">各类用水量与价值对比</h4>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '水量(万m³)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '价值(万元)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="volume" name="用水量" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="value" name="经济价值" stroke="#f59e0b" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
      
      <CollapsiblePanel title="供给服务评估方法" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p>供给服务采用市场价值法评估，水量乘以对应水价得出经济价值。生活、农业、工业、生态用水分别按各自水价计算。</p>
          <p>生态用水按生活水价的80%估算，反映其社会公益性。实际开采量与可开采量的比值反映资源可持续性。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

// 调节服务面板
function RegulationPanel({ regulation }: { regulation: EcosystemServiceResult['regulation'] }) {
  const data = [
    { name: '基流维持', value: regulation.baseflow.value },
    { name: '水质净化', value: regulation.purification.value },
    { name: '气候调节', value: regulation.climate.value },
    { name: '洪水调蓄', value: regulation.flood.value },
    { name: '蒸散发调节', value: regulation.etRegulation.value },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="调节服务总价值" value={regulation.totalValue.toLocaleString()} unit="万元/年" color="#10b981" />
        <StatBox label="基流维持" value={regulation.baseflow.value.toLocaleString()} unit="万元" color="#06b6d4" />
        <StatBox label="水质净化" value={regulation.purification.value.toLocaleString()} unit="万元" color="#10b981" />
        <StatBox label="气候调节(碳汇)" value={regulation.climate.value.toLocaleString()} unit="万元" color="#8b5cf6" />
        <StatBox label="洪水调蓄" value={regulation.flood.value.toLocaleString()} unit="万元" color="#f59e0b" />
        <StatBox label="蒸散发调节" value={regulation.etRegulation.value.toLocaleString()} unit="万元" color="#06b6d4" />
        <StatBox label="基流量" value={regulation.baseflow.volume.toLocaleString()} unit="万m³" />
        <StatBox label="净化污染物" value={regulation.purification.amount.toLocaleString()} unit="吨/年" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">调节服务价值分布</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '价值(万元)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
            <Bar dataKey="value" name="价值" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <CollapsiblePanel title="调节服务评估方法" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">基流维持</strong>: 替代工程法，以建设同等流量水库的成本(2元/m³)估算基流价值。</p>
          <p><strong className="text-slate-300">水质净化</strong>: 替代成本法，以同等污染物处理量的水处理成本估算。</p>
          <p><strong className="text-slate-300">气候调节</strong>: 碳储量乘以碳交易价格，反映地下水生态系统的碳汇价值。</p>
          <p><strong className="text-slate-300">洪水调蓄</strong>: 调蓄空间乘以单位避免洪涝损失。</p>
          <p><strong className="text-slate-300">蒸散发调节</strong>: 蒸散发量乘以微气候调节单价(0.5元/m³)。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

// 文化服务面板
function CulturalPanel({ cultural, supporting }: { cultural: EcosystemServiceResult['cultural']; supporting: EcosystemServiceResult['supporting'] }) {
  const data = [
    { name: '休闲旅游', value: cultural.recreation.value },
    { name: '教育科研', value: cultural.education.value },
    { name: '地质遗迹/泉群', value: cultural.geological.value },
    { name: '生境维持', value: supporting.habitat.value },
    { name: '生物多样性', value: supporting.biodiversity.value },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="文化服务总价值" value={cultural.totalValue.toLocaleString()} unit="万元/年" color="#f59e0b" />
        <StatBox label="休闲旅游" value={cultural.recreation.value.toLocaleString()} unit="万元" color="#f59e0b" />
        <StatBox label="教育科研" value={cultural.education.value.toLocaleString()} unit="万元" color="#06b6d4" />
        <StatBox label="地质遗迹" value={cultural.geological.value.toLocaleString()} unit="万元" color="#8b5cf6" />
        <StatBox label="支持服务总价值" value={supporting.totalValue.toLocaleString()} unit="万元/年" color="#8b5cf6" />
        <StatBox label="生境维持" value={supporting.habitat.value.toLocaleString()} unit="万元" color="#10b981" />
        <StatBox label="生物多样性" value={supporting.biodiversity.value.toLocaleString()} unit="万元" color="#ef4444" />
        <StatBox label="濒危物种" value={supporting.biodiversity.species} unit="种" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">文化与支持服务价值</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
            <Bar dataKey="value" name="价值" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill={['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#ef4444'][i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <CollapsiblePanel title="文化与支持服务评估方法" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">休闲旅游</strong>: 旅行费用法(TCM)，游客量乘以平均消费。</p>
          <p><strong className="text-slate-300">教育科研</strong>: 科研经费直接计算，反映地下水科研的学术价值。</p>
          <p><strong className="text-slate-300">地质遗迹/泉群</strong>: 存在价值评估法，每个遗迹50万元/年，每个泉群100万元/年。</p>
          <p><strong className="text-slate-300">生境维持</strong>: 湿地面积乘以单位面积生物多样性价值。</p>
          <p><strong className="text-slate-300">生物多样性</strong>: 濒危物种保护价值，每种500万元/年。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

// 生态需水面板
function EcoDemandPanel() {
  const [input, setInput] = useState<EcoWaterDemandInput>({
    wetlandArea: 500, wetlandET: 1200,
    vegetationArea: 1000, vegetationTranspiration: 800,
    riverLength: 200, riverEvaporation: 1100, riverWidth: 30,
    criticalDepth: 4, currentDepth: 12,
    specificYield: 0.15, influenceRadius: 50,
  });
  
  const result = useMemo(() => calculateEcoWaterDemand(input), [input]);
  const update = (key: keyof EcoWaterDemandInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-blue-400" /> 生态需水量计算
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            ['wetlandArea', '湿地面积', 'km²', 100], ['wetlandET', '湿地蒸散发', 'mm/年', 50],
            ['vegetationArea', '植被面积', 'km²', 100], ['vegetationTranspiration', '植被蒸腾', 'mm/年', 50],
            ['riverLength', '河流长度', 'km', 10], ['riverEvaporation', '河流蒸发', 'mm/年', 50],
            ['riverWidth', '河流宽度', 'm', 5], ['criticalDepth', '临界埋深', 'm', 0.5],
            ['currentDepth', '当前埋深', 'm', 0.5], ['specificYield', '给水度', '', 0.01],
            ['influenceRadius', '影响半径', 'm', 10],
          ] as [keyof EcoWaterDemandInput, string, string, number][]).map(([key, label, unit, step]) => (
            <div key={key}>
              <label className="text-xs text-slate-400 block mb-1">{label}{unit ? ` (${unit})` : ''}</label>
              <input type="number" value={input[key]} step={step}
                onChange={e => update(key, parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="总需水量" value={result.totalDemand} unit="万m³/年" color="#06b6d4" />
        <StatBox label="湿地需水" value={result.wetlandDemand} unit="万m³" color="#10b981" />
        <StatBox label="植被需水" value={result.vegetationDemand} unit="万m³" color="#84cc16" />
        <StatBox label="河流需水" value={result.riverDemand} unit="万m³" color="#3b82f6" />
        <StatBox label="当前供给" value={result.currentSupply} unit="万m³" color="#f59e0b" />
        <StatBox label="缺水量" value={result.deficit} unit="万m³" color="#ef4444" />
        <StatBox label="缺水率" value={result.deficitRatio} unit="%" color={result.deficitRatio > 50 ? '#ef4444' : '#f59e0b'} />
        <StatBox label="缺水状态" value={result.status} color={result.deficitRatio < 30 ? '#10b981' : '#ef4444'} />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">月度生态需水过程</h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={result.monthlyDemand}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '需水量(万m³)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="wetland" name="湿地" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="vegetation" name="植被" stroke="#84cc16" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="river" name="河流" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="total" name="总计" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}

// 价值转移法面板
function TransferPanel() {
  const [input, setInput] = useState<ValueTransferInput>({
    area: 5000, aquiferType: 'porous', climate: 'semi-arid', development: 'high',
  });
  const result = useMemo(() => calculateValueTransfer(input), [input]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> 价值转移法估算
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">评估面积 (km²)</label>
            <input type="number" value={input.area} step={100}
              onChange={e => setInput(p => ({ ...p, area: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">含水层类型</label>
            <select value={input.aquiferType} onChange={e => setInput(p => ({ ...p, aquiferType: e.target.value as ValueTransferInput['aquiferType'] }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
              <option value="porous">孔隙含水层</option>
              <option value="fractured">裂隙含水层</option>
              <option value="karst">岩溶含水层</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">气候区</label>
            <select value={input.climate} onChange={e => setInput(p => ({ ...p, climate: e.target.value as ValueTransferInput['climate'] }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
              <option value="humid">湿润区</option>
              <option value="semi-arid">半干旱区</option>
              <option value="arid">干旱区</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">开发利用程度</label>
            <select value={input.development} onChange={e => setInput(p => ({ ...p, development: e.target.value as ValueTransferInput['development'] }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
              <option value="low">低开发</option>
              <option value="medium">中开发</option>
              <option value="high">高开发</option>
            </select>
          </div>
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatBox label="单位面积价值" value={result.unitValue} unit="万元/km²·年" color="#06b6d4" />
        <StatBox label="总价值" value={result.totalValue.toLocaleString()} unit="万元/年" color="#10b981" />
        <StatBox label="评估面积" value={input.area} unit="km²" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">各服务类型价值分配</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={result.services}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '万元/年', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="totalValue" name="总价值" radius={[4, 4, 0, 0]}>
              {result.services.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">价值转移修正系数</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400">修正因子</th>
                <th className="text-right py-2 px-2 text-slate-400">系数</th>
                <th className="text-left py-2 px-2 text-slate-400">说明</th>
              </tr>
            </thead>
            <tbody>
              {result.transferCoefficients.map((c, i) => (
                <tr key={i} className="border-b border-slate-800">
                  <td className="py-2 px-2 text-slate-200">{c.factor}</td>
                  <td className="text-right py-2 px-2 text-cyan-400 font-semibold">{c.coefficient.toFixed(2)}</td>
                  <td className="py-2 px-2 text-slate-400">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}

// 参考面板
function ReferencePanel() {
  const headers = ['服务大类', '服务子类', '评估方法', '数据来源'];
  const rows = [
    ['供给服务', '生活/农业/工业供水', '市场价值法', '水资源公报+水价标准'],
    ['供给服务', '生态用水', '影子价格法', '生活水价×80%'],
    ['调节服务', '基流维持', '替代工程法', '水库建设成本2元/m³'],
    ['调节服务', '水质净化', '替代成本法', '污水处理成本'],
    ['调节服务', '气候调节', '碳交易法', '碳储量×碳交易价'],
    ['调节服务', '洪水调蓄', '避免损失法', '调蓄空间×洪灾损失'],
    ['调节服务', '蒸散发调节', '微气候价值法', '蒸散发量×0.5元/m³'],
    ['文化服务', '休闲旅游', '旅行费用法(TCM)', '游客量×平均消费'],
    ['文化服务', '教育科研', '直接计算法', '科研经费统计'],
    ['文化服务', '地质遗迹/泉群', '存在价值法', '50/100万元/个·年'],
    ['支持服务', '生境维持', '单位面积价值法', '湿地面积×生物多样性价值'],
    ['支持服务', '生物多样性', '物种保护价值法', '濒危物种×500万元/种'],
  ];
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">评估方法与数据来源</h3>
        <FilterableTechTable headers={headers} rows={rows} />
      </TechCard>
      
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">预设区域数据</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REGION_PRESETS.map(r => (
            <div key={r.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <div className="text-sm font-medium text-cyan-400">{r.name}</div>
              <div className="text-xs text-slate-400 mt-1">{r.description}</div>
              <div className="text-xs text-slate-500 mt-1">人口: {r.population}万</div>
            </div>
          ))}
        </div>
      </TechCard>
      
      <CollapsiblePanel title="理论基础与参考文献" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">TEV框架</strong>: 总经济价值(Total Economic Value) = 使用价值 + 非使用价值，包括直接/间接使用价值、选择价值和存在价值。</p>
          <p><strong className="text-slate-300">MA框架</strong>: 千年生态系统评估(Millennium Ecosystem Assessment)将生态系统服务分为供给、调节、文化、支持四大类。</p>
          <p><strong className="text-slate-300">价值转移法</strong>: 基于Costanza et al.(2014)全球生态系统服务价值评估成果，结合区域修正系数进行本地化估算。</p>
          <p><strong className="text-slate-300">参考标准</strong>: GB/T 38582-2020《生态系统评估 生态系统服务评估方法》、HJ 1169-2021《生态保护红线监管技术指南》。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

type EcosystemServiceResult = ReturnType<typeof calculateEcosystemService>;

export function EcosystemServiceTab() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [presetId, setPresetId] = useState('hebei_plain');
  
  const preset = REGION_PRESETS.find(p => p.id === presetId) || REGION_PRESETS[0];
  
  const result = useMemo(() => calculateEcosystemService(
    preset.supply as SupplyServiceInput,
    preset.regulation as RegulationServiceInput,
    preset.cultural as CulturalServiceInput,
    preset.supporting as SupportingServiceInput,
    preset.population,
  ), [preset]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100">地下水生态系统服务评估器</h2>
          <span className="text-xs text-slate-500">B-39</span>
        </div>
        <p className="text-xs text-slate-400">
          基于TEV框架评估地下水四大生态系统服务(供给/调节/文化/支持)价值，含生态需水量计算与价值转移法估算
        </p>
      </TechCard>
      
      <TechCard>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-400">预设区域:</span>
          <select value={presetId} onChange={e => setPresetId(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
            {REGION_PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="text-xs text-slate-500">{preset.description}</div>
      </TechCard>
      
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {activeTab === 'overview' && <OverviewPanel result={result} />}
      {activeTab === 'supply' && <SupplyPanel supply={result.supply} />}
      {activeTab === 'regulation' && <RegulationPanel regulation={result.regulation} />}
      {activeTab === 'cultural' && <CulturalPanel cultural={result.cultural} supporting={result.supporting} />}
      {activeTab === 'demand' && <EcoDemandPanel />}
      {activeTab === 'transfer' && <TransferPanel />}
      {activeTab === 'ref' && <ReferencePanel />}
      
      <DataSourceNote source="基于TEV框架与MA分类体系, 参考Costanza(2014)和GB/T 38582-2020" />
    </div>
  );
}
