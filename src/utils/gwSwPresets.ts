/**
 * 地下水-地表水相互作用 — 预设河流/生成器/标签
 */

import type { RiverPoint, InteractionType, RiverSegment } from './gwSwTypes';

export const PRESET_RIVERS = [
  {
    id: 'luanhe',
    name: '滦河（承德-唐山段）',
    description: '滦河中下游，山区到平原过渡段，地下水-地表水交换活跃',
    segmentLength: 5000, // 每段5km
    area: 12000, // 流域面积 km²
    points: generateRiverPoints('luanhe', [
      { name: '滦县大桥', x: 0, riverStage: 45, gwHead: 43, segment: 'upstream' },
      { name: '滦州站', x: 15, riverStage: 42, gwHead: 41, segment: 'upstream' },
      { name: '雷庄', x: 30, riverStage: 39, gwHead: 40, segment: 'midstream' },
      { name: '沙河驿', x: 45, riverStage: 36, gwHead: 38, segment: 'midstream' },
      { name: '玉田', x: 60, riverStage: 33, gwHead: 35, segment: 'midstream' },
      { name: '丰润', x: 75, riverStage: 30, gwHead: 29, segment: 'downstream' },
      { name: '唐山入海口', x: 90, riverStage: 27, gwHead: 26, segment: 'downstream' },
    ]),
    dailyFlow: generateDailyFlow(50, 200, 'normal'),
  },
  {
    id: 'ziyahe',
    name: '子牙河（石家庄-沧州段）',
    description: '子牙河平原段，流经超采区，河流-地下水交互复杂',
    segmentLength: 4000,
    area: 8000,
    points: generateRiverPoints('ziyahe', [
      { name: '石家庄', x: 0, riverStage: 65, gwHead: 62, segment: 'upstream' },
      { name: '藁城', x: 20, riverStage: 58, gwHead: 55, segment: 'upstream' },
      { name: '晋州', x: 40, riverStage: 52, gwHead: 48, segment: 'midstream' },
      { name: '深泽', x: 55, riverStage: 48, gwHead: 45, segment: 'midstream' },
      { name: '安平', x: 70, riverStage: 44, gwHead: 42, segment: 'midstream' },
      { name: '献县', x: 90, riverStage: 38, gwHead: 36, segment: 'downstream' },
      { name: '沧州', x: 110, riverStage: 32, gwHead: 30, segment: 'downstream' },
    ]),
    dailyFlow: generateDailyFlow(20, 120, 'low'),
  },
  {
    id: 'daqinghe',
    name: '大清河（保定-天津段）',
    description: '大清河平原段，白洋淀下游，河网交错带',
    segmentLength: 4500,
    area: 10000,
    points: generateRiverPoints('daqinghe', [
      { name: '新盖房', x: 0, riverStage: 18, gwHead: 17, segment: 'upstream' },
      { name: '雄县', x: 15, riverStage: 15, gwHead: 14, segment: 'upstream' },
      { name: '容城', x: 30, riverStage: 13, gwHead: 12, segment: 'midstream' },
      { name: '文安', x: 55, riverStage: 10, gwHead: 11, segment: 'midstream' },
      { name: '霸州', x: 75, riverStage: 8, gwHead: 9, segment: 'downstream' },
      { name: '天津入海', x: 95, riverStage: 5, gwHead: 4, segment: 'downstream' },
    ]),
    dailyFlow: generateDailyFlow(30, 150, 'normal'),
  },
  {
    id: 'zhanghe',
    name: '漳河（邯郸段）',
    description: '漳河山前段，冲洪积扇补给区，河流大量渗漏',
    segmentLength: 3500,
    area: 5000,
    points: generateRiverPoints('zhanghe', [
      { name: '岳城水库', x: 0, riverStage: 85, gwHead: 78, segment: 'upstream' },
      { name: '磁县', x: 15, riverStage: 75, gwHead: 68, segment: 'upstream' },
      { name: '临漳', x: 30, riverStage: 68, gwHead: 60, segment: 'midstream' },
      { name: '魏县', x: 50, riverStage: 60, gwHead: 54, segment: 'midstream' },
      { name: '大名', x: 70, riverStage: 52, gwHead: 48, segment: 'downstream' },
    ]),
    dailyFlow: generateDailyFlow(15, 80, 'low'),
  },
  {
    id: 'southgrand',
    name: '南运河（沧州段）',
    description: '南运河平原段，引黄输水通道，穿越深层水超采区',
    segmentLength: 4000,
    area: 6000,
    points: generateRiverPoints('southgrand', [
      { name: '吴桥', x: 0, riverStage: 20, gwHead: 18, segment: 'upstream' },
      { name: '东光', x: 20, riverStage: 17, gwHead: 15, segment: 'midstream' },
      { name: '南皮', x: 40, riverStage: 14, gwHead: 12, segment: 'midstream' },
      { name: '沧州市', x: 60, riverStage: 11, gwHead: 8, segment: 'midstream' },
      { name: '青县', x: 80, riverStage: 8, gwHead: 6, segment: 'downstream' },
    ]),
    dailyFlow: generateDailyFlow(10, 50, 'low'),
  },
  {
    id: 'tanghe',
    name: '唐河（保定西部段）',
    description: '唐河山前段，岩溶区河流，渗漏补给岩溶水',
    segmentLength: 3000,
    area: 3500,
    points: generateRiverPoints('tanghe', [
      { name: '唐县', x: 0, riverStage: 120, gwHead: 115, segment: 'upstream' },
      { name: '曲阳', x: 15, riverStage: 105, gwHead: 98, segment: 'upstream' },
      { name: '望都', x: 30, riverStage: 90, gwHead: 85, segment: 'midstream' },
      { name: '清苑', x: 45, riverStage: 75, gwHead: 72, segment: 'downstream' },
    ]),
    dailyFlow: generateDailyFlow(5, 40, 'low'),
  },
] as const;


