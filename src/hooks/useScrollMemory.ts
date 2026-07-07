import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollMemory - 路由切换时记住滚动位置，返回时恢复
 * 使用 sessionStorage 存储每个路由的滚动偏移量
 */
export function useScrollMemory() {
  const location = useLocation();
  const isRestoredRef = useRef(false);

  useEffect(() => {
    // 首次加载或前进导航: 恢复之前保存的位置
    if (!isRestoredRef.current) {
      const savedY = sessionStorage.getItem(`scroll_${location.pathname}`);
      if (savedY) {
        const y = parseFloat(savedY);
        // 延迟恢复确保DOM已渲染
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
        });
      } else {
        // 新页面滚动到顶部
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
      isRestoredRef.current = true;
    } else {
      // 新导航: 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }

    // 页面离开时保存当前位置
    return () => {
      sessionStorage.setItem(`scroll_${location.pathname}`, String(window.scrollY));
      isRestoredRef.current = false;
    };
  }, [location.pathname]);

  // 监听浏览器前进/后退
  useEffect(() => {
    const handlePopState = () => {
      isRestoredRef.current = false;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
