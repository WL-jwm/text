/**
 * 面板1: 密度分析
 *  B-33 监测网优化 — 监测井密度评价+标准对照+缺口识别（自 MonitoringNetworkTab.tsx 拆分）
 */
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Grid3x3 } from 'lucide-react';
import { TechCard } from '../../UI';
import type { MonitoringArea } from '../../../utils/monitoringNetworkCalculator';
import { AQUIFER_LABELS, DENSITY_STANDARDS, calcMonitoringDensity } from '../../../utils/monitoringNetworkCalculator';
import { TOOLTIP_STYLE, STATUS_COLORS, STATUS_LABELS } from '../monitoringNetworkConstants';

export function DensityPanel({ area }: { area: MonitoringArea }) {
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
