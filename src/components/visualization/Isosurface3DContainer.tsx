/**
 * G-03/G-04/G-06 Isosurface3DContainer
 *
 * 包装 Isosurface3D + Snapshot3DToolbar + 示例数据
 * 集成 IDW 插值（G-06 Worker 化）+ 3D 等值面渲染 + 截图导出
 */

import { useRef, useState, useEffect } from 'react';
import { Isosurface3D } from './Isosurface3D';
import { useWorkerInterpolation, useWorkerStatus } from '../../hooks/useWorker';
import type { InterpolationPoint, InterpolationGrid } from '../../utils/idwInterpolation';

// 河北省地下水监测站点示例数据（水位埋深 m）
const SAMPLE_POINTS: InterpolationPoint[] = [
  { x: 116.86, y: 38.31, value: 18.2, label: '沧州' },
  { x: 115.67, y: 37.73, value: 35.5, label: '衡水' },
  { x: 114.50, y: 37.07, value: 32.1, label: '邢台' },
  { x: 114.51, y: 38.05, value: 27.5, label: '石家庄' },
  { x: 115.47, y: 38.87, value: 23.0, label: '保定' },
  { x: 116.70, y: 39.54, value: 22.0, label: '廊坊' },
  { x: 114.31, y: 36.10, value: 40.2, label: '邯郸' },
  { x: 118.18, y: 39.62, value: 15.8, label: '唐山' },
  { x: 119.60, y: 39.94, value: 12.5, label: '秦皇岛' },
  { x: 117.20, y: 40.10, value: 20.3, label: '承德' },
  { x: 114.89, y: 40.82, value: 16.7, label: '张家口' },
];

export function Isosurface3DContainer(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const { interpolate, usingWorker, lastElapsed } = useWorkerInterpolation();
  const { available: workerAvailable } = useWorkerStatus();

  const [grid, setGrid] = useState<InterpolationGrid | null>(null);

  // Worker 化 IDW 插值
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await interpolate(SAMPLE_POINTS, undefined, {
        power: 2,
        resolution: 0.08,
        searchRadius: 1.5,
        minPoints: 3,
        maxPoints: 10,
      });
      if (!cancelled) setGrid(result);
    })();
    return () => { cancelled = true; };
  }, [interpolate]);

  // 直接从 canvas 截图
  const handleQuickCapture = (pixelRatio: number) => {
    const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const w = canvas.width * pixelRatio;
    const h = canvas.height * pixelRatio;
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = w;
    tmpCanvas.height = h;
    const ctx = tmpCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, 0, w, h);

    // 水印
    ctx.font = `bold ${w * 0.02}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('河北省地下水环境信息平台', w - 20, h - 20);
    ctx.font = `${w * 0.015}px monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText(new Date().toLocaleString('zh-CN'), 20, h - 20);

    const dataURL = tmpCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `isosurface3d-${Date.now()}.png`;
    a.click();
  };

  if (!grid) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-slate-900 rounded-lg border border-slate-700">
        <span className="text-sm text-slate-500">
          {usingWorker ? 'Worker 计算中...' : '插值计算中...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 截图工具栏 + Worker 状态 */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded border border-slate-700 flex-wrap">
        <span className="text-[10px] text-slate-500">3D 截图:</span>
        <button
          onClick={() => handleQuickCapture(1)}
          className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          PNG 1x
        </button>
        <button
          onClick={() => handleQuickCapture(2)}
          className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          PNG 2x
        </button>
        <button
          onClick={() => handleQuickCapture(4)}
          className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          PNG 4K
        </button>
        <div className="w-px h-4 bg-slate-600 mx-1" />
        {/* Worker 状态指示 */}
        <span className="text-[10px] flex items-center gap-1">
          <span
            className={`w-2 h-2 rounded-full ${workerAvailable ? 'bg-emerald-400' : 'bg-yellow-400'}`}
          />
          <span className={workerAvailable ? 'text-emerald-400' : 'text-yellow-400'}>
            {workerAvailable ? 'Worker' : '主线程'}
          </span>
        </span>
        {lastElapsed > 0 && (
          <span className="text-[10px] text-slate-600">
            {lastElapsed.toFixed(1)}ms
          </span>
        )}
        <span className="text-[10px] text-slate-600 ml-auto">
          {SAMPLE_POINTS.length} 站 · {grid.cols}×{grid.rows}
        </span>
      </div>

      {/* 3D 等值面 */}
      <div ref={containerRef}>
        <Isosurface3D
          grid={grid}
          points={SAMPLE_POINTS}
          dataType="waterLevel"
          zScale={0.3}
          showContours
          showStations
          showColorBar
        />
      </div>
    </div>
  );
}
