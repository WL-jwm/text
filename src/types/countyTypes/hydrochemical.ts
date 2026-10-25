/**
 * 拆分自 types/county.ts — 水化学类型
 */

// ── 水化学类型 ──

export interface SukaliefClassification {
  type: string;
  note: string;
  zone: string;
  typicalTDS: string;
  percentage: string;
  color: string;
}

export interface HydrochemicalByRegion {
  region: string;
  tds: number;
  hardness: number;
  sulfate: number;
  chloride: number;
  fluoride: number;
  ph: number;
  type: string;
}

export interface IsotopeSample {
  id: string;
  location: string;
  depth: number;
  type: string;
  delta18O: number;
  deltaD: number;
  tritium: number;
  age: string;
  zone: string;
  recharge: string;
}

export interface ClassPieItem {
  name: string;
  value: number;
  color: string;
}

export interface RadarItem {
  type: string;
  percentage: number;
  tds: number;
}

export interface TdsBarItem {
  name: string;
  tds: number;
  hardness: number;
  sulfate: number;
  chloride: number;
}

export interface FluorideBarItem {
  name: string;
  fluoride: number;
}

export interface PhBarItem {
  name: string;
  ph: number;
}

export interface IsoPoint {
  x: number;
  y: number;
  z: number;
  name: string;
}
