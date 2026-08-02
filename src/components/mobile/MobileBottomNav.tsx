/**
 * MobileBottomNav — 移动端底部Tab栏
 *
 * 固定在屏幕底部的5Tab快捷导航，类似原生App体验：
 *   - 总览 / 资源 / 可视化 / 工作台 / 更多
 *   - 活跃Tab高亮 + 图标动画
 *   - "更多"弹出半屏Sheet展示全部路由
 *   - 安全区域适配（iPhone刘海/底部Home条）
 */

import { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Droplets, BarChart3, Briefcase, Grid3x3, X } from 'lucide-react';
import { useSafeAreaInsets } from '../../hooks/useMediaQuery';

// ── 主Tab定义（5个快捷入口） ──

interface TabItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const PRIMARY_TABS: TabItem[] = [
  { path: '/', label: '总览', icon: Home },
  { path: '/resources', label: '资源', icon: Droplets },
  { path: '/visualization', label: '可视化', icon: BarChart3 },
  { path: '/workspace', label: '工作台', icon: Briefcase },
];

// ── 全部路由（用于"更多"Sheet） ──

const ALL_ROUTES = [
  { group: '基础数据', items: [
    { path: '/', label: '总览' },
    { path: '/system-zoning', label: '系统区划' },
    { path: '/geology', label: '基础地质' },
    { path: '/map', label: '空间地图' },
  ]},
  { group: '水文地质', items: [
    { path: '/hydro-zone-params', label: '水文地质参数' },
    { path: '/water-source', label: '水源地蓄水构造' },
    { path: '/karst-water', label: '岩溶水' },
    { path: '/fracture-water', label: '裂隙水' },
  ]},
  { group: '资源与环境', items: [
    { path: '/resources', label: '水资源量' },
    { path: '/county-compare', label: '县级数据对比' },
    { path: '/water-quality', label: '水质评价' },
    { path: '/environment', label: '环境地质' },
    { path: '/exploitation', label: '开采管理' },
    { path: '/groundwater-function', label: '超采区划' },
    { path: '/hydrogeology-historical', label: '历史参数' },
    { path: '/groundwater-balance', label: '地下水均衡' },
    { path: '/groundwater-background', label: '环境背景值' },
    { path: '/hydrochemistry', label: '水化学/咸水' },
  ]},
  { group: '专题资源', items: [
    { path: '/geothermal', label: '地热资源' },
    { path: '/mineral-water', label: '矿泉水' },
    { path: '/saline-soil', label: '盐碱土' },
    { path: '/mine-hydrogeology', label: '矿床水文地质' },
  ]},
  { group: '综合分析', items: [
    { path: '/data-insight', label: '数据洞察' },
    { path: '/time-series', label: '时间序列' },
    { path: '/spatial', label: '空间分析' },
    { path: '/visualization', label: '可视化中心' },
  ]},
  { group: '系统', items: [
    { path: '/workspace', label: '个人工作台' },
    { path: '/changelog', label: '变更日志' },
  ]},
];

export function MobileBottomNav() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const insets = useSafeAreaInsets();

  // 判断当前路由是否在主Tab中
  const activeTabIndex = useMemo(() => {
    const idx = PRIMARY_TABS.findIndex(t => t.path === location.pathname);
    return idx;
  }, [location.pathname]);

  const isMoreActive = activeTabIndex === -1;

  return (
    <>
      {/* 底部Tab栏 */}
      <nav
        role="navigation"
        aria-label="移动端底部导航"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gw-card/95 backdrop-blur-lg border-t border-gw-border/60"
        style={{ paddingBottom: `${Math.max(insets.bottom, 8)}px` }}
      >
        <div className="flex items-stretch justify-around px-2 py-1.5">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all min-w-[52px] ${
                  isActive ? 'text-gw-blue' : 'text-gw-muted'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}
                />
                <span className="text-[9px] font-medium">{tab.label}</span>
                {isActive && (
                  <span className="absolute -mt-1 w-1 h-1 rounded-full bg-gw-blue" />
                )}
              </NavLink>
            );
          })}

          {/* 更多按钮 */}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all min-w-[52px] ${
              isMoreActive ? 'text-gw-blue' : 'text-gw-muted'
            }`}
          >
            <Grid3x3 size={20} className={`transition-transform ${showMore ? 'scale-110' : 'scale-100'}`} />
            <span className="text-[9px] font-medium">更多</span>
          </button>
        </div>
      </nav>

      {/* 更多路由Sheet */}
      {showMore && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="全部页面导航"
        >
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />

          {/* Sheet内容 */}
          <div
            className="relative bg-gw-card border-t border-gw-border/60 rounded-t-2xl max-h-[70vh] overflow-y-auto mobile-sheet-enter"
            style={{ paddingBottom: `${Math.max(insets.bottom, 16)}px` }}
          >
            {/* 拖拽指示器 */}
            <div className="sticky top-0 bg-gw-card/95 backdrop-blur pt-3 pb-2 px-4 flex items-center justify-between border-b border-gw-border/30">
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gw-border" />
              <h3 className="text-sm font-semibold text-gw-text mt-1">全部页面</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 rounded-lg text-gw-muted hover:text-gw-text"
              >
                <X size={18} />
              </button>
            </div>

            {/* 路由列表 */}
            <div className="p-3 space-y-4">
              {ALL_ROUTES.map(group => (
                <div key={group.group}>
                  <p className="text-[10px] text-gw-muted/50 uppercase tracking-wider mb-1.5 font-medium px-1">
                    {group.group}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map(item => {
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowMore(false)}
                          className={`px-2 py-2.5 rounded-lg text-[10px] text-center border transition-all ${
                            isActive
                              ? 'bg-gw-blue/15 border-gw-blue/40 text-gw-blue'
                              : 'border-gw-border/20 text-gw-muted hover:text-gw-text hover:bg-gw-surface/50'
                          }`}
                        >
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
