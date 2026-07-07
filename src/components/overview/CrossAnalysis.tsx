import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowRight,  Layers,
} from 'lucide-react';
import { quaternaryAquiferGroups } from '../../data/geology';
import { waterSourceClassification } from '../../data/waterSource';
import { geothermalUtilization } from '../../data/geothermal';
import { mineWaterUtilization, mineHydrogeologyData } from '../../data/mineHydrogeology';
import { fractureWaterTypes } from '../../data/fractureWater';
import { salineDistribution } from '../../data/salineWater';
import { karstWaterChemistry } from '../../data/karstWater';
import { systemZones } from '../../data/systemZoning';
import { SectionTitle, TechCard } from '../UI';
import type { MineWaterUtilizationItem } from '../../types/mineHydrogeology';
import type { SalineDistributionItem } from '../../types/mineHydrogeology';

interface _CrossAnalysisProps {
  navigate?: ReturnType<typeof useNavigate>;
}

export function CrossAnalysis() {
  const navigate = useNavigate();

  return (
    <>
{/* ═══════════════════ 多维数据交叉分析 ═══════════════════ */}

<SectionTitle icon={Layers} badge="数据联动">多维数据交叉分析</SectionTitle>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

  <TechCard title="含水层组参数对比" className="scan-line" badge="基础地质 → 水文参数" >

    <ResponsiveContainer width="100%" height={220}>

      <BarChart data={quaternaryAquiferGroups.map(g => ({ name: g.group, K: g.K?.[0] || 0, yield: g.yield?.[0] || 0 }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />

        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={9} label={{ value: 'K (m/d)', angle: -90, position: 'insideLeft', style: { fill: '#3b82f6', fontSize: 9 } }} />

        <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={9} label={{ value: '涌水量(m³/d)', angle: 90, position: 'insideRight', style: { fill: '#06b6d4', fontSize: 9 } }} />

        <Tooltip />

        <Legend wrapperStyle={{ fontSize: 10 }} />

        <Bar yAxisId="left" dataKey="K" name="渗透系数K" fill="#3b82f6" radius={[2, 2, 0, 0]} />

        <Bar yAxisId="right" dataKey="yield" name="涌水量" fill="#06b6d4" radius={[2, 2, 0, 0]} />

      </BarChart>

    </ResponsiveContainer>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/hydro-params', { state: { tab: '含水层参数' } })}>

      <ArrowRight size={10} /> 查看基础地质详情

    </p>

  </TechCard>

  <TechCard title="水源地构造类型分布" badge="水源地" className="hud-corners">

    <ResponsiveContainer width="100%" height={180}>

      <BarChart data={Object.entries(waterSourceClassification || {}).map(([k, v]) => ({ name: k, value: Array.isArray(v) ? v.length : 0 }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />

        <YAxis stroke="#64748b" fontSize={9} />

        <Tooltip />

        <Bar dataKey="value" fill="#f59e0b" radius={[2, 2, 0, 0]} />

      </BarChart>

    </ResponsiveContainer>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/water-source', { state: { tab: '类型分布' } })}>

      <ArrowRight size={10} /> 查看水源地详情

    </p>

  </TechCard>

  <TechCard title="地热开发利用结构" badge="地热资源">

    <div className="flex items-center gap-4">

      <div className="flex-1 space-y-2">

        <div className="text-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/15">

          <p className="text-[10px] text-gw-muted">地热供暖面积</p>

          <p className="text-lg font-mono font-bold text-amber-400">~4500万m²</p>

        </div>

        <div className="text-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/15">

          <p className="text-[10px] text-gw-muted">可替代标煤</p>

          <p className="text-lg font-mono font-bold text-emerald-400">~5.0×10⁶ t/a</p>

        </div>

        <div className="text-center p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/15">

          <p className="text-[10px] text-gw-muted">回灌率(雄县)</p>

          <p className="text-lg font-mono font-bold text-gw-cyan">95%</p>

        </div>

      </div>

      <div className="flex-1">

        <ResponsiveContainer width="100%" height={150}>

          <BarChart data={geothermalUtilization?.slice(0, 5) || []} layout="vertical" margin={{ left: 0, right: 10 }}>

            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

            <XAxis type="number" stroke="#64748b" fontSize={9} />

            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={50} />

            <Tooltip />

            <Bar dataKey="value" fill="#06b6d4" radius={[0, 2, 2, 0]} />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/geothermal', { state: { tab: '地热利用' } })}>

      <ArrowRight size={10} /> 查看地热资源详情

    </p>

  </TechCard>

  <TechCard title="矿坑水综合利用" badge="矿山水文地质">

    <div className="grid grid-cols-3 gap-2 mt-2">

      <div className="text-center p-1.5 bg-gw-surface/50 rounded border border-gw-border/20">

        <p className="text-[10px] text-gw-muted">年排水总量</p>

        <p className="text-xs font-mono font-bold text-gw-cyan">{(mineWaterUtilization as MineWaterUtilizationItem[]).reduce((s: number, m: MineWaterUtilizationItem) => s + (parseFloat(m.annualDrainage) || 0), 0).toFixed(1)}亿m³/a</p>

      </div>

      <div className="text-center p-1.5 bg-gw-surface/50 rounded border border-gw-border/20">

        <p className="text-[10px] text-gw-muted">平均利用率</p>

        <p className="text-xs font-mono font-bold text-gw-cyan">{((mineWaterUtilization as MineWaterUtilizationItem[]).reduce((s: number, m: MineWaterUtilizationItem) => s + (parseFloat(m.utilizationRate) || 0), 0) / Math.max((mineWaterUtilization as MineWaterUtilizationItem[]).length, 1)).toFixed(1)}%</p>

      </div>

      <div className="text-center p-1.5 bg-gw-surface/50 rounded border border-gw-border/20">

        <p className="text-[10px] text-gw-muted">矿区数量</p>

        <p className="text-xs font-mono font-bold text-gw-cyan">{mineHydrogeologyData?.length || 0}个</p>

      </div>

    </div>

    <ResponsiveContainer width="100%" height={120}>

      <BarChart data={(mineWaterUtilization as MineWaterUtilizationItem[]).slice(0, 8)} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis dataKey="name" stroke="#64748b" fontSize={8} angle={-30} textAnchor="end" height={40} />

        <YAxis stroke="#64748b" fontSize={9} />

        <Tooltip />

        <Bar dataKey="yield" fill="#3b82f6" radius={[2, 2, 0, 0]} />

      </BarChart>

    </ResponsiveContainer>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/mine-hydrogeology', { state: { tab: '利用率' } })}>

      <ArrowRight size={10} /> 查看矿山水文地质详情

    </p>

  </TechCard>

  <TechCard title="裂隙水类型与富水性" badge="裂隙水">

    <div className="grid grid-cols-3 gap-2 mt-2">

      {fractureWaterTypes?.slice(0, 6).map((fw, i) => (

        <div key={i} className="text-center p-1.5 bg-gw-surface/50 rounded border border-gw-border/20">

          <p className="text-[10px] text-gw-muted">{fw.type}</p>

          <p className="text-xs font-mono font-bold text-gw-cyan">{fw.yield || '-'}</p>

        </div>

      ))}

    </div>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/fracture-water')}>

      <ArrowRight size={10} /> 查看裂隙水数据

    </p>

  </TechCard>

  <TechCard title="咸水与盐碱土分布" badge="咸水/盐碱土">

    <div className="grid grid-cols-3 gap-2 mt-2">

      <div className="text-center p-1.5 bg-gw-surface/50 rounded border border-gw-border/20">

        <p className="text-[10px] text-gw-muted">分布面积</p>

        <p className="text-xs font-mono font-bold text-gw-cyan">{(salineDistribution as SalineDistributionItem[])[0]?.totalArea || '-'}km²</p>

      </div>

      <div className="text-center p-1.5 bg-gw-surface/50 rounded border border-gw-border/20">

        <p className="text-[10px] text-gw-muted">天然资源</p>

        <p className="text-xs font-mono font-bold text-gw-cyan">-亿m³</p>

      </div>

      <div className="text-center p-1.5 bg-gw-surface/50 rounded border border-gw-border/20">

        <p className="text-[10px] text-gw-muted">开采率</p>

        <p className="text-xs font-mono font-bold text-gw-cyan">-%</p>

      </div>

    </div>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/saline-water')}>

      <ArrowRight size={10} /> 查看咸水分布

    </p>

  </TechCard>

  <TechCard title="岩溶水化学特征" badge="岩溶水">

    <ResponsiveContainer width="100%" height={160}>

      <BarChart data={karstWaterChemistry?.slice(0, 8) || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />

        <YAxis stroke="#64748b" fontSize={9} />

        <Tooltip />

        <Bar dataKey="tds" fill="#3b82f6" name="TDS" radius={[2, 2, 0, 0]} />

        <Bar dataKey="hardness" fill="#8b5cf6" name="总硬度" radius={[2, 2, 0, 0]} />

      </BarChart>

    </ResponsiveContainer>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/karst-water', { state: { tab: '水化学特征' } })}>

      <ArrowRight size={10} /> 查看岩溶泉域

    </p>

  </TechCard>

  <TechCard title="系统分区面积TOP5" badge="系统分区">

    <ResponsiveContainer width="100%" height={160}>

      <BarChart data={systemZones?.slice(0, 5).map(z => ({ name: z.name?.length > 10 ? z.name.slice(0, 10) + '...' : z.name, area: z.area })) || []} layout="vertical" margin={{ left: 0, right: 10 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />

        <XAxis type="number" stroke="#64748b" fontSize={9} />

        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={70} />

        <Tooltip />

        <Bar dataKey="area" fill="#3b82f6" radius={[0, 2, 2, 0]} />

      </BarChart>

    </ResponsiveContainer>

    <p className="mt-2 text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors cursor-pointer" onClick={() => navigate('/system-zoning')}>

      <ArrowRight size={10} /> 查看系统分区详情

    </p>

  </TechCard>

</div>

{/* ═══════════════════ 1990s vs 2024 历史演变 ═══════════════════ */}
    </>
  );
}
