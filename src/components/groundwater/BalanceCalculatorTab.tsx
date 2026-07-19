/**
 * B-07增强 地下水均衡计算器 Tab
 *
 * 图表增强：
 *  - 原有4图（补排对比柱状图/均衡差柱状图/补给饼图/排泄饼图）增加交互
 *  + 开采系数分布图（水平条带）
 *  + 补排堆叠面积图（逐城市补给结构+排泄层）
 *  + 开采模数vs补给模数散点图（气泡=面积）
 *  + 超采量排名图
 *  + 补给结构热力表
 *  + 所有图表增加 ChartExport 导出
 */
import React, { useState, useMemo } from 'react';
import {
  Calculator, Droplets, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
} from 'recharts';
import { TechCard, StatCard } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import {
  type BalanceInput, type BalanceSummary,
  calcBalance, calcBalanceSummary,
  getPresetBalanceData, fmt,
  getBalanceStatusLabel, getOverdraftStatusLabel,
} from '../../utils/balanceCalculator';

// ── 样式常量 ──

const BALANCE_STATUS_BG: Record<string, string> = {
  surplus: 'bg-emerald-500/15 text-emerald-400',
  balanced: 'bg-blue-500/15 text-blue-400',
  deficit: 'bg-amber-500/15 text-amber-400',
  severe: 'bg-red-500/15 text-red-400',
};

const OVERDRAFT_STATUS_BG: Record<string, string> = {
  safe: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  over: 'bg-orange-500/15 text-orange-400',
  critical: 'bg-red-500/15 text-red-400',
};

const OVERDRAFT_COLORS: Record<string, string> = {
  safe: '#10b981',
  warning: '#f59e0b',
  over: '#f97316',
  critical: '#ef4444',
};

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#ef4444', '#14b8a6', '#f97316'];

const RECHARGE_ITEM_NAMES = ['降水入渗', '侧向径流', '河道渗漏', '渠系渗漏', '灌溉入渗', '越流补给', '其他补给'];

// ── 空输入模板 ──

const emptyInput: BalanceInput = {
  city: '', area: 0,
  precipitationInfiltration: 0, lateralRecharge: 0, riverLeakage: 0,
  canalLeakage: 0, irrigationRecharge: 0, crossFlowRecharge: 0, otherRecharge: 0,
  extraction: 0, evaporation: 0, crossFlowDischarge: 0,
  lateralDischarge: 0, springDischarge: 0,
};

// ── 可编辑字段定义 ──

interface FieldDef {
  key: keyof BalanceInput;
  label: string;
  group: 'info' | 'recharge' | 'discharge';
  width?: string;
}

const FIELDS: FieldDef[] = [
  { key: 'city', label: '城市', group: 'info', width: 'w-20' },
  { key: 'area', label: '面积(km\u00b2)', group: 'info', width: 'w-20' },
  { key: 'precipitationInfiltration', label: '降水入渗', group: 'recharge' },
  { key: 'lateralRecharge', label: '侧向径流', group: 'recharge' },
  { key: 'riverLeakage', label: '河道渗漏', group: 'recharge' },
  { key: 'canalLeakage', label: '渠系渗漏', group: 'recharge' },
  { key: 'irrigationRecharge', label: '灌溉入渗', group: 'recharge' },
  { key: 'crossFlowRecharge', label: '越流补给', group: 'recharge' },
  { key: 'otherRecharge', label: '其他补给', group: 'recharge' },
  { key: 'extraction', label: '人工开采', group: 'discharge' },
  { key: 'evaporation', label: '潜水蒸发', group: 'discharge' },
  { key: 'crossFlowDischarge', label: '越流排泄', group: 'discharge' },
  { key: 'lateralDischarge', label: '侧向排泄', group: 'discharge' },
  { key: 'springDischarge', label: '泉排泄', group: 'discharge' },
  { key: 'allowableExtraction', label: '允许开采', group: 'discharge' },
];

// ── 可编辑单元格 ──

