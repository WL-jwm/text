/**
 * F-02 3D可视化 — Three.js 含水层立体剖面
 *
 * 将V-02的SVG剖面升级为真3D：
 *   1. 4组含水层立体地质体（沿剖面方向延伸）
 *   2. 各层水头曲面（贝塞尔/线性插值）
 *   3. 钻孔标注（城市站点 + 深度刻度）
 *   4. 剖面方向切换（山前→滨海 / 滨海→山前）
 *   5. 层级显隐控制
 *   6. OrbitControls 旋转/缩放/平移
 *   7. 悬停高亮 + 信息面板
 * 共享常量与类型（拆分自 AquiferProfile3DWebGL.tsx）
 */

export interface AquiferLayer3D {
  name: string;
  topDepth: number;
  bottomDepth: number;
  lithology: string;
  K: string;
  waterType: string;
  color: number; // THREE.Color hex
  colorHex: string;
}
export interface ProfileStation3D {
  city: string;
  distance: number;
  surfaceElev: number;
  waterLevels: number[];
  note: string;
}
export const AQUIFER_LAYERS: AquiferLayer3D[] = [
  { name: '第I含水组', topDepth: 0, bottomDepth: 50, lithology: '砂砾石/中细砂', K: '10~50 m/d', waterType: '潜水-微承压', color: 0x22c55e, colorHex: '#22c55e' },
  { name: '第II含水组', topDepth: 50, bottomDepth: 150, lithology: '中细砂/粉细砂', K: '5~20 m/d', waterType: '承压水', color: 0x3b82f6, colorHex: '#3b82f6' },
  { name: '第III含水组', topDepth: 150, bottomDepth: 350, lithology: '细砂/粉砂', K: '2~8 m/d', waterType: '承压水', color: 0x8b5cf6, colorHex: '#8b5cf6' },
  { name: '第IV含水组', topDepth: 350, bottomDepth: 550, lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', waterType: '深层承压水', color: 0xf59e0b, colorHex: '#f59e0b' },
];
export const PROFILE_STATIONS: ProfileStation3D[] = [
  { city: '石家庄', distance: 0, surfaceElev: 85, waterLevels: [82, 75, 68, 60], note: '山前冲洪积扇' },
  { city: '保定', distance: 80, surfaceElev: 65, waterLevels: [60, 52, 45, 38], note: '冲积平原上部' },
  { city: '廊坊', distance: 160, surfaceElev: 45, waterLevels: [40, 33, 26, 18], note: '冲积平原中部' },
  { city: '沧州', distance: 240, surfaceElev: 30, waterLevels: [26, 18, 8, -5], note: '滨海平原' },
  { city: '唐山', distance: 300, surfaceElev: 40, waterLevels: [36, 29, 22, 15], note: '滨海过渡带' },
];
export const SCALE_X = 1.2; // 水平距离缩放
export const SCALE_Y = 0.4; // 深度缩放（夸大显示）
export const PROFILE_WIDTH = 40; // 剖面横向宽度（Z方向）
export const MAX_DEPTH = 600;
