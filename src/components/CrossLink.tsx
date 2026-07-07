import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';

// ── 页面关联路径注册 ──
export interface PageRelation {
  path: string;
  label: string;
  description: string;
  relevance: 'primary' | 'secondary' | 'reference';
}

// 各页面的关联页面映射
export const pageRelations: Record<string, PageRelation[]> = {
  '/system-zoning': [
    { path: '/hydro-zone-params', label: '水文地质参数', description: '各系统区含水层K/μ/ne/αL参数', relevance: 'primary' },
    { path: '/geology', label: '基础地质', description: '构造单元/含水层组/地层岩性', relevance: 'primary' },
    { path: '/karst-water', label: '岩溶水', description: '太行山/燕山岩溶泉域系统', relevance: 'secondary' },
    { path: '/fracture-water', label: '裂隙水', description: '山区裂隙水发育特征', relevance: 'secondary' },
    { path: '/water-source', label: '水源地', description: '蓄水构造类型与分布', relevance: 'reference' },
    { path: '/resources', label: '水资源量', description: '各系统区水资源总量', relevance: 'reference' },
  ],
  '/geology': [
    { path: '/system-zoning', label: '系统区划', description: '水文地质系统分区', relevance: 'primary' },
    { path: '/hydro-zone-params', label: '水文地质参数', description: '含水层组参数', relevance: 'primary' },
    { path: '/karst-water', label: '岩溶水', description: '碳酸盐岩含水层', relevance: 'secondary' },
    { path: '/fracture-water', label: '裂隙水', description: '基岩裂隙水', relevance: 'secondary' },
    { path: '/geothermal', label: '地热资源', description: '地质构造控热', relevance: 'reference' },
  ],
  '/hydro-zone-params': [
    { path: '/system-zoning', label: '系统区划', description: '参数空间分布', relevance: 'primary' },
    { path: '/geology', label: '基础地质', description: '含水层组岩性', relevance: 'primary' },
    { path: '/water-source', label: '水源地', description: '富水性参数', relevance: 'secondary' },
    { path: '/mine-hydrogeology', label: '矿床水文地质', description: '矿区充水参数', relevance: 'reference' },
  ],
  '/water-source': [
    { path: '/system-zoning', label: '系统区划', description: '水源地所在系统区', relevance: 'primary' },
    { path: '/hydro-zone-params', label: '水文地质参数', description: '含水层参数', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '供水能力统计', relevance: 'secondary' },
    { path: '/karst-water', label: '岩溶水', description: '岩溶盆地型水源地', relevance: 'secondary' },
    { path: '/geology', label: '基础地质', description: '蓄水构造地质背景', relevance: 'reference' },
    { path: '/water-quality', label: '水质评价', description: '水源地水质状况', relevance: 'reference' },
  ],
  '/karst-water': [
    { path: '/system-zoning', label: '系统区划', description: '泉域所在系统区', relevance: 'primary' },
    { path: '/geology', label: '基础地质', description: '碳酸盐岩分布', relevance: 'primary' },
    { path: '/hydrochemistry', label: '水化学', description: '岩溶水化学特征', relevance: 'primary' },
    { path: '/mine-hydrogeology', label: '矿床水文地质', description: '岩溶充水矿床', relevance: 'secondary' },
    { path: '/resources', label: '水资源量', description: '岩溶水开采量', relevance: 'reference' },
  ],
  '/fracture-water': [
    { path: '/system-zoning', label: '系统区划', description: '山区系统分区', relevance: 'primary' },
    { path: '/geology', label: '基础地质', description: '构造控水', relevance: 'primary' },
    { path: '/hydro-zone-params', label: '水文地质参数', description: '裂隙水参数', relevance: 'secondary' },
    { path: '/mine-hydrogeology', label: '矿床水文地质', description: '裂隙充水矿床', relevance: 'secondary' },
  ],
  '/resources': [
    { path: '/water-quality', label: '水质评价', description: '水质与水量关系', relevance: 'primary' },
    { path: '/exploitation', label: '开采管理', description: '超采治理与供水', relevance: 'primary' },
    { path: '/system-zoning', label: '系统区划', description: '各系统区资源量', relevance: 'secondary' },
    { path: '/water-source', label: '水源地', description: '集中供水水源', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '超采引起的环境问题', relevance: 'reference' },
    { path: '/hydrochemistry', label: '水化学', description: '水化学与水质', relevance: 'reference' },
  ],
  '/water-quality': [
    { path: '/hydrochemistry', label: '水化学', description: '水化学分区与特征', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '水质影响可用水量', relevance: 'primary' },
    { path: '/saline-water', label: '咸水分布', description: '咸水区水质问题', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '污染与修复', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '水质空间分布', relevance: 'reference' },
  ],
  '/hydrochemistry': [
    { path: '/water-quality', label: '水质评价', description: '水质评价标准', relevance: 'primary' },
    { path: '/saline-water', label: '咸水分布', description: '咸淡水界面', relevance: 'primary' },
    { path: '/karst-water', label: '岩溶水', description: '岩溶水化学', relevance: 'secondary' },
    { path: '/geothermal', label: '地热资源', description: '地热水化学', relevance: 'secondary' },
    { path: '/mineral-water', label: '矿泉水', description: '矿泉水水质', relevance: 'reference' },
    { path: '/system-zoning', label: '系统区划', description: '水化学水平分带', relevance: 'reference' },
  ],
  '/environment': [
    { path: '/exploitation', label: '开采管理', description: '超采治理措施', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '超采影响水量', relevance: 'primary' },
    { path: '/saline-water', label: '咸水分布', description: '咸水入侵问题', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '环境问题分区', relevance: 'reference' },
  ],
  '/exploitation': [
    { path: '/environment', label: '环境地质', description: '超采环境效应', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '供水量与资源量', relevance: 'primary' },
    { path: '/water-source', label: '水源地', description: '水源地开采管理', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '各系统区开采状况', relevance: 'reference' },
  ],
  '/geothermal': [
    { path: '/geology', label: '基础地质', description: '控热构造', relevance: 'primary' },
    { path: '/hydrochemistry', label: '水化学', description: '地热水化学特征', relevance: 'primary' },
    { path: '/mineral-water', label: '矿泉水', description: '矿泉水与地热伴生', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '地热田分布', relevance: 'reference' },
  ],
  '/mineral-water': [
    { path: '/geology', label: '基础地质', description: '矿泉水地质成因', relevance: 'primary' },
    { path: '/hydrochemistry', label: '水化学', description: '矿泉水化学成分', relevance: 'primary' },
    { path: '/geothermal', label: '地热资源', description: '与地热田伴生', relevance: 'secondary' },
    { path: '/water-quality', label: '水质评价', description: '矿泉水水质标准', relevance: 'reference' },
  ],
  '/saline-water': [
    { path: '/saline-soil', label: '盐碱土', description: '咸水与盐碱土关系', relevance: 'primary' },
    { path: '/hydrochemistry', label: '水化学', description: '咸水化学特征', relevance: 'primary' },
    { path: '/water-quality', label: '水质评价', description: '咸水水质评价', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '咸水入侵', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '咸水区分布', relevance: 'reference' },
  ],
  '/saline-soil': [
    { path: '/saline-water', label: '咸水分布', description: '咸水与盐碱土成因', relevance: 'primary' },
    { path: '/hydrochemistry', label: '水化学', description: '土壤盐分来源', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '土壤盐渍化', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '盐碱土分布区', relevance: 'reference' },
  ],
  '/mine-hydrogeology': [
    { path: '/karst-water', label: '岩溶水', description: '岩溶充水矿床', relevance: 'primary' },
    { path: '/fracture-water', label: '裂隙水', description: '裂隙充水矿床', relevance: 'primary' },
    { path: '/hydro-zone-params', label: '水文地质参数', description: '矿区水文参数', relevance: 'secondary' },
    { path: '/geology', label: '基础地质', description: '矿区地质构造', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '矿山排水影响', relevance: 'reference' },
    { path: '/water-quality', label: '水质评价', description: '矿坑水水质', relevance: 'reference' },
  ],
  '/data-insight': [
    { path: '/resources', label: '水资源量', description: '供水结构分析', relevance: 'primary' },
    { path: '/environment', label: '环境地质', description: '资源-环境关联', relevance: 'primary' },
    { path: '/water-quality', label: '水质评价', description: '水质与供水分析', relevance: 'primary' },
    { path: '/system-zoning', label: '系统区划', description: '区域分区数据', relevance: 'secondary' },
    { path: '/map', label: '空间地图', description: '空间分布可视化', relevance: 'secondary' },
  ],
  // E-1: 补全5个缺失页面关联映射
  '/map': [
    { path: '/resources', label: '水资源量', description: '各市数据空间分布', relevance: 'primary' },
    { path: '/data-insight', label: '数据洞察', description: '跨模块关联分析', relevance: 'primary' },
    { path: '/county-compare', label: '县级对比', description: '县级数据空间覆盖', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '分区边界图层', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '漏斗/沉降空间分布', relevance: 'reference' },
  ],
  '/county-compare': [
    { path: '/resources', label: '水资源量', description: '市级水资源公报', relevance: 'primary' },
    { path: '/data-insight', label: '数据洞察', description: '县级资源分析', relevance: 'primary' },
    { path: '/spatial', label: '空间分析', description: '县级空间覆盖', relevance: 'primary' },
    { path: '/map', label: '空间地图', description: '县级数据覆盖图层', relevance: 'secondary' },
    { path: '/exploitation', label: '开采管理', description: '各市开采量对比', relevance: 'secondary' },
    { path: '/water-quality', label: '水质评价', description: '县级水质对比', relevance: 'secondary' },
  ],
  '/workspace': [
    { path: '/resources', label: '水资源量', description: '数据导入参考', relevance: 'primary' },
    { path: '/data-insight', label: '数据洞察', description: '数据质量评估', relevance: 'primary' },
    { path: '/map', label: '空间地图', description: '标注与数据叠加', relevance: 'secondary' },
    { path: '/changelog', label: '变更日志', description: '数据版本追踪', relevance: 'reference' },
  ],
  '/changelog': [
    { path: '/data-insight', label: '数据洞察', description: '资源覆盖度评估', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '数据来源参考', relevance: 'secondary' },
  ],
  // E-1: Overview总览页面关联(首页，不需要CrossLinkPanel，但注册便于其他页面反向链接)
  // ── 新增页面关联映射 ──
  '/time-series': [
    { path: '/resources', label: '水资源量', description: '水位开采时空变化', relevance: 'primary' },
    { path: '/exploitation', label: '开采管理', description: '年度开采量趋势', relevance: 'primary' },
    { path: '/spatial', label: '空间分析', description: '时空联合分析', relevance: 'primary' },
    { path: '/water-quality', label: '水质评价', description: '水质年际变化趋势', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '沉降速率时序', relevance: 'secondary' },
    { path: '/data-insight', label: '数据洞察', description: '多维度时序关联', relevance: 'reference' },
  ],
  '/spatial': [
    { path: '/time-series', label: '时间序列', description: '时空联合分析', relevance: 'primary' },
    { path: '/map', label: '等值线图', description: '空间插值可视化', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '各市数据空间分布', relevance: 'primary' },
    { path: '/county-compare', label: '县级对比', description: '县级空间覆盖', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '分区边界图层', relevance: 'reference' },
    { path: '/data-insight', label: '数据洞察', description: '空间相关分析', relevance: 'reference' },
  ],
  '/groundwater-function': [
    { path: '/resources', label: '水资源量', description: '功能区水资源量', relevance: 'primary' },
    { path: '/water-quality', label: '水质评价', description: '各功能区水质状况', relevance: 'primary' },
    { path: '/system-zoning', label: '系统区划', description: '功能区划分基础', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '地下水环境状况', relevance: 'secondary' },
    { path: '/exploitation', label: '开采管理', description: '功能区开采限定', relevance: 'reference' },
  ],
  '/hydrogeology-historical': [
    { path: '/time-series', label: '时间序列', description: '历史水位/沉降趋势', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '历史资源变化', relevance: 'primary' },
    { path: '/environment', label: '环境地质', description: '历史环境问题演变', relevance: 'secondary' },
    { path: '/exploitation', label: '开采管理', description: '历史开采变化', relevance: 'secondary' },
    { path: '/geology', label: '基础地质', description: '地质条件历史', relevance: 'reference' },
  ],
  '/groundwater-balance': [
    { path: '/resources', label: '水资源量', description: '资源供需平衡', relevance: 'primary' },
    { path: '/exploitation', label: '开采管理', description: '开采量与补给量', relevance: 'primary' },
    { path: '/environment', label: '环境地质', description: '超采引起的负衡问题', relevance: 'secondary' },
    { path: '/hydrogeology-historical', label: '历史演变', description: '衡算历史变化', relevance: 'secondary' },
    { path: '/system-zoning', label: '系统区划', description: '分区衡算', relevance: 'reference' },
  ],
  '/groundwater-background': [
    { path: '/water-quality', label: '水质评价', description: '背景值与现状对比', relevance: 'primary' },
    { path: '/hydrochemistry', label: '水化学', description: '背景水化学特征', relevance: 'primary' },
    { path: '/system-zoning', label: '系统区划', description: '各系统背景值', relevance: 'secondary' },
    { path: '/geology', label: '基础地质', description: '地质背景条件', relevance: 'secondary' },
    { path: '/environment', label: '环境地质', description: '人为污染对比', relevance: 'reference' },
  ],
  '/data-quality': [
    { path: '/workspace', label: '工作空间', description: '数据质量控制面板', relevance: 'primary' },
    { path: '/data-insight', label: '数据洞察', description: '数据覆盖度评估', relevance: 'primary' },
    { path: '/changelog', label: '变更日志', description: '数据版本跟踪', relevance: 'secondary' },
    { path: '/resources', label: '水资源量', description: '数据来源参考', relevance: 'reference' },
  ],
  '/': [
    { path: '/data-insight', label: '数据洞察', description: '跨模块关联分析', relevance: 'primary' },
    { path: '/resources', label: '水资源量', description: '全省资源数据', relevance: 'primary' },
    { path: '/map', label: '空间地图', description: '数据空间分布', relevance: 'secondary' },
    { path: '/changelog', label: '变更日志', description: '版本与更新', relevance: 'reference' },
  ],
};

