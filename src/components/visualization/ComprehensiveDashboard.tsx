/**
 * ComprehensiveDashboard — V-04 综合数据仪表盘
 *
 * 汇总全平台核心指标的可视化仪表盘：
 *   - 关键指标卡片（水位趋势/水质达标率/开采量/环境风险）
 *   - 迷你趋势图（Sparkline）
 *   - 城市对比排行
 *   - 多维雷达图
 *   - 预警状态摘要
 */

import { useState, useMemo } from 'react';
import { Droplets, Gauge, Shield, AlertTriangle, TrendingDown, TrendingUp, Activity, MapPin } from 'lucide-react';
import { TechCard } from '../UI';
import { cityCenters } from '../../data/mapData';
import { waterLevelContour, waterQualityContour } from '../../data/contourData';

// ── 类型 ──

interface MetricCard {
  key: string;
  label: string;
  value: string;
  unit: string;
  trend: number;
  trendLabel: string;
  icon: typeof Droplets;
  color: string;
  sparkline: number[];
}

interface CityMetric {
  city: string;
  waterLevel: number;
  waterQuality: number;
  riskScore: number;
  extraction: number;
}

// ── 辅助函数 ──

function Sparkline({ data, color, width = 80, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const trendUp = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={areaPath} fill={color} fillOpacity="0.1" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
      {trendUp ? (
        <TrendingUp size={10} className="text-emerald-400" x={width + 2} y={height / 2 - 5} />
      ) : (
        <TrendingDown size={10} className="text-red-400" x={width + 2} y={height / 2 - 5} />
      )}
    </svg>
  );
}

