/**
 * 3D多层含水层耦合 — 场景逻辑 hook
 * 承载 Three.js 场景构建、动画帧、显隐控制、相机重置
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useThreeScene, type ThreeSceneContext } from '../../hooks/useThreeScene';
import { LAYERS, LEAK_CONNECTIONS, WELLS, Y_SCALE, LAYER_WIDTH, LAYER_DEPTH } from './coupling3dTypes';
import { createCouplingLayerMesh, createTextSprite } from './coupling3dFactories';

export function useCouplingScene() {
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
  return {
    containerRef,
    visibleLayers, setVisibleLayers,
    showLeakage, setShowLeakage,
    showWells, setShowWells,
    autoRotate, setAutoRotate,
    resetCamera,
    toggleLayer,
  };
}
