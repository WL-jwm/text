import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  AreaChart, Area,
} from 'recharts';
import { TechCard, StatCard } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import {
  type BalanceSummary,
  calcBalance, fmt,
  EXTRACTION_TREND,
  calcExtractionTrendSummary,
} from '../../utils/balanceCalculator';
import { TOOLTIP_STYLE, CHART_COLORS, OVERDRAFT_COLORS, RECHARGE_ITEM_NAMES } from './balanceConstants';

export function EditCell({
  value, onChange, width,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  width?: string;
}) {
  return (
    <input
      type="number"
      step="0.01"
      value={value ?? 0}
      onChange={e => onChange(Number(e.target.value) || 0)}
      className={`w-full bg-transparent border border-gw-border/30 rounded px-1.5 py-0.5 text-xs text-center
        focus:border-gw-blue/50 focus:outline-none focus:ring-1 focus:ring-gw-blue/30
        ${width ?? 'w-24'}`}
    />
  );
}

export function SummaryCards({ summary }: { summary: BalanceSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard
        title="总补给量"
        value={`${fmt(summary.totalRecharge)}`}
        unit="亿m\u00b3/a"
        subtitle={`合计${summary.totalArea.toLocaleString()} km\u00b2`}
        accent="blue"
      />
      <StatCard
        title="总排泄量"
        value={`${fmt(summary.totalDischarge)}`}
        unit="亿m\u00b3/a"
        subtitle={`均衡差 ${fmt(summary.totalBalance)}`}
        accent="red"
      />
      <StatCard
        title="均衡状态"
        value={`${summary.totalSurplusCities + summary.totalBalancedCities} / ${summary.totalSurplusCities + summary.totalBalancedCities + summary.totalOverdraftCities}`}
        subtitle="盈余/均衡 / 亏损"
        accent="cyan"
      />
      <StatCard
        title="平均开采系数"
        value={fmt(summary.avgExploitationCoeff)}
        subtitle={summary.avgExploitationCoeff > 1 ? '开采量 > 补给量' : '开采量 < 补给量'}
        accent={summary.avgExploitationCoeff > 1 ? 'red' : 'green'}
      />
      <StatCard
        title="省级均衡差"
        value={`${fmt(summary.totalBalance)}`}
        unit="亿m\u00b3/a"
        subtitle={summary.totalBalance >= 0 ? '采补平衡' : '超采'}
        accent={summary.totalBalance >= 0 ? 'emerald' : 'orange'}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 图表子组件
// ═══════════════════════════════════════════════════════

/** 图表1: 各市补给vs排泄分组柱状图（增强：图例切换+hover详情） */

export function RechargeDischargeBarChart({ barData }: {
  barData: Array<{ name: string; 补给量: number; 排泄量: number; 均衡差: number }>;
}) {
  return (
    <LazyChartCard title="各市补给-排泄对比" height={320}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={barData} filename="各市补给排泄对比" sheetName="补排对比" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="补给量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="排泄量" fill="#ef4444" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </LazyChartCard>
  );
}

/** 图表2: 均衡差柱状图（正绿负红+零线标注） */

export function BalanceDiffChart({ barData }: {
  barData: Array<{ name: string; 均衡差: number }>;
}) {
  return (
    <LazyChartCard title="各市均衡差（正=盈余/负=亏损）" height={320}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={barData} filename="各市均衡差" sheetName="均衡差" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip {...TOOLTIP_STYLE} />
          {/* 参考线 y=0 */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <Bar dataKey="均衡差">
            {barData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.均衡差 >= 0 ? '#10b981' : '#ef4444'}
                opacity={Math.min(1, Math.abs(entry.均衡差) / 10 + 0.3)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-emerald-500 inline-block" />盈余</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-500 inline-block" />亏损</span>
        <span>颜色越深=绝对值越大</span>
      </div>
    </LazyChartCard>
  );
}

/** 图表3: 补给结构饼图（增强：内环+外环双层） */

export function RechargePieChart({ pieData }: {
  pieData: Array<{ name: string; value: number }>;
}) {
  return (
    <LazyChartCard title="补给项结构（全省汇总）" height={320}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={pieData} filename="补给项结构" sheetName="补给结构" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={95}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            labelLine={{ stroke: '#6b7280' }}
          >
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value: number) => [`${fmt(value)} 亿m\u00b3/a`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </LazyChartCard>
  );
}

/** 图表4: 排泄结构饼图 */

export function DischargePieChart({ pieData }: {
  pieData: Array<{ name: string; value: number }>;
}) {
  return (
    <LazyChartCard title="排泄项结构（全省汇总）" height={320}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={pieData} filename="排泄项结构" sheetName="排泄结构" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={95}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            labelLine={{ stroke: '#6b7280' }}
          >
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value: number) => [`${fmt(value)} 亿m\u00b3/a`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </LazyChartCard>
  );
}

/** 图表5（新增）: 开采系数分布（水平条带+安全阈值线） */

export function ExploitCoeffChart({ coeffData }: {
  coeffData: Array<{ name: string; 开采系数: number; status: string }>;
}) {
  return (
    <LazyChartCard title="开采系数分布（安全阈值参考线）" height={340}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={coeffData} filename="开采系数分布" sheetName="开采系数" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={coeffData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[0, 'auto']} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} width={55} />
          <Tooltip {...TOOLTIP_STYLE} />
          {/* 安全阈值参考线 */}
          <ReferenceLine x={0.6} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine x={0.8} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine x={1.0} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Bar dataKey="开采系数" radius={[0, 3, 3, 0]} barSize={14} name="开采系数 \u03b1">
            {coeffData.map((entry) => (
              <Cell key={entry.name} fill={OVERDRAFT_COLORS[entry.status] || '#64748b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" />安全(&le;0.6)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />警戒(0.6-0.8)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" />超采(0.8-1.0)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" />严重(&gt;1.0)</span>
      </div>
    </LazyChartCard>
  );
}

/** 图表6（新增）: 开采模数vs补给模数散点图（气泡=面积） */

export function ModulusScatterChart({ scatterData }: {
  scatterData: Array<{ name: string; 开采模数: number; 补给模数: number; area: number; status: string }>;
}) {
  return (
    <LazyChartCard title="开采模数 vs 补给模数（气泡大小=面积）" height={360}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={scatterData} filename="开采补给模数散点" sheetName="模数散点" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="补给模数" name="补给模数" tick={{ fontSize: 11, fill: '#9ca3af' }}
            label={{ value: '补给模数 (万m\u00b3/km\u00b2\u00b7a)', position: 'bottom', offset: 0, fontSize: 10, fill: '#9ca3af' }} />
          <YAxis dataKey="开采模数" name="开采模数" tick={{ fontSize: 11, fill: '#9ca3af' }}
            label={{ value: '开采模数 (万m\u00b3/km\u00b2\u00b7a)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#9ca3af' }} />
          <ZAxis dataKey="area" range={[60, 600]} name="面积" />
          <Tooltip {...TOOLTIP_STYLE} />
          <Scatter data={scatterData} name="城市" fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
      {/* 对角线参考说明 */}
      <div className="text-center text-[10px] text-gw-muted mt-1">
        对角线以上 = 开采模数 &gt; 补给模数（超采区域）| 气泡越大 = 计算面积越大
      </div>
    </LazyChartCard>
  );
}

/** 图表7（新增）: 超采量排名（仅超采城市，水平柱状图） */

export function OverdraftRankChart({ overdraftData }: {
  overdraftData: Array<{ name: string; 超采量: number; 开采系数: number }>;
}) {
  if (overdraftData.length === 0) {
    return (
      <TechCard title="超采量排名">
        <p className="text-sm text-gw-muted text-center py-8">无超采城市，所有城市开采量均未超出补给量</p>
      </TechCard>
    );
  }
  return (
    <LazyChartCard title="超采量排名（仅列出超采城市）" height={Math.max(280, overdraftData.length * 36 + 60)}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={overdraftData} filename="超采量排名" sheetName="超采排名" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={Math.max(220, overdraftData.length * 36)}>
        <BarChart data={overdraftData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} width={55} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="超采量" radius={[0, 3, 3, 0]} barSize={16} name="超采量 (亿m\u00b3/a)">
            {overdraftData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.开采系数 > 1.0 ? '#ef4444' : '#f97316'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </LazyChartCard>
  );
}

/** 图表8（新增）: 补给结构占比热力表 */

export function RechargeHeatmapTable({ results }: {
  results: ReturnType<typeof calcBalance>[];
}) {
  const validResults = results.filter(r => r.city);

  // 计算每个城市每项补给占比
  const rows = useMemo(() =>
    validResults.map(r => {
      const row: Record<string, string | number> = { city: r.city, total: r.totalRecharge };
      RECHARGE_ITEM_NAMES.forEach(name => {
        const item = r.rechargeItems.find(i => i.name === name);
        row[name] = item ? item.value : 0;
      });
      return row;
    }),
    [validResults],
  );

  // 颜色插值
  const getColor = (value: number, maxVal: number): string => {
    if (maxVal === 0 || value === 0) return 'rgba(59,130,246,0.05)';
    const ratio = Math.min(1, value / maxVal);
    const alpha = 0.15 + ratio * 0.65;
    return `rgba(59,130,246,${alpha.toFixed(2)})`;
  };

  const maxValues = useMemo(() => {
    const maxes: Record<string, number> = {};
    RECHARGE_ITEM_NAMES.forEach(name => {
      maxes[name] = Math.max(...validResults.map(r => {
        const item = r.rechargeItems.find(i => i.name === name);
        return item ? item.value : 0;
      }));
    });
    return maxes;
  }, [validResults]);

  return (
    <TechCard title="补给结构热力表（城市\u00d7补给项）" badge={`${validResults.length}市`}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gw-border">
              <th className="text-left p-1.5 text-gw-muted sticky left-0 bg-gw-card z-10">城市</th>
              {RECHARGE_ITEM_NAMES.map(name => (
                <th key={name} className="p-1.5 text-center text-gw-muted whitespace-nowrap">{name}</th>
              ))}
              <th className="p-1.5 text-center text-blue-400 font-medium">合计</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.city as string} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                <td className="p-1.5 text-gw-text font-medium sticky left-0 bg-gw-card z-10 whitespace-nowrap">{row.city as string}</td>
                {RECHARGE_ITEM_NAMES.map(name => {
                  const val = row[name] as number;
                  return (
                    <td key={name} className="p-1.5 text-center" style={{ backgroundColor: getColor(val, maxValues[name]) }}>
                      <span className="font-mono text-gw-text">{val > 0 ? val.toFixed(2) : '-'}</span>
                    </td>
                  );
                })}
                <td className="p-1.5 text-center font-mono font-semibold text-blue-400">{(row.total as number).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-gw-muted">
        <span>色阶：</span>
        <div className="flex gap-0.5">
          {[0.15, 0.35, 0.55, 0.75, 0.80].map(a => (
            <span key={a} className="w-6 h-3 rounded-sm inline-block" style={{ backgroundColor: `rgba(59,130,246,${a.toFixed(2)})` }} />
          ))}
        </div>
        <span>低 → 高</span>
      </div>
    </TechCard>
  );
}


// ── 开采量趋势图 ──

/** 图表9（新增）: 总开采量年度趋势（堆叠面积：浅层+深层） */

export function ExtractionTrendChart() {
  const trendData = EXTRACTION_TREND;
  const trendSummary = useMemo(() => calcExtractionTrendSummary(trendData), [trendData]);

  // 用途结构数据
  const usageData = useMemo(() =>
    trendData.map(d => ({
      year: d.year,
      '农业灌溉': Math.round(d.totalExtraction * d.agriRatio * 10) / 10,
      '工业': Math.round(d.totalExtraction * d.industrialRatio * 10) / 10,
      '生活': Math.round(d.totalExtraction * d.domesticRatio * 10) / 10,
      '生态': Math.round(d.totalExtraction * d.ecologicalRatio * 10) / 10,
    })),
    [trendData],
  );

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          title="峰值开采量"
          value={`${trendSummary.peakValue}`}
          unit="亿m\u00b3/a"
          subtitle={`${trendSummary.peakYear}年`}
          accent="red"
        />
        <StatCard
          title="最新开采量"
          value={`${trendSummary.latestValue}`}
          unit="亿m\u00b3/a"
          subtitle={`${trendSummary.latestYear}年`}
          accent="blue"
        />
        <StatCard
          title="累计压减量"
          value={`${trendSummary.totalReduction.toFixed(1)}`}
          unit="亿m\u00b3"
          subtitle={`降幅 ${(trendSummary.reductionRate * 100).toFixed(1)}%`}
          accent="emerald"
        />
        <StatCard
          title="年均压减"
          value={`${trendSummary.avgAnnualReduction.toFixed(2)}`}
          unit="亿m\u00b3/a"
          subtitle="压采政策效果"
          accent="cyan"
        />
        <StatCard
          title="浅/深层贡献"
          value={`${trendSummary.shallowReduction.toFixed(0)}`}
          unit={`/ ${trendSummary.deepReduction.toFixed(0)}`}
          subtitle="浅层/深层压减量"
          accent="violet"
        />
      </div>

      {/* 双图布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 总开采量堆叠面积图 */}
        <LazyChartCard title="地下水开采量年度趋势（浅层+深层）" height={380}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={trendData} filename="开采量年度趋势" sheetName="趋势数据" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={trendData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gShallow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gDeep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['dataMin - 10', 'dataMax + 10']} unit=" 亿m\u00b3" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="shallowExtraction" name="浅层水" stackId="1" stroke="#3b82f6" fill="url(#gShallow)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="deepExtraction" name="深层水" stackId="1" stroke="#8b5cf6" fill="url(#gDeep)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />浅层水</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500 inline-block" />深层水</span>
            <span>2003年峰值170.2亿m\u00b3 → 2024年107.8亿m\u00b3</span>
          </div>
        </LazyChartCard>

        {/* 用途结构面积图 */}
        <LazyChartCard title="开采量用途结构变化（2000-2024）" height={380}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={usageData} filename="开采量用途结构" sheetName="用途结构" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={usageData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gAgri" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gIndus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gDom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gEco" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" 亿m\u00b3" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="农业灌溉" stackId="usage" stroke="#f59e0b" fill="url(#gAgri)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="工业" stackId="usage" stroke="#6366f1" fill="url(#gIndus)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="生活" stackId="usage" stroke="#06b6d4" fill="url(#gDom)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="生态" stackId="usage" stroke="#10b981" fill="url(#gEco)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />农业</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" />工业</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500 inline-block" />生活</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" />生态</span>
          </div>
        </LazyChartCard>
      </div>

      {/* 压采政策里程碑 */}
      <TechCard title="压采政策里程碑">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { year: '2000', event: '历史峰值区间', detail: '年均开采170亿m\u00b3，深层超采严重', color: '#ef4444' },
            { year: '2014', event: '国家地下水超采综合治理', detail: '河北率先启动压采试点', color: '#f59e0b' },
            { year: '2019', event: '南水北调中线通水5年', detail: '城镇供水替代深层水开采', color: '#3b82f6' },
            { year: '2024', event: '压采成效显著', detail: '降至107.8亿m\u00b3，降幅36.7%', color: '#10b981' },
          ].map(m => (
            <div key={m.year} className="flex items-start gap-3 p-3 rounded-lg bg-gw-surface">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: m.color }}>
                  {m.year}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gw-text">{m.event}</div>
                <div className="text-[10px] text-gw-muted mt-0.5">{m.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