function generateRiverPoints(
  prefix: string,
  customPoints: { name: string; x: number; riverStage: number; gwHead: number; segment: RiverSegment }[],
): RiverPoint[] {
  return customPoints.map((cp, idx) => ({
    id: `${prefix}-P${String(idx + 1).padStart(2, '0')}`,
    name: cp.name,
    x: cp.x,
    riverStage: cp.riverStage,
    groundwaterHead: cp.gwHead,
    riverbedConductance: 50 + Math.random() * 100,
    riverbedThickness: 0.5 + Math.random() * 2,
    riverbedK: 0.5 + Math.random() * 5,
    riverWidth: 30 + Math.random() * 70,
    segment: cp.segment,
    flowRate: 10 + Math.random() * 100,
    temperature: { river: 15 + Math.random() * 10, groundwater: 12 + Math.random() * 5 },
  }));
}


function generateDailyFlow(base: number, peak: number, pattern: 'normal' | 'low'): number[] {
  const days = 365;
  const flow: number[] = [];
  for (let d = 0; d < days; d++) {
    // 季节性变化（夏季丰水期）
    const seasonal = (peak - base) * Math.sin((d / 365) * 2 * Math.PI - Math.PI / 2) * 0.4 + (peak + base) / 2;
    // 随机波动
    const noise = (Math.sin(d * 7.3) * 0.2 + Math.sin(d * 13.7) * 0.1) * base;
    // 暴雨事件
    const storm = pattern === 'normal' && (d === 180 || d === 200 || d === 220)
      ? peak * 1.5 : 0;
    flow.push(Math.max(0, seasonal + noise + storm));
  }
  return flow;
}

// ── 辅助函数 ──


export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  gaining: '增益型（地下水→河流）',
  losing: '失水型（河流→地下水）',
  'flow-through': '穿越型（季节性交替）',
  perched: '悬托型（河床渗漏）',
};


export const INTERACTION_TYPE_COLORS: Record<InteractionType, string> = {
  gaining: '#10b981',
  losing: '#ef4444',
  'flow-through': '#f59e0b',
  perched: '#8b5cf6',
};


export const SEGMENT_LABELS: Record<RiverSegment, string> = {
  upstream: '上游',
  midstream: '中游',
  downstream: '下游',
};

