/**
 * 拆分自 WellNetworkPanel.tsx
 */

import { MapPin, Building2, Activity, Layers, Radio } from 'lucide-react';
import { StatCard } from '../StatCard';
import type { SpatialAnalysisReport } from '../../../services/wellNetwork';
import type { WellRealtimeStats } from '../../../services/wellRealtime';

export function StatsCardsPanel({ wellsCount, report, rtStats }: { wellsCount: number; report: SpatialAnalysisReport | null; rtStats: WellRealtimeStats }) {
  return (
    <>
    {/* 统计卡片 */}
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5">
      <StatCard label="监测井总数" value={wellsCount} icon={MapPin} color="#06b6d4" />
      <StatCard label="覆盖城市" value={report?.cities.length ?? 0} icon={Building2} color="#10b981" />
      <StatCard label="活跃井" value={report?.activeWells ?? 0} icon={Activity} color="#2563eb" />
      <StatCard label="含水层类型" value={report?.aquiferGroups.length ?? 0} icon={Layers} color="#f59e0b" />
      <StatCard label="实时覆盖率" value={`${rtStats.coverage}%`} icon={Radio} color="#06b6d4" />
    </div>
    </>
  );
}
