/**
 * 自定义数据接入 Store (D-04) — 标准数据模板定义
 *
 * 拆分自 customDataStore.ts：五类标准模板（水质/水化学/均衡/监测井/通用）
 */

import type { DataTemplate } from './customDataTypes';

const WATER_QUALITY_TEMPLATE: DataTemplate = {
  type: 'waterQuality',
  name: '水质监测数据',
  description: '监测点水质因子浓度数据，用于水质评价、合规检查、风险评估',
  icon: 'beaker',
  fields: [
    { name: 'siteName', label: '监测点名称', required: true, type: 'string', matchKeywords: ['名称', '点位', '监测点', 'site', 'name', 'well'] },
    { name: 'pH', label: 'pH值', required: true, type: 'number', matchKeywords: ['pH', '酸碱'], range: { min: 0, max: 14 } },
    { name: 'totalHardness', label: '总硬度', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['硬度', 'hardness', 'TH'] },
    { name: 'TDS', label: '溶解性总固体', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['TDS', '矿化度', '溶解性', 'total', 'dissolved'] },
    { name: 'sulfate', label: '硫酸盐', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['硫酸', 'sulfate', 'SO4'] },
    { name: 'chloride', label: '氯化物', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['氯化', 'chloride', 'Cl'] },
    { name: 'iron', label: '铁', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['铁', 'iron', 'Fe'] },
    { name: 'manganese', label: '锰', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['锰', 'manganese', 'Mn'] },
    { name: 'fluoride', label: '氟化物', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['氟', 'fluoride', 'F'] },
    { name: 'nitrate', label: '硝酸盐', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['硝酸', 'nitrate', 'NO3'] },
    { name: 'ammonia', label: '氨氮', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['氨氮', 'ammonia', 'NH4', 'NH3'] },
    { name: 'city', label: '所在市县', required: false, type: 'string', matchKeywords: ['市', '县', '区域', 'city', 'region'] },
  ],
};

/** 水化学离子数据模板 */
const HYDROCHEMISTRY_TEMPLATE: DataTemplate = {
  type: 'hydrochemistry',
  name: '水化学离子数据',
  description: '6大离子浓度数据，用于Piper三线图、苏卡列夫分类、水化学分析',
  icon: 'flask',
  fields: [
    { name: 'siteName', label: '监测点名称', required: true, type: 'string', matchKeywords: ['名称', '点位', 'site', 'name', 'well'] },
    { name: 'Ca', label: '钙离子 Ca²⁺', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['钙', 'Ca', 'calcium'] },
    { name: 'Mg', label: '镁离子 Mg²⁺', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['镁', 'Mg', 'magnesium'] },
    { name: 'NaK', label: '钠钾离子 Na⁺+K⁺', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['钠', '钾', 'Na', 'K', 'sodium', 'potassium'] },
    { name: 'HCO3', label: '重碳酸根 HCO₃⁻', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['碳酸', 'HCO3', 'bicarbonate'] },
    { name: 'SO4', label: '硫酸根 SO₄²⁻', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['硫酸', 'SO4', 'sulfate'] },
    { name: 'Cl', label: '氯离子 Cl⁻', unit: 'mg/L', required: true, type: 'number', matchKeywords: ['氯', 'Cl', 'chloride'] },
    { name: 'pH', label: 'pH值', required: false, type: 'number', matchKeywords: ['pH'], range: { min: 0, max: 14 } },
    { name: 'TDS', label: '溶解性总固体', unit: 'mg/L', required: false, type: 'number', matchKeywords: ['TDS', '矿化度', 'dissolved'] },
  ],
};

/** 均衡计算数据模板 */
const BALANCE_TEMPLATE: DataTemplate = {
  type: 'balance',
  name: '均衡计算数据',
  description: '补给排泄项数据，用于地下水均衡计算',
  icon: 'scale',
  fields: [
    { name: 'city', label: '区域名称', required: true, type: 'string', matchKeywords: ['市', '县', '区域', 'city', 'area', 'name'] },
    { name: 'area', label: '计算面积', unit: 'km²', required: true, type: 'number', matchKeywords: ['面积', 'area'] },
    { name: 'precipitationInfiltration', label: '降水入渗补给', unit: '亿m³/a', required: true, type: 'number', matchKeywords: ['降水', '入渗', 'precipitation'] },
    { name: 'lateralRecharge', label: '侧向径流补给', unit: '亿m³/a', required: true, type: 'number', matchKeywords: ['侧向', '径流', 'lateral', 'recharge'] },
    { name: 'riverLeakage', label: '河道渗漏补给', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['河道', '渗漏', 'river'], defaultValue: 0 },
    { name: 'canalLeakage', label: '渠系渗漏补给', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['渠系', 'canal'], defaultValue: 0 },
    { name: 'irrigationRecharge', label: '田间灌溉入渗', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['灌溉', 'irrigation'], defaultValue: 0 },
    { name: 'extraction', label: '人工开采', unit: '亿m³/a', required: true, type: 'number', matchKeywords: ['开采', 'extraction', 'pumping'] },
    { name: 'evaporation', label: '潜水蒸发', unit: '亿m³/a', required: false, type: 'number', matchKeywords: ['蒸发', 'evaporation'], defaultValue: 0 },
  ],
};

/** 监测井基本信息模板 */
const MONITORING_WELL_TEMPLATE: DataTemplate = {
  type: 'monitoringWell',
  name: '监测井基本信息',
  description: '监测井坐标、类型、频率等基本信息',
  icon: 'map-pin',
  fields: [
    { name: 'wellId', label: '监测井编号', required: true, type: 'string', matchKeywords: ['编号', 'ID', 'well', 'code'] },
    { name: 'wellName', label: '监测井名称', required: true, type: 'string', matchKeywords: ['名称', 'name', 'well'] },
    { name: 'x', label: 'X坐标', required: true, type: 'number', matchKeywords: ['X', '经度', 'longitude', 'lng'] },
    { name: 'y', label: 'Y坐标', required: true, type: 'number', matchKeywords: ['Y', '纬度', 'latitude', 'lat'] },
    { name: 'aquiferType', label: '含水层类型', required: false, type: 'string', matchKeywords: ['含水层', 'aquifer', '类型'], defaultValue: 'shallow' },
    { name: 'depth', label: '井深', unit: 'm', required: false, type: 'number', matchKeywords: ['深度', '井深', 'depth'] },
    { name: 'city', label: '所在市县', required: false, type: 'string', matchKeywords: ['市', '县', 'city', 'region'] },
  ],
};

/** 通用表格模板 */
const GENERIC_TEMPLATE: DataTemplate = {
  type: 'generic',
  name: '通用表格',
  description: '不绑定特定模块，自由导入任意表格数据',
  icon: 'table',
  fields: [],
};

export const DATA_TEMPLATES: DataTemplate[] = [
  WATER_QUALITY_TEMPLATE,
  HYDROCHEMISTRY_TEMPLATE,
  BALANCE_TEMPLATE,
  MONITORING_WELL_TEMPLATE,
  GENERIC_TEMPLATE,
];
