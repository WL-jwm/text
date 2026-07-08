import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import {
  FlaskConical,  AlertTriangle, BookOpen, Search,   Layers, 
} from 'lucide-react';
import {
  groundwaterBackground, cityExceedanceFactors, waterQualityStandard,
  type ZoneBackgroundData,
} from '../data/backgroundValues';
import { SectionTitle, TechCard, ChartTooltip, DataSourceNote } from '../components/UI';
import { LazyChartCard } from '../components/LazyChartCard';
import { useToast } from '../components/Toast';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
// 注册报告生成器
type TabKey = 'query' | 'compare' | 'exceed' | 'standard';
const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'query', label: '背景值查询', icon: FlaskConical },
  { key: 'compare', label: '分区对比', icon: Layers },
  { key: 'exceed', label: '超标因子', icon: AlertTriangle },
  { key: 'standard', label: '标准对照', icon: BookOpen },
];

const ZONE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];
const ZONE_LABELS: Record<string, string> = {
  '山前平原': '山前平原',
  '中部平原': '中部平原',
  '滨海平原': '滨海平原',
  '山前平原深层': '山前深层',
  '中部平原深层': '中部深层',
  '滨海平原深层': '滨海深层',
};

// 用于雷达图的关键指标
const RADAR_INDICATORS = ['TDS', '总硬度', 'Cl', 'SO4', 'Na', 'Ca', 'Mg', 'F'];

function parseRange(range: string): number {
  const parts = range.replace(/[<>]/g, '').split('~');
  const vals = parts.map(Number).filter(n => !isNaN(n));
  return vals.length > 0 ? vals[vals.length - 1] : 0;
}

