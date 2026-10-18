/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 四、含水层出水率经验值 (表100)
// 单位: m³/h·m³ (厚度1m砂层水位降低1m时的出水量)
// ───────────────────────────────────────────────────────

export interface YieldRate {
  lithology: string;
  code: string;
  aquiferGroup: string;
  region: string;
  range: string;
}

export const aquiferYieldRate: YieldRate[] = [
  // 第I含水组 - 山前冲洪积扇主流带(邯郸/邢台/石家庄/保定)
  { lithology: '粉砂', code: 'F', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.30~0.50' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.40~0.70' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.60~0.80' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.80~1.20' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '2.20~2.80' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '3.00~5.00' },
  // 第I含水组 - 廊坊(全淡水)
  { lithology: '粉砂', code: 'F', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '0.30~0.50' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '0.60~0.65' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '0.80~1.00' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '1.12~1.50' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '1.50~2.00' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '2.00~3.00' },
  // 第II含水组 - 山前
  { lithology: '粉砂', code: 'F', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.25~0.30' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.35~0.45' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.45~0.60' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.60~0.80' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '1.50~2.00' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '2.00~3.00' },
  // 第II含水组 - 廊坊
  { lithology: '粉砂', code: 'F', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.16~0.24' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.25~0.37' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.38~0.48' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.49~0.50' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.90~1.10' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '1.30~1.70' },
];

// ───────────────────────────────────────────────────────
// 五、渗透系数K值分区统计 (表112)
// 单位: m/d
// ───────────────────────────────────────────────────────

export interface KValue {
  lithology: string;
  aquiferGroup: string;
  plainZone: string;
  range: string;
}

export const kValueByZone: KValue[] = [
  // 第I含水组
  { lithology: '粉砂', aquiferGroup: 'I', plainZone: '山前平原', range: '5~8' },
  { lithology: '粉砂', aquiferGroup: 'I', plainZone: '中部平原', range: '4~6' },
  { lithology: '粉砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '8~5(推断)' },
  { lithology: '细砂', aquiferGroup: 'I', plainZone: '山前平原', range: '8~12' },
  { lithology: '细砂', aquiferGroup: 'I', plainZone: '中部平原', range: '6~10' },
  { lithology: '细砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '5~8' },
  { lithology: '中砂', aquiferGroup: 'I', plainZone: '山前平原', range: '15~25' },
  { lithology: '中砂', aquiferGroup: 'I', plainZone: '中部平原', range: '12~18' },
  { lithology: '中砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '10~15' },
  { lithology: '粗砂', aquiferGroup: 'I', plainZone: '山前平原', range: '20~50' },
  { lithology: '粗砂', aquiferGroup: 'I', plainZone: '中部平原', range: '18~25(推断)' },
  { lithology: '粗砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '15~20' },
  { lithology: '砾石', aquiferGroup: 'I', plainZone: '山前平原', range: '50~70或>70' },
  { lithology: '卵石', aquiferGroup: 'I', plainZone: '山前平原', range: '>100(推断)' },
  // 第II含水组
  { lithology: '粉砂', aquiferGroup: 'II', plainZone: '山前平原', range: '<3.5' },
  { lithology: '粉砂', aquiferGroup: 'II', plainZone: '中部平原', range: '<2.5' },
  { lithology: '粉砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '<1' },
  { lithology: '细砂', aquiferGroup: 'II', plainZone: '山前平原', range: '3.8~8' },
  { lithology: '细砂', aquiferGroup: 'II', plainZone: '中部平原', range: '4.5~10' },
  { lithology: '细砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '1~8' },
  { lithology: '中砂', aquiferGroup: 'II', plainZone: '山前平原', range: '4.5~12' },
  { lithology: '中砂', aquiferGroup: 'II', plainZone: '中部平原', range: '5~15' },
  { lithology: '中砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '8~10' },
  { lithology: '粗砂', aquiferGroup: 'II', plainZone: '山前平原', range: '5.5~13' },
  { lithology: '粗砂', aquiferGroup: 'II', plainZone: '中部平原', range: '8~20' },
  { lithology: '粗砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '6~12' },
  { lithology: '砾石', aquiferGroup: 'II', plainZone: '山前平原', range: '20~50(推断)' },
  { lithology: '卵石', aquiferGroup: 'II', plainZone: '山前平原', range: '>50' },
];

// ───────────────────────────────────────────────────────
// 六、出水率与含水层厚度关系 (表101)
// ───────────────────────────────────────────────────────

export interface ThicknessYieldRelation {
  lithology: string;
  thicknessRange: string;
  yieldRate: string;
}

export const thicknessYieldRelation: ThicknessYieldRelation[] = [
  { lithology: '粉砂', thicknessRange: '<5m', yieldRate: '0.18~0.23' },
  { lithology: '粉砂', thicknessRange: '5~10m', yieldRate: '0.23~0.28' },
  { lithology: '粉砂', thicknessRange: '>10m', yieldRate: '0.28~0.34' },
  { lithology: '细砂', thicknessRange: '<5m', yieldRate: '0.35~0.40' },
  { lithology: '细砂', thicknessRange: '5~10m', yieldRate: '0.40~0.45' },
  { lithology: '细砂', thicknessRange: '>10m', yieldRate: '0.45~0.52' },
  { lithology: '中砂', thicknessRange: '<5m', yieldRate: '0.50~0.60' },
  { lithology: '中砂', thicknessRange: '5~10m', yieldRate: '0.60~0.80' },
  { lithology: '中砂', thicknessRange: '>10m', yieldRate: '0.80~1.00' },
  { lithology: '粗砂', thicknessRange: '<5m', yieldRate: '1.00~1.50' },
  { lithology: '粗砂', thicknessRange: '5~10m', yieldRate: '1.50~2.00' },
  { lithology: '粗砂', thicknessRange: '>10m', yieldRate: '2.00~3.00' },
];

