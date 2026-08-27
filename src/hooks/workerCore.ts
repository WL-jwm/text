/**
 * G-06 WebWorker — Worker 管理核心
 *
 * 拆分自 useWorker.ts：Worker 单例 / 任务队列 / 通用调用 / 可用性检测
 */

import type {
  WorkerRequest,
  WorkerResponse,
  WorkerTask,
} from '../workers/analysis.worker';

let workerInstance: Worker | null = null;
export let workerReady = false;

/** 任务计数器 */
let taskCounter = 1;

/** 待处理任务的 Promise resolve/reject */
const pendingTasks = new Map<number, {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  startTime: number;
}>();

/**
 * 获取 Worker 实例（如果支持）
 */
export function getWorker(): Worker | null {
  if (workerInstance !== null) return workerInstance;

  try {
    // Vite 支持 new URL + import.meta.url 语法打包 Worker
    workerInstance = new Worker(
      new URL('../workers/analysis.worker.ts', import.meta.url),
      { type: 'module' },
    );

    workerInstance.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { taskId, success, result, error } = e.data;

      // ready 消息
      if (taskId === 0) {
        workerReady = true;
        console.debug('[WorkerClient] Worker ready');
        return;
      }

      const pending = pendingTasks.get(taskId);
      if (!pending) return;

      pendingTasks.delete(taskId);

      if (success) {
        pending.resolve(result);
      } else {
        pending.reject(new Error(error ?? 'Unknown worker error'));
      }
    };

    workerInstance.onerror = (err) => {
      console.error('[WorkerClient] Worker error:', err);
      // 通知所有待处理任务失败
      pendingTasks.forEach((pending, taskId) => {
        pending.reject(new Error('Worker crashed'));
        pendingTasks.delete(taskId);
      });
    };

    return workerInstance;
  } catch (err) {
    console.warn('[WorkerClient] Worker creation failed, falling back to main thread:', err);
    return null;
  }
}

/**
 * 检查 Worker 是否可用
 */
export function isWorkerAvailable(): boolean {
  return getWorker() !== null;
}

// ============================================================
// 通用 Worker 调用
// ============================================================

/**
 * 向 Worker 发送任务（Promise 化）
 * 如果 Worker 不可用，返回 null（由调用方决定回退策略）
 */
export function postTask<T>(task: WorkerTask, payload: unknown): Promise<T> | null {
  const worker = getWorker();
  if (!worker) return null;

  const taskId = taskCounter++;
  const promise = new Promise<T>((resolve, reject) => {
    pendingTasks.set(taskId, {
      resolve: resolve as (result: unknown) => void,
      reject,
      startTime: performance.now(),
    });
  });

  const request: WorkerRequest = { taskId, task, payload };
  worker.postMessage(request);

  return promise;
}
