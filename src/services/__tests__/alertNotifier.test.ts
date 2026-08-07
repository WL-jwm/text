/**
 * 告警通知增强 测试
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import {
  buildAlertTimeline,
  getRecentTimelineEntries,
  AlertNotifier,
  DEFAULT_NOTIFICATION_CONFIG,
} from '../alertNotifier';
import type { WellAlert } from '../wellAlerts';

// Mock Notification API
beforeAll(() => {
  (globalThis as any).Notification = {
    permission: 'denied',
    requestPermission: vi.fn().mockResolvedValue('denied'),
  };
});

const mockAlerts: WellAlert[] = [
  { id: 'A1', wellId: 'W1', type: 'threshold', severity: 'critical', message: '水位严重偏高', createdAt: '2026-08-07T10:00:00', read: false },
  { id: 'A2', wellId: 'W2', type: 'threshold', severity: 'warning', message: '水质预警', createdAt: '2026-08-07T09:00:00', read: false },
  { id: 'A3', wellId: 'W1', type: 'stale', severity: 'stale', message: '数据过期', createdAt: '2026-08-06T10:00:00', read: false },
];

const mockWellNames: Record<string, string> = {
  W1: '石家庄-01',
  W2: '保定-01',
};

describe('buildAlertTimeline', () => {
  it('应构建时间线并按时间降序', () => {
    const timeline = buildAlertTimeline(mockAlerts, mockWellNames);
    expect(timeline.entries).toHaveLength(3);
    // 最新在前
    expect(timeline.entries[0].id).toBe('A1');
    expect(timeline.entries[1].id).toBe('A2');
  });

  it('应统计24h内告警', () => {
    const timeline = buildAlertTimeline(mockAlerts, mockWellNames);
    expect(timeline.stats24h.total).toBeGreaterThanOrEqual(2);
  });

  it('应标记已读状态', () => {
    const readIds = new Set(['A1']);
    const timeline = buildAlertTimeline(mockAlerts, mockWellNames, readIds);
    expect(timeline.entries[0].read).toBe(true);
    expect(timeline.entries[1].read).toBe(false);
    expect(timeline.unreadCount).toBe(2);
  });

  it('应处理空告警列表', () => {
    const timeline = buildAlertTimeline([], {});
    expect(timeline.entries).toHaveLength(0);
    expect(timeline.unreadCount).toBe(0);
  });
});

describe('getRecentTimelineEntries', () => {
  it('应返回最近N条', () => {
    const timeline = buildAlertTimeline(mockAlerts, mockWellNames);
    const recent = getRecentTimelineEntries(timeline, 2);
    expect(recent).toHaveLength(2);
  });
});

describe('AlertNotifier', () => {
  it('应使用默认配置', () => {
    const notifier = new AlertNotifier();
    expect(notifier.getConfig()).toEqual(DEFAULT_NOTIFICATION_CONFIG);
  });

  it('应支持自定义配置', () => {
    const notifier = new AlertNotifier({ criticalOnly: true, soundAlert: false });
    expect(notifier.getConfig().criticalOnly).toBe(true);
    expect(notifier.getConfig().soundAlert).toBe(false);
  });

  it('应更新配置', () => {
    const notifier = new AlertNotifier();
    notifier.updateConfig({ browserNotify: false });
    expect(notifier.getConfig().browserNotify).toBe(false);
  });

  it('新告警应触发通知', () => {
    const notifier = new AlertNotifier({ browserNotify: false, soundAlert: false });
    const sent = notifier.checkAndNotify(mockAlerts, mockWellNames);
    expect(sent).toBeGreaterThan(0);
  });

  it('重复告警不应重复通知', () => {
    const notifier = new AlertNotifier({ browserNotify: false, soundAlert: false, throttleMs: 0 });
    notifier.checkAndNotify(mockAlerts, mockWellNames);
    const sent = notifier.checkAndNotify(mockAlerts, mockWellNames);
    expect(sent).toBe(0);
  });

  it('应重置已通知记录', () => {
    const notifier = new AlertNotifier({ browserNotify: false, soundAlert: false, throttleMs: 0 });
    notifier.checkAndNotify(mockAlerts, mockWellNames);
    notifier.reset();
    const sent = notifier.checkAndNotify(mockAlerts, mockWellNames);
    expect(sent).toBeGreaterThan(0);
  });
});