import { useState, useTransition, useCallback, type Dispatch, type SetStateAction } from 'react';

/**
 * useTabTransition — 带过渡动画的 Tab 切换 Hook
 *
 * 用 useTransition 包裹 activeTab 状态更新，
 * 使切换 Tab 时当前内容保持可交互（pending 期间旧面板不卸载），
 * 直到新面板渲染完成后再替换。
 *
 * Usage (drop-in replacement for useState):
 *   // Before:
 *   const [activeTab, setActiveTab] = useState('overview');
 *   // After:
 *   const [activeTab, setActiveTab, isPending] = useTabTransition('overview');
 *
 * isPending 可用于给 Tab 内容区添加过渡样式（如 opacity 降低）。
 */
export function useTabTransition<T extends string>(
  initialTab: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabRaw] = useState<T>(initialTab);

  const setActiveTab = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    startTransition(() => {
      setActiveTabRaw(action);
    });
  }, [startTransition]);

  return [activeTab, setActiveTab, isPending];
}
