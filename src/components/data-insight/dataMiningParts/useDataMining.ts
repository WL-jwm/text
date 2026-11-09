/**
 * 拆分自 DataMiningTab.tsx — 数据挖掘派生计算 hook
 * （聚类/PCA/关联规则/异常检测 + 图表与表格派生数据）
 */
import { useMemo } from 'react';
import {
  PRESET_DATASETS,
  calcKMeans, calcPCA, calcAssociationRules, calcAnomalies,
} from '../../../utils/dataMiningCalculator';

const CLUSTER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const ANOMALY_COLORS: Record<string, string> = {
  normal: '#10b981',
  mild: '#f59e0b',
  moderate: '#f97316',
  severe: '#ef4444',
};

export interface DataMiningParams {
  selectedDataset: number;
  kValue: number;
  pcaComponents: number;
  minSupport: number;
  minConfidence: number;
}

export function useDataMining({ selectedDataset, kValue, pcaComponents, minSupport, minConfidence }: DataMiningParams) {
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

  return {
    dataset, samples, kmeansResult, pcaResult, rules, anomalies,
    clusterScatterData, varianceData, loadingRows, loadingHeaders,
    clusterSummaryRows, clusterSummaryHeaders, rulesRows, rulesHeaders,
    anomalyRows, anomalyHeaders, anomalyBarData, anomalyCount,
  };
}
