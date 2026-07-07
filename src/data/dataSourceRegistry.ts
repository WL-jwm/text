/**
 * 数据源注册表 (C3 数据溯源标准化)
 * 集中管理所有数据模块的来源标注，便于审计、版本追踪和质量控制
 * 每个数据模块必须在此注册才能被DataSourceNote组件正确引用
 */

export interface DataSourceEntry {
  /** 数据模块文件名（不含.ts） */
  module: string;
  /** 数据主题类别 */
  category: 'A-基础地质' | 'B-系统区划' | 'C-水源地' | 'D-超采治理'
    | 'E-数据来源' | 'F-水资源' | 'G-水化学' | 'H-地热' | 'I-矿泉水'
    | 'J-咸水' | 'K-盐碱土' | 'L-突水' | 'M-环境地质' | 'N-监测'
    | 'O-参数' | 'P-历史' | 'Q-岩溶' | 'R-裂隙' | 'S-矿山' | 'T-分区';
  /** 数据来源说明 */
  source: string;
  /** 数据年份/版本（多个用逗号分隔） */
  dataYears: string;
  /** 更新频率 */
  updateFrequency: '年度' | '5-10年' | '调查年限型' | '固定型' | '实时';
  /** 数据可靠度 */
  reliability: '高' | '中' | '低';
  /** 主要文献或报告 */
  primaryDoc?: string;
  /** 备注 */
  note?: string;
}

