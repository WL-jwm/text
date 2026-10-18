export { dbMeta } from './dbMeta';
// 数据库变更日志（条目拆分至 changelogEarly/changelogV3A/changelogV3B）
import { changelogEntries as earlyEntries } from './changelogEarly';
import { changelogEntries as v3aEntries } from './changelogV3A';
import { changelogEntries as v3bEntries } from './changelogV3B';

/** 变更日志条目（changes 或 scope+items 两种结构） */
export interface ChangelogItem {
  sheet?: string;
  update?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes?: string[];
  scope?: string;
  items?: (string | ChangelogItem)[];
}

export const changelog: ChangelogEntry[] = [...earlyEntries, ...v3aEntries, ...v3bEntries];

export const dataSources = [
  { id: 'S01', name: '1999年《河北省地下水》', type: '基础文献', coverage: '全部22章' },
  { id: 'S02', name: '2024河北省水资源公报', type: '年度公报', coverage: '水资源量/供用水/地下水动态/取水许可', publishDate: '2025.5' },
  { id: 'S03', name: '2024河北省生态环境状况公报', type: '年度公报', coverage: '国考水质/饮用水源', publishDate: '2025.5' },
  { id: 'S04', name: '河北省生态环境厅新闻发布会(2025.7)', type: '新闻发布', coverage: '地下水污染防治', },
  { id: 'S05', name: '河北省农业农村厅(2025.11)', type: '政府发布', coverage: '第三次土壤普查盐碱地', },
  { id: 'S06', name: '河北省地质环境监测院', type: '监测报告', coverage: '地面沉降监测(2024年度，六连优)', },
  { id: 'S07', name: '水利部+自然资源部联合发布', type: '联合公告', coverage: '衡水深层严重超采区清零(2025)', },
  { id: 'S08', name: '河北新闻网', type: '媒体报道', coverage: '盐碱地治理成效/水资源基础调查', },
  { id: 'S09', name: '人民网', type: '媒体报道', coverage: '水资源基础调查(2024-2026)', },
  { id: 'S10', name: '百度百科', type: '参考概数', coverage: '咸水分布面积(概数)', note: '精确数据待水资源基础调查' },
];

// 数据库概况

