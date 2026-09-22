/**
 * 面板2: 空间覆盖
 *  B-33 监测网优化 — 泰森多边形控制面积+覆盖空白+均匀度（自 MonitoringNetworkTab.tsx 拆分）
 */
import { useMemo } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { TechCard } from '../../UI';
import type { MonitoringArea } from '../../../utils/monitoringNetworkCalculator';
import { calcSpatialCoverage } from '../../../utils/monitoringNetworkCalculator';
import { WellDistributionMap } from './WellDistributionMap';

export function CoveragePanel({ area }: { area: MonitoringArea }) {
  const result = useMemo(() => calcSpatialCoverage(area), [area]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-purple-400" />
          <h4 className="text-sm font-semibold text-gw-text">空间覆盖评价</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总面积</div>
            <div className="text-sm font-bold text-gw-text">{result.totalArea.toFixed(1)}</div>
            <div className="text-[9px] text-gw-muted">km²</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">覆盖面积</div>
            <div className="text-sm font-bold text-green-400">{result.coveredArea.toFixed(1)}</div>
            <div className="text-[9px] text-gw-muted">km²</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">覆盖率</div>
            <div className={`text-sm font-bold ${result.coveragePercent > 80 ? 'text-green-400' : result.coveragePercent > 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.coveragePercent.toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">均匀度</div>
            <div className={`text-sm font-bold ${result.uniformityIndex > 0.7 ? 'text-green-400' : result.uniformityIndex > 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.uniformityIndex.toFixed(3)}
            </div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">空白区</div>
            <div className={`text-sm font-bold ${result.blankZones.length < 10 ? 'text-green-400' : result.blankZones.length < 30 ? 'text-amber-400' : 'text-red-400'}`}>
              {result.blankZones.length}
            </div>
            <div className="text-[9px] text-gw-muted">个网格</div>
          </div>
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">监测井分布与覆盖</h5>
          <WellDistributionMap area={area} />
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">控制面积统计</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">平均控制面积</span>
              <span className="text-sm font-bold text-cyan-400">{result.avgControlArea.toFixed(2)} km²/口</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">最大控制面积</span>
              <span className="text-sm font-bold text-amber-400">{result.maxControlArea.toFixed(2)} km²/口</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">最小控制面积</span>
              <span className="text-sm font-bold text-green-400">{result.minControlArea.toFixed(2)} km²/口</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">未覆盖面积</span>
              <span className="text-sm font-bold text-red-400">{result.uncoveredArea.toFixed(2)} km²</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface rounded">
              <span className="text-xs text-gw-muted">均匀度指数</span>
              <span className={`text-sm font-bold ${result.uniformityIndex > 0.7 ? 'text-green-400' : result.uniformityIndex > 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                {result.uniformityIndex.toFixed(3)}
              </span>
            </div>
          </div>
          {result.blankZones.length > 0 && (
            <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="text-[10px] text-amber-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                检测到 {result.blankZones.length} 个覆盖空白区域
              </div>
              <div className="text-[10px] text-gw-muted mt-1">
                建议在空白区中心增设监测井，优先选择面积最大的空白区域
              </div>
            </div>
          )}
        </TechCard>
      </div>
    </div>
  );
}
