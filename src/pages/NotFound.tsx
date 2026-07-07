import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Home, ArrowLeft, Radar } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated radar icon */}
        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gw-blue/20 to-gw-cyan/10 border border-gw-border/60 flex items-center justify-center card-glow hud-corners">
            <Radar size={44} className="text-gw-cyan animate-pulse" />
          </div>
          <div className="absolute -inset-3 rounded-3xl border border-gw-cyan/10 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-6 rounded-[2rem] border border-gw-blue/5" />
          {/* Scan line overlay */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gw-cyan/30 to-transparent scan-line" />
          </div>
        </div>

        {/* Error code */}
        <div>
          <h1 className="text-7xl font-mono font-bold text-gw-text/10 tracking-widest">
            <span className="text-glow-cyan text-gw-cyan/30">4</span>0<span className="text-glow-cyan text-gw-cyan/30">4</span>
          </h1>
          <p className="text-lg text-gw-muted mt-3 tracking-wide">信号未捕获</p>
          <p className="text-sm text-gw-muted/50 mt-1 font-mono">
            正在搜索目标区域{dots}
          </p>
        </div>

        {/* Grid decoration */}
        <div className="h-px bg-gradient-to-r from-transparent via-gw-border/40 to-transparent" />

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-gw-muted hover:text-gw-text bg-gw-card/80 border border-gw-border/60 hover:border-gw-cyan/40 rounded-lg transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <ArrowLeft size={16} />
            返回上页
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-gradient-to-r from-gw-blue to-gw-cyan hover:from-gw-blue/90 hover:to-gw-cyan/90 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
          >
            <Home size={16} />
            返回总览
          </button>
        </div>

        {/* Tech decoration */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Droplets size={10} className="text-gw-cyan/30" />
            <div className="h-px w-12 bg-gw-cyan/20" />
            <span className="text-[10px] text-gw-muted/25 font-mono tracking-wider">河北地下水基础资料数据库</span>
            <div className="h-px w-12 bg-gw-cyan/20" />
            <Droplets size={10} className="text-gw-cyan/30" />
          </div>
          <p className="text-[10px] text-gw-muted/20 font-mono">GWB-DB v2.0 | 22 SHEETS | 18 MODULES</p>
        </div>
      </div>
    </div>
  );
}
