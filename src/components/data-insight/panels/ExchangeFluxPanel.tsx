/**
 * ExchangeFluxPanel — 交互分析面板（自 GwSwInteractionTab.tsx 拆分）
 */
import { useMemo } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { ArrowLeftRight } from 'lucide-react';
import { TechCard } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_RIVERS, INTERACTION_TYPE_LABELS, INTERACTION_TYPE_COLORS, calcExchangeFlux } from '../../../utils/gwSwInteractionCalculator';
import { TOOLTIP_STYLE } from '../gwSwConstants';

// ── 面板2: 交换通量 ──
export function ExchangeFluxPanel({ riverId }: { riverId: string }) {
  const river = PRESET_RIVERS.find(r => r.id === riverId)!;
  const result = useMemo(() =>
    calcExchangeFlux(river.points as typeof river.points, river.segmentLength),
  [river]);

  const profileData = useMemo(() =>
    river.points.map((p, idx) => {
      const flux = result.points[idx];
      return {
        name: p.name,
        riverStage: p.riverStage,
        gwHead: p.groundwaterHead,
        flux: flux?.flux ?? 0,
        direction: flux?.direction ?? 'infiltration',
      };
    }),
  [river, result]);

  const tableRows = useMemo(() =>
    result.points.map(p => [
      p.name,
      p.hydraulicGradient.toFixed(5),
      p.flux.toFixed(1),
      p.fluxPerArea.toFixed(5),
      p.direction === 'infiltration' ? '下渗(河→GW)' : '排泄(GW→河)',
    ]),
  [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeftRight size={16} className="text-purple-400" />
          <h4 className="text-sm font-semibold text-gw-text">交换通量估算（Darcy法）</h4>
          <span className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: `${INTERACTION_TYPE_COLORS[result.fluxDirection]}20`, color: INTERACTION_TYPE_COLORS[result.fluxDirection] }}>
            {INTERACTION_TYPE_LABELS[result.fluxDirection]}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总交换量</div>
            <div className="text-sm font-bold text-gw-text">{result.totalExchange.toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总下渗量</div>
            <div className="text-sm font-bold text-red-400">{result.totalInfiltration.toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总排泄量</div>
            <div className="text-sm font-bold text-green-400">{result.totalExfiltration.toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">净交换量</div>
            <div className={`text-sm font-bold ${result.netExchange > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {result.netExchange.toFixed(0)}
            </div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">单位河长</div>
            <div className="text-sm font-bold text-cyan-400">{result.exchangePerMeter.toFixed(3)}</div>
            <div className="text-[9px] text-gw-muted">m³/d/m</div>
          </div>
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">沿河剖面 — 河水位 vs 地下水位</h5>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={profileData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '水位 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '通量 (m³/d)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="riverStage" name="河水位" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="left" type="monotone" dataKey="gwHead" name="地下水位" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Bar yAxisId="right" dataKey="flux" name="交换通量" radius={[2, 2, 0, 0]} barSize={20}>
              {profileData.map((entry, idx) => (
                <Cell key={idx} fill={entry.direction === 'infiltration' ? '#ef4444' : '#10b981'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-gw-muted">下渗（河→GW）</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-gw-muted">排泄（GW→河）</span>
          </div>
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">各断面交换通量明细</h5>
        <FilterableTechTable
          headers={['断面', '水力梯度', '通量(m³/d)', '通量密度(m/d)', '方向']}
          rows={tableRows}
        />
      </TechCard>
    </div>
  );
}
