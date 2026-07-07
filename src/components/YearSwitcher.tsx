// ═══════════════════════════════════════════════════════════
// YearSwitcher - 可复用的年份选择器组件
// 支持按钮组/下拉两种模式，显示数据可用状态
// ═══════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronDown, Check, X } from 'lucide-react';

export interface YearOption {
  year: number;
  label?: string;
  available: boolean;      // 是否有完整数据
  note?: string;           // 数据说明
  dataSource?: string;     // 数据来源
}

export interface YearSwitcherProps {
  /** 可选年份列表 */
  years: YearOption[];
  /** 当前选中年份 */
  value: number;
  /** 切换回调 */
  onChange: (year: number) => void;
  /** 显示模式 */
  mode?: 'buttons' | 'dropdown';
  /** 紧凑模式（用于卡片内嵌） */
  compact?: boolean;
  /** 自定义样式 */
  className?: string;
}

export function YearSwitcher({
  years,
  value,
  onChange,
  mode = 'buttons',
  compact = false,
  className = '',
}: YearSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    if (mode !== 'dropdown') return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mode]);

  const current = years.find(y => y.year === value) ?? years[0];

  // ── 按钮模式 ──
  if (mode === 'buttons') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <CalendarDays size={compact ? 12 : 14} className="text-gw-muted/50 flex-shrink-0" />
        {years.map(y => (
          <button
            key={y.year}
            onClick={() => y.available && onChange(y.year)}
            disabled={!y.available}
            title={y.available ? (y.note ?? `${y.year}年数据`) : `${y.year}年数据暂未收录`}
            className={`
              text-[10px] sm:text-xs px-2 py-1 rounded font-mono transition-all
              ${value === y.year
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30 shadow-sm'
                : y.available
                  ? 'bg-gw-surface/30 text-gw-muted hover:text-gw-text hover:bg-gw-surface/60 border border-transparent'
                  : 'bg-gw-surface/10 text-gw-muted/30 border border-dashed border-gw-border/20 cursor-not-allowed line-through'
              }
            `}
          >
            {y.year}
            {!y.available && compact && (
              <span className="ml-0.5 opacity-40">—</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // ── 下拉模式 ──
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono
          bg-gw-card border border-gw-border/40 hover:border-gw-blue/40
          transition-all min-w-[80px]
          ${compact ? 'text-[10px] px-2 py-1' : ''}
        `}
      >
        <CalendarDays size={compact ? 10 : 12} className="text-gw-muted" />
        <span className="text-gw-text">{current.year}</span>
        {current.note && !compact && (
          <span className="text-gw-muted/50 ml-0.5">({current.note})</span>
        )}
        <ChevronDown size={compact ? 10 : 12} className={`text-gw-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-gw-card border border-gw-border/60 rounded-lg shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="p-1 space-y-0.5">
            {years.map(y => (
              <button
                key={y.year}
                onClick={() => {
                  if (y.available) {
                    onChange(y.year);
                    setOpen(false);
                  }
                }}
                disabled={!y.available}
                className={`
                  w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-all text-left
                  ${value === y.year
                    ? 'bg-gw-blue/15 text-gw-highlight'
                    : y.available
                      ? 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50'
                      : 'text-gw-muted/30 cursor-not-allowed'
                  }
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  y.available ? 'bg-emerald-400' : 'bg-gw-muted/30'
                }`} />
                <span className="font-mono">{y.year}</span>
                {y.note && <span className="text-gw-muted/50 ml-auto text-[9px]">{y.note}</span>}
                {value === y.year && <Check size={12} className="ml-auto text-gw-highlight" />}
                {!y.available && <X size={12} className="ml-auto text-gw-muted/30" />}
              </button>
            ))}
          </div>
          {current.dataSource && (
            <div className="px-3 py-1.5 border-t border-gw-border/30 text-[9px] text-gw-muted/40">
              {current.dataSource}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 多年份数据注册表 - 集中管理各数据模块的年份可用性
// ═══════════════════════════════════════════════════════════

import { cityBulletin2024, cityBulletin2022 } from '../data/resources';

export interface MultiYearDataEntry<T> {
  year: number;
  label: string;
  data: T;
  available: boolean;
  note?: string;
  dataSource?: string;
}

/** 水资源公报数据注册表 */
export const bulletinYearOptions: YearOption[] = [
  { year: 2024, available: true, note: '完整', dataSource: '河北省水资源公报2024' },
  { year: 2023, available: false, note: '暂无公报数据' },
  { year: 2022, available: true, note: '仅秦皇岛', dataSource: '河北省水资源公报2022' },
  { year: 2021, available: false, note: '暂无公报数据' },
  { year: 2020, available: false, note: '暂无公报数据' },
];

/** 根据年份获取对应公报数据 */
export function getBulletinData(year: number) {
  switch (year) {
    case 2024: return cityBulletin2024;
    case 2022: return cityBulletin2022;
    default: return cityBulletin2024; // fallback
  }
}

/** 水质趋势数据年份注册表 */
export const qualityYearOptions: YearOption[] = [
  { year: 2024, available: true, note: '完整' },
  { year: 2023, available: true, note: '完整' },
  { year: 2022, available: true, note: '完整' },
  { year: 2021, available: true, note: '完整' },
  { year: 2020, available: true, note: '完整' },
];

/** 开采量数据年份注册表 */
export const exploitationYearOptions: YearOption[] = [
  { year: 2024, available: true },
  { year: 2023, available: true },
  { year: 2022, available: true },
  { year: 2021, available: true },
  { year: 2020, available: true },
  { year: 2019, available: true },
  { year: 2018, available: true },
  { year: 2017, available: true },
  { year: 2016, available: true },
  { year: 2015, available: true },
  { year: 2014, available: true },
];
