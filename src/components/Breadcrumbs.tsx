import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * 路由-标签映射表
 * 与 App.tsx 中的 navGroups 保持同步
 */
const routeLabels: Record<string, { group: string; label: string; icon?: string }> = {
  '/': { group: '基础数据', label: '总览', icon: 'Database' },
  '/resources': { group: '基础数据', label: '水资源量', icon: 'Droplets' },
  '/water-quality': { group: '基础数据', label: '水质评价', icon: 'FlaskConical' },
  '/environment': { group: '环境地质', label: '环境地质', icon: 'AlertTriangle' },
  '/exploitation': { group: '环境地质', label: '超采治理', icon: 'Wrench' },
  '/hydrochemistry': { group: '专业分论', label: '水化学与同位素', icon: 'FlaskConical' },
  '/geology': { group: '专业分论', label: '基础地质', icon: 'Mountain' },
  '/hydro-zone-params': { group: '专业分论', label: '水文地质参数', icon: 'Layers' },
  '/water-source': { group: '专业分论', label: '水源地', icon: 'Droplets' },
  '/geothermal': { group: '专业分论', label: '地热资源', icon: 'Thermometer' },
  '/mineral-water': { group: '专业分论', label: '矿泉水', icon: 'Gem' },
  '/saline-water': { group: '专业分论', label: '咸水分布', icon: 'Waves' },
  '/saline-soil': { group: '专业分论', label: '盐碱土', icon: 'Layers' },
  '/mine-hydrogeology': { group: '专业分论', label: '矿床水文地质', icon: 'Mountain' },
  '/karst-water': { group: '专业分论', label: '岩溶水', icon: 'Droplets' },
  '/fracture-water': { group: '专业分论', label: '裂隙水', icon: 'Layers' },
  '/map': { group: '工具', label: '地图视图', icon: 'MapPin' },
  '/data-insight': { group: '工具', label: '数据洞察', icon: 'BarChart3' },
  '/system-zoning': { group: '工具', label: '系统分区', icon: 'Layers' },
  '/changelog': { group: '工具', label: '变更日志', icon: 'History' },
};

/**
 * Breadcrumbs - 增强面包屑导航
 * 显示完整路径层级: 首页 > 分组 > 当前页面 > Tab锚点
 * 支持点击任意层级跳转，支持location.state.tab显示子页面锚点
 */
export function Breadcrumbs() {
  const location = useLocation();
  const meta = routeLabels[location.pathname];
  const tabParam = (location.state as { tab?: string } | null)?.tab;

  if (!meta) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gw-muted py-2 px-1" aria-label="面包屑导航">
      {/* 首页 */}
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-gw-cyan transition-colors group"
        title="返回首页"
      >
        <Home className="w-3.5 h-3.5 group-hover:text-gw-cyan transition-colors" />
        <span className="hidden sm:inline">首页</span>
      </Link>

      {/* 分隔符 */}
      <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />

      {/* 分组 */}
      <Link
        to="/"
        className="hover:text-gw-cyan transition-colors"
        title={`查看${meta.group}分组`}
      >
        {meta.group}
      </Link>

      {/* 分隔符 */}
      <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />

      {/* 当前页面 */}
      <span className="text-gw-text font-medium flex items-center gap-1">
        {meta.label}
      </span>

      {/* Tab锚点 - 当location.state.tab存在时显示 */}
      {tabParam && (
        <>
          <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />
          <span className="text-gw-cyan/80 font-mono text-[10px] flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-gw-cyan/60" />
            {tabParam}
          </span>
        </>
      )}
    </nav>
  );
}
