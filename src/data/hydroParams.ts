// A表 - 岩性与水文地质参数基础对照表
// 数据来源: 1999年《河北省地下水》第三章 + 2024年河北省区域地质志(1:20万水文地质普查)
// 整理日期: 2026-05-21
// 说明: 渗透系数K、导水系数T、给水度μ等参数按含水层组和岩性统计典型值范围



// 含水层组划分
export const aquiferGroups = [
  { group: '第一含水层组', era: 'Q3-4', property: '潜水-微承压', depth: '0~60', lithology: '砂、砾石、卵石', K: '10~300', T: '100~5000', mu: '0.10~0.25', salinity: '<0.5~2', note: '山前平原主体含水层, 直接接受降水入渗补给' },
  { group: '第二含水层组', era: 'Q2', property: '承压水', depth: '60~180', lithology: '中细砂、粉砂', K: '1~50', T: '50~1000', mu: '0.02~0.10', salinity: '0.5~5', note: '主要开采层(历史)' },
  { group: '第三含水层组', era: 'Q1', property: '承压水', depth: '180~350', lithology: '细砂、粉砂', K: '0.5~10', T: '10~200', mu: '0.02~0.08', salinity: '1~3', note: '水循环周期约1万年' },
  { group: '第四含水层组', era: 'N2', property: '深层承压水', depth: '350~600', lithology: '粉砂、细砂', K: '0.1~5', T: '5~100', mu: '0.005~0.03', salinity: '2~10', note: '更新世-上新世, 循环极为缓慢' },
];

// 岩性与给水度对照表
export interface LithParam {
  category: string;
  lithology: string;
  mu: string; // 给水度
  K: string; // 渗透系数 m/d
  ne: string; // 有效孔隙度
  source: string;
}

export const lithologyMu: LithParam[] = [
  { category: '粘性土', lithology: '粘土', mu: '0.02~0.05', K: '0.001~0.05', ne: '0.02~0.05', source: '表6-21' },
  { category: '粘性土', lithology: '亚粘土(粉质粘土)', mu: '0.04~0.07', K: '0.01~0.5', ne: '0.03~0.08', source: '表6-21' },
  { category: '粘性土', lithology: '亚砂土(粉土)', mu: '0.06~0.10', K: '0.05~2.0', ne: '0.05~0.12', source: '表6-21' },
  { category: '砂性土', lithology: '粉砂', mu: '0.07~0.11', K: '0.5~5.0', ne: '0.06~0.15', source: '表6-21' },
  { category: '砂性土', lithology: '细砂', mu: '0.10~0.16', K: '2.0~15', ne: '0.10~0.20', source: '表6-21' },
  { category: '砂性土', lithology: '中砂', mu: '0.16~0.22', K: '10~50', ne: '0.15~0.28', source: '表6-21' },
  { category: '碎屑岩类', lithology: '砾石', mu: '0.20~0.30', K: '50~300', ne: '0.20~0.35', source: '表6-21' },
];

// 降水入渗系数
export interface InfiltrationParam {
  lithology: string;
  plain: string; // 平原区
  basin: string; // 山间盆地
  mountain: string; // 山区
  optDepth: string; // 最佳水位埋深
  note: string;
}

export const infiltrationCoeff: InfiltrationParam[] = [
  { lithology: '粘土', plain: '8~15%', basin: '8~12%', mountain: '3~8%', optDepth: '2~4', note: '水位埋深大时入渗系数降低' },
  { lithology: '亚粘土', plain: '12~25%', basin: '10~22%', mountain: '8~15%', optDepth: '2~4', note: '表6-3' },
  { lithology: '亚砂土', plain: '20~35%', basin: '15~30%', mountain: '10~20%', optDepth: '2~4', note: '表6-3' },
  { lithology: '粉砂', plain: '25~40%', basin: '20~35%', mountain: '15~25%', optDepth: '2~5', note: '表6-5' },
  { lithology: '砂砾石', plain: '35~50%', basin: '30~45%', mountain: '25~40%', optDepth: '3~8', note: '冲洪积扇轴部' },
];

// 渗透系数经验值
export interface PermeabilityParam {
  lithology: string;
  Kh: string; // 水平渗透系数 m/d
  Kv: string; // 垂直渗透系数 m/d
  ratio: string; // Kh/Kv
  source: string;
}

