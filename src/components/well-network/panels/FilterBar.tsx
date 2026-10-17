/**
 * 拆分自 WellNetworkPanel.tsx
 */

import { Filter, Search } from 'lucide-react';
import { AQUIFER_TYPES, STATUSES } from '../constants';
import type { AquiferType, WellStatus } from '../../../services/wellNetwork';
import { AQUIFER_LABELS, WELL_STATUS_LABELS } from '../../../services/wellNetwork';

type FilterState = {
  city?: string;
  aquiferType?: AquiferType;
  status?: WellStatus;
  keyword?: string;
};

export function FilterBar({ filters, cities, onFilterChange, onClear }: { filters: FilterState; cities: string[]; onFilterChange: (patch: Partial<FilterState>) => void; onClear: () => void }) {
  return (
    <>
    {/* 筛选栏 */}
    <div className="flex flex-wrap items-center gap-1.5">
      <Filter size={11} className="text-gw-muted/60" />
      <select value={filters.city ?? ''} onChange={e => onFilterChange({ city: e.target.value || undefined })} className="text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none">
        <option value="">全部城市</option>
        {cities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filters.aquiferType ?? ''} onChange={e => onFilterChange({ aquiferType: (e.target.value || undefined) as AquiferType | undefined })} className="text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none">
        <option value="">全部含水层</option>
        {AQUIFER_TYPES.map(t => <option key={t} value={t}>{AQUIFER_LABELS[t]}</option>)}
      </select>
      <select value={filters.status ?? ''} onChange={e => onFilterChange({ status: (e.target.value || undefined) as WellStatus | undefined })} className="text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none">
        <option value="">全部状态</option>
        {STATUSES.map(s => <option key={s} value={s}>{WELL_STATUS_LABELS[s]}</option>)}
      </select>
      <div className="flex items-center gap-0.5 flex-1 min-w-32">
        <Search size={10} className="text-gw-muted/40" />
        <input value={filters.keyword ?? ''} onChange={e => onFilterChange({ keyword: e.target.value || undefined })} placeholder="搜索井名/编号/区县" className="flex-1 text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none" />
      </div>
      {(filters.city || filters.aquiferType || filters.status || filters.keyword) && (
        <button onClick={onClear} className="text-[8px] text-gw-muted/50 hover:text-gw-text">清空</button>
      )}
    </div>
    </>
  );
}
