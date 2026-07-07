// I-矿泉水 (调查年限型)
// 数据来源: 1999（基础文献）+ 2024年数据 | 第十一章
// 版本: v2.0 | 更新频率: 5-10年更新

/** 矿泉水产地一览 */
export const mineralWaterSites = [
  { id: 1, name: '平山温塘矿泉水', location: '平山县温塘镇', type: '偏硅酸型', temperature: '68°C', dailyYield: '1500', approvalNo: '冀矿水[2023]001', status: '生产中', mineralization: '0.8', siO2: '45.2', strontium: '0.35', ph: '7.2' },
  { id: 2, name: '赤城汤泉矿泉水', location: '赤城县汤泉', type: '偏硅酸锶型', temperature: '58°C', dailyYield: '2000', approvalNo: '冀矿水[2022]012', status: '生产中', mineralization: '0.9', siO2: '38.6', strontium: '0.52', ph: '7.4' },
  { id: 3, name: '隆化七家矿泉水', location: '隆化县七家镇', type: '锶型', temperature: '42°C', dailyYield: '800', approvalNo: '冀矿水[2023]008', status: '生产中', mineralization: '0.7', siO2: '28.3', strontium: '0.68', ph: '7.1' },
  { id: 4, name: '遵化清东陵矿泉水', location: '遵化市清东陵', type: '偏硅酸型', temperature: '52°C', dailyYield: '1200', approvalNo: '冀矿水[2021]015', status: '生产中', mineralization: '0.85', siO2: '41.5', strontium: '0.28', ph: '7.3' },
  { id: 5, name: '赞皇嶂石岩矿泉水', location: '赞皇县嶂石岩', type: '偏硅酸型', temperature: '28°C', dailyYield: '500', approvalNo: '冀矿水[2022]018', status: '勘查中', mineralization: '0.6', siO2: '35.8', strontium: '0.22', ph: '6.9' },
  { id: 6, name: '迁西景忠山矿泉水', location: '迁西县景忠山', type: '偏硅酸锶型', temperature: '35°C', dailyYield: '600', approvalNo: '冀矿水[2023]005', status: '生产中', mineralization: '0.75', siO2: '36.2', strontium: '0.45', ph: '7.0' },
  { id: 7, name: '阜平天生桥矿泉水', location: '阜平县天生桥', type: '偏硅酸型', temperature: '32°C', dailyYield: '450', approvalNo: '冀矿水[2022]022', status: '勘查中', mineralization: '0.65', siO2: '42.1', strontium: '0.18', ph: '7.1' },
  { id: 8, name: '涞水野三坡矿泉水', location: '涞水县野三坡', type: '锶型', temperature: '25°C', dailyYield: '380', approvalNo: '冀矿水[2021]009', status: '生产中', mineralization: '0.7', siO2: '22.5', strontium: '0.72', ph: '7.5' },
  { id: 9, name: '兴隆雾灵山矿泉水', location: '兴隆县雾灵山', type: '偏硅酸型', temperature: '22°C', dailyYield: '320', approvalNo: '冀矿水[2023]011', status: '勘查中', mineralization: '0.55', siO2: '38.9', strontium: '0.15', ph: '6.8' },
  { id: 10, name: '蔚县小五台矿泉水', location: '蔚县小五台山', type: '偏硅酸锶型', temperature: '30°C', dailyYield: '550', approvalNo: '冀矿水[2022]006', status: '生产中', mineralization: '0.72', siO2: '40.3', strontium: '0.38', ph: '7.2' },
  { id: 11, name: '武安京娘湖矿泉水', location: '武安市京娘湖', type: '偏硅酸型', temperature: '26°C', dailyYield: '280', approvalNo: '冀矿水[2023]015', status: '勘查中', mineralization: '0.58', siO2: '33.6', strontium: '0.20', ph: '7.0' },
  { id: 12, name: '涉县娲皇宫矿泉水', location: '涉县娲皇宫', type: '锶型', temperature: '38°C', dailyYield: '420', approvalNo: '冀矿水[2021]018', status: '生产中', mineralization: '0.82', siO2: '26.8', strontium: '0.65', ph: '7.3' },
  { id: 13, name: '围场塞罕坝矿泉水', location: '围场县塞罕坝', type: '偏硅酸型', temperature: '18°C', dailyYield: '350', approvalNo: '冀矿水[2022]025', status: '勘查中', mineralization: '0.48', siO2: '36.5', strontium: '0.12', ph: '6.7' },
  { id: 14, name: '涿鹿桑干河矿泉水', location: '涿鹿县桑干河', type: '偏硅酸锶型', temperature: '44°C', dailyYield: '680', approvalNo: '冀矿水[2023]019', status: '生产中', mineralization: '0.78', siO2: '39.2', strontium: '0.42', ph: '7.2' },
];