export const permeability: PermeabilityParam[] = [
  { lithology: '粘土', Kh: '0.001~0.05', Kv: '0.0001~0.01', ratio: '5~10', source: '表6-24' },
  { lithology: '亚粘土', Kh: '0.01~0.5', Kv: '0.001~0.1', ratio: '5~10', source: '表6-24' },
  { lithology: '亚砂土', Kh: '0.05~2.0', Kv: '0.01~0.5', ratio: '3~8', source: '表6-24' },
  { lithology: '粉砂', Kh: '0.5~5.0', Kv: '0.1~1.0', ratio: '3~5', source: '表6-16, 6-17' },
  { lithology: '细砂', Kh: '2.0~15', Kv: '0.5~5.0', ratio: '2~4', source: '表6-16, 6-17' },
  { lithology: '中砂', Kh: '10~50', Kv: '2~15', ratio: '2~3', source: '表6-16, 6-17' },
  { lithology: '粗砂', Kh: '20~100', Kv: '5~30', ratio: '2~3', source: '表6-16, 6-17' },
  { lithology: '卵石', Kh: '100~500', Kv: '20~200', ratio: '2~5', source: '冲洪积扇轴部' },
  { lithology: '砾砂', Kh: '50~200', Kv: '10~80', ratio: '2~4', source: '表6-16, 6-17' },
];

// 岩溶含水层
export const karstParams = [
  { type: '溶洞-管道', K: '100~1000+', T: '1000~50000+', mu: '0.05~0.20', area: '太行山/燕山强岩溶带', note: '大型水源地所在' },
  { type: '溶隙-溶孔', K: '10~100', T: '100~5000', mu: '0.01~0.05', area: '中等岩溶化区', note: '层状岩溶' },
  { type: '构造裂隙(灰岩)', K: '1~20', T: '10~500', mu: '0.005~0.03', area: '弱岩溶化区', note: '' },
  { type: '风化裂隙(灰岩)', K: '0.1~5', T: '1~50', mu: '0.005~0.02', area: '表层风化带', note: '' },
];

// 裂隙含水介质
export const fractureParams = [
  { type: '构造裂隙(片麻岩)', lithology: '太古界变质岩', K: '0.01~2', springFlow: '0.1~5', modulus: '1~5' },
  { type: '风化裂隙(花岗岩)', lithology: '燕山期岩浆岩', K: '0.01~1', springFlow: '0.01~1', modulus: '0.5~3' },
  { type: '构造裂隙(砂岩)', lithology: '元古界-古生界', K: '0.1~5', springFlow: '0.1~10', modulus: '2~8' },
  { type: '层间裂隙(页岩)', lithology: '石炭-二叠系', K: '0.001~0.1', springFlow: '<0.1', modulus: '<1' },
];

// 承压含水层释水系数
export const storageCoeff = [
  { era: 'Q3(第一含水层组)', lithology: '砂、砾石', mu_e: '0.05~0.15', note: '浅层, 表6-22' },
  { era: 'Q2(第二含水层组)', lithology: '中细砂', mu_e: '0.005~0.02', note: '表6-22' },
  { era: 'Q1(第三含水层组)', lithology: '细砂、粉砂', mu_e: '0.001~0.005', note: '表6-22' },
  { era: 'N2(第四含水层组)', lithology: '粉砂', mu_e: '0.0005~0.002', note: '表6-22' },
  { era: 'N1(明化镇组下段)', lithology: '粉砂', mu_e: '0.0005~0.001', note: '' },
];

// 弥散度经验值
export const dispersivity = [
  { medium: '粘土', aL: '0.5~5', aT: '0.05~0.5', note: '文献参考值' },
  { medium: '亚粘土', aL: '1~10', aT: '0.1~1', note: '文献参考值' },
  { medium: '砂性土', aL: '5~50', aT: '0.5~5', note: '文献参考值' },
  { medium: '裂隙岩(近场)', aL: '1~50', aT: '0.1~5', note: '文献参考值' },
  { medium: '岩溶管道', aL: '50~500', aT: '5~50', note: '文献参考值' },
];

// F表 - 山区典型水文站降水入渗系数实测值
export interface StationInfiltration {
  id: number;
  station: string;
  area: string;
  lithology: string;
  alpha: string;
}

