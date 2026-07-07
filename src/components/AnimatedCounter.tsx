/**
 * AnimatedCounter — 数字计数动画组件
 *
 * 在 KPI 卡片中展示数字时，从 0 到目标值平滑递增。
 * 支持整数、小数、千分位格式。
 *
 * 用法：
 *   <AnimatedCounter value={1234} duration={1200} />
 *   <AnimatedCounter value={85.6} suffix="%" decimals={1} />
 *   <AnimatedCounter value={1234567} format="compact" />
 */
import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** 目标数值 */
  value: number;
  /** 动画持续时间(ms)，默认 1000 */
  duration?: number;
  /** 小数位数，默认 0 */
  decimals?: number;
  /** 后缀 */
  suffix?: string;
  /** 前缀 */
  prefix?: string;
  /** 格式：'number' | 'compact'（万/亿），默认 'number' */
  format?: 'number' | 'compact';
  /** 延迟开始(ms) */
  delay?: number;
  /** 是否禁用动画 */
  disabled?: boolean;
  /** 额外类名 */
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  suffix = '',
  prefix = '',
  format = 'number',
  delay = 0,
  disabled = false,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(disabled ? value : 0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (disabled) {
      setDisplayValue(value);
      return;
    }

    const timer = setTimeout(() => {
      startTimeRef.current = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = value * eased;

        setDisplayValue(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, delay, disabled]);

  const formatted = formatValue(displayValue, format, decimals);

  return (
    <span className={`mono-number ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

function formatValue(value: number, format: 'number' | 'compact', decimals: number): string {
  if (format === 'compact') {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(2) + '亿';
    }
    if (value >= 10000) {
      return (value / 10000).toFixed(1) + '万';
    }
  }
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * AnimatedKPI — 带计数动画的 KPI 卡片包装
 *
 * 用法：
 *   <AnimatedKPI label="水资源总量" value={35.6} unit="亿m³" />
 */
interface AnimatedKPIProps {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  color?: string;
  icon?: React.ReactNode;
  decimals?: number;
  format?: 'number' | 'compact';
  delay?: number;
}

export function AnimatedKPI({
  label,
  value,
  unit,
  trend,
  trendLabel,
  color = '#06b6d4',
  icon,
  decimals = 1,
  format = 'number',
  delay = 0,
}: AnimatedKPIProps) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#f59e0b';

  return (
    <div className="card-glow rounded-xl p-3 md:p-4" style={{ borderColor: `${color}20` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] md:text-xs text-gw-muted tracking-wide uppercase">{label}</span>
        {icon && <span className="text-gw-muted/60">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg md:text-2xl font-bold" style={{ color }}>
          <AnimatedCounter value={value} decimals={decimals} format={format} delay={delay} />
        </span>
        {unit && <span className="text-[10px] md:text-xs text-gw-muted">{unit}</span>}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] font-mono" style={{ color: trendColor }}>{trendIcon}</span>
          {trendLabel && <span className="text-[9px] md:text-[10px] text-gw-muted">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * StaggerContainer — 交错入场动画容器
 *
 * 子元素依次淡入上移
 *
 * 用法：
 *   <StaggerContainer>
 *     <div>item 1</div>
 *     <div>item 2</div>
 *   </StaggerContainer>
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  as?: 'div' | 'section' | 'article';
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 50,
  as: Tag = 'div',
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = el.children;
    Array.from(items).forEach((child, i) => {
      (child as HTMLElement).style.opacity = '0';
      (child as HTMLElement).style.transform = 'translateY(12px)';
      (child as HTMLElement).style.transition = `opacity 0.4s cubic-bezier(0.16,1,0.3,1) ${i * staggerDelay}ms, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${i * staggerDelay}ms`;

      requestAnimationFrame(() => {
        (child as HTMLElement).style.opacity = '1';
        (child as HTMLElement).style.transform = 'translateY(0)';
      });
    });
  }, [children, staggerDelay]);

  return <Tag ref={containerRef} className={className}>{children}</Tag>;
}
