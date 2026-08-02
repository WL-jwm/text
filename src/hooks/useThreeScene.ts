/**
 * F-02 3D可视化 — 通用Three.js容器Hook
 *
 * 封装Three.js场景生命周期管理：
 *   - 场景/相机/渲染器自动初始化与销毁
 *   - OrbitControls轨道控制
 *   - 响应式canvas尺寸
 *   - 自定义动画帧回调
 *   - 主题色适配
 */

import { useEffect, useRef, useCallback, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ThreeSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  /** 每帧回调（可注册多个） */
  registerAnimationFrame: (fn: (delta: number, elapsed: number) => void) => () => void;
}

export interface ThreeContainerOptions {
  /** 初始相机位置 */
  cameraPosition?: [number, number, number];
  /** 相机目标点 */
  cameraTarget?: [number, number, number];
  /** FOV */
  fov?: number;
  /** 背景色 */
  backgroundColor?: number;
  /** 环境光强度 */
  ambientLightIntensity?: number;
  /** 方向光强度 */
  directionalLightIntensity?: number;
  /** 是否启用阴影 */
  enableShadows?: boolean;
  /** 近裁面 */
  near?: number;
  /** 远裁面 */
  far?: number;
}

/**
 * useThreeScene — Three.js场景生命周期管理
 *
 * @param containerRef 容器div的ref
 * @param options 配置选项
 * @param onInit 场景初始化回调（在scene/camera/renderer/controls创建后调用）
 *
 * @returns ref持有ThreeSceneContext
 */
export function useThreeScene(
  containerRef: MutableRefObject<HTMLDivElement | null>,
  options: ThreeContainerOptions = {},
  onInit?: (ctx: ThreeSceneContext) => void | (() => void),
): MutableRefObject<ThreeSceneContext | null> {
  const ctxRef = useRef<ThreeSceneContext | null>(null);
  const onInitRef = useRef(onInit);
  const optionsRef = useRef(options);

  useEffect(() => {
    onInitRef.current = onInit;
  }, [onInit]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const opts = optionsRef.current;

    // ── 场景 ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(opts.backgroundColor ?? 0x0f172a);

    // ── 相机 ──
    const camera = new THREE.PerspectiveCamera(
      opts.fov ?? 50,
      width / height,
      opts.near ?? 0.1,
      opts.far ?? 5000,
    );
    const [camX, camY, camZ] = opts.cameraPosition ?? [200, 150, 300];
    camera.position.set(camX, camY, camZ);
    const [tgtX, tgtY, tgtZ] = opts.cameraTarget ?? [0, 0, 0];
    camera.lookAt(tgtX, tgtY, tgtZ);

    // ── 渲染器 ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (opts.enableShadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    container.appendChild(renderer.domElement);
    renderer.domElement.style.borderRadius = '8px';
    renderer.domElement.style.cursor = 'grab';

    // ── 控制器 ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(tgtX, tgtY, tgtZ);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 50;
    controls.maxDistance = 1500;

    // ── 灯光 ──
    const ambient = new THREE.AmbientLight(0xffffff, opts.ambientLightIntensity ?? 0.4);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, opts.directionalLightIntensity ?? 0.8);
    directional.position.set(100, 200, 150);
    if (opts.enableShadows) {
      directional.castShadow = true;
      directional.shadow.mapSize.width = 2048;
      directional.shadow.mapSize.height = 2048;
      directional.shadow.camera.near = 0.5;
      directional.shadow.camera.far = 1000;
      directional.shadow.camera.left = -500;
      directional.shadow.camera.right = 500;
      directional.shadow.camera.top = 500;
      directional.shadow.camera.bottom = -500;
    }
    scene.add(directional);

    const directional2 = new THREE.DirectionalLight(0x88aaff, 0.3);
    directional2.position.set(-100, 100, -150);
    scene.add(directional2);

    // ── 动画帧管理 ──
    const animFns = new Set<(delta: number, elapsed: number) => void>();
    const registerAnimationFrame = (fn: (delta: number, elapsed: number) => void) => {
      animFns.add(fn);
      return () => animFns.delete(fn);
    };

    const ctx: ThreeSceneContext = {
      scene,
      camera,
      renderer,
      controls,
      registerAnimationFrame,
    };
    ctxRef.current = ctx;

    // ── 用户初始化 ──
    let cleanup: void | (() => void);
    if (onInitRef.current) {
      cleanup = onInitRef.current(ctx);
    }

    // ── 渲染循环 ──
    const clock = new THREE.Clock();
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      controls.update();
      animFns.forEach(fn => fn(delta, elapsed));
      renderer.render(scene, camera);
    };
    animate();

    // ── 响应式 ──
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ── 清理 ──
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();
      if (cleanup && typeof cleanup === 'function') cleanup();
      // 释放几何体和材质
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      ctxRef.current = null;
    };
  }, []);

  const registerAnimationFrame = useCallback((fn: (delta: number, elapsed: number) => void) => {
    if (ctxRef.current) {
      return ctxRef.current.registerAnimationFrame(fn);
    }
    return () => {};
  }, []);

  // 提供一个稳定的registerAnimationFrame
  useEffect(() => {
    // 将registerAnimationFrame附加到ctxRef上以便外部使用
    if (ctxRef.current) {
      (ctxRef.current as ThreeSceneContext & { _stableRegister?: typeof registerAnimationFrame })._stableRegister = registerAnimationFrame;
    }
  }, [registerAnimationFrame]);

  return ctxRef;
}
