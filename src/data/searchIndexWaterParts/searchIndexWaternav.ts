/**
 * 拆分自 searchIndexWater.ts — nav 组搜索索引
 */

import type { SearchResult } from '../searchIndexWater';

export const searchIndexWaterNav: SearchResult[] = [
  {
    id: `nav-resources`,
    title: `水资源量页面`,
    category: `导航`,
    path: `/resources`,
    keywords: `水资源 供水量 用水量 资源量 水资源公报 各市排名 开采量统计`,
    snippet: `2024年水资源公报数据 · 各市供水/用水结构 · 地下水动态`,
  },
  {
    id: `nav-water-quality`,
    title: `水质评价页面`,
    category: `导航`,
    path: `/water-quality`,
    keywords: `水质 水质评价 地下水水质 国考断面 污染 水质分类 III类水`,
    snippet: `国考水质断面 · 地下水质量分类(GB/T 14848-2017) · 污染评价`,
  },
  {
    id: `ws-important`,
    title: `重要水源地`,
    category: `水源地`,
    path: `/water-source`,
    keywords: `水源地 重要水源地 供水城市 开采量 允许开采量`,
    snippet: `8个重要水源地 石家庄 保定 唐山 邯郸 日供水能力汇总`,
  },
  {
    id: `ws-mountain-front`,
    title: `山前富水带`,
    category: `水源地`,
    path: `/water-source`,
    keywords: `山前富水带 冲洪积扇 富水性 涌水量 渗透系数`,
    snippet: `5个山前富水带参数 K=50~120m/d 单井涌水量3000~5000m³/d`,
  },
  {
    id: `nav-water-source`,
    title: `水源地蓄水构造页面`,
    category: `导航`,
    path: `/water-source`,
    keywords: `水源地 蓄水构造 岩溶盆地 山间盆地 冲洪积扇 古河道 供水`,
    snippet: `4种蓄水构造类型 · 8个重要水源地 · 山前富水带参数`,
  },
  {
    id: `hc-mineral`,
    title: `天然矿泉水产地(14处)`,
    category: `矿泉水`,
    path: `/hydrochemistry`,
    keywords: `矿泉水 偏硅酸 锶 平山 温塘 赤城 温泉 水源地`,
    snippet: `14处水源地 偏硅酸型8处 锶型3处 复合型3处`,
  },
  {
    id: `hc-geothermal`,
    title: `地热资源与地热田`,
    category: `地热`,
    path: `/hydrochemistry`,
    keywords: `地热 地热田 牛驼镇 雄县 地温梯度 恒温层 热流量`,
    snippet: `5处主要地热田 雄县/牛驼镇/高阳 增温级33m/1°C`,
  },
  {
    id: `nav-hydrochemistry`,
    title: `水化学/咸水页面`,
    category: `导航`,
    path: `/hydrochemistry`,
    keywords: `水化学 咸水 水化学类型 Piper图 苏卡列夫 矿化度 水质分析`,
    snippet: `水化学水平分带 · 苏卡列夫分类 · 咸水分布 · 同位素示踪`,
  },
  {
    id: `nav-saline-water`,
    title: `咸水页面`,
    category: `导航`,
    path: `/hydrochemistry`,
    keywords: `咸水 微咸水 半咸水 咸淡水界面 矿化度 咸水利用`,
    snippet: `咸水分布与矿化度分级 · 咸淡水界面变化 · 高氟水问题`,
  },
  {
    id: `nav-hydro-params`,
    title: `水文地质参数页面`,
    category: `导航`,
    path: `/hydro-zone-params`,
    keywords: `水文地质参数 含水层 渗透系数 给水度 弥散度 贮水系数 水力梯度`,
    snippet: `含水层组参数 · 渗透系数/给水度/弥散度 · 各区参数对比`,
  },
];
