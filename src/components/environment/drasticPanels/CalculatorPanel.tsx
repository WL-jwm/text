/**
 * B-16 地下水脆弱性评价（DRASTIC模型）Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入7参数 → DRASTIC指数/脆弱性等级/参数分解
 *  2. 分区评价 — 8预设分区对比 + 面积统计
 *  3. 污染风险 — 污染源叠加风险分析
 *  4. 参数参考 — 7参数评分表查表
 * 面板: CalculatorPanel（拆分自 DrasticVulnerabilityTab.tsx）
 */
import { usePipeline } from '../../../hooks/usePipeline';
import { type AquiferMediaType, type VadoseMediaType, type SoilMediaType, type DrasticInput, VADOSE_MEDIA_RATINGS, AQUIFER_MEDIA_RATINGS, SOIL_MEDIA_RATINGS, calcDrastic } from '../../../utils/drasticCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { PipelinePanel } from '../../PipelinePanel';
import { TechCard, StatCard } from '../../UI';
import { Calculator } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Legend, PolarGrid, BarChart, ResponsiveContainer, Tooltip, CartesianGrid, Radar, RadarChart, Bar, PolarAngleAxis, XAxis, PolarRadiusAxis, YAxis } from 'recharts';
import { TOOLTIP_STYLE, VULN_COLORS } from './drasticConstants';

export function CalculatorPanel() {
  const [name, setName] = useState('自定义评价区');
  const [depth, setDepth] = useState(8);
  const [recharge, setRecharge] = useState(180);
  const [aquiferMedia, setAquiferMedia] = useState<AquiferMediaType>('sand_gravel');
  const [soilMedia, setSoilMedia] = useState<SoilMediaType>('loam');
  const [topography, setTopography] = useState(2);
  const [vadoseMedia, setVadoseMedia] = useState<VadoseMediaType>('sand_gravel');
  const [conductivity, setConductivity] = useState(35);

  const input: DrasticInput = {
    name, depth, recharge, aquiferMedia, soilMedia, topography, vadoseMedia, conductivity,
  };

  const result = useMemo(() => calcDrastic(input), [input]);
  const { publishData } = usePipeline('drastic');

  const radarData = useMemo(() => result.parameters.map(p => ({
    param: p.name.split(' ')[0],
    评分: p.rating,
    满分: 10,
  })), [result]);

  const barData = useMemo(() => result.parameters.map(p => ({
    name: p.name.split(' ')[0],
    rating: p.rating,
    weight: p.weight,
    weighted: p.weightedScore,
  })), [result]);

  return (
    <div className="space-y-4">
      {/* 输入参数 */}
      <TechCard title="DRASTIC七参数输入" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">D 地下水埋深 (m)</label>
            <input type="number" step="0.1" value={depth} onChange={e => setDepth(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">R 净补给量 (mm/a)</label>
            <input type="number" value={recharge} onChange={e => setRecharge(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">A 含水层介质</label>
            <select value={aquiferMedia} onChange={e => setAquiferMedia(e.target.value as AquiferMediaType)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {Object.entries(AQUIFER_MEDIA_RATINGS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">S 土壤介质</label>
            <select value={soilMedia} onChange={e => setSoilMedia(e.target.value as SoilMediaType)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {Object.entries(SOIL_MEDIA_RATINGS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">T 地形坡度 (%)</label>
            <input type="number" step="0.1" value={topography} onChange={e => setTopography(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">I 非饱和带介质</label>
            <select value={vadoseMedia} onChange={e => setVadoseMedia(e.target.value as VadoseMediaType)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {Object.entries(VADOSE_MEDIA_RATINGS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">C 渗透系数 (m/d)</label>
            <input type="number" step="0.1" value={conductivity} onChange={e => setConductivity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      {/* 结果概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="DRASTIC指数" value={result.drasticIndex} accent={VULN_COLORS[result.vulnerability]} subtitle="满分230" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">脆弱性等级</span>
          <span className="text-2xl font-bold" style={{ color: VULN_COLORS[result.vulnerability] }}>
            {result.vulnerability}
          </span>
        </div>
        <StatCard title="最高评分参数" value={result.parameters.reduce((max, p) => p.rating > max.rating ? p : max).name.split(' ')[0]} accent="text-amber-400" subtitle={`评分${result.parameters.reduce((max, p) => p.rating > max.rating ? p : max).rating}`} />
        <StatCard title="最低评分参数" value={result.parameters.reduce((min, p) => p.rating < min.rating ? p : min).name.split(' ')[0]} accent="text-blue-400" subtitle={`评分${result.parameters.reduce((min, p) => p.rating < min.rating ? p : min).rating}`} />
      </div>

      {/* 雷达图 + 柱状图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="七参数评分雷达图">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="param" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="评分" dataKey="评分" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="加权评分分解">
          <ChartExport data={barData} filename={`${name}_DRASTIC分解`} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="rating" name="原始评分" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="weighted" name="加权评分" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 参数详表 */}
      <FilterableTechTable
        headers={['参数', '原始值', '评分(1~10)', '权重', '加权评分']}
        rows={result.parameters.map(p => [p.name, String(p.rawValue), p.rating, p.weight, p.weightedScore])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">DRASTIC评价标准：</strong>
          {' '}DRASTIC指数 &lt; 100 为低脆弱性，100~150 为中等，150~180 为高，&ge;180 为极高。
          {' '}DRASTIC = D&times;5 + R&times;4 + A&times;3 + S&times;2 + T&times;1 + I&times;5 + C&times;3，满分230。
          {' '}权重反映了各参数对地下水污染脆弱性的相对重要性，D（埋深）和I（非饱和带）权重最高（5）。
        </p>
      </div>

      <PipelinePanel moduleId="drastic" onPublish={() => {
        publishData('drasticResult', `DRASTIC脆弱性(指数=${result.drasticIndex})`, {
          drasticIndex: result.drasticIndex,
          level: result.vulnerability,
          parameters: result.parameters,
        }, `指数${result.drasticIndex}`);
      }} />
    </div>
  );
}
