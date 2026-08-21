/**
 * H-01 井网面板 - 水均衡分析面板（自 WellNetworkPanel 拆分）
 */
import { TrendingUp, TrendingDown, Building2, BarChart3, Droplets, ChevronDown } from 'lucide-react';
import type { WaterBalanceResult, CityBalanceResult, BalanceComparison } from '../../services/waterBalance';
import { RECHARGE_META, DISCHARGE_META } from '../../services/waterBalance';

export interface BalancePanelProps {
  open: boolean;
  onToggle: () => void;
  balanceResult: WaterBalanceResult;
  balanceComparison: BalanceComparison;
  balancePeriodId: string;
  onSelectPeriod: (id: string) => void;
  cityBalances: CityBalanceResult[];
  onSelectCity: (city: string) => void;
}

export function BalancePanel(props: BalancePanelProps) {
  const { open, onToggle, balanceResult, balanceComparison, balancePeriodId, onSelectPeriod, cityBalances, onSelectCity } = props;
  return (

        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <Droplets size={11} className={balanceResult.isOverdrafted ? 'text-red-400' : 'text-gw-cyan'} />
              <span>水均衡分析 · {balanceResult.period.periodLabel}</span>
              <span className={`text-[8px] font-mono px-1 rounded ${balanceResult.isOverdrafted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {balanceResult.isOverdrafted ? `超采${Math.abs(balanceResult.period.balance).toFixed(1)}亿m³` : `盈余${balanceResult.period.balance.toFixed(1)}亿m³`}
              </span>
              <ChevronDown size={9} className={`transition-transform ml-auto ${open ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {open && (
            <div className="space-y-2">
              {/* 时段选择 */}
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-gw-muted/60">时段:</span>
                {balanceComparison.periods.map(p => (
                  <button
                    key={p.periodId}
                    onClick={() => onSelectPeriod(p.periodId)}
                    className={`text-[8px] px-1.5 py-0.5 rounded transition-colors ${
                      balancePeriodId === p.periodId
                        ? 'bg-gw-cyan/20 text-gw-cyan'
                        : 'text-gw-muted/60 hover:text-gw-muted'
                    }`}
                  >
                    {p.periodLabel}
                  </button>
                ))}
              </div>

              {/* 统计卡片 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                <div className="px-2 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-[8px] text-blue-300/70">总补给量</div>
                  <div className="text-[12px] font-bold font-mono text-blue-400">{balanceResult.period.totalRecharge.toFixed(2)}</div>
                  <div className="text-[7px] text-blue-300/50">亿m³/a</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-[8px] text-red-300/70">总排泄量</div>
                  <div className="text-[12px] font-bold font-mono text-red-400">{balanceResult.period.totalDischarge.toFixed(2)}</div>
                  <div className="text-[7px] text-red-300/50">亿m³/a</div>
                </div>
                <div className={`px-2 py-1.5 rounded-lg border ${balanceResult.isOverdrafted ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <div className="text-[8px] text-gw-muted/70">均衡差</div>
                  <div className={`text-[12px] font-bold font-mono ${balanceResult.isOverdrafted ? 'text-orange-400' : 'text-emerald-400'}`}>
                    {balanceResult.period.balance > 0 ? '+' : ''}{balanceResult.period.balance.toFixed(2)}
                  </div>
                  <div className="text-[7px] text-gw-muted/50">亿m³/a</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                  <div className="text-[8px] text-gw-muted/70">储量变化</div>
                  <div className="text-[12px] font-bold font-mono text-gw-muted">{balanceResult.period.storageChange.toFixed(2)}</div>
                  <div className="text-[7px] text-gw-muted/50">亿m³/a</div>
                </div>
              </div>

              {/* 补给项明细 */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp size={10} className="text-blue-400" />
                  <span className="text-[9px] font-medium text-gw-muted">补给项构成</span>
                </div>
                <div className="space-y-0.5">
                  {balanceResult.sortedRecharge.map(item => {
                    const meta = RECHARGE_META[item.id as keyof typeof RECHARGE_META];
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <span className="text-[8px] text-gw-muted w-16 truncate flex-shrink-0" title={meta?.label}>{meta?.shortLabel ?? item.label}</span>
                        <div className="flex-1 h-2.5 rounded bg-gw-surface/30 overflow-hidden">
                          <div
                            className="h-full rounded transition-all duration-300"
                            style={{ width: `${item.percent}%`, backgroundColor: '#06b6d4' }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-gw-muted w-16 text-right flex-shrink-0">{item.value.toFixed(2)}</span>
                        <span className="text-[7px] text-gw-muted/50 w-10 text-right flex-shrink-0">{item.percent.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 排泄项明细 */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown size={10} className="text-red-400" />
                  <span className="text-[9px] font-medium text-gw-muted">排泄项构成</span>
                </div>
                <div className="space-y-0.5">
                  {balanceResult.sortedDischarge.map(item => {
                    const meta = DISCHARGE_META[item.id as keyof typeof DISCHARGE_META];
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <span className="text-[8px] text-gw-muted w-16 truncate flex-shrink-0" title={meta?.label}>{meta?.shortLabel ?? item.label}</span>
                        <div className="flex-1 h-2.5 rounded bg-gw-surface/30 overflow-hidden">
                          <div
                            className="h-full rounded transition-all duration-300"
                            style={{ width: `${item.percent}%`, backgroundColor: '#ef4444' }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-gw-muted w-16 text-right flex-shrink-0">{item.value.toFixed(2)}</span>
                        <span className="text-[7px] text-gw-muted/50 w-10 text-right flex-shrink-0">{item.percent.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 市均衡表 */}
              {cityBalances.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building2 size={10} className="text-gw-muted/60" />
                    <span className="text-[9px] font-medium text-gw-muted">市均衡分析 · {cityBalances.length}市</span>
                    <span className="text-[8px] text-gw-muted/50 ml-auto">按亏损排序</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                    {cityBalances.map(cb => (
                      <div
                        key={cb.city}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] cursor-pointer transition-colors ${
                          cb.isOverdrafted ? 'bg-red-500/5 hover:bg-red-500/10' : 'bg-emerald-500/5 hover:bg-emerald-500/10'
                        }`}
                        onClick={() => onSelectCity(cb.city)}
                      >
                        <span className="w-14 font-medium text-gw-text truncate">{cb.city}</span>
                        <span className="text-gw-muted/70 w-12 text-right font-mono">{cb.recharge.toFixed(2)}</span>
                        <span className="text-gw-muted/50">/</span>
                        <span className="text-gw-muted/70 w-12 text-right font-mono">{cb.discharge.toFixed(2)}</span>
                        <span className={`w-14 text-right font-bold font-mono ${cb.isOverdrafted ? 'text-red-400' : 'text-emerald-400'}`}>
                          {cb.balance > 0 ? '+' : ''}{cb.balance.toFixed(2)}
                        </span>
                        {cb.factor && <span className="text-[7px] text-gw-muted/50 ml-auto">{cb.factor}</span>}
                        {cb.wellCount > 0 && <span className="text-[7px] text-gw-muted/40">{cb.wellCount}井</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 多时段趋势 */}
              {balanceComparison.periods.length > 1 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <BarChart3 size={10} className="text-gw-muted/60" />
                    <span className="text-[9px] font-medium text-gw-muted">多时段对比</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {balanceComparison.periods.map(p => {
                      const isCurrent = p.periodId === balancePeriodId;
                      return (
                        <div
                          key={p.periodId}
                          className={`px-1.5 py-1 rounded border cursor-pointer transition-all ${
                            isCurrent ? 'border-gw-cyan/30 bg-gw-cyan/5' : 'border-gw-border/10 bg-gw-surface/20'
                          }`}
                          onClick={() => onSelectPeriod(p.periodId)}
                        >
                          <div className="text-[7px] text-gw-muted/60">{p.periodLabel}</div>
                          <div className="text-[9px] font-bold font-mono mt-0.5">
                            <span className={p.balance < 0 ? 'text-red-400' : 'text-emerald-400'}>
                              {p.balance > 0 ? '+' : ''}{p.balance.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-[7px] text-gw-muted/50">补{p.totalRecharge.toFixed(0)} / 排{p.totalDischarge.toFixed(0)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 备注 */}
              {balanceResult.period.note && (
                <div className="text-[8px] text-gw-muted/50 italic px-1 py-0.5 rounded bg-gw-surface/20">
                  {balanceResult.period.note}
                </div>
              )}
            </div>
          )}
        </div>
  );
}
