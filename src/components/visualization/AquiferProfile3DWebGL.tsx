/**
 * F-02 3D可视化 — Three.js 含水层立体剖面
 *
 * 将V-02的SVG剖面升级为真3D：
 *   1. 4组含水层立体地质体（沿剖面方向延伸）
 *   2. 各层水头曲面（贝塞尔/线性插值）
 *   3. 钻孔标注（城市站点 + 深度刻度）
 *   4. 剖面方向切换（山前→滨海 / 滨海→山前）
 *   5. 层级显隐控制
 *   6. OrbitControls 旋转/缩放/平移
 *   7. 悬停高亮 + 信息面板
 * 主组件（常量/工具函数已拆分至 aquiferProfilePanels/）
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Layers3, Eye, EyeOff, RotateCcw, Info, Mountain, Waves } from 'lucide-react';
import { TechCard } from '../UI';
import { useThreeScene, type ThreeSceneContext } from '../../hooks/useThreeScene';
import { AQUIFER_LAYERS, PROFILE_STATIONS, SCALE_X, SCALE_Y, PROFILE_WIDTH, MAX_DEPTH } from './aquiferProfilePanels/aquiferProfileConstants';
import { createAquiferLayerMesh, createWaterHeadMesh, createTextSprite } from './aquiferProfilePanels/aquiferProfileUtils';

export function AquiferProfile3DWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [showWaterHead, setShowWaterHead] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  let sceneRef = useRef<ThreeSceneContext | null>(null);
  const layerMeshesRef = useRef<THREE.Mesh[]>([]);
  const waterHeadMeshesRef = useRef<THREE.Mesh[]>([]);
  const stationGroupRef = useRef<THREE.Group | null>(null);

  // ── 初始化场景 ──
  const initScene = useCallback((ctx: ThreeSceneContext) => {
    const { scene } = ctx;

    // 地表网格
    const gridHelper = new THREE.GridHelper(400, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // 创建含水层地质体
    AQUIFER_LAYERS.forEach((layer, idx) => {
      const mesh = createAquiferLayerMesh(layer, idx);
      mesh.visible = visibleLayers.has(idx);
      scene.add(mesh);
      layerMeshesRef.current[idx] = mesh;
    });

    // 创建水头曲面
    AQUIFER_LAYERS.forEach((layer, idx) => {
      const mesh = createWaterHeadMesh(layer, idx);
      mesh.visible = visibleLayers.has(idx) && showWaterHead;
      scene.add(mesh);
      waterHeadMeshesRef.current[idx] = mesh;
    });

    // 创建钻孔/站点标注
    const stationGroup = new THREE.Group();
    PROFILE_STATIONS.forEach((station, idx) => {
      const x = (station.distance - 150) * SCALE_X;
      const surfaceY = station.surfaceElev * SCALE_Y;

      // 钻孔柱
      const boreGeom = new THREE.CylinderGeometry(1.5, 1.5, MAX_DEPTH * SCALE_Y, 12);
      const boreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
      });
      const bore = new THREE.Mesh(boreGeom, boreMat);
      bore.position.set(x, surfaceY - (MAX_DEPTH * SCALE_Y) / 2, 0);
      stationGroup.add(bore);

      // 站点标记球
      const markerGeom = new THREE.SphereGeometry(3, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.set(x, surfaceY + 2, 0);
      marker.userData = { stationIndex: idx, station };
      stationGroup.add(marker);

      // 站点标签（使用Sprite + Canvas纹理）
      const label = createTextSprite(station.city);
      label.position.set(x, surfaceY + 10, 0);
      label.scale.set(30, 8, 1);
      stationGroup.add(label);
    });
    scene.add(stationGroup);
    stationGroupRef.current = stationGroup;

    // 方向指示箭头（山前→滨海）
    const arrowDir = new THREE.Vector3(1, 0, 0);
    const arrowOrigin = new THREE.Vector3(-180, -3, 0);
    const arrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 360, 0x06b6d4, 15, 8);
    scene.add(arrow);

    // 山前标签
    const mountainLabel = createTextSprite('山前 → 滨海');
    mountainLabel.position.set(0, 15, PROFILE_WIDTH / 2 + 10);
    mountainLabel.scale.set(50, 10, 1);
    scene.add(mountainLabel);

    // 自动旋转
    return () => {
      layerMeshesRef.current = [];
      waterHeadMeshesRef.current = [];
      stationGroupRef.current = null;
    };
  }, [visibleLayers, showWaterHead]);

  sceneRef = useThreeScene(
    containerRef,
    {
      cameraPosition: [250, 180, 350],
      cameraTarget: [0, -40, 0],
      fov: 45,
      backgroundColor: 0x0a0f1a,
      ambientLightIntensity: 0.5,
      directionalLightIntensity: 0.9,
    },
    initScene,
  );

  // ── 自动旋转 ──
  useEffect(() => {
    if (!sceneRef.current) return;
    const ctx = sceneRef.current;
    if (autoRotate) {
      const unsub = ctx.registerAnimationFrame(() => {
        ctx.controls.autoRotate = true;
        ctx.controls.autoRotateSpeed = 0.5;
      });
      return unsub;
    } else {
      ctx.controls.autoRotate = false;
    }
  }, [autoRotate, sceneRef]);

  // ── 层级显隐 ──
  useEffect(() => {
    layerMeshesRef.current.forEach((mesh, idx) => {
      if (mesh) mesh.visible = visibleLayers.has(idx);
    });
    waterHeadMeshesRef.current.forEach((mesh, idx) => {
      if (mesh) mesh.visible = visibleLayers.has(idx) && showWaterHead;
    });
  }, [visibleLayers, showWaterHead]);

  // ── 重置视角 ──
  const resetCamera = useCallback(() => {
    if (!sceneRef.current) return;
    const { camera, controls } = sceneRef.current;
    camera.position.set(250, 180, 350);
    controls.target.set(0, -40, 0);
    controls.update();
  }, [sceneRef]);

  const toggleLayer = (idx: number) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* 控制面板 */}
      <TechCard title="3D含水层剖面" icon={Layers3} badge="Three.js r170">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {AQUIFER_LAYERS.map((layer, idx) => (
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
                <span>{layer.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowWaterHead(!showWaterHead)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${
                showWaterHead
                  ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              <Waves size={10} />
              <span>水头曲面</span>
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
              <span>重置视角</span>
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

      {/* 站点信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TechCard title="剖面站点" icon={Mountain}>
          <div className="space-y-1.5">
            {PROFILE_STATIONS.map((station, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedStation(selectedStation === idx ? null : idx)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                  selectedStation === idx
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-gw-surface/40 border-gw-border/20 hover:border-gw-border/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gw-text">{station.city}</span>
                  <span className="text-[10px] text-gw-muted">{station.distance}km</span>
                </div>
                <div className="text-[10px] text-gw-muted mt-0.5">
                  地表标高 {station.surfaceElev}m · {station.note}
                </div>
                {selectedStation === idx && (
                  <div className="mt-2 space-y-1 pt-2 border-t border-gw-border/20">
                    {AQUIFER_LAYERS.map((layer, li) => (
                      <div key={li} className="flex items-center justify-between text-[10px]">
                        <span style={{ color: layer.colorHex }}>{layer.name}</span>
                        <span className="font-mono text-gw-text">
                          水头 {station.waterLevels[li]}m
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </TechCard>

        <TechCard title="含水层参数" icon={Info}>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-gw-muted border-b border-gw-border/20">
                  <th className="text-left py-1.5 px-2">含水组</th>
                  <th className="text-right py-1.5 px-2">深度(m)</th>
                  <th className="text-right py-1.5 px-2">K(m/d)</th>
                  <th className="text-left py-1.5 px-2">岩性</th>
                  <th className="text-left py-1.5 px-2">类型</th>
                </tr>
              </thead>
              <tbody>
                {AQUIFER_LAYERS.map((layer, idx) => (
                  <tr key={idx} className="border-b border-gw-border/10">
                    <td className="py-1.5 px-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.colorHex }} />
                        <span className="text-gw-text">{layer.name}</span>
                      </span>
                    </td>
                    <td className="text-right py-1.5 px-2 font-mono text-gw-muted">
                      {layer.topDepth}~{layer.bottomDepth}
                    </td>
                    <td className="text-right py-1.5 px-2 font-mono text-gw-muted">{layer.K}</td>
                    <td className="py-1.5 px-2 text-gw-muted">{layer.lithology}</td>
                    <td className="py-1.5 px-2 text-gw-muted">{layer.waterType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
