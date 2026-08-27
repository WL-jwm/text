/**
 * G-06 WebWorker — useWorkerInterpolation（IDW 插值）
 *
 * 拆分自 useWorker.ts：Worker 化 IDW 插值，自动回退主线程。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { postTask } from './workerCore';
import {
  idwInterpolate,
  type IDWOptions,
  type InterpolationGrid,
  type InterpolationPoint,
} from '../utils/idwInterpolation';

export function useWorkerInterpolation(): {
  interpolate: (
    points: InterpolationPoint[],
    bounds?: { minLng: number; maxLng: number; minLat: number; maxLat: number },
    options?: IDWOptions,
  ) => Promise<InterpolationGrid>;
  usingWorker: boolean;
  lastElapsed: number;
} {
  const [usingWorker, setUsingWorker] = useState(false);
  const [lastElapsed, setLastElapsed] = useState(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => { cancelledRef.current = true; };
  }, []);

  const interpolate = useCallback(async (
    points: InterpolationPoint[],
    bounds?: { minLng: number; maxLng: number; minLat: number; maxLat: number },
    options?: IDWOptions,
  ): Promise<InterpolationGrid> => {
    const startTime = performance.now();

    // 尝试 Worker
    const workerPromise = postTask<InterpolationGrid>('idw', { points, bounds, options });
    if (workerPromise) {
      setUsingWorker(true);
      try {
        const result = await workerPromise;
        if (!cancelledRef.current) {
          setLastElapsed(performance.now() - startTime);
        }
        return result;
      } catch (err) {
        console.warn('[useWorkerInterpolation] Worker failed, falling back:', err);
      }
    }

    // 回退到主线程
    setUsingWorker(false);
    const result = idwInterpolate(points, bounds, options);
    if (!cancelledRef.current) {
      setLastElapsed(performance.now() - startTime);
    }
    return result;
  }, []);

  return { interpolate, usingWorker, lastElapsed };
}
