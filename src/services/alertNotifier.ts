/**
 * 横向质量优化 - 告警通知增强
 * 浏览器通知 + 声音提醒 + 告警时间线
 */
import type { WellAlert, AlertSeverity } from './wellAlerts';

// ============ 通知配置 ============

export interface NotificationConfig {
  /** 是否启用浏览器通知 */
  browserNotify: boolean;
  /** 是否启用声音提醒 */
  soundAlert: boolean;
  /** 仅对 critical 级别通知 */
  criticalOnly: boolean;
  /** 通知间隔(ms)，防止重复通知 */
  throttleMs: number;
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  browserNotify: true,
  soundAlert: true,
  criticalOnly: false,
  throttleMs: 60000, // 1分钟
};

// ============ 告警时间线 ============

/** 告警时间线条目 */
export interface AlertTimelineEntry {
  id: string;
  wellId: string;
  wellName: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  timestamp: string;
  /** 是否已读 */
  read: boolean;
}

/** 告警时间线 */
export interface AlertTimeline {
  entries: AlertTimelineEntry[];
  unreadCount: number;
  /** 最近24h统计 */
  stats24h: { critical: number; warning: number; stale: number; total: number };
}

// ============ 浏览器通知 ============

/**
 * 检查浏览器通知权限
 */
export async function checkNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

/**
 * 发送浏览器通知
 */
export function sendBrowserNotification(
  title: string,
  options: NotificationOptions,
): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });
    // 自动关闭（5秒后）
    setTimeout(() => notification.close(), 5000);
    return notification;
  } catch {
    return null;
  }
}

/**
 * 发送告警通知
 */
export function sendAlertNotification(
  alert: WellAlert,
  wellName: string,
): void {
  const severityLabel = alert.severity === 'critical' ? '🔴 严重' : alert.severity === 'warning' ? '🟡 预警' : '⚪ 过期';
  const title = `[${severityLabel}] ${wellName}`;
  sendBrowserNotification(title, {
    body: alert.message,
    tag: alert.id,
    requireInteraction: alert.severity === 'critical',
  });
}

// ============ 声音提醒 ============

/**
 * 播放告警声音
 * 使用 Web Audio API 生成提示音，无需外部文件
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/**
 * 播放提示音
 * @param type 声音类型: 'critical' 持续高频, 'warning' 短促中频
 */
export function playAlertSound(type: 'critical' | 'warning'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'critical') {
      // 高频持续（900Hz，3次脉冲）
      oscillator.frequency.value = 900;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);

      // 第二次脉冲
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1200;
      osc2.type = 'square';
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.25);
    } else {
      // 中频短促（600Hz，单次）
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    }
  } catch {
    // 声音播放失败时静默
  }
}

// ============ 告警时间线 ============

/**
 * 构建告警时间线
 * 纯函数，可测试
 */
export function buildAlertTimeline(
  alerts: WellAlert[],
  wellNames: Record<string, string>,
  readIds: Set<string> = new Set(),
): AlertTimeline {
  const entries: AlertTimelineEntry[] = [];
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;

  let critical24h = 0;
  let warning24h = 0;
  let stale24h = 0;

  for (const a of alerts) {
    const timestamp = a.createdAt;
    const t = new Date(timestamp).getTime();

    // 24h 统计
    if (t >= dayAgo) {
      if (a.severity === 'critical') critical24h++;
      else if (a.severity === 'warning') warning24h++;
      else stale24h++;
    }

    entries.push({
      id: a.id,
      wellId: a.wellId,
      wellName: wellNames[a.wellId] ?? a.wellId,
      severity: a.severity,
      type: a.type,
      message: a.message,
      timestamp,
      read: readIds.has(a.id),
    });
  }

  // 按时间降序排列（最新的在前）
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = entries.filter(e => !e.read).length;

  return {
    entries,
    unreadCount,
    stats24h: {
      critical: critical24h,
      warning: warning24h,
      stale: stale24h,
      total: critical24h + warning24h + stale24h,
    },
  };
}

/**
 * 获取告警时间线中最近 N 条
 */
export function getRecentTimelineEntries(
  timeline: AlertTimeline,
  count: number = 20,
): AlertTimelineEntry[] {
  return timeline.entries.slice(0, count);
}

// ============ 通知管理器 ============

/**
 * 告警通知管理器
 * 管理通知发送的去重与节流
 */
export class AlertNotifier {
  private config: NotificationConfig;
  private notifiedIds: Set<string> = new Set();
  private lastNotifyTime: number = 0;
  private previousAlertCount: number = 0;

  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };
  }

  /** 更新配置 */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** 获取当前配置 */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * 检查并发送新告警通知
   * 返回已发送的通知数
   */
  checkAndNotify(alerts: WellAlert[], wellNames: Record<string, string>): number {
    let sentCount = 0;

    // 过滤需要通知的告警
    const newAlerts = alerts.filter(a => !this.notifiedIds.has(a.id));
    if (newAlerts.length === 0) return 0;

    // 节流检查
    const now = Date.now();
    if (now - this.lastNotifyTime < this.config.throttleMs) {
      return 0;
    }

    for (const alert of newAlerts) {
      if (this.config.criticalOnly && alert.severity !== 'critical') continue;

      const wellName = wellNames[alert.wellId] ?? alert.wellId;

      // 浏览器通知
      if (this.config.browserNotify) {
        sendAlertNotification(alert, wellName);
      }

      // 声音提醒
      if (this.config.soundAlert) {
        playAlertSound(alert.severity === 'critical' ? 'critical' : 'warning');
      }

      this.notifiedIds.add(alert.id);
      sentCount++;
    }

    this.lastNotifyTime = now;
    return sentCount;
  }

  /**
   * 重置（清除已通知记录）
   */
  reset(): void {
    this.notifiedIds.clear();
    this.lastNotifyTime = 0;
  }
}