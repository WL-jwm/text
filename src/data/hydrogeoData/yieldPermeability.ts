/**
 * 拆分自 resources-hydrogeo.ts
 */

// 渗透系数K值统计（表112，单位m/d，数据来源：《河北省水文地质工程地质》）
export const permeabilityKValues = {
  aquiferI: { // 第I含水组
    label: '第I含水组',
    data: [
      { lithology: '粉砂', front: '5~8', middle: '4~6', east: '8~5(推断)' },
      { lithology: '细砂', front: '8~12', middle: '6~10', east: '5~8' },
      { lithology: '中砂', front: '15~25', middle: '12~18', east: '10~15' },
      { lithology: '粗砂', front: '20~50', middle: '18~25(推断)', east: '15~20' },
      { lithology: '砾石', front: '50~70或>70', middle: '/', east: '/' },
      { lithology: '卵石', front: '>100(推断)', middle: '/', east: '/' },
    ],
  },
  aquiferII: { // 第II含水组
    label: '第II含水组',
    data: [
      { lithology: '粉砂', front: '<3.5', middle: '<2.5', east: '<1' },
      { lithology: '细砂', front: '3.8~8', middle: '4.5~10', east: '1~8' },
      { lithology: '中砂', front: '4.5~12', middle: '5~15', east: '8~10' },
      { lithology: '粗砂', front: '5.5~13', middle: '8~20', east: '6~12' },
      { lithology: '砾石', front: '20~50(推断)', middle: '/', east: '/' },
      { lithology: '卵石', front: '>50', middle: '/', east: '/' },
    ],
  },
  aquiferIII: { // 第III含水组
    label: '第III含水组',
    data: [
      { lithology: '粉砂', front: '<1.5', middle: '<1.5', east: '<1.5' },
      { lithology: '细砂', front: '1.5~5', middle: '1.5~8', east: '1.5~6' },
      { lithology: '中砂', front: '', middle: '8~8', east: '5~9' },
      { lithology: '粗砂', front: '6~10', middle: '7~11', east: '/' },
      { lithology: '砾石', front: '/', middle: '/', east: '/' },
      { lithology: '卵石', front: '/', middle: '/', east: '/' },
    ],
  },
};

