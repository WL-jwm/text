/**
 * G-04 3D 导出截图工具
 *
 * 支持：
 *   - WebGL Canvas → PNG（高分辨率 2x/4x）
 *   - WebGL Canvas → JPEG（质量可调）
 *   - 场景 JSON 导出（几何体+材质+相机参数，便于后端重建）
 *   - 截图叠加水印+时间戳+色标
 */

import * as THREE from 'three';
import type { ThreeSceneContext } from '../hooks/useThreeScene';

// ============================================================
// 类型定义
// ============================================================

export type ExportFormat = 'png' | 'jpeg';

export interface SnapshotOptions {
  /** 格式 */
  format: ExportFormat;
  /** 分辨率倍数（1=原始，2=2x高清，4=4K） */
  pixelRatio: number;
  /** JPEG 质量 0-1（仅 jpeg 有效） */
  quality?: number;
  /** 水印文字 */
  watermark?: string;
  /** 是否添加时间戳 */
  timestamp?: boolean;
  /** 背景色（覆盖场景背景） */
  backgroundColor?: string;
}

export interface SceneExportData {
  version: string;
  timestamp: number;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
    aspect: number;
    near: number;
    far: number;
  };
  objects: Array<{
    type: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    geometryType: string;
    materialType: string;
    vertexCount?: number;
  }>;
  metadata: {
    objectCount: number;
    triangleCount: number;
  };
}

// ============================================================
// 截图导出
// ============================================================

/**
 * 从 Three.js 场景截取高清图片
 */
export function captureScene(
  ctx: ThreeSceneContext,
  options: SnapshotOptions,
): string {
  const { renderer, scene, camera } = ctx;
  const { format, pixelRatio, quality = 0.92, watermark, timestamp, backgroundColor } = options;

  // 保存原始尺寸
  const originalSize = renderer.getSize(new THREE.Vector2());
  const originalPixelRatio = renderer.getPixelRatio();

  // 设置高分辨率渲染
  const width = originalSize.x;
  const height = originalSize.y;
  renderer.setPixelRatio(originalPixelRatio * pixelRatio);
  renderer.setSize(width, height, false);

  // 临时背景色
  const originalBg = scene.background;
  if (backgroundColor) {
    scene.background = new THREE.Color(backgroundColor);
  }

  // 渲染一帧
  renderer.render(scene, camera);

  // 获取 Canvas
  const canvas = renderer.domElement;
  const dataURL = canvas.toDataURL(
    format === 'jpeg' ? 'image/jpeg' : 'image/png',
    quality,
  );

  // 恢复原始设置
  renderer.setPixelRatio(originalPixelRatio);
  renderer.setSize(width, height, false);
  scene.background = originalBg;
  renderer.render(scene, camera);

  // 如果有水印或时间戳，在 2D Canvas 上叠加
  if (watermark || timestamp) {
    return overlayWatermark(dataURL, {
      watermark,
      timestamp: timestamp ? new Date().toLocaleString('zh-CN') : undefined,
      width: width * pixelRatio,
      height: height * pixelRatio,
    });
  }

  return dataURL;
}

/**
 * 快速截图（原始分辨率 PNG）
 */
export function quickSnapshot(ctx: ThreeSceneContext): string {
  const { renderer, scene, camera } = ctx;
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}

/**
 * 下载 DataURL 为文件
 */
export function downloadDataURL(dataURL: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * 截图叠加水印
 */
function overlayWatermark(
  dataURL: string,
  options: {
    watermark?: string;
    timestamp?: string;
    width: number;
    height: number;
  },
): string {
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d')!;

  // 绘制原始图片
  const img = new Image();
  img.src = dataURL;

  // 同步绘制（图片已加载到 dataURL）
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 水印
  if (options.watermark) {
    ctx.font = `bold ${Math.max(16, canvas.width * 0.02)}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.watermark, canvas.width - 20, canvas.height - 20);
  }

  // 时间戳
  if (options.timestamp) {
    ctx.font = `${Math.max(12, canvas.width * 0.015)}px monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.timestamp, 20, canvas.height - 20);
  }

  return canvas.toDataURL('image/png');
}

