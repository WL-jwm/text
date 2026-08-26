/**
 * 空间统计分析 — 预设区域监测网格(河北省6区)
 */

import type { SpatialPoint } from './spatialStatsTypes';

export const PRESET_REGIONS: Array<{ name: string; points: SpatialPoint[] }> = [
  {
    name: '太行山前平原（水位埋深）',
    points: [
      { name: '保定', x: 115.5, y: 38.9, value: 22.5 },
      { name: '定州', x: 115.0, y: 38.5, value: 23.0 },
      { name: '石家庄', x: 114.5, y: 38.1, value: 23.5 },
      { name: '正定', x: 114.6, y: 38.2, value: 24.0 },
      { name: '栾城', x: 114.7, y: 37.9, value: 25.0 },
      { name: '邢台', x: 114.5, y: 37.1, value: 25.5 },
      { name: '邯郸', x: 114.5, y: 36.6, value: 26.0 },
      { name: '涿州', x: 115.8, y: 39.5, value: 20.5 },
      { name: '望都', x: 115.2, y: 38.7, value: 22.8 },
      { name: '赵县', x: 114.8, y: 37.8, value: 24.5 },
    ],
  },
  {
    name: '河北中部平原（TDS）',
    points: [
      { name: '衡水', x: 115.7, y: 37.7, value: 850 },
      { name: '武邑', x: 115.9, y: 37.8, value: 900 },
      { name: '深州', x: 115.6, y: 38.0, value: 780 },
      { name: '冀州', x: 115.6, y: 37.6, value: 920 },
      { name: '辛集', x: 115.3, y: 37.9, value: 750 },
      { name: '南宫', x: 115.4, y: 37.4, value: 820 },
      { name: '新河', x: 115.3, y: 37.5, value: 880 },
      { name: '景县', x: 116.3, y: 37.7, value: 950 },
      { name: '阜城', x: 116.1, y: 37.9, value: 870 },
      { name: '武强', x: 116.0, y: 38.1, value: 830 },
    ],
  },
  {
    name: '沧州滨海区（Cl⁻）',
    points: [
      { name: '沧州', x: 116.9, y: 38.3, value: 320 },
      { name: '青县', x: 116.8, y: 38.6, value: 280 },
      { name: '黄骅', x: 117.3, y: 38.4, value: 450 },
      { name: '海兴', x: 117.5, y: 38.2, value: 520 },
      { name: '盐山', x: 117.2, y: 38.1, value: 380 },
      { name: '孟村', x: 117.1, y: 38.1, value: 350 },
      { name: '南皮', x: 116.7, y: 38.0, value: 290 },
      { name: '东光', x: 116.5, y: 37.9, value: 250 },
      { name: '吴桥', x: 116.5, y: 37.7, value: 220 },
      { name: '泊头', x: 116.6, y: 38.1, value: 300 },
    ],
  },
  {
    name: '燕山山区（泉流量）',
    points: [
      { name: '承德', x: 117.9, y: 40.9, value: 0.85 },
      { name: '兴隆', x: 117.5, y: 40.4, value: 0.72 },
      { name: '宽城', x: 118.5, y: 40.6, value: 0.90 },
      { name: '平泉', x: 118.7, y: 41.0, value: 0.78 },
      { name: '滦平', x: 117.3, y: 40.9, value: 0.68 },
      { name: '丰宁', x: 116.6, y: 41.2, value: 0.55 },
      { name: '围场', x: 117.7, y: 41.9, value: 0.45 },
      { name: '隆化', x: 117.7, y: 41.3, value: 0.62 },
      { name: '承德县', x: 118.2, y: 40.8, value: 0.80 },
      { name: '滦县', x: 118.7, y: 39.8, value: 1.20 },
    ],
  },
  {
    name: '冀东平原（开采量）',
    points: [
      { name: '唐山', x: 118.2, y: 39.6, value: 12.5 },
      { name: '丰润', x: 118.1, y: 39.8, value: 8.5 },
      { name: '丰南', x: 118.1, y: 39.5, value: 10.2 },
      { name: '滦南', x: 118.7, y: 39.5, value: 9.8 },
      { name: '滦县', x: 118.7, y: 39.8, value: 7.5 },
      { name: '乐亭', x: 118.9, y: 39.4, value: 6.8 },
      { name: '遵化', x: 117.9, y: 40.2, value: 5.5 },
      { name: '迁西', x: 118.3, y: 40.1, value: 4.2 },
      { name: '玉田', x: 117.9, y: 39.9, value: 7.8 },
      { name: '唐海', x: 118.5, y: 39.3, value: 8.5 },
    ],
  },
  {
    name: '张家口坝上（水位埋深）',
    points: [
      { name: '张家口', x: 114.9, y: 40.8, value: 15.5 },
      { name: '张北', x: 114.7, y: 41.2, value: 12.0 },
      { name: '康保', x: 114.6, y: 41.9, value: 10.5 },
      { name: '沽源', x: 115.7, y: 41.7, value: 11.0 },
      { name: '尚义', x: 113.9, y: 41.1, value: 13.5 },
      { name: '万全', x: 114.7, y: 40.8, value: 16.0 },
      { name: '崇礼', x: 115.3, y: 40.9, value: 14.5 },
      { name: '赤城', x: 115.8, y: 40.9, value: 13.0 },
      { name: '怀安', x: 114.4, y: 40.7, value: 15.0 },
      { name: '阳原', x: 114.2, y: 40.1, value: 17.0 },
    ],
  },
];

