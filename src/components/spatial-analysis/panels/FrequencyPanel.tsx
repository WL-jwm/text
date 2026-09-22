/**
 * 面板3: 频率优化
 *  B-33 监测网优化 — 自相关分析+推荐频率+冗余指数（自 MonitoringNetworkTab.tsx 拆分）
 */
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import { TechCard } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';
import type { MonitoringArea } from '../../../utils/monitoringNetworkCalculator';
import { calcOptimalFrequency } from '../../../utils/monitoringNetworkCalculator';
import { TOOLTIP_STYLE, STATUS_LABELS } from '../monitoringNetworkConstants';

export function FrequencyPanel({ area }: { area: MonitoringArea }) {
  const results = useMemo(() => {
    return area.wells.map(well => {
      // 生成合成历史数据
      const history: number[] = [];
      const baseLevel = well.aquiferType === 'deep' ? -15 : well.aquiferType === 'karst' ? 540 : 35;
      const amp = well.aquiferType === 'deep' ? 2 : 5;
      const trend = well.aquiferType === 'deep' ? -0.3 : -0.1;
      const phase = (well.row + well.col) * 0.3;
      for (let m = 0; m < 24; m++) {
        history.push(baseLevel + amp * Math.sin((m / 12) * 2 * Math.PI + phase) + trend * m + Math.sin(m * 7.3) * 1.5);
      }
      return calcOptimalFrequency(well.id, well.name, history, well.frequency);
    });
  }, [area]);

  const freqCompareData = useMemo(() =>
    results.map(r => ({
      name: r.wellName,
      current: r.currentFrequency,
      optimal: r.optimalFrequency,
    })),
  [results]);

  const redundancyData = useMemo(() =>
    results.map(r => ({
      name: r.wellName,
      redundancy: Number((r.redundancyIndex * 100).toFixed(1)),
      autocorr: Number((r.autocorrelationLag1 * 100).toFixed(1)),
    })),
  [results]);

  const tableRows = useMemo(() =>
    results.map(r => [
      r.wellName,
      String(r.currentFrequency),
      String(r.optimalFrequency),
      r.autocorrelationLag1.toFixed(3),
      (r.redundancyIndex * 100).toFixed(1) + '%',
      STATUS_LABELS[r.status] ?? r.status,
    ]),
  [results]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-green-400" />
          <h4 className="text-sm font-semibold text-gw-text">监测频率优化</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">频率合理</div>
            <div className="text-sm font-bold text-green-400">{results.filter(r => r.status === 'optimal').length}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">过密（冗余）</div>
            <div className="text-sm font-bold text-cyan-400">{results.filter(r => r.status === 'over-sampled').length}</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">不足</div>
            <div className="text-sm font-bold text-red-400">{results.filter(r => r.status === 'under-sampled').length}</div>
          </div>
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">当前频率 vs 推荐频率</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={freqCompareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '次/年', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="current" name="当前频率" fill="#06b6d4" radius={[2, 2, 0, 0]} barSize={15} />
              <Bar dataKey="optimal" name="推荐频率" fill="#10b981" radius={[2, 2, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">冗余度与自相关系数</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={redundancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="redundancy" name="冗余度" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={15} />
              <Bar dataKey="autocorr" name="自相关系数" fill="#8b5cf6" radius={[2, 2, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">监测频率优化明细</h5>
        <FilterableTechTable
          headers={['监测井', '当前(次/年)', '推荐(次/年)', '自相关r1', '冗余度', '状态']}
          rows={tableRows}
        />
      </TechCard>
    </div>
  );
}