// ── 交叉引用面板组件 ──
export function CrossLinkPanel({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();
  const relations = pageRelations[currentPath];

  if (!relations || relations.length === 0) return null;

  const primary = relations.filter(r => r.relevance === 'primary');
  const secondary = relations.filter(r => r.relevance === 'secondary');
  const reference = relations.filter(r => r.relevance === 'reference');

  return (
    <div className="mt-6 p-4 bg-gw-card/60 rounded-xl border border-gw-border/40">
      <p className="text-xs text-gw-muted mb-3 flex items-center gap-1.5">
        <ExternalLink size={12} />
        相关页面
      </p>
      <div className="space-y-3">
        {primary.length > 0 && (
          <div className="space-y-1.5">
            {primary.map(rel => (
              <CrossLinkItem key={rel.path} relation={rel} onClick={() => navigate(rel.path)} />
            ))}
          </div>
        )}
        {secondary.length > 0 && (
          <div className="space-y-1.5">
            {secondary.map(rel => (
              <CrossLinkItem key={rel.path} relation={rel} onClick={() => navigate(rel.path)} />
            ))}
          </div>
        )}
        {reference.length > 0 && (
          <div className="space-y-1.5">
            {reference.map(rel => (
              <CrossLinkItem key={rel.path} relation={rel} onClick={() => navigate(rel.path)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 单个关联链接 ──
function CrossLinkItem({ relation, onClick }: { relation: PageRelation; onClick: () => void }) {
  const accentMap = {
    primary: 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50',
    secondary: 'border-gw-border/40 hover:bg-cyan-500/10 hover:border-cyan-500/40',
    reference: 'border-gw-border/30 hover:bg-gw-surface/60 hover:border-gw-border/60',
  };
  const tagMap = {
    primary: { text: '主要', className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
    secondary: { text: '相关', className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
    reference: { text: '参考', className: 'bg-gw-surface text-gw-muted/60 border-gw-border/40' },
  };
  const tag = tagMap[relation.relevance];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg border transition-all group ${accentMap[relation.relevance]}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gw-text font-medium group-hover:text-gw-cyan transition-colors">
            {relation.label}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${tag.className}`}>
            {tag.text}
          </span>
        </div>
        <p className="text-[10px] text-gw-muted/60 mt-0.5 truncate">{relation.description}</p>
      </div>
      <ArrowRight size={12} className="text-gw-muted/30 group-hover:text-gw-cyan/60 transition-colors flex-shrink-0" />
    </button>
  );
}

// ── 内联引用标签（用于页面正文中的交叉引用） ──
export function InlineRef({ path, label }: { path: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigate(path); }}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-gw-cyan/70 hover:text-gw-cyan bg-gw-cyan/5 hover:bg-gw-cyan/10 border border-gw-cyan/15 hover:border-gw-cyan/30 transition-all"
    >
      {label}
      <ArrowRight size={9} />
    </button>
  );
}

// ── 返回总览快捷按钮 ──
export function BackToOverview() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/')}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gw-muted hover:text-gw-text bg-gw-surface/50 hover:bg-gw-surface border border-gw-border/30 hover:border-gw-border/50 transition-all"
    >
      ← 返回总览
    </button>
  );
}
