import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * SectionWithFold - 可折叠的页面章节
 * 包裹 TechCard 组件，提供标题行折叠按钮
 * 
 * Usage:
 *   <SectionWithFold title="章节标题" icon={IconName} badge="标签" defaultOpen={true}>
 *     <TechCard title="卡片1">...</TechCard>
 *     <TechCard title="卡片2">...</TechCard>
 *   </SectionWithFold>
 */
export function SectionWithFold({
  title,
  icon: Icon,
  badge,
  defaultOpen = true,
  children,
  className = '',
}: {
  title: string;
  icon?: React.ElementType;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-3 group">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gw-cyan/70" />}
          <h3 className="text-sm font-medium text-gw-text">{title}</h3>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gw-blue/15 text-gw-highlight border border-gw-blue/20">
              {badge}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-gw-muted/50 hover:text-gw-muted hover:bg-gw-surface/40 transition-all"
          title={open ? '折叠此章节' : '展开此章节'}
        >
          <ChevronDown
            size={13}
            className={`fold-toggle ${open ? '' : 'fold-closed'}`}
          />
          <span>{open ? '收起' : '展开'}</span>
        </button>
      </div>

      {/* 内容区 - 平滑展开/收起 */}
      <div className={`collapse-content ${open ? 'collapse-open' : 'collapse-closed'}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * useScrollRestoration - 滚动位置记忆 Hook
 * 路由切换时保存滚动位置，返回时恢复
 */
export function useScrollRestoration() {
  const scrollPositions = React.useRef<Record<string, number>>({});

  const savePosition = React.useCallback((key: string) => {
    scrollPositions.current[key] = window.scrollY;
  }, []);

  const restorePosition = React.useCallback((key: string) => {
    const pos = scrollPositions.current[key];
    if (pos !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: pos, behavior: 'instant' as ScrollBehavior });
      });
    }
  }, []);

  return { savePosition, restorePosition };
}
