/**
 * 拆分自 App.tsx — 侧栏导航数据与 i18n 键映射
 */

import { Database, Droplets, FlaskConical, AlertTriangle, Wrench, Waves, Mountain, Layers, History, Thermometer, Gem, MapPin, Briefcase, Ban, Scale, TrendingDown, BarChart3 } from 'lucide-react';

export const navGroups = [
  {
    label: '基础数据',
    items: [
      { path: '/', label: '总览', icon: Database, description: '数据驾驶舱 / KPI看板' },
      { path: '/system-zoning', label: '系统区划', icon: Layers, description: '地下水系统 / 含水系统 / 流动系统' },
      { path: '/geology', label: '基础地质', icon: Mountain, description: '地质构造 / 地层岩性' },
      { path: '/map', label: '空间地图', icon: MapPin, description: '天地图 / 系统区划 / 泉域 / 地热田' },
    ],
  },
  {
    label: '水文地质',
    items: [
      { path: '/hydro-zone-params', label: '水文地质参数', icon: Layers, description: '含水层组 / 渗透系数 / 给水度' },
      { path: '/water-source', label: '水源地蓄水构造', icon: Droplets, description: '岩溶盆地 / 山间盆地 / 冲洪积扇 / 古河道' },
      { path: '/karst-water', label: '岩溶水', icon: Waves, description: '泉域 / 岩溶分区' },
      { path: '/fracture-water', label: '裂隙水', icon: Mountain, description: '风化带 / 构造 / 层间裂隙水' },
    ],
  },
  {
    label: '资源与环境',
    items: [
      { path: '/resources', label: '水资源量', icon: Droplets, description: '供水结构 / 资源时序 / 各市排名' },
      { path: '/county-compare', label: '县级数据对比', icon: MapPin, description: '5市85县用水结构 / 供水分析 / 跨市排行' },
      { path: '/water-quality', label: '水质评价', icon: FlaskConical, description: '国考水质 / 污染程度 / 工业用水评价' },
      { path: '/environment', label: '环境地质', icon: AlertTriangle, description: '地下水漏斗 / 地面沉降' },
      { path: '/exploitation', label: '开采管理', icon: Wrench, description: '超采治理 / 开采量控制' },
      { path: '/groundwater-function', label: '超采区划', icon: Ban, description: '超采区分布 / 功能区划 / 禁采限采' },
      { path: '/hydrogeology-historical', label: '历史参数', icon: Database, description: '泉水数据库 / 含水层参数 / 工程地质' },
      { path: '/groundwater-balance', label: '地下水均衡', icon: Scale, description: '水均衡 / 开采潜力 / 水质污染评价' },
      { path: '/groundwater-background', label: '环境背景值', icon: FlaskConical, description: '分区背景值 / 超标因子 / 标准对照' },
      { path: '/hydrochemistry', label: '水化学/咸水', icon: Waves, description: '水化学特征 / 咸水分布' },
    ],
  },
  {
    label: '专题资源',
    items: [
      { path: '/geothermal', label: '地热资源', icon: Thermometer, description: '地热田 / 利用现状 / 热流值' },
      { path: '/mineral-water', label: '矿泉水', icon: Gem, description: '产地 / 水质类型 / 开发状况' },
      { path: '/saline-soil', label: '盐碱土', icon: MapPin, description: '分布 / 类型 / 改良措施' },
      { path: '/mine-hydrogeology', label: '矿床水文地质', icon: Mountain, description: '矿区涌水 / 充水水源' },
    ],
  },
  {
    label: '综合分析',
    items: [
      { path: '/data-insight', label: '数据洞察', icon: BarChart3, description: '跨模块关联分析 / 区域对比' },
      { path: '/time-series', label: '时间序列', icon: TrendingDown, description: '2014-2024年多维度变化趋势' },
      { path: '/spatial', label: '空间分析', icon: Layers, description: '多维度自相关 / 分区特征 / 异常检测' },
      { path: '/visualization', label: '可视化中心', icon: BarChart3, description: '交互地图 / 含水层剖面 / Piper三线图 / 仪表盘' },
    ],
  },
  {
    label: '系统',
    items: [
      { path: '/workspace', label: '个人工作台', icon: Briefcase, description: '数据导入 / 标注 / 收藏 / 校验' },
      { path: '/changelog', label: '变更日志', icon: History, description: '版本记录 / 数据来源' },
    ],
  },
];


