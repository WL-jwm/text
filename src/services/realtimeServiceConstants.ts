/**
 * 实时数据服务 — 频道配置与预警阈值
 */

import type { ChannelConfig, DataChannel } from './realtimeServiceTypes';

export const CHANNEL_CONFIGS: Record<DataChannel, ChannelConfig> = {
  waterLevel: {
    channel: 'waterLevel',
    label: '水位埋深',
    unit: 'm',
    intervalMs: 5000,
    stations: [
      { id: 'WL-CZ-01', name: '沧州监测站', city: '沧州', baseValue: 18.2, volatility: 0.15 },
      { id: 'WL-HS-01', name: '衡水监测站', city: '衡水', baseValue: 35.5, volatility: 0.20 },
      { id: 'WL-XT-01', name: '邢台监测站', city: '邢台', baseValue: 32.1, volatility: 0.18 },
      { id: 'WL-SJZ-01', name: '石家庄监测站', city: '石家庄', baseValue: 27.5, volatility: 0.12 },
      { id: 'WL-BD-01', name: '保定监测站', city: '保定', baseValue: 23.0, volatility: 0.10 },
      { id: 'WL-LF-01', name: '廊坊监测站', city: '廊坊', baseValue: 22.0, volatility: 0.11 },
    ],
  },
  waterQuality: {
    channel: 'waterQuality',
    label: '水质达标率',
    unit: '%',
    intervalMs: 8000,
    stations: [
      { id: 'WQ-CZ-01', name: '沧州水质站', city: '沧州', baseValue: 72, volatility: 2.5 },
      { id: 'WQ-HS-01', name: '衡水水质站', city: '衡水', baseValue: 78, volatility: 2.0 },
      { id: 'WQ-SJZ-01', name: '石家庄水质站', city: '石家庄', baseValue: 85, volatility: 1.5 },
      { id: 'WQ-BD-01', name: '保定水质站', city: '保定', baseValue: 88, volatility: 1.2 },
      { id: 'WQ-QHD-01', name: '秦皇岛水质站', city: '秦皇岛', baseValue: 92, volatility: 1.0 },
    ],
  },
  subsidence: {
    channel: 'subsidence',
    label: '沉降速率',
    unit: 'mm/a',
    intervalMs: 10000,
    stations: [
      { id: 'SUB-CZ-01', name: '沧州沉降点', city: '沧州', baseValue: 14.5, volatility: 0.3 },
      { id: 'SUB-HS-01', name: '衡水沉降点', city: '衡水', baseValue: 12.0, volatility: 0.25 },
      { id: 'SUB-LF-01', name: '廊坊沉降点', city: '廊坊', baseValue: 10.5, volatility: 0.2 },
      { id: 'SUB-HD-01', name: '邯郸沉降点', city: '邯郸', baseValue: 10.0, volatility: 0.2 },
    ],
  },
  extraction: {
    channel: 'extraction',
    label: '开采量',
    unit: '万m³/d',
    intervalMs: 6000,
    stations: [
      { id: 'EXT-SJZ-01', name: '石家庄开采区', city: '石家庄', baseValue: 125.5, volatility: 3.0 },
      { id: 'EXT-BD-01', name: '保定开采区', city: '保定', baseValue: 98.3, volatility: 2.5 },
      { id: 'EXT-HS-01', name: '衡水开采区', city: '衡水', baseValue: 87.6, volatility: 2.0 },
      { id: 'EXT-CZ-01', name: '沧州开采区', city: '沧州', baseValue: 76.2, volatility: 1.8 },
      { id: 'EXT-HD-01', name: '邯郸开采区', city: '邯郸', baseValue: 82.4, volatility: 2.2 },
    ],
  },
};

// ============================================================
// 预警阈值
// ============================================================


export const ALERT_THRESHOLDS: Record<DataChannel, { warning: number; critical: number; direction: 'above' | 'below' }> = {
  waterLevel: { warning: 30, critical: 40, direction: 'above' },
  waterQuality: { warning: 80, critical: 70, direction: 'below' },
  subsidence: { warning: 12, critical: 20, direction: 'above' },
  extraction: { warning: 100, critical: 130, direction: 'above' },
};

// ============================================================
// 实时数据服务（G-01a 升级版）
// ============================================================

