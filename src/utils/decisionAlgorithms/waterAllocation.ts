/**
 * 拆分自 decisionSupportAlgorithms.ts — 水资源配置优化（线性规划简化）
 */

import type { WaterSource, WaterUser, AllocationResult } from '../decisionSupportTypes';

export function calcWaterAllocation(sources: WaterSource[], users: WaterUser[]): AllocationResult {
  // 按用户优先级排序（优先级数字小的先分配）
  const sortedUsers = [...users].sort((a, b) => a.priority - b.priority);

  // 各水源剩余水量
  const sourceRemaining = new Map<string, number>();
  sources.forEach(s => sourceRemaining.set(s.id, s.supply));

  const allocation: { source: string; user: string; volume: number; cost: number }[] = [];
  const userAllocated = new Map<string, number>();
  users.forEach(u => userAllocated.set(u.id, 0));

  const notes: string[] = [];

  for (const user of sortedUsers) {
    let remainingDemand = user.demand;

    // 按成本从低到高排序可用水源
    const availableSources = sources
      .filter(s => sourceRemaining.get(s.id)! > 0 && s.quality <= user.maxQuality)
      .sort((a, b) => a.cost - b.cost);

    for (const source of availableSources) {
      if (remainingDemand <= 0) break;
      const available = sourceRemaining.get(source.id)!;
      const allocated = Math.min(remainingDemand, available);

      if (allocated > 0) {
        allocation.push({
          source: source.name,
          user: user.name,
          volume: +allocated.toFixed(0),
          cost: +(allocated * source.cost).toFixed(0),
        });
        sourceRemaining.set(source.id, available - allocated);
        userAllocated.set(user.id, userAllocated.get(user.id)! + allocated);
        remainingDemand -= allocated;
      }
    }

    // 检查最低保障
    const allocated = userAllocated.get(user.id)!;
    if (allocated < user.minSupply) {
      notes.push(`${user.name}未达到最低保障量(${user.minSupply}万m³)，缺口${(user.minSupply - allocated).toFixed(0)}万m³`);
    }
  }

  const totalAllocated = allocation.reduce((s, a) => s + a.volume, 0);
  const totalCost = allocation.reduce((s, a) => s + a.cost, 0);
  const totalDemand = users.reduce((s, u) => s + u.demand, 0);

  const sourceRemainder = sources.map(s => ({
    source: s.name,
    remainder: +(sourceRemaining.get(s.id) ?? 0).toFixed(0),
    utilization: +((1 - (sourceRemaining.get(s.id) ?? 0) / s.supply) * 100).toFixed(1),
  }));

  const userSatisfaction = users.map(u => {
    const allocated = userAllocated.get(u.id) ?? 0;
    return {
      user: u.name,
      allocated: +allocated.toFixed(0),
      demand: u.demand,
      satisfaction: +((allocated / u.demand) * 100).toFixed(1),
    };
  });

  const overallSatisfaction = totalDemand > 0 ? +((totalAllocated / totalDemand) * 100).toFixed(1) : 0;

  if (overallSatisfaction < 80) {
    notes.push(`整体满足率${overallSatisfaction}%低于80%，建议增加外调水或再生水供给`);
  }
  if (overallSatisfaction >= 100) {
    notes.push('水资源配置满足所有用户需求，可考虑优化成本结构');
  }

  return {
    allocation,
    sourceRemainder,
    userSatisfaction,
    totalAllocated: +totalAllocated.toFixed(0),
    totalCost: +totalCost.toFixed(0),
    totalDemand,
    overallSatisfaction,
    notes,
  };
}
