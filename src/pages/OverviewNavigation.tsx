// 全模块入口 + 专业分析工具箱
// 提取自 Overview.tsx Phase 6b 拆分

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid3X3, Briefcase, Droplets, Layers, Database, FlaskConical, MapPin,
  Flame, Drill, Waves, GitFork, HardHat, Mountain, Sprout, GlassWater,
  LayoutGrid, Shield, Beaker, TrendingUp, Target, Satellite, Sliders,
  Atom, Radar, GitCompare, Activity, Building2, MapIcon,
} from 'lucide-react';
import { SectionTitle } from '../components/UI';
import { springDatabase } from '../data/hydrogeologyReference';

const moduleEntries = [
  { label: '工作台', path: '/workspace', icon: Briefcase, count: 0 },
  { label: '泉水', path: '/karst-water', icon: Droplets, count: springDatabase?.length || 0 },
  { label: '地质', path: '/geology', icon: Layers, count: 0 },
  { label: '资源', path: '/resources', icon: Database, count: 0 },
  { label: '水质', path: '/water-quality', icon: FlaskConical, count: 0 },
  { label: '水源地', path: '/water-source', icon: MapPin, count: 0 },
  { label: '地热', path: '/geothermal', icon: Flame, count: 0 },
  { label: '开采', path: '/exploitation', icon: Drill, count: 0 },
  { label: '咸水', path: '/saline-water', icon: Waves, count: 0 },
  { label: '裂隙水', path: '/fracture-water', icon: GitFork, count: 0 },
  { label: '矿山', path: '/mine-hydrogeology', icon: HardHat, count: 0 },
  { label: '岩溶', path: '/karst-water', icon: Mountain, count: 0 },
  { label: '盐碱土', path: '/saline-soil', icon: Sprout, count: 0 },
  { label: '矿泉水', path: '/mineral-water', icon: GlassWater, count: 0 },
  { label: '系统分区', path: '/system-zoning', icon: LayoutGrid, count: 0 },
  { label: '环境', path: '/environment', icon: Shield, count: 0 },
  { label: '水化学', path: '/hydrochemistry', icon: Beaker, count: 0 },
];

const toolboxEntries = [
  { label: '市级达标率', desc: '11市水质三色分级+达标率趋势', path: '/water-quality', tab: '市级达标率', icon: Target, color: 'emerald' },
  { label: 'InSAR沉降监测', desc: '2024年11市地面沉降速率+开采关联', path: '/environment', tab: '地面沉降', icon: Satellite, color: 'red' },
  { label: '参数速查', desc: 'K值量级/释水系数/入渗系数速查', path: '/hydro-params', tab: '参数总览', icon: Sliders, color: 'blue' },
  { label: '同位素分析', desc: 'δD-δ18O散点+径向路径+14C年龄', path: '/hydrochemistry', tab: '同位素分析', icon: Atom, color: 'purple' },
  { label: '数据质量雷达', desc: '6维度资源覆盖度+12模块年份矩阵', path: '/data-insight', tab: '资源概览', icon: Radar, color: 'cyan' },
  { label: '三轴耦合分析', desc: '供水-水质-沉降三轴联动+综合评分', path: '/data-insight', tab: '区域对比', icon: GitCompare, color: 'amber' },
  { label: '四维联动验证', desc: '2020-2024开采量-达标率-水位回升', path: '/data-insight', tab: '总览', icon: Activity, color: 'indigo' },
  { label: '县级资源分析', desc: '5市85县用水结构+依赖度+农业占比', path: '/data-insight', tab: '县级资源分析', icon: Building2, color: 'teal' },
  { label: '县级数据覆盖', desc: '14市数据状态色标+弹窗统计', path: '/data-insight', tab: '县级覆盖', icon: MapIcon, color: 'slate' },
];

export function OverviewNavigation() {
  const navigate = useNavigate();

  return (
    <>
      {/* 全模块入口 */}
      <SectionTitle icon={Grid3X3} badge="快速导航">全模块入口</SectionTitle>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {moduleEntries.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-gw-card/60 border border-gw-border/40 hover:border-gw-cyan/40 hover:shadow-glow-cyan transition-all cursor-pointer">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
              {React.createElement(item.icon as React.ElementType, { size: 16, className: "text-cyan-400" })}
            </div>
            <div className="text-center">
              <p className="text-[11px] text-gw-text font-medium">{item.label}</p>
              {item.count > 0 && <p className="text-[10px] text-gw-muted font-mono">{item.count}</p>}
            </div>
          </button>
        ))}
      </div>

      {/* 专业分析工具箱 */}
      <SectionTitle icon={TrendingUp} badge="深度分析">专业分析工具箱</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-1">
        {toolboxEntries.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path, { state: { tab: item.tab } })}
            className="group relative flex flex-col gap-1 p-2.5 rounded-lg bg-gw-card/60 border border-gw-border/40 hover:border-emerald-500/50 transition-all text-left">
            <div className="flex items-center gap-1.5">
              {React.createElement(item.icon as React.ElementType, { size: 12, className: "text-emerald-400" })}
              <span className="text-[11px] font-medium text-gw-text">{item.label}</span>
            </div>
            <p className="text-[9px] text-gw-muted leading-tight">{item.desc}</p>
          </button>
        ))}
      </div>
    </>
  );
}