function RadarChart({ data, size = 200 }: { data: { label: string; value: number; max: number }[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const grid = [0.25, 0.5, 0.75, 1.0];

  const pointAt = (i: number, r: number) => ({
    x: cx + r * Math.cos(-Math.PI / 2 + i * angleStep),
    y: cy + r * Math.sin(-Math.PI / 2 + i * angleStep),
  });

  const dataPoints = data.map((d, i) => {
    const ratio = d.value / d.max;
    return pointAt(i, radius * Math.max(0.05, Math.min(1, ratio)));
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size}>
      {/* 网格 */}
      {grid.map((g, gi) => {
        const pts = data.map((_, i) => pointAt(i, radius * g));
        return (
          <polygon
            key={gi}
            points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            fill="none"
            stroke="#1e293b"
            strokeWidth="0.5"
          />
        );
      })}
      {/* 轴线 */}
      {data.map((_, i) => {
        const p = pointAt(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="0.5" />;
      })}
      {/* 数据多边形 */}
      <path d={dataPath} fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1.5" />
      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#06b6d4" stroke="#fff" strokeWidth="0.5" />
      ))}
      {/* 标签 */}
      {data.map((d, i) => {
        const p = pointAt(i, radius + 18);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            fontSize="9"
            fill="#94a3b8"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── 主组件 ──

export function ComprehensiveDashboard() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // 构建城市指标数据
  const cityMetrics: CityMetric[] = useMemo(() => {
    return Object.entries(cityCenters).map(([city, _coord]) => {
      const wl = waterLevelContour.points.find(p => p.city === city);
      const wq = waterQualityContour.points.find(p => p.city === city);
      const waterLevel = wl?.value ?? 30;
      const waterQuality = wq?.value ?? 3;
      // 简化的风险评分（水位越深+水质越差=风险越高）
      const riskScore = Math.min(100, (waterLevel / 80) * 50 + (waterQuality / 5) * 50);
      // 简化的开采量（基于城市和水位）
      const extraction = Math.round((100 - waterLevel) * 0.8 + Math.random() * 20);
      return { city, waterLevel, waterQuality, riskScore, extraction };
    });
  }, []);

  // 关键指标卡片
  const metrics: MetricCard[] = useMemo(() => [
    {
      key: 'waterLevel',
      label: '平均水位埋深',
      value: (cityMetrics.reduce((s, c) => s + c.waterLevel, 0) / cityMetrics.length).toFixed(1),
      unit: 'm',
      trend: -2.3,
      trendLabel: '较上年',
      icon: Droplets,
      color: '#3b82f6',
      sparkline: [28, 30, 32, 35, 33, 36, 38, 40, 42, 40],
    },
    {
      key: 'waterQuality',
      label: '水质达标率',
      value: ((cityMetrics.filter(c => c.waterQuality <= 3).length / cityMetrics.length) * 100).toFixed(0),
      unit: '%',
      trend: -5.2,
      trendLabel: '较上年',
      icon: Gauge,
      color: '#22c55e',
      sparkline: [85, 82, 80, 78, 76, 75, 73, 72, 70, 68],
    },
    {
      key: 'extraction',
      label: '地下水开采量',
      value: (cityMetrics.reduce((s, c) => s + c.extraction, 0) / 10).toFixed(1),
      unit: '亿m³',
      trend: -8.5,
      trendLabel: '较上年',
      icon: Activity,
      color: '#f59e0b',
      sparkline: [120, 115, 110, 108, 105, 102, 98, 95, 92, 90],
    },
    {
      key: 'risk',
      label: '环境风险指数',
      value: (cityMetrics.reduce((s, c) => s + c.riskScore, 0) / cityMetrics.length).toFixed(0),
      unit: '/100',
      trend: 3.1,
      trendLabel: '较上年',
      icon: Shield,
      color: '#ef4444',
      sparkline: [35, 38, 40, 42, 45, 48, 50, 52, 55, 58],
    },
  ], [cityMetrics]);

  // 雷达图数据
  const radarData = useMemo(() => {
    const city = selectedCity
      ? cityMetrics.find(c => c.city === selectedCity)
      : {
        waterLevel: cityMetrics.reduce((s, c) => s + c.waterLevel, 0) / cityMetrics.length,
        waterQuality: cityMetrics.reduce((s, c) => s + c.waterQuality, 0) / cityMetrics.length,
        riskScore: cityMetrics.reduce((s, c) => s + c.riskScore, 0) / cityMetrics.length,
        extraction: cityMetrics.reduce((s, c) => s + c.extraction, 0) / cityMetrics.length,
      };

    return [
      { label: '水位', value: (city?.waterLevel ?? 30), max: 80 },
      { label: '水质', value: (city?.waterQuality ?? 3) * 20, max: 100 },
      { label: '开采', value: (city?.extraction ?? 50), max: 100 },
      { label: '风险', value: (city?.riskScore ?? 40), max: 100 },
      { label: '补给', value: 65, max: 100 },
      { label: '恢复', value: 55, max: 100 },
    ];
  }, [selectedCity, cityMetrics]);

  // 城市排行（按风险评分排序）
  const sortedCities = useMemo(() => [...cityMetrics].sort((a, b) => b.riskScore - a.riskScore), [cityMetrics]);

  // 预警状态
  const warnings = useMemo(() => {
    const high = cityMetrics.filter(c => c.riskScore > 60);
    const medium = cityMetrics.filter(c => c.riskScore > 40 && c.riskScore <= 60);
    return { high, medium, total: cityMetrics.length };
  }, [cityMetrics]);

  return (
    <div className="space-y-4">
      {/* 指标卡片行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => {
          const Icon = m.icon;
          const isPositiveTrend = m.trend > 0;
          const trendColor = m.key === 'risk' ? (isPositiveTrend ? 'text-red-400' : 'text-emerald-400')
            : m.key === 'waterLevel' ? (isPositiveTrend ? 'text-red-400' : 'text-emerald-400')
            : (isPositiveTrend ? 'text-emerald-400' : 'text-red-400');
          return (
            <div key={m.key} className="p-3 rounded-lg bg-gw-card border border-gw-border/30">
              <div className="flex items-center justify-between mb-2">
                <Icon size={16} style={{ color: m.color }} />
                <Sparkline data={m.sparkline} color={m.color} />
              </div>
              <div className="text-2xl font-bold text-gw-text">
                {m.value}
                <span className="text-xs text-gw-muted ml-1">{m.unit}</span>
              </div>
              <div className="text-[10px] text-gw-muted mt-0.5">{m.label}</div>
              <div className={`text-[9px] mt-1 ${trendColor}`}>
                {isPositiveTrend ? '+' : ''}{m.trend}% {m.trendLabel}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 雷达图 */}
        <TechCard className="lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              多维评估
            </h3>
            <select
              value={selectedCity ?? ''}
              onChange={e => setSelectedCity(e.target.value || null)}
              className="px-2 py-1 rounded bg-gw-surface border border-gw-border/30 text-gw-text text-[10px]"
            >
              <option value="">全省平均</option>
              {Object.entries(cityCenters).map(([city]) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-center">
            <RadarChart data={radarData} size={220} />
          </div>
          <div className="mt-2 text-center text-[10px] text-gw-muted">
            {selectedCity ? `${selectedCity}市` : '河北省平均'} · 六维指标
          </div>
        </TechCard>

        {/* 城市风险排行 */}
        <TechCard className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-cyan-400" />
            城市风险排行
          </h3>
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
            {sortedCities.map((c, i) => {
              const riskColor = c.riskScore > 60 ? '#ef4444' : c.riskScore > 40 ? '#f59e0b' : '#22c55e';
              return (
                <div
                  key={c.city}
                  onClick={() => setSelectedCity(selectedCity === c.city ? null : c.city)}
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${
                    selectedCity === c.city ? 'bg-gw-blue/10' : ''
                  }`}
                >
                  <span className="text-[10px] text-gw-muted w-4 text-center">{i + 1}</span>
                  <span className="text-[11px] text-gw-text w-12">{c.city}</span>
                  <div className="flex-1">
                    <ProgressBar value={c.riskScore} max={100} color={riskColor} />
                  </div>
                  <span className="text-[10px] font-mono text-gw-text w-8 text-right">{c.riskScore.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </TechCard>

        {/* 预警摘要 */}
        <TechCard className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber-400" />
            预警状态摘要
          </h3>
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-red-400 font-medium">高风险</span>
                <span className="text-lg font-bold text-red-400">{warnings.high.length}</span>
              </div>
              <div className="text-[9px] text-gw-muted mt-1">
                {warnings.high.length > 0 ? warnings.high.map(c => c.city).join('、') : '无'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-medium">中风险</span>
                <span className="text-lg font-bold text-amber-400">{warnings.medium.length}</span>
              </div>
              <div className="text-[9px] text-gw-muted mt-1">
                {warnings.medium.length > 0 ? warnings.medium.map(c => c.city).join('、') : '无'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-medium">低风险</span>
                <span className="text-lg font-bold text-emerald-400">{warnings.total - warnings.high.length - warnings.medium.length}</span>
              </div>
              <div className="text-[9px] text-gw-muted mt-1">
                监测城市总数: {warnings.total}
              </div>
            </div>

            {/* 水位趋势条 */}
            <div className="pt-2 border-t border-gw-border/20">
              <div className="text-[9px] text-gw-muted mb-1">水位下降趋势 (近5年)</div>
              <div className="flex items-end gap-1 h-10">
                {[85, 78, 70, 62, 55].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-blue-500/30 to-cyan-400/60"
                    style={{ height: `${v}%` }}
                    title={`${2021 + i}年: 下降${(85 - v) * 0.1}m`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-gw-muted/50 mt-0.5">
                <span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span>
              </div>
            </div>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
