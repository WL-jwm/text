/**
 * 面板4: 有效性评价
 *  B-33 监测网优化 — 信息熵+冗余度+效率评分（自 MonitoringNetworkTab.tsx 拆分）
 */
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Gauge, CheckCircle2 } from 'lucide-react';
import { TechCard } from '../../UI';
import type { MonitoringArea } from '../../../utils/monitoringNetworkCalculator';
import { calcMonitoringEffectiveness } from '../../../utils/monitoringNetworkCalculator';
import { TOOLTIP_STYLE } from '../monitoringNetworkConstants';

export function EffectivenessPanel({ area }: { area: MonitoringArea }) {
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
