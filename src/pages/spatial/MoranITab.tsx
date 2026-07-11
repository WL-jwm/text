import React, { useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine, Cell,
  PieChart, Pie,
} from 'recharts';
import {
  Layers, TrendingUp, BarChart3, Zap, Target,
} from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartExport } from '../../components/ChartExport';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { SPATIAL_DATA, getZone } from './spatialData';

/** Tab 4: Moran's I 空间自相关统计 */
export function MoranITab() {
  const [metric, setMetric] = useState<'waterLevel' | 'quality' | 'extraction' | 'subsidence'>('waterLevel');

  const METRICS = [
    { key: 'waterLevel' as const, label: '水位埋深(m)', dataKey: 'waterLevel' },
    { key: 'quality' as const, label: '水质指数', dataKey: 'quality' },
    { key: 'extraction' as const, label: '开采量(亿m³)', dataKey: 'extraction' },
    { key: 'subsidence' as const, label: '沉降速率(mm/a)', dataKey: 'subsidence' },
  ];

  const curLabel = METRICS.find(m => m.key === metric)?.label ?? '';

  /** Haversine距离(km) */
  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const r2d = Math.PI / 180;
    const dLat = (lat2 - lat1) * r2d, dLng = (lng2 - lng1) * r2d;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r2d) * Math.cos(lat2 * r2d) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /** 距离矩阵 */
  const distMatrix = useMemo(() => {
    return SPATIAL_DATA.map((di, i) =>
      SPATIAL_DATA.map((dj, j) => (i === j ? 0 : haversine(di.lat, di.lng, dj.lat, dj.lng)))
    );
  }, []);

  /** K近邻反距离权重矩阵(行标准化) */
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

  /** 标准正态CDF近似(Abramowitz-Stegun) */
  const normalcdf = (x: number): number => {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x) / Math.sqrt(2);
    const t = 1 / (1 + p * ax);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
    return 0.5 * (1 + sign * y);
  };

  /** 全局Moran's I */
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

    // 随机化假设下方差
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

  /** 局部LISA聚类 */
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

  /** Moran散点图数据 */
  const scatterData = useMemo(() =>
    lisaResults.map(r => ({
      name: r.city, 'z': r.zi, 'Wz': r.wLag, fill: r.color,
    })), [lisaResults]);

  /** 聚类汇总 */
  const clusterSummary = useMemo(() => {
    const m: Record<string, number> = {};
    lisaResults.forEach(r => { m[r.cluster] = (m[r.cluster] || 0) + 1; });
    return [
      { name: 'HH(高-高聚集)', value: m['HH'] || 0, fill: '#ef4444' },
      { name: 'HL(高-低离群)', value: m['HL'] || 0, fill: '#f59e0b' },
      { name: 'LH(低-高离群)', value: m['LH'] || 0, fill: '#06b6d4' },
      { name: 'LL(低-低聚集)', value: m['LL'] || 0, fill: '#3b82f6' },
    ];
  }, [lisaResults]);

  const isSignificant = Math.abs(globalMoran.zScore) > 1.96;
  const isPositive = globalMoran.I > globalMoran.EI;

  return (
    <div className="space-y-4">
      {/* 指标选择 */}
      <TechCard title="Moran's I 空间自相关统计" badge="11市K=4近邻">
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

      {/* 统计概览 */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="Moran's I" value={globalMoran.I.toFixed(4)} icon={TrendingUp}
          subtitle={isPositive ? '空间正相关' : '空间负相关'} accent={isPositive ? 'emerald' : 'amber'} />
        <StatCard title="期望E[I]" value={globalMoran.EI.toFixed(4)} icon={Target} subtitle="随机分布基准" accent="blue" />
        <StatCard title="Z得分" value={globalMoran.zScore.toFixed(2)} icon={Zap}
          subtitle={isSignificant ? '显著(p<0.05)' : '不显著'} accent={isSignificant ? 'emerald' : 'red'} />
        <StatCard title="p值" value={globalMoran.pValue.toFixed(4)} icon={BarChart3}
          subtitle={globalMoran.pValue < 0.05 ? '拒绝随机假设' : '无法拒绝'} accent={globalMoran.pValue < 0.05 ? 'emerald' : 'amber'} />
        <StatCard title="权重方案" value="K=4" unit="近邻" icon={Layers} subtitle="反距离行标准化" accent="violet" />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-3 gap-4">
        <LazyChartCard title="Moran散点图" badge={curLabel} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="z" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }}
                label={{ value: 'z', position: 'insideBottom', fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis dataKey="Wz" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }}
                label={{ value: 'Wz', position: 'insideLeft', fill: '#8b9dc3', fontSize: 10, angle: -90 }} />
              <ReferenceLine x={0} stroke="#ef444450" strokeDasharray="4 4" />
              <ReferenceLine y={0} stroke="#ef444450" strokeDasharray="4 4" />
              <Tooltip content={<ChartTooltip title="Moran散点" />} />
              <Scatter data={scatterData}>
                {scatterData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source={`I=${globalMoran.I.toFixed(4)}, E[I]=${globalMoran.EI.toFixed(4)}; 象限: HH/HL/LH/LL`} />
        </LazyChartCard>

        <LazyChartCard title="LISA聚类分布" height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={clusterSummary} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                label={({ name, value }) => `${name.split('(')[0]} ${value}`} labelLine={{ fontSize: 9 }}>
                {clusterSummary.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="聚类分布" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="城市聚类归属" badge="4类">
          <div className="space-y-2">
            {(['HH', 'HL', 'LH', 'LL'] as const).map(cl => {
              const items = lisaResults.filter(r => r.cluster === cl);
              const colors: Record<string, string> = { HH: '#ef4444', HL: '#f59e0b', LH: '#06b6d4', LL: '#3b82f6' };
              const labels: Record<string, string> = { HH: '高-高聚集', HL: '高-低离群', LH: '低-高离群', LL: '低-低聚集' };
              return (
                <div key={cl} className="flex items-start gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: colors[cl] }} />
                  <div>
                    <span className="font-semibold" style={{ color: colors[cl] }}>{cl}</span>
                    <span className="text-gw-muted ml-1">{labels[cl]}:</span>
                    <span className="text-gw-text ml-1">{items.map(r => r.city).join('、') || '无'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </TechCard>
      </div>

      {/* 明细表 */}
      <TechCard title="局部Moran's I 明细表">
        <div className="mb-2 flex justify-end">
          <ChartExport data={lisaResults} filename={`Moran局部聚类_${curLabel}`} sheetName="LISA" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['城市', '指标值', 'z得分', '空间滞后(Wz)', '局部Ii', '聚类', '分区']}
          rows={lisaResults.map(r => [r.city, String(r.value), r.zi.toFixed(2), r.wLag.toFixed(3), r.localI.toFixed(4), r.cluster, r.zone])}
          filterPlaceholder="搜索城市..."
        />
      </TechCard>

      {/* 方法说明 */}
      <TechCard title="Moran's I 方法说明" badge="空间统计">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">权重矩阵</p>
            <p className="text-[10px] text-gw-muted">采用K=4近邻反距离权重，每个城市选取距离最近的4个城市，权重与距离成反比，行标准化使权重之和为1。</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">全局指标</p>
            <p className="text-[10px] text-gw-muted">Moran's I衡量空间自相关强度，范围约[-1,1]。I&gt;0表示空间正相关(相似值聚集)，I&lt;0表示空间负相关。Z得分|Z|&gt;1.96为显著(p&lt;0.05)。</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/8 border border-purple-500/12">
            <p className="text-xs font-semibold text-purple-400 mb-1">LISA聚类</p>
            <p className="text-[10px] text-gw-muted">局部指标识别单个城市的空间聚类类型。HH=高值被高值包围(热点)，LL=低值被低值包围(冷点)，HL/LH=空间离群值。</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
