/**
 * F-02 3D可视化 — Three.js 多层含水层耦合3D
 *
 * 将E-03第一个子面板升级为真3D：
 *   1. 4组含水层立体结构（半透明地质体）
 *   2. 越流粒子动画（层间水流方向可视化）
 *   3. 开采井柱（深度+开采量映射）
 *   4. 补给方向箭头（大气降水/侧向径流）
 *   5. OrbitControls 全方位查看
 *   6. 层级信息面板 + 越流参数
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { GitBranch, RotateCcw, Eye, EyeOff, Activity, ArrowDown, Info } from 'lucide-react';
import { TechCard } from '../UI';
import { useThreeScene, type ThreeSceneContext } from '../../hooks/useThreeScene';

// ============================================================
// 数据
// ============================================================

interface CouplingLayer3D {
  group: string;
  topDepth: number;
  bottomDepth: number;
  age: string;
  lithology: string;
  K: string;
  Kavg: number;
  waterType: string;
  quality: string;
  rechargeSource: string;
  color: number;
  colorHex: string;
  leakRate: number;
}

const LAYERS: CouplingLayer3D[] = [
  { group: '第I含水组', topDepth: 0, bottomDepth: 50, age: '全新统(Q₄)', lithology: '砂砾石/中细砂', K: '10~50 m/d', Kavg: 30, waterType: '潜水-微承压', quality: 'HCO₃-Ca·Mg', rechargeSource: '大气降水/地表水入渗', color: 0x22c55e, colorHex: '#22c55e', leakRate: 0 },
  { group: '第II含水组', topDepth: 50, bottomDepth: 150, age: '上更新统(Q₃)', lithology: '中细砂/粉细砂', K: '5~20 m/d', Kavg: 12.5, waterType: '承压水', quality: 'HCO₃-Ca·Na', rechargeSource: '越流补给/侧向径流', color: 0x3b82f6, colorHex: '#3b82f6', leakRate: 35 },
  { group: '第III含水组', topDepth: 150, bottomDepth: 350, age: '中更新统(Q₂)', lithology: '细砂/粉砂', K: '2~8 m/d', Kavg: 5, waterType: '承压水', quality: 'HCO₃·SO₄-Na·Ca', rechargeSource: '侧向径流/越流(弱)', color: 0x8b5cf6, colorHex: '#8b5cf6', leakRate: 15 },
  { group: '第IV含水组', topDepth: 350, bottomDepth: 550, age: '下更新统(Q₁)', lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', Kavg: 1.75, waterType: '深层承压水', quality: 'HCO₃-Na(高氟)', rechargeSource: '侧向径流(极弱)', color: 0xf59e0b, colorHex: '#f59e0b', leakRate: 5 },
];

const LEAK_CONNECTIONS = [
  { from: 0, to: 1, rate: 35, label: 'I→II' },
  { from: 1, to: 2, rate: 15, label: 'II→III' },
  { from: 2, to: 3, rate: 5, label: 'III→IV' },
];

// 开采井数据
const WELLS = [
  { x: -60, z: 10, depth: 150, yield: 35, layer: 1 },
  { x: -20, z: -15, depth: 350, yield: 20, layer: 2 },
  { x: 30, z: 20, depth: 550, yield: 10, layer: 3 },
  { x: 60, z: -10, depth: 150, yield: 35, layer: 1 },
  { x: 0, z: 0, depth: 350, yield: 20, layer: 2 },
];

// 比例
const LAYER_WIDTH = 160;
const LAYER_DEPTH = 100;
const Y_SCALE = 0.35;

// ============================================================
// 主组件
// ============================================================

export function MultiLayerCoupling3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const [showLeakage, setShowLeakage] = useState(true);
  const [showWells, setShowWells] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  let sceneRef = useRef<ThreeSceneContext | null>(null);
  const layerMeshesRef = useRef<THREE.Mesh[]>([]);
  const leakGroupRef = useRef<THREE.Group | null>(null);
  const wellGroupRef = useRef<THREE.Group | null>(null);

  const initScene = useCallback((ctx: ThreeSceneContext) => {
    const { scene } = ctx;

    // 网格
    const grid = new THREE.GridHelper(300, 15, 0x334155, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // 创建含水层（立体块）
    LAYERS.forEach((layer, idx) => {
      const mesh = createCouplingLayerMesh(layer);
      mesh.visible = visibleLayers.has(idx);
      scene.add(mesh);
      layerMeshesRef.current[idx] = mesh;
    });

    // 越流粒子
    const leakGroup = new THREE.Group();
    LEAK_CONNECTIONS.forEach(conn => {
      const fromLayer = LAYERS[conn.from];
      const toLayer = LAYERS[conn.to];
      if (!fromLayer || !toLayer) return;

      const fromY = -fromLayer.bottomDepth * Y_SCALE;
      const toY = -toLayer.bottomDepth * Y_SCALE;

      // 创建多个粒子
      const particleCount = Math.max(3, Math.floor(conn.rate / 5));
      for (let p = 0; p < particleCount; p++) {
        const xOff = (Math.random() - 0.5) * LAYER_WIDTH * 0.6;
        const zOff = (Math.random() - 0.5) * LAYER_DEPTH * 0.6;

        // 粒子（小球）
        const pGeom = new THREE.SphereGeometry(1.2, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.8,
        });
        const particle = new THREE.Mesh(pGeom, pMat);
        particle.position.set(xOff, fromY, zOff);
        particle.userData = {
          startY: fromY,
          endY: toY,
          speed: 0.3 + Math.random() * 0.3,
          offset: (p / particleCount),
          xOff,
          zOff,
        };
        leakGroup.add(particle);
      }

      // 越流通道线
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, fromY, 0),
        new THREE.Vector3(0, toY, 0),
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x06b6d4,
        dashSize: 3,
        gapSize: 2,
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      line.computeLineDistances();
      leakGroup.add(line);
    });
    leakGroup.visible = showLeakage;
    scene.add(leakGroup);
    leakGroupRef.current = leakGroup;

    // 开采井
    const wellGroup = new THREE.Group();
    WELLS.forEach((well, idx) => {
      const wellY = -well.depth * Y_SCALE;
      const wellHeight = Math.abs(wellY);

      // 井管
      const pipeGeom = new THREE.CylinderGeometry(1, 1, wellHeight, 8);
      const pipeMat = new THREE.MeshPhongMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.7,
      });
      const pipe = new THREE.Mesh(pipeGeom, pipeMat);
      pipe.position.set(well.x, wellY / 2, well.z);
      wellGroup.add(pipe);

      // 井口标记
      const capGeom = new THREE.CylinderGeometry(2, 2, 3, 8);
      const capMat = new THREE.MeshPhongMaterial({ color: 0xfef08a });
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.position.set(well.x, 0, well.z);
      wellGroup.add(cap);

      // 开采量指示（球体大小映射）
      const yieldGeom = new THREE.SphereGeometry(well.yield / 15, 12, 12);
      const yieldMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.5,
      });
      const yieldMesh = new THREE.Mesh(yieldGeom, yieldMat);
      yieldMesh.position.set(well.x, wellY, well.z);
      yieldMesh.userData = { wellIndex: idx, yield: well.yield };
      wellGroup.add(yieldMesh);
    });
    wellGroup.visible = showWells;
    scene.add(wellGroup);
    wellGroupRef.current = wellGroup;

    // 补给箭头（大气降水向下入渗）
    const rechargeArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 15, 0),
      20,
      0x22c55e,
      5,
      3,
    );
    scene.add(rechargeArrow);

    // 侧向径流箭头
    const lateralArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-90, -25, 0),
      40,
      0x3b82f6,
      8,
      5,
    );
    scene.add(lateralArrow);

    // 标签
    const precipLabel = createTextSprite('大气降水入渗');
    precipLabel.position.set(0, 22, 0);
    precipLabel.scale.set(35, 8, 1);
    scene.add(precipLabel);

    const lateralLabel = createTextSprite('侧向径流 →');
    lateralLabel.position.set(-70, -25, 0);
    lateralLabel.scale.set(35, 8, 1);
    scene.add(lateralLabel);

    return () => {
      layerMeshesRef.current = [];
      leakGroupRef.current = null;
      wellGroupRef.current = null;
    };
  }, [visibleLayers, showLeakage, showWells]);

  sceneRef = useThreeScene(
    containerRef,
    {
      cameraPosition: [200, 120, 250],
      cameraTarget: [0, -50, 0],
      fov: 50,
      backgroundColor: 0x0a0f1a,
      ambientLightIntensity: 0.5,
      directionalLightIntensity: 0.9,
      enableShadows: false,
    },
    initScene,
  );

  // ── 越流粒子动画 ──
  useEffect(() => {
    if (!sceneRef.current || !leakGroupRef.current) return;
    const ctx = sceneRef.current;

    const unsub = ctx.registerAnimationFrame((_delta, elapsed) => {
      if (!leakGroupRef.current) return;
      leakGroupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.userData.startY !== undefined) {
          const ud = child.userData;
          const cycle = ((elapsed * ud.speed + ud.offset) % 1);
          child.position.y = ud.startY + (ud.endY - ud.startY) * cycle;
          // 透明度随位置变化
          const mat = child.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.8 * (1 - cycle * 0.5);
        }
      });
    });
    return unsub;
  }, [sceneRef]);

  // ── 自动旋转 ──
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.controls.autoRotate = autoRotate;
    sceneRef.current.controls.autoRotateSpeed = 0.5;
  }, [autoRotate, sceneRef]);

  // ── 显隐控制 ──
  useEffect(() => {
    layerMeshesRef.current.forEach((mesh, idx) => {
      if (mesh) mesh.visible = visibleLayers.has(idx);
    });
  }, [visibleLayers]);

  useEffect(() => {
    if (leakGroupRef.current) leakGroupRef.current.visible = showLeakage;
  }, [showLeakage]);

  useEffect(() => {
    if (wellGroupRef.current) wellGroupRef.current.visible = showWells;
  }, [showWells]);

  const resetCamera = useCallback(() => {
    if (!sceneRef.current) return;
    const { camera, controls } = sceneRef.current;
    camera.position.set(200, 120, 250);
    controls.target.set(0, -50, 0);
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

// ============================================================
// Three.js 几何体创建
// ============================================================

function createCouplingLayerMesh(layer: CouplingLayer3D): THREE.Mesh {
  const topY = -layer.topDepth * Y_SCALE;
  const bottomY = -layer.bottomDepth * Y_SCALE;
  const height = Math.abs(bottomY - topY);

  const geom = new THREE.BoxGeometry(LAYER_WIDTH, height, LAYER_DEPTH);
  const material = new THREE.MeshPhongMaterial({
    color: layer.color,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    shininess: 20,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = (topY + bottomY) / 2;

  // 边框
  const edges = new THREE.EdgesGeometry(geom);
  const edgeMat = new THREE.LineBasicMaterial({
    color: layer.color,
    transparent: true,
    opacity: 0.6,
  });
  const edgeLines = new THREE.LineSegments(edges, edgeMat);
  mesh.add(edgeLines);

  return mesh;
}

function createTextSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 254, 62);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  return new THREE.Sprite(material);
}
