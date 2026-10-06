/**
 * ExportCenterTab — 统一导出中心 (D-02)
 *
 * 工作台第 8 个 Tab，提供全平台统一的批量导出入口。
 * 四个子面板：数据源总览 / 批量导出 / 导出历史 / Pipeline数据包
 * 共享常量与类型（拆分自 ExportCenterTab.tsx）
 */
import type { ExportFormat, ExportCategory } from '../../../store/exportCenterStore';
import { FileText, FileSpreadsheet, History, FileJson, Download, Package, ListChecks } from 'lucide-react';
import React from 'react';

export type PanelKey = 'sources' | 'export' | 'history' | 'pipeline';
export const PANELS: { key: PanelKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'sources', label: '数据源', icon: ListChecks, desc: '27个模块数据源总览与采集状态' },
  { key: 'export', label: '批量导出', icon: Download, desc: '选择模块 → 选择格式 → 一键导出' },
  { key: 'history', label: '导出历史', icon: History, desc: '历史导出记录与重新导出' },
  { key: 'pipeline', label: 'Pipeline数据包', icon: Package, desc: '数据总线已发布数据包导出' },
];
export const FORMAT_CONFIG: Record<ExportFormat, { label: string; icon: React.ElementType; desc: string; color: string }> = {
  excel: { label: 'Excel', icon: FileSpreadsheet, desc: '多Sheet合并为单个.xlsx文件', color: 'text-emerald-400' },
  word: { label: 'Word', icon: FileText, desc: '多章节合并为单个.docx报告', color: 'text-blue-400' },
  json: { label: 'JSON', icon: FileJson, desc: '全量数据打包为.json文件', color: 'text-amber-400' },
};
export const CATEGORY_ORDER: ExportCategory[] = [
  '区域概况', '水质评价', '水量与均衡', '环境地质',
  '专题评价', '数值模拟', '环评与保护区', '数据管理',
  '风险评估', '合规检查', '修复评估',
];
