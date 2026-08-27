/**
 * G-06 WebWorker — useWorkerContours（等值线提取）
 *
 * 拆分自 useWorker.ts：Worker 化等值线提取，回退内联 Marching Squares。
 */

import { useCallback, useState } from 'react';
import { postTask } from './workerCore';
import type { InterpolationGrid } from '../utils/idwInterpolation';
import type { ContourSegment } from './workerTypes';

export function useWorkerContours(): {
  extractContours: (
    grid: InterpolationGrid,
    levels: number[],
  ) => Promise<ContourSegment[]>;
  usingWorker: boolean;
} {
  const [usingWorker, setUsingWorker] = useState(false);

  const extractContours = useCallback(async (
    grid: InterpolationGrid,
    levels: number[],
  ): Promise<ContourSegment[]> => {
    // 尝试 Worker
    const workerPromise = postTask<ContourSegment[]>('contours', { grid, levels });
    if (workerPromise) {
      setUsingWorker(true);
      try {
        return await workerPromise;
      } catch (err) {
        console.warn('[useWorkerContours] Worker failed, falling back:', err);
      }
    }

    // 回退：在主线程执行（内联 Marching Squares）
    setUsingWorker(false);
    const segments: ContourSegment[] = [];
    const { values, cols, rows, nodata } = grid;

    for (const level of levels) {
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const v00 = values[r]?.[c] ?? nodata;
          const v10 = values[r]?.[c + 1] ?? nodata;
          const v01 = values[r + 1]?.[c] ?? nodata;
          const v11 = values[r + 1]?.[c + 1] ?? nodata;
          if (v00 === nodata || v10 === nodata || v01 === nodata || v11 === nodata) continue;

          const x0 = c, x1 = c + 1, y0 = r, y1 = r + 1;
          const edgePoints: Array<[number, number, number]> = [];

          if ((v00 - level) * (v10 - level) < 0) {
            const t = (level - v00) / (v10 - v00);
            edgePoints.push([x0 + t * (x1 - x0), y0, level]);
          }
          if ((v10 - level) * (v11 - level) < 0) {
            const t = (level - v10) / (v11 - v10);
            edgePoints.push([x1, y0 + t * (y1 - y0), level]);
          }
          if ((v01 - level) * (v11 - level) < 0) {
            const t = (level - v01) / (v11 - v01);
            edgePoints.push([x0 + t * (x1 - x0), y1, level]);
          }
          if ((v00 - level) * (v01 - level) < 0) {
            const t = (level - v00) / (v01 - v00);
            edgePoints.push([x0, y0 + t * (y1 - y0), level]);
          }

          if (edgePoints.length >= 2) {
            segments.push({
              x1: edgePoints[0]![0], y1: edgePoints[0]![1], z1: edgePoints[0]![2],
              x2: edgePoints[1]![0], y2: edgePoints[1]![1], z2: edgePoints[1]![2],
              level,
            });
          }
        }
      }
    }

    return segments;
  }, []);

  return { extractContours, usingWorker };
}
