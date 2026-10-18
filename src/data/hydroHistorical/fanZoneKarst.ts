/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 九、山前冲洪积扇分段参数 (怀来盆地)
// ───────────────────────────────────────────────────────

export interface FanZoneParam {
  position: string;
  lithology: string;
  thickness: string;     // m
  yieldRate: string;     // m³/(h·m)
  waterLevel: string;    // m
  waterType: string;
  salinity: string;      // g/L
}

export const huailaiBasinParams: FanZoneParam[] = [
  { position: '扇顶部', lithology: '漂砾、卵石', thickness: '>100', yieldRate: '32~98', waterLevel: '100~>40', waterType: 'HCO₃-Ca·Mg', salinity: '<0.1' },
  { position: '扇中部', lithology: '砂、卵石', thickness: '33', yieldRate: '17', waterLevel: '10~40', waterType: 'HCO₃-Ca·Mg', salinity: '0.5~1.0' },
  { position: '扇前缘', lithology: '砂、砾石', thickness: '0~18', yieldRate: '3~10', waterLevel: '5~10', waterType: 'HCO₃·Cl-Ca·Mg', salinity: '1.0~1.7' },
  { position: '冲积平原', lithology: '粉细砂', thickness: '16', yieldRate: '<1', waterLevel: '<5', waterType: 'Cl·SO₄-Na', salinity: '>3.0' },
];

// ───────────────────────────────────────────────────────
// 十、邯邢地区岩溶水参数
// ───────────────────────────────────────────────────────

export interface KarstYieldParam {
  location: string;
  aquifer: string;
  yieldRate: string;     // m³/(h·m)
  source: string;
}

export const hanxingKarstParams: KarstYieldParam[] = [
  { location: '白龙洞径流段', aquifer: '中奥陶系灰岩', yieldRate: '116.7~217.6', source: '抽水' },
  { location: '黑龙洞北洛河径流带', aquifer: '中奥陶系灰岩', yieldRate: '3124.8', source: '注水试验' },
  { location: '黑龙洞漳河径流带', aquifer: '中奥陶系灰岩', yieldRate: '23.2~318.9', source: '抽水' },
  { location: '康二城径流带', aquifer: '中奥陶系灰岩', yieldRate: '18.4~19.6', source: '抽水' },
  { location: '邢台白马河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '13.9~6006', source: '抽水' },
  { location: '邢台七里河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '8.1~330', source: '抽水' },
  { location: '邢台沙河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '8.4~67.7', source: '抽水' },
  { location: '邢台北洺河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '5.9~330', source: '抽水' },
];

// ───────────────────────────────────────────────────────
// 十一、各盆地含水层参数
// ───────────────────────────────────────────────────────

export interface BasinAquiferParam {
  location: string;
  lithology: string;
  thickness: string;    // m
  yieldRate: string;    // m³/(h·m)
  waterLevel: string;   // m
}

export const basinAquiferParams: BasinAquiferParam[] = [
  { location: '遵化山间盆地', lithology: '粗砂/砾石', thickness: '20~100', yieldRate: '10~50', waterLevel: '2~5' },
  { location: '张家口-宣化盆地', lithology: '砂砾石', thickness: '20~100', yieldRate: '10~50', waterLevel: '30~2' },
  { location: '张家口-宣化盆地中部', lithology: '砂砾石', thickness: '40~80', yieldRate: '30~100', waterLevel: '2~5' },
  { location: '怀来-延庆盆地冲积层', lithology: '砾石/砂', thickness: '25~100', yieldRate: '30~100', waterLevel: '<5' },
  { location: '怀来-延庆盆地山前', lithology: '冲洪积砂砾石', thickness: '25~100', yieldRate: '30~150', waterLevel: '5~6' },
  { location: '兴隆-平泉', lithology: '雾迷山白云岩', thickness: '-', yieldRate: '0.1~1.7(最大)', waterLevel: '-' },
  { location: '迁安-卢龙宽谷', lithology: '冲洪积砂砾石', thickness: '10~100', yieldRate: '8~10', waterLevel: '-' },
  { location: '山海关-马兰峪', lithology: '砂砾石/粗砂', thickness: '-', yieldRate: '10~20', waterLevel: '-' },
];

