import React, { Suspense } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine,
} from 'recharts';
import {
  Layers, Sparkles, Mountain, Flame,
} from 'lucide-react';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../../components/UI';
import { ProgressMetric } from '../../components/ComparePanel';
import { SectionAccordion } from '../../components/SectionAccordion';
import { LazyChartCard } from '../../components/LazyChartCard';
import { systemZones } from '../../data/systemZoning';
import { geothermalFields } from '../../data/geothermal';
import { mineHydrogeologyData } from '../../data/mineHydrogeology';
import { salineSoilDistribution } from '../../data/salineSoil';
import { fractureWaterTypes } from '../../data/fractureWater';
import { hydrochemicalZoning } from '../../data/hydrochemistry';
import { karstSprings } from '../../data/karstWater';
import { mineralWaterSites } from '../../data/mineralWater';
import { landSubsidence } from '../../data/environment';

// 懒加载子Tab
const OverExploitTab = React.lazy(() => import('./OverExploitTab').then(m => ({ default: m.OverExploitTab })));
const ClassicDataTab = React.lazy(() => import('./ClassicDataTab').then(m => ({ default: m.ClassicDataTab })));

interface ResourceTabProps {
  tabCount: number;
  highlight?: string;
}

/** Tab 5: 资源组合评估 */
export function ResourceTab({ tabCount, highlight }: ResourceTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="数据模块" value={tabCount + 15} unit="个" subtitle="覆盖全部领域" icon={Layers} accent="blue" />
        <StatCard title="系统分区" value={systemZones.length} unit="个" subtitle="含子区" icon={Sparkles} accent="cyan" />
        <StatCard title="地热田" value={geothermalFields.length} unit="个" subtitle="已调查" icon={Flame} accent="amber" />
        <StatCard title="矿区数据" value={mineHydrogeologyData.length} unit="条" subtitle="矿床水文地质" icon={Mountain} accent="red" />
      </div>

      {/* 资源覆盖度评估 */}
      <TechCard title="数据库资源覆盖度评估" icon={Sparkles} className="hud-corners">
        <p className="text-xs text-gw-muted mb-4">基于22个Sheet数据完整性评估各模块覆盖程度</p>
        <div className="space-y-3">
          <ProgressMetric label="基础地质" value={90} max={100} color="blue" targetLabel="含水层组+构造+地层 全覆盖" />
          <ProgressMetric label="水文地质参数" value={95} max={100} color="cyan" targetLabel="K/ne/αL/I + 含水层组参数" />
          <ProgressMetric label="水资源量" value={100} max={100} color="emerald" targetLabel="2024年公报数据已更新" />
          <ProgressMetric label="水质评价" value={100} max={100} color="emerald" targetLabel="国考断面+饮用水源 全达标" />
          <ProgressMetric label="环境地质" value={85} max={100} color="amber" targetLabel="漏斗+沉降数据，海水入侵待补充" />
          <ProgressMetric label="岩溶水" value={90} max={100} color="blue" targetLabel="泉域+分区+水化学+保护" />
          <ProgressMetric label="地热资源" value={80} max={100} color="amber" targetLabel="地热田+利用+回灌，梯度数据待补" />
          <ProgressMetric label="矿泉水" value={75} max={100} color="amber" targetLabel="产地+类型+水质，储量需更新" />
          <ProgressMetric label="盐碱土/咸水" value={80} max={100} color="amber" targetLabel="分布+类型+治理，动态监测待补充" />
          <ProgressMetric label="矿床水文地质" value={85} max={100} color="blue" targetLabel="矿区+涌水+利用，充水水源分析待深化" />
        </div>
      </TechCard>

      {/* D-1: 数据质量雷达图 + 年份覆盖矩阵 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="数据质量雷达图(6维度评估)" className="hud-corners" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={[
              { dim: '基础地质', score: 90, fullMark: 100 },
              { dim: '水文参数', score: 95, fullMark: 100 },
              { dim: '水资源量', score: 100, fullMark: 100 },
              { dim: '水质评价', score: 100, fullMark: 100 },
              { dim: '环境地质', score: 85, fullMark: 100 },
              { dim: '特色资源', score: 82, fullMark: 100 },
            ]}>
              <PolarGrid stroke="rgba(6,182,212,0.12)" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              <Radar name="覆盖度" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="满分基准" dataKey="fullMark" stroke="#ef4444" fill="none" strokeWidth={1} strokeDasharray="4 4" />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="数据质量" />} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各模块数据时效(最新年份)" className="hud-corners" height={320}>
          <div className="flex items-center gap-4 text-[10px] text-gw-muted mb-2">
            <span className="text-emerald-400">绿色=2024年已更新</span>
            <span className="text-amber-400">黄色=待补充</span>
            <span className="text-gw-muted">灰色=静态基础数据</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[
              { name: '水资源', year: 2024, color: '#22c55e' },
              { name: '水质', year: 2024, color: '#22c55e' },
              { name: '开采', year: 2024, color: '#22c55e' },
              { name: '沉降', year: 2024, color: '#22c55e' },
              { name: '盐碱土', year: 2024, color: '#22c55e' },
              { name: '咸水', year: 2024, color: '#22c55e' },
              { name: '矿泉水', year: 2023, color: '#f59e0b' },
              { name: '裂隙水', year: 2023, color: '#f59e0b' },
              { name: '地热', year: 2023, color: '#f59e0b' },
              { name: '矿区', year: 2023, color: '#f59e0b' },
              { name: '水化学', year: 2022, color: '#94a3b8' },
              { name: '参数', year: 2020, color: '#94a3b8' },
            ].map(d => ({ ...d, '最新年份': d.year }))} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" domain={[2018, 2025]} tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={50} />
              <Tooltip content={<ChartTooltip title="数据年份" />} />
              <Bar dataKey="最新年份" radius={[0, 3, 3, 0]}>
                {[
                  { name: '水资源', year: 2024, color: '#22c55e' },
                  { name: '水质', year: 2024, color: '#22c55e' },
                  { name: '开采', year: 2024, color: '#22c55e' },
                  { name: '沉降', year: 2024, color: '#22c55e' },
                  { name: '盐碱土', year: 2024, color: '#22c55e' },
                  { name: '咸水', year: 2024, color: '#22c55e' },
                  { name: '矿泉水', year: 2023, color: '#f59e0b' },
                  { name: '裂隙水', year: 2023, color: '#f59e0b' },
                  { name: '地热', year: 2023, color: '#f59e0b' },
                  { name: '矿区', year: 2023, color: '#f59e0b' },
                  { name: '水化学', year: 2022, color: '#94a3b8' },
                  { name: '参数', year: 2020, color: '#94a3b8' },
                ].map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
              <ReferenceLine x={2024} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1} label={{ value: '2024', fill: '#22c55e', fontSize: 9 }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 版本演进统计卡片 */}
      <TechCard title="平台版本演进" badge="v1.0 - v3.8.3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/15">
            <p className="text-[10px] text-gw-muted">累计版本</p>
            <p className="text-base font-mono font-bold text-blue-400">23</p>
            <p className="text-[10px] text-gw-muted">次迭代</p>
          </div>
          <div className="text-center p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
            <p className="text-[10px] text-gw-muted">变更条目</p>
            <p className="text-base font-mono font-bold text-cyan-400">89</p>
            <p className="text-[10px] text-gw-muted">项功能</p>
          </div>
          <div className="text-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
            <p className="text-[10px] text-gw-muted">数据模块</p>
            <p className="text-base font-mono font-bold text-emerald-400">22</p>
            <p className="text-[10px] text-gw-muted">个Sheet</p>
          </div>
          <div className="text-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/15">
            <p className="text-[10px] text-gw-muted">页面路由</p>
            <p className="text-base font-mono font-bold text-amber-400">21</p>
            <p className="text-[10px] text-gw-muted">个专题</p>
          </div>
          <div className="text-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/15">
            <p className="text-[10px] text-gw-muted">图表组件</p>
            <p className="text-base font-mono font-bold text-purple-400">456</p>
            <p className="text-[10px] text-gw-muted">个可视化</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <p className="text-[10px] text-gw-muted mb-1">版本里程碑</p>
            {[
              { v: 'v1.0', d: '2026-05-09', desc: '22 Sheet基础数据入库' },
              { v: 'v1.1', d: '2026-05-10', desc: '8 Sheet更新至2024年数据' },
              { v: 'v2.3', d: '2026-05-17', desc: 'DataInsight+18页面深度增强' },
              { v: 'v3.7', d: '2026-05-28', desc: '县级分析+主题系统+数据覆盖' },
              { v: 'v3.8.3', d: '2026-05-28', desc: 'C级深化5项+雷达图+年份矩阵' },
            ].map((m: { v: string; d: string; desc: string }) => (
              <div key={m.v} className="flex items-center justify-between py-0.5 text-xs">
                <span className="font-mono text-gw-highlight">{m.v}</span>
                <span className="text-gw-muted flex-1 mx-2 truncate">{m.desc}</span>
                <span className="text-[9px] text-gw-muted font-mono">{m.d}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <p className="text-[10px] text-gw-muted mb-1">技术栈概览</p>
            {[
              { label: '前端框架', value: 'React 18 + Vite 6.4' },
              { label: '样式方案', value: 'Tailwind CSS + CSS变量主题' },
              { label: '图表引擎', value: 'Recharts 17种组件' },
              { label: '状态管理', value: 'useState + useMemo' },
              { label: '路由方案', value: 'React Router v6 (5 Tab)' },
              { label: '构建产物', value: 'Tree-shaking + Code-split' },
              { label: '数据层', value: '22模块 TypeScript 0 TODO' },
            ].map((t: { label: string; value: string }) => (
              <div key={t.label} className="flex items-center justify-between py-0.5 text-xs">
                <span className="text-gw-muted">{t.label}</span>
                <span className="font-mono text-gw-cyan">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </TechCard>

      {/* 数据资产统计表 */}
      <SectionAccordion title="数据资产明细" defaultOpen={true}>
        <TechCard title="数据资产明细" className="scan-line">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-3">数据类别</th>
                  <th className="text-center text-gw-muted py-2 px-3">记录数</th>
                  <th className="text-center text-gw-muted py-2 px-3">覆盖度</th>
                  <th className="text-left text-gw-muted py-2 px-3">数据时效</th>
                  <th className="text-left text-gw-muted py-2 px-3">更新状态</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: '系统分区', records: systemZones.length, coverage: 90, time: '调查年限', status: '静态' },
                  { cat: '水文地质参数', records: '含4含水层组', coverage: 95, time: '调查年限', status: '静态' },
                  { cat: '水资源量', records: '14市+时序', coverage: 100, time: '2024年', status: '已更新' },
                  { cat: '水质评价', records: '27断面', coverage: 100, time: '2024年', status: '已更新' },
                  { cat: '开采管理', records: '7.2万许可', coverage: 85, time: '2024年', status: '已更新' },
                  { cat: '岩溶水', records: karstSprings.length + '泉域', coverage: 90, time: '调查年限', status: '静态' },
                  { cat: '地热田', records: geothermalFields.length + '个', coverage: 80, time: '调查年限', status: '待补充' },
                  { cat: '矿泉水', records: mineralWaterSites.length + '处', coverage: 75, time: '调查年限', status: '待更新' },
                  { cat: '咸水分布', records: '11市', coverage: 80, time: '1999+2024', status: '混合' },
                  { cat: '盐碱土', records: salineSoilDistribution.length + '市', coverage: 80, time: '调查年限', status: '静态' },
                  { cat: '裂隙水', records: fractureWaterTypes.length + '类型', coverage: 85, time: '调查年限', status: '静态' },
                  { cat: '矿区水文', records: mineHydrogeologyData.length + '矿区', coverage: 85, time: '调查年限', status: '静态' },
                  { cat: '水化学', records: hydrochemicalZoning.length + '分区', coverage: 80, time: '调查年限', status: '静态' },
                  { cat: '地面沉降', records: landSubsidence.length + '市', coverage: 85, time: '2024年', status: '已更新' },
                ].map((row: { cat: string; records: string | number; coverage: number; time: string; status: string }, i: number) => (
                  <tr key={i} className="border-b border-gw-border/30 hover:bg-gw-surface/30">
                    <td className="py-2 px-3 font-medium text-gw-text">{row.cat}</td>
                    <td className="py-2 px-3 text-center font-mono text-gw-cyan">{row.records}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        row.coverage >= 95 ? 'bg-emerald-500/15 text-emerald-400' :
                        row.coverage >= 80 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>{row.coverage}%</span>
                    </td>
                    <td className="py-2 px-3 text-gw-muted">{row.time}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        row.status === '已更新' ? 'bg-emerald-500/15 text-emerald-400' :
                        row.status === '待更新' || row.status === '待补充' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-gw-surface text-gw-muted'
                      }`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>
      </SectionAccordion>

      <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><OverExploitTab /></Suspense>
      <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><ClassicDataTab highlight={highlight} /></Suspense>

      <DataSourceNote source="数据来源: 1999年《河北省地下水》+ 2024年水资源公报 + 2024年生态环境公报 + 《河北省水文地质工程地质》经典参考 | 河北瑞三元环境科技有限公司" />
    </div>
  );
}
