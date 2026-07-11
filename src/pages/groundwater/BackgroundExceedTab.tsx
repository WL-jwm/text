import React from 'react';
import { Search } from 'lucide-react';
import { TechCard } from '../../components/UI';
import type { CityExceedanceItem } from '../../data/backgroundValues';

interface BackgroundExceedTabProps {
  filteredCities: CityExceedanceItem[];
  citySearch: string;
  setCitySearch: (value: string) => void;
  expandedCity: string | null;
  setExpandedCity: (city: string | null) => void;
}

export function BackgroundExceedTab({
  filteredCities,
  citySearch,
  setCitySearch,
  expandedCity,
  setExpandedCity,
}: BackgroundExceedTabProps) {
  return (
    <div className="space-y-4">
      <TechCard title="各市地下水主要超标因子" badge="11市">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted" />
            <input type="text" value={citySearch} onChange={e => setCitySearch(e.target.value)}
              placeholder="搜索城市/超标因子..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gw-surface border border-gw-border/40 text-xs text-gw-text placeholder:text-gw-muted/50 focus:outline-none focus:border-gw-blue/50" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-2">城市</th>
              <th className="text-left text-gw-muted py-1.5 px-2">浅层超标因子</th>
              <th className="text-left text-gw-muted py-1.5 px-2">深层超标因子</th>
              <th className="text-left text-gw-muted py-1.5 px-2">说明</th>
            </tr></thead>
            <tbody>
              {filteredCities.map(c => (
                <React.Fragment key={c.city}>
                  <tr className="border-b border-gw-border/20 data-row cursor-pointer"
                    onClick={() => setExpandedCity(expandedCity === c.city ? null : c.city)}>
                    <td className="py-1.5 px-2 font-medium text-gw-text">{c.city}</td>
                    <td className="py-1.5 px-2 text-gw-muted text-[10px]">{c.shallow}</td>
                    <td className="py-1.5 px-2 text-gw-muted text-[10px]">{c.deep}</td>
                    <td className="py-1.5 px-2 text-gw-muted text-[10px]">{c.note}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="超标因子区域特征分析">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-semibold text-amber-400 mb-1">山前平原城市</p>
            <p className="text-[10px] text-gw-muted">
              石家庄、保定、邢台、邯郸、唐山<br />
              <span className="text-gw-text">主要超标：</span>总硬度、TDS、硝酸盐<br />
              <span className="text-gw-text">成因：</span>农业面源污染、原生地质背景
            </p>
          </div>
          <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
            <p className="text-xs font-semibold text-orange-400 mb-1">中部平原城市</p>
            <p className="text-[10px] text-gw-muted">
              衡水、沧州西部、廊坊南部<br />
              <span className="text-gw-text">主要超标：</span>TDS、氯化物、氟化物<br />
              <span className="text-gw-text">成因：</span>原生高氟高咸地质背景
            </p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <p className="text-xs font-semibold text-red-400 mb-1">滨海平原城市</p>
            <p className="text-[10px] text-gw-muted">
              沧州东部、黄骅、海兴<br />
              <span className="text-gw-text">主要超标：</span>TDS、氯化物、氟化物（深层）<br />
              <span className="text-gw-text">成因：</span>海相沉积、海水入侵
            </p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
