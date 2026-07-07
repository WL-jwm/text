import React from 'react';
import { useLocation } from 'react-router-dom';
import { Database, Calendar, Building2 } from 'lucide-react';

/**
 * PrintPageHeader - 仅在打印时显示的页面标题头
 * 自动根据当前路由显示页面名称，增强打印文档专业性
 */
export function PrintPageHeader() {
  const location = useLocation();
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  const pageTitles: Record<string, string> = {
    '/': '河北省地下水基础资料数据库 — 总览',
    '/system-zoning': '地下水系统区划',
    '/geology': '基础地质',
    '/map': '空间地图',
    '/hydro-zone-params': '水文地质参数',
    '/water-source': '水源地蓄水构造',
    '/karst-water': '岩溶水',
    '/fracture-water': '裂隙水',
    '/resources': '水资源量',
    '/water-quality': '水质评价',
    '/environment': '环境地质',
    '/exploitation': '开采管理',
    '/hydrochemistry': '水化学与咸水',
    '/geothermal': '地热资源',
    '/mineral-water': '矿泉水',
    '/saline-soil': '盐碱土',
    '/mine-hydrogeology': '矿床水文地质',
    '/data-insight': '数据洞察',
    '/changelog': '变更日志与数据资产',
  };

  const title = pageTitles[location.pathname] || '河北地下水数据库';

  return (
    <div className="print-only-header">
      <div className="flex items-center gap-3 mb-2">
        <Database size={18} className="print-icon" />
        <h1 className="text-lg font-bold print-title">{title}</h1>
      </div>
      <div className="flex items-center gap-4 text-[10px] print-meta">
        <span className="flex items-center gap-1">
          <Building2 size={10} />
          河北瑞三元环境科技有限公司
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={10} />
          {dateStr}
        </span>
        <span>数据来源：1999年《河北省地下水》+ 2024年河北省水资源公报 + 2024年生态环境公报</span>
      </div>
      <hr className="mt-2 border-gw-border/60" />
    </div>
  );
}