// 含水层出水率（表100，单位m³/h·m，数据来源：《河北省水文地质工程地质》）
export const aquiferYieldRates = {
  aquiferI: {
    label: '第I含水组',
    freshFull: [ // 山前全淡水区(邯/邢/石/保)
      { lithology: '粉砂', min: 0.30, max: 0.50 },
      { lithology: '细砂', min: 0.40, max: 0.70 },
      { lithology: '中砂', min: 0.60, max: 0.80 },
      { lithology: '粗砂', min: 0.80, max: 1.20 },
      { lithology: '砾石', min: 2.20, max: 2.80 },
      { lithology: '卵石', min: 3.00, max: 5.00 },
    ],
    langfangFresh: [ // 廊坊全淡水
      { lithology: '粉砂', min: 0.30, max: 0.50 },
      { lithology: '细砂', min: 0.60, max: 0.65 },
      { lithology: '中砂', min: 0.80, max: 1.00 },
      { lithology: '粗砂', min: 1.12, max: 1.50 },
      { lithology: '砾石', min: 1.50, max: 2.00 },
      { lithology: '卵石', min: 2.00, max: 3.00 },
    ],
    salineHNW: [ // 邯邢咸水区
      { lithology: '粉砂', min: 0.12, max: 0.12 },
      { lithology: '细砂', min: 0.15, max: 0.17 },
      { lithology: '中砂', min: 0.30, max: 0.36 },
      { lithology: '粗砂', min: 0.43, max: 0.56 },
    ],
    salineHengshuiNW: [ // 衡水西北部咸水区
      { lithology: '粉砂', min: 0.26, max: 0.34 },
      { lithology: '细砂', min: 0.38, max: 0.45 },
      { lithology: '中砂', min: 0.53, max: 0.61 },
      { lithology: '粗砂', min: 0.60, max: 0.81 },
    ],
  },
  aquiferII: {
    label: '第II含水组',
    freshFull: [
      { lithology: '粉砂', min: 0.25, max: 0.30 },
      { lithology: '细砂', min: 0.35, max: 0.45 },
      { lithology: '中砂', min: 0.45, max: 0.60 },
      { lithology: '粗砂', min: 0.60, max: 0.80 },
      { lithology: '砾石', min: 1.50, max: 2.00 },
      { lithology: '卵石', min: 2.00, max: 3.00 },
    ],
    langfangFresh: [
      { lithology: '粉砂', min: 0.16, max: 0.24 },
      { lithology: '细砂', min: 0.25, max: 0.37 },
      { lithology: '中砂', min: 0.38, max: 0.48 },
      { lithology: '粗砂', min: 0.49, max: 0.50 },
      { lithology: '砾石', min: 0.90, max: 1.10 },
      { lithology: '卵石', min: 1.30, max: 1.70 },
    ],
    salineHNW: [
      { lithology: '粉砂', min: 0.12, max: 0.14 },
      { lithology: '细砂', min: 0.19, max: 0.25 },
      { lithology: '中砂', min: 0.34, max: 0.36 },
      { lithology: '粗砂', min: 0.48, max: 0.50 },
    ],
    salineHengshuiNW: [
      { lithology: '粉砂', min: 0.14, max: 0.17 },
      { lithology: '细砂', min: 0.19, max: 0.25 },
      { lithology: '中砂', min: 0.30, max: 0.36 },
      { lithology: '粗砂', min: 0.40, max: 0.50 },
    ],
  },
  aquiferIII: {
    label: '第III含水组',
    salineHNW: [
      { lithology: '粉砂', min: 0.09, max: 0.09 },
      { lithology: '细砂', min: 0.20, max: 0.25 },
      { lithology: '中砂', min: 0.33, max: 0.40 },
      { lithology: '粗砂', min: 0.50, max: 0.70 },
      { lithology: '砾石', min: 0.70, max: 0.90 },
      { lithology: '卵石', min: 1.00, max: 1.30 },
    ],
    salineHengshuiNW: [
      { lithology: '粉砂', min: 0.09, max: 0.10 },
      { lithology: '细砂', min: 0.17, max: 0.23 },
      { lithology: '中砂', min: 0.30, max: 0.35 },
      { lithology: '粗砂', min: 0.41, max: 0.43 },
    ],
  },
};

// 给水度与降雨入渗系数经验值（数据来源：《河北省水文地质工程地质》）
export const specificYieldInfiltration = {
  thicknessYield: [ // 出水率与含水层厚度关系（表101）
    { lithology: '粉砂', t1: '0.18~0.23', t2: '0.23~0.28', t3: '0.28~0.34' },
    { lithology: '细砂', t1: '0.35~0.40', t2: '0.40~0.45', t3: '0.45~0.52' },
    { lithology: '中砂', t1: '0.50~0.60', t2: '0.60~0.80', t3: '0.80~1.00' },
    { lithology: '粗砂', t1: '1.00~1.50', t2: '1.50~2.00', t3: '2.00~3.00' },
  ],
  depthYield: [ // 出水率与深度关系（表102）
    { lithology: '粉砂', d1: '0.08~0.10', d2: '0.10~0.12', d3: '0.12~0.15' },
    { lithology: '细砂', d1: '0.07~0.10', d2: '0.10~0.12', d3: '0.12~0.15' },
  ],
  regionalParams: [ // 南皮县分区参数（表113）
    { zone: 'I(东片)', sy: 0.07, alpha: 0.30 },
    { zone: 'II(中片)', sy: 0.04, alpha: 0.20 },
    { zone: 'III(西片)', sy: 0.05, alpha: 0.24 },
  ],
};
