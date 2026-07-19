/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { AlertTriangle, ShieldAlert, ShieldCheck, TrendingUp, Thermometer, MapPin } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  ALERT_LEVELS,
  DEFAULT_THRESHOLDS,
  REGION_PRESETS,
  QUALITY_TREND_FORECAST,
  FACTOR_STANDARD_III,
  type AlertThresholds,
  type FactorAlertResult,
  calcFactorAlert,
  calcBatchRegionRisk,
  calcAlertSummary,
  getDemoAlertResults,
} from '../../utils/pollutionAlertEngine';

// ═══════════════════════════════════════════════════════
// 子面板组件
// ═══════════════════════════════════════════════════════

/** 面板1: 预警概览 */
function AlertOverviewPanel({ summary }: { summary: ReturnType<typeof calcAlertSummary> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        {(['安全', '关注', '预警', '警告', '严重'] as const).map(level => {
          const meta = ALERT_LEVELS[level];
          const countMap: Record<string, number> = {
            '安全': summary.safeCount,
            '关注': summary.cautionCount,
            '预警': summary.warningCount,
            '警告': summary.alertCount,
            '严重': summary.severeCount,
          };
          return (
            <StatCard
              key={level}
              title={level}
              value={countMap[level]}
              unit="个"
              accent={meta.color === '#10b981' ? 'emerald' : meta.color === '#3b82f6' ? 'blue' : meta.color === '#f59e0b' ? 'amber' : meta.color === '#f97316' ? 'orange' : 'red'}
              subtitle={`${summary.totalSamples > 0 ? (countMap[level] / summary.totalSamples * 100).toFixed(1) : 0}%`}
            />
          );
        })}
      </div>
      <TechCard title="预警摘要">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gw-muted text-xs">总体预警等级</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: ALERT_LEVELS[summary.overallLevel].color }} />
              <span className="font-semibold" style={{ color: ALERT_LEVELS[summary.overallLevel].color }}>{summary.overallLevel}</span>
            </div>
          </div>
          <div>
            <span className="text-gw-muted text-xs">超标率</span>
            <p className="font-semibold text-gw-text mt-1">{(summary.exceededRate * 100).toFixed(1)}%</p>
          </div>
          <div className="col-span-2">
            <span className="text-gw-muted text-xs">最常见超标因子</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {summary.topExceededFactors.length > 0
                ? summary.topExceededFactors.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">{f}</span>
                ))
                : <span className="text-gw-muted text-xs">无超标因子</span>}
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

