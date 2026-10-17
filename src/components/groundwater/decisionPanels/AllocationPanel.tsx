/**
 * 拆分自 DecisionSupportTab.tsx
 */

import { ArrowRight, AlertTriangle, Layers } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { FilterableTechTable } from '../../FilterableTechTable';
import { ProgressBar } from '../decisionSupportUI';
import { satisfactionColor, romanLevel, SOURCE_COLORS, TOOLTIP_STYLE } from '../decisionSupportConstants';
import type { AllocationResult, WaterSource, WaterUser } from '../../../utils/decisionSupportCalculator';

export function AllocationPanel({ allocationResult, sources, users, allocationBarData, sourceUtilData }: { allocationResult: AllocationResult; sources: WaterSource[]; users: WaterUser[]; allocationBarData: { name: string; allocated: number; demand: number; satisfaction: number }[]; sourceUtilData: { name: string; utilization: number; remainder: number }[] }) {
  return (
    <>
    {/* ═══ Panel 1: 水资源配置优化 ═══ */}
    <TechCard title="水资源配置优化" badge="配置" icon={Layers} className="border-blue-500/15">
      {/* 水源→用户 流向概览 */}
      <div className="mb-3 p-3 rounded-xl bg-gw-surface/30 border border-gw-border/20">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div>
            <p className="text-[10px] font-semibold text-gw-muted mb-1.5">水源 (供{allocationResult.totalAllocated}/{allocationResult.totalDemand}万m³)</p>
            <div className="space-y-1">
              {allocationResult.sourceRemainder.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-gw-text w-16 truncate">{s.source}</span>
                  <div className="flex-1"><ProgressBar value={s.utilization} max={100} color={SOURCE_COLORS[i % SOURCE_COLORS.length]} /></div>
                  <span className="text-[10px] text-gw-muted w-10 text-right">{s.utilization}%</span>
                </div>
              ))}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gw-muted/50" />
          <div>
            <p className="text-[10px] font-semibold text-gw-muted mb-1.5">用户 (满足率{allocationResult.overallSatisfaction}%)</p>
            <div className="space-y-1">
              {allocationResult.userSatisfaction.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-gw-text w-16 truncate">{u.user}</span>
                  <div className="flex-1"><ProgressBar value={u.satisfaction} max={100} color={satisfactionColor(u.satisfaction)} /></div>
                  <span className="text-[10px] font-mono w-10 text-right" style={{ color: satisfactionColor(u.satisfaction) }}>{u.satisfaction}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] font-semibold text-gw-text mb-1">水源列表</p>
          <FilterableTechTable
            headers={['水源', '可供水量(万m³)', '成本(元/m³)', '水质等级']}
            rows={sources.map(s => [s.name, s.supply, s.cost, romanLevel(s.quality)])}
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gw-text mb-1">用户需求</p>
          <FilterableTechTable
            headers={['用户', '需求(万m³)', '最低保障', '优先级', '水质要求']}
            rows={users.map(u => [u.name, u.demand, u.minSupply, 'P' + u.priority, romanLevel(u.maxQuality)])}
          />
        </div>
      </div>
    
      <div className="grid grid-cols-2 gap-3">
        <LazyChartCard title="用户供水满足率" height={240}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={allocationBarData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="allocated" name="已分配" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="demand" name="需求量" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
    
        <LazyChartCard title="水源利用率" height={240}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceUtilData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="utilization" name="利用率" radius={[4, 4, 0, 0]}>
                {sourceUtilData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
    
      <div className="mt-3">
        <p className="text-[11px] font-semibold text-gw-text mb-1">分配方案明细</p>
        <FilterableTechTable
          headers={['水源', '用户', '分配水量(万m³)', '成本(万元)']}
          rows={allocationResult.allocation.map(a => [a.source, a.user, a.volume, a.cost])}
        />
      </div>
      {allocationResult.notes.length > 0 && (
        <div className="mt-2 space-y-1">
          {allocationResult.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-amber-500/8 border border-amber-500/12">
              <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-400">{n}</p>
            </div>
          ))}
        </div>
      )}
    </TechCard>
    
    </>
  );
}