/** 矿泉水类型分布 */
export const mineralWaterTypes = [
  { type: '偏硅酸型', count: 8, proportion: '57%', threshold: 'SiO2 ≥ 25mg/L', features: '低矿化度，口感清冽，河北最主要类型' },
  { type: '偏硅酸锶复合型', count: 4, proportion: '29%', threshold: 'SiO2 ≥ 25mg/L + Sr ≥ 0.2mg/L', features: '双达标，品质优良' },
  { type: '锶型', count: 2, proportion: '14%', threshold: 'Sr ≥ 0.2mg/L', features: '含锶量较高，有益骨骼健康' },
];

/** 矿泉水水质评价标准 */
export const mineralWaterStandards = {
  nationalStandard: 'GB 8537-2018 饮用天然矿泉水',
  limits: [
    { indicator: '偏硅酸(SiO2)', threshold: '≥ 25.0 mg/L', unit: 'mg/L', note: '界限指标' },
    { indicator: '锶(Sr)', threshold: '≥ 0.20 mg/L', unit: 'mg/L', note: '界限指标' },
    { indicator: '矿化度', threshold: '≥ 250 mg/L', unit: 'mg/L', note: '非强制' },
    { indicator: '锂(Li)', threshold: '≥ 0.20 mg/L', unit: 'mg/L', note: '界限指标' },
    { indicator: '硒(Se)', threshold: '≥ 0.01 mg/L', unit: 'mg/L', note: '界限指标' },
    { indicator: '游离CO2', threshold: '≥ 250 mg/L', unit: 'mg/L', note: '界限指标' },
    { indicator: '水温(泉口)', threshold: '≥ 25°C', unit: '°C', note: '温度参考' },
  ],
  sensoryLimits: [
    { indicator: '色度', limit: '≤ 15度', note: '不得呈现其他异色' },
    { indicator: '浑浊度', limit: '≤ 5 NTU', note: '' },
    { indicator: '臭和味', limit: '无异味', note: '允许有轻微矿物味' },
    { indicator: '肉眼可见物', limit: '无', note: '允许有微量矿物盐沉淀' },
  ],
  contaminantLimits: [
    { indicator: '砷(As)', limit: '≤ 0.01 mg/L' },
    { indicator: '镉(Cd)', limit: '≤ 0.003 mg/L' },
    { indicator: '铬(Cr6+)', limit: '≤ 0.05 mg/L' },
    { indicator: '铅(Pb)', limit: '≤ 0.01 mg/L' },
    { indicator: '汞(Hg)', limit: '≤ 0.001 mg/L' },
    { indicator: '氟化物(F-)', limit: '≤ 1.5 mg/L' },
    { indicator: '硝酸盐(NO3-)', limit: '≤ 45 mg/L' },
    { indicator: '大肠菌群', limit: '0 MPN/100mL' },
  ],
};

/** 矿泉水产业发展概况 */
export const mineralWaterIndustry = {
  totalPermits: 14,
  producing: 9,
  exploring: 5,
  annualOutput: '~85万m³',
  annualRevenue: '~6.2亿元',
  mainBrands: '平山温塘/赤城汤泉/隆化七家/遵化清东陵/蔚县小五台',
  marketShare: '占全国天然矿泉水产量约3.2%',
  growthRate: '年均增长8.5%',
  mainConsumption: '京津冀都市圈，桶装水为主(70%)，瓶装水(25%)，其他(5%)',
};
