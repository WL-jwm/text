import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line, AreaChart, Area } from 'recharts';
import { Sprout, MapPin, AlertTriangle, TrendingDown, Leaf, Beaker, Wheat, Layers, BookOpen } from 'lucide-react';
import { salineSoilDistribution, salineSoilTypes, salineSoilMeasures, salineSoilGenesis, salineSoilZoning, salineSoilHistory, salineWheatData, salineSoilCaseStudies, salineWaterSoilRelation } from '../data/salineSoil';
import { specificYieldInfiltration, resistivityMineralization } from '../data/hydrogeologyReference';
import { TechCard, StatCard, TechTable, ChartTooltip, DataSourceNote, CHART_COLORS } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { LazyChartCard } from '../components/LazyChartCard';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { ChartExport } from '../components/ChartExport';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'distribution', label: '盐碱地分布', icon: MapPin },
  { key: 'types', label: '分类成因', icon: Beaker },
  { key: 'treatment', label: '防治措施', icon: Leaf },
  { key: 'history', label: '治理成效', icon: TrendingDown },
  { key: 'classic', label: '经典参数', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

export function SalineSoil() {

  usePageCommons({
    pageName: 'saline-soil',
    collector: useCallback(async () => ({ distribution: salineSoilDistribution }), []),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('distribution');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [_sortDir, _setSortDir] = useState<'asc' | 'desc'>('desc');


  const _handleSort = (col: number) => {
    if ((sortCol ?? -1) === col) { _setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortCol(col); _setSortDir('desc'); }
  };

  const distBarData = useMemo(() => salineSoilDistribution
    .map(d => ({ name: d.region, saline: d.saline, alkaline: d.alkaline, total: d.totalSalineAlkali, reclamation: d.reclamationRate }))
    .sort((a, b) => b.total - a.total), []);

  const typePie = useMemo(() => salineSoilTypes.map((t, i) => ({
    name: t.type, value: parseFloat(t.area) || 50, color: CHART_COLORS[i],
  })), []);

  const historyLineData = useMemo(() => salineSoilHistory.map(h => ({
    name: h.period,
    area: parseFloat(h.totalArea.replace('~', '')) || 700,
  })), []);

  const totalArea = salineSoilDistribution.reduce((sum, d) => sum + d.totalSalineAlkali, 0);

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">盐碱土分布与防治</h1>
          <p className="text-xs text-gw-muted mt-1">盐碱地分布、分类成因、治理措施与成效</p>
        </div>
        <span className="px-2 py-1 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">调查年限型</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="盐碱地总面积" value={totalArea.toFixed(1)} unit="万亩" icon={MapPin} accent="red" />
        <StatCard title="旱碱麦面积" value={String(salineWheatData.plantingArea)} unit="万亩" icon={Wheat} accent="amber" />
        <StatCard title="治理减少" value="1093" unit="万亩" icon={TrendingDown} accent="emerald" />
        <StatCard title="涉及地市" value="11" unit="个" icon={Layers} accent="blue" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'distribution' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="各市盐碱地面积分布" className="scan-line" height={280}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={distBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-30} textAnchor="end" height={40} />
                  <YAxis stroke="#64748b" fontSize={10} label={{ value: '万亩', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip title="各市盐碱地面积分布" />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="saline" name="盐土(万亩)" fill="#f59e0b" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="alkaline" name="碱土(万亩)" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <LazyChartCard title="治理率与盐土占比对比" className="scan-line" height={280}>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={distBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-30} textAnchor="end" height={40} />
                  <YAxis stroke="#64748b" fontSize={10} label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip unit="%" title="" />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="reclamation" name="治理率(%)" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="salineRatio" name="盐土占比(%)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="各市盐碱地详细数据">
              <div className="mb-3 flex justify-end">
                <ChartExport data={salineSoilDistribution} filename="saline-soil-distribution" sheetName="盐碱地分布" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable headers={['地市', '总面积(万亩)', '盐土', '碱土', '变化趋势', '盐土占比(%)', '治理率(%)']}
              rows={salineSoilDistribution.map(d => [d.region, String(d.totalSalineAlkali), String(d.saline), String(d.alkaline), d.change, String(d.salineRatio), String(d.reclamationRate)])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>

          <TechCard title="旱碱麦推广概况" badge="特色农业">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                <div className="text-[10px] text-gw-muted">种植面积</div>
                <div className="text-lg font-mono text-gw-highlight">{salineWheatData.plantingArea}万亩</div>
              </div>
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                <div className="text-[10px] text-gw-muted">产量范围</div>
                <div className="text-lg font-mono text-gw-cyan">{salineWheatData.yieldRange}</div>
              </div>
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                <div className="text-[10px] text-gw-muted">品牌</div>
                <div className="text-sm font-semibold text-gw-text mt-1">{salineWheatData.brand}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">主要区域：</span>{salineWheatData.mainRegions}</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">主要品种：</span>{salineWheatData.mainVarieties}</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">营养特征：</span>{salineWheatData.nutritionalFeatures}</p>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="盐碱土类型面积分布" className="scan-line" height={280}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={typePie} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {typePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="盐碱土成因分析" badge="形成条件">
              <div className="space-y-2">
                {salineSoilGenesis.map((g, i) => (
                  <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gw-text">{g.factor}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${g.contribution === '极高' ? 'bg-red-500/15 text-red-400' : g.contribution === '高' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>贡献度: {g.contribution}</span>
                    </div>
                    <p className="text-[10px] text-gw-muted mt-1">{g.description}</p>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>

          <TechCard title="盐碱土分类特征">
            <FilterableTechTable headers={['类型', '面积(万亩)', 'pH范围', '分布', '程度', '地下水类型', '治理难度']}
              rows={salineSoilTypes.map(t => [t.type, t.area, t.phRange, t.distribution, t.degree, t.groundwaterType, t.treatmentDifficulty])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>

          <TechCard title="咸水-盐碱土垂向关联性" badge="水土关系">
            <TechTable headers={['深度', '平均含盐量', 'pH', '主要盐类', '地下水矿化度']}
              rows={salineWaterSoilRelation.map(r => [r.depth, r.avgSalinity, r.pH, r.mainSaltType, r.groundwaterMineralization])}
          />
          </TechCard>
        </div>
      )}

      {activeTab === 'treatment' && (
        <div className="space-y-4">
          <TechCard title="分区治理策略" badge="因地制宜">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {salineSoilZoning.map((z, i) => (
                <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${z.priority === '高' ? 'bg-red-500/15 text-red-400' : z.priority === '中' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>优先级: {z.priority}</span>
                  </div>
                  <p className="text-[10px] text-gw-muted mt-1">{z.area} | {z.cities}</p>
                  <p className="text-[10px] text-gw-muted">主要问题: {z.mainIssue}</p>
                  <p className="text-[10px] text-gw-highlight">策略: {z.strategy}</p>
                  <p className="text-[10px] text-gw-cyan">关键技术: {z.keyTech}</p>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="防治措施对比">
            <TechTable headers={['措施', '描述', '效果', '成本', '周期', '适用类型']}
              rows={salineSoilMeasures.map(m => [m.measure, m.description, m.effectiveness, m.cost, m.cycle, m.suitableTypes])}
          />
          </TechCard>

          <TechCard title="典型治理案例" badge="成效验证">
            <TechTable headers={['案例', '位置', '面积', '原始含盐', '现状含盐', '周期', '措施', '成效']}
              rows={salineSoilCaseStudies.map(c => [c.name, c.location, c.area, c.originalSalinity, c.currentSalinity, c.period, c.measures, c.result])}
          />
          </TechCard>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="1950s总面积" value="1800" unit="万亩" icon={AlertTriangle} accent="red" />
            <StatCard title="2024年面积" value="707" unit="万亩" icon={MapPin} accent="amber" />
            <StatCard title="累计减少" value="1093" unit="万亩" icon={TrendingDown} accent="emerald" />
            <StatCard title="减少比例" value="60.7" unit="%" icon={Sprout} accent="blue" />
          </div>

          <LazyChartCard title="盐碱地面积变化趋势" className="scan-line" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historyLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} label={{ value: '万亩', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} domain={[0, 2000]} />
                <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
                <Area type="monotone" dataKey="area" name="盐碱地面积(万亩)" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <TechCard title="盐碱地治理历史进程">
            <FilterableTechTable headers={['时期', '面积(万亩)', '主要措施', '阶段减少', '累计减少']}
              rows={salineSoilHistory.map(h => [h.period, h.totalArea, h.majorMeasure, h.reduction, h.cumulativeReduction])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>

          <TechCard title="治理成效综合评价" badge="战略意义">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">面积变化：</span>河北省盐碱地面积从1950年代约1800万亩减少至2024年约707万亩，累计治理1093万亩，减少比例60.7%。特别是2015年以来南水北调通水后，治理速度明显加快。</p>
                <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">产能提升：</span>沧州黄骅旱碱麦亩产从不足100kg提高到450kg，"黄骅旱碱麦"获批国家地理标志产品，形成完整的种植-加工-销售产业链。</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">生态改善：</span>滨海盐碱地植被覆盖率显著提高（曹妃甸从10%增至85%），土壤有机质含量增加0.3~0.8%，生物多样性明显恢复。</p>
                <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">战略意义：</span>盐碱地综合利用是国家粮食安全战略的重要组成部分。习近平总书记2023年考察沧州时强调"开展盐碱地综合利用，是一个战略问题"。</p>
              </div>
            </div>
          </TechCard>
        </div>
      )}

{activeTab === 'classic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="出水率-厚度关系" value={String(specificYieldInfiltration.thicknessYield.length)} unit="类" icon={BookOpen} accent="blue" />
            <StatCard title="入渗系数分区" value={String(specificYieldInfiltration.regionalParams.length)} unit="区" icon={Layers} accent="cyan" />
            <StatCard title="电性层分级" value={String(resistivityMineralization.length)} unit="级" icon={Beaker} accent="green" />
            <StatCard title="矿化度范围" value="0.3~>5" unit="g/L" icon={AlertTriangle} accent="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="出水率与含水层厚度关系" icon={BookOpen}>
              <p className="text-[10px] text-gw-muted mb-3">不同岩性在不同含水层厚度条件下的出水率参考值</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gw-border">
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">薄层(m)</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">中层(m)</th>
                    <th className="px-2 py-1.5 text-left text-gw-muted font-medium">厚层(m)</th>
                  </tr>
                </thead>
                <tbody>
                  {specificYieldInfiltration.thicknessYield.map((t, i) => (
                    <tr key={i} className="border-b border-gw-border/50">
                      <td className="px-2 py-1 text-gw-text">{t.lithology}</td>
                      <td className="px-2 py-1 font-mono text-gw-highlight">{t.t1}</td>
                      <td className="px-2 py-1 font-mono text-gw-highlight">{t.t2}</td>
                      <td className="px-2 py-1 font-mono text-gw-highlight">{t.t3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TechCard>

            <TechCard title="降水入渗系数分区参数" icon={Layers}>
              <p className="text-[10px] text-gw-muted mb-3">不同水文地质条件下的降水入渗系数参考值</p>
              <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gw-surface z-10">
                    <tr className="border-b border-gw-border">
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">分区</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">入渗系数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specificYieldInfiltration.regionalParams.map((r: any, i: number) => (
                      <tr key={i} className="border-b border-gw-border/50">
                        <td className="px-2 py-1 text-gw-text text-[10px]">{r.zone}</td>
                        <td className="px-2 py-1 text-gw-text">给水度μ={r.sy}</td>
                        <td className="px-2 py-1 font-mono text-gw-highlight">α={r.alpha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>

          <TechCard title="视电阻率与矿化度关系" icon={Beaker}>
            <p className="text-[10px] text-gw-muted mb-3">物探视电阻率用于判别土壤盐渍化程度与地下水矿化度</p>
            <div className="flex flex-wrap gap-2">
              {resistivityMineralization.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gw-border/30 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    r.waterType.includes('淡') ? 'bg-emerald-400' :
                    r.waterType.includes('微') ? 'bg-cyan-400' :
                    r.waterType.includes('半') ? 'bg-amber-400' :
                    r.waterType.includes('咸') && !r.waterType.includes('高') ? 'bg-orange-400' : 'bg-red-400'
                  }`} />
                  <span className="text-gw-text">{r.waterType}</span>
                  <span className="font-mono text-gw-highlight">{r.resistivity}Ω·m / {r.mineralization}g/L</span>
                </div>
              ))}
            </div>
          </TechCard>

          <DataSourceNote source="《河北省水文地质工程地质》| 出水率+入渗系数+物探参数" version="经典参数" />
        </div>
      )}

      <DataSourceNote source="1999基础文献 + 第三次全国土壤普查(2024) | 第十三章" version="v2.0" />
      <CrossLinkPanel currentPath="/saline-soil" />
    </div>
  );
}
