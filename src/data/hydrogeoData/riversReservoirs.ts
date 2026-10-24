/**
 * 拆分自 resources-hydrogeo.ts
 */

// 河流渗漏数据（数据来源：《河北省水文地质工程地质》）
export const riverLeakageData = [
  { id: 1, river: '滏阳河', section: '韩村', avgLeakage: '0.36', note: '漏失段大部为碳酸盐岩分布' },
  { id: 2, river: '小马河', section: '交台村以下', avgLeakage: '', note: '上游常年有水' },
  { id: 3, river: '白马河', section: '南青山以下至潭村', avgLeakage: '0.98', note: '南青山测流量0.48m³/s' },
  { id: 4, river: '七里河', section: '黄店以下', avgLeakage: '', note: '漏失段仅汛期有水' },
  { id: 5, river: '沙河(朱庄川)', section: '朱庄以下至东坚固', avgLeakage: '2.64', note: '56-74年朱庄平均值' },
  { id: 6, river: '渡口川', section: '渡口以下至八里庙', avgLeakage: '0.61', note: '渡口以上常年有水' },
  { id: 7, river: '马会河', section: '柴关以下至西石门', avgLeakage: '0.22', note: '柴关以上常年有水' },
  { id: 8, river: '北洛河', section: '高村', avgLeakage: '0.86', note: '贺进一带断流' },
  { id: 9, river: '南洺河', section: '小店以下', avgLeakage: '0.1', note: '多年平均流量0.15~0.2m³/s' },
  { id: 10, river: '清漳河', section: '石门以下至涉县断层', avgLeakage: '0.59', note: '多年旱季一般断流' },
  { id: 11, river: '通天河(曲阳)', section: '南宋家庄至南家庄', avgLeakage: '0.5~1', note: '至渗失段全部潜入地下' },
  { id: 12, river: '干沟河(曲阳)', section: '葫芦汪至磨子山', avgLeakage: '0.3~0.5', note: '至渗失段全部潜入地下' },
];

// 地下径流模数（数据来源：《河北省水文地质工程地质》）
export const runoffModulus = [
  { rockType: '第四系松散岩石与部分沉积岩', range: '8.89', avg: 8.89 },
  { rockType: '沉积岩', range: '3.13~5.47', avg: 3.77 },
  { rockType: '沉积岩与岩浆岩', range: '2.41~4.39', avg: 3.26 },
  { rockType: '沉积岩与变质岩', range: '2.28~3.74', avg: 2.81 },
  { rockType: '变质岩', range: '1.63~2.99', avg: 2.40 },
];

