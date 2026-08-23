/**
 * 3D多层含水层耦合 — 场景类型与常量
 */

export interface CouplingLayer3D {
  group: string;
  topDepth: number;
  bottomDepth: number;
  age: string;
  lithology: string;
  K: string;
  Kavg: number;
  waterType: string;
  quality: string;
  rechargeSource: string;
  color: number;
  colorHex: string;
  leakRate: number;
}


export const LAYERS: CouplingLayer3D[] = [
  { group: '第I含水组', topDepth: 0, bottomDepth: 50, age: '全新统(Q₄)', lithology: '砂砾石/中细砂', K: '10~50 m/d', Kavg: 30, waterType: '潜水-微承压', quality: 'HCO₃-Ca·Mg', rechargeSource: '大气降水/地表水入渗', color: 0x22c55e, colorHex: '#22c55e', leakRate: 0 },
  { group: '第II含水组', topDepth: 50, bottomDepth: 150, age: '上更新统(Q₃)', lithology: '中细砂/粉细砂', K: '5~20 m/d', Kavg: 12.5, waterType: '承压水', quality: 'HCO₃-Ca·Na', rechargeSource: '越流补给/侧向径流', color: 0x3b82f6, colorHex: '#3b82f6', leakRate: 35 },
  { group: '第III含水组', topDepth: 150, bottomDepth: 350, age: '中更新统(Q₂)', lithology: '细砂/粉砂', K: '2~8 m/d', Kavg: 5, waterType: '承压水', quality: 'HCO₃·SO₄-Na·Ca', rechargeSource: '侧向径流/越流(弱)', color: 0x8b5cf6, colorHex: '#8b5cf6', leakRate: 15 },
  { group: '第IV含水组', topDepth: 350, bottomDepth: 550, age: '下更新统(Q₁)', lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', Kavg: 1.75, waterType: '深层承压水', quality: 'HCO₃-Na(高氟)', rechargeSource: '侧向径流(极弱)', color: 0xf59e0b, colorHex: '#f59e0b', leakRate: 5 },
];


export const LEAK_CONNECTIONS = [
  { from: 0, to: 1, rate: 35, label: 'I→II' },
  { from: 1, to: 2, rate: 15, label: 'II→III' },
  { from: 2, to: 3, rate: 5, label: 'III→IV' },
];

// 开采井数据

export const WELLS = [
  { x: -60, z: 10, depth: 150, yield: 35, layer: 1 },
  { x: -20, z: -15, depth: 350, yield: 20, layer: 2 },
  { x: 30, z: 20, depth: 550, yield: 10, layer: 3 },
  { x: 60, z: -10, depth: 150, yield: 35, layer: 1 },
  { x: 0, z: 0, depth: 350, yield: 20, layer: 2 },
];

// 比例

export const LAYER_WIDTH = 160;
export const LAYER_DEPTH = 100;
export const Y_SCALE = 0.35;
