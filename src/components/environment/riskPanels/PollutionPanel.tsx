import { calcPollutionRisk, type DrasticInput } from '../../../utils/riskAssessmentCalculator';

/**
 * 面板: PollutionPanel（拆分自 RiskAssessmentTab.tsx）
 */
import type { AquiferMedia, VadoseZone, LandUse, SoilMedia } from '../../../utils/riskAssessmentCalculator';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard, TechCard } from '../../UI';
import { AlertTriangle } from 'lucide-react';
import { CartesianGrid, ResponsiveContainer, Tooltip, Bar, YAxis, XAxis, BarChart } from 'recharts';
import { AQUIFER_OPTIONS, LANDUSE_FACTOR_MAP, LANDUSE_OPTIONS, SOIL_OPTIONS, TOOLTIP_STYLE, VADOSE_OPTIONS } from './riskAssessmentConstants';
import { RiskBadge } from './RiskBadge';

interface PollutionPanelProps {
  pollution: DrasticInput
  setPollution: React.Dispatch<React.SetStateAction<DrasticInput>>
  pollutionResult: ReturnType<typeof calcPollutionRisk>;
  drasticBarData: { name: string; label: string; rating: number; contribution: number }[];
}
export function PollutionPanel({ pollution, setPollution, pollutionResult, drasticBarData }: PollutionPanelProps) {
  return (
      <TechCard title="污染风险评价（改进DRASTIC）" badge="污染" icon={AlertTriangle} className="border-amber-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">D - 地下水埋深 (m)</label>
            <input type="number" value={pollution.depthToWater} onChange={e => setPollution({ ...pollution, depthToWater: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">R - 净补给量 (mm/yr)</label>
            <input type="number" value={pollution.netRecharge} onChange={e => setPollution({ ...pollution, netRecharge: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">A - 含水层介质</label>
            <select value={pollution.aquiferMedia} onChange={e => setPollution({ ...pollution, aquiferMedia: e.target.value as AquiferMedia })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {AQUIFER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <label className="block text-[11px] text-gw-muted">S - 土壤介质</label>
            <select value={pollution.soilMedia} onChange={e => setPollution({ ...pollution, soilMedia: e.target.value as SoilMedia })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {SOIL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <label className="block text-[11px] text-gw-muted">T - 地形坡度 (%)</label>
            <input type="number" value={pollution.topography} onChange={e => setPollution({ ...pollution, topography: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">I - 包气带</label>
            <select value={pollution.vadoseZone} onChange={e => setPollution({ ...pollution, vadoseZone: e.target.value as VadoseZone })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {VADOSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <label className="block text-[11px] text-gw-muted">C - 渗透系数 (m/d)</label>
            <input type="number" value={pollution.conductivity} onChange={e => setPollution({ ...pollution, conductivity: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">土地利用类型</label>
            <select value={pollution.landUse} onChange={e => setPollution({ ...pollution, landUse: e.target.value as LandUse })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              {LANDUSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <StatCard title="DRASTIC指数" value={pollutionResult.drasticIndex} accent="blue" />
              <StatCard title="修正后指数" value={pollutionResult.adjustedIndex} accent="amber" subtitle={`土地利用×${(LANDUSE_FACTOR_MAP[pollution.landUse]).toFixed(1)}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gw-muted">风险等级:</span>
              <RiskBadge level={pollutionResult.riskLevel} />
            </div>
            <LazyChartCard title="DRASTIC因子评分" height={220}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={drasticBarData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(_v: unknown, _n: string, props: { payload?: { label?: string; rating?: number; contribution?: number } }) => [
                    `因子: ${props.payload?.label ?? ''}`,
                    `评分: ${props.payload?.rating ?? 0}/10`,
                    `贡献: ${props.payload?.contribution ?? 0}`,
                  ]} />
                  <Bar dataKey="rating" name="评分" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">主要风险因子</p>
              {pollutionResult.keyRiskFactors.length > 0 ? (
                pollutionResult.keyRiskFactors.map((f, i) => (
                  <p key={i} className="text-[10px] text-gw-muted">• {f}</p>
                ))
              ) : (
                <p className="text-[10px] text-gw-muted">无显著高风险因子</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">防护建议</p>
              {pollutionResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>
  );
}