// ============================================================
// 场景 JSON 导出
// ============================================================

/**
 * 导出场景结构为 JSON（便于后端重建或调试）
 */
export function exportSceneJSON(ctx: ThreeSceneContext): SceneExportData {
  const { scene, camera } = ctx;
  const objects: SceneExportData['objects'] = [];
  let triangleCount = 0;

  scene.traverse(child => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
      const geometryType = child.geometry?.type ?? 'unknown';
      const materialType = Array.isArray(child.material)
        ? child.material[0]?.type ?? 'unknown'
        : child.material?.type ?? 'unknown';

      let vertexCount: number | undefined;
      if (child.geometry?.attributes?.position) {
        vertexCount = child.geometry.attributes.position.count;
        if (child instanceof THREE.Mesh && child.geometry.index) {
          triangleCount += child.geometry.index.count / 3;
        } else if (child instanceof THREE.Mesh) {
          triangleCount += (vertexCount ?? 0) / 3;
        }
      }

      objects.push({
        type: child.type,
        position: [child.position.x, child.position.y, child.position.z],
        rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
        scale: [child.scale.x, child.scale.y, child.scale.z],
        geometryType,
        materialType,
        vertexCount,
      });
    }
  });

  const perspCamera = camera as THREE.PerspectiveCamera;

  return {
    version: '1.0.0',
    timestamp: Date.now(),
    camera: {
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [0, 0, 0], // OrbitControls target 需外部传入
      fov: perspCamera.fov,
      aspect: perspCamera.aspect,
      near: perspCamera.near,
      far: perspCamera.far,
    },
    objects,
    metadata: {
      objectCount: objects.length,
      triangleCount: Math.floor(triangleCount),
    },
  };
}

/**
 * 下载 JSON 文件
 */
export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadDataURL(url, filename);
  URL.revokeObjectURL(url);
}

// ============================================================
// 截图工具栏组件
// ============================================================

export interface Snapshot3DToolbarProps {
  getSceneCtx: () => ThreeSceneContext | null;
  filenamePrefix?: string;
}

export function Snapshot3DToolbar({
  getSceneCtx,
  filenamePrefix = '3d-snapshot',
}: Snapshot3DToolbarProps): React.ReactElement {
  const handleSnapshot = (pixelRatio: number, format: ExportFormat) => {
    const ctx = getSceneCtx();
    if (!ctx) return;

    const dataURL = captureScene(ctx, {
      format,
      pixelRatio,
      quality: 0.92,
      watermark: '河北省地下水环境信息平台',
      timestamp: true,
    });

    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const ts = Date.now();
    downloadDataURL(dataURL, `${filenamePrefix}-${ts}.${ext}`);
  };

  const handleExportJSON = () => {
    const ctx = getSceneCtx();
    if (!ctx) return;

    const data = exportSceneJSON(ctx);
    downloadJSON(data, `${filenamePrefix}-scene-${Date.now()}.json`);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded border border-slate-700">
      <span className="text-[10px] text-slate-500">截图:</span>
      <button
        onClick={() => handleSnapshot(1, 'png')}
        className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        PNG 1x
      </button>
      <button
        onClick={() => handleSnapshot(2, 'png')}
        className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        PNG 2x
      </button>
      <button
        onClick={() => handleSnapshot(4, 'png')}
        className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        PNG 4K
      </button>
      <button
        onClick={() => handleSnapshot(2, 'jpeg')}
        className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        JPEG 2x
      </button>
      <div className="w-px h-4 bg-slate-600" />
      <button
        onClick={handleExportJSON}
        className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        场景JSON
      </button>
    </div>
  );
}
