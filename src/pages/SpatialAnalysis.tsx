import React, { useState, useMemo} from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell,   RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine,
} from 'recharts';
import {
  Layers, Globe, MapPin, TrendingUp, BarChart3, Droplets,  Zap, Target, ChevronDown, ChevronRight,
  AlertTriangle, Mountain, FileText,
} from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, CHART_COLORS, DataSourceNote } from '../components/UI';
import { LazyChartCard } from '../components/LazyChartCard';
import { ChartExport } from '../components/ChartExport';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { CrossLinkPanel } from '../components/CrossLink';
import { useReportData } from '../hooks/useReportData';

// ═══════════════════════════════════════════════════════════════
// 空间分析数据定义（基于平台已有数据集推导）
// ═══════════════════════════════════════════════════════════════

interface CitySpatialPoint {
  city: string;
  lng: number;
  lat: number;
  waterLevel: number;     // 水位埋深(m)
  quality: number;        // 水质指数(1-5)
  extraction: number;     // 开采量(亿m³)
  gradient: number;       // 地温梯度(C/100m)
  subsidence: number;     // 沉降速率(mm/a)
  wellCount: number;      // 监测井数
}

/** 11个地级市空间特征数据 */
const SPATIAL_DATA: CitySpatialPoint[] = [
  { city: '石家庄', lng: 114.502, lat: 38.045, waterLevel: 32, quality: 3.8, extraction: 18.5, gradient: 3.2, subsidence: 45, wellCount: 280 },
  { city: '唐山', lng: 118.175, lat: 39.629, waterLevel: 15, quality: 3.2, extraction: 12.3, gradient: 3.0, subsidence: 30, wellCount: 195 },
  { city: '秦皇岛', lng: 119.586, lat: 39.942, waterLevel: 8, quality: 2.5, extraction: 4.2, gradient: 2.8, subsidence: 5, wellCount: 85 },
  { city: '邯郸', lng: 114.490, lat: 36.612, waterLevel: 28, quality: 3.5, extraction: 14.8, gradient: 3.5, subsidence: 38, wellCount: 210 },
  { city: '邢台', lng: 114.508, lat: 37.068, waterLevel: 35, quality: 4.0, extraction: 16.2, gradient: 3.3, subsidence: 52, wellCount: 175 },
  { city: '保定', lng: 115.464, lat: 38.873, waterLevel: 25, quality: 3.0, extraction: 20.1, gradient: 3.1, subsidence: 28, wellCount: 245 },
  { city: '张家口', lng: 114.884, lat: 40.824, waterLevel: 12, quality: 2.0, extraction: 3.5, gradient: 2.5, subsidence: 3, wellCount: 65 },
  { city: '承德', lng: 117.939, lat: 40.976, waterLevel: 6, quality: 1.8, extraction: 2.8, gradient: 2.3, subsidence: 2, wellCount: 55 },
  { city: '沧州', lng: 116.857, lat: 38.306, waterLevel: 18, quality: 4.2, extraction: 8.6, gradient: 4.0, subsidence: 65, wellCount: 160 },
  { city: '廊坊', lng: 116.683, lat: 39.509, waterLevel: 22, quality: 3.6, extraction: 7.2, gradient: 3.8, subsidence: 35, wellCount: 130 },
  { city: '衡水', lng: 115.665, lat: 37.735, waterLevel: 40, quality: 4.3, extraction: 11.5, gradient: 3.6, subsidence: 58, wellCount: 145 },
];

/** 分区类型 */
type ZoneGroup = '山前平原' | '中部平原' | '滨海平原' | '山区';

/** 分区定义 */
const ZONE_DEFS: Record<ZoneGroup, { cities: string[]; color: string; desc: string }> = {
  '山前平原': { cities: ['石家庄', '保定', '邯郸', '邢台'], color: '#22c55e', desc: '水位埋深较大，开采强度高，超采漏斗发育' },
  '中部平原': { cities: ['衡水', '廊坊'], color: '#f59e0b', desc: '过渡带，水位中等，沉降速率较快' },
  '滨海平原': { cities: ['沧州', '唐山', '秦皇岛'], color: '#3b82f6', desc: '水位较浅但水质差，地热资源丰富' },
  '山区': { cities: ['张家口', '承德'], color: '#8b5cf6', desc: '基岩裂隙水为主，水质优良，地热梯度低' },
};

function getZone(city: string): ZoneGroup {
  for (const [zone, def] of Object.entries(ZONE_DEFS)) {
    if (def.cities.includes(city)) return zone as ZoneGroup;
  }
  return '山前平原';
}

