// B表 - 地下水系统分区参数 (10个系统区 + 子区)
// 数据来源: 1999年《河北省地下水》第五章 地下水系统区划及分区特征
// 整理日期: 2026-05-21
// 说明: 降水入渗系数α、导水系数T等按系统区/子区/小区三级统计


export interface ZoneParam {
  code: string;
  name: string;
  level: string; // 系统区/子区/小区
  parent: string;
  area: number | null;
  areaPercent: number | null;
  alpha: string | null; // 降水入渗系数
  T: string | null; // 导水系数 m2/d
  q: string | null; // 单井涌水量
  aquiferThickness: string | null;
  waterLevel: string | null;
  runoffModulus: string | null;
}

// 10个一级系统区
export const systemZones: ZoneParam[] = [
  { code: 'I', name: '内陆河地下水系统区', level: '系统区', parent: '-', area: 10922, areaPercent: 5.8, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'II', name: '辽河-大凌河地下水系统区', level: '系统区', parent: '-', area: 4145, areaPercent: 2.2, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: '<5' },
  { code: 'III', name: '潮白河-蓟运河地下水系统区', level: '系统区', parent: '-', area: 19419, areaPercent: 10.3, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'IV', name: '滦河地下水系统区', level: '系统区', parent: '-', area: 41949, areaPercent: 22.3, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'V', name: '冀东沿海诸河地下水系统区', level: '系统区', parent: '-', area: 3348, areaPercent: 1.8, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'VI', name: '永定河地下水系统区', level: '系统区', parent: '-', area: 21258, areaPercent: 11.3, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'VII', name: '大清河地下水系统区', level: '系统区', parent: '-', area: 27937, areaPercent: 14.9, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'VIII', name: '子牙河地下水系统区', level: '系统区', parent: '-', area: 32326, areaPercent: 17.2, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'IX', name: '漳卫河地下水系统区', level: '系统区', parent: '-', area: 15316, areaPercent: 8.2, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'X', name: '古黄河地下水系统区', level: '系统区', parent: '-', area: 11067, areaPercent: 5.9, alpha: null, T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
];

// 子区/小区参数(有完整参数的)
export const subZones: ZoneParam[] = [
  { code: 'I1', name: '照阳河裂隙地下水系统子区', level: '子区', parent: 'I', area: null, areaPercent: null, alpha: '0.098', T: null, q: null, aquiferThickness: '<3', waterLevel: '2', runoffModulus: '<5' },
  { code: 'I2', name: '察汗淖孔隙裂隙地下水系统子区', level: '子区', parent: 'I', area: null, areaPercent: null, alpha: '0.148', T: null, q: null, aquiferThickness: '5~10', waterLevel: '3~5', runoffModulus: '<5' },
  { code: 'I3', name: '小盐淖孔隙裂隙地下水系统子区', level: '子区', parent: 'I', area: null, areaPercent: null, alpha: '0.12', T: null, q: null, aquiferThickness: '<10', waterLevel: '3~5', runoffModulus: '<5' },
  { code: 'I4', name: '安固里淖孔隙孔洞裂隙地下水系统子区', level: '子区', parent: 'I', area: null, areaPercent: null, alpha: '0.17~0.25', T: '100~500', q: null, aquiferThickness: '5~10', waterLevel: '3~5', runoffModulus: '<5' },
  { code: 'I5', name: '九连城淖孔隙裂隙地下水系统子区', level: '子区', parent: 'I', area: null, areaPercent: null, alpha: '0.18', T: '<100', q: null, aquiferThickness: '5~10', waterLevel: '1~3', runoffModulus: '<5' },
  { code: 'I6', name: '囫囵淖孔隙裂隙地下水系统子区', level: '子区', parent: 'I', area: null, areaPercent: null, alpha: '0.159', T: '<100', q: null, aquiferThickness: '10~15', waterLevel: '3', runoffModulus: '<5' },
  { code: 'III22', name: '遵化盆地孔隙岩溶地下水系统小区', level: '小区', parent: 'III', area: null, areaPercent: null, alpha: '0.09~0.23/0.15~0.35', T: '100~1000', q: '30~100(扇轴部)', aquiferThickness: '10~20', waterLevel: '2~7', runoffModulus: '5~10' },
  { code: 'III23', name: '还乡河岩溶地下水系统小区', level: '小区', parent: 'III', area: null, areaPercent: null, alpha: '0.23', T: null, q: null, aquiferThickness: null, waterLevel: null, runoffModulus: '10~20' },
  { code: 'III31', name: '潮白河冲洪积扇孔隙地下水系统小区', level: '小区', parent: 'III', area: null, areaPercent: null, alpha: null, T: '300~1000', q: '10~20', aquiferThickness: '40~60', waterLevel: null, runoffModulus: null },
  { code: 'III32', name: '蓟运河冲洪积扇孔隙地下水系统小区', level: '小区', parent: 'III', area: null, areaPercent: null, alpha: '0.15/0.35', T: '1000~5000', q: '10~30', aquiferThickness: '10~20', waterLevel: null, runoffModulus: null },
  { code: 'III4', name: '潮白河-蓟运河冲积海积孔隙地下水系统子区', level: '子区', parent: 'III', area: null, areaPercent: null, alpha: '0.15~0.20', T: '300~500', q: null, aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'IV11', name: '闪电河孔隙裂隙地下水系统小区', level: '小区', parent: 'IV', area: null, areaPercent: null, alpha: null, T: '100~1000', q: '5~10', aquiferThickness: '10~20', waterLevel: '1~5', runoffModulus: '<5' },
  { code: 'IV42', name: '沙河孔隙地下水系统小区', level: '小区', parent: 'IV', area: null, areaPercent: null, alpha: '0.30', T: null, q: '5~15', aquiferThickness: '15~30', waterLevel: '10~20', runoffModulus: null },
  { code: 'IV5', name: '滦河冲洪积扇孔隙地下水系统子区', level: '子区', parent: 'IV', area: null, areaPercent: null, alpha: '0.30', T: '300~5000', q: '20~30', aquiferThickness: '15~30', waterLevel: '5~15', runoffModulus: '10~15' },
  { code: 'IV6', name: '滦河冲积海积孔隙地下水系统子区', level: '子区', parent: 'IV', area: null, areaPercent: null, alpha: '0.25~0.30', T: '100~300', q: '2.5~5.0', aquiferThickness: '浅层淡水10~60', waterLevel: '2~4', runoffModulus: null },
  { code: 'V2', name: '冀东沿海诸河冲洪积扇孔隙地下水系统子区', level: '子区', parent: 'V', area: null, areaPercent: null, alpha: null, T: '1000~5000', q: '5~15', aquiferThickness: '3~8', waterLevel: '2~5', runoffModulus: null },
  { code: 'VI11', name: '张家口盆地孔隙裂隙地下水系统小区', level: '小区', parent: 'VI', area: null, areaPercent: null, alpha: '0.10~0.13', T: '100~12000', q: '<5~50', aquiferThickness: '50~80', waterLevel: '<3~>40', runoffModulus: '<5' },
  { code: 'VI12', name: '蔚县-阳原盆地孔隙岩溶地下水系统小区', level: '小区', parent: 'VI', area: null, areaPercent: null, alpha: '0.13~0.30', T: '100~1000', q: '<1~30', aquiferThickness: '20~35', waterLevel: null, runoffModulus: '<5~15' },
  { code: 'VI13', name: '怀来-涿鹿盆地岩溶孔隙地下水系统小区', level: '小区', parent: 'VI', area: null, areaPercent: null, alpha: '0.145', T: '100~1000/>5000', q: '1~30', aquiferThickness: '10~>50', waterLevel: null, runoffModulus: '10~15' },
  { code: 'VI2', name: '永定河冲洪积扇孔隙地下水系统子区', level: '子区', parent: 'VI', area: null, areaPercent: null, alpha: '0.25~0.30', T: null, q: '10~20', aquiferThickness: '20~40', waterLevel: null, runoffModulus: null },
  { code: 'VII553', name: '唐河-界河冲洪积扇孔隙地下水系统小区', level: '小区', parent: 'VII', area: null, areaPercent: null, alpha: '0.30', T: '500~5000', q: '10~50', aquiferThickness: null, waterLevel: null, runoffModulus: null },
  { code: 'VII554', name: '大沙河-磁河冲洪积扇孔隙地下水系统小区', level: '小区', parent: 'VII', area: null, areaPercent: null, alpha: '0.30', T: '500~5000', q: '10~50', aquiferThickness: '20~50', waterLevel: '>7', runoffModulus: null },
  { code: 'VIII12', name: '威州泉泉域岩溶地下水系统小区', level: '小区', parent: 'VIII', area: null, areaPercent: null, alpha: '0.33', T: '100~3000', q: null, aquiferThickness: '25~160', waterLevel: '6~76', runoffModulus: '25~30' },
  { code: 'VIII23', name: '百泉泉域岩溶地下水系统小区', level: '小区', parent: 'VIII', area: null, areaPercent: null, alpha: '0.35', T: '1800', q: '3.6~3600', aquiferThickness: null, waterLevel: null, runoffModulus: '20~30' },
  { code: 'VIII24', name: '黑龙洞泉泉域岩溶地下水系统小区', level: '小区', parent: 'VIII', area: null, areaPercent: null, alpha: null, T: '19440~83600', q: '1.08~26.64', aquiferThickness: null, waterLevel: null, runoffModulus: '20~30' },
  { code: 'VIII31', name: '滹沱河冲洪积扇孔隙地下水系统小区', level: '小区', parent: 'VIII', area: null, areaPercent: null, alpha: '0.20~0.35', T: '100~5000', q: '10~50', aquiferThickness: '10~40', waterLevel: '10~20/20~35', runoffModulus: null },
  { code: 'VIII32', name: '滏阳河支流冲洪积扇孔隙地下水系统小区', level: '小区', parent: 'VIII', area: null, areaPercent: null, alpha: '0.20~0.30', T: '100~5000', q: '2.5~50', aquiferThickness: '5~50/5~15', waterLevel: '20~30', runoffModulus: null },
  { code: 'IX2', name: '漳河冲洪积扇孔隙地下水系统子区', level: '子区', parent: 'IX', area: null, areaPercent: null, alpha: '0.30', T: '300~5000', q: '2.5~20', aquiferThickness: '10~20/>30', waterLevel: '10~20', runoffModulus: null },
  { code: 'IX3', name: '漳卫河古河道带孔隙地下水系统子区', level: '子区', parent: 'IX', area: null, areaPercent: null, alpha: '0.20~0.35', T: '50~100', q: '<2.5~5', aquiferThickness: '5~10', waterLevel: null, runoffModulus: null },
];

// 河北平原四分区参数概览
export const plainZones = [
  { name: '山前冲洪积扇', location: '太行山/燕山山前', aquifer: '第一含水组为主', T: '1000~5000', q: '20~50+', mu: '0.10~0.25', alpha: '0.20~0.35', salinity: '<0.5', depth: '5~20(超采>30)', feature: '轴部砾卵石,含水层厚30~60m' },
  { name: '冲洪积扇前缘', location: '扇体→平原过渡带', aquifer: '第一+第二含水组', T: '300~1000', q: '10~20', mu: '0.08~0.15', alpha: '0.15~0.25', salinity: '0.5~2', depth: '3~10', feature: '含水层变薄变细' },
  { name: '中部平原', location: '冲积/湖积平原', aquifer: '第一~第三含水组', T: '100~500', q: '5~10', mu: '0.04~0.10', alpha: '0.12~0.20', salinity: '1~3(咸水>3)', depth: '2~8', feature: '多层结构,咸淡水交织' },
  { name: '滨海平原', location: '渤海湾沿岸', aquifer: '第二~第四含水组', T: '<100', q: '2~5', mu: '0.02~0.06', alpha: '0.10~0.15', salinity: '3~90+', depth: '<2(或承压)', feature: '全咸水区,高矿化' },
];

// 分区颜色映射(地图可视化用)
export const zoneColors: Record<string, string> = {
  'I': '#6366f1', 'II': '#8b5cf6', 'III': '#a78bfa', 'IV': '#22d3ee', 'V': '#06b6d4',
  'VI': '#f59e0b', 'VII': '#10b981', 'VIII': '#3b82f6', 'IX': '#ef4444', 'X': '#f97316',
};
