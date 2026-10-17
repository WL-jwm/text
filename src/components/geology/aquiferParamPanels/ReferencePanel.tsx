/**
 * 面板: ReferencePanel（拆分自 AquiferParamTab.tsx）
 */
import { lookupK, getLithologyList, K_REFERENCE_DATA, lookupSpecificYield, SPECIFIC_YIELD_DATA, INFILTRATION_DATA } from '../../../utils/aquiferParamCalculator';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard } from '../../UI';
import { Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ResponsiveContainer, Tooltip, BarChart, YAxis, CartesianGrid, XAxis, Bar } from 'recharts';

export function ReferencePanel() {
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
