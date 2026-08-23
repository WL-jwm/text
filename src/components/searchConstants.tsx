/**
 * 全局搜索 — 类别图标/颜色/热门搜索常量
 */

import React from 'react';
import {
  BookOpen, MapPin, Droplets, AlertTriangle, Database,
  Layers, Wrench, Thermometer, Gem, Mountain, Waves,
  FlaskConical, BarChart3, Briefcase,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '导航': <MapPin size={12} />,
  '概览数据': <Database size={12} />,
  '地下水资源': <Droplets size={12} />,
  '水质评价': <FlaskConical size={12} />,
  '水化学': <FlaskConical size={12} />,
  '背景值': <FlaskConical size={12} />,
  '水质标准': <BookOpen size={12} />,
  '系统分区': <Layers size={12} />,
  '基础地质': <Mountain size={12} />,
  '水源地': <MapPin size={12} />,
  '岩溶水': <Waves size={12} />,
  '裂隙水': <Waves size={12} />,
  '开采管理': <Wrench size={12} />,
  '超采治理': <AlertTriangle size={12} />,
  '地下水功能': <AlertTriangle size={12} />,
  '地下水漏斗': <AlertTriangle size={12} />,
  '地热': <Thermometer size={12} />,
  '地热田': <Thermometer size={12} />,
  '矿泉水': <Gem size={12} />,
  '咸水分布': <Droplets size={12} />,
  '咸水': <Droplets size={12} />,
  '盐碱地': <Layers size={12} />,
  '矿区水文': <Briefcase size={12} />,
  '矿床水文地质': <Briefcase size={12} />,
  '矿山水文地质': <Briefcase size={12} />,
  '环境地质': <AlertTriangle size={12} />,
  '地面沉降': <AlertTriangle size={12} />,
  '数据洞察': <BarChart3 size={12} />,
  '县级对比': <BarChart3 size={12} />,
  '工作台': <Briefcase size={12} />,
  '术语': <BookOpen size={12} />,
  '标准': <BookOpen size={12} />,
  '同位素': <FlaskConical size={12} />,
  '地图': <MapPin size={12} />,
  '空间地图': <MapPin size={12} />,
  '数据质量': <BarChart3 size={12} />,
  '历史参数': <BookOpen size={12} />,
  '地下水均衡': <Droplets size={12} />,
};

// ── 分类颜色映射 ──

export const CATEGORY_COLORS: Record<string, string> = {
  '导航': '#3b82f6',
  '概览数据': '#06b6d4',
  '地下水资源': '#3b82f6',
  '水质评价': '#10b981',
  '水化学': '#10b981',
  '背景值': '#8b5cf6',
  '水质标准': '#8b5cf6',
  '系统分区': '#f59e0b',
  '基础地质': '#f97316',
  '水源地': '#3b82f6',
  '岩溶水': '#06b6d4',
  '裂隙水': '#06b6d4',
  '开采管理': '#f59e0b',
  '超采治理': '#ef4444',
  '地下水功能': '#ef4444',
  '地下水漏斗': '#ef4444',
  '地热': '#ec4899',
  '地热田': '#ec4899',
  '矿泉水': '#8b5cf6',
  '咸水分布': '#14b8a6',
  '咸水': '#14b8a6',
  '盐碱地': '#a855f7',
  '矿区水文': '#f97316',
  '矿床水文地质': '#f97316',
  '矿山水文地质': '#f97316',
  '环境地质': '#ef4444',
  '地面沉降': '#ef4444',
  '数据洞察': '#3b82f6',
  '县级对比': '#3b82f6',
  '工作台': '#64748b',
  '术语': '#64748b',
  '标准': '#64748b',
  '同位素': '#8b5cf6',
  '地图': '#06b6d4',
  '空间地图': '#06b6d4',
  '数据质量': '#10b981',
  '历史参数': '#f59e0b',
  '地下水均衡': '#3b82f6',
};

/** 热门搜索词 */

export const HOT_SEARCHES = [
  '石家庄', '邯郸', '保定', '邢台', '唐山',
  '地下水资源量', '超采区', '岩溶水', '地热', '矿泉水',
  '水质评价', '含水层', '渗透系数', '给水度',
  '黑龙洞泉', '百泉', '滹沱河',
];

// ═══════════════════════════════════════════════════════════
// 搜索历史管理（localStorage）
// ═══════════════════════════════════════════════════════════
