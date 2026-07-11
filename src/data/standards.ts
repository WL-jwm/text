/**
 * 评价标准注册表 (C7 标准规范参数化)
 * 集中管理平台引用的国标/行标/地方标准，支持标准版本切换
 * 当标准更新时（如GB/T 14848-2017 → 2024版），仅需在此新增版本即可
 */

export interface StandardVersion {
  id: string;
  name: string;
  fullName: string;
  publishDate: string;
  effectiveDate: string;
  issuingAuthority: string;
  status: '现行' | '修订中' | '废止';
  description: string;
  /** 标准版本数据 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  /** 变更说明 */
  changelog?: string;
}

export interface StandardRegistry {
  /** 标准类别 */
  category: '地下水质量' | '地表水质量' | '饮用水卫生' | '土壤质量' | '污水排放' | '地质矿产';
  /** 标准编号前缀 */
  code: string;
  /** 各版本 */
  versions: StandardVersion[];
  /** 当前默认版本ID */
  currentVersion: string;
}

/** 地下水质量标准 */
export const groundwaterQualityStandards: StandardRegistry = {
  category: '地下水质量',
  code: 'GB/T 14848',
  currentVersion: 'v2017',
  versions: [
    {
      id: 'v2017',
      name: 'GB/T 14848-2017',
      fullName: '地下水质量标准',
      publishDate: '2017-10-14',
      effectiveDate: '2018-05-01',
      issuingAuthority: '国家市场监督管理总局、国家标准化管理委员会',
      status: '现行',
      description: '替代GB/T 14848-1993，地下水质量分类与评价',
      changelog: '相较1993版调整了部分指标限值，新增了若干有机污染物指标',
      data: {
        classes: [
          { class: 'I', name: '优良', color: '#22c55e', description: '地下水化学组分含量最低，适用于各种用途' },
          { class: 'II', name: '良好', color: '#84cc16', description: '地下水化学组分含量较低，适用于各种用途' },
          { class: 'III', name: '较好', color: '#eab308', description: '以人体健康基准值为依据，主要适用于集中式生活饮用水水源及工农业用水' },
          { class: 'IV', name: '较差', color: '#f97316', description: '以农业和工业用水质量要求以及一定水平的人体健康风险为依据' },
          { class: 'V', name: '极差', color: '#ef4444', description: '不宜作为生活饮用水水源，其他用水可根据使用目的选用' },
        ],
      },
    },
  ],
};

/** 地表水质量标准 */
export const surfaceWaterQualityStandards: StandardRegistry = {
  category: '地表水质量',
  code: 'GB 3838',
  currentVersion: 'v2002',
  versions: [
    {
      id: 'v2002',
      name: 'GB 3838-2002',
      fullName: '地表水环境质量标准',
      publishDate: '2002-04-28',
      effectiveDate: '2002-06-01',
      issuingAuthority: '国家环境保护总局、国家质量监督检验检疫总局',
      status: '现行',
      description: '地表水环境质量分类与评价',
      data: {
        classes: [
          { class: 'I', name: '源头水', color: '#22c55e' },
          { class: 'II', name: '集中式饮用水水源一级保护区', color: '#84cc16' },
          { class: 'III', name: '集中式饮用水水源二级保护区', color: '#eab308' },
          { class: 'IV', name: '一般工业用水区', color: '#f97316' },
          { class: 'V', name: '农业用水区', color: '#ef4444' },
          { class: '劣V', name: '劣五类', color: '#991b1b' },
        ],
      },
    },
  ],
};

/** 饮用水卫生标准 */
export const drinkingWaterStandards: StandardRegistry = {
  category: '饮用水卫生',
  code: 'GB 5749',
  currentVersion: 'v2022',
  versions: [
    {
      id: 'v2022',
      name: 'GB 5749-2022',
      fullName: '生活饮用水卫生标准',
      publishDate: '2022-03-15',
      effectiveDate: '2023-04-01',
      issuingAuthority: '国家市场监督管理总局、国家标准化管理委员会',
      status: '现行',
      description: '生活饮用水卫生要求',
      changelog: '替代GB 5749-2006，水质指标由106项调整为97项',
      data: {
        category: '饮用水',
      },
    },
  ],
};

/** 土壤环境质量标准 */
export const soilQualityStandards: StandardRegistry = {
  category: '土壤质量',
  code: 'GB 15618',
  currentVersion: 'v2018',
  versions: [
    {
      id: 'v2018',
      name: 'GB 15618-2018',
      fullName: '土壤环境质量 农用地土壤污染风险管控标准（试行）',
      publishDate: '2018-06-22',
      effectiveDate: '2018-08-01',
      issuingAuthority: '生态环境部、国家市场监督管理总局',
      status: '现行',
      description: '农用地土壤污染风险管控',
      data: {
        category: '农用地',
      },
    },
  ],
};

/** 污水综合排放标准 */
export const wastewaterStandards: StandardRegistry = {
  category: '污水排放',
  code: 'GB 8978',
  currentVersion: 'v1996',
  versions: [
    {
      id: 'v1996',
      name: 'GB 8978-1996',
      fullName: '污水综合排放标准',
      publishDate: '1996-10-04',
      effectiveDate: '1998-01-01',
      issuingAuthority: '国家环境保护局',
      status: '现行',
      description: '污水综合排放分级',
      data: {
        category: '污水',
      },
    },
  ],
};

/** 地下水超采区划定标准 */
export const overExploitationStandards: StandardRegistry = {
  category: '地质矿产',
  code: 'GB/T 34910',
  currentVersion: 'v2017',
  versions: [
    {
      id: 'v2017',
      name: '河北省人民政府公告(2022)',
      fullName: '河北省地下水超采区和禁止开采区、限制开采区范围',
      publishDate: '2022-08-15',
      effectiveDate: '2022-09-01',
      issuingAuthority: '河北省人民政府',
      status: '现行',
      description: '河北省地下水超采治理依据文件',
      data: {
        province: '河北',
        // 河北省21个超采区
        overExploitZones: 21,
        // 1个严重超采区(衡水深层)
        severeZones: 1,
      },
    },
  ],
};

/** 获取标准当前版本数据 */
export function getCurrentStandard(category: StandardRegistry['category']): StandardVersion | null {
  const registries = [
    groundwaterQualityStandards,
    surfaceWaterQualityStandards,
    drinkingWaterStandards,
    soilQualityStandards,
    wastewaterStandards,
    overExploitationStandards,
  ];
  const reg = registries.find(r => r.category === category);
  if (!reg) return null;
  return reg.versions.find(v => v.id === reg.currentVersion) || null;
}

/** 获取标准指定版本 */
export function getStandardVersion(
  category: StandardRegistry['category'],
  versionId: string
): StandardVersion | null {
  const registries = [
    groundwaterQualityStandards,
    surfaceWaterQualityStandards,
    drinkingWaterStandards,
    soilQualityStandards,
    wastewaterStandards,
    overExploitationStandards,
  ];
  const reg = registries.find(r => r.category === category);
  if (!reg) return null;
  return reg.versions.find(v => v.id === versionId) || null;
}

/** 标准注册表统计 (函数形式避免模块级求值TDZ) */
export function getStandardsStats() {
  return {
    total: 6,
    versions: [
      groundwaterQualityStandards,
      surfaceWaterQualityStandards,
      drinkingWaterStandards,
      soilQualityStandards,
      wastewaterStandards,
      overExploitationStandards,
    ].reduce((sum, r) => sum + r.versions.length, 0),
    current: 6,
  };
}
