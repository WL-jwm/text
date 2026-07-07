import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

/** 网络状态监测组件：离线时显示Banner提示 */
export default function OfflineBanner() {
  const [, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [justCameBack, setJustCameBack] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
      setJustCameBack(false);
    };
    const goOnline = () => {
      setIsOffline(false);
      setJustCameBack(true);
      // 3秒后自动关闭恢复提示
      setTimeout(() => {
        setShowBanner(false);
        setJustCameBack(false);
      }, 3000);
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!showBanner) return null;

  // 网络恢复提示
  if (justCameBack) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-600/90 backdrop-blur-sm text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2 animate-[slideDown_0.3s_ease-out] shadow-lg shadow-emerald-900/30">
        <CheckCircle className="w-4 h-4" />
        <span>网络已恢复，数据已同步至最新</span>
      </div>
    );
  }

  // 离线提示
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600/90 backdrop-blur-sm text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-3 animate-[slideDown_0.3s_ease-out] shadow-lg shadow-amber-900/30">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>当前处于离线状态，正在浏览缓存数据</span>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors text-xs shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        重试连接
      </button>
    </div>
  );
}