// Flat lookup for breadcrumb
export const pageMeta: Record<string, { label: string; group: string }> = {};
navGroups.forEach(g => g.items.forEach(i => {
  pageMeta[i.path] = { label: i.label, group: g.label };
}));

// navGroups 28 + saline-water(1) + NotFound(1) = 30 pages
export const TOTAL_PAGES = navGroups.reduce((n, g) => n + g.items.length, 0) + 2;

export const NAV_I18N_KEYS: Record<string, { label: string; desc: string }> = {
  '/': { label: 'nav.page.overview', desc: 'nav.page.overview.desc' },
  '/system-zoning': { label: 'nav.page.system-zoning', desc: 'nav.page.system-zoning.desc' },
  '/geology': { label: 'nav.page.geology', desc: 'nav.page.geology.desc' },
  '/map': { label: 'nav.page.map', desc: 'nav.page.map.desc' },
  '/hydro-zone-params': { label: 'nav.page.hydro-zone-params', desc: 'nav.page.hydro-zone-params.desc' },
  '/water-source': { label: 'nav.page.water-source', desc: 'nav.page.water-source.desc' },
  '/karst-water': { label: 'nav.page.karst-water', desc: 'nav.page.karst-water.desc' },
  '/fracture-water': { label: 'nav.page.fracture-water', desc: 'nav.page.fracture-water.desc' },
  '/resources': { label: 'nav.page.resources', desc: 'nav.page.resources.desc' },
  '/county-compare': { label: 'nav.page.county-compare', desc: 'nav.page.county-compare.desc' },
  '/water-quality': { label: 'nav.page.water-quality', desc: 'nav.page.water-quality.desc' },
  '/environment': { label: 'nav.page.environment', desc: 'nav.page.environment.desc' },
  '/exploitation': { label: 'nav.page.exploitation', desc: 'nav.page.exploitation.desc' },
  '/groundwater-function': { label: 'nav.page.groundwater-function', desc: 'nav.page.groundwater-function.desc' },
  '/hydrogeology-historical': { label: 'nav.page.hydrogeology-historical', desc: 'nav.page.hydrogeology-historical.desc' },
  '/groundwater-balance': { label: 'nav.page.groundwater-balance', desc: 'nav.page.groundwater-balance.desc' },
  '/groundwater-background': { label: 'nav.page.groundwater-background', desc: 'nav.page.groundwater-background.desc' },
  '/hydrochemistry': { label: 'nav.page.hydrochemistry', desc: 'nav.page.hydrochemistry.desc' },
  '/geothermal': { label: 'nav.page.geothermal', desc: 'nav.page.geothermal.desc' },
  '/mineral-water': { label: 'nav.page.mineral-water', desc: 'nav.page.mineral-water.desc' },
  '/saline-soil': { label: 'nav.page.saline-soil', desc: 'nav.page.saline-soil.desc' },
  '/mine-hydrogeology': { label: 'nav.page.mine-hydrogeology', desc: 'nav.page.mine-hydrogeology.desc' },
  '/data-insight': { label: 'nav.page.data-insight', desc: 'nav.page.data-insight.desc' },
  '/time-series': { label: 'nav.page.time-series', desc: 'nav.page.time-series.desc' },
  '/spatial': { label: 'nav.page.spatial', desc: 'nav.page.spatial.desc' },
  '/visualization': { label: 'nav.page.visualization', desc: 'nav.page.visualization.desc' },
  '/workspace': { label: 'nav.page.workspace', desc: 'nav.page.workspace.desc' },
  '/changelog': { label: 'nav.page.changelog', desc: 'nav.page.changelog.desc' },
};

export const NAV_GROUP_KEYS: Record<number, string> = {
  0: 'nav.group.basic',
  1: 'nav.group.hydro',
  2: 'nav.group.resource',
  3: 'nav.group.special',
  4: 'nav.group.analysis',
  5: 'nav.group.system',
};
