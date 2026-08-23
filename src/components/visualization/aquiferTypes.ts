/**
 * 多层含水层耦合可视化 — 含水层结构与常量
 */

interface AquiferLayer {
  group: string;
  depthRange: string;
  topDepth: number;
  bottomDepth: number;
  age: string;
  lithology: string;
  K: string;
  Kavg: number; // 渗透系数均值 m/d
  yield: string;
  yieldAvg: number; // 单井涌水量均值 m³/d
  waterType: string;
  quality: string;
  rechargeSource: string;
  color: string;
  leakRate: number; // 越流补给比例 %
}

// ── 含水层耦合参数 ──


export const AQUIFER_LAYERS: AquiferLayer[] = [
  { group: '第I含水组', depthRange: '0~50m', topDepth: 0, bottomDepth: 50, age: '全新统(Q₄)', lithology: '砂砾石/中细砂', K: '10~50 m/d', Kavg: 30, yield: '50~150', yieldAvg: 100, waterType: '潜水-微承压', quality: 'HCO₃-Ca·Mg', rechargeSource: '大气降水/地表水入渗/灌溉回渗', color: '#22c55e', leakRate: 0 },
  { group: '第II含水组', depthRange: '50~150m', topDepth: 50, bottomDepth: 150, age: '上更新统(Q₃)', lithology: '中细砂/粉细砂', K: '5~20 m/d', Kavg: 12.5, yield: '20~50', yieldAvg: 35, waterType: '承压水', quality: 'HCO₃-Ca·Na', rechargeSource: '越流补给/侧向径流', color: '#3b82f6', leakRate: 35 },
  { group: '第III含水组', depthRange: '150~350m', topDepth: 150, bottomDepth: 350, age: '中更新统(Q₂)', lithology: '细砂/粉砂', K: '2~8 m/d', Kavg: 5, yield: '10~30', yieldAvg: 20, waterType: '承压水', quality: 'HCO₃·SO₄-Na·Ca', rechargeSource: '侧向径流/越流(弱)', color: '#8b5cf6', leakRate: 15 },
  { group: '第IV含水组', depthRange: '350~550m', topDepth: 350, bottomDepth: 550, age: '下更新统(Q₁)', lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', Kavg: 1.75, yield: '5~15', yieldAvg: 10, waterType: '深层承压水', quality: 'HCO₃-Na(高氟)', rechargeSource: '侧向径流(极弱)', color: '#f59e0b', leakRate: 5 },
];

// ── 子组件1：多层含水层系统立体剖面 ──

