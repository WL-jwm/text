/**
 * 水化学计算 — 预设样本
 */

import type { PresetSample } from './hydrochemTypes';

export const PRESET_SAMPLES: PresetSample[] = [
  {
    name: '石家庄-山前冲洪积扇',
    location: '石家庄鹿泉',
    zone: '补给径流区',
    input: { Ca: 68, Mg: 24, NaK: 18, HCO3: 280, SO4: 72, Cl: 38, pH: 7.4, TDS: 500 },
  },
  {
    name: '保定-山前冲洪积扇',
    location: '保定满城',
    zone: '补给径流区',
    input: { Ca: 62, Mg: 20, NaK: 15, HCO3: 260, SO4: 58, Cl: 30, pH: 7.3, TDS: 445 },
  },
  {
    name: '邯郸-冲洪积扇前缘',
    location: '邯郸磁县',
    zone: '径流过渡区',
    input: { Ca: 85, Mg: 35, NaK: 42, HCO3: 320, SO4: 150, Cl: 85, pH: 7.6, TDS: 717 },
  },
  {
    name: '邢台-中部平原',
    location: '邢台任县',
    zone: '蒸发浓缩区',
    input: { Ca: 110, Mg: 48, NaK: 85, HCO3: 310, SO4: 220, Cl: 180, pH: 7.7, TDS: 953 },
  },
  {
    name: '衡水-中部平原',
    location: '衡水桃城',
    zone: '蒸发浓缩区',
    input: { Ca: 140, Mg: 62, NaK: 180, HCO3: 340, SO4: 380, Cl: 420, pH: 7.8, TDS: 1522 },
  },
  {
    name: '沧州-滨海平原',
    location: '沧州青县',
    zone: '咸水区',
    input: { Ca: 280, Mg: 160, NaK: 680, HCO3: 380, SO4: 580, Cl: 1100, pH: 8.0, TDS: 3180 },
  },
  {
    name: '唐山-冀东平原',
    location: '唐山丰南',
    zone: '滨海过渡带',
    input: { Ca: 95, Mg: 38, NaK: 65, HCO3: 290, SO4: 140, Cl: 120, pH: 7.5, TDS: 748 },
  },
  {
    name: '承德-燕山山区',
    location: '承德兴隆',
    zone: '补给径流区',
    input: { Ca: 45, Mg: 15, NaK: 10, HCO3: 180, SO4: 28, Cl: 15, pH: 7.2, TDS: 293 },
  },
];

// ═══════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════