export const dataSourceRegistry: DataSourceEntry[] = [
  {
    module: 'resources',
    category: 'F-水资源',
    source: '河北省水资源公报(2024)、各地市水资源公报(2022-2024)',
    dataYears: '2022-2024',
    updateFrequency: '年度',
    reliability: '高',
    primaryDoc: '河北省水利厅《河北省水资源公报2024》',
  },
  {
    module: 'environment',
    category: 'M-环境地质',
    source: '2024年河北省地面沉降监测报告、漏斗监测年报',
    dataYears: '2020-2024',
    updateFrequency: '年度',
    reliability: '高',
    primaryDoc: '河北省地质环境监测院监测报告',
  },
  {
    module: 'waterQuality',
    category: 'N-监测',
    source: '河北省水资源公报2024、GB/T 14848-2017地下水质量标准',
    dataYears: '2024',
    updateFrequency: '年度',
    reliability: '高',
    primaryDoc: 'GB/T 14848-2017 + 河北省生态环境状况公报2024',
  },
  {
    module: 'geology',
    category: 'A-基础地质',
    source: '《河北省 北京市 天津市区域地质志》(1982) + 1:20万水文地质普查',
    dataYears: '1982',
    updateFrequency: '固定型',
    reliability: '高',
    primaryDoc: '《河北省北京市天津市区域地质志》',
  },
  {
    module: 'systemZoning',
    category: 'T-分区',
    source: '1999年《河北省地下水》第五章',
    dataYears: '1999',
    updateFrequency: '固定型',
    reliability: '高',
  },
  {
    module: 'exploitation',
    category: 'D-超采治理',
    source: '河北省水资源公报2024、河北省超采区评价报告(2022)',
    dataYears: '2022, 2024',
    updateFrequency: '年度',
    reliability: '高',
  },
  {
    module: 'hydrochemistry',
    category: 'G-水化学',
    source: '1999基础文献 + 2024河北省水资源公报 + 第三次土壤普查',
    dataYears: '1999, 2024',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'groundwaterFunction',
    category: 'D-超采治理',
    source: '河北省人民政府《关于公布地下水超采区和禁止开采区、限制开采区范围的通知》(2022)',
    dataYears: '2022',
    updateFrequency: '5-10年',
    reliability: '高',
  },
  {
    module: 'groundwaterResources',
    category: 'F-水资源',
    source: '《中国地下水资源 河北卷》(2005) 第三、四、六章',
    dataYears: '1991-2000',
    updateFrequency: '调查年限型',
    reliability: '高',
  },
  {
    module: 'hydroParams',
    category: 'O-参数',
    source: '1999年《河北省地下水》第三章 + 区域地质志(1:20万水文地质普查)',
    dataYears: '1982, 1999',
    updateFrequency: '调查年限型',
    reliability: '中',
  },
  {
    module: 'zoneParams',
    category: 'B-系统区划',
    source: '1999年《河北省地下水》第五章',
    dataYears: '1999',
    updateFrequency: '调查年限型',
    reliability: '中',
  },
  {
    module: 'backgroundValues',
    category: 'N-监测',
    source: '河北省地质环境监测院监测数据综合 + 生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023)',
    dataYears: '2023',
    updateFrequency: '年度',
    reliability: '高',
  },
  {
    module: 'waterSource',
    category: 'C-水源地',
    source: '1999年《河北省地下水》第七章 完整提取',
    dataYears: '1999',
    updateFrequency: '5-10年',
    reliability: '中',
    note: '新水源地勘查时更新',
  },
  {
    module: 'karstWater',
    category: 'Q-岩溶',
    source: '1999年《河北省地下水》第八章 岩溶与岩溶水分布特征及开采利用',
    dataYears: '1999',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'fractureWater',
    category: 'R-裂隙',
    source: '1999年河北省地下水资源评价 第九章裂隙水',
    dataYears: '1999',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'geothermal',
    category: 'H-地热',
    source: '1999（基础文献）+ 2024年数据 第十章',
    dataYears: '1999, 2024',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'mineralWater',
    category: 'I-矿泉水',
    source: '1999（基础文献）+ 2024年数据 第十一章',
    dataYears: '1999, 2024',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'salineWater',
    category: 'J-咸水',
    source: '1999（基础文献）+ 2024河北省水资源公报 第十二章',
    dataYears: '1999, 2024',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'salineSoil',
    category: 'K-盐碱土',
    source: '1999（基础文献）+ 第三次全国土壤普查（2024年） 第十三章',
    dataYears: '1999, 2024',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'mineHydrogeology',
    category: 'S-矿山',
    source: '1999年河北省地下水资源评价 第十四章矿床水文地质',
    dataYears: '1999',
    updateFrequency: '调查年限型',
    reliability: '中',
  },
  {
    module: 'hydrogeologyHistorical',
    category: 'P-历史',
    source: '《河北省水文地质工程地质》(1980年代, OCR识别)',
    dataYears: '1980前',
    updateFrequency: '固定型',
    reliability: '中',
  },
  {
    module: 'hydrogeologyReference',
    category: 'P-历史',
    source: '《河北省水文地质工程地质》(682页，1980年代前数据)',
    dataYears: '1980前',
    updateFrequency: '固定型',
    reliability: '中',
  },
  {
    module: 'mapData',
    category: 'B-系统区划',
    source: '河北省地下水系统区划(1999) + 水源地公报(2024) + 专业地理坐标',
    dataYears: '1999, 2024',
    updateFrequency: '5-10年',
    reliability: '中',
  },
  {
    module: 'changelog',
    category: 'E-数据来源',
    source: '1999年《河北省地下水》+ 2024年河北省官方数据',
    dataYears: '1999, 2024',
    updateFrequency: '年度',
    reliability: '高',
  },
  {
    module: 'searchIndex',
    category: 'E-数据来源',
    source: '自动聚合自 25 个数据模块 (200+ 条索引)',
    dataYears: '2026',
    updateFrequency: '年度',
    reliability: '高',
    note: '派生索引，不直接引用外部源',
  },
];

/** 按模块名查找数据源 */
export function getSourceByModule(module: string): DataSourceEntry | undefined {
  return dataSourceRegistry.find(s => s.module === module);
}

/** 按类别筛选数据源 */
export function getSourcesByCategory(category: DataSourceEntry['category']): DataSourceEntry[] {
  return dataSourceRegistry.filter(s => s.category === category);
}

/** 数据源统计 (函数形式避免模块级求值TDZ) */
export function getSourceStats() {
  return {
    total: dataSourceRegistry.length,
    byUpdateFrequency: {
      年度: dataSourceRegistry.filter(s => s.updateFrequency === '年度').length,
      '5-10年': dataSourceRegistry.filter(s => s.updateFrequency === '5-10年').length,
      调查年限型: dataSourceRegistry.filter(s => s.updateFrequency === '调查年限型').length,
      固定型: dataSourceRegistry.filter(s => s.updateFrequency === '固定型').length,
    },
    byReliability: {
      高: dataSourceRegistry.filter(s => s.reliability === '高').length,
      中: dataSourceRegistry.filter(s => s.reliability === '中').length,
      低: dataSourceRegistry.filter(s => s.reliability === '低').length,
    },
  };
}