function EditCell({
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

// ── Tooltip 统一样式 ──

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

// ── 汇总卡片 ──

function SummaryCards({ summary }: { summary: BalanceSummary }) {
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
function RechargeDischargeBarChart({ barData }: {
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
function BalanceDiffChart({ barData }: {
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
function RechargePieChart({ pieData }: {
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
function DischargePieChart({ pieData }: {
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
function ExploitCoeffChart({ coeffData }: {
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
function ModulusScatterChart({ scatterData }: {
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
function OverdraftRankChart({ overdraftData }: {
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
function RechargeHeatmapTable({ results }: {
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

// ── 主组件 ──

export function BalanceCalculatorTab() {
  const [_usePreset, _setUsePreset] = useState(true);
  const [inputs, setInputs] = useState<BalanceInput[]>(() => getPresetBalanceData());

  // 计算结果
  const results = useMemo(() => inputs.map(calcBalance), [inputs]);
  const summary = useMemo(() => calcBalanceSummary(results), [results]);

  // 更新单个字段
  const updateField = (rowIdx: number, key: keyof BalanceInput, value: number | string) => {
    setInputs(prev => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [key]: value };
      return next;
    });
  };

  const addRow = () => {
    setInputs(prev => [...prev, { ...emptyInput, city: `新增${prev.length + 1}` }]);
  };

  const removeRow = (idx: number) => {
    setInputs(prev => prev.filter((_, i) => i !== idx));
  };

  // ── 图表数据准备 ──

  // 柱状图数据
  const barChartData = useMemo(() =>
    results.filter(r => r.city).map(r => ({
      name: r.city,
      补给量: r.totalRecharge,
      排泄量: r.totalDischarge,
      均衡差: r.balance,
    })),
    [results],
  );

  // 饼图数据
  const rechargePieData = useMemo(() =>
    summary.rechargeBreakdown.filter(r => r.value > 0),
    [summary],
  );
  const dischargePieData = useMemo(() =>
    summary.dischargeBreakdown.filter(r => r.value > 0),
    [summary],
  );

  // 开采系数分布数据（按系数排序）
  const coeffData = useMemo(() =>
    results.filter(r => r.city)
      .map(r => ({ name: r.city, 开采系数: r.exploitationCoefficient, status: r.overdraftStatus }))
      .sort((a, b) => b.开采系数 - a.开采系数),
    [results],
  );

  // 开采/补给模数散点数据
  const scatterData = useMemo(() =>
    results.filter(r => r.city && r.area > 0)
      .map(r => ({
        name: r.city,
        开采模数: r.exploitationModulus,
        补给模数: r.rechargeModulus,
        area: r.area,
        status: r.overdraftStatus,
      })),
    [results],
  );

  // 超采量排名数据（仅超采城市）
  const overdraftData = useMemo(() =>
    results.filter(r => r.city && r.overdraftAmount > 0)
      .map(r => ({
        name: r.city,
        超采量: Math.abs(r.overdraftAmount),
        开采系数: r.exploitationCoefficient,
      }))
      .sort((a, b) => b.超采量 - a.超采量),
    [results],
  );

  return (
    <div className="space-y-4">
      {/* 公式说明 */}
      <TechCard icon={Calculator} badge="计算引擎">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gw-muted">
          <span>{"\u0394W = \u03a3补给 - \u03a3排泄"}</span>
          <span>{"\u03b1 = Q开采 / Q补给"}</span>
          <span>{"M = Q开采 / F (万m\u00b3/km\u00b2\u00b7a)"}</span>
          <span>{"Mr = Q补给 / F (万m\u00b3/km\u00b2\u00b7a)"}</span>
          <span className="text-gw-muted/60">单位: 补给/排泄为 亿m\u00b3/a, 面积为 km\u00b2</span>
        </div>
      </TechCard>

      {/* 汇总卡片 */}
      <SummaryCards summary={summary} />

      {/* 输入表 */}
      <TechCard icon={Droplets} badge="输入参数">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border/30">
                <th className="sticky left-0 bg-gw-card z-10 px-2 py-1.5 text-gw-muted font-medium" />
                {FIELDS.map(f => (
                  <th key={f.key} className={`px-1.5 py-1.5 text-gw-muted font-medium text-center ${f.key === 'city' ? 'sticky left-8 bg-gw-card z-10' : ''}`}>
                    <div className={f.group === 'recharge' ? 'text-blue-400' : f.group === 'discharge' ? 'text-red-400' : 'text-gw-muted'}>
                      {f.label}
                    </div>
                  </th>
                ))}
                <th className="px-1.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {inputs.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gw-border/15 hover:bg-gw-surface/40">
                  <td className="sticky left-0 bg-gw-card z-10 px-2 py-1 text-gw-muted">{rowIdx + 1}</td>
                  {FIELDS.map(f => (
                    <td key={f.key} className={`px-1 py-1 text-center ${f.key === 'city' ? 'sticky left-8 bg-gw-card z-10' : ''}`}>
                      {f.key === 'city' ? (
                        <input
                          type="text"
                          value={row.city}
                          onChange={e => updateField(rowIdx, 'city', e.target.value)}
                          className="w-20 bg-transparent border border-gw-border/30 rounded px-1 py-0.5 text-xs text-center focus:border-gw-blue/50 focus:outline-none"
                        />
                      ) : (
                        <EditCell
                          value={row[f.key] as number | undefined}
                          onChange={v => updateField(rowIdx, f.key, v)}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-1 py-1">
                    <button
                      onClick={() => removeRow(rowIdx)}
                      className="text-gw-muted/40 hover:text-red-400 transition-colors"
                      title="删除此行"
                    >
                      {"\u00d7"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={addRow}
            className="px-3 py-1 rounded text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all"
          >
            + 添加行
          </button>
          <button
            onClick={() => setInputs(getPresetBalanceData())}
            className="px-3 py-1 rounded text-xs bg-gw-surface text-gw-muted border border-gw-border/30 hover:bg-gw-border/30 transition-all"
          >
            恢复预设
          </button>
        </div>
      </TechCard>

      {/* 计算结果表 */}
      <TechCard icon={Activity} badge="计算结果">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border/30">
                <th className="px-2 py-1.5 text-gw-muted font-medium text-left sticky left-0 bg-gw-card z-10">城市</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center text-blue-400">补给量</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center text-red-400">排泄量</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">均衡差</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">均衡状态</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">开采系数</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">超采状态</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">开采模数</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">补给模数</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">超采量</th>
              </tr>
            </thead>
            <tbody>
              {results.filter(r => r.city).map((r, i) => (
                <tr key={i} className="border-b border-gw-border/15 hover:bg-gw-surface/40">
                  <td className="px-2 py-1.5 font-medium text-left sticky left-0 bg-gw-card z-10">{r.city}</td>
                  <td className="px-2 py-1.5 text-center text-blue-400">{fmt(r.totalRecharge)}</td>
                  <td className="px-2 py-1.5 text-center text-red-400">{fmt(r.totalDischarge)}</td>
                  <td className={`px-2 py-1.5 text-center font-medium ${r.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.balance >= 0 ? '+' : ''}{fmt(r.balance)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${BALANCE_STATUS_BG[r.balanceStatus]}`}>
                      {getBalanceStatusLabel(r.balanceStatus)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center font-mono">{fmt(r.exploitationCoefficient)}</td>
                  <td className="px-2 py-1.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${OVERDRAFT_STATUS_BG[r.overdraftStatus]}`}>
                      {getOverdraftStatusLabel(r.overdraftStatus)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center">{fmt(r.exploitationModulus, 1)}</td>
                  <td className="px-2 py-1.5 text-center">{fmt(r.rechargeModulus, 1)}</td>
                  <td className={`px-2 py-1.5 text-center ${r.overdraftAmount > 0 ? 'text-red-400 font-medium' : 'text-emerald-400'}`}>
                    {r.overdraftAmount > 0 ? '+' : ''}{fmt(r.overdraftAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      {/* ═══════════════════════ 图表区域 ═══════════════════════ */}
      <div className="space-y-4">
        {/* 第一行: 补排对比 + 均衡差 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RechargeDischargeBarChart barData={barChartData} />
          <BalanceDiffChart barData={barChartData} />
        </div>

        {/* 第二行: 补给饼图 + 排泄饼图 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RechargePieChart pieData={rechargePieData} />
          <DischargePieChart pieData={dischargePieData} />
        </div>

        {/* 第三行: 开采系数分布(新增) + 开采模数散点(新增) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExploitCoeffChart coeffData={coeffData} />
          <ModulusScatterChart scatterData={scatterData} />
        </div>

        {/* 第四行: 超采量排名(新增) */}
        <OverdraftRankChart overdraftData={overdraftData} />

        {/* 第五行: 补给结构热力表(新增) */}
        <RechargeHeatmapTable results={results} />
      </div>
    </div>
  );
}