export const stationInfiltration: StationInfiltration[] = [
  { id: 1, station: '子牙河平山县文都河站', area: '106.5', lithology: '太古界片麻岩', alpha: '17.67' },
  { id: 2, station: '子牙河平山县刘家坪站', area: '140', lithology: '太古界片麻岩', alpha: '16.34' },
  { id: 3, station: '大清河阜平县西王林口站', area: '208', lithology: '太古界片麻岩', alpha: '14.19' },
  { id: 4, station: '大清河阜平县新房站', area: '368', lithology: '太古界片麻岩', alpha: '17.38' },
  { id: 5, station: '冀东沿海抚宁县峪门口站', area: '157', lithology: '太古界片麻岩、花岗岩', alpha: '8.66' },
  { id: 6, station: '滦河平泉站', area: '372', lithology: '侏罗系碎屑岩与太古界片麻岩', alpha: '9.43' },
  { id: 7, station: '潮白河丰润县崖口站', area: '199', lithology: '蓟县系砂岩与白云岩', alpha: '11.90' },
  { id: 8, station: '潮白河怀柔县口头站', area: '170', lithology: '蓟县系与侏罗系灰岩和砂岩', alpha: '17.57' },
  { id: 9, station: '冀东沿海秦皇岛市小陈庄站', area: '157', lithology: '古生界灰岩、片麻岩及花岗岩', alpha: '8.02' },
  { id: 10, station: '子牙河平山县郗家庄站', area: '322', lithology: '古生界灰岩、蓟县系灰岩等', alpha: '14.94' },
  { id: 11, station: '承德市罗锅子沟小流域', area: '4.9', lithology: '斜长岩与苏长岩占68%', alpha: '19.00' },
  { id: 12, station: '承德市罗锅子沟小流域', area: '4.9', lithology: '斜长岩与苏长岩占68%', alpha: '17.3' },
  { id: 13, station: '黑龙洞泉岩溶水系统', area: '1142.5', lithology: '古生界灰岩', alpha: '41.0' },
  { id: 14, station: '邢台百泉岩溶水系统', area: '2525', lithology: '古生界灰岩', alpha: '33.0' },
  { id: 15, station: '涞源泉岩溶水系统', area: '813', lithology: '古生界灰岩', alpha: '20.0' },
];

// 山区不同岩性包气带入渗系数(按流域分区)
export interface LithInfiltration {
  lithology: string;
  basin: string;
  area: string;
  modulus: string;
  P: string;
  alpha: string;
}

export const lithInfiltration: LithInfiltration[] = [
  { lithology: '碳酸盐岩', basin: '滦河', area: '3514', modulus: '7.31', P: '576.63', alpha: '12.0' },
  { lithology: '碳酸盐岩', basin: '蓟运河', area: '916', modulus: '16.37', P: '779.35', alpha: '21.0' },
  { lithology: '碳酸盐岩', basin: '冀东沿海', area: '332', modulus: '11.14', P: '727.86', alpha: '15.0' },
  { lithology: '碳酸盐岩', basin: '潮白河', area: '705', modulus: '11.91', P: '486.9', alpha: '24.0' },
  { lithology: '碳酸盐岩', basin: '永定河', area: '3079', modulus: '9.29', P: '425.2', alpha: '21.0' },
  { lithology: '碳酸盐岩', basin: '大清河北支', area: '2177', modulus: '12.26', P: '603.43', alpha: '20.3' },
  { lithology: '碳酸盐岩', basin: '大清河南支', area: '2247', modulus: '14.95', P: '646.58', alpha: '23.0' },
  { lithology: '碳酸盐岩', basin: '滹沱河', area: '1020', modulus: '29.31', P: '620.97', alpha: '47.2' },
  { lithology: '碳酸盐岩', basin: '滏阳河', area: '1019', modulus: '29.64', P: '621.55', alpha: '47.6' },
  { lithology: '碳酸盐岩', basin: '漳河', area: '1229', modulus: '27.50', P: '601.21', alpha: '45.74' },
  { lithology: '岩浆岩和变质岩', basin: '滦河', area: '23176', modulus: '4.09', P: '567.63', alpha: '7.2' },
  { lithology: '岩浆岩和变质岩', basin: '大清河北支', area: '2776', modulus: '8.71', P: '603.0', alpha: '14.4' },
  { lithology: '岩浆岩和变质岩', basin: '大清河南支', area: '4577', modulus: '9.33', P: '646.0', alpha: '14.48' },
  { lithology: '岩浆岩和变质岩', basin: '滹沱河', area: '2644', modulus: '8.02', P: '620.97', alpha: '12.915' },
  { lithology: '岩浆岩和变质岩', basin: '滏阳河', area: '3941', modulus: '8.45', P: '621.55', alpha: '13.59' },
  { lithology: '碎屑岩', basin: '滦河', area: '4661', modulus: '1.95', P: '567.63', alpha: '3.4' },
  { lithology: '碎屑岩', basin: '潮白河', area: '1503', modulus: '2.40', P: '486.9', alpha: '4.9' },
  { lithology: '碎屑岩', basin: '永定河', area: '1540', modulus: '1.17', P: '425.0', alpha: '2.7' },
  { lithology: '碎屑岩', basin: '大清河北支', area: '85', modulus: '3.53', P: '603.0', alpha: '5.8' },
  { lithology: '碎屑岩', basin: '漳河', area: '148', modulus: '4.05', P: '601.21', alpha: '6.7' },
];
