/**
 * G-06 WebWorker — useWorkerStatus（Worker 状态监控）
 *
 * 拆分自 useWorker.ts：轮询检测 Worker 就绪状态。
 */

import { useEffect, useState } from 'react';
import { getWorker, workerReady } from './workerCore';

export function useWorkerStatus(): {
  available: boolean;
  ready: boolean;
} {
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAvailable(getWorker() !== null);

    // 检查 ready 状态（通过轮询，因为 ready 消息是异步的）
    const timer = setInterval(() => {
      if (workerReady) {
        setReady(true);
        clearInterval(timer);
      }
    }, 100);

    // 3 秒后超时
    const timeout = setTimeout(() => {
      clearInterval(timer);
      setReady(true); // 即使没有 ready 消息，也允许执行（回退模式）
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  return { available, ready };
}
