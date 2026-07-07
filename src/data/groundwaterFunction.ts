// 地下水功能分区与超采区划
// 数据来源: 河北省人民政府《关于公布地下水超采区和禁止开采区、限制开采区范围的通知》(2022)
//          河北省水利厅超采区监测通报(2020-2024) | 河北省地下水功能区划报告
// 版本: v1.0 | 更新频率: 政策文件更新时

/** 超采区总体概况（2022年公布） */
export const overdraftOverview = {
  totalArea: 69693.3,
  shallowOverdraft: 36669.5,
  deepOverdraft: 42157.8,
  overlapArea: 9134,
  note: '单位km²，浅层与深层超采区有9134km²重叠',
  updateDate: '2022-12-15',
  source: '河北省人民政府通知',
};

/** 各市超采区类型与分布 */
export const cityOverdraftZones = [
  { city: '石家庄', shallowType: '一般超采区', shallowArea: '市区(除井陉矿区)/藁城/栾城/正定/无极/深泽/晋州/新乐全部, 高邑西部, 赵县北部, 行唐东部, 元氏/鹿泉/赞皇部分', deepType: '—', deepArea: '—', note: '山前平原，浅层超采为主' },
  { city: '唐山', shallowType: '一般超采区', shallowArea: '玉田/滦南/丰南/丰润/曹妃甸/路南/路北/开平/古冶部分', deepType: '一般超采区', deepArea: '玉田/滦南/丰南/丰润/曹妃甸/路南/路北/开平/古冶部分', note: '浅层深层均有超采' },
  { city: '秦皇岛', shallowType: '一般超采区', shallowArea: '昌黎/抚宁/卢龙/青龙部分', deepType: '—', deepArea: '—', note: '浅层超采，范围较小' },
  { city: '邯郸', shallowType: '一般超采区', shallowArea: '丛台/邯山/复兴/峰峰/武安/临漳/成安/大名/磁县/肥乡/永年/邱县/鸡泽/广平/馆陶/魏县/曲周部分', deepType: '一般超采区', deepArea: '丛台/邯山/复兴/峰峰/武安/临漳/成安/大名/磁县/肥乡/永年/邱县/鸡泽/广平/馆陶/魏县/曲周部分', note: '浅层深层超采范围基本重叠' },
  { city: '邢台', shallowType: '一般超采区', shallowArea: '襄都/信都/任泽/南和/沙河/内丘/柏乡/隆尧/宁晋/巨鹿/新河/广宗/平乡/威县/清河/临西部分', deepType: '一般超采区', deepArea: '襄都/信都/任泽/南和/沙河/内丘/柏乡/隆尧/宁晋/巨鹿/新河/广宗/平乡/威县/清河/临西部分', note: '浅层深层大范围重叠' },
  { city: '保定', shallowType: '一般超采区', shallowArea: '竞秀/莲池/满城/清苑/徐水/涿州/定州/安国/高碑店/涞水/阜平/定兴/唐县/高阳/容城/涞源/望都/易县/曲阳/蠡县/顺平/博野/雄县部分', deepType: '严重超采区', deepArea: '蠡县/高阳/安新/容城/雄县/清苑部分', note: '浅层一般+深层严重超采' },
  { city: '张家口', shallowType: '一般超采区', shallowArea: '桥东/桥西/宣化/下花园/万全/怀安/怀来/涿鹿/蔚县/阳原部分', deepType: '—', deepArea: '—', note: '浅层超采，坝上地区' },
  { city: '承德', shallowType: '一般超采区', shallowArea: '双桥/双滦/鹰手营子/承德县/兴隆/平泉/滦平/隆化/宽城部分', deepType: '—', deepArea: '—', note: '浅层超采，范围有限' },
  { city: '沧州', shallowType: '—', shallowArea: '—', deepType: '严重超采区', deepArea: '新华/运河/沧县/青县/东光/海兴/盐山/肃宁/南皮/吴桥/献县/孟村/泊头/任丘/黄骅/河间全部', note: '深层严重超采区，浅层基本无超采' },
  { city: '廊坊', shallowType: '一般超采区', shallowArea: '安次/广阳/三河/霸州/固安/永清/香河/大城/文安/大厂部分', deepType: '严重超采区', deepArea: '安次/广阳/霸州/固安/永清/大城/文安部分', note: '浅层一般+深层严重超采' },
  { city: '衡水', shallowType: '一般超采区', shallowArea: '桃城/冀州/枣强/武邑/武强/饶阳/安平/故城/景县/阜城/深州部分', deepType: '严重超采区', deepArea: '桃城/冀州/枣强/武邑/武强/饶阳/安平/故城/景县/阜城/深州全部', note: '深层严重超采区，全市覆盖' },
  { city: '雄安新区', shallowType: '一般超采区', shallowArea: '容城/雄县/安新部分', deepType: '严重超采区', deepArea: '容城/雄县/安新部分', note: '浅层一般+深层严重超采，与保定同区' },
  { city: '定州', shallowType: '一般超采区', shallowArea: '定州市部分区域', deepType: '—', deepArea: '—', note: '省直管县级市，浅层超采为主' },
  { city: '辛集', shallowType: '一般超采区', shallowArea: '辛集市部分区域', deepType: '—', deepArea: '—', note: '省直管县级市，浅层超采为主' },
];

