/**
 * B-28 历史水文地质参数推算器 Tab
 *
 * 4大面板：
 *  1. 泉水频率分析 — 流量序列→P-III型曲线+保证率流量
 *  2. 参数反演 — 抽水试验数据→K/T/S三方法对比
 *  3. 径流还原 — 实测径流→天然径流（人类活动影响分离）
 *  4. 地质年代 — ¹⁴C/氚/地层对比多方法估算
 */
import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Calculator, Droplets, Waves, Atom, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_SPRINGS, PRESET_AQUIFERS, PRESET_RUNOFF,
  calcSpringFrequency, calcAquiferParams, calcRunoffRestoration,
  calcAllAquifers, calcAllAges,
} from '../../utils/historicalParamCalculator';

// ── 面板1: 泉水频率分析 ──

function SpringFrequencyPanel() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const input = PRESET_SPRINGS[selectedIdx];
  const result = useMemo(() => calcSpringFrequency(input), [input]);

  const chartData = result.empirical.map(e => ({
    frequency: e.frequency,
    flow: e.flow,
    year: e.year,
  }));

  // P-III曲线数据
  const curveData: Array<{ frequency: number; curve: number }> = [];
  for (let p = 1; p <= 99; p += 1) {
    const sorted = [...input.data].sort((a, b) => b.flow - a.flow);
    const m = sorted.reduce((sum, d) => sum + d.flow, 0) / sorted.length;
    // 简化P-III曲线插值
    const sortedFlows = sorted.map(d => d.flow);
    const rank = (p / 100) * (sorted.length + 1);
    const lower = Math.floor(rank) - 1;
    const upper = Math.ceil(rank) - 1;
    const frac = rank - Math.floor(rank);
    let flow: number;
    if (lower < 0) flow = sortedFlows[0] ?? m;
    else if (upper >= sortedFlows.length) flow = sortedFlows[sortedFlows.length - 1] ?? m;
    else flow = sortedFlows[lower] + (sortedFlows[upper] - sortedFlows[lower]) * frac;
    curveData.push({ frequency: p, curve: Math.round(flow * 1000) / 1000 });
  }

  // 合并图表数据
  const combinedData = chartData.map(d => {
    const c = curveData.find(c => Math.abs(c.frequency - d.frequency) < 0.5);
    return { ...d, curve: c?.curve ?? null };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_SPRINGS.map((s, i) => (
          <button key={i} onClick={() => setSelectedIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${selectedIdx === i ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="样本数" value={result.n} unit="年" icon={Droplets} accent="blue" />
        <StatCard title="均值" value={result.mean} unit="m³/s" icon={Calculator} accent="cyan" />
        <StatCard title="变差系数Cv" value={result.cv} unit="" icon={Waves} accent="amber" />
        <StatCard title="偏态系数Cs" value={result.cs} unit="" icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="经验频率+P-III型曲线" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="frequency" stroke="#64748b" fontSize={10} label={{ value: '频率(%)', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: '流量(m³/s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="频率分析" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line dataKey="flow" name="实测值" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              <Line dataKey="curve" name="P-III曲线" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="各保证率设计流量" badge="P-III型">
          <div className="grid grid-cols-5 gap-2">
            {result.designFlows.map((d, i) => (
              <div key={i} className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">P={d.probability}%</div>
                <div className="text-sm font-mono text-gw-highlight">{d.flow}</div>
                <div className="text-[9px] text-gw-muted">m³/s</div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-gw-surface/50 rounded">
            <div className="text-[10px] text-gw-muted">Cs/Cv比值</div>
            <div className="text-sm font-mono text-gw-cyan">{result.csCvRatio}</div>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">{result.note}</p>
        </TechCard>
      </div>

      <TechCard title="经验频率排列表">
        <FilterableTechTable
          headers={['序号', '年份', '流量(m³/s)', '经验频率(%)']}
          rows={result.empirical.map(e => [String(e.rank), String(e.year), String(e.flow), String(e.frequency)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板2: 参数反演 ──

function AquiferParamPanel() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const input = PRESET_AQUIFERS[selectedIdx];
  const result = useMemo(() => calcAquiferParams(input), [input]);
  const allResults = useMemo(() => calcAllAquifers(), []);

  const methodCompareData = [
    { method: 'Dupuit法', K: result.dupuit.K, T: result.dupuit.T },
    { method: 'Theis恢复法', K: result.theis.K, T: result.theis.T },
    { method: '经验法', K: result.empirical.K, T: result.empirical.T },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_AQUIFERS.map((a, i) => (
          <button key={i} onClick={() => setSelectedIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${selectedIdx === i ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {a.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="推荐K值" value={result.recommendedK} unit="m/d" icon={Calculator} accent="blue" />
        <StatCard title="推荐T值" value={result.recommendedT} unit="m²/d" icon={Waves} accent="cyan" />
        <StatCard title="Theis-S值" value={result.theis.S} unit="" icon={Droplets} accent="amber" />
        <StatCard title="出水率" value={result.empirical.yieldRate} unit="m³/(h·m)" icon={BookOpen} accent="emerald" />
      </div>

      <LazyChartCard title="三种方法K/T值对比" height={280}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={methodCompareData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="method" stroke="#64748b" fontSize={10} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} label={{ value: 'K(m/d)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} label={{ value: 'T(m²/d)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="参数对比" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="K" name="渗透系数K(m/d)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="T" name="导水系数T(m²/d)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {methodCompareData.map((m, i) => {
          const detail = [result.dupuit, result.theis, result.empirical][i];
          return (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="text-xs font-semibold text-gw-text">{m.method}</div>
              <div className="text-sm font-mono text-gw-highlight mt-1">K={m.K} m/d, T={m.T} m²/d</div>
              <div className="text-[10px] text-gw-muted mt-1">{detail.method}</div>
            </div>
          );
        })}
      </div>

      <TechCard title="综合评价" icon={BookOpen}>
        <p className="text-sm text-gw-text leading-relaxed">{result.note}</p>
      </TechCard>

      <TechCard title="各监测点参数汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={allResults.map(r => ({
            监测点: r.name,
            Dupuit_K: r.dupuit.K, Dupuit_T: r.dupuit.T,
            Theis_K: r.theis.K, Theis_T: r.theis.T, Theis_S: r.theis.S,
            经验_K: r.empirical.K, 经验_T: r.empirical.T, 出水率: r.empirical.yieldRate,
            推荐K: r.recommendedK, 推荐T: r.recommendedT,
          }))} filename="aquifer-params" sheetName="含水层参数" formats={['xlsx', 'csv', 'json']} label="导出参数表" />
        </div>
        <FilterableTechTable
          headers={['监测点', 'Dupuit-K', 'Theis-K', 'Theis-S', '经验-K', '出水率', '推荐K', '推荐T']}
          rows={allResults.map(r => [
            r.name, String(r.dupuit.K), String(r.theis.K), String(r.theis.S),
            String(r.empirical.K), String(r.empirical.yieldRate),
            String(r.recommendedK), String(r.recommendedT),
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板3: 径流还原 ──

function RunoffPanel() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const input = PRESET_RUNOFF[selectedIdx];
  const result = useMemo(() => calcRunoffRestoration(input), [input]);

  const chartData = result.naturalRunoff.map(d => ({
    year: String(d.year),
    实测径流: d.measured,
    天然径流: d.natural,
    削减量: d.reduction,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PRESET_RUNOFF.map((r, i) => (
          <button key={i} onClick={() => setSelectedIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${selectedIdx === i ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="多年平均实测" value={result.avgMeasured} unit="亿m³" icon={Waves} accent="blue" />
        <StatCard title="多年平均天然" value={result.avgNatural} unit="亿m³" icon={Droplets} accent="emerald" />
        <StatCard title="年均削减量" value={result.avgReduction} unit="亿m³" icon={Calculator} accent="amber" />
        <StatCard title="削减率" value={result.reductionRate} unit="%" icon={BookOpen} accent="red" />
      </div>

      <LazyChartCard title="实测径流 vs 天然径流对比" height={300}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="径流对比" unit="亿m³" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="天然径流" name="天然径流" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="实测径流" name="实测径流" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar dataKey="削减量" name="削减量" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="逐年还原明细">
        <FilterableTechTable
          headers={['年份', '实测径流(亿m³)', '天然径流(亿m³)', '削减量(亿m³)']}
          rows={result.naturalRunoff.map(d => [String(d.year), String(d.measured), String(d.natural), String(d.reduction)])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="人类活动影响评价" badge={result.impactLevel}>
        <p className="text-sm text-gw-text leading-relaxed">{result.note}</p>
      </TechCard>
    </div>
  );
}

// ── 面板4: 地质年代 ──

function AgePanel() {
  const results = useMemo(() => calcAllAges(), []);

  const AGE_COLORS: Record<string, string> = {
    '现代水': '#10b981', '全新世水': '#06b6d4', '晚更新世水': '#f59e0b',
    '中更新世水': '#f97316', '古水': '#ef4444',
  };

  const chartData = results.map(r => ({
    name: r.name.length > 8 ? r.name.substring(0, 8) + '...' : r.name,
    c14校正: r.c14CorrectedAge,
    稀释模型: r.c14DilutionAge,
    地层对比: r.stratigraphicEstimate,
    推荐值: r.recommendedAge,
    color: AGE_COLORS[r.ageCategory] ?? '#64748b',
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="监测点" value={results.length} unit="个" icon={Atom} accent="blue" />
        <StatCard title="古水(>3.5万年)" value={results.filter(r => r.ageCategory === '古水').length} unit="个" icon={Atom} accent="red" />
        <StatCard title="现代水(<50年)" value={results.filter(r => r.ageCategory === '现代水').length} unit="个" icon={Droplets} accent="emerald" />
        <StatCard title="最大年龄" value={Math.max(...results.map(r => r.recommendedAge)).toLocaleString()} unit="年" icon={BookOpen} accent="amber" />
      </div>

      <LazyChartCard title="各监测点地下水年龄对比" height={300}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: '年龄(a)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="年龄估算" unit="年" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="c14校正" name="¹⁴C校正" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar dataKey="稀释模型" name="¹⁴C稀释" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="地层对比" name="地层对比" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各监测点年龄估算汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            监测点: r.name,
            C14校正年龄: r.c14CorrectedAge,
            C14稀释年龄: r.c14DilutionAge,
            地层对比年龄: r.stratigraphicEstimate,
            推荐年龄: r.recommendedAge,
            年龄分类: r.ageCategory,
            氚法判定: r.tritiumAge,
          }))} filename="groundwater-age" sheetName="地下水年龄" formats={['xlsx', 'csv', 'json']} label="导出年龄数据" />
        </div>
        <FilterableTechTable
          headers={['监测点', '¹⁴C校正(a)', '¹⁴C稀释(a)', '地层对比(a)', '推荐年龄(a)', '分类', '氚法判定']}
          rows={results.map(r => [
            r.name, String(r.c14CorrectedAge), String(r.c14DilutionAge),
            String(r.stratigraphicEstimate), String(r.recommendedAge),
            r.ageCategory, r.tritiumAge,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="年龄分类说明" icon={BookOpen}>
        <div className="space-y-2">
          {[
            { cat: '现代水', range: '<50年', color: '#10b981', desc: '当代补给水，含核爆氚，可更新性强' },
            { cat: '全新世水', range: '50~1000年', color: '#06b6d4', desc: '全新世补给，氚衰减，补给周期较长' },
            { cat: '晚更新世水', range: '1000~10000年', color: '#f59e0b', desc: '晚更新世补给，无核爆氚，更新缓慢' },
            { cat: '中更新世水', range: '10000~35000年', color: '#f97316', desc: '中更新世补给， fossil水，不可更新' },
            { cat: '古水', range: '>35000年', color: '#ef4444', desc: '地质历史时期补给，开采即消耗，需严格保护' },
          ].map(g => (
            <div key={g.cat} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: g.color }}>{g.cat}</span>
                <span className="text-[10px] font-mono text-gw-text">{g.range}</span>
              </div>
              <div className="text-[10px] text-gw-muted mt-1">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》(1980年代) | ¹⁴C测年方法(Stuiver&Polach,1977) | 氚法测年(IAEA)" version="B-28" />
    </div>
  );
}

// ── 主组件 ──

export function HistoricalParamCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'spring' | 'aquifer' | 'runoff' | 'age'>('spring');

  const panels = [
    { key: 'spring' as const, label: '泉水频率', icon: Droplets },
    { key: 'aquifer' as const, label: '参数反演', icon: Calculator },
    { key: 'runoff' as const, label: '径流还原', icon: Waves },
    { key: 'age' as const, label: '地质年代', icon: Atom },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activePanel === p.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 'spring' && <SpringFrequencyPanel />}
      {activePanel === 'aquifer' && <AquiferParamPanel />}
      {activePanel === 'runoff' && <RunoffPanel />}
      {activePanel === 'age' && <AgePanel />}
    </div>
  );
}