// 河北省主要水库工程地质参数（数据来源：《河北省水文地质工程地质》+2024水资源公报）
export const reservoirEngineeringData = [
  { name: '岗南', location: '石家庄平山', river: '滹沱河', catchArea: 15900, capacity: 15.71, damType: '粘土斜墙坝', foundation: '片麻岩', geoIssue: '岩石风化破碎，节理裂隙发育，构成渗漏通道' },
  { name: '黄壁庄', location: '石家庄鹿泉', river: '滹沱河', catchArea: 23400, capacity: 12.1, damType: '均质土坝', foundation: '砂卵石层(覆盖层>60m)', geoIssue: '付坝河床覆盖层厚>60m' },
  { name: '岳城', location: '邯郸磁县', river: '漳河', catchArea: 18100, capacity: 10.9, damType: '均质土坝/斜墙坝', foundation: '砂卵石层', geoIssue: '覆盖层>25m' },
  { name: '王快', location: '保定曲阳', river: '沙河', catchArea: 3770, capacity: 13.89, damType: '斜墙土坝', foundation: '片麻岩/砂卵石', geoIssue: '覆盖层>25m' },
  { name: '西大洋', location: '保定唐县', river: '唐河', catchArea: 4420, capacity: 10.71, damType: '均质土坝', foundation: '片麻岩/砂卵石', geoIssue: '覆盖层>25m' },
  { name: '临城', location: '邢台临城', river: '泜河', catchArea: 384, capacity: 1.595, damType: '斜墙土坝', foundation: '花岗岩', geoIssue: '' },
  { name: '朱庄', location: '邢台沙河', river: '南澧河', catchArea: 1220, capacity: 4.16, damType: '浆砌石重力拱坝', foundation: '石英砂岩/石英岩', geoIssue: '石英岩节理裂隙发育，易破碎' },
  { name: '潘家口', location: '唐山迁西', river: '滦河', catchArea: 33700, capacity: 29.3, damType: '混凝土宽缝重力坝', foundation: '片麻岩', geoIssue: '' },
  { name: '大黑汀', location: '唐山迁西', river: '滦河', catchArea: 35100, capacity: 3.37, damType: '混凝土宽缝重力坝', foundation: '石英岩/石英砂岩', geoIssue: '' },
  { name: '洋河', location: '张家口怀来', river: '洋河', catchArea: 14140, capacity: 0.66, damType: '重力坝', foundation: '', geoIssue: '' },
  { name: '闪电河', location: '张家口沽源', river: '闪电河', catchArea: 890, capacity: 0.357, damType: '斜墙壤土坝', foundation: '砂砾石', geoIssue: '覆盖层40-50m' },
  { name: '安各庄', location: '保定易县', river: '中易水', catchArea: 476, capacity: 2.85, damType: '', foundation: '白云质灰岩', geoIssue: '白云质灰岩岩溶发育' },
  { name: '邱庄', location: '唐山丰润', river: '还乡河', catchArea: 525, capacity: 2.04, damType: '', foundation: '砂卵石层', geoIssue: '覆盖层>25m' },
  { name: '陡河', location: '唐山', river: '陡河', catchArea: 530, capacity: 5.15, damType: '', foundation: '砂卵石层', geoIssue: '' },
  { name: '口头', location: '石家庄行唐', river: '郜河', catchArea: 142, capacity: 1.056, damType: '', foundation: '片麻岩', geoIssue: '岩石风化破碎，节理裂隙发育' },
  { name: '钓鱼台', location: '承德国场', river: '', catchArea: 160, capacity: 0.135, damType: '均质土坝', foundation: '花岗岩', geoIssue: '1969~1972' },
  { name: '大青沟', location: '张家口尚义', river: '大青沟', catchArea: 248, capacity: 0.17, damType: '心墙土坝', foundation: '粘土', geoIssue: '1958~1960' },
];

// 城市供水水文地质概况（数据来源：《河北省水文地质工程地质》1970s）
export const citySupplyHydrogeology = [
  { city: '石家庄', extraction: 26, area: '', unitYield: '', wellDepth: '', aquifer: '第二含水组为主要开采层，底界30-60m，含水层厚20-40m，岩性以砾石、粗砂为主，单井单位涌水量40-80 m³/h·m' },
  { city: '沧州', extraction: 3.6, area: 404, unitYield: '', wellDepth: '', aquifer: '第一含水组底界30m，第二含水组顶界30-52m、底界160-180m，岩性以粉砂及粉细砂为主' },
  { city: '张家口', extraction: 4, area: 706, unitYield: '', wellDepth: '', aquifer: '枯水季节供水能力2.6万m³/d' },
  { city: '秦皇岛', extraction: 2.4, area: '', unitYield: '', wellDepth: '', aquifer: '人口30余万' },
  { city: '保定', extraction: 15.5, area: '', unitYield: '15-30', wellDepth: '', aquifer: '山前冲积扇前缘地带' },
  { city: '唐山市东矿区', extraction: 10.6, area: '', unitYield: '1-2', wellDepth: '', aquifer: '第二含水组顶界21-32m，含水层厚20-42m，岩性为砾石及细砂' },
  { city: '邢台', extraction: '', area: 6, unitYield: '', wellDepth: '100-200', aquifer: '' },
];
