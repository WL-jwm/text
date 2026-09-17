/**
 * 监测井网络服务 (G-13) — 标准常量
 * 拆分自 wellNetwork.ts：含水层标签 / 井状态标签 / 默认井数据
 */

import type { AquiferType, Well, WellStatus } from './wellNetworkTypes';
export const AQUIFER_LABELS: Record<AquiferType, string> = {
  shallowPorous: '浅层孔隙水',
  deepPorous: '深层孔隙水',
  karst: '岩溶水',
  fracture: '裂隙水',
};

export const WELL_STATUS_LABELS: Record<WellStatus, string> = {
  active: '运行中',
  maintenance: '维护中',
  inactive: '停用',
};

// ============================================================
// 默认监测井数据
// ============================================================
export const DEFAULT_WELLS: Well[] = [
  // ── 水位监测井 ──
  { id: 'WL-CZ-01', name: '沧州监测站', city: '沧州', latitude: 38.31, longitude: 116.84, aquiferType: 'deepPorous', depth: 220, indicators: ['waterLevel'], status: 'active', builtYear: 2012, district: '运河区' },
  { id: 'WL-HS-01', name: '衡水监测站', city: '衡水', latitude: 37.74, longitude: 115.67, aquiferType: 'deepPorous', depth: 260, indicators: ['waterLevel'], status: 'active', builtYear: 2010, district: '桃城区' },
  { id: 'WL-XT-01', name: '邢台监测站', city: '邢台', latitude: 37.07, longitude: 114.50, aquiferType: 'shallowPorous', depth: 120, indicators: ['waterLevel'], status: 'active', builtYear: 2013, district: '襄都区' },
  { id: 'WL-SJZ-01', name: '石家庄监测站', city: '石家庄', latitude: 38.04, longitude: 114.51, aquiferType: 'karst', depth: 180, indicators: ['waterLevel'], status: 'active', builtYear: 2009, district: '长安区' },
  { id: 'WL-BD-01', name: '保定监测站', city: '保定', latitude: 38.87, longitude: 115.46, aquiferType: 'fracture', depth: 150, indicators: ['waterLevel'], status: 'active', builtYear: 2011, district: '竞秀区' },
  { id: 'WL-LF-01', name: '廊坊监测站', city: '廊坊', latitude: 39.52, longitude: 116.70, aquiferType: 'shallowPorous', depth: 90, indicators: ['waterLevel'], status: 'active', builtYear: 2014, district: '广阳区' },

  // ── 水质监测井 ──
  { id: 'WQ-CZ-01', name: '沧州水质站', city: '沧州', latitude: 38.35, longitude: 116.89, aquiferType: 'deepPorous', depth: 200, indicators: ['waterQuality'], status: 'active', builtYear: 2013, district: '新华区' },
  { id: 'WQ-HS-01', name: '衡水水质站', city: '衡水', latitude: 37.70, longitude: 115.72, aquiferType: 'deepPorous', depth: 240, indicators: ['waterQuality'], status: 'active', builtYear: 2012, district: '冀州区' },
  { id: 'WQ-SJZ-01', name: '石家庄水质站', city: '石家庄', latitude: 38.08, longitude: 114.55, aquiferType: 'karst', depth: 170, indicators: ['waterQuality'], status: 'active', builtYear: 2010, district: '裕华区' },
  { id: 'WQ-BD-01', name: '保定水质站', city: '保定', latitude: 38.90, longitude: 115.50, aquiferType: 'fracture', depth: 140, indicators: ['waterQuality'], status: 'active', builtYear: 2012, district: '莲池区' },
  { id: 'WQ-QHD-01', name: '秦皇岛水质站', city: '秦皇岛', latitude: 39.94, longitude: 119.60, aquiferType: 'karst', depth: 160, indicators: ['waterQuality'], status: 'active', builtYear: 2011, district: '海港区' },

  // ── 沉降监测井 ──
  { id: 'SUB-CZ-01', name: '沧州沉降点', city: '沧州', latitude: 38.28, longitude: 116.80, aquiferType: 'shallowPorous', depth: 60, indicators: ['subsidence'], status: 'active', builtYear: 2015, district: '任丘市' },
  { id: 'SUB-HS-01', name: '衡水沉降点', city: '衡水', latitude: 37.78, longitude: 115.62, aquiferType: 'shallowPorous', depth: 55, indicators: ['subsidence'], status: 'active', builtYear: 2015, district: '景县' },
  { id: 'SUB-LF-01', name: '廊坊沉降点', city: '廊坊', latitude: 39.48, longitude: 116.65, aquiferType: 'shallowPorous', depth: 50, indicators: ['subsidence'], status: 'maintenance', builtYear: 2016, district: '安次区' },
  { id: 'SUB-HD-01', name: '邯郸沉降点', city: '邯郸', latitude: 36.62, longitude: 114.50, aquiferType: 'shallowPorous', depth: 65, indicators: ['subsidence'], status: 'active', builtYear: 2014, district: '丛台区' },

  // ── 开采量监测区 ──
  { id: 'EXT-SJZ-01', name: '石家庄开采区', city: '石家庄', latitude: 38.00, longitude: 114.45, aquiferType: 'deepPorous', depth: 250, indicators: ['extraction'], status: 'active', builtYear: 2008, district: '井陉县' },
  { id: 'EXT-BD-01', name: '保定开采区', city: '保定', latitude: 38.83, longitude: 115.40, aquiferType: 'fracture', depth: 160, indicators: ['extraction'], status: 'active', builtYear: 2010, district: '涿州市' },
  { id: 'EXT-HS-01', name: '衡水开采区', city: '衡水', latitude: 37.68, longitude: 115.60, aquiferType: 'deepPorous', depth: 230, indicators: ['extraction'], status: 'active', builtYear: 2009, district: '枣强县' },
  { id: 'EXT-CZ-01', name: '沧州开采区', city: '沧州', latitude: 38.26, longitude: 116.78, aquiferType: 'deepPorous', depth: 240, indicators: ['extraction'], status: 'active', builtYear: 2011, district: '沧县' },
  { id: 'EXT-HD-01', name: '邯郸开采区', city: '邯郸', latitude: 36.58, longitude: 114.45, aquiferType: 'shallowPorous', depth: 110, indicators: ['extraction'], status: 'active', builtYear: 2012, district: '磁县' },
];

// ============================================================
// 空间分析工具函数
// ============================================================

/**
 * 计算两井之间的球面距离（Haversine 公式，单位 km）
 */
