/**
 * H-01 井网面板 - 均衡-水质联动分析面板（自 WellNetworkPanel 拆分）
 */
import { BarChart3, ChevronDown, TriangleAlert } from 'lucide-react';
import { WATER_CLASS_LABELS } from '../../services/waterQuality';
import type { IntegratedAnalysis } from '../../services/waterQualityBalance';

export interface IntegratedPanelProps {
  open: boolean;
  onToggle: () => void;
  integratedAnalysis: IntegratedAnalysis;
  onSelectCity: (city: string) => void;
}

export function IntegratedPanel(props: IntegratedPanelProps) {
  const { open, onToggle, integratedAnalysis, onSelectCity } = props;
  return (
        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <BarChart3 size={11} className={integratedAnalysis.summary.dualPoor > 0 ? 'text-red-400' : 'text-emerald-400'} />
              <span>均衡-水质联动分析</span>
              {integratedAnalysis.hasData && (
                <span className={`text-[8px] font-mono px-1 rounded ${integratedAnalysis.summary.dualPoor > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {integratedAnalysis.summary.dualPoor > 0
                    ? `${integratedAnalysis.summary.dualPoor}个双差城市`
                    : '无异常'}
                </span>
              )}
              <ChevronDown size={9} className={`transition-transform ml-auto ${open ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {open && integratedAnalysis.hasData && (
            <div className="space-y-2">
              {/* 四象限统计卡片 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#ef444415', border: '1px solid #ef444430' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                    <span className="text-[8px] text-red-300/70">双差</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-red-400">{integratedAnalysis.summary.dualPoor}</div>
                  <div className="text-[7px] text-red-300/50">超采+差水质</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#f9731615', border: '1px solid #f9731630' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f97316' }} />
                    <span className="text-[8px] text-orange-300/70">盈余·差水质</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-orange-400">{integratedAnalysis.summary.surplusPoorQuality}</div>
                  <div className="text-[7px] text-orange-300/50">需控制污染源</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                    <span className="text-[8px] text-amber-300/70">超采·好水质</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-amber-400">{integratedAnalysis.summary.overdraftGoodQuality}</div>
                  <div className="text-[7px] text-amber-300/50">需预防性控采</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#10b98115', border: '1px solid #10b98130' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
                    <span className="text-[8px] text-emerald-300/70">双优</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-emerald-400">{integratedAnalysis.summary.dualGood}</div>
                  <div className="text-[7px] text-emerald-300/50">盈余+好水质</div>
                </div>
              </div>

              {/* 综合排名 */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <BarChart3 size={10} className="text-gw-muted/60" />
                  <span className="text-[9px] font-medium text-gw-muted">综合排名 · {integratedAnalysis.ranking.length}市</span>
                  <span className="text-[8px] text-gw-muted/50 ml-auto">得分越高越好</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                  {integratedAnalysis.ranking.map(item => {
                    const quadrantConfig = [
                      { color: '#6b7280' },
                      { color: '#ef4444' },
                      { color: '#f97316' },
                      { color: '#f59e0b' },
                      { color: '#10b981' },
                    ];
                    const qColor = quadrantConfig[item.quadrant]?.color ?? '#6b7280';
                    return (
                      <div
                        key={item.city}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] cursor-pointer transition-colors bg-gw-surface/20 border border-gw-border/10 hover:bg-gw-surface/30"
                        onClick={() => onSelectCity(item.city)}
                      >
                        <span className="w-4 text-gw-muted/50 font-mono text-[7px]">#{item.rank}</span>
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: qColor }} />
                        <span className="w-10 font-medium text-gw-text truncate">{item.city}</span>
                        <div className="flex-1 h-2 rounded bg-gw-surface/30 overflow-hidden">
                          <div
                            className="h-full rounded transition-all"
                            style={{ width: `${item.compositeScore}%`, backgroundColor: qColor }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-gw-muted">{item.compositeScore.toFixed(0)}</span>
                        <span className="text-[7px] text-gw-muted/50">
                          {item.isOverdrafted ? '超采' : '盈余'}·{WATER_CLASS_LABELS[item.qualityClass]?.label ?? '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 双差城市预警 */}
              {integratedAnalysis.alertCities.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TriangleAlert size={10} className="text-red-400" />
                    <span className="text-[9px] font-medium text-gw-muted">双差城市预警 · {integratedAnalysis.alertCities.length}市</span>
                  </div>
                  <div className="space-y-0.5">
                    {integratedAnalysis.alertCities.map(c => (
                      <div
                        key={c.city}
                        className="px-1.5 py-1 rounded border bg-red-500/5 border-red-500/20 cursor-pointer hover:bg-red-500/10 transition-colors"
                        onClick={() => onSelectCity(c.city)}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-medium text-gw-text">{c.city}</span>
                          <span className="text-[7px] text-red-400/80">
                            超采 {Math.abs(c.balance?.balance ?? 0).toFixed(1)}亿m³ ·
                            水质平均 {WATER_CLASS_LABELS[Math.round(c.quality?.averageClass ?? 3) as 1|2|3|4|5]?.label ?? 'Ⅲ类'}
                          </span>
                        </div>
                        <div className="text-[7px] text-gw-muted/60 mt-0.5">
                          {c.quality && c.quality.mainFactors.length > 0 && (
                            <span>超标因子: {c.quality.mainFactors.join('、')} · </span>
                          )}
                          {c.suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 超采区水质特征 */}
              <div className="text-[8px] text-gw-muted/50 italic px-1 py-0.5 rounded bg-gw-surface/20">
                {integratedAnalysis.summary.overdraftQualityPattern}
              </div>

              {/* 主要建议 */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <TriangleAlert size={10} className="text-amber-400" />
                  <span className="text-[9px] font-medium text-gw-muted">建议</span>
                </div>
                {integratedAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} className="flex items-start gap-1 text-[8px] text-gw-muted/70">
                    <span className="text-gw-cyan mt-0.5">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {open && !integratedAnalysis.hasData && (
            <div className="text-center text-[10px] text-gw-muted/50 py-2">
              数据不足，请先添加井网数据
            </div>
          )}
        </div>
  );
}
