/**
 * 监测井网 — 空间优化建议面板（自 WellNetworkPanel.tsx 拆分）
 */
import { Crosshair } from 'lucide-react';
import type { SpatialOptimizationResult } from '../../../services/spatialOptimizer';

interface SpatialOptimizationPanelProps {
  showSpatial: boolean;
  spatialOptimization: SpatialOptimizationResult;
}

export function SpatialOptimizationPanel({ showSpatial, spatialOptimization }: SpatialOptimizationPanelProps) {
  if (!showSpatial || !spatialOptimization.hasData) return null;
  return (
          <div className="mt-2 px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Crosshair size={10} className="text-gw-muted/60" />
                <span className="text-[9px] font-medium text-gw-muted">空间优化建议</span>
              </div>
              <span className="text-[8px] font-mono px-1 rounded" style={{
                backgroundColor: spatialOptimization.overallScore >= 60 ? '#10b98125' : '#f9731625',
                color: spatialOptimization.overallScore >= 60 ? '#10b981' : '#f97316',
              }}>
                评分 {spatialOptimization.overallScore}
              </span>
            </div>

            {/* 覆盖密度 */}
            <div className="space-y-0.5 mb-1">
              <div className="text-[8px] text-gw-muted/60 mb-0.5">城市覆盖密度</div>
              {spatialOptimization.cityDensities.slice(0, 6).map(d => (
                <div key={d.city} className="flex items-center gap-1 text-[7px]">
                  <span className="w-10 truncate text-gw-muted">{d.city}</span>
                  <div className="flex-1 h-2 rounded bg-gw-surface/30 overflow-hidden">
                    <div className="h-full rounded transition-all" style={{
                      width: Math.min(100, (d.density / 3) * 100) + '%',
                      backgroundColor: d.status === 'critical' ? '#ef4444' : d.status === 'sparse' ? '#f97316' : d.status === 'moderate' ? '#f59e0b' : '#10b981',
                    }} />
                  </div>
                  <span className="w-16 text-right font-mono text-gw-muted/70">{d.density.toFixed(2)}口/千km²</span>
                  <span className="w-6 text-right" style={{
                    color: d.status === 'critical' ? '#ef4444' : d.status === 'sparse' ? '#f97316' : '#10b981',
                  }}>{d.gap > 0 ? '+' + d.gap : '\u2014'}</span>
                </div>
              ))}
            </div>

            {/* 盲区与建议 */}
            {spatialOptimization.gaps.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[8px] text-gw-muted/60 mb-0.5">识别盲区</div>
                {spatialOptimization.gaps.map((gap, idx) => (
                  <div key={idx} className="px-1 py-0.5 rounded text-[7px] border" style={{
                    borderColor: gap.priority === 'high' ? '#ef444430' : gap.priority === 'medium' ? '#f9731630' : '#6b728030',
                    backgroundColor: gap.priority === 'high' ? '#ef444408' : gap.priority === 'medium' ? '#f9731608' : '#6b728008',
                  }}>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full" style={{
                        backgroundColor: gap.priority === 'high' ? '#ef4444' : gap.priority === 'medium' ? '#f97316' : '#6b7280',
                      }} />
                      <span className="font-medium text-gw-text">{gap.title}</span>
                      <span className="text-gw-muted/50">{gap.cities.slice(0, 3).join('、')}</span>
                      {gap.suggestedWells > 0 && <span className="text-gw-cyan ml-auto">建议+{gap.suggestedWells}口</span>}
                    </div>
                    <div className="text-gw-muted/50 mt-0.5">{gap.suggestion}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 冗余井 */}
            {spatialOptimization.redundancies.filter(r => r.suggestRemove).length > 0 && (
              <div className="mt-1">
                <div className="text-[8px] text-gw-muted/60 mb-0.5">建议评估</div>
                {spatialOptimization.redundancies.filter(r => r.suggestRemove).slice(0, 3).map(r => (
                  <div key={r.wellId} className="flex items-center gap-1 px-1 py-0.5 rounded text-[7px] bg-amber-500/10 border border-amber-500/20 mb-0.5">
                    <span className="text-gw-text">{r.wellName}</span>
                    <span className="text-gw-muted/50">{r.city}</span>
                    <span className="text-gw-muted/50 ml-auto">{r.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
  );
}
