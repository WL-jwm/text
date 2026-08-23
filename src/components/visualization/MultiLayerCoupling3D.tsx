/**
 * 3D多层含水层耦合（容器）
 * 场景逻辑见 useCouplingScene，几何体工厂见 coupling3dFactories，场景数据见 coupling3dTypes
 */

import { GitBranch, RotateCcw, Eye, EyeOff, Activity, ArrowDown, Info } from 'lucide-react';
import { TechCard } from '../UI';
import { useCouplingScene } from './useCouplingScene';
import { LAYERS, WELLS, LEAK_CONNECTIONS } from './coupling3dTypes';

export function MultiLayerCoupling3D() {
  const {
    containerRef,
    visibleLayers,
    showLeakage, setShowLeakage,
    showWells, setShowWells,
    autoRotate, setAutoRotate,
    resetCamera,
    toggleLayer,
  } = useCouplingScene();

  return (
    <div className="space-y-3">
      {/* 控制面板 */}
      <TechCard title="3D多层含水层耦合" icon={GitBranch} badge="Three.js r170">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {LAYERS.map((layer, idx) => (
              <button
                key={idx}
                onClick={() => toggleLayer(idx)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all"
                style={{
                  borderColor: visibleLayers.has(idx) ? layer.colorHex : '#334155',
                  color: visibleLayers.has(idx) ? layer.colorHex : '#64748b',
                  backgroundColor: visibleLayers.has(idx) ? `${layer.colorHex}15` : 'transparent',
                }}
              >
                {visibleLayers.has(idx) ? <Eye size={10} /> : <EyeOff size={10} />}
                <span>{layer.group}</span>
              </button>
            ))}
            <button
              onClick={() => setShowLeakage(!showLeakage)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${
                showLeakage
                  ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              <Activity size={10} />
              <span>越流粒子</span>
            </button>
            <button
              onClick={() => setShowWells(!showWells)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${
                showWells
                  ? 'border-red-500/40 text-red-400 bg-red-500/10'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              <ArrowDown size={10} />
              <span>开采井</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${
                autoRotate
                  ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              <RotateCcw size={10} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
              <span>自动旋转</span>
            </button>
            <button
              onClick={resetCamera}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border border-slate-600 text-slate-400 hover:text-cyan-400 transition-all"
            >
              <RotateCcw size={10} />
              <span>重置</span>
            </button>
          </div>
        </div>
      </TechCard>

      {/* 3D渲染区 */}
      <TechCard>
        <div
          ref={containerRef}
          className="w-full"
          style={{ height: '500px', minHeight: '400px' }}
        />
      </TechCard>

      {/* 越流参数 + 井信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TechCard title="层间越流参数" icon={ArrowDown}>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gw-muted border-b border-gw-border/20">
                  <th className="text-left py-1.5 px-2">越流通道</th>
                  <th className="text-right py-1.5 px-2">越流比例</th>
                  <th className="text-right py-1.5 px-2">强度评级</th>
                  <th className="text-left py-1.5 px-2">说明</th>
                </tr>
              </thead>
              <tbody>
                {LEAK_CONNECTIONS.map((conn, idx) => {
                  const fromLayer = LAYERS[conn.from];
                  const toLayer = LAYERS[conn.to];
                  if (!fromLayer || !toLayer) return null;
                  const rating = conn.rate >= 30 ? '强' : conn.rate >= 10 ? '中' : '弱';
                  const ratingColor = conn.rate >= 30 ? 'text-red-400' : conn.rate >= 10 ? 'text-amber-400' : 'text-green-400';
                  return (
                    <tr key={idx} className="border-b border-gw-border/10">
                      <td className="py-1.5 px-2">
                        <span className="text-gw-text">{conn.label}</span>
                        <span className="text-gw-muted ml-1">({fromLayer.group}→{toLayer.group})</span>
                      </td>
                      <td className="text-right py-1.5 px-2 font-mono text-cyan-400">{conn.rate}%</td>
                      <td className={`text-right py-1.5 px-2 font-medium ${ratingColor}`}>{rating}</td>
                      <td className="py-1.5 px-2 text-gw-muted">
                        {conn.rate >= 30 ? '主要越流通道' : conn.rate >= 10 ? '弱越流' : '极弱越流'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TechCard>

        <TechCard title="开采井信息" icon={Info}>
          <div className="space-y-1.5">
            {WELLS.map((well, idx) => {
              const layer = LAYERS[well.layer];
              if (!layer) return null;
              return (
                <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gw-surface/40 border border-gw-border/20">
                  <div>
                    <span className="text-xs font-medium text-gw-text">井 W{idx + 1}</span>
                    <span className="text-[10px] text-gw-muted ml-2">{layer.group}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-amber-400">{well.yield} m³/d</div>
                    <div className="text-[10px] text-gw-muted">深度 {well.depth}m</div>
                  </div>
                </div>
              );
            })}
          </div>
        </TechCard>
      </div>
    </div>
  );
}
