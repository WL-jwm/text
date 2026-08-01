/**
 * usePipeline — 各模块调用的跨模块数据流 hook
 *
 * 用法:
 *   const { publishData, receiveData, availableLinks } = usePipeline('waterQuality');
 *   publishData('waterQualityFactors', '水质评价结果', { factors: [...] });
 *   const incoming = receiveData('ionConcentrations');
 */

import { useCallback } from 'react';
import { usePipelineStore, type ModuleId, type DataType, type DataPackage } from '../store/usePipelineStore';

export function usePipeline(moduleId: ModuleId) {
  const packages = usePipelineStore(s => s.packages);
  const links = usePipelineStore(s => s.links);
  const publish = usePipelineStore(s => s.publish);
  const toggleLink = usePipelineStore(s => s.toggleLink);
  const transfer = usePipelineStore(s => s.transfer);
  const transferAllFrom = usePipelineStore(s => s.transferAllFrom);
  const notify = usePipelineStore(s => s.notify);

  /** 发布数据包到数据总线 */
  const publishData = useCallback(
    (dataType: DataType, label: string, payload: Record<string, unknown>, sourceContext?: string) => {
      return publish({ sourceModule: moduleId, dataType, label, payload, sourceContext });
    },
    [moduleId, publish],
  );

  /** 接收数据：获取指定数据类型的最新数据包 */
  const receiveData = useCallback(
    (dataType: DataType, sourceModule?: ModuleId): DataPackage | undefined => {
      if (sourceModule) {
        return packages.find(p => p.sourceModule === sourceModule && p.dataType === dataType);
      }
      // 取该类型最新的数据包
      return packages.find(p => p.dataType === dataType);
    },
    [packages],
  );

  /** 获取所有可接收的数据包（按数据类型筛选） */
  const receiveAll = useCallback(
    (dataType: DataType): DataPackage[] => {
      return packages.filter(p => p.dataType === dataType);
    },
    [packages],
  );

  /** 获取从本模块发出的链路 */
  const outgoingLinks = links.filter(l => l.sourceModule === moduleId);

  /** 获取到达本模块的链路 */
  const incomingLinks = links.filter(l => l.targetModule === moduleId);

  /** 激活/停用链路 */
  const toggleLinkActive = useCallback(
    (linkId: string) => toggleLink(linkId),
    [toggleLink],
  );

  /** 执行从本模块的所有激活链路传输 */
  const pushToTargets = useCallback(
    () => transferAllFrom(moduleId),
    [moduleId, transferAllFrom],
  );

  /** 执行单条链路传输 */
  const transferData = useCallback(
    (linkId: string) => transfer(linkId),
    [transfer],
  );

  /** 获取有可用数据的入站链路 */
  const availableIncomingLinks = incomingLinks.filter(link => {
    return packages.some(p => p.sourceModule === link.sourceModule && p.dataType === link.dataType);
  });

  return {
    publishData,
    receiveData,
    receiveAll,
    outgoingLinks,
    incomingLinks,
    availableIncomingLinks,
    toggleLinkActive,
    pushToTargets,
    transferData,
    notify,
  };
}
