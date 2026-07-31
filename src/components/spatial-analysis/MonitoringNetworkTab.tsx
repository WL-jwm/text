/**
 * B-33 地下水监测网优化评估器 Tab
 *
 * 5大面板：
 *  1. 密度分析 — 监测井密度评价+标准对照+缺口识别
 *  2. 空间覆盖 — 泰森多边形控制面积+覆盖空白+均匀度
 *  3. 频率优化 — 自相关分析+推荐频率+冗余指数
 *  4. 有效性评价 — 信息熵+冗余度+效率评分
 *  5. 参考说明 — 密度标准+评价方法+优化建议
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Grid3x3, MapPin, Activity, Gauge, BookOpen,
  AlertTriangle, CheckCircle2, Target,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_MONITORING_AREAS, WELL_TYPE_LABELS, AQUIFER_LABELS, DENSITY_STANDARDS,
  calcMonitoringDensity, calcSpatialCoverage, calcOptimalFrequency,
  calcMonitoringEffectiveness, calcComprehensiveAssessment,
  type MonitoringArea,
} from '../../utils/monitoringNetworkCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

const STATUS_COLORS: Record<string, string> = {
  excellent: '#10b981',
  adequate: '#06b6d4',
  insufficient: '#f59e0b',
  severe: '#ef4444',
  optimal: '#10b981',
  'over-sampled': '#06b6d4',
  'under-sampled': '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  excellent: '优秀',
  adequate: '充足',
  insufficient: '不足',
  severe: '严重不足',
  optimal: '合理',
  'over-sampled': '过密',
  'under-sampled': '不足',
};

const WELL_TYPE_COLORS: Record<string, string> = {
  national: '#ef4444',
  provincial: '#f59e0b',
  municipal: '#06b6d4',
  enterprise: '#8b5cf6',
};

// ── 监测井分布图（Canvas）──
function WellDistributionMap({ area }: { area: MonitoringArea }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / area.cols;
    const cellH = h / area.rows;

    // 背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // 网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= area.rows; i += 5) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(w, i * cellH);
      ctx.stroke();
    }
    for (let j = 0; j <= area.cols; j += 5) {
      ctx.beginPath();
      ctx.moveTo(j * cellW, 0);
      ctx.lineTo(j * cellW, h);
      ctx.stroke();
    }

    // 计算覆盖区域
    const coverage = calcSpatialCoverage(area);
    const maxDist = Math.max(area.rows, area.cols) * 0.3;

    // 绘制覆盖空白
    for (const blank of coverage.blankZones) {
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.fillRect(blank.col * cellW, blank.row * cellH, cellW + 1, cellH + 1);
    }

    // 绘制泰森多边形（简化：每口井的控制范围用半透明圆）
    for (const well of area.wells) {
      const cx = well.col * cellW + cellW / 2;
      const cy = well.row * cellH + cellH / 2;
      const radius = Math.sqrt(maxDist * maxDist / Math.PI) * Math.min(cellW, cellH);

      // 控制范围
      ctx.fillStyle = `${WELL_TYPE_COLORS[well.type]}20`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.5, 0, 2 * Math.PI);
      ctx.fill();

      // 井点
      ctx.fillStyle = WELL_TYPE_COLORS[well.type];
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fill();

      // 标签
      if (cellW > 20) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '9px sans-serif';
        ctx.fillText(well.name, cx + 6, cy - 4);
      }
    }
  }, [area]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-lg border border-gw-border" />
      <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px]">
        {Object.entries(WELL_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-gw-muted">{WELL_TYPE_LABELS[type as keyof typeof WELL_TYPE_LABELS]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.15)' }} />
          <span className="text-gw-muted">覆盖空白</span>
        </div>
      </div>
    </div>
  );
}

// ── 面板1: 密度分析 ──
function DensityPanel({ area }: { area: MonitoringArea }) {
  const result = useMemo(() => calcMonitoringDensity(area), [area]);

  const densityData = useMemo(() => [
    { name: '实际密度', value: Number((result.actualDensity * 1000).toFixed(2)), color: '#06b6d4' },
    { name: '推荐密度', value: Number((result.requiredDensity * 1000).toFixed(2)), color: '#10b981' },
  ], [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Grid3x3 size={16} className="text-cyan-400" />
          <h4 className="text-sm font-semibold text-gw-text">监测井密度评价</h4>
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: `${STATUS_COLORS[result.status]}20`, color: STATUS_COLORS[result.status] }}
          >
            {STATUS_LABELS[result.status]}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">面积</div>
            <div className="text-sm font-bold text-gw-text">{result.area.toLocaleString()}</div>
            <div className="text-[9px] text-gw-muted">km²</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">实际井数</div>
            <div className="text-sm font-bold text-cyan-400">{result.wellCount}</div>
            <div className="text-[9px] text-gw-muted">口</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">推荐井数</div>
            <div className="text-sm font-bold text-green-400">{result.requiredCount}</div>
            <div className="text-[9px] text-gw-muted">口</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">覆盖率</div>
            <div className={`text-sm font-bold ${result.coverageRatio >= 80 ? 'text-green-400' : result.coverageRatio >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.coverageRatio.toFixed(0)}%
            </div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">缺口</div>
            <div className={`text-sm font-bold ${result.gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {result.gap}
            </div>
            <div className="text-[9px] text-gw-muted">口</div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-gw-surface rounded-lg text-xs text-gw-muted">
          {result.message}
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">实际 vs 推荐密度</h5>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={densityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '口/1000km²', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                {densityData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">密度标准参考</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                  <th className="text-left py-1 px-2">含水层类型</th>
                  <th className="text-center py-1 px-2">最小间距(km²/口)</th>
                  <th className="text-center py-1 px-2">推荐间距</th>
                  <th className="text-center py-1 px-2">最大间距</th>
                </tr>
              </thead>
              <tbody className="text-gw-text">
                {DENSITY_STANDARDS.map(s => (
                  <tr key={s.type} className={`border-b border-gw-border/50 ${area.aquiferType === s.type ? 'bg-gw-blue/10' : ''}`}>
                    <td className="py-1 px-2">{s.label}</td>
                    <td className="py-1 px-2 text-center">{s.minSpacing}</td>
                    <td className="py-1 px-2 text-center text-green-400">{s.recommended}</td>
                    <td className="py-1 px-2 text-center">{s.maxSpacing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[10px] text-gw-muted">
            当前区域类型: <span className="text-gw-highlight">{AQUIFER_LABELS[area.aquiferType]}</span>
          </div>
        </TechCard>
      </div>
    </div>
  );
}

// ── 面板2: 空间覆盖 ──
function CoveragePanel({ area }: { area: MonitoringArea }) {
  const result = useMemo(() => calcSpatialCoverage(area), [area]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-purple-400" />
          <h4 className="text-sm font-semibold text-gw-text">空间覆盖评价</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总面积</div>
            <div className="text-sm font-bold text-gw-text">{result.totalArea.toFixed(1)}</div>
            <div className="text-[9px] text-gw-muted">km²</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">覆盖面积</div>
            <div className="text-sm font-bold text-green-400">{result.coveredArea.toFixed(1)}</div>
            <div className="text-[9px] text-gw-muted">km²</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">覆盖率</div>
            <div className={`text-sm font-bold ${result.coveragePercent > 80 ? 'text-green-400' : result.coveragePercent > 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.coveragePercent.toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">均匀度</div>
            <div className={`text-sm font-bold ${result.uniformityIndex > 0.7 ? 'text-green-400' : result.uniformityIndex > 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.uniformityIndex.toFixed(3)}
            </div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">空白区</div>
            <div className={`text-sm font-bold ${result.blankZones.length < 10 ? 'text-green-400' : result.blankZones.length < 30 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.blankZones.length}
            </div>
            <div className="text-[9px] text-gw-muted">个网格</div>
          </div>
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">监测井分布与覆盖</h5>
          <WellDistributionMap area={area} />
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">控制面积统计</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">平均控制面积</span>
              <span className="text-sm font-bold text-cyan-400">{result.avgControlArea.toFixed(2)} km²/口</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">最大控制面积</span>
              <span className="text-sm font-bold text-amber-400">{result.maxControlArea.toFixed(2)} km²/口</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">最小控制面积</span>
              <span className="text-sm font-bold text-green-400">{result.minControlArea.toFixed(2)} km²/口</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">未覆盖面积</span>
              <span className="text-sm font-bold text-red-400">{result.uncoveredArea.toFixed(2)} km²</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">均匀度指数</span>
              <span className={`text-sm font-bold ${result.uniformityIndex > 0.7 ? 'text-green-400' : result.uniformityIndex > 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                {result.uniformityIndex.toFixed(3)}
              </span>
            </div>
          </div>
          {result.blankZones.length > 0 && (
            <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="text-[10px] text-amber-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                检测到 {result.blankZones.length} 个覆盖空白区域
              </div>
              <div className="text-[10px] text-gw-muted mt-1">
                建议在空白区中心增设监测井，优先选择面积最大的空白区域
              </div>
            </div>
          )}
        </TechCard>
      </div>
    </div>
  );
}

// ── 面板3: 频率优化 ──
function FrequencyPanel({ area }: { area: MonitoringArea }) {
  const results = useMemo(() => {
    return area.wells.map(well => {
      // 生成合成历史数据
      const history: number[] = [];
      const baseLevel = well.aquiferType === 'deep' ? -15 : well.aquiferType === 'karst' ? 540 : 35;
      const amp = well.aquiferType === 'deep' ? 2 : 5;
      const trend = well.aquiferType === 'deep' ? -0.3 : -0.1;
      const phase = (well.row + well.col) * 0.3;
      for (let m = 0; m < 24; m++) {
        history.push(baseLevel + amp * Math.sin((m / 12) * 2 * Math.PI + phase) + trend * m + Math.sin(m * 7.3) * 1.5);
      }
      return calcOptimalFrequency(well.id, well.name, history, well.frequency);
    });
  }, [area]);

  const freqCompareData = useMemo(() =>
    results.map(r => ({
      name: r.wellName,
      current: r.currentFrequency,
      optimal: r.optimalFrequency,
    })),
  [results]);

  const redundancyData = useMemo(() =>
    results.map(r => ({
      name: r.wellName,
      redundancy: Number((r.redundancyIndex * 100).toFixed(1)),
      autocorr: Number((r.autocorrelationLag1 * 100).toFixed(1)),
    })),
  [results]);

  const tableRows = useMemo(() =>
    results.map(r => [
      r.wellName,
      String(r.currentFrequency),
      String(r.optimalFrequency),
      r.autocorrelationLag1.toFixed(3),
      (r.redundancyIndex * 100).toFixed(1) + '%',
      STATUS_LABELS[r.status] ?? r.status,
    ]),
  [results]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-green-400" />
          <h4 className="text-sm font-semibold text-gw-text">监测频率优化</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">频率合理</div>
            <div className="text-sm font-bold text-green-400">{results.filter(r => r.status === 'optimal').length}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">过密（冗余）</div>
            <div className="text-sm font-bold text-cyan-400">{results.filter(r => r.status === 'over-sampled').length}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">不足</div>
            <div className="text-sm font-bold text-red-400">{results.filter(r => r.status === 'under-sampled').length}</div>
          </div>
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">当前频率 vs 推荐频率</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={freqCompareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '次/年', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="current" name="当前频率" fill="#06b6d4" radius={[2, 2, 0, 0]} barSize={15} />
              <Bar dataKey="optimal" name="推荐频率" fill="#10b981" radius={[2, 2, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">冗余度与自相关系数</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={redundancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="redundancy" name="冗余度" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={15} />
              <Bar dataKey="autocorr" name="自相关系数" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">监测频率优化明细</h5>
        <FilterableTechTable
          headers={['监测井', '当前(次/年)', '推荐(次/年)', '自相关r1', '冗余度', '状态']}
          rows={tableRows}
        />
      </TechCard>
    </div>
  );
}

// ── 面板4: 有效性评价 ──
function EffectivenessPanel({ area }: { area: MonitoringArea }) {
  const result = useMemo(() => {
    const wellHistory: Record<string, number[]> = {};
    for (const well of area.wells) {
      const history: number[] = [];
      const baseLevel = well.aquiferType === 'deep' ? -15 : well.aquiferType === 'karst' ? 540 : 35;
      const amp = well.aquiferType === 'deep' ? 2 : 5;
      const trend = well.aquiferType === 'deep' ? -0.3 : -0.1;
      const phase = (well.row + well.col) * 0.3;
      for (let m = 0; m < 24; m++) {
        history.push(baseLevel + amp * Math.sin((m / 12) * 2 * Math.PI + phase) + trend * m + Math.sin(m * 7.3) * 1.5);
      }
      wellHistory[well.id] = history;
    }
    return calcMonitoringEffectiveness(area.wells, wellHistory);
  }, [area]);

  const radarData = useMemo(() => [
    { metric: '信息熵', value: Math.min(100, result.avgEntropy * 25), fullMark: 100 },
    { metric: '独立性', value: Math.min(100, (1 - result.redundantWells.length / Math.max(1, result.totalWells)) * 100), fullMark: 100 },
    { metric: '覆盖均匀', value: Math.min(100, result.efficiencyScore), fullMark: 100 },
    { metric: '信息贡献', value: Math.min(100, result.essentialWells.length / Math.max(1, result.totalWells) * 100), fullMark: 100 },
    { metric: '效率评分', value: result.efficiencyScore, fullMark: 100 },
  ], [result]);

  const corrData = useMemo(() =>
    result.redundancyPairs.map(rp => {
      const wellA = area.wells.find(w => w.id === rp.wellA);
      const wellB = area.wells.find(w => w.id === rp.wellB);
      return {
        name: `${wellA?.name ?? rp.wellA} - ${wellB?.name ?? rp.wellB}`,
        correlation: Number((rp.correlation * 100).toFixed(1)),
        redundancy: Number((rp.redundancy * 100).toFixed(1)),
      };
    }),
  [result, area.wells]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={16} className="text-amber-400" />
          <h4 className="text-sm font-semibold text-gw-text">监测有效性评价</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">监测井总数</div>
            <div className="text-sm font-bold text-gw-text">{result.totalWells}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">平均信息熵</div>
            <div className="text-sm font-bold text-cyan-400">{result.avgEntropy.toFixed(3)}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">冗余井数</div>
            <div className="text-sm font-bold text-red-400">{result.redundantWells.length}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">关键井数</div>
            <div className="text-sm font-bold text-green-400">{result.essentialWells.length}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">效率评分</div>
            <div className={`text-sm font-bold ${result.efficiencyScore >= 70 ? 'text-green-400' : result.efficiencyScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.efficiencyScore}
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-gw-surface rounded-lg text-xs text-gw-muted">
          {result.recommendation}
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">监测网效率雷达图</h5>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
              <Radar name="评分" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">井间相关性（冗余分析）</h5>
          {corrData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={corrData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 8 }} width={120} />
                <Tooltip {...TOOLTIP_STYLE} />
                <ReferenceLine x={85} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '冗余阈值', fill: '#ef4444', fontSize: 9 }} />
                <Bar dataKey="correlation" name="相关系数(%)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-xs text-gw-muted">
              <div className="text-center">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
                无高相关井对，监测网独立性良好
              </div>
            </div>
          )}
        </TechCard>
      </div>
    </div>
  );
}

// ── 面板5: 参考说明 ──
function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="监测井密度标准" defaultOpen icon={Grid3x3}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">含水层类型</th>
                <th className="text-center py-1 px-2">最小密度(km²/口)</th>
                <th className="text-center py-1 px-2">推荐密度</th>
                <th className="text-center py-1 px-2">最大密度</th>
                <th className="text-left py-1 px-2">参考依据</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {DENSITY_STANDARDS.map(s => (
                <tr key={s.type} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{s.label}</td>
                  <td className="py-1 px-2 text-center">{s.minSpacing}</td>
                  <td className="py-1 px-2 text-center text-green-400">{s.recommended}</td>
                  <td className="py-1 px-2 text-center">{s.maxSpacing}</td>
                  <td className="py-1 px-2 text-[10px] text-gw-muted">DZ/T 0307-2017</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="空间覆盖评价方法" icon={MapPin}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">泰森多边形法</strong>：将研究区划分为若干泰森多边形，每个多边形内只有一口监测井，多边形的面积即为该井的控制面积。控制面积越大，说明该井代表的范围越广。</p>
          <p><strong className="text-gw-text">覆盖空白识别</strong>：当某网格到最近监测井的距离超过阈值（取网格最大尺寸的30%），标记为覆盖空白。空白区域集中的位置应优先增设监测井。</p>
          <p><strong className="text-gw-text">均匀度指数</strong>：基于Gini系数的补集，衡量各监测井控制面积的均衡程度。指数越接近1，分布越均匀。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="频率优化方法" icon={Activity}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">自相关分析</strong>：计算水位时间序列的一阶自相关系数r1。r1越接近1，连续观测值相关性越高，存在冗余信息。</p>
          <p><strong className="text-gw-text">推荐频率公式</strong>：f = round(12 * (1 - r1²))。当r1高（变化平缓）时降低频率，r1低（变化快速）时提高频率。范围限制在2~24次/年。</p>
          <p><strong className="text-gw-text">冗余指数</strong>：R = r1²，反映连续观测中重复信息的比例。R {'>'} 0.64 (r1 {'>'} 0.8)时建议降低采样频率。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="信息熵与冗余度" icon={Gauge}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">信息熵</strong>：H = -Σ p(x) * log2(p(x))。将水位数据离散化为10个区间，计算Shannon熵。熵值越高，监测井提供的信息量越大。</p>
          <p><strong className="text-gw-text">井间相关性</strong>：计算各监测井水位序列的皮尔逊相关系数。相关系数绝对值 {'>'} 0.85的井对视为冗余，可考虑整合或调整位置。</p>
          <p><strong className="text-gw-text">效率评分</strong>：综合冗余率(50%)+独立性(30%)+信息熵(20%)，满分100。评分 {'>'} 80为优秀，{'<'} 40需重新规划。</p>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="DZ/T 0307-2017《地下水监测网设计规范》| GB/T 14848-2017《地下水质量标准》| 河北省地下水监测规划(2021-2025) | 水利部《地下水监测工程技术规范》SL 360-2006" />
    </div>
  );
}

// ── 主组件 ──
export function MonitoringNetworkTab() {
  const [activePanel, setActivePanel] = useState<number>(0);
  const [areaId, setAreaId] = useState<string>(PRESET_MONITORING_AREAS[0].id);

  const area = useMemo(
    () => PRESET_MONITORING_AREAS.find(a => a.id === areaId) ?? PRESET_MONITORING_AREAS[0],
    [areaId],
  );

  const comprehensive = useMemo(() => calcComprehensiveAssessment(area), [area]);

  const panels = [
    { key: 0, label: '密度分析', icon: Grid3x3 },
    { key: 1, label: '空间覆盖', icon: MapPin },
    { key: 2, label: '频率优化', icon: Activity },
    { key: 3, label: '有效性评价', icon: Gauge },
    { key: 4, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 预设区域选择 */}
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-gw-blue" />
          <h4 className="text-sm font-semibold text-gw-text">选择监测区域</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_MONITORING_AREAS.map(a => (
            <button
              key={a.id}
              onClick={() => setAreaId(a.id)}
              className={`p-2 rounded-lg text-left transition-all ${
                areaId === a.id
                  ? 'bg-gw-blue/20 border border-gw-blue/40 text-gw-highlight'
                  : 'bg-gw-surface border border-gw-border text-gw-muted hover:border-gw-blue/20'
              }`}
            >
              <div className="text-xs font-medium">{a.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">
                {AQUIFER_LABELS[a.aquiferType]} · {a.wells.length}口
              </div>
            </button>
          ))}
        </div>
      </TechCard>

      {/* 综合评分 */}
      <TechCard>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">综合评分</div>
            <div className={`text-2xl font-bold ${comprehensive.overallScore >= 80 ? 'text-green-400' : comprehensive.overallScore >= 65 ? 'text-cyan-400' : comprehensive.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {comprehensive.overallScore}
            </div>
            <div className="text-[10px] text-gw-muted">/ 100</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">评价等级</div>
            <div className={`text-2xl font-bold ${comprehensive.grade === '优' ? 'text-green-400' : comprehensive.grade === '良' ? 'text-cyan-400' : comprehensive.grade === '中' ? 'text-amber-400' : 'text-red-400'}`}>
              {comprehensive.grade}
            </div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">密度覆盖率</div>
            <div className="text-lg font-bold text-cyan-400">{comprehensive.density.coverageRatio.toFixed(0)}%</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">空间覆盖率</div>
            <div className="text-lg font-bold text-purple-400">{comprehensive.coverage.coveragePercent.toFixed(0)}%</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">效率评分</div>
            <div className="text-lg font-bold text-amber-400">{comprehensive.effectiveness.efficiencyScore}</div>
          </div>
        </div>

        {comprehensive.suggestions.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-[10px] text-gw-muted mb-1">优化建议：</div>
            {comprehensive.suggestions.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-gw-text">
                <span className="text-gw-blue mt-0.5">{idx + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {/* 面板内容 */}
      {activePanel === 0 && <DensityPanel area={area} />}
      {activePanel === 1 && <CoveragePanel area={area} />}
      {activePanel === 2 && <FrequencyPanel area={area} />}
      {activePanel === 3 && <EffectivenessPanel area={area} />}
      {activePanel === 4 && <ReferencePanel />}
    </div>
  );
}