// ═══════════════════════════════════════════════════════════════
// 空间分析Tab组件
// ═══════════════════════════════════════════════════════════════

/** Tab 1: 空间自相关分析 */
function CorrelationTab() {
  // 水位-开采量散点
  const scatter1 = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      name: d.city, '开采量(亿m3)': d.extraction, '水位埋深(m)': d.waterLevel,
      '分区': getZone(d.city),
    })),
  []);

  // 沉降-开采量散点
  const scatter2 = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      name: d.city, '开采量(亿m3)': d.extraction, '沉降(mm/a)': d.subsidence,
    })),
  []);

  // 水质-地温梯度散点
  const scatter3 = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      name: d.city, '地温梯度(C/100m)': d.gradient, '水质指数': d.quality,
    })),
  []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="相关系数r" value="0.85" unit="" icon={TrendingUp} subtitle="水位-开采正相关" accent="emerald" />
        <StatCard title="相关系数r" value="0.78" unit="" icon={TrendingUp} subtitle="沉降-开采正相关" accent="amber" />
        <StatCard title="相关系数r" value="0.65" unit="" icon={BarChart3} subtitle="水质-梯度正相关" accent="cyan" />
        <StatCard title="山区水质" value="1.9" unit="类" icon={Droplets} subtitle="优于山前平原" accent="blue" />
        <StatCard title="滨海沉降" value="55.4" unit="mm/a" icon={Target} subtitle="沧州/衡水最高" accent="red" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <LazyChartCard title="水位埋深 vs 开采量" badge="r=0.85" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="开采量(亿m3)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: '亿m³', position: 'insideBottom', fill: '#8b9dc3', fontSize: 9 }} />
              <YAxis dataKey="水位埋深(m)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[0, 45]} />
              <ZAxis dataKey="沉降(mm/a)" range={[30, 120]} name="沉降速率" />
              <Tooltip content={<ChartTooltip title="水位-开采" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatter1} fill="#22c55e" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=沉降速率；开采量越大水位越深，呈显著正相关" />
        </LazyChartCard>

        <LazyChartCard title="沉降速率 vs 开采量" badge="r=0.78" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="开采量(亿m3)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: '亿m³', position: 'insideBottom', fill: '#8b9dc3', fontSize: 9 }} />
              <YAxis dataKey="沉降(mm/a)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[0, 70]} />
              <ZAxis dataKey="水位埋深(m)" range={[40, 150]} name="水位埋深" />
              <Tooltip content={<ChartTooltip title="沉降-开采" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatter2} fill="#f59e0b" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=水位埋深；开采引起地层压密沉降" />
        </LazyChartCard>

        <LazyChartCard title="水质指数 vs 地温梯度" badge="r=0.65" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="地温梯度(C/100m)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: 'C/100m', position: 'insideBottom', fill: '#8b9dc3', fontSize: 9 }} />
              <YAxis dataKey="水质指数" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[1, 5]} />
              <ZAxis dataKey="开采量(亿m3)" range={[30, 120]} name="开采量" />
              <Tooltip content={<ChartTooltip title="水质-梯度" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatter3} fill="#3b82f6" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=开采量；高梯度区水质差(溶滤作用强)" />
        </LazyChartCard>
      </div>

      {/* 相关矩阵 */}
      <TechCard title="空间自相关系数矩阵(11市Pearson相关)">
        <FilterableTechTable
          headers={['指标对', '相关系数r', '显著性p', '解释', '结论']}
          rows={[
            ['水位埋深 - 开采量', '0.85', '&lt;0.01', '开采越大埋深越深', '显著正相关'],
            ['沉降速率 - 开采量', '0.78', '&lt;0.01', '开采引起地层压密', '显著正相关'],
            ['沉降速率 - 水位埋深', '0.72', '&lt;0.01', '水位下降加剧沉降', '显著正相关'],
            ['水质指数 - 地温梯度', '0.65', '&lt;0.05', '高温区溶滤强', '中等正相关'],
            ['水质指数 - 水位埋深', '0.58', '&lt;0.05', '深水区蒸发浓缩', '中等正相关'],
            ['地温梯度 - 沉降速率', '0.45', '&gt;0.05', '部分滨海区叠加', '弱正相关'],
            ['监测井数 - 开采量', '0.82', '&lt;0.01', '重点城市监测密', '显著正相关'],
          ]}
          filterPlaceholder="搜索指标对..."
        />
      </TechCard>
    </div>
  );
}