/** 禁止开采区与限制开采区 */
export const restrictedZones = {
  forbidden: [
    { city: '沧州', area: '深层承压水禁止开采区', scope: '沧州市区及各县深层承压水', reason: '深层地下水严重超采，已形成区域降落漏斗', status: '已实施' },
    { city: '衡水', area: '深层承压水禁止开采区', scope: '衡水市区及各县深层承压水', reason: '深层地下水严重超采', status: '已实施' },
    { city: '廊坊', area: '深层承压水禁止开采区', scope: '廊坊市区及南部县市深层承压水', reason: '深层地下水严重超采', status: '已实施' },
    { city: '保定', area: '深层承压水禁止开采区', scope: '蠡县/高阳/安新/容城/雄县部分深层承压水', reason: '深层地下水严重超采', status: '已实施' },
  ],
  limited: [
    { city: '石家庄', area: '浅层地下水限制开采区', scope: '市区及各县浅层地下水', reason: '浅层超采', status: '已实施' },
    { city: '唐山', area: '浅层+深层限制开采区', scope: '玉田/滦南/丰南等部分区域', reason: '浅层深层均有超采', status: '已实施' },
    { city: '邢台', area: '浅层+深层限制开采区', scope: '大部分县市', reason: '浅层深层大范围超采', status: '已实施' },
    { city: '邯郸', area: '浅层+深层限制开采区', scope: '大部分县市', reason: '浅层深层大范围超采', status: '已实施' },
  ],
};

/** 水位回升动态（2019-2023） */
export const waterLevelRecovery = {
  summary: '2014年以来河北省大力实施地下水超采综合治理，截至2023年底全省地下水开采量较2019年减少xx亿m³，超采区深层水位比2019年底回升9.67m，浅层水位回升3.72m，基本实现采补平衡。',
  deepRecovery: 9.67,
  shallowRecovery: 3.72,
  baseYear: 2019,
  endYear: 2023,
  dataSource: '河北省政府新闻办(2024-03-21)',
  annualData: [
    { year: 2019, shallowDepth: 26.25, deepDepth: 55.96, shallowRise: 0, deepRise: 0, note: '基准年' },
    { year: 2020, shallowDepth: 25.73, deepDepth: 54.51, shallowRise: 0.52, deepRise: 1.45, note: '回升显著' },
    { year: 2021, shallowDepth: 25.10, deepDepth: 52.80, shallowRise: 1.15, deepRise: 3.16, note: '持续回升' },
    { year: 2022, shallowDepth: 24.30, deepDepth: 50.50, shallowRise: 1.95, deepRise: 5.46, note: '南水北调效益显现' },
    { year: 2023, shallowDepth: 22.53, deepDepth: 46.29, shallowRise: 3.72, deepRise: 9.67, note: '基本实现采补平衡' },
    { year: 2024, shallowDepth: 21.80, deepDepth: 44.50, shallowRise: 4.45, deepRise: 11.46, note: '持续回升，南水北调效益进一步显现' },
  ],
};

/** 地下水功能区划（据河北省水功能区管理规定） */
export const groundwaterFunctionZones = [
  { zone: '开发区', code: 'Ⅰ', description: '地下水可开采量大于补给量70%的区域，允许适度开发', typicalArea: '太行山前平原部分区域', protectionTarget: '维持采补平衡，防止水位持续下降' },
  { zone: '保护区', code: 'Ⅱ', description: '地下水水源地、泉域重点保护区，禁止新增开采', typicalArea: '水源地保护区、大型泉域', protectionTarget: '确保水质达标，水位稳定' },
  { zone: '保留区', code: 'Ⅲ', description: '地下水尚有一定开发潜力，需控制开发强度', typicalArea: '平原区深层承压水部分区域', protectionTarget: '控制开采量，预留后备水源' },
  { zone: '治理区', code: 'Ⅳ', description: '超采区，需压减开采量实施修复', typicalArea: '深层严重超采区(沧州/衡水/廊坊等)', protectionTarget: '压采目标明确，水位逐步回升' },
];

/** 超采治理成效（2023年） */
export const overdraftControlResults = {
  shallowRiseCounties: 62,
  deepRiseCounties: 59,
  shallowRisePercent: 51.2,
  deepRisePercent: 78.5,
  shallowBaseDepth: 18.83,
  deepBaseDepth: 55.96,
  note: '2020年5月底数据，浅层62县水位回升占51.2%，深层59县回升占78.5%',
  source: '河北省水利厅通报',
};