/** 面板2: 单因子预警计算 */
function FactorAlertPanel() {
  const [factorName, setFactorName] = useState('氟化物');
  const [valueStr, setValueStr] = useState('1.5');
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);

  const result = useMemo(() => {
    const factorInfo = FACTOR_STANDARD_III[factorName];
    const val = parseFloat(valueStr);
    if (!factorInfo || isNaN(val)) return null;
    return calcFactorAlert(factorName, val, factorInfo.standard, factorInfo.unit, factorInfo.type, thresholds);
  }, [factorName, valueStr, thresholds]);

  const thresholdTable = useMemo(() => [
    { level: '安全', range: `Pi < ${thresholds.caution}`, color: '#10b981' },
    { level: '关注', range: `${thresholds.caution} ≤ Pi < ${thresholds.warning}`, color: '#3b82f6' },
    { level: '预警', range: `${thresholds.warning} ≤ Pi < ${thresholds.alert}`, color: '#f59e0b' },
    { level: '警告', range: `${thresholds.alert} ≤ Pi < ${thresholds.severe}`, color: '#f97316' },
    { level: '严重', range: `Pi ≥ ${thresholds.severe}`, color: '#ef4444' },
  ], [thresholds]);

  const piBarData = useMemo(() => {
    if (!result || result.Pi === null) return [];
    return [
      { name: '监测值', Pi: result.Pi, color: ALERT_LEVELS[result.level].color },
      { name: 'III类标准', Pi: 1.0, color: '#64748b' },
    ];
  }, [result]);

  return (
    <TechCard title="单因子预警计算" badge="输入监测值">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gw-muted">监测因子</label>
            <select value={factorName} onChange={e => setFactorName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
              {Object.entries(FACTOR_STANDARD_III).map(([name, info]) => (
                <option key={name} value={name}>{name}（{info.unit}，限值{info.standard}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted">监测值</label>
            <input type="number" step="any" value={valueStr} onChange={e => setValueStr(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" placeholder="输入监测值" />
          </div>
          {result && (
            <div className={`p-3 rounded-lg border ${ALERT_LEVELS[result.level].bgColor}`} style={{ borderColor: ALERT_LEVELS[result.level].color + '40' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: ALERT_LEVELS[result.level].color }} />
                <span className="font-semibold text-gw-text">预警等级：{result.level}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gw-muted">Pi = {result.Pi?.toFixed(3) ?? '-'}</div>
                <div className="text-gw-muted">超标倍数 = {result.exceedanceRatio !== null ? result.exceedanceRatio.toFixed(2) : '-'}</div>
                <div className="text-gw-muted">标准值 = {result.standardIII ?? '-'} {result.unit}</div>
                <div className="text-gw-muted">{ALERT_LEVELS[result.level].description}</div>
              </div>
            </div>
          )}
          {/* 阈值设置 */}
          <details className="text-xs">
            <summary className="text-gw-muted cursor-pointer hover:text-gw-text">阈值设置</summary>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(['caution', 'warning', 'alert', 'severe'] as const).map(key => (
                <div key={key}>
                  <label className="text-gw-muted">{key === 'caution' ? '关注' : key === 'warning' ? '预警' : key === 'alert' ? '警告' : '严重'}</label>
                  <input type="number" step="any" value={thresholds[key]}
                    onChange={e => setThresholds(t => ({ ...t, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full mt-0.5 px-2 py-1 rounded bg-gw-surface border border-gw-border text-gw-text text-xs" />
                </div>
              ))}
            </div>
          </details>
        </div>
        {/* 图表区 */}
        <div className="space-y-3">
          {FACTOR_STANDARD_III[factorName] && (
            <div className="p-2 rounded-lg bg-gw-surface text-xs text-gw-muted">
              <p className="text-gw-text font-medium">{FACTOR_STANDARD_III[factorName].description}</p>
              <p className="mt-1">因子类型：{FACTOR_STANDARD_III[factorName].type}</p>
            </div>
          )}
          {piBarData.length > 0 && (
            <LazyChartCard title="Pi 对比" height={180}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={piBarData}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="Pi" radius={[4, 4, 0, 0]}>
                    {piBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          )}
          {/* 阈值表 */}
          <FilterableTechTable
            headers={['预警等级', 'Pi范围', '色标']}
            rows={thresholdTable.map(t => [t.level, t.range, t.color])}
            filterPlaceholder="搜索等级..."
          />
        </div>
      </div>
    </TechCard>
  );
}

/** 面板3: 水样综合预警 */
function SampleAlertPanel() {
  const [thresholds, _setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);

  const results = useMemo(() => getDemoAlertResults(thresholds), [thresholds]);
  const summary = useMemo(() => calcAlertSummary(results), [results]);

  // 热力图数据
  const heatmapData = useMemo(() => {
    const allFactors = new Set<string>();
    results.forEach(r => r.factors.forEach(f => allFactors.add(f.name)));
    return {
      factors: [...allFactors],
      samples: results.map(r => ({
        name: r.sampleName,
        level: r.level,
        factorLevels: r.factors.reduce<Record<string, FactorAlertResult>>((acc, f) => { acc[f.name] = f; return acc; }, {}),
      })),
    };
  }, [results]);

  // 超标因子排名数据
  const factorRankData = useMemo(() => {
    const factorMap: Record<string, { count: number; maxPi: number; levels: Record<string, number> }> = {};
    results.forEach(r => {
      r.factors.forEach(f => {
        if (!factorMap[f.name]) factorMap[f.name] = { count: 0, maxPi: 0, levels: {} };
        if (f.levelNum >= 2) factorMap[f.name].count++;
        if (f.Pi !== null && f.Pi > factorMap[f.name].maxPi) factorMap[f.name].maxPi = f.Pi;
        factorMap[f.name].levels[f.level] = (factorMap[f.name].levels[f.level] || 0) + 1;
      });
    });
    return Object.entries(factorMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  return (
    <div className="space-y-4">
      <AlertOverviewPanel summary={summary} />
      <TechCard title="水样预警结果" badge={`${results.length}个水样`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">水样名称</th>
                <th className="text-left p-2 text-gw-muted">预警等级</th>
                <th className="text-right p-2 text-gw-muted">超标因子数</th>
                <th className="text-right p-2 text-gw-muted">污染指数</th>
                <th className="text-left p-2 text-gw-muted">主要超标因子</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.sampleName} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 text-gw-text">{r.sampleName}</td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: ALERT_LEVELS[r.level].color + '20', color: ALERT_LEVELS[r.level].color }}>
                      {ALERT_LEVELS[r.level].icon} {r.level}
                    </span>
                  </td>
                  <td className="p-2 text-right text-gw-text">{r.exceededCount}</td>
                  <td className="p-2 text-right font-mono text-gw-text">{r.pollutionIndex.toFixed(2)}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {r.exceededFactors.map(f => (
                        <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400">{f}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
      {/* 超标因子排名 */}
      <LazyChartCard title="因子超标频次与最大Pi" height={300}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={factorRankData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
            <XAxis type="number" stroke="#64748b" fontSize={10} />
            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={120} />
            <Tooltip />
            <Bar dataKey="count" name="超标次数" fill="#ef4444" radius={[0, 3, 3, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>
      {/* 因子热力图 */}
      <TechCard title="因子预警等级热力图" badge="水样×因子">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-1.5 text-gw-muted sticky left-0 bg-gw-bg">水样</th>
                {heatmapData.factors.map(f => (
                  <th key={f} className="p-1.5 text-gw-muted text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', maxHeight: 80 }}>{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.samples.map(s => (
                <tr key={s.name} className="border-b border-gw-border/50">
                  <td className="p-1.5 text-gw-text sticky left-0 bg-gw-bg whitespace-nowrap">{s.name.split('-').slice(0, 2).join('-')}</td>
                  {heatmapData.factors.map(f => {
                    const fr = s.factorLevels[f];
                    if (!fr || fr.Pi === null) return <td key={f} className="p-1.5 text-center text-gw-muted">-</td>;
                    return (
                      <td key={f} className="p-1.5 text-center" style={{ backgroundColor: ALERT_LEVELS[fr.level].color + '30' }}>
                        <span style={{ color: ALERT_LEVELS[fr.level].color }}>{fr.Pi.toFixed(2)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-gw-muted">
          {(['安全', '关注', '预警', '警告', '严重'] as const).map(l => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-3 h-2 rounded" style={{ backgroundColor: ALERT_LEVELS[l].color + '50' }} />
              {l}
            </span>
          ))}
        </div>
      </TechCard>
    </div>
  );
}

/** 面板4: 区域风险评分 */
function RegionRiskPanel() {
  const regionResults = useMemo(() => calcBatchRegionRisk(REGION_PRESETS), []);



  const regionColors: Record<string, string> = {
    '山前平原': '#3b82f6',
    '中部平原': '#f59e0b',
    '滨海平原': '#ef4444',
    '冀东平原': '#f97316',
    '坝上高原': '#10b981',
    '山区': '#06b6d4',
  };

  // 风险排名数据
  const rankData = useMemo(() =>
    [...regionResults].sort((a, b) => b.riskScore - a.riskScore),
    [regionResults]
  );

  // 风险饼图数据
  const riskPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    regionResults.forEach(r => { counts[r.riskLevel] = (counts[r.riskLevel] || 0) + 1; });
    return (['安全', '关注', '预警', '警告', '严重'] as const)
      .filter(l => counts[l] > 0)
      .map(l => ({ name: l, value: counts[l], color: ALERT_LEVELS[l].color }));
  }, [regionResults]);

  return (
    <div className="space-y-4">
      <TechCard title="区域风险评分" badge="6大水文地质分区">
        <p className="text-xs text-gw-muted mb-3">基于各区域超标率加权评分，权重反映健康危害程度：毒理指标 &gt; 一般化学指标</p>
      </TechCard>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 风险排名柱状图 */}
        <LazyChartCard title="区域风险评分排名" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rankData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <YAxis dataKey="region" type="category" stroke="#64748b" fontSize={10} width={70} />
              <Tooltip />
              <Bar dataKey="riskScore" name="风险评分" radius={[0, 3, 3, 0]} barSize={14}>
                {rankData.map(entry => (
                  <Cell key={entry.region} fill={regionColors[entry.region] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" />≥75 严重</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" />55~75 警告</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />35~55 预警</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />15~35 关注</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500 inline-block" />&lt;15 安全</span>
          </div>
        </LazyChartCard>
        {/* 风险等级分布 */}
        <LazyChartCard title="区域风险等级分布" height={320}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                {riskPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
      {/* 区域详情表 */}
      <TechCard title="区域风险详情">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">区域</th>
                <th className="text-left p-2 text-gw-muted">范围</th>
                <th className="text-right p-2 text-gw-muted">风险评分</th>
                <th className="text-left p-2 text-gw-muted">风险等级</th>
                <th className="text-left p-2 text-gw-muted">主要风险因子</th>
                <th className="text-left p-2 text-gw-muted">风险描述</th>
              </tr>
            </thead>
            <tbody>
              {rankData.map(r => (
                <tr key={r.region} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.region}</td>
                  <td className="p-2 text-gw-muted">{r.area}</td>
                  <td className="p-2 text-right font-mono font-semibold" style={{ color: ALERT_LEVELS[r.riskLevel].color }}>{r.riskScore}</td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: ALERT_LEVELS[r.riskLevel].color + '20', color: ALERT_LEVELS[r.riskLevel].color }}>
                      {ALERT_LEVELS[r.riskLevel].icon} {r.riskLevel}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {r.primaryRisks.map(f => (
                        <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400">{f}</span>
                      ))}
                      {r.primaryRisks.length === 0 && <span className="text-gw-muted text-[10px]">无</span>}
                    </div>
                  </td>
                  <td className="p-2 text-gw-muted">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}

/** 面板5: 趋势预测 */
function TrendForecastPanel() {
  const actualData = QUALITY_TREND_FORECAST.filter(d => !d.period.includes('(预)'));
  const forecastData = QUALITY_TREND_FORECAST.filter(d => d.period.includes('(预)'));

  const targetYear2030 = 85; // 目标：2030年III类+占比85%

  // 连接线数据（实际最后一个点 + 预测第一个点）
  const bridgeData = [
    { period: actualData[actualData.length - 1].period, value: actualData[actualData.length - 1].value },
    { period: forecastData[0].period, value: forecastData[0].value },
  ];

  return (
    <div className="space-y-4">
      <TechCard title="水质改善趋势与预测" badge="2014-2030">
        <p className="text-xs text-gw-muted">基于2014-2024实际数据线性外推，目标2030年III类+占比达85%。数据来源：河北省水资源公报。</p>
      </TechCard>
      <LazyChartCard title="III类及以上占比趋势" height={360}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={QUALITY_TREND_FORECAST} filename="水质改善趋势预测" sheetName="趋势预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={[...actualData, ...bridgeData, ...forecastData]} margin={{ top: 10, right: 20 }}>
            <defs>
              <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
            <XAxis dataKey="period" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* 实际数据 */}
            <Area type="monotone" dataKey="value" name="III类+占比(实际)" stroke="#3b82f6" fill="url(#gActual)" strokeWidth={2}
              data={actualData} />
            {/* 预测数据 */}
            <Area type="monotone" dataKey="value" name="III类+占比(预测)" stroke="#f59e0b" fill="url(#gForecast)" strokeWidth={2} strokeDasharray="5 5"
              data={forecastData} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-gw-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />实际数据</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />线性预测</span>
          <span className="ml-4">目标：2030年达{targetYear2030}%</span>
        </div>
      </LazyChartCard>
      {/* 里程碑 */}
      <TechCard title="改善里程碑">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { year: '2015', event: '超采治理启动', value: '25.8%', color: '#ef4444', icon: AlertTriangle },
            { year: '2022', event: 'III类+首超50%', value: '50.3%', color: '#f59e0b', icon: TrendingUp },
            { year: '2024', event: '达标率63.5%', value: '63.5%', color: '#3b82f6', icon: ShieldCheck },
          ].map(m => (
            <div key={m.year} className="flex items-start gap-3 p-3 rounded-lg bg-gw-surface">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + '20' }}>
                <m.icon size={16} style={{ color: m.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gw-text">{m.year}年</div>
                <div className="text-xs text-gw-muted">{m.event}</div>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: m.color }}>{m.value}</div>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════

const SUB_TABS = [
  { key: 'overview', label: '预警概览', icon: AlertTriangle },
  { key: 'factor', label: '单因子预警', icon: Thermometer },
  { key: 'sample', label: '水样预警', icon: ShieldAlert },
  { key: 'region', label: '区域风险', icon: MapPin },
  { key: 'trend', label: '趋势预测', icon: TrendingUp },
] as const;

type SubTabKey = typeof SUB_TABS[number]['key'];

export function PollutionAlertTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('overview');

  // 默认概览数据
  const defaultResults = useMemo(() => getDemoAlertResults(), []);
  const defaultSummary = useMemo(() => calcAlertSummary(defaultResults), [defaultResults]);

  return (
    <div className="space-y-6">
      {/* 横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-sm text-amber-400 font-medium">地下水污染预警系统</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">基于GB/T 14848-2017标准，以III类标准限值为基准，对单因子/水样/区域进行多级预警分析</p>
      </div>

      {/* 子Tab */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 面板切换 */}
      {activeSubTab === 'overview' && <AlertOverviewPanel summary={defaultSummary} />}
      {activeSubTab === 'factor' && <FactorAlertPanel />}
      {activeSubTab === 'sample' && <SampleAlertPanel />}
      {activeSubTab === 'region' && <RegionRiskPanel />}
      {activeSubTab === 'trend' && <TrendForecastPanel />}

      <DataSourceNote source="GB/T 14848-2017 | 2024河北省水资源公报 | 区域超标率基于历史监测数据估算" />
    </div>
  );
}