export function GroundwaterBackground() {
  const {} = useToast();
  const [exportOpen, setExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('query');
  const [selectedZone, setSelectedZone] = useState('山前平原');
  const [selectedLayer, setSelectedLayer] = useState<'shallow' | 'deep'>('shallow');
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');

  // ── 当前选中的分区数据 ──
  const currentZoneData = useMemo(() => {
    const zones = selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep;
    return zones.find(z => z.zone === selectedZone);
  }, [selectedZone, selectedLayer]);

  // ── 雷达图数据 ──
  const radarData = useMemo(() => {
    const zones = selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep;
    return RADAR_INDICATORS.map(ind => {
      const point: Record<string, string | number> = { indicator: ind };
      zones.forEach(z => {
        const key = ind === '总硬度' ? 'totalHardness' : ind;
        const val = z[key as keyof ZoneBackgroundData];
        point[ZONE_LABELS[z.zone] || z.zone] = parseRange(val || '0');
      });
      return point;
    });
  }, [selectedLayer]);

  // ── 关键指标对比柱图 ──
  const indicatorCompare = useMemo(() => {
    const zones = selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep;
    const indicators = [
      { key: 'TDS', label: 'TDS(mg/L)' },
      { key: 'totalHardness', label: '总硬度(mg/L)' },
      { key: 'Cl', label: 'Cl⁻(mg/L)' },
      { key: 'SO4', label: 'SO₄²⁻(mg/L)' },
      { key: 'Na', label: 'Na⁺(mg/L)' },
      { key: 'F', label: 'F⁻(mg/L)' },
    ];
    return indicators.map(ind => {
      const point: Record<string, string | number> = { name: ind.label };
      zones.forEach(z => {
        const val = z[ind.key as keyof typeof z];
        point[z.zone] = parseRange(val || '0');
      });
      return point;
    });
  }, [selectedLayer]);

  // ── 城市过滤 ──
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cityExceedanceFactors;
    const kw = citySearch.trim().toLowerCase();
    return cityExceedanceFactors.filter(c =>
      c.city.toLowerCase().includes(kw) ||
      c.shallow.toLowerCase().includes(kw) ||
      c.deep.toLowerCase().includes(kw)
    );
  }, [citySearch]);

  // ── 报告数据 ──
  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'groundwater-background',
    collector: useCallback(async () => ({
      groundwaterBackground,
      cityExceedanceFactors,
      waterQualityStandard,
    }), []),
    autoCollect: true,
  });

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={FlaskConical}>地下水环境背景值查询</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">
            数据来源：河北省地质环境监测院 · 生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023) | 山前/中部/滨海平原分区
          </p>
        </div>
        <button onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出报告
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════ 背景值查询 ═══════════════════ */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          {/* 选择器 */}
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1 bg-gw-surface rounded-lg p-1">
              {(['shallow', 'deep'] as const).map(layer => (
                <button key={layer} onClick={() => setSelectedLayer(layer)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    selectedLayer === layer
                      ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                      : 'text-gw-muted hover:text-gw-text'
                  }`}>
                  {layer === 'shallow' ? '浅层水' : '深层水'}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gw-surface rounded-lg p-1">
              {(selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep).map(z => (
                <button key={z.zone} onClick={() => setSelectedZone(z.zone)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                    selectedZone === z.zone
                      ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                      : 'text-gw-muted hover:text-gw-text'
                  }`}>
                  {z.zone}
                </button>
              ))}
            </div>
          </div>

          {/* 当前分区详情 */}
          {currentZoneData && (
            <>
              <TechCard title={`${currentZoneData.zone} — ${selectedLayer === 'shallow' ? '浅层' : '深层'}地下水背景值`}
                badge={currentZoneData.waterType}>
                <p className="text-[10px] text-gw-muted mb-3">
                  分布范围：{currentZoneData.cities} | {currentZoneData.note}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {[
                    { label: 'pH', value: currentZoneData.pH },
                    { label: 'TDS(mg/L)', value: currentZoneData.TDS },
                    { label: '总硬度(mg/L)', value: currentZoneData.totalHardness },
                    { label: 'Cl⁻(mg/L)', value: currentZoneData.Cl },
                    { label: 'SO₄²⁻(mg/L)', value: currentZoneData.SO4 },
                    { label: 'HCO₃⁻(mg/L)', value: currentZoneData.HCO3 },
                    { label: 'Na⁺(mg/L)', value: currentZoneData.Na },
                    { label: 'Ca²⁺(mg/L)', value: currentZoneData.Ca },
                    { label: 'Mg²⁺(mg/L)', value: currentZoneData.Mg },
                    { label: 'NO₃⁻(mg/L)', value: currentZoneData.NO3 },
                    { label: 'NO₂⁻(mg/L)', value: currentZoneData.NO2 },
                    { label: 'NH₄⁺(mg/L)', value: currentZoneData.NH4 },
                    { label: 'F⁻(mg/L)', value: currentZoneData.F },
                    { label: 'Fe(mg/L)', value: currentZoneData.Fe },
                    { label: 'Mn(mg/L)', value: currentZoneData.Mn },
                    { label: 'As(mg/L)', value: currentZoneData.As || '-' },
                    { label: 'Cr⁶⁺(mg/L)', value: currentZoneData.Cr6 || '-' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/30">
                      <p className="text-[9px] text-gw-muted">{item.label}</p>
                      <p className="text-sm font-bold font-mono text-gw-text">{item.value}</p>
                    </div>
                  ))}
                </div>
              </TechCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TechCard title="其他分区同层对比">
                  <div className="space-y-2">
                    {(selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep)
                      .filter(z => z.zone !== selectedZone).map(z => (
                      <div key={z.zone} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                          <span className="text-[9px] px-1 py-0.5 rounded bg-gw-blue/10 text-gw-cyan">{z.waterType}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[9px]">
                          <div><span className="text-gw-muted">TDS</span> <span className="font-mono">{z.TDS}</span></div>
                          <div><span className="text-gw-muted">硬度</span> <span className="font-mono">{z.totalHardness}</span></div>
                          <div><span className="text-gw-muted">Cl</span> <span className="font-mono">{z.Cl}</span></div>
                          <div><span className="text-gw-muted">F</span> <span className="font-mono">{z.F}</span></div>
                        </div>
                        <p className="text-[9px] text-gw-muted mt-1">{z.note}</p>
                      </div>
                    ))}
                  </div>
                </TechCard>

                <TechCard title="水化学类型与特征">
                  <div className="space-y-3">
                    {(selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep).map((z, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-gw-border/30"
                        style={{ borderColor: `${ZONE_COLORS[i]}33` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONE_COLORS[i] }} />
                          <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                        </div>
                        <p className="text-[10px] text-gw-cyan font-mono">{z.waterType}</p>
                        <p className="text-[9px] text-gw-muted mt-0.5">{z.note}</p>
                      </div>
                    ))}
                  </div>
                </TechCard>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════ 分区对比 ═══════════════════ */}
      {activeTab === 'compare' && (
        <div className="space-y-4">
          <div className="flex gap-1 bg-gw-surface rounded-lg p-1 w-fit">
            {(['shallow', 'deep'] as const).map(layer => (
              <button key={layer} onClick={() => setSelectedLayer(layer)}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                  selectedLayer === layer
                    ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                    : 'text-gw-muted hover:text-gw-text'
                }`}>
                {layer === 'shallow' ? '浅层水' : '深层水'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="主要指标分区对比（上限值）" className="scan-line" height={350}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={indicatorCompare}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip content={<ChartTooltip unit="mg/L" title="含量" />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="山前平原" name="山前平原" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="中部平原" name="中部平原" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="滨海平原" name="滨海平原" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <LazyChartCard title="指标分布雷达图" className="scan-line" height={350}>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1a2d4d" />
                  <PolarAngleAxis dataKey="indicator" stroke="#64748b" fontSize={9} />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} stroke="#64748b" fontSize={8} />
                  <Tooltip />
                  <Radar name="山前平原" dataKey="山前平原" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="中部平原" dataKey="中部平原" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="滨海平原" dataKey="滨海平原" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="浅层 vs 深层背景值对比">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['山前平原', '中部平原', '滨海平原'].map((zone,_zi) => {
                const shallow = groundwaterBackground.shallow.find(z => z.zone === zone);
                const deep = groundwaterBackground.deep.find(z => z.zone === zone + '深层');
                return (
                  <div key={zone} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/50">
                    <p className="text-xs font-semibold text-gw-text mb-2">{zone}</p>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-gw-muted">浅层TDS</span>
                        <span className="font-mono">{shallow?.TDS}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gw-muted">深层TDS</span>
                        <span className="font-mono">{deep?.TDS}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gw-muted">浅层F</span>
                        <span className="font-mono">{shallow?.F}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gw-muted">深层F</span>
                        <span className="font-mono">{deep?.F}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gw-muted">浅层水型</span>
                        <span className="text-gw-cyan text-[9px]">{shallow?.waterType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gw-muted">深层水型</span>
                        <span className="text-gw-cyan text-[9px]">{deep?.waterType}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 超标因子 ═══════════════════ */}
      {activeTab === 'exceed' && (
        <div className="space-y-4">
          <TechCard title="各市地下水主要超标因子" badge="11市">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted" />
                <input type="text" value={citySearch} onChange={e => setCitySearch(e.target.value)}
                  placeholder="搜索城市/超标因子..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gw-surface border border-gw-border/40 text-xs text-gw-text placeholder:text-gw-muted/50 focus:outline-none focus:border-gw-blue/50" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">城市</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">浅层超标因子</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">深层超标因子</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">说明</th>
                </tr></thead>
                <tbody>
                  {filteredCities.map((c,_i) => (
                    <React.Fragment key={c.city}>
                      <tr className="border-b border-gw-border/20 data-row cursor-pointer"
                        onClick={() => setExpandedCity(expandedCity === c.city ? null : c.city)}>
                        <td className="py-1.5 px-2 font-medium text-gw-text">{c.city}</td>
                        <td className="py-1.5 px-2 text-gw-muted text-[10px]">{c.shallow}</td>
                        <td className="py-1.5 px-2 text-gw-muted text-[10px]">{c.deep}</td>
                        <td className="py-1.5 px-2 text-gw-muted text-[10px]">{c.note}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="超标因子区域特征分析">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <p className="text-xs font-semibold text-amber-400 mb-1">山前平原城市</p>
                <p className="text-[10px] text-gw-muted">
                  石家庄、保定、邢台、邯郸、唐山<br />
                  <span className="text-gw-text">主要超标：</span>总硬度、TDS、硝酸盐<br />
                  <span className="text-gw-text">成因：</span>农业面源污染、原生地质背景
                </p>
              </div>
              <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <p className="text-xs font-semibold text-orange-400 mb-1">中部平原城市</p>
                <p className="text-[10px] text-gw-muted">
                  衡水、沧州西部、廊坊南部<br />
                  <span className="text-gw-text">主要超标：</span>TDS、氯化物、氟化物<br />
                  <span className="text-gw-text">成因：</span>原生高氟高咸地质背景
                </p>
              </div>
              <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                <p className="text-xs font-semibold text-red-400 mb-1">滨海平原城市</p>
                <p className="text-[10px] text-gw-muted">
                  沧州东部、黄骅、海兴<br />
                  <span className="text-gw-text">主要超标：</span>TDS、氯化物、氟化物（深层）<br />
                  <span className="text-gw-text">成因：</span>海相沉积、海水入侵
                </p>
              </div>
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 标准对照 ═══════════════════ */}
      {activeTab === 'standard' && (
        <div className="space-y-4">
          <TechCard title="地下水质量标准限值对照" badge={waterQualityStandard.standard}>
            <p className="text-[10px] text-gw-muted mb-3">地下水质量分类标准（GB/T 14848-2017），用于背景值超标判定</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">指标</th>
                  <th className="text-gw-muted py-1.5 px-1.5">Ⅰ/Ⅱ类</th>
                  <th className="text-gw-muted py-1.5 px-1.5">Ⅲ类</th>
                  <th className="text-gw-muted py-1.5 px-1.5">Ⅳ类</th>
                  <th className="text-gw-muted py-1.5 px-1.5">Ⅴ类</th>
                  <th className="text-gw-muted py-1.5 px-1.5">单位</th>
                </tr></thead>
                <tbody>
                  {waterQualityStandard.indicators.map((ind, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{ind.name}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{ind.I_II}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{ind.III}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{ind.IV}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{ind.V}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted text-center">{ind.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="质量分类说明">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {waterQualityStandard.classes.map((cls, i) => (
                <div key={i} className={`p-2.5 rounded-lg border ${
                  i === 0 ? 'border-blue-500/30 bg-blue-500/5' :
                  i === 1 ? 'border-emerald-500/30 bg-emerald-500/5' :
                  i === 2 ? 'border-amber-500/30 bg-amber-500/5' :
                  i === 3 ? 'border-orange-500/30 bg-orange-500/5' :
                  'border-red-500/30 bg-red-500/5'
                }`}>
                  <span className={`text-xs font-bold ${
                    i === 0 ? 'text-blue-400' :
                    i === 1 ? 'text-emerald-400' :
                    i === 2 ? 'text-amber-400' :
                    i === 3 ? 'text-orange-400' :
                    'text-red-400'
                  }`}>{cls.class}</span>
                  <p className="text-[9px] text-gw-muted mt-1">{cls.description}</p>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      )}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="groundwater-background"
        reportLabel="河北省地下水环境背景值报告"
        data={getData()}
        dataLoading={dataLoading}
      />      <CrossLinkPanel currentPath="/groundwater-background" />
      <DataSourceNote source="河北省地质环境监测院 | 生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023) | 河北平原浅层地下水元素地球化学特征研究(2026) | 河北瑞三元环境科技有限公司整理" />
    </div>
  );
}
