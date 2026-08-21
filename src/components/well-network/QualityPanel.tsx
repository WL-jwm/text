/**
 * H-01 井网面板 - 水质综合评价面板（自 WellNetworkPanel 拆分）
 */
import { Droplets, ChevronDown, TriangleAlert, Layers, Building2, CircleDot } from 'lucide-react';
import {
  WATER_CLASS_LABELS,
  type WaterQualitySummary,
  type CityWaterQualityStats,
  type WaterQualityAssessment,
} from '../../services/waterQuality';

export interface QualityPanelProps {
  open: boolean;
  onToggle: () => void;
  qualitySummary: WaterQualitySummary;
  qualityCityStats: CityWaterQualityStats[];
  selectedWellQuality: WaterQualityAssessment | null;
  onSelectCity: (city: string) => void;
}

export function QualityPanel(props: QualityPanelProps) {
  const { open, onToggle, qualitySummary, qualityCityStats, selectedWellQuality, onSelectCity } = props;
  return (
        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <Droplets size={11} className={qualitySummary.exceededSites > 0 ? 'text-orange-400' : 'text-emerald-400'} />
              <span>水质综合评价 · GB/T 14848-2017</span>
              <span className={`text-[8px] font-mono px-1 rounded ${qualitySummary.exceedRate > 50 ? 'bg-red-500/20 text-red-400' : qualitySummary.exceedRate > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {qualitySummary.totalSites > 0 ? `超标${qualitySummary.exceedRate}%` : '无数据'}
              </span>
              <ChevronDown size={9} className={`transition-transform ml-auto ${open ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {open && (
            <div className="space-y-2">
              {/* 水质类别分布 */}
              {qualitySummary.totalSites > 0 ? (
                <>
                  <div className="grid grid-cols-5 gap-1">
                    {([1, 2, 3, 4, 5] as const).map(cls => {
                      const cfg = WATER_CLASS_LABELS[cls];
                      const count = qualitySummary.classDistribution[cls] ?? 0;
                      const pct = qualitySummary.totalSites > 0 ? (count / qualitySummary.totalSites) * 100 : 0;
                      return (
                        <div key={cls} className="px-1.5 py-1 rounded text-center" style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                          <div className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</div>
                          <div className="text-[11px] font-bold font-mono text-gw-text">{count}</div>
                          <div className="text-[7px] text-gw-muted/50">{pct.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 主要超标因子 */}
                  {qualitySummary.topFactors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <TriangleAlert size={10} className="text-orange-400" />
                        <span className="text-[9px] font-medium text-gw-muted">主要超标因子（前5）</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {qualitySummary.topFactors.slice(0, 5).map(f => (
                          <span key={f.indicator} className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                            {f.label} {f.count}站({f.rate}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 苏卡列夫类型分布 */}
                  {Object.keys(qualitySummary.sulinDistribution).length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Layers size={10} className="text-gw-muted/60" />
                        <span className="text-[9px] font-medium text-gw-muted">水化学类型分布</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(qualitySummary.sulinDistribution)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 6)
                          .map(([type, count]) => (
                            <span key={type} className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/30 border border-gw-border/20 text-gw-muted">
                              {type} {String(count)}站
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 市水质统计 */}
                  {qualityCityStats.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Building2 size={10} className="text-gw-muted/60" />
                        <span className="text-[9px] font-medium text-gw-muted">市水质统计 · {qualityCityStats.length}市</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
                        {qualityCityStats.map(cs => (
                          <div
                            key={cs.city}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] bg-gw-surface/20 border border-gw-border/10 cursor-pointer hover:bg-gw-surface/30 transition-colors"
                            onClick={() => onSelectCity(cs.city)}
                          >
                            <span className="w-12 font-medium text-gw-text truncate">{cs.city}</span>
                            <div className="flex items-center gap-0.5">
                              {([1, 2, 3, 4, 5] as const).map(cls => {
                                const count = cs.classDistribution[cls] ?? 0;
                                return count > 0 ? (
                                  <span key={cls} className="text-[7px] px-0.5 rounded" style={{ backgroundColor: `${WATER_CLASS_LABELS[cls].color}30`, color: WATER_CLASS_LABELS[cls].color }}>
                                    {WATER_CLASS_LABELS[cls].label}{count}
                                  </span>
                                ) : null;
                              })}
                            </div>
                            <span className="ml-auto text-gw-muted/50">{cs.siteCount}站</span>
                            {cs.exceededSites > 0 && <span className="text-red-400 font-medium">{cs.exceededSites}站超标</span>}
                            {cs.mainFactors.length > 0 && <span className="text-gw-muted/40">{cs.mainFactors.slice(0, 2).join('、')}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 选中井水质详情 */}
                  {selectedWellQuality && (
                    <div className="border border-gw-cyan/30 rounded-lg bg-gw-surface/10 p-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CircleDot size={11} className="text-gw-cyan" />
                          <span className="text-[10px] font-medium text-gw-text">{selectedWellQuality.stationName}</span>
                          <span className="text-[8px] text-gw-muted/50">{selectedWellQuality.city}</span>
                          <span
                            className="text-[8px] px-1 rounded font-medium"
                            style={{ backgroundColor: `${WATER_CLASS_LABELS[selectedWellQuality.comprehensiveClass].color}25`, color: WATER_CLASS_LABELS[selectedWellQuality.comprehensiveClass].color }}
                          >
                            {WATER_CLASS_LABELS[selectedWellQuality.comprehensiveClass].label} · {selectedWellQuality.comprehensiveLabel}
                          </span>
                        </div>
                      </div>

                      {selectedWellQuality.sulin && (
                        <div className="text-[8px] text-gw-muted/70">
                          水化学类型: {selectedWellQuality.sulin.fullName}
                        </div>
                      )}

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                        {selectedWellQuality.indicators.slice(0, 12).map(ind => {
                          const cls = WATER_CLASS_LABELS[ind.class];
                          return (
                            <div key={ind.indicator} className="flex items-center gap-1 px-1 py-0.5 rounded bg-gw-surface/20 border border-gw-border/10">
                              <span className="text-[7px] w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                              <span className="text-[7px] text-gw-muted w-10 truncate">{ind.label}</span>
                              <span className="text-[7px] font-mono text-gw-muted flex-1 text-right">{ind.value}{ind.unit}</span>
                              <span className="text-[7px] font-medium" style={{ color: cls.color }}>{cls.label}</span>
                              {ind.isExceeded && <TriangleAlert size={7} className="text-red-400 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {selectedWellQuality.exceededCount > 0 && (
                        <div className="text-[8px] text-red-400/80 bg-red-500/10 px-1.5 py-0.5 rounded">
                          超标因子 {selectedWellQuality.exceededCount} 项：
                          {selectedWellQuality.exceededFactors.map(f => f.label).join('、')}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-[10px] text-gw-muted/50 py-2">
                  当前井网中无水质监测井（indicators 不含 waterQuality）
                </div>
              )}
            </div>
          )}
        </div>
  );
}
