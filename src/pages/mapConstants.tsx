// 地图常量与图标工厂函数
// 提取自 MapView.tsx Phase 6b 拆分

import React from 'react';
import { Layers, Droplets, Flame, Waves, GlassWater, HardHat, MapPin, AlertTriangle, BarChart3 } from 'lucide-react';
import { gradeColors, getCityAggregatedInfo } from '../data/mapDataEnhanced';

export const TIAN_DI_TOKEN = '174705aebfe31b79b3587279e211cb9a';

// ═══════════════════════════════════════════════════════════
// v4.3.0: 可叠加图层系统（替代Tab单选模式）
// ═══════════════════════════════════════════════════════════

/** 图层定义 */
export const LAYER_DEFS = [
  { key: 'markers', label: '标注分布', icon: MapPin, desc: '泉域/地热/咸水/水源/矿区', color: '#06b6d4' },
  { key: 'resource', label: '资源量分级', icon: Droplets, desc: '地下水资源量分级着色', color: '#3b82f6' },
  { key: 'overdraft', label: '超采区划', icon: AlertTriangle, desc: '浅层/深层超采区范围', color: '#ef4444' },
  { key: 'waterSourcePOI', label: '重要水源地', icon: GlassWater, desc: '城市集中供水水源地', color: '#22d3ee' },
  { key: 'karstSpringPOI', label: '岩溶大泉', icon: Waves, desc: '岩溶泉域分布与特征', color: '#10b981' },
  { key: 'contour', label: '等值线', icon: BarChart3, desc: '水位埋深/水质/地温梯度IDW插值', color: '#8b5cf6' },
] as const;

/** 图层icon映射 */
export const LAYER_ICONS: Record<string, React.ElementType> = {
  Layers, Droplets, Flame, Waves, GlassWater, HardHat,
};

/** 标注颜色映射 */
export const CATEGORY_COLORS: Record<string, string> = {
  spring: '#10b981',
  geothermal: '#ef4444',
  saline: '#f59e0b',
  waterSource: '#06b6d4',
  mine: '#8b5cf6',
};

/** 创建圆形标注图标HTML */
export function createCircleIcon(color: string, size = 12): string {
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 6px ' + color + '80;cursor:pointer;"></div>';
}

/** 创建脉冲标注图标HTML */
export function createPulseIcon(color: string): string {
  return '<div style="position:relative;">' +
    '<div style="width:14px;height:14px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 8px ' + color + ';"></div>' +
    '<div style="position:absolute;top:-4px;left:-4px;width:22px;height:22px;border-radius:50%;background:' + color + '30;animation:pulse 2s infinite;"></div>' +
    '</div>' +
    '<style>@keyframes pulse{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2);opacity:0}}</style>';
}

/** 创建菱形水源地标注图标 */
export function createWaterSourceIcon(): string {
  return '<div style="width:16px;height:16px;background:#22d3ee;border:2px solid rgba(255,255,255,0.95);transform:rotate(45deg);box-shadow:0 0 6px #22d3ee80;cursor:pointer;"></div>';
}

/** 创建星形岩溶泉标注图标 */
export function createKarstSpringIcon(): string {
  return '<div style="font-size:18px;line-height:1;filter:drop-shadow(0 0 4px #10b98180);cursor:pointer;">&#9733;</div>';
}

/** 创建资源量分级气泡 */
export function createGradeBubble(grade: number, city: string, value: number): string {
  const color = gradeColors[grade] || '#3b82f6';
  const size = 18 + (5 - grade) * 4;
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 10px ' + color + '60;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.5);cursor:pointer;">' + value.toFixed(1) + '</div>';
}

/** 构建城市聚合数据弹窗HTML */
export function buildCityPopupHtml(info: ReturnType<typeof getCityAggregatedInfo>): string {
  if (!info) return '';
  const overdraftColor = function(t: string) {
    if (t === '严重超采区') return '#ef4444';
    if (t === '一般超采区') return '#f59e0b';
    return '#6b7280';
  };
  return '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#e5e7eb;font-family:system-ui;padding:12px;border-radius:10px;min-width:260px;border:1px solid rgba(255,255,255,0.08);">' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:8px;color:#fff;display:flex;align-items:center;gap:6px;">' +
    '<div style="width:8px;height:8px;border-radius:50%;background:#06b6d4;"></div>' +
    info.city + '市 · 地下水概览</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">' +
    '<div style="padding:6px 8px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">地下水资源量</div>' +
    '<div style="font-size:13px;font-weight:700;color:#06b6d4;">' + info.groundResource.toFixed(2) + ' <span style="font-size:10px;font-weight:400;color:#9ca3af;">亿m³</span></div></div>' +
    '<div style="padding:6px 8px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">地下水供水量</div>' +
    '<div style="font-size:13px;font-weight:700;color:#3b82f6;">' + info.gwSupply.toFixed(2) + ' <span style="font-size:10px;font-weight:400;color:#9ca3af;">亿m³</span></div></div>' +
    '<div style="padding:6px 8px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">供水占比</div>' +
    '<div style="font-size:13px;font-weight:700;color:#8b5cf6;">' + info.gwRatio.toFixed(1) + '%</div></div>' +
    '<div style="padding:6px 8px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">降水量</div>' +
    '<div style="font-size:13px;font-weight:700;color:#10b981;">' + (info.precipitation > 0 ? info.precipitation.toFixed(0) + ' mm' : '-') + '</div></div></div>' +
    '<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;">' +
    '<div style="font-size:11px;margin-bottom:4px;color:#9ca3af;">超采区类型</div>' +
    '<div style="display:flex;gap:6px;">' +
    '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:' + overdraftColor(info.shallowType) + '20;color:' + overdraftColor(info.shallowType) + ';font-weight:600;">浅层: ' + info.shallowType + '</span>' +
    '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:' + overdraftColor(info.deepType) + '20;color:' + overdraftColor(info.deepType) + ';font-weight:600;">深层: ' + info.deepType + '</span></div>' +
    (info.hasCone ? '<div style="font-size:10px;color:#9ca3af;margin-top:4px;">漏斗: ' + info.coneInfo + '</div>' : '') +
    '</div></div>';
}

/** 水源地名称到坐标的映射 */
export const WATER_SOURCE_COORDS: Record<string, [number, number]> = {
  '石家庄水源地': [38.04, 114.51],
  '保定水源地': [38.87, 115.46],
  '唐山水源地': [39.63, 118.18],
  '邯郸水源地': [36.56, 114.47],
  '邢台水源地': [37.05, 114.50],
  '张家口水源地': [40.78, 114.88],
  '承德水源地': [40.95, 117.97],
  '沧州水源地': [38.30, 116.85],
};

/** 岩溶泉名称到坐标的映射 */
export const KARST_SPRING_COORDS: Record<string, [number, number]> = {
  '黑龙洞泉群': [36.55, 114.20],
  '邢台百泉': [37.05, 114.50],
  '威州泉': [38.35, 114.05],
  '东风湖泉': [36.15, 114.05],
  '涞源泉': [39.38, 114.68],
  '水磨槽泉群': [38.55, 114.60],
  '十股泉': [37.30, 114.55],
  '白鹿泉': [38.15, 114.30],
  '南焦泉': [37.80, 114.25],
  '龙潭泉': [40.63, 115.50],
};
