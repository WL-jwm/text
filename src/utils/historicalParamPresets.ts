/**
 * 历史水文地质参数计算 — 预设数据与汇总
 *  泉流量 / 含水层参数 / 径流还原 / 地质年龄
 */

import type { SpringFrequencyInput, SpringFrequencyResult, AquiferParamInput, AquiferParamResult, RunoffRestorationInput, RunoffRestorationResult, GeologicalAgeInput, GeologicalAgeResult } from './historicalParamTypes';
import { calcSpringFrequency, calcAquiferParams, calcRunoffRestoration, calcGeologicalAge } from './historicalParamAlgorithms';

export const PRESET_SPRINGS: SpringFrequencyInput[] = [
  {
    name: '邢台百泉',
    probabilities: [10, 25, 50, 75, 95],
    data: [
      { year: 2015, flow: 5.2 }, { year: 2016, flow: 4.8 }, { year: 2017, flow: 5.5 },
      { year: 2018, flow: 6.1 }, { year: 2019, flow: 5.0 }, { year: 2020, flow: 4.5 },
      { year: 2021, flow: 5.3 }, { year: 2022, flow: 5.8 }, { year: 2023, flow: 5.1 }, { year: 2024, flow: 4.9 },
    ],
  },
  {
    name: '承德热河泉',
    probabilities: [10, 25, 50, 75, 95],
    data: [
      { year: 2015, flow: 0.8 }, { year: 2016, flow: 0.75 }, { year: 2017, flow: 0.85 },
      { year: 2018, flow: 0.9 }, { year: 2019, flow: 0.7 }, { year: 2020, flow: 0.65 },
      { year: 2021, flow: 0.78 }, { year: 2022, flow: 0.82 }, { year: 2023, flow: 0.76 }, { year: 2024, flow: 0.72 },
    ],
  },
  {
    name: '石家庄威州泉',
    probabilities: [10, 25, 50, 75, 95],
    data: [
      { year: 2015, flow: 2.1 }, { year: 2016, flow: 1.9 }, { year: 2017, flow: 2.3 },
      { year: 2018, flow: 2.5 }, { year: 2019, flow: 2.0 }, { year: 2020, flow: 1.7 },
      { year: 2021, flow: 2.2 }, { year: 2022, flow: 2.4 }, { year: 2023, flow: 2.0 }, { year: 2024, flow: 1.85 },
    ],
  },
];

// 含水层参数反演预设

export function calcAllSprings(): SpringFrequencyResult[] {
  return PRESET_SPRINGS.map(s => calcSpringFrequency(s));
}


export const PRESET_AQUIFERS: AquiferParamInput[] = [
  { name: '保定望都（山前平原）', aquiferType: '潜水', drawdown: 3.5, discharge: 1200, distance: 50, thickness: 25, recoveryTime: 0.5, recoveryDrawdown: 0.15 },
  { name: '衡水深层（中部平原）', aquiferType: '承压', drawdown: 15, discharge: 800, distance: 100, thickness: 60, recoveryTime: 1.0, recoveryDrawdown: 0.8 },
  { name: '沧州滨海', aquiferType: '承压', drawdown: 20, discharge: 500, distance: 80, thickness: 40, recoveryTime: 1.5, recoveryDrawdown: 1.2 },
  { name: '邯郸峰峰岩溶', aquiferType: '承压', drawdown: 2.0, discharge: 2000, distance: 30, thickness: 15, recoveryTime: 0.3, recoveryDrawdown: 0.08 },
];

// 径流还原预设

export function calcAllAquifers(): AquiferParamResult[] {
  return PRESET_AQUIFERS.map(a => calcAquiferParams(a));
}


export const PRESET_RUNOFF: RunoffRestorationInput[] = [
  {
    name: '滹沱河（黄壁庄断面）',
    measuredData: [
      { year: 2015, runoff: 8.5 }, { year: 2016, runoff: 9.2 }, { year: 2017, runoff: 7.8 },
      { year: 2018, runoff: 6.5 }, { year: 2019, runoff: 7.0 }, { year: 2020, runoff: 6.2 },
      { year: 2021, runoff: 5.8 }, { year: 2022, runoff: 5.5 }, { year: 2023, runoff: 5.0 }, { year: 2024, runoff: 4.8 },
    ],
    irrigationDiversion: [2.5, 2.3, 2.8, 3.2, 3.0, 3.5, 3.8, 4.0, 4.2, 4.3],
    industrialUse: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7],
    reservoirChange: [0.2, -0.3, 0.5, 0.8, -0.2, 0.3, 0.1, -0.1, 0.2, -0.1],
    interbasinTransfer: [0, 0, 0, 0.5, 0.5, 0.8, 1.0, 1.2, 1.5, 1.8],
  },
  {
    name: '滏阳河（艾辛庄断面）',
    measuredData: [
      { year: 2015, runoff: 5.2 }, { year: 2016, runoff: 5.8 }, { year: 2017, runoff: 4.5 },
      { year: 2018, runoff: 3.8 }, { year: 2019, runoff: 4.0 }, { year: 2020, runoff: 3.5 },
      { year: 2021, runoff: 3.2 }, { year: 2022, runoff: 2.8 }, { year: 2023, runoff: 2.5 }, { year: 2024, runoff: 2.3 },
    ],
    irrigationDiversion: [1.8, 1.6, 2.0, 2.5, 2.3, 2.8, 3.0, 3.2, 3.5, 3.6],
    industrialUse: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4],
    reservoirChange: [0.1, -0.1, 0.3, 0.5, -0.2, 0.2, 0.1, 0, 0.1, 0],
    interbasinTransfer: [0, 0, 0, 0.2, 0.3, 0.5, 0.8, 1.0, 1.2, 1.5],
  },
];

// 地质年代预设

export function calcAllRunoff(): RunoffRestorationResult[] {
  return PRESET_RUNOFF.map(r => calcRunoffRestoration(r));
}


export const PRESET_AGES: GeologicalAgeInput[] = [
  { name: '衡水深层水（300m）', c14Age: 15000, delta13C: -8.5, initialActivity: 100, measuredActivity: 15, tritium: 0.1, stratigraphicAge: 12000 },
  { name: '沧州深层水（400m）', c14Age: 25000, delta13C: -6.2, initialActivity: 100, measuredActivity: 5, tritium: 0.05, stratigraphicAge: 20000 },
  { name: '石家庄浅层水（50m）', c14Age: 500, delta13C: -12.0, initialActivity: 100, measuredActivity: 93, tritium: 15, stratigraphicAge: 300 },
  { name: '承德山区泉水', c14Age: 100, delta13C: -10.5, initialActivity: 100, measuredActivity: 98, tritium: 25, stratigraphicAge: 50 },
  { name: '邯郸岩溶水（200m）', c14Age: 3000, delta13C: -7.8, initialActivity: 100, measuredActivity: 70, tritium: 2, stratigraphicAge: 2500 },
  { name: '张家口坝上水（80m）', c14Age: 800, delta13C: -9.5, initialActivity: 100, measuredActivity: 90, tritium: 8, stratigraphicAge: 500 },
];

// ═══════════════════════════════════════════════════════
// 批量计算
// ═══════════════════════════════════════════════════════


export function calcAllAges(): GeologicalAgeResult[] {
  return PRESET_AGES.map(a => calcGeologicalAge(a));
}

