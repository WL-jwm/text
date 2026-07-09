// 时间序列分析 - 选择器组件
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useCallback, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TechCard } from '../components/UI';
import { CITY_COLORS, ALL_CITIES, BASELINE_YEARS, CITY_GROUPS } from './timeSeriesUtils';

export function CitySelector({ selected, onToggle, onAll, onClear }: {
  selected: Set<string>;
  onToggle: (city: string) => void;
  onAll: () => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback((city: string) => {
    onToggle(city);
  }, [onToggle]);

  return (
    <TechCard title="城市筛选" badge={`${selected.size}/${ALL_CITIES.length}`} className="relative">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onAll} className="text-[10px] px-2 py-0.5 rounded bg-gw-blue/20 text-gw-highlight hover:bg-gw-blue/30 transition-colors">
          全选
        </button>
        <button onClick={onClear} className="text-[10px] px-2 py-0.5 rounded bg-gw-surface/50 text-gw-muted hover:bg-gw-surface transition-colors">
          清空
        </button>
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] px-2 py-0.5 rounded bg-gw-surface/50 text-gw-muted hover:bg-gw-surface transition-colors flex items-center gap-1">
          {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          {expanded ? '收起' : '展开'}
        </button>
      </div>
      {/* 已选标签 */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selected.size === 0 && <span className="text-[10px] text-gw-muted/50">点击城市名选择</span>}
        {ALL_CITIES.filter(c => selected.has(c)).map(city => (
          <span
            key={city}
            onClick={() => toggle(city)}
            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-all"
            style={{ backgroundColor: `${CITY_COLORS[city]}20`, color: CITY_COLORS[city], border: `1px solid ${CITY_COLORS[city]}40` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CITY_COLORS[city] }} />
            {city}
            <span className="opacity-50">×</span>
          </span>
        ))}
      </div>
      {/* 展开列表 */}
      {expanded && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-1 mt-1 pt-2 border-t border-gw-border/30">
          {ALL_CITIES.map(city => (
            <button
              key={city}
              onClick={() => toggle(city)}
              className={`text-[10px] px-2 py-1 rounded transition-all text-left truncate ${
                selected.has(city) ? 'ring-1 ring-gw-blue/40' : 'hover:bg-gw-surface/50'
              }`}
              style={{
                backgroundColor: selected.has(city) ? `${CITY_COLORS[city]}15` : undefined,
                color: selected.has(city) ? CITY_COLORS[city] : undefined,
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-0.5" style={{ backgroundColor: CITY_COLORS[city] }} />
              {city}
            </button>
          ))}
        </div>
      )}
    </TechCard>
  );
}

// ── 城市分组选择器 ──
export function GroupSelector({ onSelect }: { onSelect: (cities: string[]) => void }) {
  return (
    <TechCard title="水文地质分组" badge={Object.keys(CITY_GROUPS).length + '组'}>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(CITY_GROUPS).map(([key, group]) => (
          <button
            key={key}
            onClick={() => onSelect(group.cities)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] transition-all border"
            style={{
              backgroundColor: `${group.color}15`,
              borderColor: `${group.color}30`,
              color: group.color,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
            {group.label}
            <span className="opacity-60">({group.cities.length}市)</span>
          </button>
        ))}
      </div>
      <div className="mt-2 text-[9px] text-gw-muted">点击分组可快速选中该区域所有城市</div>
    </TechCard>
  );
}

// ── 基准年选择器 ──
export function BaselineSelector({ baseline, onChange }: { baseline: number; onChange: (y: number) => void }) {
  return (
    <TechCard title="对比基准年" badge={String(baseline)}>
      <div className="flex flex-wrap gap-1">
        {BASELINE_YEARS.map(y => (
          <button
            key={y}
            onClick={() => onChange(y)}
            className={`px-2 py-0.5 rounded text-[10px] transition-all ${baseline === y ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted border border-gw-border/30 hover:border-gw-blue/20'}`}
          >{y}</button>
        ))}
      </div>
    </TechCard>
  );
}

// ── 趋势预测 Tab ──
