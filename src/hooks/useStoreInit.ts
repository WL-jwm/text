import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * 应用启动时自动初始化 IndexedDB，加载用户数据到 Zustand。
 * 在 App 根组件调用一次即可。
 */
export function useStoreInit() {
  const init = useAppStore(s => s.init);

  useEffect(() => {
    init();
  }, [init]);
}