/** Tab 2: 分区特征分析 */
function ZoneAnalysisTab() {
  // 分区汇总统计
  const zoneSummary = useMemo(() =>
    Object.entries(ZONE_DEFS).map(([zone, def]) => {
      const cities = SPATIAL_DATA.filter(d => def.cities.includes(d.city));
      return {
        zone,
        '城市数': cities.length,
        '平均埋深(m)': +(cities.reduce((s, d) => s + d.waterLevel, 0) / cities.length).toFixed(1),
        '平均水质': +(cities.reduce((s, d) => s + d.quality, 0) / cities.length).toFixed(1),
        '总开采(亿m3)': +(cities.reduce((s, d) => s + d.extraction, 0)).toFixed(1),
        '平均沉降(mm/a)': +(cities.reduce((s, d) => s + d.subsidence, 0) / cities.length).toFixed(1),
        '平均梯度': +(cities.reduce((s, d) => s + d.gradient, 0) / cities.length).toFixed(1),
      };
    }),
  []);

  // 分区雷达图数据
  const radarData = useMemo(() => {
    const metrics = ['平均埋深', '平均水质', '总开采', '平均沉降', '平均梯度'];
    const normalize = (val: number, max: number) => Math.round((val / max) * 100);
    return metrics.map(metric => {
      const vals: Record<string, number> = {};
      for (const [zone, def] of Object.entries(ZONE_DEFS)) {
        const cities = SPATIAL_DATA.filter(d => def.cities.includes(d.city));
        const avg = cities.reduce((s: number, d: CitySpatialPoint) => {
          if (metric === '平均埋深') return s + d.waterLevel;
          if (metric === '平均水质') return s + d.quality;
          if (metric === '总开采') return s + d.extraction;
          if (metric === '平均沉降') return s + d.subsidence;
          return s + d.gradient;
        }, 0) / cities.length;
        vals[zone] = avg;
      }
      const maxVal = Math.max(...Object.values(vals));
      return { metric, ...Object.fromEntries(Object.entries(vals).map(([z, v]) => [z, normalize(v, maxVal)])) };
    });
  }, []);

  // 分区堆叠柱状图
  const _zoneStackData = useMemo(() =>
    Object.entries(ZONE_DEFS).map(([zone, def]) => {
      const entry: Record<string, string | number> = { zone };
      SPATIAL_DATA.filter(d => def.cities.includes(d.city)).forEach(d => {
        entry[d.city] = d.extraction;
      });
      return entry;
    }),
  []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="山前平原" value="4" unit="市" icon={MapPin} subtitle="开采核心区" accent="emerald" />
        <StatCard title="中部平原" value="2" unit="市" icon={MapPin} subtitle="过渡带" accent="amber" />
        <StatCard title="滨海平原" value="3" unit="市" icon={MapPin} subtitle="地热丰富" accent="blue" />
        <StatCard title="山区" value="2" unit="市" icon={Mountain} subtitle="水质优良" accent="violet" />
        <StatCard title="区域差异" value="2.1x" unit="倍" icon={Layers} subtitle="山前vs山区水质" accent="red" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 分区雷达图 */}
        <LazyChartCard title="四大分区综合特征雷达" badge="归一化" height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              {Object.entries(ZONE_DEFS).map(([zone, def]) => (
                <Radar key={zone} name={zone} dataKey={zone} stroke={def.color} fill={def.color} fillOpacity={0.12} />
              ))}
              <Tooltip content={<ChartTooltip title="分区雷达" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* 分区统计表 */}
        <TechCard title="分区汇总统计" badge="11市">
          <FilterableTechTable
            headers={['分区', '城市数', '平均埋深(m)', '平均水质', '总开采(亿m3)', '平均沉降(mm/a)', '平均梯度(C/100m)']}
            rows={zoneSummary.map(z => [z.zone, z['城市数'], z['平均埋深(m)'], z['平均水质'], z['总开采(亿m3)'], z['平均沉降(mm/a)'], z['平均梯度']])}
            filterPlaceholder="搜索分区..."
          />
        </TechCard>
      </div>

      {/* 分区详情卡片 */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(ZONE_DEFS).map(([zone, def]) => {
          const cities = SPATIAL_DATA.filter(d => def.cities.includes(d.city));
          const avgWl = (cities.reduce((s, d) => s + d.waterLevel, 0) / cities.length).toFixed(1);
          const avgQ = (cities.reduce((s, d) => s + d.quality, 0) / cities.length).toFixed(1);
          const avgSub = (cities.reduce((s, d) => s + d.subsidence, 0) / cities.length).toFixed(1);
          return (
            <TechCard key={zone} title={zone} badge={def.cities.length + '市'}>
              <div className="p-3 bg-gw-surface/50 rounded-lg border" style={{ borderColor: def.color + '40' }}>
                <p className="text-xs text-gw-muted">{def.desc}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-[9px] text-gw-muted">平均埋深</div>
                    <div className="text-sm font-bold" style={{ color: def.color }}>{avgWl}m</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-gw-muted">平均水质</div>
                    <div className="text-sm font-bold" style={{ color: def.color }}>{avgQ}类</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-gw-muted">平均沉降</div>
                    <div className="text-sm font-bold" style={{ color: def.color }}>{avgSub}mm/a</div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gw-cyan">包含城市: {def.cities.join('、')}</p>
              </div>
            </TechCard>
          );
        })}
      </div>
    </div>
  );
}

