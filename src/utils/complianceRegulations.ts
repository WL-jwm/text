/**
 * 环保合规检查 — 法规库
 */

import type { Regulation } from './complianceTypes';

export const REGULATIONS: Regulation[] = [
  {
    id: 'water_law',
    name: '中华人民共和国水法',
    level: '法律',
    issuer: '全国人大常委会',
    date: '2002-10-01(2016修订)',
    status: '现行',
    keyPoints: ['取水许可制度', '水资源费征收', '超采区管制', '地下水保护规划'],
    applicableScenarios: ['取水许可申请', '水资源论证', '超采区管理'],
  },
  {
    id: 'water_pollution_law',
    name: '中华人民共和国水污染防治法',
    level: '法律',
    issuer: '全国人大常委会',
    date: '2018-01-01',
    status: '现行',
    keyPoints: ['地下水污染防治', '水源地保护区', '渗井渗坑禁止', '地下工程防渗'],
    applicableScenarios: ['地下水污染调查', '水源地保护', '工业场地防渗'],
  },
  {
    id: 'eia_law',
    name: '中华人民共和国环境影响评价法',
    level: '法律',
    issuer: '全国人大常委会',
    date: '2018-12-29修订',
    status: '现行',
    keyPoints: ['建设项目环评', '规划环评', '地下水专项评价', '后评价制度'],
    applicableScenarios: ['建设项目环评', '地下水环境影响评价'],
  },
  {
    id: 'gb14848',
    name: 'GB/T 14848-2017 地下水质量标准',
    level: '技术标准',
    issuer: '国家质检总局/国家标准委',
    date: '2018-05-01',
    status: '现行',
    keyPoints: ['五类水质标准', '39项常规指标', '54项非常规指标', '单因子评价法'],
    applicableScenarios: ['水质监测', '水源地评价', '污染评价'],
  },
  {
    id: 'hj253',
    name: 'HJ 25.1-2019 建设用地土壤污染状况调查技术导则',
    level: '技术标准',
    issuer: '生态环境部',
    date: '2019-12-31',
    status: '现行',
    keyPoints: ['地下水调查要求', '采样布点', '风险评估'],
    applicableScenarios: ['污染场地调查', '地下水风险评估'],
  },
  {
    id: 'hj610',
    name: 'HJ 610-2016 环境影响评价技术导则 地下水环境',
    level: '技术标准',
    issuer: '生态环境部',
    date: '2016-07-01',
    status: '现行',
    keyPoints: ['评价分级', '调查范围', '预测方法', '防渗措施'],
    applicableScenarios: ['地下水环评', '防渗设计'],
  },
  {
    id: 'source_protection',
    name: '饮用水水源保护区划分技术规范',
    level: '技术标准',
    issuer: '生态环境部',
    date: '2018-03-01',
    status: '现行',
    keyPoints: ['一级保护区', '二级保护区', '准保护区', '经验公式法/数值模拟法'],
    applicableScenarios: ['水源地划分', '保护区管理'],
  },
  {
    id: 'overdraft_control',
    name: '地下水管理条例',
    level: '行政法规',
    issuer: '国务院',
    date: '2021-12-01',
    status: '现行',
    keyPoints: ['超采治理', '取水总量控制', '水位控制', '禁采限采区划定'],
    applicableScenarios: ['超采区治理', '取水管理', '水位管控'],
  },
  {
    id: 'hebei_water',
    name: '河北省地下水管理条例',
    level: '地方性法规',
    issuer: '河北省人大常委会',
    date: '2014-09-01(2021修订)',
    status: '现行',
    keyPoints: ['超采区划分', '取水许可', '水位预警', '回补工程'],
    applicableScenarios: ['河北省地下水管理', '超采综合治理'],
  },
  {
    id: 'hebei_source',
    name: '河北省饮用水水源地保护条例',
    level: '地方性法规',
    issuer: '河北省人大常委会',
    date: '2016-01-01',
    status: '现行',
    keyPoints: ['保护区划定', '污染源整治', '应急水源', '监测预警'],
    applicableScenarios: ['河北省水源地保护', '保护区管理'],
  },
];

// ============================================================
// 检查函数
// ============================================================

