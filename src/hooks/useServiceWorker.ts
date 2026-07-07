import { useEffect, useState } from 'react';

interface SWRegistrationState {
  supported: boolean;
  registered: boolean;
  controller: ServiceWorker | null;
  updateAvailable: boolean;
}

/** Service Worker注册与更新管理Hook */
export function useServiceWorker() {
  const [state, setState] = useState<SWRegistrationState>({
    supported: 'serviceWorker' in navigator,
    registered: false,
    controller: null,
    updateAvailable: false,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js', {
          scope: './',
        });

        setState(prev => ({
          ...prev,
          registered: true,
          controller: registration.active,
        }));

        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本已安装，提示更新
              setState(prev => ({ ...prev, updateAvailable: true }));
            }
          });
        });

        // 监听SW控制权变更
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

      } catch (error) {
        console.warn('SW registration failed:', error);
      }
    };

    registerSW();
  }, []);

  /** 应用更新：通知SW跳过等待 */
  const applyUpdate = () => {
    if (state.controller) {
      // 重新注册以触发更新
      navigator.serviceWorker.getRegistration().then(reg => {
        reg?.update();
      });
    }
  };

  /** 清除动态缓存 */
  const clearCache = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  return { ...state, applyUpdate, clearCache };
}
