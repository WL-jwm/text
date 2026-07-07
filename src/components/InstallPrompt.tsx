import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** PWA安装提示组件：捕获beforeinstallprompt事件并提供安装按钮 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // 首次访问不立即显示，等用户使用一段时间后
    const timer = setTimeout(() => {
      setShowInstall(true);
    }, 60000); // 60秒后显示

    const handler = (e: Event) => {
      // 阻止默认的迷你安装信息条
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 检查是否已安装（iOS Safari不会触发beforeinstallprompt）
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // 监听安装完成事件
  useEffect(() => {
    const handler = () => setShowInstall(false);
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => setShowInstall(false);

  if (!showInstall || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9998] max-w-sm">
      <div className="bg-[#0f1d32]/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-2xl shadow-cyan-900/20 card-glow">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-cyan-300 mb-1">添加到主屏幕</p>
            <p className="text-xs text-gw-muted leading-relaxed">
              离线访问河北地下水数据库，断网也能浏览全部数据
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gw-muted hover:text-gw-muted transition-colors shrink-0 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
          >
            立即安装
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gw-muted text-xs transition-colors"
          >
            以后再说
          </button>
        </div>
      </div>
    </div>
  );
}
