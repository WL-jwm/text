import React, { useState, useMemo } from 'react';
import {
  Calculator, Droplets, Activity, Zap, Database, ArrowRightLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TechCard, StatCard } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import {
  calcDarcy, calcWellParams, calcStorage,
  K_REFERENCE_DATA, SPECIFIC_YIELD_DATA, INFILTRATION_DATA,
  lookupK, lookupSpecificYield,
  fmtVal, getLithologyList, convertUnit,
} from '../../utils/aquiferParamCalculator';

// ── 样式 ──


// ── 数值输入框 ──

function NumInput({
  label, value, onChange, unit, placeholder,
}: {
  label: string; value: number; onChange: (v: number) => void;
  unit?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-gw-muted">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="any"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value) || 0)}
          placeholder={placeholder ?? '0'}
          className="w-28 bg-transparent border border-gw-border/30 rounded px-2 py-1 text-sm text-gw-text
            focus:border-gw-blue/50 focus:outline-none focus:ring-1 focus:ring-gw-blue/30"
        />
        {unit && <span className="text-[10px] text-gw-muted whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}

// ── 达西公式计算面板 ──

function DarcyPanel() {
  const [q, setQ] = useState(0);
  const [k, setK] = useState(10);
  const [i, setI] = useState(0.01);
  const [a, setA] = useState(100);

  const result = useMemo(() =>
    calcDarcy({ flowRateQ: q || undefined, hydraulicK: k || undefined, hydraulicGradientI: i || undefined, crossSectionA: a || undefined }),
    [q, k, i, a],
  );

  const fields: { key: string; label: string; value: number; unit: string; editable: boolean; onChange: (v: number) => void; highlight?: boolean }[] = [
    { key: 'Q', label: '\u6e17\u900f\u6d41\u91cf Q', value: q, unit: 'm\u00b3/d', editable: true, onChange: setQ, highlight: result?.calculatedField === 'flowRateQ' },
    { key: 'K', label: '\u6e17\u900f\u7cfb\u6570 K', value: k, unit: 'm/d', editable: true, onChange: setK, highlight: result?.calculatedField === 'hydraulicK' },
    { key: 'I', label: '\u6c34\u529b\u5761\u5ea6 I', value: i, unit: '', editable: true, onChange: setI, highlight: result?.calculatedField === 'hydraulicGradientI' },
    { key: 'A', label: '\u8fc7\u6c34\u65ad\u9762 A', value: a, unit: 'm\u00b2', editable: true, onChange: setA, highlight: result?.calculatedField === 'crossSectionA' },
  ];

  return (
    <TechCard icon={Droplets} badge={'\u8fbe\u897f\u516c\u5f0f'}>
      <p className="text-[10px] text-gw-muted mb-3">{'Q = K \u00b7 I \u00b7 A \u2014 \u586b\u51653\u4e2a\u5df2\u77e5\u503c\uff0c\u7b2c4\u4e2a\u81ea\u52a8\u8ba1\u7b97'}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {fields.map(f => (
          <div key={f.key} className={`p-2 rounded-lg border ${f.highlight ? 'border-gw-blue/40 bg-gw-blue/10' : 'border-gw-border/20 bg-gw-surface/30'}`}>
            <div className="text-[10px] text-gw-muted mb-1">{f.label}</div>
            {f.editable ? (
              <input
                type="number"
                step="any"
                value={f.value || ''}
                onChange={e => f.onChange(Number(e.target.value) || 0)}
                className={`w-full bg-transparent border-b ${f.highlight ? 'border-gw-blue/50 text-gw-highlight' : 'border-gw-border/30'} rounded-none px-0 py-0.5 text-sm font-mono
                  focus:outline-none`}
              />
            ) : (
              <div className="text-sm font-mono font-medium text-gw-highlight">{fmtVal(f.value)}</div>
            )}
            <div className="text-[9px] text-gw-muted mt-0.5">{f.unit}</div>
          </div>
        ))}
      </div>
      {!result && (
        <p className="text-[10px] text-amber-400 mt-2">{'\u8bf7\u586b\u5165\u81f3\u5c113\u4e2a\u975e\u96f6\u503c'}</p>
      )}
      {result && (
        <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-400">{'\u8ba1\u7b97\u7ed3\u679c: Q = '}{fmtVal(result.flowRateQ)}{' m\u00b3/d | K = '}{fmtVal(result.hydraulicK)}{' m/d | I = '}{fmtVal(result.hydraulicGradientI)}{' | A = '}{fmtVal(result.crossSectionA)}{' m\u00b2'}</span>
        </div>
      )}
    </TechCard>
  );
}

// ── 井参数计算面板 ──

function WellPanel() {
  const [q, setQ] = useState(1200);
  const [s, setS] = useState(5);
  const [m, setM] = useState(20);
  const [k, setK] = useState(15);

  const result = useMemo(() =>
    calcWellParams({ dischargeQ: q, drawdownS: s, aquiferThicknessM: m, hydraulicK: k }),
    [q, s, m, k],
  );

  return (
    <TechCard icon={Activity} badge={'\u4e95\u53c2\u6570\u8ba1\u7b97'}>
      <p className="text-[10px] text-gw-muted mb-3">{'T = K\u00b7M, q = Q/(s\u00b7M), R \u2248 2s\u00b7\u221a(K\u00b7M)'}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <NumInput label={'\u51fa\u6c34\u91cf Q'} value={q} onChange={setQ} unit="m\u00b3/d" />
        <NumInput label={'\u964d\u6df1 s'} value={s} onChange={setS} unit="m" />
        <NumInput label={'\u542b\u6c34\u5c42\u539a\u5ea6 M'} value={m} onChange={setM} unit="m" />
        <NumInput label={'\u6e17\u900f\u7cfb\u6570 K'} value={k} onChange={setK} unit="m/d" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title={'\u5bfc\u6c34\u7cfb\u6570 T'} value={fmtVal(result.transmissivityT)} unit="m\u00b2/d" accent="blue" subtitle="K \u00d7 M" />
        <StatCard title={'\u5355\u4f4d\u6d8c\u6c34\u91cf q'} value={fmtVal(result.specificDischarge)} unit="m\u00b3/h\u00b7m\u00b7m" accent="cyan" subtitle="Q/(24\u00b7s\u00b7M)" />
        <StatCard title={'\u5f71\u54cd\u534a\u5f84 R'} value={fmtVal(result.influenceRadiusR)} unit="m" accent="purple" subtitle="2s\u00b7\u221a(K\u00b7M)" />
        <StatCard title={'\u5bcc\u6c34\u6027\u8bc4\u4ef7'} value={result.wellEfficiency} accent="emerald" subtitle={'q = ' + fmtVal(result.specificDischarge)} />
      </div>
    </TechCard>
  );
}

// ── 储存量计算面板 ──

function StoragePanel() {
  const [mu, setMu] = useState(0.15);
  const [f, setF] = useState(1000);
  const [dh, setDh] = useState(1);

  const result = useMemo(() =>
    calcStorage({ specificYield: mu, area: f, waterLevelChange: dh }),
    [mu, f, dh],
  );

  return (
    <TechCard icon={Database} badge={'\u50a8\u5b58\u91cf\u8ba1\u7b97'}>
      <p className="text-[10px] text-gw-muted mb-3">{'V = \u03bc \u00b7 F \u00b7 \u0394h \u2014 \u7ed9\u6c34\u5ea6\u00d7\u9762\u79ef\u00d7\u6c34\u4f4d\u53d8\u5e45'}</p>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <NumInput label={'\u7ed9\u6c34\u5ea6 \u03bc'} value={mu} onChange={setMu} unit="" placeholder="0.15" />
        <NumInput label={'\u9762\u79ef F'} value={f} onChange={setF} unit="km\u00b2" placeholder="1000" />
        <NumInput label={'\u6c34\u4f4d\u53d8\u5e45 \u0394h'} value={dh} onChange={setDh} unit="m" placeholder="1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard title={'\u50a8\u5b58\u53d8\u5316\u91cf'} value={fmtVal(result.storageVolume)} unit={'\u4e07m\u00b3'} accent="blue" subtitle={'\u03bc\u00d7F\u00d7\u0394h\u00d7100'} />
        <StatCard title={'\u50a8\u5b58\u53d8\u5316\u91cf'} value={fmtVal(result.storageInYi)} unit={'\u4ebam\u00b3'} accent="cyan" />
      </div>
    </TechCard>
  );
}

// ── 单位换算面板 ──

function UnitConvertPanel() {
  const [inputVal, setInputVal] = useState(10);
  const [fromUnit, setFromUnit] = useState('m/d');
  const [toUnit, setToUnit] = useState('m/s');

  const converted = useMemo(() => convertUnit(inputVal, fromUnit, toUnit), [inputVal, fromUnit, toUnit]);

  const unitGroups = [
    { label: '\u6e17\u900f\u7cfb\u6570', units: ['m/d', 'm/s', 'cm/s'] },
    { label: '\u6d41\u91cf', units: ['m\u00b3/d', 'm\u00b3/h', 'L/s'] },
  ];

  return (
    <TechCard icon={ArrowRightLeft} badge={'\u5355\u4f4d\u6362\u7b97'}>
      <div className="flex flex-wrap items-end gap-3">
        <NumInput label={'\u8f93\u5165\u503c'} value={inputVal} onChange={setInputVal} />
        {unitGroups.map(g => (
          <div key={g.label} className="flex flex-col gap-0.5">
            <label className="text-[10px] text-gw-muted">{g.label}</label>
            <div className="flex gap-1">
              {g.units.map(u => (
                <button key={u}
                  onClick={() => { setFromUnit(u); }}
                  className={`px-2 py-1 rounded text-[10px] transition-all ${fromUnit === u ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface text-gw-muted border border-gw-border/20 hover:bg-gw-border/20'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-gw-muted">{'\u8f6c\u6362\u4e3a'}</label>
          <div className="flex gap-1">
            {unitGroups.flatMap(g => g.units).map(u => (
              <button key={u}
                onClick={() => { setToUnit(u); }}
                className={`px-2 py-1 rounded text-[10px] transition-all ${toUnit === u ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gw-surface text-gw-muted border border-gw-border/20 hover:bg-gw-border/20'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 p-2 rounded-lg bg-gw-surface/30">
        <span className="text-xs text-gw-muted">{fmtVal(inputVal)} {fromUnit} = </span>
        <span className="text-sm font-mono font-medium text-gw-highlight"> {fmtVal(converted)} {toUnit}</span>
      </div>
    </TechCard>
  );
}

// ── 经验值查询面板 ──

function ReferencePanel() {
  const [selectedLithology, setSelectedLithology] = useState<string>('\u7ec6\u7802');
  const [activeTab, setActiveTab] = useState<'K' | '\u03bc' | '\u03b1'>('K');

  const kResult = useMemo(() => selectedLithology ? lookupK(selectedLithology) : undefined, [selectedLithology]);
  const syResult = useMemo(() => selectedLithology ? lookupSpecificYield(selectedLithology) : undefined, [selectedLithology]);

  // K值柱状图数据
  const kChartData = useMemo(() =>
    K_REFERENCE_DATA.map(r => ({
      name: r.lithology,
      K_min: r.kMin,
      K_max: r.kMax,
      K_avg: (r.kMin + r.kMax) / 2,
    })),
    [],
  );

  const lithologyList = getLithologyList();

  return (
    <TechCard icon={Zap} badge={'\u7ecf\u9a8c\u503c\u67e5\u8be2'}>
      {/* Tab切换 */}
      <div className="flex gap-1 mb-3">
        {(['K', '\u03bc', '\u03b1'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 rounded text-[10px] transition-all ${activeTab === tab ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}
          >
            {tab === 'K' ? '\u6e17\u900f\u7cfb\u6570 K' : tab === '\u03bc' ? '\u7ed9\u6c34\u5ea6 \u03bc' : '\u5165\u6e17\u7cfb\u6570 \u03b1'}
          </button>
        ))}
      </div>

      {activeTab === 'K' && (
        <div>
          {/* 岩性选择 + 查询结果 */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select value={selectedLithology} onChange={e => setSelectedLithology(e.target.value)}
              className="bg-gw-surface border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:outline-none focus:border-gw-blue/50">
              {lithologyList.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {kResult && (
              <div className="flex gap-2 text-[10px]">
                <span className="text-gw-muted">{'K = '}</span>
                <span className="text-gw-highlight font-mono">{kResult.kMin} ~ {kResult.kMax} {kResult.kUnit}</span>
                <span className="text-gw-muted/60">{kResult.description}</span>
              </div>
            )}
          </div>
          {/* K值柱状图 */}
          <LazyChartCard title={'\u5404\u5ca9\u6027\u6e17\u900f\u7cfb\u6570K\u503c\u8303\u56fe(m/d, \u5bf9\u6570\u5ea7\u6807)'}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={kChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} angle={-35} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} scale="log" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  formatter={(value: number) => [value.toExponential(1), '']} />
                <Bar dataKey="K_min" fill="#3b82f6" name="K\u6700\u5c0f" radius={[2, 2, 0, 0]} />
                <Bar dataKey="K_max" fill="#06b6d4" name="K\u6700\u5927" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
          {/* K值参考表 */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-gw-border/30">
                <th className="text-left text-gw-muted py-1 px-2">{'\u5ca9\u6027'}</th>
                <th className="text-gw-muted py-1 px-2">K(m/d)</th>
                <th className="text-left text-gw-muted py-1 px-2">{'\u8bf4\u660e'}</th>
              </tr></thead>
              <tbody>
                {K_REFERENCE_DATA.map((r) => (
                  <tr key={r.lithology} className={`border-b border-gw-border/15 ${r.lithology === selectedLithology ? 'bg-gw-blue/10' : 'hover:bg-gw-surface/30'}`}>
                    <td className="py-1 px-2 text-gw-text">{r.lithology}</td>
                    <td className="py-1 px-2 font-mono text-cyan-400">{r.kMin} ~ {r.kMax}</td>
                    <td className="py-1 px-2 text-gw-muted">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === '\u03bc' && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select value={selectedLithology} onChange={e => setSelectedLithology(e.target.value)}
              className="bg-gw-surface border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:outline-none focus:border-gw-blue/50">
              {SPECIFIC_YIELD_DATA.map(r => (
                <option key={r.lithology} value={r.lithology}>{r.lithology}</option>
              ))}
            </select>
            {syResult && (
              <div className="flex gap-2 text-[10px]">
                <span className="text-gw-muted">{'\u03bc = '}</span>
                <span className="text-gw-highlight font-mono">{syResult.syMin} ~ {syResult.syMax}</span>
                <span className="text-gw-muted/60">{syResult.description}</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-gw-border/30">
                <th className="text-left text-gw-muted py-1 px-2">{'\u5ca9\u6027'}</th>
                <th className="text-gw-muted py-1 px-2">{'\u03bc (\u7ed9\u6c34\u5ea6)'}</th>
                <th className="text-left text-gw-muted py-1 px-2">{'\u8bf4\u660e'}</th>
              </tr></thead>
              <tbody>
                {SPECIFIC_YIELD_DATA.map(r => (
                  <tr key={r.lithology} className={`border-b border-gw-border/15 ${r.lithology === selectedLithology ? 'bg-gw-blue/10' : 'hover:bg-gw-surface/30'}`}>
                    <td className="py-1 px-2 text-gw-text">{r.lithology}</td>
                    <td className="py-1 px-2 font-mono text-cyan-400">{r.syMin} ~ {r.syMax}</td>
                    <td className="py-1 px-2 text-gw-muted">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === '\u03b1' && (
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-gw-border/30">
              <th className="text-left text-gw-muted py-1 px-2">{'\u5206\u533a'}</th>
              <th className="text-gw-muted py-1 px-2">{'\u03b1 (\u5165\u6e17\u7cfb\u6570)'}</th>
              <th className="text-left text-gw-muted py-1 px-2">{'\u4e3b\u8981\u5ca9\u6027'}</th>
            </tr></thead>
            <tbody>
              {INFILTRATION_DATA.map(r => (
                <tr key={r.zone} className="border-b border-gw-border/15 hover:bg-gw-surface/30">
                  <td className="py-1 px-2 text-gw-text">{r.zone}</td>
                  <td className="py-1 px-2 font-mono text-cyan-400">{r.alphaMin} ~ {r.alphaMax}</td>
                  <td className="py-1 px-2 text-gw-muted">{r.lithology}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TechCard>
  );
}

// ── 主组件 ──

export function AquiferParamTab() {
  return (
    <div className="space-y-4">
      {/* 公式说明 */}
      <TechCard icon={Calculator} badge={'\u8ba1\u7b97\u5f15\u64ce'}>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gw-muted">
          <span>{'Q = K\u00b7I\u00b7A (\u8fbe\u897f\u516c\u5f0f)'}</span>
          <span>{'T = K\u00b7M (\u5bfc\u6c34\u7cfb\u6570)'}</span>
          <span>{'q = Q/(s\u00b7M) (\u5355\u4f4d\u6d8c\u6c34\u91cf)'}</span>
          <span>{'R \u2248 2s\u00b7\u221a(KM) (\u5f71\u54cd\u534a\u5f84)'}</span>
          <span>{'V = \u03bc\u00b7F\u00b7\u0394h (\u50a8\u5b58\u91cf)'}</span>
        </div>
      </TechCard>

      {/* 达西公式 */}
      <DarcyPanel />

      {/* 井参数 + 储存量 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WellPanel />
        <StoragePanel />
      </div>

      {/* 单位换算 */}
      <UnitConvertPanel />

      {/* 经验值查询 */}
      <ReferencePanel />
    </div>
  );
}