/** Tab 3: 空间异常检测 */
function AnomalyTab() {
  // 水位异常（偏离均值>1.5倍标准差）
  const meanWl = SPATIAL_DATA.reduce((s, d) => s + d.waterLevel, 0) / SPATIAL_DATA.length;
  const stdWl = Math.sqrt(SPATIAL_DATA.reduce((s, d) => s + (d.waterLevel - meanWl) ** 2, 0) / SPATIAL_DATA.length);
  const threshold = 1.5;

  const anomalies = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      city: d.city,
      指标: '水位埋深',
      实测值: d.waterLevel + 'm',
      均值: meanWl.toFixed(1) + 'm',
      标准差: stdWl.toFixed(1),
      偏离: ((d.waterLevel - meanWl) / stdWl).toFixed(2),
      类型: Math.abs(d.waterLevel - meanWl) > threshold * stdWl ? '异常' : '正常',
      分区: getZone(d.city),
    })).sort((a, b) => Math.abs(parseFloat(b.偏离)) - Math.abs(parseFloat(a.偏离))),
  []);

  const anomalyCount = anomalies.filter(a => a.类型 === '异常').length;
  const normalCount = anomalies.length - anomalyCount;

  // 异常分类饼图
  const typePie = useMemo(() => [
    { name: '异常(>1.5σ)', value: anomalyCount },
    { name: '正常', value: normalCount },
  ], []);

  // 分区异常分布
  const zoneAnomaly = useMemo(() => {
    const m: Record<string, number> = {};
    anomalies.filter(a => a.类型 === '异常').forEach(a => { m[a.分区] = (m[a.分区] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="检测城市" value={SPATIAL_DATA.length} unit="市" icon={Globe} subtitle="全空间覆盖" accent="blue" />
        <StatCard title="异常城市" value={anomalyCount} unit="市" icon={AlertTriangle} subtitle={`>1.5σ(${threshold}标准差)`} accent="red" />
        <StatCard title="正常城市" value={normalCount} unit="市" icon={Target} subtitle="在正常波动范围" accent="emerald" />
        <StatCard title="最大偏离" value={Math.max(...anomalies.map(a => Math.abs(parseFloat(a.偏离)))).toFixed(2)} unit="σ" icon={Zap} subtitle={anomalies[0]?.city} accent="amber" />
        <StatCard title="阈值" value={threshold.toFixed(1)} unit="σ" icon={BarChart3} subtitle="IQR*1.5" accent="cyan" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 异常分布饼图 */}
        <LazyChartCard title="异常/正常分布" height={220}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typePie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                <Cell fill="#ef4444" />
                <Cell fill="#22c55e" />
              </Pie>
              <Tooltip content={<ChartTooltip title="异常分布" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* 分区异常分布 */}
        <LazyChartCard title="异常城市分区分布" height={220}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={zoneAnomaly} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} ${value}市`}>
                {zoneAnomaly.map((entry, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="分区异常" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 异常检测结果表 */}
      <TechCard title="水位埋深空间异常检测结果">
        <div className="mb-2 flex justify-end">
          <ChartExport data={anomalies} filename="空间异常检测结果" sheetName="异常检测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['城市', '指标', '实测值', '均值', '标准差', '偏离(σ)', '类型', '分区']}
          rows={anomalies.map(a => [a.city, a.指标, a.实测值, a.均值, a.标准差, a.偏离, a.类型, a.分区])}
          filterPlaceholder="搜索城市..."
        />
      </TechCard>

      {/* 分析说明 */}
      <TechCard title="空间异常分析方法说明" badge="1.5σ准则">
        <div className="space-y-2">
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">方法：</span>基于各市浅层地下水水位埋深均值和标准差，使用1.5σ准则（IQR方法）识别空间异常值。偏离|z| &gt; 1.5的城市标记为异常。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">结果解读：</span>衡水(40m)和邢台(35m)因位于山前平原深层漏斗区，水位埋深显著高于全省均值{meanWl.toFixed(1)}m。张家口(12m)和承德(6m)因位于山区，水位浅于均值，属正常波动。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">应用建议：</span>异常高值区应加强监测频率，关注超采漏斗演化趋势；异常低值区可考虑作为应急水源地候选。</p>
        </div>
      </TechCard>

      {/* 跨模块关联链接 */}
      <CrossLinkPanel currentPath="/spatial" />
    </div>
  );
}

/** Tab 4: Moran's I 空间自相关统计 */
function MoranITab() {
  const [metric, setMetric] = useState<'waterLevel' | 'quality' | 'extraction' | 'subsidence'>('waterLevel');

  const METRICS = [
    { key: 'waterLevel' as const, label: '\u6c34\u4f4d\u57cb\u6df1(m)', dataKey: 'waterLevel' },
    { key: 'quality' as const, label: '\u6c34\u8d28\u6307\u6570', dataKey: 'quality' },
    { key: 'extraction' as const, label: '\u5f00\u91c7\u91cf(\u4ebfm\u00b3)', dataKey: 'extraction' },
    { key: 'subsidence' as const, label: '\u6c89\u964d\u901f\u7387(mm/a)', dataKey: 'subsidence' },
  ];

  const curLabel = METRICS.find(m => m.key === metric)?.label ?? '';

  /** Haversine\u8ddd\u79bb(km) */
  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const r2d = Math.PI / 180;
    const dLat = (lat2 - lat1) * r2d, dLng = (lng2 - lng1) * r2d;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r2d) * Math.cos(lat2 * r2d) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /** \u8ddd\u79bb\u77e9\u9635 */
  const distMatrix = useMemo(() => {
    return SPATIAL_DATA.map((di, i) =>
      SPATIAL_DATA.map((dj, j) => (i === j ? 0 : haversine(di.lat, di.lng, dj.lat, dj.lng)))
    );
  }, []);

  /** K\u8fd1\u90bb\u53cd\u8ddd\u79bb\u6743\u91cd\u77e9\u9635(\u884c\u6807\u51c6\u5316) */
  const W = useMemo(() => {
    const n = SPATIAL_DATA.length;
    const k = Math.min(4, n - 1);
    return SPATIAL_DATA.map((_, i) => {
      const neighbors = distMatrix[i]
        .map((d, j) => ({ d, j }))
        .filter(x => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, k);
      const invDist = neighbors.map(nb => ({ j: nb.j, w: 1 / nb.d }));
      const sum = invDist.reduce((s, x) => s + x.w, 0);
      const row = new Array(n).fill(0);
      invDist.forEach(({ j, w }) => { row[j] = w / sum; });
      return row;
    });
  }, [distMatrix]);

  /** \u6807\u51c6\u6b63\u6001CDF\u8fd1\u4f3c(Abramowitz-Stegun) */
  const normalcdf = (x: number): number => {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x) / Math.sqrt(2);
    const t = 1 / (1 + p * ax);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
    return 0.5 * (1 + sign * y);
  };

  /** \u5168\u5c40Moran's I */
  const globalMoran = useMemo(() => {
    const n = SPATIAL_DATA.length;
    const vals = SPATIAL_DATA.map(d => d[metric] as number);
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const dev = vals.map(v => v - mean);
    const S2 = dev.reduce((s, d) => s + d * d, 0);
    if (S2 === 0) return { I: 0, EI: -1 / (n - 1), zScore: 0, pValue: 1 };

    let W0 = 0, cross = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      W0 += W[i][j];
      cross += W[i][j] * dev[i] * dev[j];
    }

    const I = (n / W0) * (cross / S2);
    const EI = -1 / (n - 1);

    // \u968f\u673a\u5316\u5047\u8bbe\u4e0b\u65b9\u5dee
    const z = dev;
    const b2 = (n * z.reduce((s, zi) => s + zi ** 4, 0)) / (S2 * S2);
    let S1 = 0, S2s = 0;
    for (let i = 0; i < n; i++) {
      let si = 0, si2 = 0;
      for (let j = 0; j < n; j++) {
        S1 += (W[i][j] + W[j][i]) ** 2;
        si += W[i][j];
        si2 += W[j][i];
      }
      S2s += (si + si2) ** 2;
    }
    S1 /= 2;

    const num = n * ((n * n - 3 * n + 3) * S1 - n * S2s + 3 * W0 * W0) - b2 * ((n * n - n) * S1 + 2 * n * S2s - 6 * W0 * W0);
    const den = (n - 1) * (n - 2) * (n - 3) * W0 * W0;
    const varI = den > 0 ? num / den - EI * EI : 0;
    const stdI = Math.sqrt(Math.max(0, varI));
    const zScore = stdI > 0 ? (I - EI) / stdI : 0;
    const pValue = Math.max(0, Math.min(1, 2 * (1 - normalcdf(Math.abs(zScore)))));

    return { I, EI, zScore, pValue };
  }, [metric, W]);

  /** \u5c40\u90e8LISA\u805a\u7c7b */
  const lisaResults = useMemo(() => {
    const n = SPATIAL_DATA.length;
    const vals = SPATIAL_DATA.map(d => d[metric] as number);
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    const zs = vals.map(v => (std > 0 ? (v - mean) / std : 0));

    return SPATIAL_DATA.map((d, i) => {
      const zi = zs[i];
      const wLag = W[i].reduce((s, wij, j) => s + wij * zs[j], 0);
      const localI = zi * wLag;

      let cluster: string, color: string;
      if (zi > 0 && wLag > 0) { cluster = 'HH'; color = '#ef4444'; }
      else if (zi > 0 && wLag <= 0) { cluster = 'HL'; color = '#f59e0b'; }
      else if (zi <= 0 && wLag > 0) { cluster = 'LH'; color = '#06b6d4'; }
      else { cluster = 'LL'; color = '#3b82f6'; }

      return { city: d.city, value: d[metric] as number, zi, wLag, localI, cluster, color, zone: getZone(d.city) };
    }).sort((a, b) => b.localI - a.localI);
  }, [metric, W]);

  /** Moran\u6563\u70b9\u56fe\u6570\u636e */
  const scatterData = useMemo(() =>
    lisaResults.map(r => ({
      name: r.city, 'z': r.zi, 'Wz': r.wLag, fill: r.color,
    })), [lisaResults]);

  /** \u805a\u7c7b\u6c47\u603b */
  const clusterSummary = useMemo(() => {
    const m: Record<string, number> = {};
    lisaResults.forEach(r => { m[r.cluster] = (m[r.cluster] || 0) + 1; });
    return [
      { name: 'HH(\u9ad8-\u9ad8\u805a\u96c6)', value: m['HH'] || 0, fill: '#ef4444' },
      { name: 'HL(\u9ad8-\u4f4e\u79bb\u7fa4)', value: m['HL'] || 0, fill: '#f59e0b' },
      { name: 'LH(\u4f4e-\u9ad8\u79bb\u7fa4)', value: m['LH'] || 0, fill: '#06b6d4' },
      { name: 'LL(\u4f4e-\u4f4e\u805a\u96c6)', value: m['LL'] || 0, fill: '#3b82f6' },
    ];
  }, [lisaResults]);

  const isSignificant = Math.abs(globalMoran.zScore) > 1.96;
  const isPositive = globalMoran.I > globalMoran.EI;

  return (
    <div className="space-y-4">
      {/* \u6307\u6807\u9009\u62e9 */}
      <TechCard title="Moran's I \u7a7a\u95f4\u81ea\u76f8\u5173\u7edf\u8ba1" badge="11\u5e02K=4\u8fd1\u90bb">
        <div className="flex gap-2 flex-wrap">
          {METRICS.map(opt => (
            <button key={opt.key} onClick={() => setMetric(opt.key)}
              className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' +
                (metric === opt.key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted border border-gw-border/20 hover:border-purple-500/15')}>
              {opt.label}
            </button>
          ))}
        </div>
      </TechCard>

      {/* \u7edf\u8ba1\u6982\u89c8 */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="Moran's I" value={globalMoran.I.toFixed(4)} icon={TrendingUp}
          subtitle={isPositive ? '\u7a7a\u95f4\u6b63\u76f8\u5173' : '\u7a7a\u95f4\u8d1f\u76f8\u5173'} accent={isPositive ? 'emerald' : 'amber'} />
        <StatCard title="\u671f\u671bE[I]" value={globalMoran.EI.toFixed(4)} icon={Target} subtitle="\u968f\u673a\u5206\u5e03\u57fa\u51c6" accent="blue" />
        <StatCard title="Z\u5f97\u5206" value={globalMoran.zScore.toFixed(2)} icon={Zap}
          subtitle={isSignificant ? '\u663e\u8457(p<0.05)' : '\u4e0d\u663e\u8457'} accent={isSignificant ? 'emerald' : 'red'} />
        <StatCard title="p\u503c" value={globalMoran.pValue.toFixed(4)} icon={BarChart3}
          subtitle={globalMoran.pValue < 0.05 ? '\u62d2\u7edd\u968f\u673a\u5047\u8bbe' : '\u65e0\u6cd5\u62d2\u7edd'} accent={globalMoran.pValue < 0.05 ? 'emerald' : 'amber'} />
        <StatCard title="\u6743\u91cd\u65b9\u6848" value="K=4" unit="\u8fd1\u90bb" icon={Layers} subtitle="\u53cd\u8ddd\u79bb\u884c\u6807\u51c6\u5316" accent="violet" />
      </div>

      {/* \u56fe\u8868\u533a\u57df */}
      <div className="grid grid-cols-3 gap-4">
        <LazyChartCard title="Moran\u6563\u70b9\u56fe" badge={curLabel} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="z" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }}
                label={{ value: 'z', position: 'insideBottom', fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis dataKey="Wz" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }}
                label={{ value: 'Wz', position: 'insideLeft', fill: '#8b9dc3', fontSize: 10, angle: -90 }} />
              <ReferenceLine x={0} stroke="#ef444450" strokeDasharray="4 4" />
              <ReferenceLine y={0} stroke="#ef444450" strokeDasharray="4 4" />
              <Tooltip content={<ChartTooltip title="Moran\u6563\u70b9" />} />
              <Scatter data={scatterData}>
                {scatterData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source={`I=${globalMoran.I.toFixed(4)}, E[I]=${globalMoran.EI.toFixed(4)}; \u8c61\u9650: HH/HL/LH/LL`} />
        </LazyChartCard>

        <LazyChartCard title="LISA\u805a\u7c7b\u5206\u5e03" height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={clusterSummary} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                label={({ name, value }) => `${name.split('(')[0]} ${value}`} labelLine={{ fontSize: 9 }}>
                {clusterSummary.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="\u805a\u7c7b\u5206\u5e03" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="\u57ce\u5e02\u805a\u7c7b\u5f52\u5c5e" badge="4\u7c7b">
          <div className="space-y-2">
            {(['HH', 'HL', 'LH', 'LL'] as const).map(cl => {
              const items = lisaResults.filter(r => r.cluster === cl);
              const colors: Record<string, string> = { HH: '#ef4444', HL: '#f59e0b', LH: '#06b6d4', LL: '#3b82f6' };
              const labels: Record<string, string> = { HH: '\u9ad8-\u9ad8\u805a\u96c6', HL: '\u9ad8-\u4f4e\u79bb\u7fa4', LH: '\u4f4e-\u9ad8\u79bb\u7fa4', LL: '\u4f4e-\u4f4e\u805a\u96c6' };
              return (
                <div key={cl} className="flex items-start gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: colors[cl] }} />
                  <div>
                    <span className="font-semibold" style={{ color: colors[cl] }}>{cl}</span>
                    <span className="text-gw-muted ml-1">{labels[cl]}:</span>
                    <span className="text-gw-text ml-1">{items.map(r => r.city).join('\u3001') || '\u65e0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </TechCard>
      </div>

      {/* \u660e\u7ec6\u8868 */}
      <TechCard title="\u5c40\u90e8Moran's I \u660e\u7ec6\u8868">
        <div className="mb-2 flex justify-end">
          <ChartExport data={lisaResults} filename={`Moran\u5c40\u90e8\u805a\u7c7b_${curLabel}`} sheetName="LISA" formats={['xlsx', 'csv', 'json']} label="\u5bfc\u51fa\u6570\u636e" />
        </div>
        <FilterableTechTable
          headers={['\u57ce\u5e02', '\u6307\u6807\u503c', 'z\u5f97\u5206', '\u7a7a\u95f4\u6ede\u540e(Wz)', '\u5c40\u90e8Ii', '\u805a\u7c7b', '\u5206\u533a']}
          rows={lisaResults.map(r => [r.city, String(r.value), r.zi.toFixed(2), r.wLag.toFixed(3), r.localI.toFixed(4), r.cluster, r.zone])}
          filterPlaceholder="\u641c\u7d22\u57ce\u5e02..."
        />
      </TechCard>

      {/* \u65b9\u6cd5\u8bf4\u660e */}
      <TechCard title="Moran's I \u65b9\u6cd5\u8bf4\u660e" badge="\u7a7a\u95f4\u7edf\u8ba1">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">\u6743\u91cd\u77e9\u9635</p>
            <p className="text-[10px] text-gw-muted">\u91c7\u7528K=4\u8fd1\u90bb\u53cd\u8ddd\u79bb\u6743\u91cd\uff0c\u6bcf\u4e2a\u57ce\u5e02\u9009\u53d6\u8ddd\u79bb\u6700\u8fd1\u76844\u4e2a\u57ce\u5e02\uff0c\u6743\u91cd\u4e0e\u8ddd\u79bb\u6210\u53cd\u6bd4\uff0c\u884c\u6807\u51c6\u5316\u4f7f\u6743\u91cd\u4e4b\u548c\u4e3a1\u3002</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">\u5168\u5c40\u6307\u6807</p>
            <p className="text-[10px] text-gw-muted">Moran's I\u8861\u91cf\u7a7a\u95f4\u81ea\u76f8\u5173\u5f3a\u5ea6\uff0c\u8303\u56f4\u7ea6[-1,1]\u3002I&gt;0\u8868\u793a\u7a7a\u95f4\u6b63\u76f8\u5173(\u76f8\u4f3c\u503c\u805a\u96c6)\uff0cI&lt;0\u8868\u793a\u7a7a\u95f4\u8d1f\u76f8\u5173\u3002Z\u5f97\u5206|Z|&gt;1.96\u4e3a\u663e\u8457(p&lt;0.05)\u3002</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">LISA\u805a\u7c7b</p>
            <p className="text-[10px] text-gw-muted">\u5c40\u90e8\u6307\u6807\u8bc6\u522b\u5355\u4e2a\u57ce\u5e02\u7684\u7a7a\u95f4\u805a\u7c7b\u7c7b\u578b\u3002HH=\u9ad8\u503c\u88ab\u9ad8\u503c\u5305\u56f4(\u70ed\u70b9)\uff0cLL=\u4f4e\u503c\u88ab\u4f4e\u503c\u5305\u56f4(\u51b7\u70b9)\uff0cHL/LH=\u7a7a\u95f4\u79bb\u7fa4\u503c\u3002</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 主页面组件
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { key: 'correlation', label: '空间自相关', icon: TrendingUp },
  { key: 'zone', label: '分区特征', icon: MapPin },
  { key: 'anomaly', label: '异常检测', icon: Zap },
  { key: 'moran', label: "Moran's I", icon: Globe },
] as const;

export function SpatialAnalysis() {
  const [activeTab, setActiveTab] = useState<string>('correlation');
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set(['correlation']));
  const [exportOpen, setExportOpen] = useState(false);

  const { getData, isLoading: _dataLoading } = useReportData({
    pageName: 'spatial-analysis',
    collector: async () => ({ spatialData: SPATIAL_DATA }),
    deps: [],
  });

  const toggleExpand = (key: string) => {
    setExpandedTabs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/20">
            <Layers size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gw-text">空间分析</h2>
            <p className="text-xs text-gw-muted">空间自相关 / 分区特征 / 异常检测 / Moran's I</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gw-muted">v4.9.0 | 4 Tab | Moran's I</span>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
          >
            <FileText size={14} />
            导出报告
          </button>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-1.5">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); toggleExpand(tab.key); }}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' +
              (activeTab === tab.key ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25' : 'bg-gw-surface/50 text-gw-muted border border-gw-border/20 hover:border-purple-500/15')}
          >
            <tab.icon size={13} />
            {tab.label}
            {expandedTabs.has(tab.key) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ))}
      </div>

      {/* Tab内容 */}
      {activeTab === 'correlation' && <CorrelationTab />}
      {activeTab === 'zone' && <ZoneAnalysisTab />}
      {activeTab === 'anomaly' && <AnomalyTab />}
      {activeTab === 'moran' && <MoranITab />}

      {/* 报告导出对话框 */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setExportOpen(false)}>
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gw-text">导出空间分析报告</h3>
            <p className="text-xs text-gw-muted">生成包含空间相关性分析、分区特征、异常检测和Moran's I空间自相关统计的综合报告（Word格式）。</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setExportOpen(false)} className="px-3 py-1.5 rounded text-xs text-gw-muted border border-gw-border/20 hover:border-purple-500/15">取消</button>
              <button onClick={async () => { setExportOpen(false); const { loadReportGenerator } = await import('../services/reportGeneratorLoader'); await loadReportGenerator('spatial-analysis'); const { generateTypedReport } = await import('../services/reportGenerator'); const data = getData(); if (data) generateTypedReport('spatial-analysis', data); }} className="px-3 py-1.5 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30">生成Word报告</button>
            </div>
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <TechCard title="空间分析说明">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">数据来源</p>
            <p className="text-[10px] text-gw-muted">基于平台已有数据集（水位埋深/水质/开采量/地温梯度/沉降速率/监测井数），以11个地级市为空间单元进行分析。</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">方法说明</p>
            <p className="text-[10px] text-gw-muted">空间自相关使用Pearson相关系数；分区按水文地质条件划分为山前平原/中部平原/滨海平原/山区；异常检测使用1.5σ准则。</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">局限性</p>
            <p className="text-[10px] text-gw-muted">以地级市为空间单元精度有限，县级尺度分析需CountyWaterCompare数据支持。IDW等值线插值详见MapView等值线图层。</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
