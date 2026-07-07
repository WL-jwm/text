import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * SectionAccordion - 章节折叠组件
 * 用于长页面中可折叠的章节，保持流畅的展开/收起动画
 */
interface SectionAccordionProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  /** 是否强制展开（覆盖用户折叠状态） */
  forceOpen?: boolean;
}

export function SectionAccordion({
  title,
  subtitle,
  badge,
  icon: Icon,
  defaultOpen = true,
  children,
  className = '',
  forceOpen,
}: SectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isExpanded = forceOpen !== undefined ? forceOpen : isOpen;

  return (
    <div className={`border border-gw-border/30 rounded-lg overflow-hidden transition-all ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gw-surface/40 hover:bg-gw-surface/60 transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-gw-cyan flex-shrink-0" />}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gw-text">{title}</span>
              {badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-gw-blue/15 text-gw-cyan border border-gw-blue/20">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-[10px] text-gw-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex-shrink-0 text-gw-muted group-hover:text-gw-cyan transition-colors">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Content */}
      <div
        className={`transition-all duration-200 ease-out overflow-hidden ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * SectionAccordionGroup - 多个折叠面板组
 * 支持手风琴模式（同时只展开一个）
 */
interface SectionAccordionGroupProps {
  sections: Array<{
    key: string;
    title: string;
    subtitle?: string;
    badge?: string | number;
    icon?: React.ElementType;
    content: React.ReactNode;
  }>;
  accordion?: boolean;    // 手风琴模式
  defaultOpen?: string;   // 默认展开的section key
  className?: string;
}

export function SectionAccordionGroup({
  sections,
  accordion = false,
  defaultOpen,
  className = '',
}: SectionAccordionGroupProps) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(defaultOpen ? [defaultOpen] : sections.map(s => s.key))
  );

  const toggle = (key: string) => {
    if (accordion) {
      setOpenKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.clear();
          next.add(key);
        }
        return next;
      });
    } else {
      setOpenKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {sections.map(section => {
        const isOpen = openKeys.has(section.key);
        const Icon = section.icon;
        return (
          <div key={section.key} className="border border-gw-border/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(section.key)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gw-surface/40 hover:bg-gw-surface/60 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="w-4 h-4 text-gw-cyan flex-shrink-0" />}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gw-text">{section.title}</span>
                    {section.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gw-blue/15 text-gw-cyan border border-gw-blue/20">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  {section.subtitle && <p className="text-[10px] text-gw-muted mt-0.5">{section.subtitle}</p>}
                </div>
              </div>
              <div className="flex-shrink-0 text-gw-muted group-hover:text-gw-cyan transition-colors">
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
            <div
              className={`transition-all duration-200 ease-out overflow-hidden ${
                isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 py-3">
                {section.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
