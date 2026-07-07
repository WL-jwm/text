import React from 'react';
import {
  Database, CheckCircle2, Clock, Minus,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import { TechCard } from '../UI';
import type { CityBulletinBrief } from '../../types/county';
import type { CountyDataItem } from '../../types/county';

interface CountyCoverageSectionProps {
  countyDataStats: {
    cities: number;
    withData: number;
    totalCounties: number;
    dataCounties: number;
    skelCounties: number;
    topPrecip: { name: string; city: string; precip: number }[];
    bottomPrecip: { name: string; city: string; precip: number }[];
    avgPrecip: number;
  };
  cityBulletin2024: CityBulletinBrief[];
}

export function CountyCoverageSection({ countyDataStats, cityBulletin2024 }: CountyCoverageSectionProps) {
  return (
    <>
      {/* 县级公报数据覆盖 */}
      <div className="bg-gw-surface/50 rounded-xl border border-gw-border/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gw-cyan" />
            <span className="text-sm font-semibold text-gw-text">县级水资源公报数据覆盖（2024）</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>已入库</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400/60 inline-block"></span>待补充</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          {[
            { label: '覆盖城市', value: countyDataStats.cities, sub: '/14市', color: 'text-gw-cyan' },
            { label: '完整数据', value: countyDataStats.withData, sub: '市', color: 'text-emerald-400' },
            { label: '县区总数', value: countyDataStats.totalCounties, sub: '个', color: 'text-gw-text' },
            { label: '已入库', value: countyDataStats.dataCounties, sub: '个', color: 'text-emerald-400' },
            { label: '待补充', value: countyDataStats.skelCounties, sub: '个', color: 'text-amber-400' },
          ].map(item => (
            <div key={item.label} className="text-center p-2 rounded-lg bg-gw-bg/50 border border-gw-border/20">
              <p className="text-[11px] text-gw-muted">{item.label}</p>
              <p className={`text-lg font-mono font-bold ${item.color}`}>{item.value}<span className="text-[10px] text-gw-muted ml-0.5">{item.sub}</span></p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {cityBulletin2024.map((city: CityBulletinBrief) => {
            const hasCounties = city.counties && city.counties.length > 0;
            const hasData = hasCounties && city.counties!.some((c: CountyDataItem) => c.precip != null);
            return (
              <span
                key={city.city}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  !hasCounties ? 'bg-gw-bg/80 text-gw-muted border-gw-border/20' :
                  hasData ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-amber-500/10 text-amber-400/70 border-amber-500/20'
                }`}
              >
                {!hasCounties ? <Minus className="w-3 h-3" /> : hasData ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {city.city}
                {hasCounties && <span className="opacity-60">{city.counties!.length}</span>}
              </span>
            );
          })}
        </div>

        {/* 14市数据完整度进度条 */}
        <div className="mt-3 space-y-1">
          {cityBulletin2024.map((city: CityBulletinBrief) => {
            const hasCounties = city.counties && city.counties.length > 0;
            const filledCount = hasCounties ? city.counties!.filter((c: CountyDataItem) => c.precip != null).length : 0;
            const totalCount = hasCounties ? city.counties!.length : 0;
            const pct = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;
            const barColor = pct === 100 ? '#10b981' : pct > 0 ? '#f59e0b' : '#6b7280';
            return (
              <div key={city.city} className="flex items-center gap-2">
                <span className="text-[10px] text-gw-muted w-16 text-right flex-shrink-0">{city.city}</span>
                <div className="flex-1 h-2 rounded-full bg-gw-bg/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
                <span className="text-[9px] text-gw-muted w-12 flex-shrink-0">
                  {!hasCounties ? '无数据' : `${filledCount}/${totalCount}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 县级降水数据摘要 */}
      {countyDataStats.dataCounties > 0 && (
        <TechCard title="县级降水数据摘要" badge={`${countyDataStats.dataCounties}县有数据`} className="scan-line">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 降水量最高Top5 */}
            <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/15">
              <p className="text-[10px] text-gw-muted mb-2 flex items-center gap-1">
                <TrendingUp size={10} className="text-blue-400" /> 降水量最高
              </p>
              <div className="space-y-1">
                {countyDataStats.topPrecip.map((c,_i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="text-gw-text">{c.name} <span className="text-gw-muted text-[9px]">{c.city}</span></span>
                    <span className="font-mono text-blue-400">{c.precip} mm</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 平均降水 */}
            <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/15 flex flex-col items-center justify-center">
              <p className="text-[10px] text-gw-muted mb-1">县级平均降水</p>
              <p className="text-2xl font-mono font-bold text-cyan-400">{countyDataStats.avgPrecip}</p>
              <p className="text-[10px] text-gw-muted">mm</p>
              <p className="text-[9px] text-gw-muted/60 mt-2">{countyDataStats.dataCounties}县算术平均</p>
            </div>

            {/* 降水量最低Top5 */}
            <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/15">
              <p className="text-[10px] text-gw-muted mb-2 flex items-center gap-1">
                <TrendingDown size={10} className="text-amber-400" /> 降水量最低
              </p>
              <div className="space-y-1">
                {countyDataStats.bottomPrecip.map((c,_i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="text-gw-text">{c.name} <span className="text-gw-muted text-[9px]">{c.city}</span></span>
                    <span className="font-mono text-amber-400">{c.precip} mm</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TechCard>
      )}
    </>
  );
}
