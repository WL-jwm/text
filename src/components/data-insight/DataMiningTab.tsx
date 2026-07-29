/**
 * B-30 地下水数据挖掘评价器 Tab
 *
 * 4大面板：
 *  1. K-Means聚类 — 监测井水质自动分组+簇特征
 *  2. PCA主成分分析 — 降维+贡献率+载荷热力图
 *  3. 关联规则 — 频繁项集+置信度+提升度
 *  4. 异常检测 — Mahalanobis距离+异常指标
 */
import React, { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import { Database, Calculator, BookOpen, AlertTriangle } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_DATASETS,
  calcKMeans, calcPCA, calcAssociationRules, calcAnomalies,
} from '../../utils/dataMiningCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const CLUSTER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const ANOMALY_COLORS: Record<string, string> = {
  normal: '#10b981',
  mild: '#f59e0b',
  moderate: '#f97316',
  severe: '#ef4444',
};

export function DataMiningTab() {
  const [selectedDataset, setSelectedDataset] = useState(0);
  const [kValue, setKValue] = useState(3);
  const [pcaComponents, setPcaComponents] = useState(4);
  const [minSupport, setMinSupport] = useState(0.1);
  const [minConfidence, setMinConfidence] = useState(0.5);

  const dataset = PRESET_DATASETS[selectedDataset];
  const samples = dataset.samples;

  const kmeansResult = useMemo(() => calcKMeans(samples, kValue), [samples, kValue]);
  const pcaResult = useMemo(() => calcPCA(samples, pcaComponents), [samples, pcaComponents]);
  const rules = useMemo(() => calcAssociationRules(samples, minSupport, minConfidence), [samples, minSupport, minConfidence]);
  const anomalies = useMemo(() => calcAnomalies(samples), [samples]);

  // K-Means 散点图数据 (用PC1和PC2作为坐标)
  const scatterData = useMemo(() => {
    return samples.map((s, i) => ({
      x: pcaResult.scores[i]?.[0] ?? 0,
      y: pcaResult.scores[i]?.[1] ?? 0,
      cluster: kmeansResult.labels[i],
      id: s.id,
      location: s.location,
    }));
  }, [samples, pcaResult, kmeansResult]);

  const clusterScatterData = useMemo(() => {
    const groups: Record<number, typeof scatterData> = {};
    scatterData.forEach(d => {
      if (!groups[d.cluster]) groups[d.cluster] = [];
      groups[d.cluster].push(d);
    });
    return Object.entries(groups).map(([key, data]) => ({
      name: `簇${parseInt(key) + 1}`,
      data,
      color: CLUSTER_COLORS[parseInt(key) % CLUSTER_COLORS.length],
    }));
  }, [scatterData]);

  // PCA 方差贡献率图
  const varianceData = useMemo(() => {
    return pcaResult.explainedVarianceRatio.map((v, i) => ({
      component: `PC${i + 1}`,
      variance: +(v * 100).toFixed(2),
      cumulative: +(pcaResult.cumulativeVariance[i] * 100).toFixed(2),
    }));
  }, [pcaResult]);

  // PCA 载荷热力图数据
  const loadingRows = useMemo(() => {
    return pcaResult.featureNames.map((name, i) => {
      const row: (string | number)[] = [name];
      for (let c = 0; c < pcaResult.nComponents; c++) {
        row.push(+pcaResult.loadings[i][c].toFixed(3));
      }
      return row;
    });
  }, [pcaResult]);

  const loadingHeaders = ['指标', ...Array.from({ length: pcaResult.nComponents }, (_, i) => `PC${i + 1}`)];

  // 簇摘要表
  const clusterSummaryRows = useMemo(() => {
    return kmeansResult.clusterSummary.map(c => [
      `簇${c.clusterId + 1}`,
      c.size,
      c.avgPH.toFixed(2),
      c.avgTDS.toFixed(0),
      c.avgHardness.toFixed(0),
      c.avgChloride.toFixed(0),
      c.avgNitrate.toFixed(1),
      c.avgFluoride.toFixed(2),
      c.waterType,
      c.qualityGrade,
    ]);
  }, [kmeansResult]);

  const clusterSummaryHeaders = ['簇', '样本数', 'pH', '矿化度', '总硬度', 'Cl⁻', 'NO₃⁻', 'F⁻', '水质类型', '水质等级'];

  // 关联规则表
  const rulesRows = useMemo(() => {
    return rules.map(r => [
      r.antecedent.join(' + '),
      r.consequent.join(' + '),
      (r.support * 100).toFixed(1) + '%',
      (r.confidence * 100).toFixed(1) + '%',
      r.lift.toFixed(2),
      r.lift > 1 ? '正相关' : r.lift < 1 ? '负相关' : '独立',
    ]);
  }, [rules]);

  const rulesHeaders = ['前项', '后项', '支持度', '置信度', '提升度', '关联性'];

  // 异常检测结果表
  const anomalyRows = useMemo(() => {
    return anomalies.map(a => [
      a.sampleId,
      a.location,
      a.mahalanobisDist.toFixed(3),
      a.anomalousFeatures.length,
      a.anomalousFeatures.map(f => `${f.feature}(z=${f.zScore.toFixed(1)})`).join('; '),
      a.anomalyLevel === 'normal' ? '正常' : a.anomalyLevel === 'mild' ? '轻度异常' : a.anomalyLevel === 'moderate' ? '中度异常' : '严重异常',
    ]);
  }, [anomalies]);

  const anomalyHeaders = ['样本ID', '位置', 'Mahalanobis距离', '异常指标数', '异常指标详情', '异常等级'];

  // 异常条形图
  const anomalyBarData = useMemo(() => {
    return anomalies.slice(0, 10).map(a => ({
      name: a.sampleId,
      distance: +a.mahalanobisDist.toFixed(3),
      level: a.anomalyLevel,
      fill: ANOMALY_COLORS[a.anomalyLevel],
    }));
  }, [anomalies]);

  const anomalyCount = anomalies.filter(a => a.isAnomaly).length;

  return (
    <div className="space-y-4">
      {/* 数据集选择器 */}
      <TechCard title="数据挖掘评价器" badge="B-30" icon={Database}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] text-gw-muted mb-1">预设数据集</label>
            <select
              value={selectedDataset}
              onChange={e => setSelectedDataset(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-gw-blue/50"
            >
              {PRESET_DATASETS.map((ds, i) => (
                <option key={i} value={i}>{ds.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-[11px] text-gw-muted">{dataset.description}（{samples.length}个样本）</p>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard title="样本数" value={samples.length} unit="个" accent="blue" />
          <StatCard title="聚类数" value={kValue} unit="簇" accent="green" />
          <StatCard title="主成分数" value={pcaResult.nComponents} unit="个" accent="purple" />
          <StatCard title="异常样本" value={anomalyCount} unit="个" accent="red" subtitle={`占比${((anomalyCount / samples.length) * 100).toFixed(0)}%`} />
        </div>
      </TechCard>

      {/* ═══ Panel 1: K-Means 聚类分析 ═══ */}
      <TechCard title="K-Means 聚类分析" badge="聚类" icon={Calculator} className="border-gw-blue/15">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-[11px] text-gw-muted">聚类数 K:</label>
          <input
            type="range" min={2} max={6} value={kValue}
            onChange={e => setKValue(Number(e.target.value))}
            className="flex-1 max-w-[200px]"
          />
          <span className="text-xs font-mono text-gw-blue px-2 py-0.5 rounded bg-gw-blue/10">{kValue}</span>
          <span className="text-[11px] text-gw-muted">迭代次数: {kmeansResult.iterations}</span>
          <span className="text-[11px] text-gw-muted">簇内平方和: {kmeansResult.inertia.toFixed(2)}</span>
        </div>

        <LazyChartCard title="聚类散点图（PC1 × PC2 投影）" height={320}>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="x" name="PC1" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'PC1', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="PC2" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(_v: unknown, _n: string, props: { payload?: { id?: string; location?: string; cluster?: number } }) => [
                  `样本: ${props.payload?.id ?? ''}`,
                  `位置: ${props.payload?.location ?? ''}`,
                  `簇: ${(props.payload?.cluster ?? 0) + 1}`,
                ]}
              />
              <Legend />
              {clusterScatterData.map(group => (
                <Scatter key={group.name} name={group.name} data={group.data} fill={group.color} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <div className="mt-3">
          <FilterableTechTable headers={clusterSummaryHeaders} rows={clusterSummaryRows} />
        </div>
      </TechCard>

      {/* ═══ Panel 2: PCA 主成分分析 ═══ */}
      <TechCard title="主成分分析 (PCA)" badge="降维" icon={Calculator} className="border-purple-500/15">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-[11px] text-gw-muted">保留主成分数:</label>
          <input
            type="range" min={2} max={8} value={pcaComponents}
            onChange={e => setPcaComponents(Number(e.target.value))}
            className="flex-1 max-w-[200px]"
          />
          <span className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-500/10">{pcaResult.nComponents}</span>
          <span className="text-[11px] text-gw-muted">累计贡献率: {(pcaResult.cumulativeVariance[pcaResult.nComponents - 1] * 100).toFixed(1)}%</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LazyChartCard title="方差贡献率" height={260}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={varianceData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="component" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="variance" name="方差贡献率" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cumulative" name="累计贡献率" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gw-text">主成分解释</p>
            {pcaResult.componentInterpretation.map((ci, i) => (
              <div key={i} className="p-2 rounded-lg bg-purple-500/8 border border-purple-500/12">
                <p className="text-[11px] font-semibold text-purple-400">{ci.component}</p>
                <p className="text-[10px] text-gw-muted mt-0.5">{ci.interpretation}</p>
                <p className="text-[10px] text-gw-muted/70">主要载荷: {ci.topFeatures.map(f => `${f.name}(${f.loading.toFixed(2)})`).join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold text-gw-text mb-2">载荷矩阵（指标 × 主成分）</p>
          <FilterableTechTable headers={loadingHeaders} rows={loadingRows} />
        </div>
      </TechCard>

      {/* ═══ Panel 3: 关联规则挖掘 ═══ */}
      <TechCard title="关联规则挖掘" badge="关联" icon={Calculator} className="border-green-500/15">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gw-muted">最小支持度:</label>
            <input
              type="range" min={5} max={30} value={minSupport * 100}
              onChange={e => setMinSupport(Number(e.target.value) / 100)}
              className="w-[120px]"
            />
            <span className="text-xs font-mono text-green-400 px-2 py-0.5 rounded bg-green-500/10">{(minSupport * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gw-muted">最小置信度:</label>
            <input
              type="range" min={30} max={90} value={minConfidence * 100}
              onChange={e => setMinConfidence(Number(e.target.value) / 100)}
              className="w-[120px]"
            />
            <span className="text-xs font-mono text-green-400 px-2 py-0.5 rounded bg-green-500/10">{(minConfidence * 100).toFixed(0)}%</span>
          </div>
          <span className="text-[11px] text-gw-muted">发现规则: {rules.length} 条</span>
        </div>

        {rules.length > 0 ? (
          <FilterableTechTable headers={rulesHeaders} rows={rulesRows} />
        ) : (
          <div className="p-6 text-center text-xs text-gw-muted">
            当前阈值下未发现关联规则，请降低最小支持度或最小置信度
          </div>
        )}

        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-green-500/8 border border-green-500/12">
            <p className="text-[10px] text-green-400 font-semibold">提升度 &gt; 1</p>
            <p className="text-[10px] text-gw-muted">正关联：前项出现时后项出现概率高于随机</p>
          </div>
          <div className="p-2 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-[10px] text-gw-muted font-semibold">提升度 = 1</p>
            <p className="text-[10px] text-gw-muted">独立：前后项互不影响</p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/8 border border-red-500/12">
            <p className="text-[10px] text-red-400 font-semibold">提升度 &lt; 1</p>
            <p className="text-[10px] text-gw-muted">负关联：前项出现反而降低后项概率</p>
          </div>
        </div>
      </TechCard>

      {/* ═══ Panel 4: 异常值检测 ═══ */}
      <TechCard title="异常值检测" badge="异常" icon={AlertTriangle} className="border-red-500/15">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <StatCard title="正常样本" value={samples.length - anomalyCount} unit="个" accent="green" />
          <StatCard title="异常样本" value={anomalyCount} unit="个" accent="red" />
          <StatCard title="最大M-D距离" value={anomalies[0]?.mahalanobisDist.toFixed(2) ?? '0'} accent="orange" />
          <StatCard title="平均M-D距离" value={(anomalies.reduce((s, a) => s + a.mahalanobisDist, 0) / anomalies.length).toFixed(2)} accent="blue" />
        </div>

        <LazyChartCard title="Mahalanobis距离排名（Top 10）" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={anomalyBarData} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={55} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="distance" name="M-D距离" radius={[0, 4, 4, 0]}>
                {anomalyBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <div className="mt-3">
          <FilterableTechTable headers={anomalyHeaders} rows={anomalyRows} />
        </div>
      </TechCard>

      {/* ═══ Panel 5: 方法参考 ═══ */}
      <TechCard title="方法参考" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">K-Means 聚类</p>
            <p className="text-[10px] text-gw-muted">基于标准化13项水质指标的K-Means++初始化聚类，通过PC1×PC2投影可视化簇分布。自动判定每簇的水质类型（基于矿化度+主导离子）和水质等级（基于pH/TDS/NO₃⁻/F⁻/硬度综合评分）。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">主成分分析 (PCA)</p>
            <p className="text-[10px] text-gw-muted">对标准化协方差矩阵进行Jacobi特征分解，按特征值降序选取主成分。载荷矩阵反映各指标对主成分的贡献，累计贡献率≥80%通常被认为可有效代表原始数据信息。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">关联规则 (Apriori)</p>
            <p className="text-[10px] text-gw-muted">将水质指标离散化为事务项集（如"高矿化度""高硬度""高氟"等），通过Apriori算法挖掘频繁项集并生成关联规则。支持度衡量规则出现频率，置信度衡量规则可信度，提升度衡量关联强度。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">异常值检测 (Mahalanobis)</p>
            <p className="text-[10px] text-gw-muted">基于多变量Mahalanobis距离检测异常样本，考虑指标间协方差结构。同时辅以单变量Z-score检测（|z|&gt;2为异常指标）。卡方检验临界值（α=0.05）作为异常判定阈值。</p>
          </div>
        </div>
        <DataSourceNote source="预设数据基于河北省地下水监测公报及水文地质分区特征整理" version="B-30 v1.0" />
      </TechCard>
    </div>
  );
}
